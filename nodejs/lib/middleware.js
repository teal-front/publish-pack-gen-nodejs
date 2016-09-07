var Util = require('util');
var crypto = require('crypto');
var utils = require('./utils');
var ShoppingCartService = require('./services/shopping-cart-service');
var RpcError = require('./errors/rpc');
var InvalidError = require('./errors/invalid');
var performanceLogger = require('./log').performanceLogger;
var logger = require('./log').logger;
var Validator = require('./validator');
var ProductService = require('./services/product-service');
var pub = require('./public');

var LOGIN_STATE_COOKIE_KEY = '.huize.com';

var __combineShoppingCart = function (req, res, next) {
    utils.checkLoginState(req)
        .then(function (result) {
            if (result) {
                return new Validator(req.cookies.InsureNums).isNotEmpty().isString().validate();
            } else {
                throw new RpcError("00001");
            }
        })
        .then(function (result) {
            var userId = req.session.user.UserId;
            var insuranceSlipsIds = result.split(',').map(function (insuranceSlipsId) {
                return parseInt(insuranceSlipsId);
            });
            
            return ShoppingCartService.combine(userId, insuranceSlipsIds);
        })
        .then(function (result) {
            logger.info('合并购物车成功 result: ', result);
            res.clearCookie('InsureNums', {path: '/', domain: '.huize.com'});
            next();
        })
        .catch(function (error) {
            next();
        });
};

var __expandResponse = function (req, res, next) {
    res.sendNormal = function (result) {
        res.status(200)
            .send({
                status: '00000',
                result: result,
                message: ''
            });
    };
    
    res.sendError = function (error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
        var result = {};

        if (error instanceof RpcError) {
            result.status = error.code;
            result.message = error.message;
        } else if (error instanceof InvalidError) {
            result.status = error.code;
            result.message = error.message;
        } else {
            result.status = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };
    
	res.renderNormal = function (view, data) {
		ProductService.fetchAllCategories()
			.then(function (records) {
				data.categories = records;
                data.curPath = (req.baseUrl + req.path).slice(1);
				res.render(view, pub.renderData(data));
			})
			.catch(function (error) {
                data.curPath = req.baseUrl + req.path;
				logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
				res.render(view, pub.renderData(data));
			});
	};

    res.renderError = function (view, status, error) {
        var title = '';
        if (status === 404) {
            title = utils.formatPageTitle('很抱歉你访问的页面不存在');
        }

        var obj = pub.renderData({
            layout: 'layout/page/layout',
            title: title
        });

        if (error) {
            obj.error = error;
        }

        res.status(status || 500);
        ProductService.fetchAllCategories()
            .then(function (records) {
                obj.categories = records;
                res.render(view, obj);
            })
            .catch(function (err) {
                logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', err.message, err.stack, err);
                res.render(view, obj);
            });
    };

    next();
};

var __httpPerformanceLogger = function (req, res, next) {
    req._startTime = Date.now();
    var recordResponseTime = function () {
        var endTime = Date.now();
        var responseTime = endTime - req._startTime; 
        var path = req.baseUrl + req.path;
        
        // 还原路由定义
        for (var param in req.params) {
            if (req.params.hasOwnProperty(param)) {
                var paramValue = req.params[param]; 
                if (path.indexOf('.html') > -1) {
                    path = path.replace(paramValue, '0');
                } else {
                    path = path.replace(paramValue, ':' + param);
                }
            }
        }
        
        performanceLogger.info('start[%s] time[%s] tag[http#%s]', req._startTime, responseTime, req.method + '-' + path);
    };
    res.once('finish', recordResponseTime);
    res.once('close', recordResponseTime);
    
    next();
};

var __userSession = function (req, res, next) {
    if (!req.session) {
        req.session = {};
    }
    var loginStateCookie = req.cookies[LOGIN_STATE_COOKIE_KEY];

    if (loginStateCookie) {
        var cacheKey = crypto.createHash('md5').update(loginStateCookie).digest('hex');
        utils.getUserFromCache(cacheKey)
            .then(function (record) {
                if (record) {
                    req.session.user = record;
                    next();
                } else {
                    utils.fetchUserStateViaOldSys(req.headers.cookie)
                        .then(function (result) {
                            if (1 === result.Status) {
                                req.session.user = result.Data;
                                utils.setUserFromCache(cacheKey, JSON.stringify(result.Data))
                                    .then(function (result) {
                                        next();
                                    });
                            } else {
                                next();
                            }
                        });
                }
            })
            .catch(function (error) {
                logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
                next();
            });
    } else {
        next();
    }
};

module.exports = {
    combineShoppingCart: __combineShoppingCart,
    expandResponse: __expandResponse,
    httpPerformanceLogger: __httpPerformanceLogger,
    userSession: __userSession
};
