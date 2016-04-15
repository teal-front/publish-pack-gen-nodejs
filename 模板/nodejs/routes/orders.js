var express = require('express');
var router = express.Router();
var middleware = require('../lib/middleware');
var channel = require('../lib/channel-api');
var DataError = require('../lib/data-error');
var policies = require('../lib/policies');
var constants = require('../lib/constants');
var pub = require('../lib/public');

// 创建订单
router.post('/', policies.loginAuth);
router.post('/', function (req, res, next) {
    var body = req.body;
    body.user = {
        userId: req.session.user.UserId
    };

    var create = function (params) {
        return new Promise(function (resolve, reject) {
            channel.createOrder([body], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (result) {
        res.status(200)
            .send({status: "00000", result: result, message: ""});
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

    create(body)
        .then(sendResponse)
        .catch(handleError);
});

// 取消订单
router.put('/:id', policies.loginAuth);
router.put('/:id', function (req, res, next) {
    var user = {
        userId: req.session.user.UserId,
        userName: req.session.user.LoginName
    };
    var id = req.params.id;

    var cancel = function (_user, orderId) {
        return new Promise(function (resolve, reject) {
            channel.cancelOrder([_user, orderId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (result) {
        res.status(200)
            .send({status: "00000", result: result, message: ""})
            .end();
    };

    var handleError = function (error) {
        console.error(error);
        res.status(400)
            .send(error)
            .end();
    };

    cancel(user, id)
        .then(sendResponse)
        .catch(handleError);
});

// 删除订单
router.delete('/:id', policies.loginAuth);
router.delete('/:id', function (req, res, next) {
    var user = {
        userId: req.session.user.UserId,
        userName: req.session.user.LoginName
    };
    var id = req.params.id;

    var remove = function (_user, orderId) {
        return new Promise(function (resolve, reject) {
            channel.removeOrder([_user, orderId], function (result) {
                resolve(result.data || {});
            });
        });
    };

    var sendResponse = function (result) {
        res.status(200)
            .send({status: "00000", result: result, message: ""})
            .end();
    };

    var handleError = function (error) {
        console.error(error);
        res.status(400)
            .send(error)
            .end();
    };

    remove(user, id)
        .then(sendResponse)
        .catch(handleError);
});

// 查询订单明细
router.get('/:id/detail', policies.loginAuth);
router.get('/:id/detail', function (req, res, next) {
    var id = req.params.id;

    var fetchDetail = function (orderId) {
        return new Promise(function (resolve, reject) {
            channel.getOrderDetail([orderId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError);
                }
            });
        });
    };

    var sendResponse = function (result) {
        res.status(200)
            .send({status: "00000", result: result, message: ""})
            .end();
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

    fetchDetail(id)
        .then(sendResponse)
        .catch(handleError);
});

// 查询用户订单列表
router.get('/list', policies.loginAuth);
router.get('/list', function (req, res, next) {
    var user = {
        userId: req.session.user.UserId
    };
    var status = req.query.status;
    var page = {
        pageIndex: req.query.page || 1,
        pageSize: req.query.limit || constants.ORDERS_PAGE_SIZE
    };

    var fetchList = function (_user, _status, _page) {
        return new Promise(function (resolve, reject) {
            channel.getOrdersByUser([_user, [_status], _page], function (result) {
                if (result.code === 1) {
                    resolve(result.data || []);
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (result) {
        res.status(200)
            .send({status: "00000", result: result, message: ""})
            .end();
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

    fetchList(user, status, page)
        .then(sendResponse)
        .catch(handleError);
});

// 验证支付货币组合
router.post('/check-payment-combination', policies.loginAuth);
router.post('/check-payment-combination', function (req, res, next) {
    var body = req.body;
    body.user = {
        userId: req.session.user.UserId
    };

    var check = function (params) {
        return new Promise(function (resolve, reject) {
            channel.checkPaymentCombination([params], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (result) {
        res.status(200)
            .send({status: "00000", result: result, message: ""})
            .end();
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

    check(body)
        .then(sendResponse)
        .catch(handleError);
});

// 查询网关支付方式
router.post('/gateway-methods', policies.loginAuth);
router.post('/gateway-methods', function (req, res, next) {
    var body = req.body;

    var fetchMethods = function (planPlatformIds) {
        return new Promise(function (resolve, reject) {
            channel.getGatewayPaymentWays([planPlatformIds], function (result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (result) {
        res.status(200)
            .send({status: "00000", result: result, message: ""})
            .end();
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

    fetchMethods(body)
        .then(sendResponse)
        .catch(handleError);
});

// 通过网关支付订单
router.post('/gateway-payment', policies.loginAuth);
router.post('/gateway-payment', function (req, res, next) {
    var body = req.body;
    body.user = {
        userId: req.session.user.UserId,
        userName: req.session.user.LoginName
    };

    var pay = function (params) {
        return new Promise(function (resolve, reject) {
            channel.payByGateway([params], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (result) {
        res.status(200)
            .send({status: "00000", result: result, message: ""})
            .end();
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

    pay(body)
        .then(sendResponse)
        .catch(handleError);
});

// 结算投保单
// router.post('/settle', policies.loginAuthWithRedirect);
// router.post('/settle', function (req, res, next) {
router.get('/settle', function (req, res, next) {
    // var body = req.body.data;
    // var params = {
    //     user: {
    //         userId: req.session.user.UserId,
    //         userName: req.session.user.LoginName
    //     },
    //     items: body
    // };
    var params = {
        user: {
            userId: 249445,
            userName: 'gh378684988'
        },
        items: [{
            insuranceNum: 20160412001789,
            premium: 1500, 
        }]
    };

    var settle = function (_params) {
        return new Promise(function (resolve, reject) {
            channel.settleInsuranceSlips([_params], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (record) {
        var obj = {
	        layout: 'layout/page/layout',
	        title: '惠泽结算页',
			data: record
	    };
	    res.render('search/success', pub.renderData(obj));
    };

    var handleError = function (error) {
        console.log(error);
        next(err);
    };

    settle(params)
        .then(sendResponse)
        .catch(handleError);
});

// 查询当年订单用户可使用的红包
router.post('/available/red-envelopes', policies.loginAuth);
router.post('/available/red-envelopes', function (req, res, next) {
    var userId = req.session.user.UserId;
    var planIds = JSON.parse(req.body.data);

    var fetchRedEnvelopes = function (_userId, _planIds) {
        return new Promise(function (resolve, reject) {
            channel.getUserRedEnvelope([_userId, _planIds], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (record) {
        res.status(200)
            .send({status: "00000", result: record, message: ""});
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

    fetchRedEnvelopes(userId, planIds)
        .then(sendResponse)
        .catch(handleError);
});

module.exports = router;
