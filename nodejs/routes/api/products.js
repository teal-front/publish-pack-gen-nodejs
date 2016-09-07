var express = require('express');
var router = express.Router();
var Util = require('util');
var _ = require('lodash');
var qr = require('qr-image');
var xss = require('xss');
var querystring = require('querystring');
var channel = require('../../lib/rpc/channel-api');
var CommentService = require('../../lib/services/comment-service');
var ProductService = require('../../lib/services/product-service');
var constants = require('../../lib/constants');
var RpcError = require('../../lib/errors/rpc');
var NotFoundError = require('../../lib/errors/not-found');
var policies = require('../../lib/policies');
var Validator = require('../../lib/validator');
var utils = require('../../lib/utils');
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

    CommentService.list(params)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 发表评论
router.post('/comments', policies.loginAuth);
router.post('/comments', function (req, res, next) {
    var body = JSON.parse(req.body.data);

    CommentService.createFromOldSys(body, req.headers.cookie)
        .then(res.sendNormal)
        .catch(res.sendError);
});


// 修改评论
router.put('/:id/comments/:commentId', policies.loginAuth);
router.put('/:id/comments/:commentId', function (req, res, next) {
    var body = req.body;

    CommentService.update(body)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 删除评论
router.delete('/:id/comments/:commentId', policies.loginAuth);
router.delete('/:id/comments/:commentId', function(req, res, next) {
    var commentId = req.params.commentId;
    var userId = req.session.user.id;

    CommentService.remove(commentId, userId)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 试算接口
router.post('/:id/restrict-rule', function(req, res, next) {
    var body = req.body.data;

    var tryCalculate = function(params) {
        return new Promise(function(resolve, reject) {
            channel.getProductRestrictRule([body], function(result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            result = xss(querystring.unescape(result), {
                whiteList: []
            });
            body = JSON.parse(result);
            return body;
        })
        .then(tryCalculate)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 产品对比
router.post('/comparison', function(req, res, next) {
    var planIds = req.body.data;

    new Validator(planIds).isNotEmpty().isString().validate()
        .then(function (result) {
            planIds = JSON.parse(result);
            
            return planIds;
        })
        .then(ProductService.compareProducts)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 计划对比
router.post('/plans-comparison', function(req, res, next) {
    var planIds = req.body.data;

    var compare = function(_planIds) {
        return new Promise(function(resolve, reject) {
            channel.compareProductPlans([_planIds], function(result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    new Validator(planIds).isNotEmpty().isString().validate()
        .then(function (result) {
            planIds = JSON.parse(result);
            
            return planIds;
        })
        .then(compare)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 获取计划信息
router.post('/plans/list', function(req, res, next) {
    var planIds = req.body.data;
    
    new Validator(planIds).isNotEmpty().isString().validate()
        .then(function (result) {
            planIds = JSON.parse(result);
            
            return planIds;
        })
        .then(ProductService.fetchPlansInfo)
        .then(function (records) {
            records.forEach(function (record) {
                record.planSmallImg = utils.formatUrlToSupportHttps(record.planSmallImg);
                record.planBigImg = utils.formatUrlToSupportHttps(record.planBigImg);
            });

            return records;
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 生成产品分享二维码
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

// 获取所有产品分类信息
router.get('/categories', function (req, res, next) {
    ProductService.fetchAllCategories()
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 获取产品出单状态
router.get('/:id/issuing-state', function (req, res, next) {
    var productId = req.params.id;
    
    new Validator(productId).isNotEmpty().isNumber().validate()
        .then(ProductService.fetchIssuingState)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 通过计划获取相似的产品
router.get('/plans/:id/similar', function (req, res, next) {
    var planId = req.params.id;

    new Validator(planId).isNotEmpty().isNumber().validate()
        .then(ProductService.fetchSimilarProduct)
        .then(res.sendNormal)
        .catch(res.sendError);
});

module.exports = router;