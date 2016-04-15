var express = require('express');
var router = express.Router();
var channel = require('../lib/channel-api');
var utils = require('../lib/utils');
var _ = require('lodash');
var policies = require('../lib/policies');
var pub = require('../lib/public');
var DataError = require('../lib/data-error');

// 页面渲染
router.get('/', function (req, res, next) {
    var obj = {
        layout: 'layout/page/layout-shopcar',
        title: '慧择购物车',
        jsName:"shopping-car"
    };

    res.render('shopcar/shopping-car', pub.renderData(obj));
});

// 获取购物车列表
router.get('/list', function (req, res, next) {
    // 已经登陆获取购物车列表
    var fetchListByUser = function (userId) {
        return new Promise(function (resolve, reject) {
            channel.getShoppingCartItemsByUserId([userId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    // 未登陆获取购物车列表
    var fetchListByInsuranceSlips = function (insuranceSlipsIds) {
        return new Promise(function (resolve, reject) {
            channel.getShoppingCartItemsByInsuranceSlips([insuranceSlipsIds], function (result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function(records) {
        res.status(200)
            .send({
                status: "00000",
                result: records,
                message: ""
            });
    };

    var handleError = function(error) {
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
    };

    // 判断用户是否登陆
    utils.checkLoginState(req)
        .then(function (result) {
            if (result.result) {
                var id = req.session.user.UserId;
                return fetchListByUser(id);
            } else {
                if (req.cookies.InsureNums) {
                    var ids = _.map(req.cookies.InsureNums.split(','), function(id) {
                        return parseInt(id);
                    });

                    return fetchListByInsuranceSlips(ids);
                } else {
                    return [];
                }
            }
        })
        .then(sendResponse)
        .catch(handleError);
});

// 从购物车删除
router.delete('/items', function (req, res, next) {
    var userId = null;
    if (req.session.user) {
        userId = req.session.user.UserId;
    }
    var insuranceSlipsId = req.query.insuranceNum;

    var removeFromShoppingCart = function (_userId, _insuranceSlipsId) {
        return new Promise(function (resolve, reject) {
            channel.removeFromShoppingCart([_userId, _insuranceSlipsId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || '');
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (result) {
        res.status(200)
            .send({
                status: "00000",
                result: result,
                message: ""
            });
    };

    var handleError = function (error) {
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
    };

    removeFromShoppingCart(userId, insuranceSlipsId)
        .then(sendResponse)
        .catch(handleError);
});

// 清空购物车
router.delete('/items/all', function (req, res, next) {
    // 已经登陆清空购物车
    var removeAllByUser = function (userId) {
        return new Promise(function (resolve, reject) {
            channel.removeAllFromShoppingCartByUserId([userId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    // 未登陆清空购物车
    var removeAllByInsuranceSlips = function (insuranceSlipsIds) {
        return new Promise(function (resolve, reject) {
            channel.removeAllFromShoppingCart([insuranceSlipsIds], function (result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function(records) {
        res.status(200)
            .send({
                status: "00000",
                result: records,
                message: ""
            });
    };

    var handleError = function(error) {
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
    };

    // 判断用户是否登陆
    utils.checkLoginState(req)
        .then(function (result) {
            if (result.result) {
                var id = req.session.user.UserId;
                return removeAllByUser(id);
            } else {
                var ids = req.body;

                if (Object.prototype.toString.call(ids) !== '[object Array]') {
                    return true;
                } else {
                    return removeAllByInsuranceSlips(ids);
                }
            }
        })
        .then(sendResponse)
        .catch(handleError);
});

router.get('/items/count', policies.loginAuth);
router.get('/items/count', function (req, res, next) {
    var userId = req.session.user.UserId;
    
    var fetchCount = function (_userId) {
        return new Promise(function (resolve, reject) {
            channel.getShoppingCartItemsCountByUserId([_userId], function (result) {
                if (result.code === 0) {
                    resolve(result.data);
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };
    
    var sendResponse = function(records) {
        res.status(200)
            .send({
                status: "00000",
                result: records,
                message: ""
            });
    };

    var handleError = function(error) {
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
    };
    
    fetchCount(userId)
        .then(sendResponse)
        .catch(handleError);
});

module.exports = router;
