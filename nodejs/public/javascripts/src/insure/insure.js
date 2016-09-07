define([
	'jquery',
	'base',
	'insure-render',
	'insure-team',
	'insure-validate',
	'insure-contacts',
	'insure-destination',
	'insure-text',
	'insure-id',
	'insure-event',
	'insure-beneficiary',
	'insure-date',
	'insure-restrict',
	'insure-trial',
	'insure-post',
	'insure-url',
	'message',
	'insure-fill',
	'insure-photo',
	'insure-fight',
	'insure-area',
	'jquery-prompt'
], function(
	$, //jQuery	
	Base, //公用基础模块
	InsureRender, //渲染页面模块
	InsureTeam, //团单模块
	InsureValidate, //验证模块
	InsureContacts, //常用联系人模块
	InsureDestination, //出行目的地模块
	InsureText, //提示文本模块
	InsureID, //固定ID模块
	InsureEvent, //事件模块
	InsurebBeneficiary, //事件模块
	insureDate, //事件模块	
	InsureRestrict, //约束
	InsureTrial, //试算
	InsurePost, //POST
	InsureUrl, //固定URL
	Message, //提示信息
	InsureFill, //自动填充
	InsurePhoto,
	InsureFight,
	InsureArea //省市区
) {
	'use strict';
	/*
	 * @constructor Insure
	 * @author 
	 * @version 0.0.1
	 * @description 投保模块
	 */

	function Insure(options) {
		var ops = options || {};
		for (var key in ops) {
			this[key] = ops[key];
		}
		/*
		 * @description 提示信息 
		 
		 * this.message.show(string message,string type,init time); 

		 * this.message.show('成功','success');
		 * this.message.show('失败','error');
		 * this.message.show('正在加载...','loading');
		 * this.message.show('警告类型...','warning');
		 * this.message.hide();
		 */
		this.message = new Message();
		this.init();
	}
	Insure.prototype = {
		data: {},
		times: [],
		restricts: [],
		restrictIdStatus: {}, //保存约束状态
		inputMaxLength: 50, //表单最大输入字符数
		typeOfCertificate: {}, //证件类型
		regReplaceNum: /\[[0-9]*\]+/g, //替换name中的数字
		messageTimeOut: 2000,
		getUnit: { //转换相应的单位，后台返回的单位是数字
			0: '无',
			1: '份',
			2: '万元',
			3: '元',
			4: '0元',
			5: '00元',
			6: '000元',
			7: '岁',
			8: '年',
			9: '月',
			10: '天',
			11: '元/年'
		},
		getConditions: { //获取计算单位
			0: '>', //大于
			1: '>=', //大于等于
			2: '<', //小于
			3: '<=', //小于等于
			4: '!==', //不等于
			5: '===', //等于
			6: '包含',
			7: '不包含',
			8: '提示',
			9: '隐藏'
		},
		cardType: [], //证件类型
		dialogBaseWidth: 600, //对话框宽度
		dialogBaseHeight: 400, //对话框高度
		insureFormClassName: 'credentials-form', // 'insure-form-item',
		formStyle: 'form-item', //提交的表单项
		isReady: false, //是否加载完成

		SIZE_UPLOAD_IMAGE: 5, //Image Size M
		SIZE_UPLOAD_EXCEL: 5, //Excel Size M
		SIZE_FILE: 1024 * 1024,

		event: function() {},
		ready: function() {
			var _this = this;

			_this.addMoreBox = $('#addMoreBox');

			_this.forRelationTypeSelect = $('#forrelationtype'); //为谁投保

			//投保人模块
			_this.insureModules = $('#module-' + _this.MODULES_ID_INSURE);
			//被保人模块
			_this.insuredModules = $('#module-' + _this.MODULES_ID_INSURED);
			//受益人模块
			_this.beneficiaryModules = $('#module-' + _this.MODULES_ID_BENEFICIARY);


			_this.addTable(); //添加第一个多名被保险人
			//_this.addTable(); //添加第一个多名被保险人
			// _this.addFirst(); //添加第一个第一受益人

			this.event();

			_this.inheritInt();
			_this.initBeneficiary();


			_this.initRelationSelect(); //初始化给谁投保的关系

			this.eventDrowDown();
			this.eventValidate();
			this.eventSubmit();
			this.getFirstInsureArea(); //获取投保地区的第一级
			this.getAllArea(); //获取所有地区 
			this.getFirstJob(); //获取一级职业
			_this.bindContacts(_this); //绑定常用联系人

			_this.initBeneficiaryType(); //受益人类型设置默认值


			_this.setDefaultValue(); //设置详情页面默认值
			_this.defaultRestrict(); //执行默认约束
			_this.setGeneralRestrictsItem(); //标记标准约束

			_this.initTrial(); //初始化试算信息

			_this.defaultSelectSelf(); //默认选中本人

			_this.defaultSelectIdCard(); //默认选择身份证


			_this.addPhotoUpload(); //初始化上传组件

			_this.eventInsureFight(); //航延险

			_this.initDate();
			_this.initTeam();

			_this.fillSelfInfo(); //投保人默认带入账户里的本人资料

			_this.fillData();

			_this.isReady = true; //加载完成
			// //证件类型TODO
			// $('.hz-dropdown[data-moduleid="' + _this.MODULES_ID_INSURED + '"][data-attributeid="' + _this.ATTR_ID_RELATIONINSUREINSURANT + '"]').find('.hz-select-option').each(function() {
			// 	var $this = $(this);
			// 	_this.cardType.push({
			// 		text: $this.text(),
			// 		value: $this.attr('value')
			// 	});

			// });
		},

		/*
		 * @constructor
		 * @author 
		 * @version 0.0.1
		 * @description 渲染下拉
		 */
		/*		
		_this.renderSelectHmtl({
			value: 120000,
			attr: ' data-key="city" data-type="area" data-moduleid="" data-attributeid="" ',
			showDefaultText: false, //为True的话，默认显示“请选择”
			listWidth: '150px',
			//下拉列表
			options: [{
				text: '北京市',
				value: 110000
			}, {
				text: '天津市',
				value: 120000
			}, {
				text: '河北省',
				value: 130000
			}, {
				text: '山西省',
				value: 140000
			}, {
				text: '内蒙古',
				value: 150000
			}, {
				text: '辽宁省',
				value: 210000
			}, {
				text: '吉林省',
				value: 220000
			}, {
				text: '黑龙江省',
				value: 230000
			}]
		})
		*/
		__areaSelectIndex: 0,
		renderSelectHmtl: function(obj) {
			var _this = this,
				ops = obj || {},
				value = ops.value || '',
				options = ops.options || [],
				attr = ops.attr || '', //自定义属性
				listWidth = ops.listWidth, //宽度
				defaultText = '', //默认文字
				optionsHtml = [],
				styles = ops.styles || [],
				showDefaultText = ops.showDefaultText === false ? false : true,
				result = [];
			_this.__areaSelectIndex++;
			if (showDefaultText) {
				optionsHtml.push('<li class="hz-select-option hz-select-option-selected" value="0" text="请选择">请选择</li>');
			}
			$.each(options, function(i, item) {
				var selectStyle = '';
				if (_this.toInt(value) === _this.toInt(item.code)) {
					selectStyle = 'hz-select-option-selected';
					defaultText = item.text;
				}
				if (!value && !i) {
					defaultText = item.text;
				}
				optionsHtml.push('<li class="hz-select-option ' + selectStyle + '" value="' + item.code + '" text="' + item.text + '">' + item.text + '</li>');
			});
			result.push('<div class="hz-dropdown form-item insure-form  ' + styles.join(' ') + '" ' + attr + ' data-dropdown="select-area' + _this.__areaSelectIndex + '">');
			result.push('<div class="input-select">');
			result.push('<span class="input-select-text more-tag no-select">请选择</span>');
			result.push('<b class="iconfont">&#xe70b;</b>');
			result.push('</div>');
			result.push('<div class="hz-dropdown-content" data-dropdown-item="select-area' + _this.__areaSelectIndex + '">');
			result.push('<ul class="hz-dropdown-menu" style="width:' + listWidth + ';">');
			result.push(optionsHtml.join(''));
			result.push('</ul>');
			result.push('</div>');
			result.push('');
			result.push('');
			result.push('</div>');
			return result.join('');
		},
		init: function() {
			var _this = this;
			//_this.message.show(_this.TEXT_LOADDING, 'loading');
			_this.getData(function(data) {
				var result = data.result || {};
				//_this.product = result.product;
				if (data.status !== '00000') {
					_this.error(data.message);
					return;
				}
				_this.setValue(data.result);
				_this.modules = result.modules;

				_this.el.html(_this.render(data));

				_this.renderSteps();
				$(".insure-step-secondary").html(_this.renderRight(data));
				_this.renderBeneficiarydDialog();
				_this.ready();
				_this.success();
				//_this.message.hide();
			});
		},
		setDetialValue: function() { //设置产品详情页面带过来的值

		},
		getData: function(callback) { //获取数据
			var _this = this;
			$.ajax({
				url: _this.getDataUrl + "?t=" + (new Date()).getTime(),
				type: 'get',
				success: function(data) {
					if (callback && data) {
						callback(data);
					}
				},
				error: function(err) {
					_this.error(err.status, err);
				}
			});
		},
		setDefaultValue: function() { //设置详情页面默认值

		},
		/*
		 * ==================== 解决跨域 ====================
		 */
		jsonp: function(url, data, callback, async) {
			var _this = this,
				_async = async === false ? false : true;
			$.ajax({
				type: 'get',
				url: url,
				data: data,
				async: _async,
				dataType: "jsonp",
				jsonp: 'jsonpcallback',
				contentType: 'application/json',
				success: function(data) {
					if (data && data.message) {
						_this.info('Message', data.message);
					}
					if (callback && data) {
						callback(data);
					}
				},
				error: function(err) {
					_this.error("接口调用失败", err);
				}
			});
		},
		/*
		 * ==================== 公共方法  start ====================
		 */
		resetSelect: function($select, options) { //重置Select
			var _this = this,
				result = [],
				ops = options || [];
			if (!$select) {
				return;
			}
			if ($select.hasClass('hz-dropdown')) {
				result.push('<li class="hz-select-option" value="0" text="请选择">请选择</li>');
				result.push(ops.join(''));
				$select.find('.hz-dropdown-menu').empty().append(result.join(''));
				var $input = $select.find('.input-select-text');
				if ($input.is(':text')) {
					$input.val('请选择');
				} else {
					$input.text('请选择');
				}
				$select.data('value', '请选择').attr('value', '请选择');
				//_this.dropdownSelectItem($select, 0);
			} else {
				result.push(this.defaultOption);
				result.push(ops.join(''));
				$select.empty().append(result.join(''));
			}
		},
		setValue: function(data) { //设置insure对象的初始值
			var _this = this,
				trialGenes, genes, genesObj, buyCount, postUrl;

			this.data = data || {}; //保存所有信息
			this.product = data.product || {}; //产品信息

			this.insurance = data.insurance || {}; //试算相关

			this.baseProductId = this.product.id || 0; //基础产品ID
			this.baseProductPlanId = this.product.planId || 0; //基础产品计划ID
			this.productId = this.product.operationProductId || 0; //运营层产品ID
			this.productPlanId = this.product.operationPlanId || 0; //运营层产品计划ID

			this.firstDate = this.product.firstDate || 0;
			this.latestDate = this.product.latestDate || 0;
			this.fixedDate = this.product.fixedDate; //固定投保日期 		
			this.maxPeople = data.product.maxPeople || 0;
			this.minPeople = data.product.minPeople || 0;
			this.teamTemplateType = this.product.teamTemplateType || 1; //1是境内，2是境外

			var _tempMaxPeople = this.toInt(this.getQueryValue('maxPeople'));
			if (this.debug && _tempMaxPeople) {
				this.maxPeople = _tempMaxPeople;
			}
			this.ruleParam = data.insurance.ruleParam || {}; //试算相信息
			this.trialPrice = data.insurance.restrictRule.trialPrice || {}; //试算价格

			//this.teamTemplateType = 2;

			// this.preminum = this.trialGenesObj.preminum;
			//this.product.insureIncludeBirthday = 0;
			//this.logGreen('保费：' + this.preminum);
			this.insureIncludeBirthday = this.product.insureIncludeBirthday === 1 ? 0 : -1;
			this.insuredAgeCalculation = this.product.insuredAgeCalculation || 0;
			if (this.product.insureIncludeBirthday) {
				this.logGreen('包含生日当天');
			} else {
				this.logRed('不包含生日当天');
			}
			if (this.insuredAgeCalculation === 1) {
				this.logRed('按起保日期：' + 1);
			} else if (this.insuredAgeCalculation === 2) {
				this.logGreen('按投保日期：' + 2);
			}
			this.company = this.product.company || {};

			//证件类型正则
			this.cardNumRegex = this.data.cardNumRegexJson || {};

			//是否需要登录，慧择专用
			//this.product.isLoginBuy = 1;
			if (this.product.isLoginBuy) {
				this.logRed('此产品需要登录');
			}
			try {
				if (localStorage.getItem('test') === 'true') {
					this.product.insurantType = '1,1,1,1';
				}
			} catch (ev) {}
			//被保险人类型			
			this.insurantTypeArr = this.product.insurantType || '';
			this.insurantTypeArr = this.insurantTypeArr.split(',');
			this.isMoreInsurant = this.insurantTypeArr[2] === '1' && this.insurantTypeArr[3] !== '1';
			this.isTeamInsurant = this.insurantTypeArr[3] === '1';
			//this.hasInsured = this.product.insurantType === '0,0,0,0,';
			this.hasInsured = $('#module-20').length; //是否有被保人
			if (!this.hasInsured) {
				this.logRed('被保险人类型：没有被保险人');
			}
			if (this.isMoreInsurant) {
				this.logRed('被保险人类型：多年被保险人');
			} else if (this.isTeamInsurant) {
				this.logRed('被保险人类型：团单');
			}

			this.attrGeneKeyMap = data.attrGeneKeyMap; //默认值映射
			this.restricts = this.data.restricts || []; //约束项



			//未成年人职业ID，如果设置了未成年人职业，且是未成年，则隐藏职业
			this.juvenilesJobFullId = this.product.juvenilesJobFullId;
			this.juvenilesJobFullName = this.product.juvenilesJobFullName;
			this.juvenilesJobFullCode = this.product.juvenilesJobFullCode;
			this.juvenilesJobLevel = this.product.juvenilesJobLevel;

			this.setDetialValue();
		},
		confirm: function(text, callback) { //询问
			var textHtml = '<div class="pt45 pb45 tac">' + text + '</div>';
			layer.confirm(textHtml, {
				title: false,
				area: ['530px'],
				btn: ['取消', '确定'] //按钮
			}, function(index) {
				layer.close(index);
			}, function() {
				if (callback) {
					callback();
				}
			});
		},
		$get: function(moduleId, attributeId, visible) {
			var str = visible === true ? ':visible' : '';
			return this.el.find('[data-moduleid="' + moduleId + '"][data-attributeid="' + attributeId + '"]' + str);
		},

		/*
		 * ==================== 公共方法  end ====================
		 */
	};

	//继承功能模块
	$.extend(Insure.prototype, new Base());
	$.extend(Insure.prototype, new InsureRender());
	$.extend(Insure.prototype, new InsureTeam());
	$.extend(Insure.prototype, new InsureValidate());
	$.extend(Insure.prototype, new InsureContacts());
	$.extend(Insure.prototype, new InsureDestination());
	$.extend(Insure.prototype, new InsureText());
	$.extend(Insure.prototype, new InsureID());
	$.extend(Insure.prototype, new InsureEvent());
	$.extend(Insure.prototype, new InsurebBeneficiary());
	$.extend(Insure.prototype, new insureDate());
	$.extend(Insure.prototype, new InsureRestrict());
	$.extend(Insure.prototype, new InsureTrial());
	$.extend(Insure.prototype, new InsurePost());
	$.extend(Insure.prototype, new InsureUrl());
	$.extend(Insure.prototype, new InsureFill());
	$.extend(Insure.prototype, new InsurePhoto());
	$.extend(Insure.prototype, new InsureFight());
	$.extend(Insure.prototype, new InsureArea());
	Insure.prototype.constructor = Insure;

	return Insure;
});