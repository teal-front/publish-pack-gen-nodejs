var express = require('express');
var router = express.Router();
var multer = require('multer');
var Util = require('util');
var path = require('path');
// var FileServer = require('../../lib/rpc/channel-fileserver');
var policies = require('../../lib/policies');
var constants = require('../../lib/constants');
var utils = require('../../lib/utils');
var RpcError = require('../../lib/errors/rpc');
var config = require('../../config');
var fastfsClient = require('../../lib/file-server/fastfs-client')(config.fileServer);
var logger = require('../../lib/log').logger;

var supportFileExt = {
    '.xls': true,
    '.xlsx': true,
    '.jpg': true,
    '.png': true,
    '.gif': true,
    '.bmp': true,
    '.jpeg': true
};
var storage = multer.memoryStorage();
var upload = multer({
    storage: storage,
    limits: {
        fileSize: 10485760
    },
    fileFilter: function (req, file, callback) {
        var extName = path.extname(file.originalname.toLowerCase());

        if (supportFileExt[extName] || utils.isImageMimetype(file.mimetype) || utils.isExcelMimetype(file.mimetype))  {
            callback(null, true);
        } else {
            callback(new RpcError('00004', '不支持该文件类型'));
        }
    }
}).any();

// 上传照片、团单
router.post('/', policies.loginAuth);
router.post('/', function (req, res, next) {
    
    var uploadFile = function (file) {
        // return new Promise(function (resolve, reject) {
        //     FileServer.uploadFile(constants.FILESERVER_SITE_NAME.FILE, file.originalname, 
        //         file.buffer, function (result) {
        //             if (result.status === '00000') {
        //                 if (result.result.IsSuccess) {
        //                     resolve(result.result.Data);
        //                 } else {
        //                     reject(new RpcError('00004', result.result.Message));
        //                 }
        //             } else {
        //                 reject(new RpcError('00004', result.exception));
        //             }
        //         });
        // });
        return fastfsClient.upload(file.originalname, file.buffer, 'file', {
            ip: req.ip
        });
    };
    
    var sendResponse = function (records) {
        var result = records.map(function (record) {
            return {
                fileId: record.id,
                fileUrl: utils.formatUrlToSupportHttps(record.fileUrl)
            };
        });
        
        logger.info('file upload success! result: %j', result);
        res.sendNormal(result);
    };

    upload(req, res, function (err) {
        if (err) {
            res.sendError(err);
        } else {
             Promise.all(req.files.map(function (file) {
                    return uploadFile(file);
                }))
                .then(sendResponse)
                .catch(res.sendError);
        }
    });
});

module.exports = router;