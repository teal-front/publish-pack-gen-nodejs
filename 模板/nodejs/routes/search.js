var express = require('express');
var router = express.Router();
var channel = require('../lib/channel-api');
var CommentService = require('../services/comment-service');
var ProductService = require('../services/product-service');
var _ = require('lodash');
var pub = require('../lib/public');
var constants = require('../lib/constants');


/*
职业搜索
*/
router.get('/job', function(req, res, next) {
	var obj = {
		layout: 'layout/page/layout',
		title: '慧择主站所有评论页',
		//data: result,
		jsName: "all-comments"
	};
	res.render('search/job', pub.renderData(obj));
});


module.exports = router;