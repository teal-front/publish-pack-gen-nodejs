'use strict';
var path = require('path');
var net = require('net');
var FdfsClient = require('./fdfs');
var amqpRPC = require('../rpc/rpc');
var RpcError = require('../errors/rpc');

var MAX_OLD_FILD_ID = 100000000;

function HzDFSClient(opt) {
    if (!opt) opt = {};
    this.opt = opt;
    this.rpc = amqpRPC.init(opt.mq);
    this.fdfs = new FdfsClient(opt.dfs);
    this.application = opt.application || '';
}

HzDFSClient.prototype.getFileMeta = function (fileId) {
    var _this = this;
    console.info('FsFacade.getFileMeta fileId: %s', fileId);
    return new Promise(function (resolve, reject) {
        _this.rpc.call('Rpc_Jupiter.DFS.Service', {
                "serviceId": 'Rpc_Jupiter.DFS.Service',
                "command": 'com.hzins.jupiter.dfs.api.facade.FsFacade.getFileMeta',
                "parameters": [fileId]
            }, function (message, timestamp) {
                try {
                    var encoded_payload = message.data.toString('utf8');
                    var payload = JSON.parse(encoded_payload);
                    payload.timestamp = new Date().getTime() - timestamp; 
                } catch (error) {
                    reject(error);
                }

                console.info('FsFacade.getFileMeta result: %s - %sms', payload.status, payload.timestamp);
                if (payload.status === '00000') {
                    resolve(payload.result);
                } else {
                    reject(new RpcError(payload.status, payload.exception));
                }
            });
    });
};

HzDFSClient.prototype.setFileMeta = function (fileMeta, clientEnvironment) {
    var _this = this;
    console.info('FsFacade.uploadFileMeta fileMeta: %j clientEnvironment: %j', fileMeta, clientEnvironment);
    return new Promise(function (resolve, reject) {
        _this.rpc.call('Rpc_Jupiter.DFS.Service', {
                "serviceId": 'Rpc_Jupiter.DFS.Service',
                "command": 'com.hzins.jupiter.dfs.api.facade.FsFacade.uploadFileMeta',
                "parameters": [fileMeta, clientEnvironment]
            }, function (message, timestamp) {
               try {
                    var encoded_payload = message.data.toString('utf8');
                    var payload = JSON.parse(encoded_payload);
                    payload.timestamp = new Date().getTime() - timestamp; 
                } catch (error) {
                    reject(error);
                }

                console.info('FsFacade.uploadFileMeta result: %s - %sms', payload.status, payload.timestamp);
                if (payload.status === '00000') {
                    resolve(payload.result);
                } else {
                    reject(new RpcError(payload.status, payload.exception));
                }
            });
    });
};

HzDFSClient.prototype.getGroups = function (fileCategory) {
    console.info('FsFacade.getStorageGroups fileCategory: %s', fileCategory);
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.rpc.call('Rpc_Jupiter.DFS.Service', {
                "serviceId": 'Rpc_Jupiter.DFS.Service',
                "command": 'com.hzins.jupiter.dfs.api.facade.FsFacade.getStorageGroups',
                "parameters": [fileCategory]
            }, function (message, timestamp) {
                try {
                    var encoded_payload = message.data.toString('utf8');
                    var payload = JSON.parse(encoded_payload);
                    payload.timestamp = new Date().getTime() - timestamp; 
                } catch (error) {
                    reject(error);
                }

                console.info('FsFacade.getStorageGroups result: %s - %sms', payload.status, payload.timestamp);
                if (payload.status === '00000') {
                    resolve(payload.result);
                } else {
                    reject(new RpcError(payload.status, payload.exception));
                }
            });
    });
};

HzDFSClient.prototype.download = function (fileId) {
    var _this = this;
    if (fileId < MAX_OLD_FILD_ID) {
        return new Promise(function (resolve, reject) {
            var client = new net.Socket();
            client.connect(_this.opt.oldFileServer.port, _this.opt.oldFileServer.host, function () {

                var downloadFile = {
                    serviceId: 'HzInsSystem.FileService',
                    command: 'HzInsSystem.FileService.Application.Service.FileService.DownloadFileWithInfo',
                    parameters: [fileId]
                };

                client.write(JSON.stringify(downloadFile) + '\r\n');
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
                        // callback(json);
                        resolve(json);
                    }
                } catch (e) {
                }
            });

            // 为客户端添加“close”事件处理函数
            client.on('close', function () {
                console.log('Connection closed');
            });
        });
    } else {
        return _this.getFileMeta(fileId)
            .then(function (fileMeta) {
                if (fileMeta.filePath.indexOf(fileMeta.groupName) == -1)
                    fileMeta.filePath = fileMeta.groupName + '/' + fileMeta.filePath;
                
                return _this.fdfs.download(fileMeta.filePath);
            })
            .then(function (result) {
                return result.data;
            });
    }
};

HzDFSClient.prototype.upload = function (fileName, data, fileCategory, clientInfo) {
    var _this = this;
    var group = '';
    var ext = path.extname(fileName).replace('.', '');

    return _this.getGroups(fileCategory)
        .then(function (results) {
            group = results[0];
            return _this.fdfs.upload(data, {
                    method: 'upload',
                    group: group,
                    ext: ext,
                    size: data.length
                });
        })
        .then(function (filePath) {
            var fileMeta = {
                fileName: fileName,
                filePath: filePath,
                fileSize: data.length,
                groupName: group,
                category: fileCategory,
                fileExt: ext
            };

            var clientEnvironment = {
                application: _this.application,
                ip: clientInfo.ip
            };

            return _this.setFileMeta(fileMeta, clientEnvironment);
        });
};

var hzDFSClient;
module.exports = function (opts) {
    if (!hzDFSClient) {
        hzDFSClient = new HzDFSClient(opts);
    } 

    return hzDFSClient;
};