var express = require('express');
var _ = require('lodash');
var pub = require('../../lib/public');
var constants = require('../../lib/constants');
var planInfo = require('./plan-info');
var router = express.Router();
var ProgramService = require('../../lib/services/program-service');
var InvalidError = require('../../lib/errors/invalid');
var Validator = require('../../lib/validator');
var utils = require('../../lib/utils');
var logger = require('../../lib/log').logger;

// 规划首页
router.get('/', function (req, res, next) {
	var params = req.query;

	var sendResponse = function (record) {
		var obj = {
			layout: 'layout/page/layout-programs',
			title: constants.PROGRAM_TDK.TITLE,
			keyword: constants.PROGRAM_TDK.KEYWORDS,
			description: constants.PROGRAM_TDK.DESCRIPTION,
			jsName : 'program-step',
			data : params
		};

		// res.render('programs', pub.renderData(obj));
		res.renderNormal('programs', obj);
	};

	sendResponse(null);
});

// 规划结果页
router.get('/:id', function (req, res, next) {
	var id = req.params.id;

	if (!planInfo[id]) {
		next();
		return;
	}

    var sendResponse = function (record) {
    	var plan = planInfo[id];
		var obj = {
			layout: 'layout/page/layout-programs',
			jsName: 'programs',
			pageId: id,
			planName: plan.title,
			planDesc: plan.desc,
			title: plan.title + ' - ' + constants.PROGRAM_TDK.TITLE,
			keyword: plan.title,
			description: plan.desc
		};

		// res.render('programs/detail-' + id, pub.renderData(obj));
		res.renderNormal('programs/detail-' + id, obj);
	};

	sendResponse(null);
});

// 规划评论页
router.get(/^\/comment\/p(\d{3})$/,function(req, res, next) {
	var projectId = req.params[0];
	var pageIndex = req.query.pageIndex || 1;

	var sendResponse = function (data) {
		data.pageIndex = pageIndex;

		var obj = {
			layout: 'layout/page/layout-programs',
			jsName: 'programs-comments',
			title: utils.formatPageTitle((data.projectName || "") + "用户评论"),
			keyword: data.projectName,
			description: data.projectDesc,
			data : data
		};

		// res.render('programs/comments', pub.renderData(obj));
		res.renderNormal('programs/comments', obj);
	};

	var handleError = function (error) {
		logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
		
		if (error instanceof InvalidError) {
            next();
            return;
        }

		next(error);
	};

	Promise.all([
			new Validator(projectId).isNotEmpty().isNumber().validate(),
			new Validator(pageIndex).isNotEmpty().isNumber().validate()
		])
		.then(function (results) {
			projectId = results[0];
			pageIndex = results[1];

			return ProgramService.getComments(projectId, constants.PROGRAMS_PAGE_SIZE, pageIndex);
		})
		.then(sendResponse)
		.catch(handleError);
});

module.exports = router;