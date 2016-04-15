var channel = require('../lib/channel-api');
var DataError = require('../lib/data-error');

var __fetchSecurity = function (productId) {
    return new Promise(function(resolve, reject) {
        channel.getProductSecurity([productId], function(result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new DataError(result.code));
            }
        });
    });
};

var __fetchDefaultRestrictRule = function(rule) {
    return new Promise(function(resolve, reject) {
        channel.getProductDefaultRestrictRule([rule], function(result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new DataError(result.code));
            }
        });
    });
};

var __compareProducts = function (planIds) {
    return new Promise(function(resolve, reject) {
        channel.compareProducts([planIds], function(result) {
            if (result.code === 0) {
                resolve(result.data || []);
            } else {
                reject(new DataError(result.code));
            }
        });
    });
};

var __fetchPlansInfo = function (planIds) {
    return new Promise(function(resolve, reject) {
        channel.getPlansByIds([planIds], function(result) {
            if (result.code === 0) {
                resolve(result.data || []);
            } else {
                reject(new DataError(result.code));
            }
        });
    });
};

module.exports = {
    fetchSecurity: __fetchSecurity,
    fetchDefaultRestrictRule: __fetchDefaultRestrictRule,
    compareProducts: __compareProducts,
    fetchPlansInfo: __fetchPlansInfo
};
