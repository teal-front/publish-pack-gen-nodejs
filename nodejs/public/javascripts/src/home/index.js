define([
	'jquery',
	'count-up',
	'jq-slide',
	'jquery-menu-aim'
], function(
	$,
	slide
) {

	'use strict';

	/**
	 **
	 ** @constructor 
	 ** @author Kingwell Leng
	 ** @version 0.0.1
	 ** @description 首页
	 **
	 **/

	var index = {
		init: function() {
			this.countUp();
			this.slide();
			this.areaTop();
			this.toolFloat();
			this.initEvents();
		},

		//一些初始化事件
		initEvents: function() {
			$('.adviser-list').find('.book-box').hover(
				function() {

					$(this).addClass('book-box-hover')
				},
				function() {
					$(this).removeClass('book-box-hover')
				}
			);

			if (index.isIe6()) {

				requirejs(["layer"], function(layer) {
					layer.open({
						type: 1,
						title: false,
						area: ['530px'],
						shadeClose: true, //开启遮罩关闭
						content: '<div class="ie6-tip">' +
							'<a class="chrome-link" title="下载chrome浏览器" target="_blank" href="//www.google.com/chrome/">chrome</a>' +
							'<a class="ie-link" target="_blank" title="升级IE浏览器" href="http://www.microsoft.com/zh-cn/download/internet-explorer-8-details.aspx">ie8</a>' +
							'</div>'
					});
				});


			}
			var selectedIndex = "";
			$(".categories-pane:visible .categories-tag").each(function() {
				$(this)
					.mouseover(function() {
						var $hasSelected = $(".categories-pane:visible .categories-tag-selected");
						selectedIndex = $hasSelected.index();
						$hasSelected.removeClass("categories-tag-selected")
					})
					.mouseout(function() {
						if (selectedIndex >= 0 && !$(this).hasClass("categories-tag-selected")) {
							$(".categories-pane:visible .categories-tag").eq(selectedIndex).addClass("categories-tag-selected")
						}
					});
			});
		},

		isIe6: function() {
			if (/msie/.test(navigator.userAgent.toLowerCase())) {
				if (jQuery.browser && jQuery.browser.version && jQuery.browser.version == '6.0') {
					return true
				} else {
					return false;
				}
			}
		},

		//数据自动加
		countUp: function() {
			var $number1 = $('#number1');
			var $number2 = $('#number2');
			var $number3 = $('#number3');
			var easingFn = function(t, b, c, d) {
				var ts = (t /= d) * t;
				var tc = ts * t;
				return b + c * (tc * ts + -5 * ts * ts + 10 * tc + -10 * ts + 5 * t);
			}
			var options = {  
				useEasing: true,
				  easingFn: easingFn,
				  useGrouping: true,
				  separator: ',',
				  decimal: '.',
				  prefix: '',
				  suffix: ''
			};
			var demo1 = new CountUp($number1[0], 0, $number1.data('value'), 0, 2.5, options);
			var demo2 = new CountUp($number2[0], 0, $number2.data('value'), 0, 2.5, options);
			var demo3 = new CountUp($number3[0], 0, $number3.data('value'), 0, 2.5, options);
			demo1.start();
			demo2.start();
			demo3.start();
		},

		// 加载工具条
		toolFloat: function() {
			requirejs(["fixed-tool-float"], function(toolFloat) {
				new toolFloat();
			});
		},

		//Banner
		slide: function() {
			var fixedWidth = /iPad/ig.test(window.navigator.userAgent) ? "1190px" : "100%";
			$('.jq-slide').slide({
				width: fixedWidth,
				height: 560,
				autoPlay: 5000,
				statusNode: $('.num>spans'),
				prevBtn: $('.pre-arrow'),
				nextBtn: $('.next-arrow'),
				enabledKeyboard: true,
				enableAsyn: true,
				callback: function(index, length) {
					//console.log(length, index);
					$('.slider-page .num').html('<span class="f36">' + index + '</span>/' + length);
				}
			});
		},
		//顶布方案选择
		areaTop: function() {
			var $categories = $('.hot-categories');
			var $buttonGo = $('.button-go');

			$categories

			//切换大类
			// 	.on('mouseenter', '.categories-tab-item', function() {
			// 	var tab = $(this).data('tab');

			// 	$categories.find('.tab-container').addClass('fn-hide');

			// 	$categories.find('.tab-container[data-tab="' + tab + '"]').removeClass('fn-hide');
			// 	$categories
			// 		.find('.categories-tab-item')
			// 		.removeClass('selected');
			// 	$(this).addClass('selected');

			// })

			//选择Tag
				.on('click', 'a.categories-tag', function() {
				var $wrap = $(this).parents('.tab-container');
				var $dd = $(this).parent();
				var tab = $(this).data('tab');
				$dd.find('a.categories-tag').removeClass('categories-tag-selected');
				$(this).addClass('categories-tag-selected');
				if (tab) {
					$wrap.find('dl').eq(1).find('div[data-tab]').addClass('fn-hide');
					$wrap.find('dl').eq(1).find('div[data-tab="' + tab + '"]').removeClass('fn-hide');
				}

			});

			$buttonGo.on('click', function() {

				var $categoriesLast = $('.categories-last [data-tab]:visible');
				$(this).attr('href', $categoriesLast.find('.categories-tag-selected').data('href'));

			});



			//
			var $menu = $('.categories-tab-menu');

			try {
				$menu.menuAim({
					activate: activateSubmenu,
					deactivate: deactivateSubmenu
				});
			} catch (ev) {

				$categories

				//切换大类
					.on('mouseenter', '.categories-tab-item', function() {
					var tab = $(this).data('tab');

					$categories.find('.tab-container').addClass('fn-hide');

					$categories.find('.tab-container[data-tab="' + tab + '"]').removeClass('fn-hide');
					$categories
						.find('.categories-tab-item')
						.removeClass('selected');
					$(this).addClass('selected');

				})
			}

			function deactivateSubmenu(row) {

				var id = $(row).data('tab');
				$('.tab-container[data-tab="' + id + '"]').addClass('fn-hide');

			}

			function activateSubmenu(row) {

				var $row = $(row);
				var id = $row.data('tab');
				$('.categories-tab-item').removeClass('selected');
				$row.addClass('selected');
				$('.tab-container').addClass('fn-hide');
				$('.tab-container[data-tab="' + id + '"]').removeClass('fn-hide');

			}
		}
	};
	return index;
});