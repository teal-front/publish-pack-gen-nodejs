var express = require('express');
var pub = require('../lib/public');
var _ = require('lodash');
var ProductService = require('../services/product-service');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {

	var obj = {
		layout: 'layout/page/layout',
		//title: '首页'
	};
	res.render('index', pub.renderData(obj));
});

// 产品对比页
// http://www.huize.com/contrast-1085-523-0-0
router.get(/^\/contrast-(\d+)-(\d+)-(\d+)-(\d+)$/, function (req, res, next) {
    var planIds = [];
    for (var key in req.params) {
        var planId = parseInt(req.params[key]);
        if (planId > 0) {
            planIds.push(planId);
        }
    }
    
	var sendResponse = function(record) {
		var obj = {
	        layout: 'layout/page/layout-compare',
	        title: '慧择产品对比',
			data: JSON.stringify(record),
			jsName:"compare"
	    };

	    res.render('detail/compare', pub.renderData(obj));
    };

    var handleError = function(error) {
        console.log(error);
        next(error);
    };

	ProductService.compareProducts(planIds)
		.then(sendResponse)
		.catch(handleError);
});

module.exports = router;
