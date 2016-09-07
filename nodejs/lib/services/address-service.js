var channel = require('../rpc/channel-api');
var RpcError = require('../errors/rpc');

var _fetchAddresses = function (params) {
    return new Promise(function (resolve, reject) {
        channel.getAddresses([params], function (result) {
            if (result.code === 0) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
}; 

module.exports = {
    fetchAddresses: _fetchAddresses
};