var channel = require('../rpc/channel-api');
var RpcError = require('../errors/rpc');

var __findAll = function() {
    return new Promise(function(resolve, reject) {
        channel.getCompanyList([], function(result) {
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchProducts = function(companyId, cateList, pageNum, pageSize) {
    return new Promise(function(resolve, reject) {
        var params = {
            companyId: companyId,
            cateList: cateList,
            pageNum: pageNum,
            pageSize: pageSize
        };

        channel.getCompanyProductList([params], function(result) {
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};


var __fetchCompanyPageInfo = function(companyId) {
    return new Promise(function(resolve, reject) {
        channel.getCompanyPageInfo([companyId], function(result) {
            if (0 === result.code) {
                resolve(result.data || '');
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

module.exports = {
    findAll: __findAll,
    fetchProducts: __fetchProducts,
    fetchCompanyPageInfo: __fetchCompanyPageInfo
        // fetchDescription: __fetchDescription
};