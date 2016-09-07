var express = require('express');
var Util = require('util');
var qr = require('qr-image');
var Validator = require('../../lib/validator');
var router = express.Router();

var COUNSELOR_URL = 'http://m.huize.com/app/%s/index.html';

// 生成顾问二维码
router.get('/:id/qrcode', function (req, res, next) {
    var id = req.params.id;
    var url = Util.format(COUNSELOR_URL, id);
    var qrcode = qr.image(url);
    res.type('png');
    qrcode.pipe(res);
});

module.exports = router;