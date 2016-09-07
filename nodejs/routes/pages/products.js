var express = require('express');
var _ = require('lodash');
var qr = require('qr-image');
var Util = require('util');
var router = express.Router();
var channel = require('../../lib/rpc/channel-api');
var CommentService = require('../../lib/services/comment-service');
var ProductService = require('../../lib/services/product-service');
var InsuranceSlipsService = require('../../lib/services/insurance-slips-service');
var pub = require('../../lib/public');
var constants = require('../../lib/constants');
var RpcError = require('../../lib/errors/rpc');
var NotFoundError = require('../../lib/errors/not-found');
var policies = require('../../lib/policies');
var logger = require('../../lib/log').logger;
var utils = require('../../lib/utils');
var pLogger = require('../../lib/log').performanceLogger;
var Validator = require('../../lib/validator');

// 产品详情页
router.get(/^\/detail-(\d+)\.html$/, function(req, res, next) {
    var id = parseInt(req.params[0]);
    var pId = req.query.DProtectPlanId;
    var pName = '',
        pSimpleDescription = '';

    // 获取保障详情
    var fetchSecurity = function(productId) {
        return ProductService.fetchSecurity(productId)
            .then(function(record) {
                return {
                    key: "security",
                    data: record
                };
            });
    };

    // 获取默认试算
    var fetchDefaultRestrictRules = function(rules) {
        return ProductService.fetchDefaultRestrictRule(rules[0])
            .then(function(record) {
                return {
                    key: "restrictRules",
                    data: [record]
                };
            });
    };

    // 获取右侧信息
    var fetchRightInfo = function(productId, planId) {
        return new Promise(function(resolve, reject) {
            channel.getProductRightInfo([productId, planId], function(result) {
                if (result.code === 0) {
                    if ('0%' === result.data.satisfaction) {
                        result.data.satisfaction = '100%';
                    }
                    resolve({
                        key: "right",
                        data: result.data || {}
                    });
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    // 获取产品解读
    var fetchAnalysis = function(planId) {
        return new Promise(function(resolve, reject) {
            channel.getProductAnalysis([planId], function(result) {
                if (result.code === 0) {
                    resolve({
                        key: "analysis",
                        data: result.data || ""
                    });
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    // 获取理赔指引
    var fetchClaimsSettlementGuide = function(planId) {
        return new Promise(function(resolve, reject) {
            channel.getClaimsSettlementGuide([planId], function(result) {
                if (result.code === 0) {
                    resolve({
                        key: "claimsSettlementGuide",
                        data: result.data || {}
                    });
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    // 获取常见问题
    var fetchFAQ = function(planId) {
        return new Promise(function(resolve, reject) {
            channel.getProductFAQ([planId], function(result) {
                if (result.code === 0) {
                    resolve({
                        key: "faq",
                        data: result.data || []
                    });
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    // 获取产品评论
    var fetchComments = function(productId) {
        var params = {
            productId: productId,
            pagination: {
                pageIndex: 1,
                pageSize: constants.COMMENTS_PAGE_SIZE
            }
        };

        return Promise.all([
                CommentService.feedback(params.productId),
                CommentService.list(_.assign(params, {
                    type: 0
                })),
                CommentService.list(_.assign(params, {
                    type: 1
                })),
                CommentService.list(_.assign(params, {
                    type: 2
                }))
            ])
            .then(function(records) {
                return {
                    key: "comments",
                    data: {
                        feedback: records[0],
                        data: _.tail(records)
                    }
                };
            });
    };

    // 获取产品营销策略
    var fetchMarketingStrategy = function(planId) {
        return new Promise(function(resolve, reject) {
            channel.getProductInsidePayment([planId], function(result) {
                if (result.code === 0) {
                    resolve({
                        key: "marketingStrategy",
                        data: result.data || []
                    });
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    // 获取推荐组合
    var fetchRecommendProgram = function(planId) {
        return new Promise(function(resolve, reject) {
            channel.getProductRecommendProgram([planId], function(result) {
                if (result.code === 0) {
                    resolve({
                        key: "recommendProgram",
                        data: result.data || []
                    });
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    // 获取典型案例
    var fetchTypicalCases = function(planId) {
        return new Promise(function(resolve, reject) {
            channel.getProductTypicalCases([planId], function(result) {
                if (0 === result.code) {
                    resolve({
                        key: "typicalCases",
                        data: result.data || ''
                    });
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    var sendResponse = function(records) {
        var result = _.mapValues(_.keyBy(records, 'key'), function(record) {
            return record.data;
        });

        var RenderTrial = require('../../lib/trial');

        var planList = result.security.planList || [];
        var restrictRules = result.restrictRules || [];
        var restrictRulesResult = [];
        var renderProtectRulesResult = [];
        var productPlanName = planList[0].planName || '';
        var security = result.security;

        restrictRules = restrictRules[0];
        //多个计划
        // restrictRules.forEach(function(item, i) {

        // });

        var trail = new RenderTrial({
            data: result,
            productId: id,
            productPlanId: security.planId,
            renderData: restrictRules
        });
        var style = '';
        if (pId) {
            if (planList[0].planId === +pId) {
                style = '';
                productPlanName = planList[0].planName || '';
            }
        }

        restrictRulesResult.push('<div class="trail-genes-list ' + style + '">');
        restrictRulesResult.push(trail.renderGenes());
        restrictRulesResult.push('</div>');
        renderProtectRulesResult.push('<div class="trial-protect-list ' + style + '">');
        renderProtectRulesResult.push(trail.renderProtect());
        renderProtectRulesResult.push('</div>');

        var title = Util.format('%s - %s%s ', result.security.productName,
            result.security.companySimpleName, result.security.parentCategoryName);
        var keywords = Util.format('%s, %s%s', result.security.productName,
            result.security.companySimpleName, result.security.parentCategoryName);
        var description = Util.format('%s %s', result.security.productName, pSimpleDescription);

        if (req.query.debug) {
            //res.send(trail.renderGenes());
            res.send(result);
        } else {
            var obj = {
                layout: 'layout/page/layout',
                title: utils.formatPageTitle(title),
                keyword: keywords,
                description: 　description,
                data: result,
                planId: pId,
                dev: req.query.dev,
                productPlanName: productPlanName, //默认计划名
                jsName: "product",
                restrictRuleHTML: restrictRulesResult.join(''), //试算因子HTML
                renderProtectHTML: renderProtectRulesResult.join('') //保障HTML
            };

            // res.render('product/detail', pub.renderData(obj));
            res.renderNormal('product/detail', obj);
        }
    };

    var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        if (error instanceof NotFoundError) {
            next();
        } else {
            next(error);
        }
    };

    fetchSecurity(id)
        .then(function(result) {
            var record = result.data;

            if (!record.planList || record.planList.length === 0) {
                throw new NotFoundError();
            }

            var plan;
            if (pId) {
                plan = _.keyBy(record.planList, 'planId')[pId.toString()];
                if (!plan) {
                    throw new NotFoundError();
                }
            } else {
                plan = record.planList[0];
            }

            record.planId = plan.planId;
            pName = plan.planName;
            pSimpleDescription = plan.shortDescription || '';

            var restrictRules = [{
                productId: record.productId,
                planId: plan.planId,
                baseProductId: record.baseProductId,
                basePlanId: plan.basePlanId
            }];
            return Promise.all([
                    fetchDefaultRestrictRules(restrictRules),
                    fetchRightInfo(record.productId, plan.planId),
                    fetchAnalysis(plan.planId),
                    fetchClaimsSettlementGuide(plan.planId),
                    fetchFAQ(plan.planId),
                    fetchComments(record.productId),
                    fetchMarketingStrategy(plan.planId),
                    fetchRecommendProgram(plan.planId),
                    fetchTypicalCases(plan.planId)
                ])
                .then(function(results) {
                    results.push(result);
                    return results;
                });
        })
        .then(sendResponse)
        .catch(handleError);
});

// 所有评论页
// http://www.hzins.com/product/prodreview/showlist840-1.html
router.get(/^\/prodreview\/showlist(\d+)-(\d+)\.html$/, function(req, res, next) {
    var id = parseInt(req.params[0]);
    var page = parseInt(req.params[1]);
    var type = parseInt(req.query.type || constants.COMMENTS_TYPE.ALL);

    var params = {
        productId: id,
        type: type,
        pagination: {
            pageIndex: page,
            pageSize: req.query.limit || constants.COMMENTS_PAGE_SIZE
        }
    };

    var sendResponse = function(results) {
        var product = results[0];
        var feedback = results[1];
        var comments = results[2];
        var counts = results[3];

        if (!product.planList || product.planList.length === 0) {
            throw new NotFoundError();
        }

        comments.type = type;

        product.feedback = feedback;
        product.comments = comments;
        product.allCount = counts;

        var result = product;
        var title = Util.format('%s购买问题 - %s问题', result.productName, result.parentCategoryName);
        var description = Util.format('关于%s所有问题, 包括%s购买问题, %s理赔问题', result.productName, result.productName, result.productName);

        var obj = {
            layout: 'layout/page/layout',
            title: utils.formatPageTitle(title),
            keyword: result.productName,
            description: description,
            data: result,
            jsName: "all-comments"
        };

        if (req.query.debug) {
            res.send(result);
        } else {
            // res.render('comment/all-comment', pub.renderData(obj));
            res.renderNormal('comment/all-comment', obj);
        }
    };

    var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        if (error instanceof NotFoundError) {
            next();
        } else {
            next(error);
        }
    };

    Promise.all([
            ProductService.fetchSecurity(id),
            CommentService.feedback(id),
            CommentService.list(params),
            CommentService.allCount(id)
        ])
        .then(sendResponse)
        .catch(handleError);
});

// 撰写产品评论
// http://www.hzins.com/product/review-1010-1046-15111224631288.html?type=pl
router.get(/^\/review-(\d+)-(\d+)-(\d+)\.html$/, policies.loginAuthWithRedirect);
router.get(/^\/review-(\d+)-(\d+)-(\d+)\.html$/, function(req, res, next) {
    var id = req.params[0];
    var pId = req.params[1];
    var insuranceSlipsId = +req.params[2];
    var type = req.query.type;

    var sendResponse = function(record) {
        if (!record) {
            throw new NotFoundError();
        }

        record.insuranceSlipsId = insuranceSlipsId;
        var obj = {
            layout: 'layout/page/layout',
            title: utils.formatPageTitle('评论提交'),
            data: record,
            jsName: "post-comment"
        };

        // if (req.query.debug) {
        //     res.send(product);
        // } else {
        //     // res.render('comment/post-comment', pub.renderData(obj));
        //     res.renderNormal('comment/post-comment', obj);
        // }
        res.renderNormal('comment/post-comment', obj);
    };

    var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        if (error instanceof NotFoundError) {
            next();
        } else {
            next(error);
        }
    };

    CommentService.fetchPageInfo(insuranceSlipsId)
        .then(sendResponse)
        .catch(handleError);
});

// 投保填写页
router.get('/insure', policies.loginAuthWithRedirect);
router.get('/insure', function(req, res, next) {
    var insureNumber = req.query.insureNumber;

    if (!insureNumber) {
        next();
        return;
    }

    var obj = {
        layout: 'layout/page/layout-insure',
        jsName: 'insure-hz',
        title: utils.formatPageTitle('保单填写'),
        insureNumber: insureNumber
    };

    // res.render('insure/insure', pub.renderData(obj));
    res.renderNormal('insure/insure', pub.renderData(obj));
});

// 职业类别页面渲染
// http://www.huize.com/product/dialog/job-332-0.html
router.get(/^\/dialog\/job-(\d+)-(\d+)\.html$/, function(req, res, next) {
    var productId = parseInt(req.params[0] || 0);

    var fetchOccupationalCategories = function(_productId) {
        return new Promise(function(resolve, reject) {
            channel.getProductOccupationalCategories([_productId], function(result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };

    var sendResponse = function(record) {
        if (record.length === 0) {
            throw new NotFoundError();
        }

        var obj = {
            layout: 'layout/page/layout',
            title: utils.formatPageTitle('职业类别'),
            data: record,
            jsName: "job"
        };

        // res.render('search/job', pub.renderData(obj));
        res.renderNormal('search/job', obj);
    };

    var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        if (error instanceof NotFoundError) {
            next();
        } else {
            next(error);
        }
    };

    Promise.all([
            ProductService.fetchSecurity(productId),
            fetchOccupationalCategories(productId),
            ProductService.fetchAllCategories(),
        ])
        .then(function(results) {
            var product = results[0];
            var jobs = results[1];
            var categories = results[2];

            if (!product) {
                throw new NotFoundError();
            }

            return {
                product: _.omit(product, 'planList'),
                jobs: jobs,
                categories: categories
            };
        })
        .then(sendResponse)
        .catch(handleError);
});

// 健康告知页面
router.get('/insure/health-inform', policies.loginAuthWithRedirect);
router.get('/insure/health-inform', function(req, res, next) {
    var id = req.query.insuranceNum;

    if (!id) {
        next();
        return;
    }

    var sendResponse = function(record) {
        var obj = {
            layout: 'layout/page/layout-shopcar',
            title: utils.formatPageTitle('健康告知'),
            jsName: "health-inform",
            data: record,
            curStep: 2
        };

        // res.render('health/health-inform', pub.renderData(obj));
        res.renderNormal('health/health-inform', obj);
    };

    var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
        next(error);
    };

    InsuranceSlipsService.fetchHealthInform(id)
        .then(sendResponse)
        .catch(handleError);
});

// 产品列表页
router.get(/^\/ins-(\d+)-(\d+)-(.*)$/, function(req, res, next) {
    var subCategoryId = req.params[0];
    var companyId = req.params[1];
    var queryKeys = req.params[2].split('-')[0];
    var genes = req.params[2].split('-')[1];
    var filter = req.query.filter;
    var sort = req.query.sort;
    var page = req.query.page || 1;
    var isAgeGenes = req.query.ageGenes ? true : false;
    var parentKeywords = "";
    var makeQueryParams = function() {
        queryKeys = queryKeys === '0' ? [] : queryKeys.split('_');
        var filterItemIdList = [];
        for (var i = 0, length = queryKeys.length; i < length; i++) {
            if (i % 2 !== 0) {
                filterItemIdList.push(+queryKeys[i]);
            }
        }

        var params = {
            insureCategoryId: +subCategoryId,
            companyId: +companyId,
            filterItemIdList: filterItemIdList,
            pageNum: +page,
            pageSize: constants.PRODUCT_LIST_PAGE_SIZE,
            platform: 1
        };

        if (genes && genes !== '0') {
            if (genes.split('_').length > 1) {
                if (+genes.split('_')[0] !== 0 || isAgeGenes) {
                    params.age = +genes.split('_')[0];
                }
            }
            if (+genes.split('_')[1]) {
                params.days = +genes.split('_')[1];
            }
        }
        if (sort) {
            params.sortValue = constants.PRODUCT_LIST_SORT[sort] || constants.PRODUCT_LIST_SORT[1];
        } else {
            params.sortValue = constants.PRODUCT_LIST_SORT[1];
        }

        if (~~filter) {
            params.sortType = +filter;
        } else { //默认排序为5 按照权重排序
            params.sortType = 5;
            params.sortValue=constants.PRODUCT_LIST_SORT[1]; //默认排序只有升序
        }

        
        return Promise.resolve(params);
    };

    var sendResponse = function(results) {
        var start = Date.now();
        var record = results[0];
        var faq = {
            question: '',
            answer: ''
        };
        faq.question = results[1][0] || '';
        faq.answer = results[1][1] || '';
        var hotSaleProducts = results[2];
        var pathNav = results[3];
        var RenderProducts = require('../../lib/product-list');
        var rederProducts = new RenderProducts({ //产品列表
            productList: record.productList
        });

        var productTDKS = require('../../lib/product-list-TDK');
        var productTdkList = productTDKS.TDKList || [];
        if (!pathNav.currentCategory) {
            throw new NotFoundError();
        }
        var title = '';
        var description = '';
        var keywords = '';
        var isMainCategory = pathNav.parentCategory ? false : true; //判断是否是大类
        var mainCategoryId = isMainCategory ? pathNav.currentCategory.id : pathNav.parentCategory.id; //大类Id
        var mainCategoryText = isMainCategory ? pathNav.currentCategory.text : pathNav.parentCategory.text;
        var smallCategoryText = pathNav.currentCategory.text || '';
        var mainCategoryTDK, defaultCategoryTDK, queryKeyName = '';
        var companyName = '';
        var isFilter = ~~companyId !== 0 || queryKeys.length > 0;

        productTdkList.forEach(function(item) {
            if (~~item.mainCategoryId === ~~mainCategoryId) {
                mainCategoryTDK = item;
                parentKeywords = item.mainCategoryKewWords || "";
            }
            if (item.mainCategoryId === -1) {
                defaultCategoryTDK = item;
            }
        });
        if (!mainCategoryTDK) { //在配置文件中未找到符合该大类的TDK的则读取默认的TDK
            mainCategoryTDK = defaultCategoryTDK;
        }
        if (isMainCategory) { //大类
            title = mainCategoryTDK.mainCategoryTtitle;
            description = mainCategoryTDK.mainCategoryDescription;
            keywords = mainCategoryTDK.mainCategoryKewWords;
        } else { //小类
            if (~~companyId !== 0 || queryKeys.length > 0) { //如果有选中某个筛选项 取筛选项的类别
                var filterItemList = record.filterItemList || [];
                var filterItemIdList = [];
                var filterNames = [];
                for (var i = 0, length = queryKeys.length; i < length; i = i + 2) { //获取筛选项名称
                    var filterList = filterItemList.filter(function(item) {
                        return item.filterTypeId === ~~queryKeys[i];
                    });
                    if (filterList && filterList.length > 0) {
                        //filterNames.push((filterList[0].filterTypeName || "").replace(/\s/g,''));
                        var selectFilterItem = filterList[0].filterItemList.filter(function(item) {
                            return item.id === ~~queryKeys[i + 1];
                        });
                        if (selectFilterItem && selectFilterItem.length > 0) {
                            var tempName = "";
                            if (/(价格)|(保额)|(保费)|(医疗)/.test(filterList[0].filterTypeName.replace(/\s/g, ""))) {
                                tempName = selectFilterItem[0].name + "【" + filterList[0].filterTypeName + "】";
                            } else {
                                tempName = selectFilterItem[0].name;
                            }
                            filterNames.push(tempName.replace(/\s/g, ''));
                        }
                    }
                }
                var companyList = record.companyList || [];
                companyList.forEach(function(item) { //获取保险公司名称
                    if (item.companyId === ~~companyId) {
                        //queryKeyName = queryKeyName + item.simpleName;
                        companyName = item.simpleName;
                    }
                });

                queryKeyName = filterNames.join('_') + queryKeyName;
                //title = defaultCategoryTDK.samllCategoryTitle;
                //description = defaultCategoryTDK.samllCategoryDescription;
                //keywords = defaultCategoryTDK.samllCategoryKewWords;
            } else {}
            var samllCateTDK;
            if (mainCategoryTDK && mainCategoryTDK.samllCategoryList) {
                mainCategoryTDK.samllCategoryList.forEach(function(item) {
                    if (~~subCategoryId === item.id) {
                        samllCateTDK = item;
                    }
                });
            }
            if (samllCateTDK) { //配置文件中有小类ID则读取小类TDK
                title = samllCateTDK.title;
                description = samllCateTDK.descript;
                keywords = samllCateTDK.keyWords;
            } else { //配置文件中不包含该小类  则读取该大类的默认小类ID
                title = mainCategoryTDK.samllCategoryTitle;
                description = mainCategoryTDK.samllCategoryDescription;
                keywords = mainCategoryTDK.samllCategoryKewWords;
            }

        }

        mainCategoryText = mainCategoryText + (mainCategoryText && mainCategoryText.indexOf('保险') < 0 ? "保险" : "");
        smallCategoryText = smallCategoryText + (smallCategoryText && !/(保险)|(保障)/.test(smallCategoryText) ? "保险" : "");
        // queryKeyName = queryKeyName;

        title = title.replace(/#筛选项分类名称#/g, queryKeyName).replace(/#保险公司#/g, companyName);
        description = description.replace(/#筛选项分类名称#/g, queryKeyName).replace(/#保险公司#/g, companyName);
        keywords = keywords.replace(/#筛选项分类名称#/g, queryKeyName).replace(/#保险公司#/g, companyName);

        title = title.replace(/#一级分类名称#/g, mainCategoryText).replace(/#二级分类名称#/g, smallCategoryText);
        description = description.replace(/#一级分类名称#/g, mainCategoryText).replace(/#二级分类名称#/g, smallCategoryText);
        keywords = keywords.replace(/#一级分类名称#/g, mainCategoryText).replace(/#二级分类名称#/g, smallCategoryText);
        keywords = !isMainCategory ? parentKeywords + "," + keywords : keywords;
        var filterKeywordsFxied = (companyName ? companyName + "_" : "") + queryKeyName;
        smallCategoryText = smallCategoryText.replace(/(保障)|(保险)$/, function(key) {
            if (key) return key;
            else return "保险";
        });
        mainCategoryText = mainCategoryText.replace(/(保障)|(保险)$/, function(key) {
            if (key) return key;
            else return "保险";
        });
        filterKeywordsFxied = filterKeywordsFxied ? filterKeywordsFxied.replace(/_$/, "") + '_' + smallCategoryText : "";
        var pageTitle = filterKeywordsFxied ? filterKeywordsFxied + "_" + mainCategoryText + "_线上投保购买-慧择保险网" : filterKeywordsFxied + smallCategoryText + "_" + mainCategoryText + "_线上投保购买-慧择保险网";
        if (isFilter) {
            title = pageTitle;
            description = pageTitle + "多种个性化" + mainCategoryText + "产品，详细解答" + mainCategoryText + "怎么买，更有24小时的保险专业指导。";
        }
        var obj = {
            layout: 'layout/page/layout-product-list',
            data: record,
            subCategory: subCategoryId,
            companyId: companyId,
            queryKeys: queryKeys.length > 0 ? queryKeys.join('_') : "0",
            genes: genes || "0",
            productListHtml: rederProducts.renderProductsList(),
            productGuide: faq,
            pathNav: pathNav,
            hotSaleProducts: hotSaleProducts,
            sortType: sort,
            filter: filter,
            pageIndex: page,
            title: title,
            isAgeGenes: isAgeGenes,
            keyword: keywords,
            description: description,
            queryKeyName: filterKeywordsFxied,
            jsName: 'product-list'
        };
        pLogger.info('start[%s] time[%s] tag[nodejs#%s]', start, Date.now() - start, 'productList');
        // res.render('product-list/filter-list', pub.renderData(obj));
        res.renderNormal('product-list/filter-list', obj);
    };

    var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        if (error instanceof NotFoundError) {
            next();
        } else {
            next(error);
        }
    };

    makeQueryParams()
        .then(function(params) {
            return Promise.all([
                ProductService.find(params),
                ProductService.fetchCategoryFAQ(params.insureCategoryId + ''),
                ProductService.fetchRecommendsByCategory(params.insureCategoryId + ''),
                //ProductService.fetchRecommendsByCategory('888'),
                ProductService.fetchPagePathNav(params.insureCategoryId + ''),
                //ProductService.fetchChindrenCategories(params.insureCategoryId + '')
            ]);
        })
        .then(sendResponse)
        .catch(handleError);
});

module.exports = router;