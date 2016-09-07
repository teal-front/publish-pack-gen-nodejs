var request = require('request');
var Util = require('util');
var config = require('../config');
var logger = require('./log').logger;
var constants = require('./constants');
var pLogger = require('./log').performanceLogger;
var Cache = require('./rpc/channel-cache');
var crypto = require('crypto');

var PREFIX_USER_STATE = 'user_';
var CACHE_EXPIRE = 600;

var __fetchUserStateViaOldSys = function (cookies) {
    var url = config.passportHost + "/SignIn/GetCurrentUser";
    var start = Date.now();

    var options = {
        url: url,
        headers: {
            'Cookie': cookies
        }
    };

    return new Promise(function (resolve, reject) {
        request(options, function (err, response, body) {
            if (err) {
                reject(err);
            } else {
                pLogger.info('start[%s] time[%s] tag[httpForCsharp#%s]', start, Date.now() - start, 'GET-/SignIn/GetCurrentUser');
                try {
                    body = JSON.parse(body);
                    resolve(body);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
};

var __getUserFromCache = function (key) {
    var start = Date.now();
    return new Promise(function (resolve, reject) {
        Cache.get(PREFIX_USER_STATE + key, function (err, reply) {
            if (err) {
                reject(err);
            } else {
                pLogger.info('start[%s] time[%s] tag[redis#%s]', start, Date.now() - start, 'getUser');
                if (reply) {
                    resolve(JSON.parse(reply));
                } else {
                    resolve(null);
                }
            }
        });
    });
};

var __setUserFromCache = function (key, value) {
    return new Promise(function (resolve, reject) {
        Cache.set(PREFIX_USER_STATE + key, value, CACHE_EXPIRE,function (err, reply) {
            if (err) {
                reject(err);
            } else {
                resolve(key);
            }
        });
    });
};

var __checkLoginState = function (req) {
    if (req.session.user) {
        return Promise.resolve(true);
    } else {
        return Promise.resolve(false);
    }
};

var __isImageMimetype = function (mimetype) {
    return mimetype.split('/')[0] === 'image';   
};

var __isExcelMimetype = function (mimetype) {
    mimetype = mimetype.split('/');
    return mimetype[1] && 
        (mimetype[1] === 'vnd.ms-excel' || mimetype[1] === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};

var __isBinaryMimetype = function (mimetype) {
    return mimetype === 'application/octet-stream';
};

var __formatPageTitle = function (title) {
    return Util.format('%s' + constants.PAGE_TITLE_SUFFIX, title);
};

var __formatUrlToSupportHttps = function (url) {
    if (!url) {
        return url;
    }
    
    return url.replace(/http:/i, '');
};

module.exports = {
    fetchUserStateViaOldSys: __fetchUserStateViaOldSys,
    checkLoginState: __checkLoginState,
    isImageMimetype: __isImageMimetype,
    isExcelMimetype: __isExcelMimetype,
    isBinaryMimetype: __isBinaryMimetype,
    formatPageTitle: __formatPageTitle,
    getUserFromCache: __getUserFromCache,
    setUserFromCache: __setUserFromCache,
    formatUrlToSupportHttps: __formatUrlToSupportHttps
};
