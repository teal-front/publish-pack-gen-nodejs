/**
 * @constructor		Programs
 * @author  		陈润发
 * @version 		0.0.1
 * @date    		2016.06.21
 * @description  	规划详情业务逻辑
 */

define([
	'trial',
	'helper',
	'base',
	'layer',
	'message',
	'share-panel',
	'my-calendar',
	'fixed-tool-float',
	'programs-json',
	'jquery-plugins',
	'jquery-prompt',
	'animate-fly'
], function(
	Trial,
	helper,
	Base,
	layer,
	Message,
	SharePanel,
	MyCalendar,
	ToolFloat,
	ProgramsJson
) {
	'use strict';

	var message = new Message();
	var programsJson = ProgramsJson;

	function Programs() {
		this.planId = 0;		// 计划ID
	};

	Programs.prototype = {
		constructor: Programs,

		// 加入购物车URL
		addShopCartUrl: '/api/insurance-slips',
		// 方案价格
		ruleUrl: '/api/programs/restrict-rule',
		// 获取服务器时间
		dateNowUrl: '/api/tools/date/now',

		// 购物车最大数量
		MAX_SHOPCOUNT: 20,

		// 计划试算数据
		planData: {},
		// 选中计划ID
		selPlanId: 0,
		// 获取页面ID
		pageId: $('.page-id').val() || '',
		// 变更ID数组
		changeId: $('.change-id').val().split(',') || [],
		// 承保年龄
		changeDate: $('.change-date').val().split(',') || [],
		// 日期范围ID
		dateId: $('.change-date').attr('data-id').split(',') || '',
		// 年龄单位
		dateUnit: $('.change-date').attr('data-unit') || '',

		// 当前日期时间
		dateNow: {},

		// 是否登录
		isLogin: false,

		// 初始化
		init: function() {
			var _this = this;
			this.planData = programsJson;
			this.initEvent();
			this.setLogin();
			this.setShare();
			this.setBirthDate();
			this.updateInsurantDate();
			this.scrollTopFixed();
			// 侧边栏
			this.toolFloat = new ToolFloat();
		},

		// 事件初始化
		initEvent: function() {
			var _this = this;

			$('body')
				.on('click', function(event) {
					_this.hideAllDropdown();
				})
				// 下拉框
				.delegate('.hz-dropdown', 'click', function(event) {
					_this.dropdownSelect($(this));
				})
				// 单选框
				.delegate('.plan-radio-wrap .plan-radio', 'click', function(event) {
					_this.singleBox($(this));
				})
				// 收藏按钮
				.delegate('#favorite', 'click', function(event) {
					_this.sendCollect($(this));
				})
				// 加入购物车按钮
				.delegate('.add-cart-btn', 'click', function(event) {
					_this.addShopCart($(this));
				})
				// 选择计划
				.delegate('.plan-list-com li', 'click', function(event) {
					var e = event || window.event;
					if (e.stopPropagation) {
						e.stopPropagation();
					} else {
						e.cancelBubble = true;
					}
					_this.selectPlan($(this));
				});
		},
		// 设置分享按钮
		setShare: function() {
			var share = new SharePanel({
				items: ["sina", "zone"],
                url: location.href,
                pageId: this.pageId,
                summary: '推荐慧择定制保障方案给您，' + ($('#planName').attr('data-title') || ""),
                htmlUrl: 'require-text!/html/public/grograms-share-panel.html'
			});
		},
		// 是否登录
		setLogin: function() {
			var _this = this;
			helper.state.checkLogin(function(result) {
                _this.isLogin = result.result;
                // 检测是否已收藏
				_this.isCollect();
            });
		},
		// 收藏
		sendCollect: function(t) {
			var _this = this;
			var $this = t;

			if(this.isLogin){
                if(!$this.hasClass("active")) {
                    $.ajax({
                    	type: 'post',
                        url: '/api/programs/'+_this.pageId+'/collections',
                        dataType: 'json',
                        success: function (data) {
	                        if (data.status === '00000' && data.result) {
	                            layer.msg('收藏成功');
	                            $this.addClass("active").find('.iconfont').html("&#xe744;");
	                        } else {
	                            layer.msg("收藏失败");
	                        }
                        },
                        error: function(ex) {}
                    });
                } else {
                	// 取消收藏
                    layer.confirm("<div class='pt45 pb45 tac'>确定取消该规划的收藏吗</div>",{
                        btn : ["取消","确定"],
                        area: "530px",
                        title : false,
                        btn1 : function(index){
                            layer.close(index);
                        },
                        btn2 : function(index){
                        	// 确定，发送取消收藏请求
                        	$.ajax({
		                    	type: 'delete',
		                        url: '/api/programs/'+_this.pageId+'/collections',
		                        dataType: 'json',
		                        success: function (data) {
			                        if (data.status === '00000' && data.result) {
	                                    layer.msg('取消成功');
	                                    $this.removeClass("active").find('.iconfont').html("&#xe741;");
	                                } else {
	                                    layer.msg("取消失败");
	                                }
		                        },
		                        error: function(ex) {}
		                    });
                        }
                    });
                }
            } else {
                requirejs(["sign-float"], function(signFloat) {
                    var sign = new signFloat({
                        returnUrl: location.href,
                        showRegister: true,
                        callback: function(data) { //登录成功回调
                            location.reload();
                        }
                    });
                });
            }
		},
		// 是否已收藏
		isCollect: function() {
			var _this = this;
			if (this.isLogin) {
				// 判断是否已经收藏
				$.ajax({
					type: 'get',
					url: '/api/programs/'+_this.pageId+'/is-collected',
					dataType: 'json',
					success: function(data) {
						if (data.status === '00000' && data.result) {
							$('#favorite').addClass('active').find('.iconfont').html("&#xe744;");
						} else {
							$('#favorite').removeClass('active').find('.iconfont').html("&#xe741;");
						}
					},
					error: function(ex) {}
				});
			}
		},
		// 设置出生日期
		setBirthDate: function() {
			var _this = this;
			var $wdate = $('.Wdate');
			var dateIdArr = [];
			var time = this.getDateNow();
			var date = time.substring(0, time.indexOf(' '));
			this.dateNow = new Date(date);

			// 遍历有多少日期选择，设置日期
			$wdate.each(function() {
				var $this = $(this);
				var id = $this.attr('id') || '';
				// 获取可选日期及规则
				var max = $this.attr('data-max') || 120;
				var min = $this.attr('data-min') || 0;
				var maxunit = $this.attr('data-maxunit') || 'year';
				var minunit = $this.attr('data-minunit') || 'year';
				var step = parseInt($this.attr('data-step'));
				var minStep = parseInt($this.attr('data-min-step'));
				var defaultVal = $this.attr('data-val') || '';
				var defaultUnit = $this.attr('data-valunit') || 'year';
				if(isNaN(step)) {
    				step = 1;
				}
				if(isNaN(minStep)) {
    				minStep = 0;
				}
				var maxDate = _this.getDateRange(_this.dateNow, max, maxunit, step, -1);
				var minDate = _this.getDateRange(_this.dateNow, min, minunit, minStep);
				var defaultValue = (defaultVal !== '') ? _this.getDateRange(_this.dateNow, defaultVal, defaultUnit) : '';

				var el = (id !== '') ? document.getElementById(id) : '';
				if (el !== '') {
					setDate($this, el, maxDate, minDate, defaultValue);
				}
			});

			// 日期
			function setDate(t, el, minDate, maxDate, defaultValue) {
				var $t = t;
				$t.attr('data-oldval', defaultValue);
				var calendar = new MyCalendar({
					el: el,
					minDate: minDate,
					maxDate: maxDate,
					defaultValue: ''+defaultValue,
					callback: function(data, arg) {
						if (arg.type === 'date') {
							var $li = $t.parents('li');
							var planId = $li.attr('data-planid');
							var key = $t.attr('data-key');
							var oldVal = $t.attr('data-oldval');
							$t.attr('data-oldval', data);	// 重新设置旧值
							// 设置改变值
							_this.setPlanParams($li, planId, key, data, oldVal);
						}
					}
				});
			}
		},
		// 返回可选年龄范围
		// now:当前时间，range:日期范围，unit:日期单位，step:天数步长，full:周岁
		getDateRange: function(now, range, unit, step, full) {
			var step = step || 0;
			var full = full || 0;
			var unit = unit || 'year';
			var nowYear = now.getFullYear() + full;
			var nowMonth = now.getMonth() + 1;
			var nowDay = now.getDate() + step;
			// 可选日期规则
			switch (unit) {
				case 'year':
					nowYear -= range;
					break;
				case 'month':
					nowMonth -= range;
					break;
				case 'day':
					nowDay -= range;
					break;
			}
			var newDate = new Date(nowYear, nowMonth, nowDay);
			var newMonth = newDate.getMonth();
			var newDay = newDate.getDate();
			// 返回日期
			return newDate.getFullYear()+'-'+((newMonth >= 10) ? newMonth : '0'+newMonth)+'-'+((newDay >= 10) ? newDay : '0'+newDay);
		},
		// 滚动固定顶部
		scrollTopFixed: function() {
			var $plan = $('.fixed-plan');
			var $proCont = $('.programs-content');
			var $top = $('.top-location');			// 大分类
			var $tabMenu = $('.hz-tab-menu-item');	// 导航菜单
			var $body = $('body, html');
			var tabTop = $plan.offset().top;
			var tabHeight = $plan.height();
			var bodyTop = $body.scrollTop();
			var topArr = [];

			// 存储顶部位置
			$top.each(function(index, el) {
				topArr.push($(this).offset().top - 142);
			});
			// 设置显示
			setTopFixed(bodyTop);

			// 绑定事件监听
			$(window).on('scroll', function() {
				bodyTop = $(this).scrollTop();
				setTopFixed(bodyTop);
			});

			// 绑定菜单点击事件
			$tabMenu.on('click', function() {
				var idx = $(this).index();
				var type = $(this).attr('data-type') || '';
				if (type === 'link') {
					return;
				}
				// 设置位置
				$body.animate({
					scrollTop: topArr[idx]
				}, 100);
			});

			// 设置顶部固定
			function setTopFixed(top) {
				if (tabTop + tabHeight - 155 < top) {
					$plan.addClass('fixed-detail-tab-wrap');
					$proCont.css('margin-top', tabHeight + 30);
				} else {
					$plan.removeClass('fixed-detail-tab-wrap');
					$proCont.css('margin-top', 0);
				}
				// 遍历设置位置
				for (var i = 0, len = topArr.length; i < len; i++) {
					if (top >= topArr[i] - 1) {
						// 设置导航位置
						$tabMenu.removeClass('active');
						$tabMenu.eq(i).addClass('active');
					}
				}
			}
		},
		// 下拉选择
		dropdownSelect: function(t) {
			var _this = this;
			var $this = t;

			if (!$this.hasClass('active')) {
				// 隐藏其他打开下拉框
				_this.hideAllDropdown();
				// 设置当前当前下拉框
				$this.addClass('active')
					.find('.hz-dropdown-content').show()
					.find('li').click(function(event) {
						var e = event || window.event;
						if (e.stopPropagation) {
							e.stopPropagation()
						} else {
							e.cancelBubble = true;
						}
						// 如果已经选择，点击不做处理
						if ($(this).hasClass('hz-select-option-selected')) {
							return;
						}
						var val = $(this).attr('data-val');
						var key = $this.attr('data-key');
						var txt = $(this).text();
						var oldVal = $this.find('.input-select-text').text();
						var $li = $this.parents('li');
						var planId = $li.attr('data-planid');

						$(this).parent().find('li').removeClass('hz-select-option-selected');
						$(this).addClass('hz-select-option-selected');
						// 设置选中值，并设置数据
						$this.attr('data-val', val).removeClass('active')
							.find('.hz-dropdown-content').hide();
						$this.find('.input-select-text').text(txt);			// 设置文本

						// 设置数据
						_this.setPlanParams($li, planId, key, txt, oldVal)

					});
			} else {
				$this.removeClass('active')
					.find('.hz-dropdown-content').hide()
					.find('li').unbind('click');	// 移除点击事件
			}
		},
		// 单选框
		singleBox: function(t) {
			var $t = t;
			if (!$t.hasClass('active')) {
				var val = $t.attr('data-val') || '';
				var $parent = $t.parent();
				var $li = $parent.parents('li');
				var planId = $li.attr('data-planid');
				var key = $parent.attr('data-key');
				var oldVal = (val === '男') ? '女' : '男';
				$parent.attr('data-val', val)
					.find('.plan-radio').removeClass('active');
				$t.addClass('active');
				// 设置修改值
				this.setPlanParams($li, planId, key, val, oldVal);
			}
		},
		// 隐藏全部下拉
		hideAllDropdown: function() {
			$('.hz-dropdown').each(function() {
				if ($(this).hasClass('active')) {
					$(this).removeClass('active')
						.find('.hz-dropdown-content').hide();
				}
			})
		},
		animateFly: function(startEl,endEl,callback){
            var img = "//img.huizecdn.com/hz/www/page/cart-flyer.png",
                flyer = $('<img class="u-flyer" src="'+img+'">').width(40).height(40),
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
        },
		// 加入购物车
		addShopCart: function(t) {
			if (this.selPlanId === 0) {
				var top = $('.plan-list-com').offset().top;
				var h = $('.fixed-plan').height();

				layer.msg('请先选择保障计划');
				if (t.hasClass('add-cart-top')) {
					$('html, body').scrollTop(top - h);
				}
				return false;
			}

			var _this = this;
			var planData = this.planData[this.pageId];
			var plans = planData[this.selPlanId];
			var data = [];

			if (plans.length > 0) {
				var len = plans.length, 
					i, plan;
				var genes, j, gLen;
				for (i = 0; i < len; i++) {
					plan = plans[i];
					// 如果这个ID需要改变
					if (this.changeId.indexOf(plan.productId) > -1) {
						genes = plan.genes;
						// 遍历设置数据
						for (j = 0, gLen = genes.length; j < gLen; j++) {
							var g = genes[j]
							if (g.key === 'insurantDate') {
								// 设置最新值
								var $li = $('.plan-list-com li[data-planid='+this.selPlanId+']');
								var val = $li.find('.Wdate').val();
								// 判断日期范围
								if ( this.dateId.indexOf(plan.productId) > -1 && this.changeDate.length > 0) {
									g.value = this.getAgeRange(val);
								} else {
									g.value = val;
								}
							}
						}
					}
					// 打入购物车数据
					data.push({
						restrictRule:{
					        "platform":"1",
					        "channel":1
					    },
						// 设置规划ID和计划ID
					    projectId: this.pageId,
					    projectPlanId: this.selPlanId,
					    productId: plan.productId,
					    planId: plan.planId,
					    genes: plan.genes,
					    totalNum: 1,
					    inShoppingCart: true
					})
				}
				// 加入购物车
				this.sendAddCart(data, function(result) {

					var res = result.result;

					// 判断是否已经登录
					if(_this.isLogin) {
						_this.animateFly(t,$("#carItemCount"),function(){
							location.href = 'https://is.huize.com/shopping-cart';
                        });
					} else {
						// 未登录，数据暂时存放cookie中
						var insureStr = helper.cookie.getCookie("InsureNums");
                        if (insureStr.split(",").length === _this.MAX_SHOPCOUNT) {
                            layer.alert("购物车数量达到上限，请先结算购物车中的产品", {
                                btn: ["去购物车"]
                            }, function (index) {
                                layer.close(index);
                                location.href = "https://is.huize.com/shopping-cart/";
                            });
                            return;
                        }
                        // 打入cookie参数
                        $.each(res, function (index, item) {
                            if (insureStr.indexOf(item.insureNum) === -1) {
                                if (insureStr) {
                                    insureStr = insureStr + "," + item.insureNum;
                                } else {
                                    insureStr = insureStr + item.insureNum;
                                }
                                helper.cookie.setCookie("InsureNums", insureStr, 1000 * 60 * 60 * 24, ".huize.com");
                            }
                        });
                        _this.animateFly(t,$("#carItemCount"),function(){
							layer.msg('加入购物车成功');
	                        // 刷新购物车
	                        _this.toolFloat.refreshShopCar();
                        });
					}

				}, function(result) {
					var msg = '';
					if (result.status == '10401') {
						msg = '该计划中的部分产品已下架，您可购买其他计划';
					} else if (result.status == -2147483648) { 
						msg = '保监会规定单笔保费不能超过20万哦~您可以分两单提交投保';
					} else {
						msg = result.message || '加入购物车失败，请重试';
					}
		 			layer.msg(msg);
				});
			}
		},

		// 更新试算日期
		updateInsurantDate: function() {
			var pageData = this.planData[this.pageId] || {};

			for (var k in pageData) {
				var planData = pageData[k] || [];
				if (planData.length > 0) {
					var len = planData.length, i;
					// 遍历产品
					for (i = 0; i < len; i++) {
						var plan = planData[i];
						// 是否为需要改变的ID
						if (this.changeId.indexOf(plan.productId) > -1) {
							var genes = plan.genes;
							if (genes.length > 0) {
								var gLen = genes.length, j;
								// 遍历试算项，设置价格
								for (j = 0; j < gLen; j++) {
									var gen = genes[j];
									if (gen.key === 'insurantDate' && this.dateId.indexOf(plan.productId) == -1) {
										var $li = $('.plan-list-com li[data-planid='+k+']');
										var val = $li.find('.Wdate').val() || '';
										if (val !== '') {
											gen.value = val;
										}
									}
								}
							}
						}
					}
				}
			}
		},
		// 选择计划
		selectPlan: function(t) {
			var _this = this;
			var $this = t;
			var selVal = $this.attr('data-planid') || 0;
			$('.plan-list-com li').removeClass('active');
			$this.addClass('active');
			this.selPlanId = selVal;

			var money = $this.find('.plan-price').text();
			money = money.replace('元', '');
			$('.plan-top-price').text(money);
		},
		// 设置计划参数
		setPlanParams: function(el, planId, key, data, oldVal) {
			var pageData = this.planData[this.pageId] || {};
			var planData = pageData[planId] || [];

			if (planData.length > 0) {
				var len = planData.length, i;
				// 遍历产品
				for (i = 0; i < len; i++) {
					var plan = planData[i];
					// 是否为需要改变的ID
					if (this.changeId.indexOf(plan.productId) > -1) {
						var genes = plan.genes;
						if (genes.length > 0) {
							var gLen = genes.length, j;
							// 遍历试算项，设置价格
							for (j = 0; j < gLen; j++) {
								var gen = genes[j];

								if (gen.key === key) {
									var oldAge = '';
									if ((key === 'insurantJob' && plan.productId !== '1000043')) {
										break;
									}

									// 设置年龄范围
									if (key === 'insurantDate' && this.dateId.indexOf(plan.productId) > -1 && this.changeDate.length > 0) {
										gen.value = this.getAgeRange(data);
										// 旧值年龄范围
										oldAge = this.getAgeRange(oldVal);
									} else {
										gen.value = data;
									}

									// 设置旧值
									plan['optGeneOldValue'] = {
										key: key,
										value: oldAge !== '' ? oldAge : oldVal
									}
									break;
								}
							}
						}
					}
				}
				// 获取计划价格
				this.getPlanPrice(el, planData);
			}
		},
		// 获取年龄
		getAge: function(date) {
			var r = date.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);     
			if (r == null) return false;     
			var birth = new Date(r[1], r[3]-1, r[4]);     
			if (birth.getFullYear() == r[1] && (birth.getMonth() + 1) == r[3] && birth.getDate() == r[4]) {   

				var today = this.dateNow;
				var age = today.getFullYear() - r[1];
				if( today.getMonth() > birth.getMonth()){
					return age;
				}
				// 月份等于
				if(today.getMonth() == birth.getMonth()){
					// 判断天数
					if(today.getDate() >= birth.getDate()){
						return age;
					}else{
						return age - 1;
					}
				}
				if(today.getMonth() < birth.getMonth()){
					return age - 1;
				}
			}
		},
		// 获取年龄范围
		getAgeRange: function(date) {
			var len = this.changeDate.length, i;
			var age = this.getAge(date);	// 获取年龄
			var val = '';
			// 遍历
			for (i = 0; i < len; i++) {
				var d = this.changeDate[i];
				var dArr = d.split('-');
				var left = dArr[0] || '';
				var right = dArr[1] || '';
				// 如果在日期范围内
				if (left && right) {
					if (left <= age && right >= age) {
						val = d + this.dateUnit;
						break;
					}
				} else if (left && left == age) {
					val = d + this.dateUnit;
					break;
				}
			}
			return val;
		},
		// 设置计划价格
		setPlanPrice: function(el, data) {
			var price = data.price;
			var total = parseFloat(price * 0.01).toFixed(2);
			if (isNaN(total)) {
				total = '--';
			}
			// 设置价格
			el.find('.plan-price').text(total+'元');
			$('.plan-top-price').text(total);
		},


		/**
		* 请求
		*/
		// 加入购物车
		sendAddCart: function(data, callback, failcallback) {
			var _this = this;

			message.show('正在加入购物车...', 'loading');

			helper.request.postData2({
				url: _this.addShopCartUrl,
				data: data
			}, function(data) {
				message.hide();
				callback && callback(data);
			}, function(data) {
				message.hide();
				failcallback && failcallback(data);
			})
		},
		// 获取当前时间
		getDateNow: function() {
			var _this = this;
			var time = '';

			$.ajax({
				type: 'get',
				url: _this.dateNowUrl,
				async: false,
				dataType: 'json',
				success: function(data) {
					if (data.status === '00000' && data.success) {
						time = data.result;
					}
				}
			})
			return time;
		},
		// 获取试算价格
		getPlanPrice: function(el, data) {
			var _this = this;
			var jsonData = JSON.stringify(data) || '';
			message.show('正在试算价格...', 'loading');
			$.ajax({
				type: 'post',
				url: _this.ruleUrl,
				data: {data: jsonData},
				dataType: 'json',
				success: function(data) {
					message.hide();
					if (data.status === '00000' && data.result.success !== false) {
						if (data.result.msg && data.result.msg != '') {
							layer.msg('保监会规定单笔保费不能超过20万哦~您可以分两单提交投保');
						}
						_this.setPlanPrice(el, data.result);
					} else if (data.result.success === false && data.result.msg !== '') {
	                    layer.msg(data.result.msg);
					} else {
						var msg = data.message || '价格试算失败，请重试';
	                    layer.msg(msg);
					}
				}
			});
		}
	};

	Base.extend(Programs.prototype, new Base());

	return new Programs();
});