var channel = require('../rpc/channel-api');
var constants = require('../constants');
var RpcError = require('../errors/rpc');
var request = require('request');
var config = require('../../config');
var utils = require('../utils');

var __list = function (params) {
    return new Promise(function (resolve, reject) {
        channel.getProductCommentsByProduct([params.productId, params.type, params.pagination], function (result) {
            if (result.code === 0) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
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
                reject(new RpcError(result.code, result.msg));
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
                reject(new RpcError(result.code, result.msg));
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
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __feedback = function (productId) {
    return new Promise(function (resolve, reject) {
        channel.getSatisfactionAndImpression([productId], function (result) {
            if (result.code === 0) {
                if ('0%' === result.data.satisfaction) {
                    result.data.satisfaction = '100%';
                }
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
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
                reject(new RpcError(result.code, result.msg));
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

var __createFromOldSys = function (body, cookies) {
    return new Promise(function (resolve, reject) {
        var url = config.oldSiteHost + "/Comment/AddReview";
        var options = {
            url: url,
            method: 'POST',
            body: body,
            json: true,
            headers: {
                'Cookie': cookies
            }
        };

        request(options, function (err, response, body) {
            if (err) {
                reject(err);
            } else {
                if (body.IsSuccess) {
                    resolve(true);
                } else {
                    reject(new RpcError("128000", body.Message));
                }
            }
        });
    });
};

var __fetchPageInfo = function (insuranceSlipsId) {
    return new Promise(function (resolve, reject) {
        channel.getProductCommentsPageInfo([insuranceSlipsId], function (result) {
            if (0 === result.code) {
                var record = result.data;

                if (record && record.companyLogo) {
                    record.companyLogo = utils.formatUrlToSupportHttps(record.companyLogo);
                }

                if (record && record.satisfaction && record.satisfaction.satisfaction === '0%') {
                    record.satisfaction.satisfaction = '100%';
                }
                
                resolve(record);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

module.exports = {
    feedback: __feedback,
    list: __list,
    create: __create,
    update: __update,
    remove: __remove,
    count: __count,
    allCount: __allCount,
    createFromOldSys: __createFromOldSys,
    fetchPageInfo: __fetchPageInfo
};
