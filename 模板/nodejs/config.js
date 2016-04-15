'use strict';

var config = {
    // development production
    env: 'development',
    port: 3000,
    // cpsHost: 'http://cpslocal.hzins.com:3000',
    redis: {host: '127.0.0.1', port: 6379},
    fileServer: {
        host: '192.168.10.50',
        port: '996'
    },
    expressSession: {
        key: 'sid',
        secret: '-:D',
        resave: false,
        saveUninitialized: true,
        cookie: {domain: '.hzins.com'},
        redis: {host: '127.0.0.1', port: 6379, prefix: 'nodejs_sess:', ttl: 240000}
    },
    rabbitmq: {url: "amqp://it:its123@192.168.10.59:5672", heartbeat: 10},
    rabbiqmqQueue: 'Rpc_portal-pc-service',
    numWorkers: 1,
    log4js: {
        appenders: [
            {
                type: 'console'
            },
            {
                type: "dateFile",
                filename: __dirname + '/logs/channel-aggent-access.log',
                pattern: "_yyyy-MM-dd",
                alwaysIncludePattern: false,
                category: '[http]'
            },
            {
                type: "dateFile",
                filename: __dirname + '/logs/channel-agent.log',
                pattern: "_yyyy-MM-dd",
                alwaysIncludePattern: false,
                category: '[default]'
            }
        ],
        replaceConsole: true,
        levels: {
            dateFileLog: 'DEBUG'
        }
    },
    passportHost: "http://passport.huize.com"
};

if (process.env.NODE_ENV) {
    config.env = process.env.NODE_ENV;
}

if (process.env.PORT) {
    config.port = process.env.PORT;
}

if (process.env.REDIS_HOST) {
    config.redis.host = process.env.REDIS_HOST;
    config.redis.port = process.env.REDIS_PORT;
    config.expressSession.redis.host = process.env.REDIS_HOST;
    config.expressSession.redis.port = process.env.REDIS_PORT;
    config.expressSession.redis.prefix = process.env.REDIS_SESSION_PREFIX;
}

if (process.env.FILESERVER_HOST) {
    config.fileServer.host = process.env.FILESERVER_HOST;
    config.fileServer.port = process.env.FILESERVER_PORT;
}

if (process.env.RABBITMQ_HOST) {
    config.rabbitmq.url = "amqp://" + process.env.RABBITMQ_USER + ":" + process.env.RABBITMQ_PWD + "@" + process.env.RABBITMQ_HOST + ":" + process.env.RABBITMQ_PORT;
}

if (process.env.RABBITMQ_QUEUE) {
    config.rabbiqmqQueue = process.env.RABBITMQ_QUEUE;
}

if (process.env.PASSPORT_HOST) {
    config.passportHost = process.env.PASSPORT_HOST;
}

module.exports = config;
