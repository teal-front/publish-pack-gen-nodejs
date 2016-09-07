var app = require('../app');
var http = require('http');
var channel = require('../lib/rpc/channel-api');
var Cache = require('../lib/rpc/channel-cache'); 
var config = require('../config');

var UNITTEST_PORT = 8888;
var server;

before(function (done) {
    this.timeout(5000);
    console.info("Express server is starting...");
    server = http
        .createServer(app)
        .listen(UNITTEST_PORT);

    server.on('error', done);

    global.host = "http://127.0.0.1:" + UNITTEST_PORT;
    console.info("Express server has started at port: " + UNITTEST_PORT);

    channel.init('rabbitmq', {
        conn_options: config.rabbitmq
    });
    console.info("rpc server is starting...");

    Cache.init(config.redis);
    console.info('redis client is starting...');

    done();
});

after(function (done) {
    console.info("Express server is shutting down...");
    server.close();
    delete global.host;
    console.info("Express server has shut down");

    done();
});
