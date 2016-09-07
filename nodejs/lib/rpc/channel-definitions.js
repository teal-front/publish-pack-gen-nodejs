var config = require('../../config.js');

var channelCpsPcServerId = config.rabbiqmqQueue;

exports.classes = [
	{
		// 投保单相关
		"name": "InsuranceFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.insurance.InsuranceFacade",
		"methods": [
			{"name": "insureCreate"}, // 创建投保单
			{"name": "insureDelete"}, // 删除投保单
			{"name": "insureEdit"}, // 编辑投保单
			{"name": "insureQuery"}, // 投保单查询
			// {"name": "insureCreate"}, // 生成投保单
			{"name": "healthInformQuery"}, // 查询健康告知
			{"name": "healthInformSave"}, // 保存健康告知
			{"name": "insureTeamAnalysis"}, // 解析团单模板
			{"name": "insureFavoriteContactQuery"}, // 常用联系人读取
			{"name": "insureFavoriteContactDestory"}, // 常用联系人删除
			{"name": "insure_Percent"}, // 投保单完善度查询
			{"name": "findAirportCityInfoList"}, // 机场信息获取
			{"name": "renewalInsuredPersonTake"}, // 获取续保人信息
			{"name": "policyIsDelete"} // 查询投保单是否删除
		]
	},
	{
		// 购物车相关
		"name": "PurchaseCartFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.cart.PurchaseCartFacade",
		"methods": [
			{"name": "getByUserId"}, // 已登陆获取购物车列表
			{"name": "getByInsuranceNums"}, // 未登陆获取购物车列表
			{"name": "add"}, // 添加至购物车
			{"name": "remove"}, // 从购物车删除
			{"name": "removeProject"}, // 从购物车删除规划
			{"name": "union"}, // 登陆合并购物车
			{"name": "checkMergePay"}, // 检查哪些可合并支付
			{"name": "checkSelectAll"}, // 检查点击全选
			{"name": "editStartDate"}, // 修改起保日期
			{"name": "removeAllByUser"}, // 根据用户Id批量删除
			{"name": "removeByInsuranceNums"}, // 根据投保单Id列表批量删除
            {"name": "getCountByUserId"} // 获取购物车中商品数量
		]
	},
	{
		// 订单相关
		"name": "OrderFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.order.OrderFacade",
		"methods": [
			{"name": "create"}, // 创建支付订单
			{"name": "cancel"}, // 取消订单
			{"name": "remove"}, // 删除订单
			{"name": "calculateInsurances"} // 计算订单明细
		]
	},
	{
		// 订单查询相关
		"name": "OrderQueryFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.order.OrderQueryFacade",
		"methods": [
			{"name": "lookupByOrderNum"}, // 查询订单明细
			{"name": "lookupByUser"} // 查询用户订单信息
		]
	},
	{
		// 支付相关
		"name": "PaymentFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.payment.PaymentFacade",
		"methods": [
			{"name": "lookupPaymentGateways"}, // 查询订单的支付网关
			{"name": "payByGateway"}, // 通过网关支付订单
			{"name": "lookupPaymentResult"} // 查询网关支付结果
		]
	},
	{
		// 结算相关
		"name": "SettlementFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.order.SettlementFacade",
		"methods": [
			{"name": "calculateInsurances"}, // 计算投保单金额
			{"name": "postSettle"}, // 结算投保单 
            {"name": "getSettle"}, // 获取结算详情
			{"name": "verifyPaymentCombination"}, // 计算支付货币组合
			{"name": "lookupSettlementByOrder"} // 根据订单号获取结算对象
		]
	},
	{
		// 产品服务相关
		"name": "ProductService",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.core.service.product.ProductService",
		"methods": [
			{"name": "lookupOnsitePaymentWay"} // 查询站内货币支付方式
		]
	},
	{
		// 账户相关
		"name": "AccountFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.user.AccountFacade",
		"methods": [
			{"name": "lookupAccountBalanceByCurrency"}, // 查询用户可累加货币统计
			{"name": "lookupFreezedBalanceByCurrency"}, // 查询用户可累加货币的冻结明细
			{"name": "lookupRedEnvelope"}, // 查询用户红包
			{"name": "activateRedEnvelope"}, // 激活用户红包
			{"name": "getDetailedAccountBalanceInfo"}, // 查询用户账户内站内支付货币详情
			{"name": "unfreezeCurrenciesInOrder"} // 解冻站内支付货币
		]
	},
	{
		// 产品相关
		"name": "ProductFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.product.ProductFacade",
		"methods": [
			{"name": "getInsuranceDetail"}, // 保障详情
			{"name": "getDefaultRestrictRule"}, // 默认试算信息
			{"name": "getInsuranceDetailRight"}, // 产品详情右侧数据
			{"name": "getProductAnalysisInfo"}, // 产品解读
			{"name": "getSettlingExplainInfo"}, // 理赔指引
			{"name": "getFAQList"}, // 常见问题
			{"name": "getProductCommentList"}, // 根据产品ID获取评论和理赔反馈
			{"name": "getUserCommentList"}, // 根据用户ID获取评论
			{"name": "getCommentById"}, // 根据评论ID获取评论
			{"name": "sendComment"}, // 发表评论和理赔反馈
			{"name": "editComment"}, // 修改评论
			{"name": "removeComment"}, // 删除评论
			{"name": "getCustomServiceInfo"}, // 专属客服
			{"name": "getSalePromotion"}, // 产品营销策略
			{"name": "getRestrictRule"}, // 试算接口
			{"name": "getProductGroupList"}, // 产品推荐组合
			{"name": "productCollect"}, // 产品收藏
			{"name": "getProductCompareInfo"}, // 产品对比
			{"name": "getPlanCompareInfo"}, // 计划对比
			{"name": "getProductAttrs"}, // 投保详情页
			{"name": "getCommentCountByType"}, // 获取评论数
			{"name": "getSatisfaction"}, // 获取评论数
			{"name": "getSimplePlanInfo"}, // 根据计划ID批量查询计划信息
			{"name": "getAllJobByProductId"}, // 根据产品ID查询职业信息
			{"name": "getProductInsureCase"}, // 根据计划ID查询典型案例
			{"name": "getCategoryTree"}, // 获取所有产品分类
			{"name": "getPolicyManageInfo"}, // 查询产品延迟出单和暂停出单状态
			{"name": "getReplacePlanDetail"}, // 获取推荐同类产品
			{"name": "getRestrictRuleInsure"}, // 投保试算接口
			{"name":"getRecommendProduct"}, // 获取产品列表推荐
			{"name": "getCommentPageInfo"} // 获取评论页信息
		]
	},
	{
		// 用户相关
		"name": "UserFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.user.UserFacade",
		"methods": [
			{"name": "lookupShipAddress"}, // 查询用户寄送地址
			{"name": "lookupBalanceWithFreezed"},
			{"name": "updateShipAddress"} // 修改用户寄送地址
		]
	},
	{
		// 地址相关
		"name": "AreaFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.user.AreaFacade",
		"methods": [
			{"name": "getByLevelAndCode"} // 获取地址信息
		]
	},
	{
		// PC投保服务相关
		"name": "PcInsuranceFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.service.insurance.PcInsuranceFacade",
		"methods": [
			{"name": "findAirportCityInfoList"} // 机场信息获取
		]
	},
	{
		// 主页相关
		"name": "HomePageProviderFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.second.portal.pc.api.home.HomePageProviderFacade",
		"methods": [
			{"name": "getOperatePictures"}, // 提供运营图片
			{"name": "getRecommendNews"}, // 推荐4条新闻
			{"name": "getFriendlyLink"}  // 获取友情链接
		]
	},
	{
		// 产品列表相关
		"name": "ProductPageProviderFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.second.portal.pc.api.product.ProductPageProviderFacade",
		"methods": [
			{"name": "getProductPageData"}, // 查询产品列表数据
			{"name": "getProductGuide"}, // 查询选购指南
			{"name": "getHotSaleProducts"}, // 获取推荐热销产品
			{"name": "getProductRanklist"}, // 获取产品排行
			{"name": "getProductByCompany"}, //获取保险公司产品列表
			{"name": "getPagePathNav"},// 根据小类ID 查找父类和同类ID
			{"name": "getChindrenCategories"}, // 根据大类ID查找小类
			{"name": "getOperatePictures"}, // 提供运营图片
			{"name": "getRecommendNews"}, // 推荐4条新闻
			{"name": "getCategoryTree"} // 获取全部分类树
		]
	},
	{
		// 保险公司相关
		"name": "CompanyPageProviderFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.second.portal.pc.api.company.CompanyPageProviderFacade",
		"methods": [
			{"name": "getCompanyList"}, // 获取保险公司列表
			{"name": "getCompanyPageInfo"} // 保险公司产品列表获取保险公司的类目信息和保险公司信息
		]
	},
	{
		// 专题相关
		"name": "SpecialFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.second.portal.pc.api.special.SpecialFacade",
		"methods": [
			{"name": "getSpecialByUrl"}, // 通过url获取专题
			{"name": "getSpecialListByLimitNum"} // 获取所有专题
		]
	},
	{
		// 规划相关
		"name": "PlanFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.second.portal.pc.api.plan.PlanFacade",
		"methods": [
			{"name": "calcRestrictRule"}, // 试算价格
			{"name": "collect"}, // 收藏规划
			{"name": "cancelCollect"}, // 取消收藏
			{"name": "queryCollect"}, // 查询规划是否已收藏过
			{"name": "getCommentList"} // 获取用户评论
		]
	},
	{
		// 产品搜索
		"name":"ProductResultFacade",
		"serverId":channelCpsPcServerId,
		"interfaceId":"com.hzins.second.portal.pc.api.productResult.ProductResultFacade",
		"methods":[
			{"name": "getPcProductResult"}, // 搜索列表,
			{"name": "getProductBrowseRunkingList"}, // 获得浏览排行列表
			{"name": "getProductShellRunkingList"}, // 获得产品销售排行
			{"name": "getProductCommentList"}, // 获得产品评论排行
			{"name": "getArticles"} // 查询阅读文章
		]
	},
	{
		// 销售相关
		"name":"PortalSaleFacade",
		"serverId":channelCpsPcServerId,
		"interfaceId":"com.hzins.portal.pc.api.insurance.PortalSaleFacade",
		"methods":[
			{"name": "getPlanInsuredBaseNum"} // 获取首页动态数据
		]
	},
];
