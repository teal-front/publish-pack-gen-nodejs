var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var log4js = require('log4js');
var timeout = require('connect-timeout');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var pub = require('./lib/public');
var config = require('./config');
var middleware = require('./lib/middleware');

//全站路由
var routes = {
  index: require('./routes/index'),
  users: require('./routes/users'),
  products: require('./routes/products'),
  insuranceSlips: require('./routes/insurance-slips'),
  shoppingCart: require('./routes/shopping-cart'),
  tools: require('./routes/tools'),
  search: require('./routes/search'),
  orders: require('./routes/orders')
};


var app = express();

// view engine setup
app.use(partials());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', {
  'layout': true
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// app.use(logger('dev'));
if (config.env == 'development') {
  var logger = require('morgan');
  app.use(logger('dev'));
} else {
  app.use(log4js.connectLogger(log4js.getLogger("[http]"), {
    level: 'info'
  }));
}
app.use(timeout('300s'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  store: new RedisStore(config.expressSession.redis),
  key: config.expressSession.key,
  secret: config.expressSession.secret,
  resave: config.expressSession.resave,
  saveUninitialized: config.expressSession.saveUninitialized,
  cookie: config.expressSession.cookie
}));

app.use(haltOnTimedout);

function haltOnTimedout(req, res, next) {
  if (!req.timedout) {
    next();
  } else {
    var err = new Error('请求超时，请稍后再试！');
    err.status = 408;
    next(err);
  }
}

//路由
app.use('*', middleware.combineShoppingCart); //合并购物车
app.use('/', routes.index);
app.use('/users', routes.users);
app.use('/product', routes.products);
app.use('/products', routes.products);
app.use('/insurance-slips', routes.insuranceSlips);
app.use('/shopping-cart', routes.shoppingCart);
app.use('/tools', routes.tools);
app.use('/search', routes.search);
app.use('/orders', routes.orders);
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('很抱歉，您要访问的页面不存在');
  err.status = 404;
  res.status(err.status || 500);

  res.render('error', pub.renderData({
    layout: 'layout/page/layout',
    env: app.get('env'),
    message: err.message,
    error: err
  }));
  //next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', pub.renderData({
      message: err.message,
      error: err
    }));
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', pub.renderData({
    message: err.message,
    error: err
  }));
});


module.exports = app;
