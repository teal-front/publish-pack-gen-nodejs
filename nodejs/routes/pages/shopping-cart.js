var express = require('express');
var _ = require('lodash');
var router = express.Router();
var channel = require('../../lib/rpc/channel-api');
var utils = require('../../lib/utils');
var policies = require('../../lib/policies');
var pub = require('../../lib/public');
var RpcError = require('../../lib/errors/rpc');

// 购物车页面渲染
router.get('/', function (req, res, next) {
    var obj = {
        layout: 'layout/page/layout-shopcar',
        title: utils.formatPageTitle('我的购物车'),
        jsName:"shopping-car",
        curStep:1
    };

    // res.render('shopcar/shopping-car', pub.renderData(obj));
    res.renderNormal('shopcar/shopping-car', obj);
});

module.exports = router;
