var crypto = require('crypto');

var Util = {
    encrypt: function (str) {
        var key = new Buffer('DESwww.h');
        var iv = new Buffer([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        var plaintext = str;
        var alg = 'des-cbc';
        var autoPad = true;

        var cipher = crypto.createCipheriv(alg, key, iv);
        var strs = cipher.update(plaintext, 'utf8', 'base64');
        strs += cipher.final('base64');
        return strs;
    },
    decrypt: function (str) {
        var key = new Buffer('DESwww.h');
        var iv = new Buffer([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        var plaintext = str;
        var alg = 'des-cbc';
        var autoPad = true;

        var decipher = crypto.createDecipheriv(alg, key, iv);
        var strs = decipher.update(plaintext, 'base64', 'utf8');
        strs += decipher.final('utf8');
        return strs;
    },
    encryptToInt: function (str) {
        var key = new Buffer('$1$@#23e');
        var iv = new Buffer([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        var plaintext = str;
        var alg = 'des-cbc';
        var autoPad = true;

        var cipher = crypto.createCipheriv(alg, key, iv);
        var strs = cipher.update(plaintext, 'utf8', 'base64');
        strs += cipher.final('base64');
        strs = strs.replace(/\+/g, '*').replace(/\//g, '-').replace(/\=/g, '!');
        var buf = new Buffer(strs), result = [];
        for (var i = 0; i < buf.length; i++) {
            result[i] = buf[i];
        }
        return result.join('_');
    },
    decryptToInt: function (str) {
        var key = new Buffer('$1$@#23e');
        var iv = new Buffer([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        var plaintext = str;
        var alg = 'des-cbc';
        var autoPad = true;

        var decipher = crypto.createDecipheriv(alg, key, iv);
        plaintext = plaintext.split('_');
        var buf = new Buffer(plaintext);
        plaintext = buf.toString();
        plaintext = plaintext.replace(/\*/g, '+').replace(/\-/g, '/').replace(/\!/g, '=');
        var strs = decipher.update(plaintext, 'base64', 'utf8');
        strs += decipher.final('utf8');
        return strs;
    }
};

module.exports = Util;
