var channel = require('../lib/channel-api');

var __combine = function (userId, insuranceSlipsIds) {
    return new Promise(function(resolve, reject) {
        channel.combineShoppingCart([userId, insuranceSlipsIds], function(result) {
            resolve(result.data || {});
        });
    });
};

module.exports = {
    combine: __combine
};
