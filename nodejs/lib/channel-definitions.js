var config = require('../config.js');

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
			{"name": "insure_Percent"} // 投保单完善度查询
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
			{"name": "union"}, // 登陆合并购物车
			{"name": "checkMergePay"}, // 检查哪些可合并支付
			{"name": "checkSelectAll"}, // 检查点击全选
			{"name": "editStartDate"}, // 修改起保日期
			{"name": "removeAllByUser"}, // 根据用户Id批量删除
			{"name": "removeAll"}, // 根据投保单Id列表批量删除
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
			{"name": "calculateInsurances"}, // 计算订单明细
			{"name": "lookupByOrderNum"}, // 查询订单明细
			{"name": "lookupByUser"} // 查询用户订单
		]
	},
	{
		// 支付相关
		"name": "PaymentFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.payment.PaymentFacade",
		"methods": [
			{"name": "calPaymentCombination"}, // 验证支付组合
			{"name": "payByGateway"} // 通过网关支付订单
		]
	},
	{
		// 结算相关
		"name": "SettlementFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.order.SettlementFacade",
		"methods": [
			{"name": "calculateInsurances"}, // 计算投保单金额
            {"name": "settle"} // 结算投保单
		]
	},
	{
		// 产品服务相关
		"name": "ProductService",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.core.service.product.ProductService",
		"methods": [
			{"name": "lookupOnsitePaymentWay"}, // 查询站内货币支付方式
			{"name": "lookupGatewayPaymentWay"} // 查询网关支付方式
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
			{"name": "active"} // 激活用户红包
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
			{"name": "getAllJobByProductId"} // 根据产品ID查询职业信息
		]
	},
	{
		// 用户相关
		"name": "UserFacade",
		"serverId": channelCpsPcServerId,
		"interfaceId": "com.hzins.portal.pc.api.user.UserFacade",
		"methods": [
			{"name": "lookupShipAddress"}, // 查询用户寄送地址
			{"name": "lookupBalanceWithFreezed"}
		]
	}
];
