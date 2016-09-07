define(function() {
	'use strict';
	/*
	 * @constructor InsureID
	 * @author 
	 * @version 0.0.1
	 * @description 团单模块
	 */
	var InsureID = function() {

	};
	InsureID.prototype = {
		/*模块ID*/
		MODULES_ID_INSURE: 10, //投保险人模块ID
		MODULES_ID_INSURE_DATE: 102, //起保日期
		MODULES_ID_INSURED: 20, //被保险人模块ID
		MODULES_ID_RED: 110, //红利领取方式 
		MODULES_ID_AUTOPAY: 109, //自动垫付 
		MODULES_ID_BENEFICIARY: 30, //受益人 
		MODULES_ID_OTHER: 40, //其它 
		MODULES_ID_FORCEPAYID: 104, //续期保费支付信息属性ID
		MODULES_ID_URGENCY: 101, //紧急联系人模块
		/*--属性值ID*/
		VALUE_ID_IDCARD: 1, //身份证值
		VALUE_ID_MALE: 1, //男
		VALUE_ID_FEMALE: 0, //女
		/*--固定属性ID--*/
		ATTR_ID_ENAME: 2, //英文名
		ATTR_ID_RELATIONINSUREINSURANT: 32, //关系
		ATTR_ID_BANK_NAME_1: 188, //持卡人姓名
		ATTR_ID_BANK_NAME_2: 272, //持卡人姓名
		ATTR_ID_NAME: 1, //用户名属性ID 
		ATTR_ID_IDCARD: 1, //身份证属性ID 
		ATTR_ID_CREDENTIALSTYPE: 3, //证件类型属性ID
		ATTR_ID_AREA_ACCOUNT: 218, //开户省份
		ATTR_ID_AREA_LIVING: 17, //居住省份
		ATTR_ID_AREA_CARD: 263, //银行卡地区
		ATTR_ID_AREA_INSURE: 254, //投保地区
		ATTR_ID_AREA_PROPERTY: 81, //财产地区
		ATTR_ID_HOME_ADDRESS: 20, //家庭
		ATTR_ID_CONTACTS_ADDRESS: 22, //联系地址
		ATTR_ID_OFFICE_ADDRESS: 24, //办公
		ATTR_ID_JOB: 19, //职业属性
		ATTR_ID_TRAVAL_START: 286, //旅行开始时间
		ATTR_ID_TRAVAL_END: 287, //旅行结束时间
		ATTR_ID_AREA_BANK: 263, //银行地址
		ATTR_ID_INSURE_DATE: 259, //起保日期
		ATTR_ID_BIRTHDATE: 13, //出生日期
		ATTR_ID_CREDENTIALSINPUT: 11, //证件号码属性ID
		ATTR_ID_TRAVELAREA: 169, //行驶区域ID
		ATTR_ID_SEX: 14, //性别属性ID
		ATTR_ID_BUYCOUNT: 256, //购买份数
		ATTR_ID_HEIGHT: 200, //身高 
		ATTR_ID_CREDENTIALSVALIDITY: 12, //证件有效期ID
		ATTR_ID_BENEFICIARY: 128, //受益人比例
		ATTR_ID_TEL: 26, //手机号码
		ATTR_ID_DELIVERADDRESS: 278, //寄送地址
		ATTR_ID_TRIPDESTINATION: 142, //出现目的地
		ATTR_ID_FROMAIRPORT: 283, //航班出发机场
		ATTR_ID_TOAIRPORT: 285, //航班到达机场
		ATTR_ID_WEIGHT: 201, //体重
		ATTR_ID_YEARLYINCOME: 232, //年收入
		ATTR_ID_AREA_RECEIVER:296,//外网收件地址省市
		// ATTR_ID_AREA_RECEIVER:299,//P版收件地址省市


		INSURANTDATEKEY: 'insurantDate', //承保年龄
		INSURANTJOBKEY: 'insurantJob', //承保职业
		BUYCOUNTKEY: 'buyCount', //购买份数
		VESTERAGEKEY: 'vesterAge', //投保人年龄
		SEXKEY: 'sex', //被保人性别
		VESTERSEX: 'vesterSex', //投保人性别
		INSURANTDATELIMIT: 'insurantDateLimit', //保障期限
		PAYMENTTYPE: 'paymentType', //缴费方式
		INSUREAGELIMIT: 'insureAgeLimit', //缴费年限

		SELFRELATIONTYPE: 1, //关系为本人

		RELATIONMAP: [{ //与被保险人关系和为谁投保MAP表
			defaultValue: 2, //与被保险人的关系的值
			defaultText: '妻子', //与被保险人的关系的名称
			transRelation: [{
				controlValue: 3,
				value: '丈夫',
			}],
		}, {
			defaultValue: 3,
			defaultText: '丈夫',
			transRelation: [{
				controlValue: 2,
				value: '妻子',
			}],
		}, {
			defaultValue: 4,
			defaultText: '儿子',
			transRelation: [{
				controlValue: 6,
				value: '父亲',
			}, {
				controlValue: 7,
				value: '母亲',
			}],
		}, {
			defaultValue: 5,
			defaultText: '女儿',
			transRelation: [{
				controlValue: 6,
				value: '父亲',
			}, {
				controlValue: 7,
				value: '母亲',
			}],
		}, {
			defaultValue: 6,
			defaultText: '父亲',
			transRelation: [{
				controlValue: 4,
				value: '儿子',
			}, {
				controlValue: 5,
				value: '女儿',
			}],
		}, {
			defaultValue: 7,
			defaultText: '母亲',
			transRelation: [{
				controlValue: 4,
				value: '儿子',
			}, {
				controlValue: 5,
				value: '女儿',
			}],
		}, {
			defaultValue: 20,
			defaultText: '雇主',
			transRelation: [{
				controlValue: 21,
				value: '雇员',
			}],
		}, {
			defaultValue: 21,
			defaultText: '雇员',
			transRelation: [{
				controlValue: 20,
				value: '雇主',
			}],
		}, {
			defaultValue: 22,
			defaultText: '法定监护人',
			transRelation: [{
				controlValue: 1000,
				value: '法定监护对象',
			}],
		}, {
			defaultValue: 1000,
			defaultText: '法定监护对象',
			transRelation: [{
				controlValue: 22,
				value: '法定监护人',
			}],
		}],
	};
	return InsureID;
});