define(['jquery', 'helper'], function($, helper) {
	'use strict';
	/*
	 * @constructor carInsure
	 * @author CC-Cai
	 * @version 0.0.1
	 * @description 车险投保页面
	 */
	var carInsureList = {
		iframeUrl: "//daren-cx-h5.huize.com/chexian/enquirylist.html",
		// iframeUrl:"http://192.168.52.143:8103/chexian/enquirylist.html",
		platformFlag: 61,
		iframe: '',
		//userId: '',
		init: function() {
			var _this = this;
			helper.state.checkLogin(function(result) {
				if (result.result) {
					_this.iframe = $('#iframepage');
					// _this.userId = helper.cookie.getCookie('userId');
					_this.initEvent();
				} else {
					window.location.href = '//passport.huize.com/?returnurl=' + window.location.href;
				}
			});
		},
		initEvent: function() {
			var _this = this,
				iframeUrl = _this.iframeUrl;
			// if (!_this.userId) {
			// 	window.location.href = '//passport.huize.com/?returnurl=' + window.location.href;
			// }
			if (iframeUrl.indexOf('?') > 0) {
				iframeUrl = iframeUrl  + '&platformFlag=' + _this.platformFlag;
			} else {
				iframeUrl = iframeUrl + '?platformFlag=' + _this.platformFlag;
			}
			_this.iframe.attr('src', iframeUrl);
			window.setInterval(function() {
				var iframe = document.getElementById('iframepage');
				try {
					var bHeight = iframe.contentWindow.document.body.scrollHeight;
					var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
					var height = Math.max(bHeight, dHeight);
					iframe.height = height;
				} catch (ex) {
					iframe.height = 0;
				}
			}, 200);
		}
	};
	return carInsureList;
});