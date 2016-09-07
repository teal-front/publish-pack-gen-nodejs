define(['jquery', 'helper', 'fixed-tool-float', 'animate-fly', 'kkpager'], function($, helper, toolFloat, fly) {
	'use strict';
	/*
	 * @constructor brandproductList
	 * @author CC-Cai
	 * @version 0.0.1
	 * @description 保险公司产品列表
	 */
	var productList = {
		toolFloat: {},
		init: function() {
			this.initEvent();
			this.getHistory();
		},
		initEvent: function() {
			var _this = this;

			var subCategory = $('#subCategory').val() || '0',
				companyId = $('#companyId').val() || '0',
				filter = $('#filter').val() || '0',
				pageIndex = $('#pageIndex').val() || 0,
				totalCount = $('#totalCount').val() || 0,
				hrefFormer = '/brand/detail/' + companyId + '/' + (~~subCategory === 0 ? '' : (subCategory + '/'));
			if (pageIndex !== 1) { //如果页数不等于则显示分页
				kkpager.generPageHtml({
					pno: $("#pageIndex").val(),
					total: Math.ceil(totalCount / 10),
					totalRecords: totalCount,
					hrefFormer: hrefFormer,
					hrefLatter: '?page=',
					getLink: function(n) {
						if (n === 1) {
							return this.hrefFormer;
						} else {
							return this.hrefFormer + this.hrefLatter + n;
						}
					},
					mode: "link",
					isGoPage: false,
					isShowTotalPage: false,
					isShowCurrPage: false,
					lang: {
						firstPageText: '首页',
						firstPageTipText: '首页',
						lastPageText: '尾页',
						lastPageTipText: '尾页',
						prePageText: '上一页',
						prePageTipText: '上一页',
						nextPageText: '下一页',
						nextPageTipText: '下一页'
					}
				});
				kkpager.selectPage($("#pageIndex").val());
			}

			// $('.sort-link').click(function() { //排序
			// 	var filterId = $(this).attr('sortId');
			// 	if (filterId === '0') {
			// 		window.location.href = hrefFormer;
			// 	} else {
			// 		if (filterId === filter) {
			// 			sortType = sortType === '0' ? 1 : 0;
			// 			window.location.href = hrefFormer + '?filter=' + filterId + '&sort=' + sortType;
			// 		} else {
			// 			window.location.href = hrefFormer + '?filter=' + filterId + '&sort=0';
			// 		}
			// 	}
			// });

			_this.toolFloat = new toolFloat();

			$(".hz-product-list").delegate(".add-compare","click",function(){
                var $this = $(this);
                if($(this).hasClass("hz-check-item-checked")) {
                    $(this).removeClass("hz-check-item-checked");
                    _this.toolFloat.delcomparePro($(this).attr("planId") || $(this).attr("productId"));
                    $(this).find(".hz-check-text").text("加入对比");
                }else{
                    if(_this.toolFloat.getCompareCount()>= 4){//获取当前对比数量
                        layer.msg("对比数目最大不能超过4个");
                        return;
                    }
                    $(this).addClass("hz-check-item-checked");
                   	//$(this).find(".hz-check-text").text("已加入对比");
                    $("#fixedsidetool").css("right",0);
                    $("#wrapToolMenu").css("left",0);
                    _this.animateFly($(this),$("#compareCount"),function(){
                        _this.toolFloat.addcomparePro($this.attr("planId") || $this.attr("productId"));
                    });
                }
            });
			var compareProducts = helper.cookie.getCookie("compareProducts"),
				compareProductsList = compareProducts.split(",") || [];
			$.each(compareProductsList, function() {
				$('.add-compare[planid=' + this + ']').addClass('hz-check-item-checked');
			});
		},
		initAction: function() {
			$("#historyData")
				.on("click", "#nextBtn", function() { //浏览记录向前
					if ($("#viewWraper li").length < 4) {
						return;
					}
					var
						ulWidth = $("#viewContainer ul").width(),
						scrollLeft = $("#viewContainer").scrollLeft(),
						viewWidth = 302 * 4,
						$tempUl = scrollLeft > ulWidth ? $("#viewContainer ul").eq(0) : [];
					if (ulWidth * 2 - scrollLeft === viewWidth) {
						$("#historyViewWrap ul").eq(0).remove();
						$("#historyViewWrap").append($tempUl);
						$("#viewContainer").scrollLeft(scrollLeft - ulWidth);
					}
					scrollLeft = $("#viewContainer").scrollLeft();
					$("#viewContainer").scrollLeft(scrollLeft + 302);
				})
				.on("click", "#prevBtn", function() { //浏览记录向后
					if ($("#viewWraper li").length < 4) {
						return;
					}
					var
						ulWidth = $("#viewContainer ul").width(),
						scrollLeft = $("#viewContainer").scrollLeft(),
						viewWidth = 302 * 4,
						$tempUl = $("#viewContainer ul").eq(1);
					if (scrollLeft === viewWidth) {
						$("#historyViewWrap ul").eq(1).remove();
						$tempUl.insertBefore($("#historyViewWrap ul"));
						$("#viewContainer").scrollLeft(scrollLeft + ulWidth);
					}
					scrollLeft = $("#viewContainer").scrollLeft();
					$("#viewContainer").scrollLeft(scrollLeft - 302);
				});
		},
		getHistory: function() { //获取浏览数据
			//helper.cookie.setCookie("Product_History", "10098:20156,10096:10103,10040:20071,1000013:1000016,10042:10088,4843:10107,10097:20148,10003:10001,1427:1590,10006:10004,10007:10005,10029:20058,10049:337,10102:20162,10111:20176,10112:20177,10101:20161,10110:20187,10119:20190,20176,20071,20053,20177,20154");
			var historyProducts = helper.cookie.getCookie("Product_History");
			var planIds = historyProducts.split(",");
			var productIds = [];
			planIds = $.grep(planIds, function(e) { //删除空元素
				return e !== "";
			});

			$.each(planIds, function(item) {
				if (this.split(":")[1]) {
					productIds.push(this.split(":")[1]);
				}
			});
			helper.request.postData2({
				url: "/api/products/plans/list",
				data: productIds
			}, function(result) {
				if (result.result.length) {
					var allProducts = result.result || [],
						historyProducts = allProducts.filter(function(item, index) {
							return item.productStatus === 1;
						}) || [],
						historyHtml = [];
					historyHtml.push('<ul class="view-history-list clearfix"  style="position: relative; left: 0px;margin-right:0px" id="viewWraper" index="1" >');
					$.each(historyProducts, function(i, item) {
						var productUrl = '//www.huize.com/product/detail-' + item.productId + '.html?DProtectPlanId=' + item.planId;
						historyHtml.push('<li class="view-history-item fl">');
						historyHtml.push('<h4 class="view-history-item-title mt20 mb10"><a target="_blank" href="' + productUrl + '">' + item.productName + item.planName + '</a></h4>');
						historyHtml.push('<a href="' + productUrl + '" class="product-pic" target="_blank">');
						historyHtml.push('<img width="100%" src="' + item.planBigImg + '">');
						historyHtml.push('</a>');
						historyHtml.push('</li>');
					});
					historyHtml.push('</ul>');
					var $historyList = $(historyHtml.join('')),
						length = historyProducts.length,
						ulWidth = length * 302,
						$historyListClone = length > 4 ? $historyList.width(ulWidth).css("float", "left").clone().attr("id", "historyListClone") : "",
						$wrap = $("<div id='historyViewWrap'></div>").append($historyList).append($historyListClone).width(ulWidth * (length > 4 ? 2 : 1));
					$("#viewContainer").html($wrap).scrollLeft(ulWidth);
					if (length <= 4) {
						$("#prevBtn,#nextBtn").addClass("view-history-scroll-prev-disabled");
					} else {
						$('#viewHistoryPage').removeClass('fn-hide');
					}
				} else {
					$("#viewContainer").hide();
					$("#emptyData").show();
					$("#prevBtn,#nextBtn").addClass("view-history-scroll-prev-disabled");
				}
			});
			this.initAction();
			// car.initAction();
		},
		animateFly: function(startEl, endEl, callback) {
			var
				img = "//img.huizecdn.com/hz/www/page/cart-flyer.png",
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
				onEnd: function() { //结束回调
					typeof callback === "function" && callback();
				}
			});
		}
	};
	return productList;
});