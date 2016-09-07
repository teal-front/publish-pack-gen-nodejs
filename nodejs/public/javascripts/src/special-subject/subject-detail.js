define(['jquery', 'helper', 'fixed-tool-float', 'animate-fly', 'layer'], function ($, helper, toolFloat, fly, layer) {
	'use strict';

	var subjectDetail = {
		toolFloat: {},
		init: function () {
			this.initData(),
			this.initView();
			this.initEvents();
		},
		initData: function () {
			this.toolFloat = new toolFloat();
		},
		initEvents: function () {
			var _this = this;
			$('.hz-product-meta').delegate('.add-compare', 'click', function () {
				var $this = $(this),
					planId = $this.attr('planid');

				if ($this.hasClass('hz-check-item-checked')) {
					_this.toolFloat.delcomparePro(planId);
					$this.removeClass('hz-check-item-checked');
				} else {
					if (_this.toolFloat.getCompareCount() >= 4) {
						layer.msg("对比数目最大不能超过4个");
					} else {
						_this.command.animateFly($(this), $("#compareCount"), function () {
							if (_this.toolFloat.addcomparePro(planId)) {
								$this.addClass('hz-check-item-checked');
							}
						});
					}
				}
			});
		},
		initView: function () {
			var compareProducts = helper.cookie.getCookie("compareProducts"),
				compareProductsList = compareProducts.split(",") || [];
			$.each(compareProductsList, function() {
				$('.add-compare[planid=' + this + ']').addClass('hz-check-item-checked');
			});
		},
		command: {
			 animateFly : function(startEl, endEl, callback){
                var img = "//img.huizecdn.com/hz/www/page/cart-flyer.png",
					flyer = $('<img class="u-flyer" src="' + img + '">').width(40).height(40),
					bodyScrollTop = document.body.scrollTop || document.documentElement.scrollTop,
					startTop = startEl.offset().top - startEl.height() / 2 - bodyScrollTop,
					startLeft = startEl.offset().left + startEl.width() / 2,
					endTop = endEl.offset().top + endEl.height() / 2 - bodyScrollTop;
                flyer.fly({
                    start: {
                        left: startLeft, //开始位置（必填）#fly元素会被设置成position: fixed
                        top: startTop //开始位置（必填）
                    },
                    end: {
                        left: endEl.offset().left, //结束位置（必填）
                        top: endTop, //结束位置（必填）
                        width: 0, //结束时宽度
                        height: 0 //结束时高度
                    },
                    onEnd: function(){ //结束回调
                        typeof callback === "function" &&  callback();
                    }
                });
            }
		} 
	};

	return subjectDetail;
});