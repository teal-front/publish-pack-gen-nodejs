var Util = require('util');
var InvalidError = require('./errors/invalid');
var logger = require('./log').logger;

var Validator = module.exports = function (param) {
    this.validations = [];
    this.param = param;
    this.canValidate = false;
};

Validator.prototype = {
    validate: function () {
        var _this = this;
        if (0 === this.validations.length) {
            return Promise.resolve(this.param);
        }
        
        return Promise.all(_this.validations)
            .then(function (results) {
                return _this.param;
            });
    },
    __isNullOrUndefined: function () {
        if (!this.canValidate) {
            if(Util.isNullOrUndefined(this.param)) {
                return Promise.reject(new InvalidError("00005"));
            } else {
                this.canValidate = true;
                return Promise.resolve(this.param);
            }
        } else {
            return Promise.resolve(this.param);
        }
    },
    isNotEmpty: function () {
        var _this = this;
        this.validations.push(function () {
            return _this.__isNullOrUndefined()
                .then(function (result) {
                    if (Util.isArray(_this.param) || Util.isString(_this.param)) {
                        if (0 === _this.param.length) {
                            return Promise.reject(new InvalidError("00006"));
                        } else {
                            return _this.param;
                        }
                    } else {
                        return _this.param;
                    }
                });
        }());
        return this;
    },
    isNumber: function () {
        var _this = this;
        this.validations.push(function () {
            return _this.__isNullOrUndefined()
                .then(function (result) {
                    if(Util.isString(_this.param)) {
                        _this.param = parseInt(_this.param);
                    }
                    
                    if (isNaN(_this.param)) {
                        return Promise.reject(new InvalidError("00006"));
                    }
                    
                    if (Util.isNumber(_this.param)) {
                        return _this.param;
                    } else {
                        return Promise.reject(new InvalidError("00006"));
                    }
                });
        }());
        return this;
    },
    isArray: function () {
        var _this = this;
        this.validations.push(function () {
            return _this.__isNullOrUndefined()
                .then(function (result) { 
                    if (Util.isArray(_this.param)) {
                        return _this.param;
                    } else {
                        return Promise.reject(new InvalidError("00006"));
                    }
                });
        }());
        return this;
    },
    isObejct: function () {
        var _this = this;
        this.validations.push(function () {
            return _this.__isNullOrUndefined()
                .then(function (result) { 
                    if (Util.isObject(_this.param)) {
                        return _this.param;
                    } else {
                        return Promise.reject(new InvalidError("00006"));
                    }
                });
        }());
        return this;
    },
    isBoolean: function () {
        var _this = this;
        this.validations.push(function () {
            return _this.__isNullOrUndefined()
                .then(function (result) { 
                    if (Util.isBoolean(_this.param)) {
                        return _this.param;
                    } else {
                        return Promise.reject(new InvalidError("00006"));
                    }
                });
        }());
        return this;
    },
    isString: function () {
        var _this = this;
        this.validations.push(function () {
            return _this.__isNullOrUndefined()
                .then(function (result) { 
                    if (Util.isString(_this.param)) {
                        return _this.param;
                    } else {
                        return Promise.reject(new InvalidError("00006"));
                    }
                });
        }());
        return this;
    },
    isDateString: function () {
        var _this = this;
        this.validations.push(function () {
            return _this.__isNullOrUndefined()
                .then(function (result) { 
                    if (Util.isString(_this.param)) {
                        var matchResult = _this.param.match(/^(\d{4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
                        if (matchResult === null) {
                            return Promise.reject(new InvalidError("00006"));
                        }
                        var tmpDate = new Date(matchResult[1], matchResult[3] - 1, matchResult[4]);
                        if (tmpDate.getFullYear() == matchResult[1] && tmpDate.getMonth() + 1 == matchResult[3] 
                            && tmpDate.getDate() == matchResult[4]) {
                            return _this.param;
                        } else {
                            return Promise.reject(new InvalidError("00006"));
                        }
                    } else {
                        return Promise.reject(new InvalidError("00006"));
                    }
                });
        }());
        return this;
    }
};