var utils = require('./utils');
var DataError = require('./data-error');

var __loginAuth = function (req, res, next) {
    utils.checkLoginState(req)
        .then(function (result) {
            if (result.result) {
                next();
            } else {
                throw new DataError('00001');
            }
        })
        .catch(function (error) {
            console.log(error);
            var result = {};

            if (error instanceof DataError) {
                result.code = error.code;
                result.message = error.message;
            } else {
                result.code = '99999';
                result.message = '未知异常';
            }
            result.result = '';

            res.status(200)
                .send(result);
        });
};

__loginAuthWithRedirect = function (req, res, next) {
    utils.checkLoginState(req)
        .then(function (result) {
            if (result.result) {
                next();
            } else {
                res.redirect('http://passport.huize.com/signin/?returnurl=http%3A%2F%2Fwww.huize.com%2F');
            }
        })
        .catch(function (error) {
            console.error(error);
            res.redirect('http://passport.huize.com/signin/?returnurl=http%3A%2F%2Fwww.huize.com%2F');
        }); 
};

module.exports = {
    loginAuth: __loginAuth,
    loginAuthWithRedirect: __loginAuthWithRedirect
};
