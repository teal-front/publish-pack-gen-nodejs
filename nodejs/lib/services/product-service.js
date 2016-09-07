var channel = require('../rpc/channel-api');
var RpcError = require('../errors/rpc');

var __fetchSecurity = function (productId) {
    return new Promise(function(resolve, reject) {
        channel.getProductSecurity([productId], function(result) {
            if (result.code === 0) {
                resolve(result.data || {});
            } else {
                reject(new RpcError(result.code, result.msg));
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
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __compareProducts = function (planIds) {
    return new Promise(function(resolve, reject) {
        channel.compareProducts([planIds], function(result) {
            if (result.code === 0) {
                var records = result.data || [];
                records.forEach(function (record) {
                    if ('0%' === record.satisfaction) {
                        record.satisfaction = '100%';
                    }
                });
                resolve(records);
            } else {
                reject(new RpcError(result.code, result.msg));
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
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchAllCategories = function () {
    return new Promise(function (resolve, reject) {
        channel.getAllProductsCategories([], function (result) {
            if (result.code === 0) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchIssuingState = function (productId) {
    return new Promise(function (resolve, reject) {
        channel.getProductIssuingState([productId], function (result) {
            if (result.code === 0) {
                resolve(result.data || {
                    orderStatus: 0
                });
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchSimilarProduct = function (planId) {
    return new Promise(function (resolve, reject) {
        channel.getSimilarProductByPlan([planId], function (result) {
            if (0 === result.code) {
                resolve(result.data);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __find = function (params) {
    return new Promise(function (resolve, reject) {
        channel.getProductList([params], function (result) {
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchCategoryFAQ = function (categoryId) {
    return new Promise(function (resolve, reject) {
        channel.getProductCategoryFAQ([categoryId], function (result) {
            if (0 === result.code) {
                resolve(result.data || '');
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchRecommendsByCategory = function (categoryId) {
    return new Promise(function (resolve, reject) {
        channel.getRecommendProductsByCategory([categoryId], function (result) {
            if (0 === result.code) {
                resolve(result.data || '[{}]');
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchTopsByCategory = function (categoryId) {
	return new Promise(function (resolve, reject) {
		channel.getTopProductsByCategory([categoryId], function (result) {
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
	});
};

var __fetchPagePathNav = function (categoryId) {
    return new Promise(function (resolve, reject) {
        channel.getPagePathNav([categoryId], function (result) {
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchChindrenCategories = function (categoryId) {
    return new Promise(function (resolve, reject) {
        channel.getChindrenCategories([categoryId], function (result) {
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchIndexPageImages = function () {
	return new Promise(function (resolve, reject) {
		channel.getIndexPageImages([], function (result) {
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
	});
};

var __fetchRecommendNews = function (size) {
	return new Promise(function (resolve, reject) {
		channel.getRecommendNews([size], function (result) {
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
	});
};

var __fetchGetProductCategoryTree = function(){
    return new Promise(function(resolve,reject){
        channel.getProductCategoryTree([], function(result){
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetPcProductResult=function(params){
    return new Promise(function(resolve,reject){
        channel.getPcProductResult(params, function(result){
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchGetProductBrowseRunkingList = function(params){
    return new Promise(function(resolve,reject){
        channel.getProductBrowseRunkingList(params, function(result){
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchGetProductShellRunkingList = function(params){
    return new Promise(function(resolve,reject){
        channel.getProductShellRunkingList(params, function(result){
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchGetProductCommentList = function(params){
    return new Promise(function(resolve,reject){
        channel.getProductCommentList(params, function(result){
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchGetArticles = function(params){
    return new Promise(function(resolve,reject){
        channel.getArticles(params, function(result){
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
    });
};

var __fetchIndexFriendlyLinks = function () {
	return new Promise(function (resolve, reject) {
		channel.getFriendlyLinks([], function (result) {
            if (0 === result.code) {
                resolve(result.data || []);
            } else {
                reject(new RpcError(result.code, result.msg));
            }
        });
	});
};

module.exports = {
    fetchSecurity: __fetchSecurity,
    fetchDefaultRestrictRule: __fetchDefaultRestrictRule,
    compareProducts: __compareProducts,
    fetchPlansInfo: __fetchPlansInfo,
    fetchAllCategories: __fetchAllCategories,
    fetchIssuingState: __fetchIssuingState,
    fetchSimilarProduct: __fetchSimilarProduct,
    find: __find,
    fetchCategoryFAQ: __fetchCategoryFAQ,
    fetchRecommendsByCategory: __fetchRecommendsByCategory,
	fetchTopsByCategory: __fetchTopsByCategory,
    fetchPagePathNav:__fetchPagePathNav,
    fetchChindrenCategories:__fetchChindrenCategories,
	fetchIndexPageImages: __fetchIndexPageImages,
	fetchRecommendNews: __fetchRecommendNews,
    fetchGetProductCategoryTree : __fetchGetProductCategoryTree,
    fetchPcProductResult:__fetPcProductResult,
    fetchGetProductBrowseRunkingList : __fetchGetProductBrowseRunkingList,
    fetchGetProductShellRunkingList : __fetchGetProductShellRunkingList,
    fetchGetProductCommentList : __fetchGetProductCommentList,
    fetchGetArticles : __fetchGetArticles,
	fetchIndexFriendlyLinks: __fetchIndexFriendlyLinks
};
