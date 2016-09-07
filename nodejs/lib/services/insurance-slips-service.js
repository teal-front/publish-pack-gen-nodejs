var channel = require('../rpc/channel-api');
var RpcError = require('../errors/rpc');

var __create = function (insurance) {
    return new Promise(function (resolve, reject) {
        channel.createInsuranceSlips([insurance], function (result) { 
            if (result.code === 0 ) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __update = function (insurance) {
    return new Promise(function (resolve, reject) {
        channel.updateInsuranceSlips([insurance], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __queryById = function (userId, insuranceSlipId) {
    return new Promise(function (resolve, reject) {
            channel.getInsuranceSlipsById([insuranceSlipId, userId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
};

var __fetchHealthInform = function (insuranceSlipId) {
    return new Promise(function(resolve, reject) {
        channel.getHealthInformByInsuranceSlipId([insuranceSlipId], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __saveHealthInform = function (insuranceSlipId, answer) {
    return new Promise(function(resolve, reject) {
        channel.saveHealthInform([insuranceSlipId, answer], function (result) {
            if (result.code === 0) {
                resolve(result.data || '');
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __updateStartDate = function (params) {
    return new Promise(function (resolve, reject) {
        channel.updatetInsuranceSlipsStartDate([params.userId, params.insureNum, params.startDate], function (result) {
            if (result.code === 0) {
                resolve(result.data || false);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __calculateAmount = function (params) {
    return new Promise(function (resolve, reject) {
        channel.calculateInsuranceSlipsAmount([params], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchInsurancePageData = function (params) {
    return new Promise(function (resolve, reject) {
        channel.getInsurePage([params], function (result) {
            if (result.code === 0) {
                if (result.data && result.data.product) {
                    result.data.product.operationProductId = params.productId;
                    result.data.product.planId = params.planId;params.basePlanId;
                    result.data.product.operationPlanId = params.planId;
                }
                
                resolve(result.data);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchInsuredOfRenewal = function (renewalNum) {
    return new Promise(function (resolve, reject) {
        channel.getInsuredOfRenewal([renewalNum], function (result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __isReady = function (insuranceSlipId) {
    return new Promise(function (resolve, reject) {
        channel.checkInsuranceSlipsIsReady([insuranceSlipId], function (result) {
            if (result.code === 0) {
                resolve(result.data || false);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });      
    });
};

var __fetchRestrictRule = function (params) {
    return new Promise(function (resolve, reject) {
        channel.getInsuranceRestrictRule([params], function (result) {
            if (0 === result.code) {
                resolve(result.data);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

module.exports = {
    create: __create,
    update: __update,
    queryById: __queryById,
    fetchHealthInform: __fetchHealthInform,
    saveHealthInform: __saveHealthInform,
    updateStartDate: __updateStartDate,
    calculateAmount: __calculateAmount,
    fetchInsurancePageData: __fetchInsurancePageData,
    fetchInsuredOfRenewal: __fetchInsuredOfRenewal,
    isReady: __isReady,
    fetchRestrictRule: __fetchRestrictRule
};