var express = require('express');
var _ = require('lodash');
var Util = require('util');
var pub = require('../../lib/public');
var home = require('../../lib/home');
var ProductService = require('../../lib/services/product-service');
var BaseService = require('../../lib/services/base-service');
var logger = require('../../lib/log').logger;
var utils = require('../../lib/utils');
var constants = require('../../lib/constants');
var router = express.Router();

// 主页
router.get('/', function(req, res, next) {
	var sendResponse = function(results) {
		var obj = {
			layout: 'layout/page/layout_home',
			title: constants.INDEX_TDK.TITLE,
			keyword: constants.INDEX_TDK.KEYWORDS,
			description: constants.INDEX_TDK.DESCRIPTION,
			jsName: 'index',
			homeData: home,
			data: {
				images: results[0],
				news: results[1],
				friendlyLinks: results[2],
				marketData: results[3]
			},
			hasH5Page: true
		};

		if (req.query.debug) {
			res.send(pub.renderData(obj));
		} else {
			// res.render('home/index', pub.renderData(obj));
			res.renderNormal('home/index', obj);
		}
	};

	var handleError = function(error) {
		logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
		next(error);
	};

	Promise.all([
			ProductService.fetchIndexPageImages(),
			ProductService.fetchRecommendNews(constants.INDEX_RECOMMEND_NEWS_NUM),
			ProductService.fetchIndexFriendlyLinks(),
			BaseService.fetchSimpleMarketData()
		])
		.then(sendResponse)
		.catch(handleError);
});

// 产品对比页
// http://www.huize.com/contrast-1085-523-0-0
router.get(/^\/contrast-(\d+)-(\d+)-(\d+)-(\d+)$/, function(req, res, next) {
	var planIds = [];
	for (var key in req.params) {
		var planId = parseInt(req.params[key]);
		if (planId > 0) {
			planIds.push(planId);
		}
	}

	var sendResponse = function(results) {
		var plans = results;

		var keywords = '', description = ''; 
		var title = plans.map(function(plan) {
			return plan.operProductName + (plan.operPlanName && 0 === plan.operPlanName.length ? '（' + plan.operPlanName + '）' : '');
		});
		title = title.join('、');
		keywords = title + '';
		description = Util.format('%s哪个好，%s详细对比，包括销售区域，产品价格，保险公司，承保年龄，年限，保额，缴费类型等', title, title);
		title = title + '参数对比';
		

		var obj = {
			layout: 'layout/page/layout-compare',
			title: utils.formatPageTitle(title),
			keyword: keywords,
			description: description,
			data: {
				plans: plans
			},
			jsName: "compare"
		};

		// res.render('detail/compare', pub.renderData(obj));
		res.renderNormal('detail/compare', obj);
	};

	var handleError = function(error) {
		logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
		next(error);
	};

	ProductService.compareProducts(planIds)
		.then(sendResponse)
		.catch(handleError);
});


// 403页面
router.get('/403', function (req, res, next) {
    var obj = {
        layout: 'layout/page/layout',
        title: utils.formatPageTitle('抱歉，您无权限访问此页面'),
    };

    res.renderNormal('403', obj);
});

module.exports = router;