var express = require('express');
var lodash = require('lodash');
var qr = require('qr-image');
var Util = require('util');
var utils = require('../../lib/utils');
var channel = require('../../lib/rpc/channel-api');
var policies = require('../../lib/policies');
var constants = require('../../lib/constants');
var Validator = require('../../lib/validator');
var ProgramService = require('../../lib/services/program-service');
var router = express.Router();

// 规划试算
router.post('/restrict-rule', function (req, res, next) {
    var body = req.body.data;
    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            body = JSON.parse(result);
			
			return ProgramService.caculateAmount(body);
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 收藏规划
router.post('/:id/collections', policies.loginAuth);
router.post('/:id/collections', function (req, res, next) {
    var programId = req.params.id;
	var userId = req.session.user.UserId;

    new Validator(programId).isNotEmpty().isNumber().validate()
        .then(function (result) {
			return ProgramService.collect(userId, result);
        })
        .then(res.sendNormal)
        .then(res.sendError);
});

// 取消收藏规划
router.delete('/:id/collections', policies.loginAuth);
router.delete('/:id/collections', function (req, res, next) {
	var programId = req.params.id;
	var userId = req.session.user.UserId;

	new Validator(programId).isNotEmpty().isNumber().validate()
		.then(function (result) {
			return ProgramService.uncollect(userId, result);
		})
		.then(res.sendNormal)
		.then(res.sendError);
});

// 规划是否收藏
router.get('/:id/is-collected', policies.loginAuth);
router.get('/:id/is-collected', function (req, res, next) {
	var programId = req.params.id;
	var userId = req.session.user.UserId;

	new Validator(programId).isNotEmpty().isNumber().validate()
		.then(function (result) {
			return ProgramService.isCollected(userId, result);
		})
		.then(res.sendNormal)
		.then(res.sendError);
});

// 生成产品分享二维码
router.get('/:id/qrcode', function(req, res, next) {
    var programId = req.params.id;

    var url = Util.format('http://www.huize.com/guihua/%s', programId);
    var qrcode = qr.image(url);

    res.type('png');
    qrcode.pipe(res);
});

module.exports = router;