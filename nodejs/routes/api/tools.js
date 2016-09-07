var express = require('express');
var request = require('request');
var querystring = require('querystring');
var Url = require('url');
var Path = require('path');
var gm = require('gm');
var router = express.Router();
var constants = require('../../lib/constants');
var AddressService = require('../../lib/services/address-service');
var channel = require('../../lib/rpc/channel-api');
var RpcError = require('../../lib/errors/rpc');
var Validator = require('../../lib/validator');
var logger = require('../../lib/log').logger;

// 获取服务器当前时间
router.get("/date/now", function (req, res, next) {
    var body = {
        status: "00000",
        result: new Date().toLocaleString(),
        success: true,
        error: false
    };

    res.status(200)
        .send(body);
});

// 获取所有省份信息
router.get('/address/province', function (req, res, next) {
    AddressService.fetchAddresses({
            level: constants.ADDRESS_LEVEL.PROVINCE
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 获取指定省份下所有的城市信息
router.get('/address/city', function (req, res, next) {
    var province = req.query.province;
    
    new Validator(province).isNotEmpty().isNumber().validate()
        .then(function (result) {
            return AddressService.fetchAddresses({
                level: constants.ADDRESS_LEVEL.CITY,
                provinceCode: result
            });
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 获取指定城市下所有的区域信息
router.get('/address/district', function (req, res, next) {
    var city = req.query.city;
    
    new Validator(city).isNotEmpty().isNumber().validate()
        .then(function (result) {
            return AddressService.fetchAddresses({
                level: constants.ADDRESS_LEVEL.DISTRICT,
                cityCode: result
            });
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 获取机场信息
router.get('/airports', function (req, res, next) {
    var fetchAirports = function () {
        return new Promise(function (resolve, reject) {
            channel.getInsuranceSlipsAirportList(function (result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new RpcError(result.code, result.msg));
                }
            });
        });
    };
    
    fetchAirports()
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 转换灰度图
router.get('/images/grayscale', function (req, res, next) {
    var url = req.query.url;
    if (url.startsWith('//')) {
        url = 'http:' + url;
    }
    var originalImageName, originalImageExt;

    var fetchImage = function (imageUrl) {
        return new Promise(function (resolve, reject) {
            var options = {
                url: imageUrl,
                method: 'GET',
                encoding: null
            };
            
            request(options, function (err, response, body) {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        });
    };
    
    var grayImage = function (imageBody) {
        return new Promise(function (resolve, reject) {
            gm(imageBody)
                .setFormat('gif')
                .type('Grayscale')
                .modulate(140)  
                .stream(function (err, stdout, stderr) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(stdout);
                    }
                });
        });
    };
    
    var sendResponse = function (imageStream) {
        res.type(originalImageExt || 'gif');
        imageStream.pipe(res);
    };
    
    var catchError = function (error) {
        logger.error('Error occurred! 转换灰度图失败 Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
        res.sendStatus(404);
    };
    
    new Validator(url).isNotEmpty().isString().validate()
        .then(function (result) {
            originalImageName = Path.basename(result);
            originalImageExt = Path.extname(originalImageName);

            var encodedImageName = querystring.escape(originalImageName);
            result = result.replace(originalImageName, encodedImageName);

            return result;
        })
        .then(fetchImage)
        .then(grayImage)
        .then(sendResponse)
        .catch(catchError);
});

module.exports = router;
