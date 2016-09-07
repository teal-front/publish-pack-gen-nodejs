var channel = require('../rpc/channel-api');
var RpcError = require('../errors/rpc');

var __combine = function (userId, insuranceSlipsIds) {
    return new Promise(function(resolve, reject) {
        channel.combineShoppingCart([userId, insuranceSlipsIds], function(result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

module.exports = {
    combine: __combine
};
