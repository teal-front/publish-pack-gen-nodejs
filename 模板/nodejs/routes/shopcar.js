/**
 * Created by hz15041122 on 2016/3/17.
 */

/**
 * Created by 林耀发 on 2016/2/29.
 */

var express = require('express');
var login = require('../lib/other-login');
var https=require('https')
var router = express.Router();
var logger = require("../lib/logger.js");
var public=require("../lib/public.js")

/* GET home page. */
var configData=login;
var httpres;


router.get(/^\/(\w+)$/, function(req, res, next) {
    var renderData = public.renderData;
    var obj = {
        layout: 'layout/page/layout-shopcar',
        title: '购物车',
        jsName:"shopcar-list"
    };
    res.render('shopcar/shopcar', renderData(obj));
    next();
});

module.exports = router;
