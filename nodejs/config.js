'use strict';

var config = {
    env: 'development',
    port: 3000,
    // cpsHost: 'http://cpslocal.hzins.com:3000',
    redis: {
        host: '192.168.10.117',
        port: 6379
    },
    apiCacheExpire: 1800,
    fileServer: {
        mq: {url: "amqp://it:its123@192.168.10.59:5672", heartbeat: 10, type: 'file'},
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
            charset: 'utf8'
        },
        oldFileServer: {
            host: '192.168.10.50',
            port: '996'
        },
        application: 'hz-refactor-server'
    },
    expressSession: {
        key: 'nodejs_sid',
        secret: '-:D',
        resave: true,
        saveUninitialized: false,
        cookie: {
            domain: 'huize.com'
        },
        redis: {
            host: '192.168.10.117',
            port: 6379,
            prefix: 'nodejs_sess:',
            ttl: 240000
        }
    },
    log: {
        level: 'debug',
        dir: './logs'
    },
    rabbitmq: {
        url: "amqp://it:its123@192.168.10.59:5672",
        heartbeat: 10
    },
    rabbiqmqQueue: 'Rpc_portal-pc-service-DEV',
    passportHost: "http://passport.huize.com",
    oldSiteHost: "http://www.huize.com"
};

if (process.env.NODE_ENV) {
    config.env = process.env.NODE_ENV;
    if ("production" === process.env.NODE_ENV) {
        config.fileServer.dfs.trackers = [{
                host: 'trackerd1.ha.com',
                port: 22122
            }, {
                host: 'trackerd2.ha.com',
                port: 22122
            }, {
                host: 'trackerd3.ha.com',
                port: 22122
            }];
    }
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

if (process.env.REDIS_PASS) {
    config.expressSession.redis.pass = process.env.REDIS_PASS;
    config.redis.password = process.env.REDIS_PASS;
}

if (process.env.OLD_FILESERVER_HOST) {
    config.fileServer.oldFileServer.host = process.env.OLD_FILESERVER_HOST;
    config.fileServer.oldFileServer.port = process.env.OLD_FILESERVER_PORT;
}

if (process.env.RABBITMQ_HOST) {
    config.rabbitmq.url = "amqp://" + process.env.RABBITMQ_USER + ":" + process.env.RABBITMQ_PWD + "@" + process.env.RABBITMQ_HOST + ":" + process.env.RABBITMQ_PORT;
}

if (process.env.FILESERVER_RABBITMQ_HOST) {
    config.fileServer.mq.url = "amqp://" + process.env.FILESERVER_RABBITMQ_USER + ":" + process.env.FILESERVER_RABBITMQ_PWD + "@" + process.env.FILESERVER_RABBITMQ_HOST + ":" + process.env.FILESERVER_RABBITMQ_PORT;
}

if (process.env.RABBITMQ_QUEUE) {
    config.rabbiqmqQueue = process.env.RABBITMQ_QUEUE;
}

if (process.env.PASSPORT_HOST) {
    config.passportHost = process.env.PASSPORT_HOST;
}

if (process.env.LOG_LEVEL) {
    config.log.level = process.env.LOG_LEVEL;
}

module.exports = config;