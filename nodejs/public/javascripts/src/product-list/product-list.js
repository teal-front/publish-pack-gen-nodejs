define(['jquery', 'my-calendar', 'helper', 'fixed-tool-float', 'animate-fly', 'kkpager'], function($, MyCalendar, helper, toolFloat, fly) {
	'use strict';
	/*
	 * @constructor productList
	 * @author CC-Cai
	 * @version 0.0.1
	 * @description 产品列表
	 */
	var productList = {
		toolFloat: {},
		init: function() {
			var _this = this;
			_this.initEvent();
			_this.getHistory();
			_this.initDate();

			$.each($('.hz-dropdown,.select-tag'), function() {
				_this.initDropDown(this);
			});
		},
		initEvent: function() {
			var _this = this;
			$(".select-column").each(function() {
				var $column = $(this);
				if ($column.find(".js-select-content").height() > 50) {
					var $moreBtn = $('<a class="select-toggle" href="javascript:;"><span>更多</span> <i class="iconfont">&#xe70b;</i></a>').click(function() {
						$column.find(".select-list").toggleClass("select-list-open");
						$(this).toggleClass("show-more").find("span").text($(this).hasClass("show-more") ? "隐藏" : "更多");
						// if ($(this).hasClass("show-more")) {
						// 	$(this).find('.iconfont').html('&#xe70b;');
						// } else {
						// 	$(this).find('.iconfont').html('&#xe708;');
						// }
					});
					$column.append($moreBtn);
				}
			});
			var subCategory = $('#subCategory').val() || '0',
				companyId = $('#companyId').val() || '0',
				queryKeys = $('#queryKeys').val() || '0',
				genes = $('#genes').val() || '0',
				sortType = $('#sortType').val() || '0',
				filter = $('#filter').val() || '0',
				pageIndex = $('#pageIndex').val() || 0,
				totalCount = $('#totalCount').val() || 0,
				ageGenes = $('#ageGenes').val() === 'true' ? 1 : 0,
				hrefFormer = '/product/ins-' + subCategory + '-' + companyId + '-' + queryKeys + (genes === '0' ? '' : ('-' + genes));
			if (pageIndex !== 1) { //如果页数不等于则显示分页
				kkpager.generPageHtml({
					pno: $("#pageIndex").val(),
					total: Math.ceil(totalCount / 10),
					totalRecords: totalCount,
					hrefFormer: hrefFormer,
					hrefLatter: '?filter=' + filter + (ageGenes === 1 ? '&ageGenes=1' : '') + '&sort=' + sortType + '&page=',
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

			$('.sort-link').click(function() { //排序
				var filterId = $(this).attr('sortId');
				if (filterId === '0') {
					window.location.href = hrefFormer;
				} else {
					if (filterId === filter) {
						sortType = sortType === '0' ? '1' : '0';
						window.location.href = hrefFormer + '?filter=' + filterId + (ageGenes === 1 ? '&ageGenes=1' : '') + '&sort=' + sortType;
					} else {
						if (filterId === '2') { //价格默认按照升序排序，其他按照降序排序
							window.location.href = hrefFormer + '?filter=' + filterId + (ageGenes === 1 ? '&ageGenes=1' : '') + '&sort=0';
						} else {
							window.location.href = hrefFormer + '?filter=' + filterId + (ageGenes === 1 ? '&ageGenes=1' : '') + '&sort=1';
						}
					}
				}
			});

			$('.user-defined').click(function() { //自定义
				var $this = $(this),
					definedType = $this.attr('definedType');
				var newGenes = "0";
				var genesVal = $this.prev().find('.input-text').val();
				var ageGenesVal = genes.split('_')[0] || '0';
				var deadlineGenes = genes.split('_')[1] || '0';

				if (!genesVal) {
					return false;
				}
				if (definedType === 'age') {
					try {
						genesVal = ~~genesVal;
					} catch (ex) {
						genesVal = 0;
					}
					ageGenesVal = genesVal;
					window.location.href = '/product/ins-' + subCategory + '-' + companyId + '-' + queryKeys + '-' + ageGenesVal + '_' + deadlineGenes + (~~ageGenesVal === 0 ? '?ageGenes=1' : '');
				} else {
					deadlineGenes = genesVal;
					window.location.href = '/product/ins-' + subCategory + '-' + companyId + '-' + queryKeys + '-' + ageGenesVal + '_' + deadlineGenes + (ageGenes === 1 ? '?ageGenes=1' : '');
				}

			});

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
			$('.self-define').blur(function() {
				var $this = $(this),
					val = $this.val();
					if(!val){
						$this.nextAll('.unit').addClass('fn-hide');
					}else{
						$this.nextAll('.unit').removeClass('fn-hide');
					}
			});
			$('.only-number').enterOnlyNumber();
		},
		getHistory: function() { //获取浏览数据
			// helper.cookie.setCookie("Product_History", "10098:20156,10096:10103,10040:20071,1000013:1000016,10042:10088,4843:10107,10097:20148,10003:10001,1427:1590,10006:10004,10007:10005,10029:20058,10049:337,10102:20162,10111:20176,10112:20177,10101:20161,10110:20187,10119:20190,20176,20071,20053,20177,20154");
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
			this.historyAction();
		},
		historyAction: function() {
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
		},
		initDropDown: function(dropDown) {
			var timeOut,
				showTimeOut,
				$dropDown = $(dropDown),
				dropdownItem = $dropDown.attr('data-dropdown'),
				// $filiterCategoriges = $('#filiterCategoriges'),
				$iconText = $dropDown.find('.input-select .iconfont'),
				$dropdownItemMenu = $('[data-dropdown-item=' + dropdownItem + ']');

			function _show() {
				$dropdownItemMenu.show();
				$dropDown.addClass('hz-dropdown-hover');
			}

			function _hide() {
				$dropdownItemMenu.hide();
				$dropDown.removeClass('hz-dropdown-hover');
			}

			$dropDown
				.on('mouseenter', function() {
					showTimeOut = setTimeout(_show, 200);
				})
				.on('mouseleave', function() {
					clearTimeout(showTimeOut);
					timeOut = setTimeout(_hide, 100);
				});

			$dropdownItemMenu
				.on('mouseenter', function() {
					clearTimeout(timeOut);
				})
				.on('mouseleave', function() {
					timeOut = setTimeout(_hide, 100);
				});
		},
		initDate: function() {
			var _this = this;
			$('.Wdate').not('.bind').each(function() {
				var parent;
				if ($(this).parents('[data-dropdown-item]').length > 0) {
					parent = $(this).parents('[data-dropdown-item]')[0];
					new MyCalendar({
						el: this,
						parent: parent,
						zIndex: 9999999999,
						top: function() { //获取TOP方式，可为静态，可为动态
							var top = 0;
							if (this.parent) {
								top = this.parent.top;
							}
							return top;
						},
						left: function() { //获取left方式，可为静态，可为动态
							var left = 0;
							if (this.parent) {
								left = this.parent.left;
							}
							return left;
						},
						//scrollTime:10,//default
						maxDate: function() { //获取日期控件的最大值
							var result = '2100-12-31';
							var date = new Date();
							result = date.getFullYear() + '-' + (~~date.getMonth() + 1) + '-' + date.getDate();
							return result;
						},
						minDate: function() { //获取日期控件的最小值
							var result = '1900-1-1';
							return result;
						},
						callback: function(date, dateObj) {
							var $input = $(this.el).prev('input');
							var age = _this.getFullAge(date);
							$input.val(age);
							$input.blur();
						}
					});
				} else {
					new MyCalendar({
						el: this,
						zIndex: 9999999999,
						//scrollTime:10,//default
						maxDate: function() { //获取日期控件的最大值
							var result = '2100-12-31';
							var date = new Date();
							result = date.getFullYear() + '-' + (~~date.getMonth() + 1) + '-' + date.getDate();
							return result;
						},
						minDate: function() { //获取日期控件的最小值
							var result = '1900-1-1';
							return result;
						},
						callback: function(date, dateObj) {
							var $input = $(this.el).prev('input');
							var age = _this.getFullAge(date);
							$input.val(age);
							$input.blur();
						}
					});
				}
			});
		},
		getFullAge: function(val) { //获取精确年数，是否包含生日当天
			var nowDate = new Date(),
				select = new Date(val),
				year = 0,
				month = 0,
				date = 0,
				i = 0;
			year = nowDate.getFullYear() - select.getFullYear();
			month = nowDate.getMonth() - select.getMonth();
			date = nowDate.getDate() - select.getDate();
			if (month < 0) {
				i = -1;
			} else if (month === 0) {
				if (date < 0) {
					i = -1;
				}
			} else if (month > 0) {

			}
			return year + i;
		}
	};
	return productList;
});