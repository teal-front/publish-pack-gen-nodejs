var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var timeout = require('connect-timeout');
// var session = require('express-session');
var logger = require('morgan');
var tracerLogger = require('./lib/log').logger;
// var cors = require('cors');
// var RedisStore = require('connect-redis')(session);
var pub = require('./lib/public');
var config = require('./config');
var middleware = require('./lib/middleware');

// 页面路由
var pageRoutes = {
  index: require('./routes/pages/index'),
  orders: require('./routes/pages/orders'),
  products: require('./routes/pages/products'),
  shoppingCart: require('./routes/pages/shopping-cart'),
  brand: require('./routes/pages/brand'),
  productRanking: require('./routes/pages/product-ranking'),
  specialSubject: require('./routes/pages/special-subject'),
  programs: require('./routes/pages/programs'),
  reserve: require('./routes/pages/reserve'),
  search: require('./routes/pages/search'),
  carInsure: require('./routes/pages/car-insure'),
  carHome: require('./routes/pages/car')
};

// 接口路由
var apiRoutes = {
  users: require('./routes/api/users'),
  products: require('./routes/api/products'),
  insuranceSlips: require('./routes/api/insurance-slips'),
  shoppingCart: require('./routes/api/shopping-cart'),
  tools: require('./routes/api/tools'),
  orders: require('./routes/api/orders'),
  upload: require('./routes/api/upload'),
  programs: require('./routes/api/programs'),
  base: require('./routes/api/base'),
  counselors: require('./routes/api/counselors')
};

var app = express();
app.disable('trust proxy');
// view engine setup
app.use(partials());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', {
  'layout': true
});

// app.use(cors({
//   origin: 'http://huize.com'
// }));
app.use(logger(':method :url :status :req[content-type] :req[body] :response-time ms - :res[content-length]'));
app.use(timeout('200s'));
app.use(middleware.httpPerformanceLogger);
// 扩展res对象
app.use(middleware.expandResponse);
app.use(bodyParser.json({
  limit: '10mb'
}));
app.use(bodyParser.urlencoded({
  extended: false,
  limit: '10mb'
}));
app.use(cookieParser());
// app.use(session({
//   store: new RedisStore(config.expressSession.redis),
//   key: config.expressSession.key,
//   secret: config.expressSession.secret,
//   resave: config.expressSession.resave,
//   saveUninitialized: config.expressSession.saveUninitialized,
//   cookie: config.expressSession.cookie
// }));

// 创建用户session
app.use(middleware.userSession);

// 页面路由
// app.use('*', middleware.combineShoppingCart); //合并购物车
app.use('/', pageRoutes.index);
app.use('/carinsure', pageRoutes.carInsure);
app.use('/product/car', pageRoutes.carHome);
app.use('/product', pageRoutes.products);
app.use('/shopping-cart', pageRoutes.shoppingCart);
app.use('/orders', pageRoutes.orders);
app.use('/brand', pageRoutes.brand);
app.use('/zhuanti', pageRoutes.specialSubject);
app.use('/baoxianpaiming', pageRoutes.productRanking);
app.use('/guihua', pageRoutes.programs);
app.use('/baoxianyuyue', pageRoutes.reserve);
app.use('/search', pageRoutes.search);


app.use(express.static(path.join(__dirname, 'public')));

// 接口路由
app.use('/api/users', apiRoutes.users);
app.use('/api/products', apiRoutes.products);
app.use('/api/insurance-slips', apiRoutes.insuranceSlips);
app.use('/api/shopping-cart', apiRoutes.shoppingCart);
app.use('/api/tools', apiRoutes.tools);
app.use('/api/orders', apiRoutes.orders);
app.use('/api/upload', apiRoutes.upload);
app.use('/api/programs', apiRoutes.programs);
app.use('/api/base', apiRoutes.base);
app.use('/api/counselors', apiRoutes.counselors);

// catch 404 error
app.use(function(req, res, next) {
  res.renderError('404', 404);
});

// catch server error
app.use(function(err, req, res, next) {
  tracerLogger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', err.message, err.stack, err);
  err.message = '服务器异常，请稍后再试';

  if ("10003" == err.code) {
    err.message = "抱歉，您无权限进行此操作";
  }

  if (503 === err.status) {
    err.message = '请求超时，请稍后再试';
  }
   
  res.renderError('500', err.status, err);
});

module.exports = app;