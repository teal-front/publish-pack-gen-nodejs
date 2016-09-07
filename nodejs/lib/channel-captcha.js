'use strict';
var ccap = require('ccap');

var str_ary = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

var gen_fuc = function () {
    var str_num = 4,
        r_num = str_ary.length,
        text = '';
    for (var i = 0; i < str_num; i++) {
        var pos = Math.floor(Math.random() * r_num)
        text += str_ary[pos];//生成随机数
    }
    return text;
};

var captcha = module.exports = {
    ccaps: {
        small: ccap({
            width: 128,
            height: 48,
            offset: 30,
            quality: 100,
            fontsize: 40,
            generate: gen_fuc
        }),
        normal: ccap({
            width: 128,
            height: 48,
            offset: 30,
            quality: 100,
            fontsize: 40,
            generate: gen_fuc
        }),
        big: ccap({
            width: 128,
            height: 48,
            offset: 30,
            quality: 100,
            fontsize: 40,
            generate: gen_fuc
        }),
        custom: ccap({
            width: 128,
            height: 48,
            offset: 30,
            quality: 100,
            fontsize: 40,
            generate: gen_fuc
        })
    },
    init: function (options) {
        if (options.prefix) this.__prefix = options.prefix;
        this.client = redis.createClient(options.port, options.host, {});
    },
    small: function () {
        return this.ccaps.small.get();
    },
    normal: function () {
        return this.ccaps.normal.get();
    },
    big: function () {
        return this.ccaps.big.get();
    },
    custom: function (options) {
        return ccap(options).get();
    }
};