/**
 * @class Main
 * @fileOverview 通用脚本
 * @author kingwell Leng
 * @version 0.0.1
 */


define([
	'jquery',
	'layer',
	'jquery-plugins',
	'jquery-placeholder'
], function(
	$,
	layer
) {


	var _global = {

		init: function() {
			this.placeholder();
			this.nav();
			this.friend();
			this.viewHtml();
		},

		//导航条
		nav: function() {
			// $('#productCategoriges').dropDown({
			// 	eventType: 'mouseenter',
			// 	overflowY: '',
			// 	enter: function($this, $item) {
			// 		$this.addClass('main-menu-link-hover');
			// 	},
			// 	leave: function($this, $item) {
			// 		$this.removeClass('main-menu-link-hover');
			// 	}
			// });

			var timeOut,
				showTimeOut,
				$productCategoriges = $('#productCategoriges'),
				$productCategorigesMenu = $('[data-dropdown-item="productCategoriges"]');

			//设置样式
			$productCategorigesMenu.css({
				position: 'absolute'
			});

			function _show() {
				var pos = $productCategoriges.offset();
				$productCategoriges.addClass('main-menu-link-hover');
				$productCategorigesMenu
					.css({
						left: pos.left - 160,
						top: pos.top + $productCategoriges.outerHeight()
					})
					.show();
			}

			function _hide() {
				$productCategoriges.removeClass('main-menu-link-hover');
				$productCategorigesMenu.hide();
			}

			function run(ev) {
				if ('productCategoriges' !== $(ev.target).data('dropdown')) {
					_hide();
				}
			}
			$('body').on('click', run);
			$productCategoriges
				.on('mouseenter', function() {
					showTimeOut = setTimeout(function() {
						_show();
					}, 300);
				})
				.on('mouseleave', function() {
					clearTimeout(showTimeOut);
					timeOut = setTimeout(_hide, 300);
				});

			$productCategorigesMenu
				.on('mouseenter', function() {
					clearTimeout(timeOut);
				})
				.on('mouseleave', function() {
					timeOut = setTimeout(_hide, 300);
				});


			// 加载工具条			
			requirejs([
				"fixed-tool-float",
				"sub-menu",
				"top-menu"
			], function(
				toolFloat,
				submenu,
				topmenu
			) {
				var menu = new submenu();
				var top = new topmenu();
			});
		},

		//添加提示信息
		viewHtml: function() {
			$('.dialog-view-html').on('click', function() {
				layer.open({
					type: 1,
					title: '提示信息',
					area: ['600px', '400px'],
					content: '<div class="p20">' + $(this).data('html') + '</div>',
					btn: ['关闭']
				});
			});
		},
		placeholder: function() {

			$('.placeholder-item').placeholder({
				wrapTagName: false
			});

		},
		friend: function() {
			$('.friend-link-tab-list')
				.on('mouseenter', '.friend-link-tab-item', function() {
					var tab = $(this).data('tab');
					$('.friend-link-tab-item').removeClass('active');
					$(this).addClass('active');

					$('.friend-link-tab-pane').addClass('fn-hide');
					$('.friend-link-tab-pane[data-tab="' + tab + '"]').removeClass('fn-hide');
				});
		}
	};
	_global.init();
});