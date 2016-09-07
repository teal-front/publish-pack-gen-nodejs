var Util = require('util');

var NotFoundError = module.exports = function () {
    this.name = 'NotFound';
    this.code = '00004';
    this.message = '找不到指定资源';
    
    Error.captureStackTrace(this, NotFoundError);
};

Util.inherits(NotFoundError, Error);