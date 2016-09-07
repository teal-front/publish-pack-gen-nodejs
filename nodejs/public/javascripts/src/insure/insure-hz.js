define([
	'insure',
	'helper'
], function(
	Insure,
	Helper
) {
	'use strict';
	/*
	 * @constructor insure
	 * @author 
	 * @version 0.0.1
	 * @description 投保页面
	 */

	//是否启用Debug模式

	var debug = function() {
		var dev = Insure.prototype.getQueryValue('dev'),
			debug;
		try {
			debug = localStorage.getItem('dev') === 'true';
		} catch (ev) {

		}
		if (dev) {
			debug = dev === 'true';
		}
		return debug;
	};


	var insure = {
		init: function() {
			this.insure();
		},
		insure: function() {
			/*			 
			 * @author 
			 * @version 0.0.1
			 * @description 实例化投保
			 */
			var insureNum = Helper.url.getUrlVar("insureNumber");
			var getDataUrl = '/api/insurance-slips/' + insureNum + '/page-info';
			var obj = {
				el: $('#insureBox'),
				platform: 1, //平台设置为慧择

				/* URL */
				getServiceTimeUrl: '/api/tools/date/now',
				getDataUrl: getDataUrl, //获取数据URL
				postUrl: '/',
				parseExcelUrl: '/api/insurance-slips/groups/parse-excel', //解析Excel
				uploadUrl: '/api/upload',
				uploadSWFUrl: '/swf/Uploader.swf', //http://is.huize.com/swf/Uploader.swf 'http://static.huizecdn.com/js/plugins/webuploader/Uploader.swf', //上传Flash地址

				inheritInt: function() {
					var _this = this;
					_this.destinationInt(); //出行目的地
					// _this.pasteInfosInt(); //Text功能 		
				},
				success: function() {
					this.info('所有数据', this.data);
				},
				error: function(err) {
					//this.message.hide();
					this.message.show(err, 'error', 10000);
					this.info(err);
				},
				debug: debug() //调试模式-显示打印信息
			};
			var myInsure = new Insure(obj);
			window.myInsure = window.hz = myInsure; //开发调试用
			//myInsure.info('创建实例', myInsure);

		}
	};
	return insure;
});