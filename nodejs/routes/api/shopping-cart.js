var express = require('express');
var _ = require('lodash');
var router = express.Router();
var channel = require('../../lib/rpc/channel-api');
var utils = require('../../lib/utils');
var policies = require('../../lib/policies');
var pub = require('../../lib/public');
var RpcError = require('../../lib/errors/rpc');
var Validator = require('../../lib/validator');
var ShoppingCartService = require('../../lib/services/shopping-cart-service');

// 获取购物车列表
router.get('/list', function (req, res, next) {
    // 已经登陆获取购物车列表
    var fetchListByUser = function (userId) {
        return new Promise(function (resolve, reject) {
            channel.getShoppingCartItemsByUserId([userId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new RpcError(result.code, result.msg));
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
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    // 判断用户是否登陆
    utils.checkLoginState(req)
        .then(function (result) {
            if (result) {
                var id = req.session.user.UserId;
                return fetchListByUser(id);
            } else {
                if (req.cookies.InsureNums) {
                    var ids = [];
                    req.cookies.InsureNums.split(',').forEach(function (id) {
                        if (id) {
                            ids.push(+id);
                        }
                    });

                    return fetchListByInsuranceSlips(ids);
                } else {
                    return [];
                }
            }
        })
        .then(function (records) {
            // 替换公司LOGO
            records.forEach(function (record) {
                record.cartItems.forEach(function (item) {
                    item.companyLogoUrl = utils.formatUrlToSupportHttps(item.companyLogoUrl);
                    item.policyUrl = utils.formatUrlToSupportHttps(item.policyUrl);
                });
            });

            return records;
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 从购物车删除
router.delete('/items', function (req, res, next) {
    var userId = null;
    if (req.session.user) {
        userId = req.session.user.UserId;
    }
    var type = req.query.type || '';

    // 删除单品
    var removeFromShoppingCart = function (_userId, _insuranceSlipsId) {
        return new Promise(function (resolve, reject) {
            channel.removeFromShoppingCart([_userId, _insuranceSlipsId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || false);
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    // 删除规划
    var removePlanFromShoppingCart = function (_userId, _projectInsuranceGroup) {
        return new Promise(function (resolve, reject) {
            channel.removePlanFromShoppingCart([_userId, _projectInsuranceGroup], function (result) {
                if (result.code === 0) {
                    resolve(result.data || false);
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    // 判断删除的是规划还是单品  陈润发 2016-06-29
    if (type === 'plan') {
        var projectInsuranceGroup = req.query.projectInsuranceGroup;

        new Validator(projectInsuranceGroup).isNotEmpty().isString().validate()
            .then(function (result) {
                return removePlanFromShoppingCart(userId, result);
            })
            .then(res.sendNormal)
            .catch(res.sendError);
    } else {
        var insuranceSlipsId = req.query.insuranceNum;

        new Validator(insuranceSlipsId).isNotEmpty().isNumber().validate()
            .then(function (result) {
                return removeFromShoppingCart(userId, result);
            })
            .then(res.sendNormal)
            .catch(res.sendError);
    }
});

// 清空购物车
router.delete('/items/all', function (req, res, next) {
    // 已经登陆清空购物车
    var removeAllByUser = function (userId) {
        return new Promise(function (resolve, reject) {
            channel.removeAllFromShoppingCartByUserId([userId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || false);
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    // 未登陆清空购物车
    var removeAllByInsuranceSlips = function (insuranceSlipsIds) {
        return new Promise(function (resolve, reject) {
            channel.removeAllFromShoppingCart([insuranceSlipsIds], function (result) {
                if (result.code === 0) {
                    resolve(result.data || false);
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    // 判断用户是否登陆
    utils.checkLoginState(req)
        .then(function (result) {
            if (result) {
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
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 获取用户购物车投保单数量
router.get('/items/count', policies.loginAuth);
router.get('/items/count', function (req, res, next) {
    var userId = req.session.user.UserId;
    
    var fetchCount = function (_userId) {
        return new Promise(function (resolve, reject) {
            channel.getShoppingCartItemsCountByUserId([_userId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || 0);
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    fetchCount(userId)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 合并购物车
router.post('/items/combine', function (req, res, next) {
    var body = req.body.data;
    
    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            body = JSON.parse(result);
            var userId = body.userId;
            var insuranceSlipsIds = body.insuranceNums;
            
            return Promise.all(
                [new Validator(userId).isNotEmpty().isNumber().validate()]
                    .concat(insuranceSlipsIds.map(function (insuranceSlipsId) {
                        return new Validator(insuranceSlipsId).isNotEmpty().isNumber().validate(); 
                    })))
                .then(function (results) {
                    return ShoppingCartService.combine(userId, insuranceSlipsIds);
                });
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});


// 添加方案到购物车
router.post('/items/programs', function (req, res, next) {
    var body = req.body.data;

    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            return true;
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

module.exports = router;
