var express = require('express');
var router = express.Router();
var BaseService = require('../../lib/services/base-service');

// 获取首页动态数据
router.get('/simple-market-data', function (req, res, next) {
    BaseService.fetchSimpleMarketData()
        .then(res.sendNormal)
        .catch(res.sendError);
});

module.exports = router;