'use strict';
var redis = require("redis");
var log = require('../lib/channel-log.js');

var cache = module.exports = {
    client: {},
    __prefix: 'nodejs:',
    init: function (options) {
        if (options.prefix) this.__prefix = options.prefix;
        this.client = redis.createClient(options.port, options.host, {});
        this.client.on("error", function (err) {
            log.error("Error " + err);
        });
    },
    get: function (key, callback) {
        if (!key) return;
        this._get(this.__prefix + key, callback)
    },
    _get: function (key, callback) {
        if (!key) return;
        this.client.get(key, callback);
    },
    set: function (key, val, expire) {
        if (!key) return;
        if (typeof val === "object")
            val = JSON.stringify(val);
        this.client.set(this.__prefix + key, val);
        if (expire)
            this.client.expire(this.__prefix + key, expire);
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