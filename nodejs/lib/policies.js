var querystring = require('querystring');
var utils = require('./utils');
var RpcError = require('./errors/rpc');
var logger = require('./log').logger;

var __loginAuth = function (req, res, next) {
    utils.checkLoginState(req)
        .then(function (result) {
            if (result) {
                next();
            } else {
                throw new RpcError('00001');
            }
        })
        .catch(res.sendError);
};

var __loginAuthWithRedirect = function (req, res, next) {
    var redirectUrl = 'http://passport.huize.com/signin/?returnurl=' + 
        querystring.escape('http://' + req.hostname + req.originalUrl);
    
    utils.checkLoginState(req)
        .then(function (result) {
            if (result) {
                next();
            } else {
                res.redirect(redirectUrl);
            }
        })
        .catch(function (error) {
            logger.error('Error occurred! 用户登陆权限验证 Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
            res.redirect(redirectUrl);
        }); 
};

module.exports = {
    loginAuth: __loginAuth,
    loginAuthWithRedirect: __loginAuthWithRedirect
};
