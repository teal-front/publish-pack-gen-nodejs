var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var utils = require('../lib/utils');
var channel = require('../lib/channel-api');
var DataError = require('../lib/data-error');
var policies = require('../lib/policies');
var constants = require('../lib/constants');

// 判断用户是否登陆
router.get('/islogin', function (req, res, next) {
    // var user = req.session.user;
    utils.checkLoginState(req)
        .then(function (result) {
            if (result.result) {
                res.status(200)
                    .send({
                        status: "00000",
                        result: true,
                        message: ""
                    });
            } else {
                throw new DataError("00001");
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
});

// 常用联系人读取
router.get('/contacts', policies.loginAuth);
router.get('/contacts', function (req, res, next) {
    var id = req.session.user.UserId;

    var fetchContacts = function (userId) {
        return new Promise(function (resolve, reject) {
            channel.getUserContacts([userId], function (result) {
                if (result.data) {
                    resolve(result.data);
                } else {
                    reject(new DataError());
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

    fetchContacts(id)
        .then(sendResponse)
        .catch(handleError);
});

// 常用联系人删除
router.delete('/contacts/:contactId', policies.loginAuth);
router.delete('/contacts/:contactId', function (req, res, next) {
    var id = req.session.user.UserId;
    var contactId = req.params.contactId;

    var removeContacts = function (_contactId) {
        return new Promise(function (resolve, reject) {
            channel.removeUserContacts([_contactId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || '');
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

    removeContacts(contactId)
        .then(sendResponse)
        .catch(handleError);
});

// 获取专属客服
router.get('/customer-service', function (req, res, next) {
    var userId = req.session.user.UserId;

    var fetchCustomerService = function (userId) {
        return new Promise(function (resolve, reject) {
            channel.getProductCustomerService([userId], function (result) {
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

    fetchCustomerService(id)
        .then(sendResponse)
        .catch(handleError);
});

// 查询用户可累加货币统计
router.get('/balance', policies.loginAuth);
router.get('/balance', function (req, res, next) {
    var userId = req.session.user.UserId;
    var currencyId = parseInt(req.query.currencyId || constants.CURRENCY_TYPE.BALANCE);

    var fetchBalance = function (_userId, _currencyId) {
        return new Promise(function (resolve, reject) {
            channel.getUserBalanceByCurrency([_userId, _currencyId], function (result) {
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

    fetchBalance(userId, currencyId)
        .then(sendResponse)
        .catch(handleError);
});

// 查询用户可累加货币的冻结明细
router.get('/frozen-balance', policies.loginAuth);
router.get('/frozen-balance', function (req, res, next) {
    var userId = req.session.user.UserId;
    var currencyId = req.query.currencyId;

    var fetchFreezedBalance = function (_userId, _currencyId) {
        return new Promise(function (resolve, reject) {
            channel.getUserFreezedBalanceByCurrency([_userId, _currencyId], function (result) {
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

    fetchFreezedBalance(userId, currencyId)
        .then(sendResponse)
        .catch(handleError);
});

// 激活用户红包
router.post('/actived/red-envelope', policies.loginAuth);
router.post('/actived/red-envelope', function (req, res, next) {
    var userId = req.session.user.UserId;
    var redEnvelopeId = req.body.redEnvelopeId;

    var activeRedEnvelope = function (_userId, _redEnvelopeId) {
        return new Promise(function (resolve, reject) {
            var redEnvelope = {
                voucherSerialNo: _redEnvelopeId
            };

            channel.activeUserRedEnvelope([_userId, redEnvelope], function (result) {
                if (result.code === 0) {
                    resolve(result.data || '');
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

    activeRedEnvelope(userId, redEnvelopeId)
        .then(sendResponse)
        .catch(handleError);
});

// 查询用户寄送地址
router.get('/addresses', policies.loginAuth);
router.get('/addresses', function (req, res, next) {
    var userId = req.session.user.UserId;

    var fetchAddresses = function (_userId) {
        return new Promise(function (resolve, reject) {
            channel.gethUserShipAddress([_userId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || []);
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

    fetchAddresses(userId)
        .then(sendResponse)
        .catch(handleError);
});

module.exports = router;
