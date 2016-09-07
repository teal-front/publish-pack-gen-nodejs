'use strict';
var redis = require("redis");
var logger = require('../log').logger;
var constants = require('../constants');

var cache = module.exports = {
    client: {},
    init: function (options) {
        if (!options.prefix) options.prefix = constants.REDIS_CACHE_PREFIX;
        this.client = redis.createClient(options);
        this.client.on("error", function (error) {
            logger.error('Error occurred! 缓存初始化失败 Message: %s, \r\n Stack: %j \r\n', error.message, error.stack, error);
        });
    },
    get: function (key, callback) {
        if (!key) return;
        this.client.get(key, callback);
    },
    set: function (key, val, expire, callback) {
        if (!key) return;
        if (typeof val === "object")
            val = JSON.stringify(val);
        var _this = this;
        this.client.set(key, val, function (err, reply) {
            if (err) {
                callback(err);
            } else {
                if (expire) {
                    _this.client.expire(key, expire);
                }
                callback(null, reply);
            }
        });       
    },
    _hset: function (key, field, val, expire) {
        if (!key) return;
        if (typeof val === "object")
            val = JSON.stringify(val);
        this.client.hset(key, field, val);
        if (expire)
            this.client.expire(key, expire);
    }
};