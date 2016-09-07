var express = require('express');
var _ = require('lodash');
var pub = require('../../lib/public');
var constants = require('../../lib/constants');
var ProductService = require('../../lib/services/product-service');
var router = express.Router();
var RenderProducts = require('../../lib/product-list');
var logger = require('../../lib/log').logger;

// 产品排行
router.get(/^\/(\d+)-(\d+)-(\d+)$/, function (req, res, next) {
	var categoryId = req.params[0];
	var filter = req.params[1];
	var sort = req.params[2];

	var sendResponse = function (results) {
		var records = results[0], categories = results[1];
		var categoryName = "",
			parentCategoryName = "",
			isTop = true;
		categories.forEach(function(item){
			if(item.id == categoryId){
				parentCategoryName = categoryName = item.name;
			    return;
			}
			item.childrenList.forEach(function(item2){
				if(item2.id == categoryId){
					categoryName = item2.name;
					parentCategoryName = item.name;
					isTop = false;
				}
			});
		});
		parentCategoryName = !isTop ? parentCategoryName : "";
		var fixCategoryName = isTop ? categoryName.replace(/保险$/g,"") + "保险" : (parentCategoryName.replace(/保险$/g,"") + categoryName.replace(/保险$/g,"")) + "保险";
		var rederProducts= new RenderProducts({   //产品列表
			productList: records
		});
		var obj = {
			layout: 'layout/page/layout-product-list',
			title: fixCategoryName + "哪个好_" + fixCategoryName + "排名_ " + fixCategoryName + "推荐-慧择保险网",
			keyword : fixCategoryName + "哪个好," + fixCategoryName + "排名，" + fixCategoryName + "推荐",
			description: fixCategoryName + "排名频道通过对 " + fixCategoryName +" 产品从销量，价格，评价等不同方面排名的对比，用数据告诉用户" + fixCategoryName + "哪个好，好的"+ fixCategoryName +"险种有哪些？您可以在线进行全面的" + fixCategoryName + "产品分析，咨询和比较。正确的在慧择保险网上选购到适合自己的" + fixCategoryName +"。",
			jsName : "baoxianpaiming",
			data :{
				list : records || [],
				categoryId : categoryId,
				categories : categories,
				productListHtml: rederProducts.renderProductsList()
			}
		};

		// res.render('product-list/baoxianpaiming', pub.renderData(obj));
		res.renderNormal('product-list/baoxianpaiming', obj);
	};

	var handleError = function(error) {
        logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

        next(error);
    };

	Promise.all([
			ProductService.fetchTopsByCategory(categoryId),
			ProductService.fetchGetProductCategoryTree()
		])
		.then(sendResponse)
		.catch(handleError);
});

router.get('/', function (req, res, next) {
	var sendResponse = function (results) {
		var records = results[0], categories = results[1];
		var rederProducts= new RenderProducts({   //产品列表
			productList: records
		});

		var obj = {
			layout: 'layout/page/layout-product-list',
			title: "什么保险好【产品，险种，比较，推荐】-保险排名-慧择保险网",
			keyword: "什么保险好，保险产品，保险排名",
			description: '慧择保险网保险排名频道通过对保险产品从销量，价格，评价等不同方面排名的对比，用数据告诉用户什么保险好，好的保险险种有哪些？您可以在线进行全面的保险产品分析，咨询和比较。正确的选购到适合自己的保险。',
			jsName : "baoxianpaiming",
			data : {
				list : records || [],
				categoryId : null,
				categories : categories,
				productListHtml: rederProducts.renderProductsList()
			},
		};

		// res.render('product-list/baoxianpaiming', pub.renderData(obj));
		res.renderNormal('product-list/baoxianpaiming', obj);
	};

	var handleError = function(error) {
		logger.error('Error occurred! Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);

		next(error);
	};

	Promise.all([
			ProductService.fetchTopsByCategory(null),
			ProductService.fetchGetProductCategoryTree()
		])
		.then(sendResponse)
		.catch(handleError);
});

module.exports = router;