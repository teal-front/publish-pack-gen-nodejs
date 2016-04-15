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
	'insure-event'
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
	InsureEvent //事件模块
) {
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
		this.init();
	}

	Insure.prototype = {
		data: {},
		inputMaxLength: 50, //表单最大输入字符数
		insureDate: { //投保人日期范围
			maxDate: '',
			minDate: ''
		},
		insuredDate: { //被保人日期范围
			maxDate: '',
			minDate: ''
		},
		event: function() {},
		ready: function() {
			this.event();
		},
		init: function() {
			var _this = this;
			_this.getData(function(data) {
				var result = data.result || {};
				_this.product = result.product;
				_this.modules = result.modules;
				_this.el.html(_this.render(data));
				_this.ready();
			});
		},
		getData: function(callback) { //获取数据
			var _this = this;
			$.get(_this.getDataUrl, function(data) {
				if (callback && data) {
					callback(data);
				}
			});
		}
	};

	//继承功能模块
	$.extend(Insure.prototype, new Base());
	$.extend(Insure.prototype, new InsureText());
	$.extend(Insure.prototype, new InsureID());
	$.extend(Insure.prototype, new InsureRender());
	$.extend(Insure.prototype, new InsureTeam());
	$.extend(Insure.prototype, new InsureValidate());
	$.extend(Insure.prototype, new InsureContacts());
	$.extend(Insure.prototype, new InsureDestination());
	$.extend(Insure.prototype, new InsureEvent());

	Insure.prototype.constructor = Insure

	return Insure;
});