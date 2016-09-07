var express = require('express');
var _ = require('lodash');
var Util = require('util');
var pub = require('../../lib/public');
var home = require('../../lib/home');
var policies = require('../../lib/policies');
var logger = require('../../lib/log').logger;
var utils = require('../../lib/utils');
var constants = require('../../lib/constants');
var router = express.Router();



//车险封面
router.get('/', function(req, res, next) {
    var obj = {
        layout: 'layout/page/layout-car',
        title: utils.formatPageTitle('车险-汽车保险【产品 购买  比较  投保  理赔】'),
        keyword : "车险，汽车保险",
        description: "慧择网车险购买平台引进多家车险公司车险产品，为您提供最优质的车险购买、车险比较、车险理赔等服务",
        jsName: 'car-home',
        hasH5Page: true
    };
    
    res.renderNormal('car-insure/car', obj);
});


module.exports = router;