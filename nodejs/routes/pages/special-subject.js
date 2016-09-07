var express = require('express');
var _ = require('lodash');
var pub = require('../../lib/public');
var constants = require('../../lib/constants');
var SpecialSubjectService = require('../../lib/services/special-subject-service');
var ProductService = require('../../lib/services/product-service');
var logger = require('../../lib/log').logger;
var NotFoundError = require('../../lib/errors/not-found');
var RenderProducts = require('../../lib/product-list');
var Utils = require('../../lib/utils');
var router = express.Router();

// 专题频道
router.get('/', function (req, res, next) {
	var sendResponse = function (records) {
		var obj = {
			layout: 'layout/page/layout-special-subject',
			title: constants.SPECIAL_SUBJECT_TDK.TITLE,
			keyword: constants.SPECIAL_SUBJECT_TDK.KEYWORDS,
			description: constants.SPECIAL_SUBJECT_TDK.DESCRIPTION,
			data: records,
			jsName: 'subject-list',
		};

		// res.render('special-subject/subject-list', pub.renderData(obj));	
		res.renderNormal('special-subject/subject-list', obj);	
	};

	var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        next(error);
    };

	SpecialSubjectService.findAll()
		.then(sendResponse)
		.catch(handleError);
});

// 专题详情
router.get('/:url', function (req, res, next) {
	var url = req.params.url;

	var sendResponse = function (record) {
		if (!record) {
			throw new NotFoundError();
		}

		try {
			record.riskPoint = JSON.parse(record.riskPoint || '[]');
			record.relatedSpecial = JSON.parse(record.relatedSpecial || '[]');
			record.insureSuggestions = JSON.parse(record.insureSuggestions || '[]');
			record.recommendedReason = JSON.parse(record.recommendedReason || '[]');
			record.products = JSON.parse(record.product || '[]');
			delete record.product;
			var rederProducts = new RenderProducts({ //产品列表
				productList: record.products
			});
			record.productsHtml = rederProducts.renderProductsList();
		} catch (error) {
			logger.error('GET /zhuanti/:url deserialization error: %s stack: ', error.message, error.stack);
		}
		
		var obj = {
			layout: 'layout/page/layout-special-subject',
			jsName: 'subject-detail',
			title: 0 === record.seoTitle.length ? Utils.formatPageTitle('保险专题详情') : record.seoTitle,
			keyword: record.seoKeyword || '',
			description: record.seoDescription || '',
			data: record
		};

		// res.render('special-subject/subject-detail', pub.renderData(obj));
		res.renderNormal('special-subject/subject-detail', obj);
	};

	var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        if (error instanceof NotFoundError) {
            next();
        } else {
            next(error);
        }
    };

	SpecialSubjectService.findOne(url)
		.then(sendResponse)
		.catch(handleError);
});

module.exports = router;