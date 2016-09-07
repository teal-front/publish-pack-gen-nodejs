var definition = require('./code-definitions');
var Util = require('util');

var RpcError = module.exports = function (code, message) {
    this.name = 'RpcError';
    
    if (-1 === code) {
        try {
            var subErrorObj = JSON.parse(message);
            code = parseInt(subErrorObj.status);
            message = subErrorObj.exception;
        } catch (error) {}
    }
    
    this.code = code || '99999';
    this.message = (definition[this.code] && definition[this.code].message) || message || '未知异常';
    
    Error.captureStackTrace(this, RpcError);
};

Util.inherits(RpcError, Error);
