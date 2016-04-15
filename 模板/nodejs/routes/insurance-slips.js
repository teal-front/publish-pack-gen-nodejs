var express = require('express');
var router = express.Router();
var channel = require('../lib/channel-api');
var DataError = require('../lib/data-error');
var _ = require('lodash');

// 创建投保单
router.post('/', function (req, res, next) {
    var body = JSON.parse(req.body.data);

    _.forEach(body, function (insuranceSlips) {
        if (req.session.user) {
            insuranceSlips.userId = req.session.user.UserId;
            insuranceSlips.userName = req.session.user.LoginName;
        } else {
            insuranceSlips.userId = null;
        }
    });
    
    var create = function (insurance) {
        return new Promise(function (resolve, reject) {
            channel.createInsuranceSlips([insurance], function (result) { 
                if (result.code === 0 ) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (record) {
        res.status(200)
            .send({status: "00000", result: record, message: ""});
    };

    var handleError = function (error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    create(body)
        .then(sendResponse)
        .catch(handleError);
});

// 编辑投保单
router.put('/:id', function (req, res, next) {
    var body = req.body;

    if (req.session.user) {
        body.userId = req.session.user.UserId;
    } else {
        body.userId = null;
    }

    var update = function (params) {
        return new Promise(function (resolve, reject) {
            channel.updateInsuranceSlips([params], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (record) {
        res.status(200)
            .send({status: "00000", result: record, message: ""});
    };

    var handleError = function (error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    update(body)
        .then(sendResponse)
        .catch(handleError);
});

// 投保单查询
router.get('/:id', function (req, res, next) {
    var id = req.params.id;

    var queryById = function (insuranceSlipId) {
        return new Promise(function (resolve, reject) {
            channel.getInsuranceSlipsById([insuranceSlipId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (record) {
        res.status(200)
            .send({status: "00000", result: record, message: ""});
    };

    var handleError = function (error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    queryById(id)
        .then(sendResponse)
        .catch(handleError);
});

// 查询健康告知
router.get('/:id/health-inform', function (req, res, next) {
    var id = parseInt(req.params.id || 0);

    var queryByInsuranceSlipId = function (insuranceSlipId) {
        return new Promise(function(resolve, reject) {
            channel.getHealthInformByInsuranceSlipId([insuranceSlipId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (record) {
        res.status(200)
            .send({status: "00000", result: record, message: ""});
    };

    var handleError = function (error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    queryByInsuranceSlipId(id)
        .then(sendResponse)
        .catch(handleError);
});

// 保存健康告知
router.post('/:id/health-inform', function (req, res, next) {
    var id = parseInt(req.params.id || 0);
    var answer = req.body.data;

    var save = function (insuranceSlipId, _answer) {
        return new Promise(function(resolve, reject) {
            channel.saveHealthInform([insuranceSlipId, _answer], function (result) {
                if (result.code === 0) {
                    resolve(result.data || '');
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (record) {
        res.status(200)
            .send({status: "00000", result: record, message: ""});
    };

    var handleError = function (error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    save(id, answer)
        .then(sendResponse)
        .catch(handleError);
});

// 团单模板解析
router.get('/groups/parse-excel', function (req, res, next) {
    var fileId = req.query.fileId;

    var parse = function (_fileId) {
        return new Promise(function (resolve, reject) {
            channel.parseGroupInsuranceSlips([_fileId], function (result) {
                if (result.code === 0) {
                    resolve(result.data || []);
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (record) {
        res.status(200)
            .send({status: "00000", result: record, message: ""});
    };

    var handleError = function (error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    parse(fileId)
        .then(sendResponse)
        .catch(handleError);
});

// 修改起保日期
router.put('/:id/start-date', function (req, res, next) {
    var body = req.body;

    if (req.session.user) {
        body.userId = req.session.user.UserId;
    } else {
        body.userId = null;
    }

    var update = function (params) {
        return new Promise(function (resolve, reject) {
            channel.updatetInsuranceSlipsStartDate([params.userId, params.insureNum, params.startDate], function (result) {
                if (result.code === 0) {
                    resolve(result.data || '');
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function(result) {
        res.status(200)
            .send({
                status: "00000",
                result: result,
                message: ""
            });
    };

    var handleError = function(error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    update(body)
        .then(sendResponse)
        .catch(handleError);
});

// 计算投保单金额
router.post('/amount/choosed', function (req, res, next) {
    var body = JSON.parse(req.body.data);
    var params = {
        user: {
            userId: (req.session.user && req.session.user.UserId) || null
        },
        items: body
    };

    var calculate = function (_params) {
        return new Promise(function (resolve, reject) {
            channel.calculateInsuranceSlipsAmount([_params], function (result) {
                if (result.code === 0) {
                    resolve(result.data || {});
                } else {
                    reject(new DataError(result.code));
                }
            });
        });
    };

    var sendResponse = function (result) {
        res.status(200)
            .send({status: "00000", result: result, message: ""});
    };

    var handleError = function (error) {
        console.log(error);
        var result = {};

        if (error instanceof DataError) {
            result.code = error.code;
            result.message = error.message;
        } else {
            result.code = '99999';
            result.message = '未知异常';
        }
        result.result = '';

        res.status(200)
            .send(result);
    };

    calculate(params)
        .then(sendResponse)
        .catch(handleError);
});

module.exports = router;
