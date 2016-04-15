var channel = require('../lib/channel-api');
var constants = require('../lib/constants');

var __list = function (params) {
    return new Promise(function (resolve, reject) {
        channel.getProductCommentsByProduct([params.productId, params.type, params.pagination], function (result) {
            if (result.code === 0) {
                resolve(result.data || []);
            } else {
                reject(new DataError(result.code));
            }
        });
    });
};

var __create = function (comment) {
    return new Promise(function (resolve, reject) {
        channel.createProductComments([comment], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new DataError(result.code));
            }
        });
    });
};

var __update = function (comment) {
    return new Promise(function (resolve, reject) {
        channel.updateProductComments([comment], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new DataError(result.code));
            }
        });
    });
};

var __remove = function (commentId, userId) {
    return new Promise(function (resolve, reject) {
        channel.removeProductComments([commentId, userId], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new DataError(result.code));
            }
        });
    });
};

var __feedback = function (productId) {
    return new Promise(function (resolve, reject) {
        channel.getSatisfactionAndImpression([productId], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new DataError(result.code));
            }
        });
    });
};

var __count = function (productId, type) {
    return new Promise(function (resolve, result) {
        channel.getProductCommentsCount([type, productId], function (result) {
            if (result.code === 0) {
                resolve(result.data || 0);
            } else {
                reject(new DataError(result.code));
            }
        });
    });
};

var __allCount = function (productId) {
    return Promise.all([
            __count(productId, constants.COMMENTS_TYPE.ALL),
            __count(productId, constants.COMMENTS_TYPE.PRODUCT),
            __count(productId, constants.COMMENTS_TYPE.FEEDBACK)
        ])
        .then(function(results) {
            var result = {
                allCount: results[0],
                productCount: results[1],
                feedbackCount: results[2]
            };

            return result;
        });
};

module.exports = {
    feedback: __feedback,
    list: __list,
    create: __create,
    update: __update,
    remove: __remove,
    count: __count,
    allCount: __allCount
};
