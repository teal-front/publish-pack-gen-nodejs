var definition = require('./code-definitions');
var Util = require('util');

var InvalidError = module.exports = function (code, message) {
    this.name = 'InvalidError';
    this.code = code || '99999';
    this.message = message || (definition[this.code] && definition[this.code].message) || '未知异常';
   
    Error.captureStackTrace(this, InvalidError);
};

Util.inherits(InvalidError, Error);