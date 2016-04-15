var express = require('express');
var router = express.Router();
var channel = require('../lib/channel-api');
var CommentService = require('../services/comment-service');
var ProductService = require('../services/product-service');
var _ = require('lodash');
var pub = require('../lib/public');
var constants = require('../lib/constants');
var myData = require('../lib/product-data'); //静态数据
var DataError = require('../lib/data-error');
var qr = require('qr-image');
var Util = require('util');

router.get(/^\/detail-(\d+)\.html$/, function(req, res, next) {
    var id = parseInt(req.params[0]);
    var pId = req.query.DProtectPlanId;
    if (req.query.dev === 'true') {
        next();
    }
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
        return Promise.all(_.map(rules, function(rule) {
                return ProductService.fetchDefaultRestrictRule(rule);
            }))
            .then(function(records) {
                return {
                    key: "restrictRules",
                    data: records
                };
            });
    };

    // 获取右侧信息
    var fetchRightInfo = function(productId, planId) {
        return new Promise(function(resolve, reject) {
            channel.getProductRightInfo([productId, planId], function(result) {
                if (result.code === 0) {
                    resolve({
                        key: "right",
                        data: result.data || {}
                    });
                } else {
                    reject(new DataError(result.code));
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
                    reject(new DataError(result.code));
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
                    reject(new DataError(result.code));
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
                    reject(new DataError(result.code));
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
                    reject(new DataError(result.code));
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
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function(records) {
        var result = _.mapValues(_.keyBy(records, 'key'), function(record) {
            return record.data;
        });

        var RenderTrial = require('../lib/trial');

        var planList = result.security.planList || [];
        var restrictRules = result.restrictRules || [];
        var restrictRulesResult = [];
        var renderProtectRulesResult = [];
        var productPlanName = planList[0].planName || '';
        //多个计划
        restrictRules.forEach(function(item, i) {
            var trail = new RenderTrial({
                data: result,
                renderData: item
            });
            var style = 'hidden';
            if (pId) {
                if (planList[i].planId === +pId) {
                    style = '';
                    productPlanName = planList[i].planName || '';
                }
            } else {
                if (!i) {
                    style = '';
                }
            }

            restrictRulesResult.push('<div class="trail-genes-list ' + style + '">');
            restrictRulesResult.push(trail.renderGenes());
            restrictRulesResult.push('</div>');
            renderProtectRulesResult.push('<div class="trial-protect-list ' + style + '">');
            renderProtectRulesResult.push(trail.renderProtect());
            renderProtectRulesResult.push('</div>');
        });

        var obj = {
            layout: 'layout/page/layout',
            title: '慧择主站详情页',
            data: result,
            planId: pId,
            productPlanName: productPlanName, //默认计划名
            myData: JSON.stringify(result),
            jsName: "product",
            restrictRuleHTML: restrictRulesResult.join(''), //试算因子HTML
            renderProtectHTML: renderProtectRulesResult.join('') //保障HTML
        };

        if (req.query.debug) {
            res.send(result);
            // res.status(200)
            //     .send({status: "00000", result: result, message: ""})
            //     .end();
        } else {
            res.render('product/detail', pub.renderData(obj));
        }
    };

    var handleError = function(error) {
        console.log(error);
        next(error);
    };

    fetchSecurity(id)
        .then(function(result) {
            var record = result.data;

            var plan;
            if (pId) {
                plan = _.keyBy(record.planList, 'planId')[pId.toString()];
            } else {
                plan = record.planList[0];
            }

            var restrictRules = _.map(record.planList, function(_plan) {
                return {
                    productId: record.productId,
                    planId: _plan.planId,
                    baseProductId: record.baseProductId,
                    basePlanId: _plan.basePlanId
                };
            });

            return Promise.all([
                    fetchDefaultRestrictRules(restrictRules),
                    fetchRightInfo(record.productId, plan.planId),
                    fetchAnalysis(plan.planId),
                    fetchClaimsSettlementGuide(plan.planId),
                    fetchFAQ(plan.planId),
                    fetchComments(record.productId),
                    fetchMarketingStrategy(plan.planId),
                    fetchRecommendProgram(plan.planId)
                ])
                .then(function(results) {
                    results.push(result);
                    return results;
                });
        })
        .then(sendResponse)
        .catch(handleError);
});

router.get(/^\/detail-(\d+)\.html$/, function(req, res, next) {

    var RenderTrial = require('../lib/trial');
    var result = myData;
    var trail = new RenderTrial({
        renderData: result.restrictRule
    });
    var obj = {
        layout: 'layout/page/layout',
        title: '慧择主站详情页',
        data: result,
        jsName: "product",
        restrictRuleHTML: '开发放到前端，加快速度' || trail.renderGenes()
    };

    if (req.query.debug) {
        res.send(result);
    } else {
        res.render('product/detail', pub.renderData(obj));
    }
});
/*
    查看产品评论
    GET /products/:id/comments?page=1&limit=10&type=0
    type: 0 全部 1 产品评论 2 理赔反馈
*/
router.get('/:id/comments', function(req, res, next) {
    var params = {
        productId: req.params.id,
        type: req.query.type || constants.COMMENTS_TYPE.ALL,
        pagination: {
            pageIndex: req.query.page || 1,
            pageSize: req.query.limit || constants.COMMENTS_PAGE_SIZE
        }
    };

    var sendResponse = function(record) {
        res.status(200)
            .send({
                status: "00000",
                result: record,
                message: ""
            });
    };

    var handleError = function(error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    CommentService.list(params)
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
        comments.type = type;

        product.feedback = feedback;
        product.comments = comments;
        product.allCount = counts;

        var result = product;

        var obj = {
            layout: 'layout/page/layout',
            title: '慧择主站所有评论页',
            data: result,
            jsName: "all-comments"
        };

        if (req.query.debug) {
            res.send(result);
        } else {
            res.render('comment/all-comment', pub.renderData(obj));
        }
    };

    var handleError = function(error) {
        console.log(error);
        next(error);
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
router.get(/^\/review-(\d+)-(\d+)-(\d+)\.html$/, function(req, res, next) {
    var id = req.params[0];
    var pId = req.params[1];
    var insuranceSlipsId = req.params[2];
    var type = req.query.type;

    var sendResponse = function(results) {
        var product = results[0];
        var feedback = results[1];
        var counts = {
            allCount: results[2]
        };

        product.planList = _.keyBy(product.planList, 'planId')[pId.toString()] || [];
        product.feedback = feedback;
        product.counts = counts;
        product.insuranceSlipsId = insuranceSlipsId;

        var obj = {
            layout: 'layout/page/layout',
            title: '慧择主站撰写评论页',
            data: product
        };

        if (req.query.debug) {
            res.send(product);
        } else {
            res.render('comment/post-comment', pub.renderData(obj));
        }
    };

    var handleError = function(error) {
        console.log(error);
        next(error);
    };

    Promise.all([
            ProductService.fetchSecurity(id),
            CommentService.feedback(id),
            CommentService.count(id, constants.COMMENTS_TYPE.ALL)
        ])
        .then(sendResponse)
        .catch(handleError);
});

/*
    发表评论
*/
router.post('/:id/comments', function(req, res, next) {
    var body = req.body;

    var sendResponse = function(record) {
        res.status(200)
            .send({
                status: "00000",
                result: record,
                message: ""
            });
    };

    var handleError = function(error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    CommentService.create(body)
        .then(sendResponse)
        .catch(handleError);
});

/*
    修改评论
*/
router.put('/:id/comments/:commentId', function(req, res, next) {
    var body = req.body;

    var sendResponse = function(record) {
        res.status(200)
            .send({
                status: "00000",
                result: record,
                message: ""
            });
    };

    var handleError = function(error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    CommentService.update(body)
        .then(sendResponse)
        .catch(handleError);
});

// 删除评论
router.delete('/:id/comments/:commentId', function(req, res, next) {
    var commentId = req.params.commentId;
    // var userId = req.session.user.id;
    var userId = 247744;

    var sendResponse = function(record) {
        res.status(200)
            .send({
                status: "00000",
                result: true,
                message: ""
            });
    };

    var handleError = function(error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    CommentService.remove(commentId, userId)
        .then(sendResponse)
        .catch(handleError);
});

// 试算接口
router.post('/:id/restrict-rule', function(req, res, next) {
    var body = req.body;
    body = JSON.parse(body.data);

    var tryCalcuate = function(params) {
        return new Promise(function(resolve, reject) {
            channel.getProductRestrictRule([body], function(result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function(record) {
        res.status(200)
            .send({
                status: "00000",
                result: record,
                message: ""
            });
    };

    var handleError = function(error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    tryCalcuate(body)
        .then(sendResponse)
        .catch(handleError);
});

// 产品对比
router.post('/comparison', function(req, res, next) {
    var planIds = JSON.parse(req.body.data);

    var sendResponse = function(record) {
        res.status(200)
            .send({
                status: "00000",
                result: record,
                message: ""
            });
    };

    var handleError = function(error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    ProductService.compareProducts(planIds)
        .then(sendResponse)
        .catch(handleError);
});

// 计划对比
router.post('/plans-comparison', function(req, res, next) {
    var planIds = JSON.parse(req.body.data);

    var compare = function(_planIds) {
        return new Promise(function(resolve, reject) {
            channel.compareProductPlans([_planIds], function(result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function(record) {
        res.status(200)
            .send({
                status: "00000",
                result: record,
                message: ""
            });
    };

    var handleError = function(error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    compare(planIds)
        .then(sendResponse)
        .catch(handleError);
});

// 投保填写页
router.get('/insure', function(req, res, next) {
    var obj = {
        layout: 'layout/page/layout-insure',
        jsName: 'insure-hz',
        title: '填写页面'
    };
    res.render('insure/insure', pub.renderData(obj));
});
router.post('/insure-page', function(req, res, next) {
    var body = req.body;

    var fetchAttrs = function(params) {
        return new Promise(function(resolve, reject) {
            channel.getInsurePage([params], function(result) {
                if (result.code === 0) {
                    resolve(result.data);
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function(record) {
        res.status(200)
            .send({
                status: "00000",
                result: record,
                message: ""
            });
    };

    var handleError = function(error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    fetchAttrs(body)
        .then(sendResponse)
        .catch(handleError);
});

router.post('/plans/list', function(req, res, next) {
    var planIds = JSON.parse(req.body.data);

    var sendResponse = function(record) {
        res.status(200)
            .send({
                status: "00000",
                result: record,
                message: ""
            });
    };

    var handleError = function(error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    ProductService.fetchPlansInfo(planIds)
        .then(sendResponse)
        .catch(handleError);
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
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function(record) {
        var obj = {
            layout: 'layout/page/layout',
            title: '惠泽职业类别',
            data: record,
            jsName: "job"
        };
        res.render('search/job', pub.renderData(obj));
    };

    var handleError = function(error) {
        console.log(error);
        next(error);
    };

    fetchOccupationalCategories(productId)
        .then(sendResponse)
        .catch(handleError);
});

router.get('/:id/qrcode', function(req, res, next) {
    var productId = req.params.id;
    var planId = req.query.planId;

    var url = Util.format('http://www.huize.com/product/detail-%d.html', productId);

    if (planId) {
        url = url + '?DProtectPlanId=' + planId;
    }

    var qrcode = qr.image(url);

    res.type('png');
    qrcode.pipe(res);
});

module.exports = router;