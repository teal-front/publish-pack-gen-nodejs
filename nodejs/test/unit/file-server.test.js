var should = require('should');
var FileServer = require('../../lib/rpc/channel-fileserver');
var constants = require('../../lib/constants');
var fs = require('fs');
var path = require('path');
var HastdfsClient = require('../../lib/file-server/fastfs-client');

var fastfsClient = HastdfsClient({
    mq: {url: "amqp://it:its123@192.168.10.59:5672", heartbeat: 10},
    dfs: {
        trackers: [
            {
                host: '192.168.10.96',
                port: 22122
            },
            {
                host: '192.168.10.97',
                port: 22122
            }
        ],
        timeout: 10000,
        defaultExt: 'txt',
        charset: 'utf8'
    },
    oldFileServer: {
        host: '192.168.10.50',
        port: '996'
    },
    application: 'hz-pc'
});

describe('fileserver', function () {
    it.skip('uploadFile', function (done) {
        var fileName = 'test.txt';
        fs.readFile('./test/unit/' + fileName, function (err, data) {
            if (err) {
                done(err);
            } else {
                FileServer.uploadFile(constants.FILESERVER_SITE_NAME.FILE, fileName, data, 
                    function (result) {
                        console.log(result);
                        done();
                    });                 
            }
        });
    });

    it('uploadFileNew', function (done) {
        var fileName = 'test.txt';
        fs.readFile('./test/unit/' + fileName, function (err, data) {
            if (err) {
                done(err);
            } else {
                console.log(data);
                fastfsClient.upload(fileName, data, 'file', {
                        ip: '192.168.13.230'
                    })
                    .then(function (result) {
                        console.log(result);
                        done();
                    });
            }
        });
    });

    it('downloadFileNew', function (done) {
        var fileId = 100006785;
        
        fastfsClient.download(fileId)
            .then(function (result) {
                console.log(result);
                done();
            })
            .catch(function (error) {
                done(error);
            });
    });
});