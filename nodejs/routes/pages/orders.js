var express = require('express');
var uuid = require('node-uuid').v4;
var querystring = require('querystring');
var router = express.Router();
var middleware = require('../../lib/middleware');
var channel = require('../../lib/rpc/channel-api');
var RpcError = require('../../lib/errors/rpc');
var policies = require('../../lib/policies');
var constants = require('../../lib/constants');
var pub = require('../../lib/public');
var OrderService = require('../../lib/services/order-service');
var Cache = require('../../lib/rpc/channel-cache');
var config = require('../../config');
var logger = require('../../lib/log').logger;
var utils = require('../../lib/utils');

// 初始化缓存模块
// Cache.init(config.redis);
var PREFIX_PAYMENT = 'payment_';
var PAYMENT_CALLBACK_URL = 'https://is.huize.com/orders/payment-success?orderNum=';
var MYSAFEBOX_URL = 'https://i.huize.com/?url=MySafe/PolicyAll';

// 结算页渲染
router.get('/settlement/:id', policies.loginAuthWithRedirect);
router.get('/settlement/:id', function (req, res, next) {
    var id = req.params.id;

    var fetchSettlement = function (uuid) {
        return new Promise(function (resolve, reject) {
            channel.getSettlementDetail([uuid], function (result) {
                if (result.code === 0) {
                    var record = result.data || {};
                    if (record.cartItemGroups) {
                        record.cartItemGroups.forEach(function (group) {
                            if (group.cartItems) {
                                group.cartItems.forEach(function (item) {
                                    item.companyLogoUrl = utils.formatUrlToSupportHttps(item.companyLogoUrl);
                                    item.policyUrl = utils.formatUrlToSupportHttps(item.policyUrl);
                                });
                            }
                        });
                    }
                    
                    resolve(record);
                } else {
                    // reject(new RpcError(result.code, result.msg));
                    var error = new RpcError(result.code, result.msg);
                    resolve({
                        insuranceResults: [{
                            errorCode: error.code,
                            errorMsg: error.message
                        }]
                    });
                }
            });
        });
    };

    var sendResponse = function (record) {
        var obj = {
	        layout: 'layout/page/layout-shopcar',
	        title: utils.formatPageTitle('保单结算'),
			data: record,
            jsName : "settlement",
            curStep : 4
	    };

	    // res.render('pay/settlement', pub.renderData(obj));
        res.renderNormal('pay/settlement', obj);
    };

    var handleError = function (error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
        next(error);
    };

    fetchSettlement(id)
        .then(sendResponse)
        .catch(handleError);
});

// 重新结算页
router.get('/payment/change-settlement', policies.loginAuthWithRedirect);
router.get('/payment/change-settlement', function (req, res, next) {
    var orderId = req.query.orderNum;
    var user = {
        userId: req.session.user.UserId,
        userName: req.session.user.LoginName
    };

    if (!orderId) {
        next();
        return;
    }

    var sendResponse = function (record) {
        var obj = {
	        layout: 'layout/page/layout-shopcar',
	        title: utils.formatPageTitle('保单结算'),
			data: record,
            jsName : "settlement",
            curStep : 4
	    };

	    // res.render('pay/settlement', pub.renderData(obj));
        res.renderNormal('pay/settlement', obj);
    };

    var handleError = function (error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
        next(error);
    };

    OrderService.fetchSettlement(user, orderId)
        .then(sendResponse)
        .catch(handleError);
});

