var express = require('express');
var _ = require('lodash');
var pub = require('../../lib/public');
var logger = require('../../lib/log').logger;
var utils = require('../../lib/utils');
var constants = require('../../lib/constants');
var router = express.Router();

//预约相关
router.get('/', function (req, res, next) {
	
	var sendResponse = function (record) {
		var obj ={
			layout: 'layout/page/layout-reserve',
			title:constants.RESERVE_TDK.TITLE,
			keyword:constants.RESERVE_TDK.KEYWORDS,
			description:constants.RESERVE_TDK.DESCRIPTION,
            jsName: 'reserve'
		};

		// res.render('reserve/reserve', pub.renderData(obj));
		res.renderNormal('reserve/reserve', obj);
	};

	sendResponse(null);
});

module.exports = router;