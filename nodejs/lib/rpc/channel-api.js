'use strict';
var config = require('../../config.js');
var amqpRPC = require('./rpc');
var pLogger = require('../log').performanceLogger;
var logger = require('../log').logger;
var cache = require('./channel-cache.js');

var ChannelAPI = module.exports = {
    TYPES: {
        rabbitmq: amqpRPC
    },
    enables: {},
    _request: function(cmd, params, callback) {
        logger.info('method : %s params : %s', cmd, params);
        var start = Date.now();
        this.enables.request(cmd, params, function(result) {
            logger.info('result : %s %s %sms', cmd, result.code, result.timestamp);
            pLogger.info('start[%s] time[%s] tag[rpc#%s]', start, Date.now() - start, cmd);
            callback(result);
        });
    },
    _requestFromCache: function(cmd, params, callback, expire) {
        logger.info('method from cache : %s params : %s', cmd, params);
        var _this = this,
            key = cmd + ":" + JSON.stringify(params);
        var start = Date.now();
        cache.get(key, function(err, reply) {
            var val = reply ? JSON.parse(reply) : '';
            if (val && val.code == 0) {
                logger.info('redis data : ' + key);
                pLogger.info('start[%s] time[%s] tag[rpc#%s]', start, Date.now() - start, cmd);
                callback(val);
            } else {
                _this._request(cmd, params, function(data) {
                    if (data.code == 0)
                        cache.set(key, data, expire || config.apiCacheExpire, function() {});
                    callback(data);
                });
            }
        });
    },
    init: function(rpctype, options) {
        this.enables = this.TYPES[rpctype].init(options);
    },
    /*
        投保单相关
    */
    // 创建投保单
    createInsuranceSlips: function(params, callback) {
        this._request('InsuranceFacade.insureCreate', params, callback);
    },
    // 删除投保单
    removeInsuranceSlips: function(params, callback) {
        this._request('InsuranceFacade.insureDelete', params, callback);
    },
    // 编辑投保单
    updateInsuranceSlips: function(params, callback) {
        this._request('InsuranceFacade.insureEdit', params, callback);
    },
    // 投保单查询
    getInsuranceSlipsById: function(params, callback) {
        this._request('InsuranceFacade.insureQuery', params, callback);
    },
    // 查询健康告知
    getHealthInformByInsuranceSlipId: function(params, callback) {
        this._request('InsuranceFacade.healthInformQuery', params, callback);
    },
    // 保存健康告知
    saveHealthInform: function(params, callback) {
        this._request('InsuranceFacade.healthInformSave', params, callback);
    },
    // 投保单完善度查询
    getInsuranceSlipsPecent: function(params, callback) {
        this._request('InsuranceFacade.insure_Percent', params, callback);
    },
    // 团单模板解析
    parseGroupInsuranceSlips: function(params, callback) {
        this._request('InsuranceFacade.insureTeamAnalysis', params, callback);
    },
    // 机场信息获取
    getInsuranceSlipsAirportList: function(callback) {
        this._request('InsuranceFacade.findAirportCityInfoList', [], callback);
    },
    // 获取续保人信息
    getInsuredOfRenewal: function(params, callback) {
        this._request('InsuranceFacade.renewalInsuredPersonTake', params, callback);
    },
    // 判断投保单是否删除
    checkInsuranceSlipsIsReady: function(params, callback) {
        this._request('InsuranceFacade.policyIsDelete', params, callback);
    },
    /*
        购物车相关
    */
    // 已登陆获取购物车列表
    getShoppingCartItemsByUserId: function(params, callback) {
        this._request('PurchaseCartFacade.getByUserId', params, callback);
    },
    // 未登录获取购物车列表
    getShoppingCartItemsByInsuranceSlips: function(params, callback) {
        this._request('PurchaseCartFacade.getByInsuranceNums', params, callback);
    },
    // 添加至购物车
    addToShoppingCart: function(params, callback) {
        this._request('PurchaseCartFacade.add', params, callback);
    },
    // 从购物车移除
    removeFromShoppingCart: function(params, callback) {
        this._request('PurchaseCartFacade.remove', params, callback);
    },
    // 从购物车移除规划
    removePlanFromShoppingCart: function(params, callback) {
        this._request('PurchaseCartFacade.removeProject', params, callback);
    },
    // 合并购物车
    combineShoppingCart: function(params, callback) {
        this._request('PurchaseCartFacade.union', params, callback);
    },
    // 验证可合并支付投保单
    checkShoppingCartCombine: function(params, callback) {
        this._request('PurchaseCartFacade.checkMergePay', params, callback);
    },
    // 检查点击全选
    checkShoppingCartSelectAll: function(params, callback) {
        this._request('PurchaseCartFacade.checkSelectAll', params, callback);
    },
    // 修改起保日期
    updatetInsuranceSlipsStartDate: function(params, callback) {
        this._request('PurchaseCartFacade.editStartDate', params, callback);
    },
    // 根据用户Id批量删除
    removeAllFromShoppingCartByUserId: function(params, callback) {
        this._request('PurchaseCartFacade.removeAllByUser', params, callback);
    },
    // 根据投保单Id列表批量删除
    removeAllFromShoppingCart: function(params, callback) {
        this._request('PurchaseCartFacade.removeByInsuranceNums', params, callback);
    },
    // 获取购物车中商品数量
    getShoppingCartItemsCountByUserId: function(params, callback) {
        this._request('PurchaseCartFacade.getCountByUserId', params, callback);
    },
    /*
        订单相关
    */
    // 结算投保单
    settleInsuranceSlips: function(params, callback) {
        this._request('SettlementFacade.postSettle', params, callback);
    },
    // 获取结算信息
    getSettlementDetail: function(params, callback) {
        this._request('SettlementFacade.getSettle', params, callback);
    },
    // 创建支付订单
    createOrder: function(params, callback) {
        this._request('OrderFacade.create', params, callback);
    },
    // 取消订单
    cancelOrder: function(params, callback) {
        this._request('OrderFacade.cancel', params, callback);
    },
    // 删除订单
    removeOrder: function(params, callback) {
        this._request('OrderFacade.remove', params, callback);
    },
    // 计算投保单金额
    calculateInsuranceSlipsAmount: function(params, callback) {
        this._request('SettlementFacade.calculateInsurances', params, callback);
    },
    // 查询订单明细
    getOrderDetail: function(params, callback) {
        this._request('OrderQueryFacade.lookupByOrderNum', params, callback);
    },
    // 查询用户订单
    getOrdersByUser: function(params, callback) {
        this._request('OrderQueryFacade.lookupByUser', params, callback);
    },
    // 计算支付货币组合
    caculatePaymentCombination: function(params, callback) {
        this._request('SettlementFacade.verifyPaymentCombination', params, callback);
    },
    // 查询用户账户内站内支付货币详情
    getSettlementAvailableBalance: function(params, callback) {
        this._request('AccountFacade.getDetailedAccountBalanceInfo', params, callback);
    },
    // 根据订单号获取结算对象
    getSettlementDetailByOrder: function(params, callback) {
        this._request('SettlementFacade.lookupSettlementByOrder', params, callback);
    },
    /*
        支付相关
    */

    // 查询网关支付方式
    getGatewayPaymentWays: function(params, callback) {
        this._request('PaymentFacade.lookupPaymentGateways', params, callback);
    },
    // 通过网关支付订单
    payByGateway: function(params, callback) {
        this._request('PaymentFacade.payByGateway', params, callback);
    },
    // 查询网关支付结果
    getPaymentResult: function(params, callback) {
        this._request('PaymentFacade.lookupPaymentResult', params, callback);
    },
    /*
        产品相关
    */
    // 保障详情
    getProductSecurity: function(params, callback) {
        this._request('ProductFacade.getInsuranceDetail', params, callback);
        // this._requestFromCache('ProductFacade.getInsuranceDetail', params, callback);
    },
    // 默认试算信息
    getProductDefaultRestrictRule: function(params, callback) {
        this._request('ProductFacade.getDefaultRestrictRule', params, callback);
        // this._requestFromCache('ProductFacade.getDefaultRestrictRule', params, callback);
    },
    // 产品详情右侧数据
    getProductRightInfo: function(params, callback) {
        this._request('ProductFacade.getInsuranceDetailRight', params, callback);
        // this._requestFromCache('ProductFacade.getInsuranceDetailRight', params, callback);
    },
    // 产品解读
    getProductAnalysis: function(params, callback) {
        this._request('ProductFacade.getProductAnalysisInfo', params, callback);
        // this._requestFromCache('ProductFacade.getProductAnalysisInfo', params, callback);
    },
    // 理赔指引
    getClaimsSettlementGuide: function(params, callback) {
        this._request('ProductFacade.getSettlingExplainInfo', params, callback);
        // this._requestFromCache('ProductFacade.getSettlingExplainInfo', params, callback);
    },
    // 常见问题
    getProductFAQ: function(params, callback) {
        this._request('ProductFacade.getFAQList', params, callback);
        // this._requestFromCache('ProductFacade.getFAQList', params, callback);
    },
    // 根据产品ID获取评论和理赔反馈
    getProductCommentsByProduct: function(params, callback) {
        this._request('ProductFacade.getProductCommentList', params, callback);
        // this._requestFromCache('ProductFacade.getProductCommentList', params, callback);
    },
    // 根据用户ID获取评论
    getProductCommentsByUser: function(params, callback) {
        this._request('ProductFacade.getUserCommentList', params, callback);
    },
    // 根据评论ID获取评论
    getProductComments: function(params, callback) {
        this._request('ProductFacade.getCommentById', params, callback);
    },
    // 获取评论数
    getProductCommentsCount: function(params, callback) {
        this._request('ProductFacade.getCommentCountByType', params, callback);
        // this._requestFromCache('ProductFacade.getCommentCountByType', params, callback);
    },
    // 发表评论和理赔反馈
    createProductComments: function(params, callback) {
        this._request('ProductFacade.sendComment', params, callback);
    },
    // 修改评论
    updateProductComments: function(params, callback) {
        this._request('ProductFacade.editComment', params, callback);
    },
    // 删除评论
    removeProductComments: function(params, callback) {
        this._request('ProductFacade.removeComment', params, callback);
    },
    // 专属客服
    getProductCustomerService: function(params, callback) {
        this._request('ProductFacade.getCustomServiceInfo', params, callback);
    },
    // 产品营销策略
    getProductInsidePayment: function(params, callback) {
        this._request('ProductFacade.getSalePromotion', params, callback);
        // this._requestFromCache('ProductFacade.getSalePromotion', params, callback);
    },
    // 试算接口
    getProductRestrictRule: function(params, callback) {
        this._request('ProductFacade.getRestrictRule', params, callback);
    },
    // 产品推荐组合
    getProductRecommendProgram: function(params, callback) {
        this._request('ProductFacade.getProductGroupList', params, callback);
        // this._requestFromCache('ProductFacade.getProductGroupList', params, callback);
    },
    // 产品收藏
    collectProduct: function(params, callback) {
        this._request('ProductFacade.productCollect', params, callback);
    },
    // 产品对比
    compareProducts: function(params, callback) {
        this._request('ProductFacade.getProductCompareInfo', params, callback);
    },
    // 计划对比
    compareProductPlans: function(params, callback) {
        this._request('ProductFacade.getPlanCompareInfo', params, callback);
    },
    // 投保详情页
    getInsurePage: function(params, callback) {
        this._request('ProductFacade.getProductAttrs', params, callback);
    },
    // 满意度及用户印象
    getSatisfactionAndImpression: function(params, callback) {
        this._request('ProductFacade.getSatisfaction', params, callback);
    },
    // 根据计划ID批量查询计划信息
    getPlansByIds: function(params, callback) {
        this._request('ProductFacade.getSimplePlanInfo', params, callback);
    },
    // 根据计划ID批量查询计划信息
    getProductOccupationalCategories: function(params, callback) {
        this._request('ProductFacade.getAllJobByProductId', params, callback);
    },
    // 根据计划ID获取典型案例
    getProductTypicalCases: function(params, callback) {
        this._request('ProductFacade.getProductInsureCase', params, callback);
    },
    // 获取所有产品分类
    getAllProductsCategories: function(params, callback) {
        // this._request('ProductFacade.getCategoryTree', params, callback);
        this._requestFromCache('ProductFacade.getCategoryTree', params, callback, 300);
    },
    // 获取产品出单状态
    getProductIssuingState: function (params, callback) {
        this._request('ProductFacade.getPolicyManageInfo', params, callback);
    },
    // 通过计划获取相似产品
    getSimilarProductByPlan: function (params, callback) {
        this._request('ProductFacade.getReplacePlanDetail', params, callback);
    },
    // 投保试算接口
    getInsuranceRestrictRule: function (params, callback) {
        this._request('ProductFacade.getRestrictRuleInsure', params, callback);
    },
    // 获取评论页信息
    getProductCommentsPageInfo: function (params, callback) {
        this._request('ProductFacade.getCommentPageInfo', params, callback);
    },
    /*
        用户相关
    */
    // 查询用户寄送地址
    gethUserShipAddress: function(params, callback) {
        this._request('UserFacade.lookupShipAddress', params, callback);
    },
    // 获取用户常用联系人
    getUserContacts: function(params, callback) {
        this._request('InsuranceFacade.insureFavoriteContactQuery', params, callback);
    },
    // 删除用户常用联系人
    removeUserContacts: function(params, callback) {
        this._request('InsuranceFacade.insureFavoriteContactDestory', params, callback);
    },
    // 查询用户可累加货币统计
    getUserBalanceByCurrency: function(params, callback) {
        this._request('AccountFacade.lookupAccountBalanceByCurrency', params, callback);
    },
    // 查询用户可累加货币的冻结明细
    getUserFreezedBalanceByCurrency: function(params, callback) {
        this._request('AccountFacade.lookupFreezedBalanceByCurrency', params, callback);
    },
    // 查询用户红包
    getUserRedEnvelope: function(params, callback) {
        this._request('AccountFacade.lookupRedEnvelope', params, callback);
    },
    // 激活用户红包
    activeUserRedEnvelope: function(params, callback) {
        this._request('AccountFacade.activateRedEnvelope', params, callback);
    },
    // 地址相关
    getAddresses: function(params, callback) {
        this._request('AreaFacade.getByLevelAndCode', params, callback);
    },
    // 解冻站内支付货币
    unfreezeUserCurrency: function(params, callback) {
        this._request('AccountFacade.unfreezeCurrenciesInOrder', params, callback);
    },
    // 修改寄送地址
    updateUserAddress: function(params, callback) {
        this._request('UserFacade.updateShipAddress', params, callback);
    },
	/*
		二期(主页相关)
	*/
	// 获取首页运营图片
	getIndexPageImages: function (params, callback) {
		this._request('HomePageProviderFacade.getOperatePictures', params, callback);
	}, 
	// 推荐4条新闻
	getRecommendNews: function (params, callback) {
		this._request('HomePageProviderFacade.getRecommendNews', params, callback);
	}, 
    // 获取首页友情链接
	getFriendlyLinks: function (params, callback) {
		this._request('HomePageProviderFacade.getFriendlyLink', params, callback);
	},
    /*
		二期(产品列表相关)
	*/
    // 查询产品列表页数据
    getProductList: function(params, callback) {
        this._request('ProductPageProviderFacade.getProductPageData', params, callback);
    },
    // 查询选购指南
    getProductCategoryFAQ: function(params, callback) {
        this._request('ProductPageProviderFacade.getProductGuide', params, callback);
    },
    // 根据分类ID获取推荐热销产品
    getRecommendProductsByCategory: function(params, callback) {
        this._request('ProductFacade.getRecommendProduct', params, callback);
    },
	// 获取产品排行
	getTopProductsByCategory: function (params, callback) {
        this._request('ProductPageProviderFacade.getProductRanklist', params, callback);
    },
    getPagePathNav: function(params, callback) { //根据小类ID 查找父类和同类ID
        this._request('ProductPageProviderFacade.getPagePathNav', params, callback);
    },
    getChindrenCategories:function(params, callback){//根据大类ID查找小类列表
        this._request('ProductPageProviderFacade.getChindrenCategories', params, callback);
    },
    /*
		二期(保险公司相关)
	*/
    // 获取保险公司列表
    getCompanyList: function(params, callback) {
        this._request('CompanyPageProviderFacade.getCompanyList', params, callback);
    },
    // 获取保险公司产品列表
    getCompanyProductList: function(params, callback) {
        this._request('ProductPageProviderFacade.getProductByCompany', params, callback);
    },
    // 获取保险公司描述信息和保险公司的类目列表
    getCompanyPageInfo: function (params, callback) {
        this._request('CompanyPageProviderFacade.getCompanyPageInfo', params, callback);
    },
    // // 查询保险公司描述
    // getCompanyDescription: function (params, callback) {
    // 	this._request('CompanyPageProviderFacade.getCompanyDescribe', params, callback);
    // },
    /*
		二期(专题相关)
	*/
	// 通过url获取专题详细信息
	getSpecialSubjectByUrl: function (params, callback) {
		this._request('SpecialFacade.getSpecialByUrl', params, callback);
	},
	// 获取所有专题
	getSpecialSubjects: function (params, callback) {
		this._request('SpecialFacade.getSpecialListByLimitNum', params, callback);
	},
	 /*
		二期(规划相关)
	*/
	// 试算规划价格
	caculateProgramPrice: function (params, callback) {
		this._request('PlanFacade.calcRestrictRule', params, callback);
	},
	// 收藏规划
	collectProgram: function (params, callback) {
		this._request('PlanFacade.collect', params, callback);
	},
	// 取消收藏规划
	cancelCollectProgram: function (params, callback) {
		this._request('PlanFacade.cancelCollect', params, callback);
	},
	checkProgramIsCollected: function (params, callback) {
		this._request('PlanFacade.queryCollect', params, callback);
	},
    //获取全部分类
    getProductCategoryTree: function (params, callback){
        this._request('ProductPageProviderFacade.getCategoryTree',params, callback);
    },
    //获取规划评论
    getPlanComments: function (params, callback){
        this._request('PlanFacade.getCommentList', params, callback);
    },
    //搜索结果列表
    getPcProductResult: function (params, callback){
        this._request('ProductResultFacade.getPcProductResult', params, callback);
    },
    // 获得浏览排行列表
    getProductBrowseRunkingList: function (params, callback){
        this._request('ProductResultFacade.getProductBrowseRunkingList', params, callback);
    },
    // 获得产品销售排行
    getProductShellRunkingList: function (params, callback){
        this._request('ProductResultFacade.getProductShellRunkingList', params, callback);
    },
    // 获得产品评论排行
    getProductCommentList: function (params, callback){
        this._request('ProductResultFacade.getProductCommentList', params, callback);
    },
    // 查询阅读文章
    getArticles: function (params, callback){
        this._request('ProductResultFacade.getArticles', params, callback);
    },
    /*
        销售相关
    */
    // 获取首页动态数据
    getSimpleMarketData: function (params, callback) {
        this._request('PortalSaleFacade.getPlanInsuredBaseNum', params, callback);
    }
};
