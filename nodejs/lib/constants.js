module.exports = {
    // 评论类型
    COMMENTS_TYPE: {
        ALL: 0,
        PRODUCT: 1,
        FEEDBACK: 2
    },
    // 货币类型
    CURRENCY_TYPE: {
        BALANCE: 1001,
        GOLDEN_BEAN: 1003
    }, 
    // 评论每页条数
    COMMENTS_PAGE_SIZE: 10,
    PROGRAMS_PAGE_SIZE: 10,
    // 订单每页条数
    ORDERS_PAGE_SIZE: 10,
    // 产品列表每页条数
    PRODUCT_LIST_PAGE_SIZE: 10,
	// 保险公司产品列表每页条数
	COMPANY_PRODUCT_LIST_PAGE_SIZE: 10,
    PRODUCT_LIST_SORT: {
        0: 'ASC',
        1: 'DESC'
    },
	// 首页新闻数量
	INDEX_RECOMMEND_NEWS_NUM: 4,
    //  文件服务器SiteName
    FILESERVER_SITE_NAME: {
        DEFAULT: "Default",
        IMAGE: "Image",
        COMPRESS_IMAGE: "CompressImage",
        FILE: "File",
        SECRECY_FILE: "SecrecyFile",
        POLICY_FILE: "PolicyFile",
        PARTNER_IMAGE_UPLOAD: "PartnerImageUpload",
        FTP_DEFAULT: "FtpDefault",
        BYT_FTP_ROOT: "bytftpRoot",
        EMAIL_ATTACHMENT: "EmailAttachment"
    },
    // 地址层级定义
    ADDRESS_LEVEL: {
        PROVINCE: 1,
        CITY: 2,
        DISTRICT: 3
    },
    // 支付平台编码
    GATEWAY_CODE: {
        ALIPAY: 1,
        UNIONPAY: 3,
        YEEPAY: 12,
        TENPAY: 14,
        WECHATPAY: 21
    },
    // 支付结果状态
    PAYMENT_RESULT_STATUS: {
        PROGRESS: 1,
        SUCCESS: 2,
        FAIL: 3
    },
    // 订单状态
    ORDER_STATUS: {
        WAIT_PAYMENT: 1,
        PAYMENT_IN_PROGRESS: 2,
        FAILED_TO_PAY: 3,
        PAID: 4,
        CANCELLED: 5,
        REMOVED: 10
    },
    // 支付类型
    PAYMENT_TYPE: {
        SITE: 1, // 站内货币支付
        GATEWAY: 2, // 网关支付
        BANK_WITHHOLDING: 3, // 银行代扣
        INSURANCE_COMPANY_COLLECT: 4, // 保险公司代收
        MICRO_PAYMENT: 5, // 小额支付
        OFFLINE: 6, // 线下转账汇款
        COUPON: 7 // 序列号支付
    },
    PAGE_TITLE_SUFFIX: ' - 慧择保险网',
    REDIS_CACHE_PREFIX: 'nodejs:',
    INDEX_TDK: {
        TITLE: '慧择保险网 - 一站式保险服务平台，网上买保险推荐选择！',
        KEYWORDS: '保险,保险网,网上买保险,网上投保',
        DESCRIPTION: '慧择保险网一站式保险服务平台，提供七十多家全国知名保险公司产品网上投保，为用户提供投保交易、风险评估、理赔协助等在内的一站式保险综合服务。专业、诚信，是您可以信赖的保险网，网上买保险就上慧择网！'
    },
    BRAND_LIST_TDK: {
        TITLE: '保险公司-人寿/财产保险公司-保险品牌【产品,险种查询,哪家好、客服电话】- 慧择保险网',
        KEYWORDS: '保险公司,人寿保险公司, 财产保险公司,保险品牌,产品,险种',
        DESCRIPTION: '慧择网保险品牌提供市场各家保险公司产品查询。保险产品哪家好？人寿保险公司或财产保险公司？公司介绍、客服电话、产品大全,就上慧择网'
    },
    PRODUCT_RANKING_TDK: {
        TITLE: '什么保险好【产品，险种，比较，推荐】-保险排名 - 慧择保险网',
        KEYWORDS: '什么保险好，保险产品，保险排名',
        DESCRIPTION: '慧择保险网保险排名频道通过对保险产品从销量，价格，评价等不同方面排名的对比，用数据告诉用户什么保险好，好的保险险种有哪些？您可以在线进行全面的保险产品分析，咨询和比较。正确的选购到适合自己的保险。'
    },
    SPECIAL_SUBJECT_TDK: {
        TITLE: '保险专题频道 - 慧择保险网',
        KEYWORDS: '保险专题',
        DESCRIPTION: '择保险网保险专题频道，全方位整合各类保险需求，根据人群、保险需求细分，以专业的角度提供投保建议，推荐合适的保险产品。'
    },
    PROGRAM_TDK: {
        TITLE: '保险规划频道-慧择保险网',
        KEYWORDS: '保险规划',
        DESCRIPTION: '慧择保险网保险规划频道，根据用户自身特点，可快速、全面的评估保险规划。帮助用户选择投入更少，保障更全，搭配更灵活，理赔效率更快的保险方案。'
    },
    RESERVE_TDK: {
        TITLE: '保险定制_保险预约-慧择保险网',
        KEYWORDS: '保险定制、保险预约',
        DESCRIPTION: '慧择保险网保险定制频道，9年家庭服务经验，精选1000款精品保险，300位专业顾问根据您和您的家庭情况，为您量身定制全面，高性价比的专属保险方案。提交预约后，顾问会在1个工作日内为您服务。'
    }
};
