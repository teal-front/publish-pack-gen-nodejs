var express = require('express');
var router = express.Router();
var _ = require('lodash');
var xss = require('xss');
var querystring = require('querystring');
var RpcError = require('../../lib/errors/rpc');
var channel = require('../../lib/rpc/channel-api');
var InsuranceSlipsService = require('../../lib/services/insurance-slips-service');
var policies = require('../../lib/policies');
var Validator = require('../../lib/validator');
var utils = require('../../lib/utils');

// 创建投保单
router.post('/', function (req, res, next) {
    var body = req.body.data;
    
    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            body = JSON.parse(result);
            
            _.forEach(body, function (insuranceSlips) {
                if (req.session.user) {
                    insuranceSlips.userId = req.session.user.UserId;
                    insuranceSlips.userName = req.session.user.LoginName;
                } else {
                    insuranceSlips.userId = null;
                }
            });
            
            return body;
        })
        .then(InsuranceSlipsService.create)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 编辑投保单
router.put('/:id', policies.loginAuth);
router.put('/:id', function (req, res, next) {
    var body = req.body.data;

    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            result = xss(querystring.unescape(result), {
                whiteList: []
            });
            var body = JSON.parse(result);
            
            if (req.session.user) {
                body.userId = req.session.user.UserId;
                body.userName = req.session.user.LoginName;
            } else {
                body.userId = null;
            }
            
            if (req.cookies.UtmCookieKey) {
                try {
                    var utm = JSON.parse(req.cookies.UtmCookieKey);
                    body.kpi = utm;
                } catch (error) {
                }
            }
            
            return body;
        })
        .then(InsuranceSlipsService.update)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 投保单查询
router.get('/:id', policies.loginAuth);
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var userId = req.session.user.UserId;
    
    new Validator(id).isNotEmpty().isNumber().validate()
        .then(function (result) {
            return InsuranceSlipsService.queryById(userId, result);
        })
        .then(function (record) {
            record.planDetailInfo.companyLogo = utils.formatUrlToSupportHttps(record.planDetailInfo.companyLogo);
            record.planDetailInfo.companyBigLogo = utils.formatUrlToSupportHttps(record.planDetailInfo.companyBigLogo);
            if (record.setIdCardFileUrlList) {
                record.setIdCardFileUrlList.forEach(function (cardFile) {
                    cardFile = utils.formatUrlToSupportHttps(cardFile);
                });
            }
            return record;
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 查询健康告知
router.get('/:id/health-inform', policies.loginAuth);
router.get('/:id/health-inform', function (req, res, next) {
    var id = req.params.id;
    
    new Validator(id).isNotEmpty().isNumber().validate()
        .then(InsuranceSlipsService.fetchHealthInform)
        .then(function (record) {
            if (record.insurance) {
                record.insurance.companyLogo = utils.formatUrlToSupportHttps(record.insurance.companyLogo);
            }

            return record;
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 保存健康告知
router.post('/:id/health-inform', policies.loginAuth);
router.post('/:id/health-inform', function (req, res, next) {
    var id = req.params.id;
    var answer = req.body.data;
    
    Promise.all([
            new Validator(id).isNotEmpty().isNumber().validate(),
            new Validator(answer).isNotEmpty().isString().validate()
        ])
        .then(function (results) {
            id = results[0];
            answer = results[1];
            
            return InsuranceSlipsService.saveHealthInform(id, answer);
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 团单模板解析
router.get('/groups/parse-excel', policies.loginAuth);
router.get('/groups/parse-excel', function (req, res, next) {
    var fileId = req.query.fileId;
    
    var parse = function (_fileId) {
        return new Promise(function (resolve, reject) {
            channel.parseGroupInsuranceSlips([_fileId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    new Validator(fileId).isNotEmpty().isNumber().validate()
        .then(parse)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 修改起保日期
router.put('/:id/start-date', function (req, res, next) {
    var body = req.body.data;
   
    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            body = JSON.parse(result);
            
            if (req.session.user) {
                body.userId = req.session.user.UserId;
            } else {
                body.userId = null;
            }
            
            return body;
        })
        .then(InsuranceSlipsService.updateStartDate)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 计算投保单金额
router.post('/amount/choosed', function (req, res, next) {
    var body = req.body.data;

    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            return {
                user: {
                    userId: (req.session.user && req.session.user.UserId) || null
                },
                items: JSON.parse(result)
            };
        })
        .then(InsuranceSlipsService.calculateAmount)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 投保填写页
router.get('/:id/page-info', policies.loginAuth);
router.get('/:id/page-info', function(req, res, next) {
    var insuranceSlipsId = req.params.id;
    var userId = req.session.user.UserId;

    var fetchPageData = function(record) {
        record.planDetailInfo.companyLogo = utils.formatUrlToSupportHttps(record.planDetailInfo.companyLogo);
        record.planDetailInfo.companyBigLogo = utils.formatUrlToSupportHttps(record.planDetailInfo.companyBigLogo);
        if (record.setIdCardFileUrlList) {
            record.setIdCardFileUrlList.forEach(function (cardFile) {
                cardFile = utils.formatUrlToSupportHttps(cardFile);
            });
        }

        var params = {
            productId: record.productId,
            planId: record.planId,
            baseProductId: record.ruleParam.baseProductId,
            basePlanId: record.ruleParam.basePlanId,
            genes: record.ruleParam.genes,
            preminum: record.restrictRule.preminum
        };
        
        return InsuranceSlipsService.fetchInsurancePageData(params)
            .then(function (result) {
                result.insurance = record;
                result.product.company.bigLogoImg = utils.formatUrlToSupportHttps(result.product.company.bigLogoImg);
                result.product.company.smallLogoImg = utils.formatUrlToSupportHttps(result.product.company.smallLogoImg);
                result.product.company.mobileLogoImg = utils.formatUrlToSupportHttps(result.product.company.mobileLogoImg);
                return result;
            });
    };
    
    new Validator(insuranceSlipsId).isNotEmpty().isNumber().validate()
        .then(function (result) {
            return InsuranceSlipsService.queryById(userId, result);
        })
        .then(fetchPageData)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 获取续保被保人
router.get('/renewal/insured', policies.loginAuth);
router.get('/renewal/insured', function (req, res, next) {
    var renewalNum = req.query.renewalNum;
    
    new Validator(renewalNum).isNotEmpty().isNumber().validate()
        .then(InsuranceSlipsService.fetchInsuredOfRenewal)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 判断投保单是否能够投保
router.get('/:id/is-ready', function (req, res, next) {
    var insuranceSlipsId = req.params.id;
    
    new Validator(insuranceSlipsId).isNotEmpty().isNumber().validate()
        .then(InsuranceSlipsService.isReady)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 投保试算
router.post('/restrict-rule', policies.loginAuth);
router.post('/restrict-rule', function (req, res, next) {
    var body = req.body.data;

    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            body = JSON.parse(result);

            if (body.insureDateTime && 0 !== body.insureDateTime.length) {
                return new Validator(body.insureDateTime).isNotEmpty().isDateString().validate()
                    .then(function () {
                        return body;
                    });
            } else {
                return body;
            }
        })
        .then(InsuranceSlipsService.fetchRestrictRule)
        .then(res.sendNormal)
        .catch(res.sendError);
});

module.exports = router;
