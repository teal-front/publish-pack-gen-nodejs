var express = require('express');
var querystring = require('querystring');
var uuid = require('node-uuid').v4;
var router = express.Router();
var middleware = require('../../lib/middleware');
var channel = require('../../lib/rpc/channel-api');
var RpcError = require('../../lib/errors/rpc');
var policies = require('../../lib/policies');
var constants = require('../../lib/constants');
var OrderService = require('../../lib/services/order-service');
var Cache = require('../../lib/rpc/channel-cache');
var config = require('../../config');
var Validator = require('../../lib/validator');
var utils = require('../../lib/utils');

// 初始化缓存模块
// Cache.init(config.redis);
var PREFIX_PAYMENT = 'payment_';
var PAYMENT_CALLBACK_URL = 'https://is.huize.com/orders/payment-check?orderNum=';

// 创建订单
router.post('/', policies.loginAuth);
router.post('/', function (req, res, next) {
    var body = req.body.data;
  
    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            body = JSON.parse(result);
            
            body.user = {
                userId: req.session.user.UserId,
                userName: req.session.user.LoginName
            };
            
            return body;
        })
        .then(OrderService.create)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 取消订单
router.put('/:id', policies.loginAuth);
router.put('/:id', function (req, res, next) {
    var id = req.params.id;
    
    new Validator(id).isNotEmpty().isString().validate()
        .then(function (result) {
            var user = {
                userId: req.session.user.UserId,
                userName: req.session.user.LoginName
            };
            
            return  OrderService.cancel(user, result);
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 删除订单
router.delete('/:id', policies.loginAuth);
router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    
    new Validator(id).isNotEmpty().isString().validate()
        .then(function (result) {
            var user = {
                userId: req.session.user.UserId,
                userName: req.session.user.LoginName
            };
            
            return OrderService.remove(user, result);
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 查询订单明细
router.get('/:id/detail', policies.loginAuth);
router.get('/:id/detail', function (req, res, next) {
    var id = req.params.id;
    var userId = req.session.user.UserId;

    new Validator(id).isNotEmpty().isString().validate()
        .then(function (result) {
            return OrderService.findOne(userId, result);
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 计算支付货币组合
router.post('/payment-combination', policies.loginAuth);
router.post('/payment-combination', function (req, res, next) {
    var body = req.body.data;
    
    var caculate = function (params) {
        return new Promise(function (resolve, reject) {
            channel.caculatePaymentCombination([params], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            body = JSON.parse(result);
            
            body.user = {
                userId: req.session.user.UserId
            };
            
            return body;
        })
        .then(caculate)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 查询网关支付方式
router.get('/payment/gateway', policies.loginAuth);
router.get('/payment/gateway', function (req, res, next) {
    var orderId = req.query.orderNum;
   
    new Validator(orderId).isNotEmpty().isString().validate()
        .then(function (result) {
             var userId = req.session.user.UserId;
             return OrderService.fetchGateways(userId, result);
        })
        .then(function (record) {
            if (record.paymentWays) {
                record.paymentWays.forEach(function (paymentWay) {
                    paymentWay.logoUrl = utils.formatUrlToSupportHttps(paymentWay.logoUrl);

                    if (paymentWay.gatewayBanks) {
                        paymentWay.gatewayBanks.forEach(function (bank) {
                            bank.logUrl = utils.formatUrlToSupportHttps(bank.logUrl);
                        });
                    }
                });
            }

            return record;
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 通过网关支付订单
router.post('/payment/gateway', policies.loginAuth);
router.post('/payment/gateway', function (req, res, next) {
    var body = req.body.data;
    
    var pay = function (params) {
        return new Promise(function (resolve, reject) {
            params.callbackUrl = PAYMENT_CALLBACK_URL + params.orderNum;
            channel.payByGateway([params], function (result) {
                if (result.code === 0) {
                    if (result.data.errors && result.data.errors.length > 0) {
                        var error = result.data.errors[0];
                        reject(new RpcError(error.errorCode, error.message));
                    } else {
                        resolve(result.data || {});
                    }
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    var getQrcode = function (order) {
        var query = querystring.stringify({
            BSId: order.gatewayPaymentInfo.bsId,
            Price: (parseFloat(order.gatewayPaymentInfo.price) / 100).toFixed(2),
            ServiceNotifyUrl: order.gatewayPaymentInfo.serviceNotifyUrl,
            ProductName: order.gatewayPaymentInfo.productName,
            ConsumeType: order.gatewayPaymentInfo.consumeType,
            Sign: order.gatewayPaymentInfo.sign,
            Deadline: order.gatewayPaymentInfo.deadline,
            PayOrderNumber: order.gatewayPaymentInfo.payOrderNumber,
            PartnerId: order.gatewayPaymentInfo.partnerId,
            IsNoDeal: order.gatewayPaymentInfo.isNoDeal,
            CompanyId: order.gatewayPaymentInfo.companyId || '-1',
            Descript: order.gatewayPaymentInfo.payOrderNumber,
            TraceId: order.gatewayPaymentInfo.bsId,
            NotifyUrl: order.gatewayPaymentInfo.notifyUrl
        });
        var url = '//payment.hzins.com/home/GetQRCode?' + query;
        
        return Promise.resolve(url);
    };
    
    var cacheOrder = function (order) {
        return new Promise(function (resolve, reject) {
            var key = uuid();
            Cache.set(PREFIX_PAYMENT + key, order, 86400, function (err, reply) {
                if (err) {
                    reject(new RpcError("00002"));
                } else {
                    resolve(key);
                }
            });
        });
    };
    
    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            body = JSON.parse(result);
            
            body.user = {
                userId: req.session.user.UserId,
                userName: req.session.user.LoginName
            };
            
            return body;
        })
        .then(pay)
        .then(function (record) {
            if (record.gatewayPaymentInfo.onlinePaymentId != constants.GATEWAY_CODE.WECHATPAY) {
                return cacheOrder(record);
            } else {
                return getQrcode(record);
            }
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 结算投保单获取标识
router.post('/settlement', policies.loginAuth);
router.post('/settlement', function (req, res, next) {
    var body = req.body.data;
   
    var settle = function (_params) {
        return new Promise(function (resolve, reject) {
            channel.settleInsuranceSlips([_params], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            body = JSON.parse(result);
            
            return {
                user: {
                    userId: req.session.user.UserId,
                    userName: req.session.user.LoginName
                },
                items: body
            };
        })
        .then(settle)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 查询当年订单用户可使用的红包
router.post('/available/red-envelopes', policies.loginAuth);
router.post('/available/red-envelopes', function (req, res, next) {
    var planIds = req.body.data;

    var fetchRedEnvelopes = function (_userId, _planIds) {
        return new Promise(function (resolve, reject) {
            channel.getUserRedEnvelope([_userId, _planIds], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    new Validator(planIds).isNotEmpty().isString().validate()
        .then(function (result) {
            planIds = JSON.parse(result);
            var userId = req.session.user.UserId;
            
            return fetchRedEnvelopes(userId, planIds);
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 查询用户账户内站内支付货币详情
router.post('/available/balance', policies.loginAuth);
router.post('/available/balance', function (req, res, next) {
    var planIds = req.body.data;
    var userId = req.session.user.UserId;
    
    var fetchBalance = function (_userId, _planIds) {
        return new Promise(function (resolve, reject) {
            channel.getSettlementAvailableBalance([_userId, _planIds], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    new Validator(planIds).isNotEmpty().isString().validate()
        .then(function (result) {
            planIds = JSON.parse(result);

            return fetchBalance(userId, planIds);
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 解冻站内支付货币
router.delete('/:id/freezed/currency', policies.loginAuth);
router.delete('/:id/freezed/currency', function (req, res, next) {
    var orderId = req.params.id;

    var unfreeze = function (_userId, _orderId) {
        return new Promise(function (resolve, reject) {
            channel.unfreezeUserCurrency([_userId, _orderId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || false);
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    new Validator(orderId).isNotEmpty().isString().validate()
        .then(function (result) {
            var userId = req.session.user.UserId;
            return unfreeze(userId, result);
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 查询订单支付状态
router.get('/:id/payment/status', policies.loginAuth);
router.get('/:id/payment/status', function (req, res, next) {
    var paymentReceiptNum = req.query.paymentReceiptNum;
    var transactionNum = req.query.bsId;
    
    Promise.all([
            new Validator(paymentReceiptNum).isNotEmpty().isString().validate(),
            new Validator(transactionNum).isNotEmpty().isString().validate()
        ])
        .then(function (results) {
            paymentReceiptNum = results[0];
            transactionNum = results[1];
            
            return {
                paymentReceiptNum: paymentReceiptNum,
                isSuccess: true,
                transactionNum: transactionNum
            };
        })
        .then(OrderService.fetchPaymentResult)
        .then(res.sendNormal)
        .catch(res.sendError);
});

module.exports = router;
