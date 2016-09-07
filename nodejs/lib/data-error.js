var definition = require('./error-definitions');
var util = require('util');

var DataError = function (code, message) {
    this.name = 'DataError';
    this.code = code || '99999';
    this.message = '';
    var result = definition[this.code];

    if (result) {
        this.message = message || result.message;
    } else {
        this.message = message || '未知异常';
    }
    
    Error.captureStackTrace(this, DataError);
};

util.inherits(DataError, Error);
module.exports = DataError;
