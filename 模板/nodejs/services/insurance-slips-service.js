var channel = require('../lib/channel-api');
var DataError = require('../lib/data-error');

var __queryById = function (insuranceSlipId) {
    return new Promise(function (resolve, reject) {
            channel.getInsuranceSlipsById([insuranceSlipId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
};

module.exports = {
    queryById: __queryById
};