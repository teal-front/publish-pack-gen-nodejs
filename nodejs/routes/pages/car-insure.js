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

//车险填写投保单页面
//router.get('/', policies.loginAuthWithRedirect);
router.get('/', function(req, res, next) {
    var obj = {
        layout: 'layout/page/layout',
        title: utils.formatPageTitle('车险投保'),
        jsName: 'car-insure-index'
    };
    
    res.renderNormal('car-insure/index', obj);
});

//车险投保单列表页面
//router.get('/policyList', policies.loginAuthWithRedirect);
router.get('/policyList', function(req, res, next) {
    var obj = {
        layout: 'layout/page/layout',
        title: utils.formatPageTitle('车险保单列表'),
        jsName: 'car-insure-policy-list'
    };

    res.renderNormal('car-insure/policy-list', obj);
});


module.exports = router;