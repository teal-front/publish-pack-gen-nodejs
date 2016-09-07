var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var utils = require('../../lib/utils');
var channel = require('../../lib/rpc/channel-api');
var RpcError = require('../../lib/errors/rpc');
var policies = require('../../lib/policies');
var constants = require('../../lib/constants');
var UserService = require('../../lib/services/user-service');
var Validator = require('../../lib/validator');

// 判断用户是否登陆
router.get('/islogin', function (req, res, next) {
    utils.checkLoginState(req)
        .then(function (result) {
            if (result) {
                res.sendNormal(true);
            } else {
                res.status(200)
                    .send({
                        status: '00001',
                        result: '',
                        message: '用户尚未登录，请先登录'
                    });
            }
        })
        .catch(res.sendError);
});

// 常用联系人读取
router.get('/contacts', policies.loginAuth);
router.get('/contacts', function (req, res, next) {
    var id = req.session.user.UserId;

    UserService.fetchContacts(id)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 常用联系人删除
router.delete('/contacts/:contactId', policies.loginAuth);
router.delete('/contacts/:contactId', function (req, res, next) {
    var contactId = req.params.contactId;
    
    new Validator(contactId).isNotEmpty().isNumber().validate()
        .then(UserService.removeContact)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 获取专属客服
router.get('/customer-service', policies.loginAuth);
router.get('/customer-service', function (req, res, next) {
    var userId = req.session.user.UserId;

    UserService.fetchCustomerService(userId)
        .then(function (result) {
            result.userId = userId;
            return result;
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 查询用户可累加货币统计
router.get('/balance', policies.loginAuth);
router.get('/balance', function (req, res, next) {
    var userId = req.session.user.UserId;
    var currencyId = parseInt(req.query.currencyId || constants.CURRENCY_TYPE.BALANCE);

    UserService.fetchBalance(userId, currencyId)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 查询用户可累加货币的冻结明细
router.get('/frozen-balance', policies.loginAuth);
router.get('/frozen-balance', function (req, res, next) {
    var userId = req.session.user.UserId;
    var currencyId = req.query.currencyId;

    UserService.fetchFrozenBalance(userId, currencyId)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 激活用户红包
router.post('/actived/red-envelope', policies.loginAuth);
router.post('/actived/red-envelope', function (req, res, next) {
    var body = req.body.data;
    
    new Validator(body).isNotEmpty().isString().validate()
        .then(function (result) {
            body = JSON.parse(result);
            
            var userId = req.session.user.UserId;
            var redEnvelopeNo = body.redEnvelopeNum;
            
            return UserService.activeRedEnvelope(userId, redEnvelopeNo);
        })
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 查询用户寄送地址
router.get('/addresses', policies.loginAuth);
router.get('/addresses', function (req, res, next) {
    var userId = req.session.user.UserId;

    UserService.fetchAddresses(userId)
        .then(res.sendNormal)
        .catch(res.sendError);
});

// 修改用户寄送地址
router.put('/addresses/:id', policies.loginAuth);
router.put('/addresses/:id', function (req, res, next) {
    var id = req.params.id;
    var body = req.body.data;
    
    Promise.all([
            new Validator(body).isNotEmpty().isString().validate(),
            new Validator(id).isNotEmpty().isNumber().validate()
        ])
        .then(function (results) {
            body = JSON.parse(results[0]);
            body.id = results[1];
            body.userId = req.session.user.UserId;
            return body;
        })
        .then(UserService.updateAddress)
        .then(res.sendNormal)
        .catch(res.sendError);
});

module.exports = router;
