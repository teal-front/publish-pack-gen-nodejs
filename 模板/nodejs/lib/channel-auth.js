var crypto = require('crypto');

function CAuth() {
    this.config = {
        des: {
            key: '12345678',
            iv: '12345678',
            alg: 'des-cbc'
        },
        cookie: {
            key: 'ap_token'
        }
    };
}

module.exports = CAuth;

CAuth.prototype.init = function (config) {
    for (var k in config) {
        this.config[k] = config[k];
    }
};

CAuth.prototype.encrypt = function (str) {
    var key = new Buffer(this.config.des.key);
    var iv = new Buffer(this.config.des.iv);
    var plaintext = str;
    var alg = this.config.des.alg;

    var cipher = crypto.createCipheriv(alg, key, iv);
    var ciph = cipher.update(plaintext, 'utf8', 'hex');
    ciph += cipher.final('hex');
    return new Buffer(ciph).toString('base64');
};

CAuth.prototype.decrypt = function (str) {
    var key = new Buffer(this.config.des.key);
    var iv = new Buffer(this.config.des.iv);
    var plaintext = new Buffer(str, 'base64').toString('ascii');
    var alg = this.config.des.alg;

    var decipher = crypto.createDecipheriv(alg, key, iv);
    var txt = decipher.update(plaintext, 'hex', 'utf8');
    txt += decipher.final('utf8');
    return txt;
};

CAuth.prototype.setAuthCookie = function (req, res, val) {
    if (typeof val == 'object')
        val = JSON.stringify(val);
    res.cookie(this.config.cookie.key, this.encrypt(val), {
        domain: '',
        path: '/',
        httpOnly: true
    });
};

CAuth.prototype.authCookie = function (req, res) {
    return this.decrypt(req.cookies[this.config.cookie.key]);
};

module.exports.init = function (opt) {
    return new CAuth(opt);
};