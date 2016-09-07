'use strict';
var config = require('../config.js');
var amqpRPC = require('../lib/rpc');
var log = require('../lib/channel-log.js');
var cache = require('../lib/channel-cache.js');

var ChannelAPI = module.exports = {
    TYPES: {
        rabbitmq: amqpRPC
    },
    enables: {},
    _request: function (cmd, params, callback) {
        log.debug('method : %s params : %s', cmd, params);
        this.enables.request(cmd, params, function(result) {
            if (config.env == 'development')
                log.debug('result : %s %sms\n%s', cmd, result.timestamp, JSON.stringify(result));
            else {
                if (result.code != 0)
                    log.debug('result : %s\n%s', cmd, JSON.stringify(result));
            }
            try {
                callback(result);
            } catch (e) {
                log.error('rabbitmq callback error');
            }
        });
    },
    _requestFromCache: function (cmd, params, callback) {
        var _this = this,
            key = cmd + ":" + JSON.stringify(params);
        cache.get(key, function(err, reply) {
            var val = reply ? JSON.parse(reply) : '';
            if (!val) {
                _this._request(cmd, params, function(data) {
                    if (data.code == 0)
                        cache.set(key, data, 1800);
                    callback(data);
                });
            } else if (val.code == 0) {
                log.info('redis data : ' + key);
                try {
                    callback(val);
                } catch (e) {
                    log.error('redis callback error');
                }
            } else {
                _this._request(cmd, params, callback);
            }
        });
    },
    init: function (rpctype, options) {
        this.enables = this.TYPES[rpctype].init(options);
    },
    /*
        投保单相关
    */
    // 创建投保单
    createInsuranceSlips: function (params, callback) {
        this._request('InsuranceFacade.insureCreate', params, callback);
    },
    // 删除投保单
    removeInsuranceSlips: function (params, callback) {
        this._request('InsuranceFacade.insureDelete', params, callback);
    },
    // 编辑投保单
    updateInsuranceSlips: function (params, callback) {
        this._request('InsuranceFacade.insureEdit', params, callback);
    },
    // 投保单查询
    getInsuranceSlipsById: function (params, callback) {
        this._request('InsuranceFacade.insureQuery', params, callback);
    },
    // 查询健康告知
    getHealthInformByInsuranceSlipId: function (params, callback) {
        this._request('InsuranceFacade.healthInformQuery', params, callback);
    },
    // 保存健康告知
    saveHealthInform: function (params, callback) {
        this._request('InsuranceFacade.healthInformSave', params, callback);
    },
    // 投保单完善度查询
    getInsuranceSlipsPecent: function (params, callback) {
        this._request('InsuranceFacade.insure_Percent', params, callback);
    },
    // 团单模板解析
    parseGroupInsuranceSlips: function (params, callback) {
        this._request('InsuranceFacade.insureTeamAnalysis', params, callback);
    },
    /*
        购物车相关
    */
    // 已登陆获取购物车列表
    getShoppingCartItemsByUserId: function (params, callback) {
        this._request('PurchaseCartFacade.getByUserId', params, callback);
    },
    // 未登录获取购物车列表
    getShoppingCartItemsByInsuranceSlips: function (params, callback) {
        this._request('PurchaseCartFacade.getByInsuranceNums', params, callback);
    },
    // 添加至购物车
    addToShoppingCart: function (params, callback) {
        this._request('PurchaseCartFacade.add', params, callback);
    },
    // 从购物车移除
    removeFromShoppingCart: function (params, callback) {
        this._request('PurchaseCartFacade.remove', params, callback);
    },
    // 合并购物车
    combineShoppingCart: function (params, callback) {
        this._request('PurchaseCartFacade.union', params, callback);
    },
    // 验证可合并支付投保单
    checkShoppingCartCombine: function (params, callback) {
        this._request('PurchaseCartFacade.checkMergePay', params, callback);
    },
    // 检查点击全选
    checkShoppingCartSelectAll: function (params, callback) {
        this._request('PurchaseCartFacade.checkSelectAll', params, callback);
    },
    // 修改起保日期
    updatetInsuranceSlipsStartDate: function (params, callback) {
        this._request('PurchaseCartFacade.editStartDate', params, callback);
    },
    // 根据用户Id批量删除
    removeAllFromShoppingCartByUserId: function (params, callback) {
        this._request('PurchaseCartFacade.removeAllByUser', params, callback);
    },
    // 根据投保单Id列表批量删除
    removeAllFromShoppingCart: function (params, callback) {
        this._request('PurchaseCartFacade.removeAll', params, callback);
    },
    // 获取购物车中商品数量
    getShoppingCartItemsCountByUserId: function (params, callback) {
        this._request('PurchaseCartFacade.getCountByUserId', params, callback);
    },
    /*
        订单相关
    */
    // 结算投保单
    settleInsuranceSlips: function (params, callback) {
        this._request('SettlementFacade.settle', params, callback);
    },
    // 创建支付订单
    createOrder: function (params, callback) {
        this._request('OrderFacade.create', params, callback);
    },
    // 取消订单
    cancelOrder: function (params, callback) {
        this._request('OrderFacade.cancel', params, callback);
    },
    // 删除订单
    removeOrder: function (params, callback) {
        this._request('OrderFacade.remove', params, callback);
    },
    // 计算投保单金额
    calculateInsuranceSlipsAmount: function (params, callback) {
        this._request('SettlementFacade.calculateInsurances', params, callback);
    },
    // 查询订单明细
    getOrderDetail: function (params, callback) {
        this._request('OrderFacade.lookupByOrderNum', params, callback);
    },
    // 查询用户订单
    getOrdersByUser: function (params, callback) {
        this._request('OrderFacade.lookupByUser', params, callback);
    },
    /*
        支付相关
    */
    // 验证支付货币组合
    checkPaymentCombination: function (params, callback) {
        this._request('PaymentFacade.calPaymentCombination', params, callback);
    },
    // 查询网关支付方式
    getGatewayPaymentWays: function (params, callback) {
        this._request('ProductService.lookupGatewayPaymentWay', params, callback);
    },
    // 通过网关支付订单
    payByGateway: function (params, callback) {
        this._request('PaymentFacade.payByGateway', params, callback);
    },
    /*
        产品相关
    */
    // 保障详情
    getProductSecurity: function (params, callback) {
        this._request('ProductFacade.getInsuranceDetail', params, callback);
    },
    // 默认试算信息
    getProductDefaultRestrictRule: function (params, callback) {
        this._request('ProductFacade.getDefaultRestrictRule', params, callback);
    },
    // 产品详情右侧数据
    getProductRightInfo: function (params, callback) {
        this._request('ProductFacade.getInsuranceDetailRight', params, callback);
    },
    // 产品解读
    getProductAnalysis: function (params, callback) {
        this._request('ProductFacade.getProductAnalysisInfo', params, callback);
    },
    // 理赔指引
    getClaimsSettlementGuide: function (params, callback) {
        this._request('ProductFacade.getSettlingExplainInfo', params, callback);
    },
    // 常见问题
    getProductFAQ: function (params, callback) {
        this._request('ProductFacade.getFAQList', params, callback);
    },
    // 根据产品ID获取评论和理赔反馈
    getProductCommentsByProduct: function (params, callback) {
        this._request('ProductFacade.getProductCommentList', params, callback);
    },
    // 根据用户ID获取评论
    getProductCommentsByUser: function (params, callback) {
        this._request('ProductFacade.getUserCommentList', params, callback);
    },
    // 根据评论ID获取评论
    getProductComments: function (params, callback) {
        this._request('ProductFacade.getCommentById', params, callback);
    },
    // 获取评论数
    getProductCommentsCount: function (params, callback) {
        this._request('ProductFacade.getCommentCountByType', params, callback);
    },
    // 发表评论和理赔反馈
    createProductComments: function (params, callback) {
        this._request('ProductFacade.sendComment', params, callback);
    },
    // 修改评论
    updateProductComments: function (params, callback) {
        this._request('ProductFacade.editComment', params, callback);
    },
    // 删除评论
    removeProductComments: function (params, callback) {
        this._request('ProductFacade.removeComment', params, callback);
    },
    // 专属客服
    getProductCustomerService: function (params, callback) {
        this._request('ProductFacade.getCustomServiceInfo', params, callback);
    },
    // 产品营销策略
    getProductInsidePayment: function (params, callback) {
        this._request('ProductFacade.getSalePromotion', params, callback);
    },
    // 试算接口
    getProductRestrictRule: function (params, callback) {
        this._request('ProductFacade.getRestrictRule', params, callback);
    },
    // 产品推荐组合
    getProductRecommendProgram: function (params, callback) {
        this._request('ProductFacade.getProductGroupList', params, callback);
    },
     // 产品收藏
    collectProduct: function (params, callback) {
        this._request('ProductFacade.productCollect', params, callback);
    },
    // 产品对比
    compareProducts: function (params, callback) {
        this._request('ProductFacade.getProductCompareInfo', params, callback);
    },
    // 计划对比
    compareProductPlans: function (params, callback) {
        this._request('ProductFacade.getPlanCompareInfo', params, callback);
    },
    // 投保详情页
    getInsurePage: function (params, callback) {
        this._request('ProductFacade.getProductAttrs', params, callback);
    },
    // 满意度及用户印象
    getSatisfactionAndImpression: function (params, callback) {
        this._request('ProductFacade.getSatisfaction', params, callback);
    },
    // 根据计划ID批量查询计划信息
    getPlansByIds: function (params, callback) {
        this._request('ProductFacade.getSimplePlanInfo', params, callback);
    },
    // 根据计划ID批量查询计划信息
    getProductOccupationalCategories: function (params, callback) {
        this._request('ProductFacade.getAllJobByProductId', params, callback);
    },
    /*
        用户相关
    */
    // 查询用户寄送地址
    gethUserShipAddress: function (params, callback) {
        this._request('UserFacade.lookupShipAddress', params, callback);
    },
    // 获取用户常用联系人
    getUserContacts: function (params, callback) {
        this._request('InsuranceFacade.insureFavoriteContactQuery', params, callback);
    },
    // 删除用户常用联系人
    removeUserContacts: function (params, callback) {
        this._request('InsuranceFacade.insureFavoriteContactDestory', params, callback);
    },
    // 查询用户可累加货币统计
    getUserBalanceByCurrency: function (params, callback) {
        this._request('AccountFacade.lookupAccountBalanceByCurrency', params, callback);
    },
    // 查询用户可累加货币的冻结明细
    getUserFreezedBalanceByCurrency: function (params, callback) {
        this._request('AccountFacade.lookupFreezedBalanceByCurrency', params, callback);
    },
    // 查询用户红包
    getUserRedEnvelope: function (params, callback) {
        this._request('AccountFacade.lookupRedEnvelope', params, callback);
    },
    // 激活用户红包
    activeUserRedEnvelope: function (params, callback) {
        this._request('AccountFacade.active', params, callback);
    }
};
