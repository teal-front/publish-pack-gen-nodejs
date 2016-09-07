var _ = require('lodash');
var channel = require('../rpc/channel-api');
var RpcError = require('../errors/rpc');

var __fetchSimpleMarketData = function () {
    return new Promise(function (resolve, reject) {
        channel.getSimpleMarketData([], function (result) {
            if (0 === result.code) {
                var data = _.omit(result.data || {}, ['id', 'userId', 'createTime', 'updateTime', 'deleted']);
                resolve(data);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

module.exports = {
    fetchSimpleMarketData: __fetchSimpleMarketData
};