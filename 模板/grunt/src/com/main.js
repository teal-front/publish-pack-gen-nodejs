/**
 * @class Main
 * @fileOverview 通用脚本
 * @author kingwell Leng
 * @version 0.0.1
 */


define(['jquery', 'jquery-plugins', 'jquery-placeholder'], function($) {
	/*
	 * @virtual  asdfasfasf
	 * @function Hello
	 */
	// var Hello = function(options) {
	// 	var ops = options || {};
	// 	this.el = ops.el;
	// 	this.create();
	// };
	// Hello.prototype = {
	// 	time: 6000,
	// 	helloArr: ['清晨', '早上好', '上午好！每天努力一点，梦想更近一点！', '中午好', '下午好', '下午好', '傍晚好', '晚上好', '深夜了', '凌晨了，洗洗睡吧！', '黎明', '子夜了'],
	// 	create: function() {
	// 		var _this = this,
	// 			_date = new Date(),
	// 			hour = _date.getHours();
	// 		this.result = '';
	// 		clearTimeout(_this.timeout);
	// 		if (hour >= 5 && hour < 7) {
	// 			this.result = this.helloArr[0];
	// 		} else if (hour >= 7 && hour < 9) {
	// 			this.result = this.helloArr[1];
	// 		} else if (hour >= 9 && hour < 11) {
	// 			this.result = this.helloArr[2];
	// 		} else if (hour >= 11 && hour < 13) {
	// 			this.result = this.helloArr[3];
	// 		} else if (hour >= 13 && hour < 15) {
	// 			this.result = this.helloArr[4];
	// 		} else if (hour >= 15 && hour < 17) {
	// 			this.result = this.helloArr[5];
	// 		} else if (hour >= 17 && hour < 19) {
	// 			this.result = this.helloArr[6];
	// 		} else if (hour >= 19 && hour < 21) {
	// 			this.result = this.helloArr[6];
	// 		} else if (hour >= 21 && hour < 23) {
	// 			this.result = this.helloArr[6];
	// 		} else if (hour >= 23 && hour < 1) {
	// 			this.result = this.helloArr[6];
	// 		} else if (hour >= 1 && hour < 3) {
	// 			this.result = this.helloArr[6];
	// 		} else if (hour >= 3 && hour < 5) {
	// 			this.result = this.helloArr[6];
	// 		}
	// 		if (_this.el) {
	// 			this.el.innerHTML = this.result;
	// 		}
	// 		_this.timeout = setTimeout(function() {
	// 			_this.create();
	// 		}, _this.time);
	// 	}
	// };
	// new Hello({
	// 	el: document.getElementById('hello')
	// });


	var _global = {
		init: function() {
			this.placeholder();
			this.nav();
		},
		nav: function() {
			$('#productCategoriges').dropDown({
				eventType: 'mouseenter',
				enter: function($this, $item) {
					$this.addClass('main-menu-link-hover');
				},
				leave: function($this, $item) {
					$this.removeClass('main-menu-link-hover');
				}
			});

			requirejs(["fixed-tool-float","sub-menu", "top-menu"], function (toolFloat, submenu, topmenu) {   // 加载工具条
				var menu = new submenu();
				var top = new topmenu();
			});
		},
		placeholder: function() {
			$('.placeholder-item').placeholder({
				wrapTagName: false
			});
		}
	};
	_global.init();
});