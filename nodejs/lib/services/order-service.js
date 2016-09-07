var channel = require('../rpc/channel-api');
var RpcError = require('../errors/rpc');
var Util = require('util');
var utils = require('../utils');

var __create = function (order) {
    return new Promise(function (resolve, reject) {
        channel.createOrder([order], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __cancel = function (user, orderId) {
    return new Promise(function (resolve, reject) {
        channel.cancelOrder([user, orderId], function (result) {
            if (result.code === 0) {
                resolve(result.data || '');
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __remove = function (user, orderId) {
    return new Promise(function (resolve, reject) {
        channel.removeOrder([user, orderId], function (result) {
            resolve(result.data || '');
        });
    });
};

var __findOne = function (userId, orderId) {
    return new Promise(function (resolve, reject) {
        channel.getOrderDetail([userId, orderId], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __findByUser = function (user, status, beginDate, endDate, page) {
    var userQuery = {
        userId: user.id,
        orderStatuses: Util.isArray(status) ? status : [status],
        beginTime: beginDate,
        endDate: endDate
    };
    return new Promise(function (resolve, reject) {
        channel.getOrdersByUser([userQuery, page], function (result) {
            if (result.code === 1) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchGateways = function (userId, orderId) {
    return new Promise(function (resolve, reject) {
        channel.getGatewayPaymentWays([userId, orderId], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchPaymentResult = function (params) {
    return new Promise(function (resolve, reject) {
        channel.getPaymentResult([params], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchSettlement = function (user, orderId) {
    return new Promise(function (resolve, reject) {
        channel.getSettlementDetailByOrder([user, orderId], function (result) {
            if (0 === result.code) {
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

module.exports = {
    create: __create,
    cancel: __cancel,
    remove: __remove,
    findOne: __findOne,
    findByUser: __findByUser,
    fetchGateways: __fetchGateways,
    fetchPaymentResult: __fetchPaymentResult,
    fetchSettlement: __fetchSettlement
};