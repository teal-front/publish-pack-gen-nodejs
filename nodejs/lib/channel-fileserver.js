var config = require('../config.js');
var net = require('net');
var log = require('./channel-log.js');

var HOST = config.fileServer.host;
var PORT = config.fileServer.port;

var FileServer = {
    uploadFile: function (siteName, fileName, data, callback) {
        var client = new net.Socket();
        
        var bytes;
        bytes = [];
        for (var value of data.values()) {
            bytes.push(value);
        }
      
        client.connect(PORT, HOST, function () {
            log.info('CONNECTED TO: ' + HOST + ':' + PORT);
            
            var uploadFile = {
                serviceId: 'HzInsSystem.FileService',
                command: 'HzInsSystem.FileService.Application.Service.FileService.UploadFile',
                parameters: [bytes, fileName, siteName]
            };

            log.info(JSON.stringify(uploadFile));
            client.write(JSON.stringify(uploadFile) + '\r\n');
        });
        
        var result = '', json;
        
        client.on('data', function (data) {
            result += data;
            try {
                if (json = JSON.parse(result)) {
                    // 完全关闭连接
                    client.destroy();
                    callback(json);
                }
            } catch (e) {
            }
        });

        client.on('close', function () {
            log.info('Connection closed');
        });
    },
    downloadFile: function (fileId, callback) {
        var client = new net.Socket();
        client.connect(PORT, HOST, function () {
            log.info('CONNECTED TO: ' + HOST + ':' + PORT);

            var downloadFile = {
                serviceId: 'HzInsSystem.FileService',
                command: 'HzInsSystem.FileService.Application.Service.FileService.DownloadFileWithInfo',
                parameters: [fileId]
            };

            log.info(JSON.stringify(downloadFile));
            client.write(downloadFile + '\r\n');
        });

        var result = '', json;

        // 为客户端添加“data”事件处理函数
        // data是服务器发回的数据
        client.on('data', function (data) {
            result += data;
            try {
                if (json = JSON.parse(result)) {
                    // 完全关闭连接
                    client.destroy();
                    callback(json);
                }
            } catch (e) {
            }
        });

        // 为客户端添加“close”事件处理函数
        client.on('close', function () {
            log.info('Connection closed');
        });
    },
    batchDownloadFile: function (fileIdStr, callback) {
        var client = new net.Socket();
        client.connect(PORT, HOST, function () {
            log.info('CONNECTED TO: ' + HOST + ':' + PORT);
            var downloadFile = {
                serviceId: 'HzInsSystem.FileService',
                command: 'HzInsSystem.FileService.Application.Service.FileService.DownloadCompressFiles',
                parameters: [fileIdStr.split(',')]
            };

            log.info(JSON.stringify(downloadFile));
            client.write(JSON.stringify(downloadFile)+'\r\n');
        });

        var result = '', json;

        // 为客户端添加“data”事件处理函数
        // data是服务器发回的数据
        client.on('data', function (data) {
            result += data;
            try {
                if (json = JSON.parse(result)) {
                    // 完全关闭连接
                    client.destroy();
                    callback(json);
                }
            } catch (e) {
            }
        });

        // 为客户端添加“close”事件处理函数
        client.on('close', function () {
            log.info('Connection closed');
        });
    }
};

module.exports = FileServer;