// 收银台页面
router.get('/payment', policies.loginAuthWithRedirect); 
router.get('/payment', function (req, res, next) {
    var orderId = req.query.orderNum;
    var userId = req.session.user.UserId;
    
    if (!orderId) {
        next();
        return;
    }
    
    var sendResponse = function (records) {
        var order = records[0];
        order.gateways = records[1];
        var redirectUrl;
         
        if (order.paymentType === constants.PAYMENT_TYPE.OFFLINE) {
            redirectUrl = '/orders/payment-bank?orderNum=' + orderId;
        }

        if (order.paymentType === constants.PAYMENT_TYPE.BANK_WITHHOLDING) {
            redirectUrl = '/orders/payment-success?orderNum=' + orderId;
        }

        switch (order.status) {
            case constants.ORDER_STATUS.FAILED_TO_PAY:
                redirectUrl = '/orders/payment-fail?orderNum=' + orderId;
                break;
            case constants.ORDER_STATUS.PAID: 
                redirectUrl = '/orders/payment-success?orderNum=' + orderId;
                break;
            case constants.ORDER_STATUS.CANCELLED:
            case constants.ORDER_STATUS.REMOVED:
                redirectUrl = MYSAFEBOX_URL;
            default:
                break;
        }
        
        if (redirectUrl) {
            res.redirect(redirectUrl);
            return;
        }

        if (order.gateways.paymentWays) {
            order.gateways.paymentWays.forEach(function (paymentWay) {
                paymentWay.logoUrl = utils.formatUrlToSupportHttps(paymentWay.logoUrl);

                if (paymentWay.gatewayBanks) {
                    paymentWay.gatewayBanks.forEach(function (bank) {
                        bank.logUrl = utils.formatUrlToSupportHttps(bank.logUrl);
                    });
                }
            }); 
        }

        var obj = {
	        layout: 'layout/page/layout-shopcar',
	        title: utils.formatPageTitle('收银台'),
			data: order,
            jsName : "payment",
            curStep : 4
	    };
	    // res.render('pay/payment', pub.renderData(obj));
        res.renderNormal('pay/payment', obj);
    };

    var handleError = function (error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
        next(error);
    };

    Promise.all([
            OrderService.findOne(userId, orderId),
            OrderService.fetchGateways(userId, orderId)
        ])
        .then(sendResponse)
        .catch(handleError);
});

// 支付网关跳转页面
router.get('/payment-transfer', policies.loginAuthWithRedirect); 
router.get('/payment-transfer', function (req, res, next) {
    var id = req.query.id;
    
    if (!id) {
        next();
        return;
    }
    
    var getCache = function (key) {
        return new Promise(function (resolve, reject) {
            Cache.get(PREFIX_PAYMENT + key, function (err, reply) {
                if (err) {
                    reject(new RpcError('00003'));
                } else {
                    if (reply) {
                        resolve(JSON.parse(reply));
                    } else {
                        reject(new RpcError('00003'));
                    }
                }  
            }); 
        });
    };
    
    var sendResponse = function (record) {
        if (record.gatewayPaymentInfo.onlinePaymentId != constants.GATEWAY_CODE.WECHATPAY) {
            var html = '<!DOCTYPE html>' +
                '<html>' +
                '<body>' +
                        '<form action="https://payment.hzins.com" method="post" id="paymentForm">' +
                            '<input type="hidden" name="OnliePaymnetId" value="' + record.gatewayPaymentInfo.onlinePaymentId + '" />' +
                            '<input type="hidden" name="BSId" value="' + record.gatewayPaymentInfo.bsId + '" />' +
                            '<input type="hidden" name="Price" value="' + (parseFloat(record.gatewayPaymentInfo.price) / 100).toFixed(2) + '" />' +
                            '<input type="hidden" name="PartnerId" value="' + record.gatewayPaymentInfo.partnerId + '" />' +
                            '<input type="hidden" name="ConsumeType" value="' + record.gatewayPaymentInfo.consumeType + '" />' +
                            '<input type="hidden" name="BankId" value="' + (record.gatewayPaymentInfo.bankId || '0') + '" />' +
                            '<input type="hidden" name="ProductName" value="' + record.gatewayPaymentInfo.productName + '" />' +
                            '<input type="hidden" name="NotifyUrl" value="' + record.gatewayPaymentInfo.notifyUrl + '" />' +
                            '<input type="hidden" name="ServiceNotifyUrl" value="' + record.gatewayPaymentInfo.serviceNotifyUrl + '" />' +
                            '<input type="hidden" name="IsNoDeal" value="' + record.gatewayPaymentInfo.isNoDeal + '" />' +
                            '<input type="hidden" name="Deadline" value="' + record.gatewayPaymentInfo.deadline + '" />' +
                            '<input type="hidden" name="Sign" value="' + record.gatewayPaymentInfo.sign + '" />' +
                            '<input type="hidden" name="PayOrderNumber" value="' + record.gatewayPaymentInfo.payOrderNumber + '" />' +
                            '<input type="hidden" name="PayToInsurer" value="' + (record.gatewayPaymentInfo.payToInsurer || '') + '" />' +
                            '<input type="hidden" name="CompanyId" value="' + (record.gatewayPaymentInfo.companyId || '-1') + '" />' +
                        '</form>' +
                        '<script type="text/javascript">document.getElementById("paymentForm").submit();</script>' +
                '</body>' +
                '</html>';

            res.type('html')
                .send(html);
        } else {
            next(new Error('当前支付方式不支持微信支付'));
        }
    };

    var handleError = function (error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
        next(error);
    };
    
    getCache(id)
        .then(sendResponse)
        .catch(handleError);
});

// 验证支付回调
router.post('/payment-check', policies.loginAuthWithRedirect);
router.post('/payment-check', function (req, res, next) {
    var body = req.body;
    var orderNum = req.query.orderNum;
    logger.debug('POST /orders/payment-check request-body: ', body);
    
    var redirectToSuccess = function () {
        res.redirect('/orders/payment-success?orderNum=' + orderNum);
    };
    
    var redirectToFail = function () {
        res.redirect('/orders/payment-fail?orderNum=' + orderNum);
    };
    
    var redirectToProcess = function () {
        res.redirect('/orders/payment-process?paymentReceiptNum=' + body.PayOrderNumber + '&bsId=' + body.BSId + 
            '&orderNum=' + orderNum);
    };
    
    if ("Success" !== body.Success) {
        res.redirect('/orders/payment?orderNum=' + orderNum);
    } else {
        OrderService.fetchPaymentResult({
                paymentReceiptNum: body.PayOrderNumber,
                isSuccess: true,
                transactionNum: body.BSId
            })
            .then(function (result) {
                logger.debug('POST /orders/payment-check fetchPaymentResult: ', result);
                switch (result.status) {
                    case constants.PAYMENT_RESULT_STATUS.SUCCESS:
                        redirectToSuccess();
                        break;
                    case constants.PAYMENT_RESULT_STATUS.FAIL:
                        redirectToFail();
                        break;
                    default:
                        redirectToProcess();
                        break;
                }
            })
            .catch(function (error) {
                logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
                next(error);
            });
    }
});

// 验证支付回调
router.get('/payment-check', function (req, res, next) {
    res.render('pay/weixin-payment-success');
});

// 支付成功页
router.get('/payment-success', policies.loginAuthWithRedirect);
router.get('/payment-success', function (req, res, next) {
    var orderId = req.query.orderNum;
    var userId = req.session.user.UserId;
    
    if (!orderId) {
        next();
        return;
    }
    
    var sendResponse = function (record) { 
        var obj = {
	        layout: 'layout/page/layout-shopcar',
	        title:  utils.formatPageTitle('支付成功'),
			data: record,
            jsName : "success",
            curStep : 5
	    };
	    // res.render('pay/success', pub.renderData(obj));
        res.renderNormal('pay/success', obj);        
    };

    var handleError = function (error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
        next(error);
    };

    OrderService.findOne(userId, orderId)
        .then(sendResponse)
        .catch(handleError);
});

// 支付失败页
router.get('/payment-fail', policies.loginAuthWithRedirect);
router.get('/payment-fail', function (req, res, next) {
    var orderId = req.query.orderNum;
    
    if (!orderId) {
        next();
        return;
    }
    
    var obj = {
        layout: 'layout/page/layout-shopcar',
        title: utils.formatPageTitle('支付失败'),
        curStep : 5
    };
    
    // res.render('pay/fail', pub.renderData(obj));
    res.renderNormal('pay/fail', obj);
});

// 支付中页面
router.get('/payment-process', policies.loginAuthWithRedirect);
router.get('/payment-process', function (req, res, next) {
    var paymentReceiptNum = req.query.paymentReceiptNum;
    var transactionNum = req.query.bsId;
    var orderNum = req.query.orderNum;
    
    if (!paymentReceiptNum || !transactionNum || !orderNum) {
        next();
        return;
    } 
    
    var obj = {
        layout: 'layout/page/layout-shopcar',
        title: utils.formatPageTitle('支付中'),
        jsName : "process",
        data: {
            orderNum: orderNum,
            paymentReceiptNum: paymentReceiptNum,
            transactionNum: transactionNum
        },
        curStep : 5
    };
    
    // res.render('pay/process', pub.renderData(obj));
    res.renderNormal('pay/process', obj);
});

// 转账汇款页
router.get('/payment-bank', policies.loginAuthWithRedirect);
router.get('/payment-bank', function (req, res, next) {  
    var orderId = req.query.orderNum || '0';

    var obj = {
        layout: 'layout/page/layout-shopcar',
        title: utils.formatPageTitle('转帐汇款'),
        data: {
            orderNum: orderId
        },　
        jsName : '',
        curStep: 5
    };
    
    // res.render('pay/bank', pub.renderData(obj));
    res.renderNormal('pay/bank', obj);
});

module.exports = router;
