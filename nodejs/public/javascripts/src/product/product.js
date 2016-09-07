/**
 **
 ** Product.js
 ** 产品详情相关功能
 **
 **/

define([
	'trial',
	'jquery-tab',
	'detail',
	'helper',
	'base',
	'jquery-prompt'
], function(
	Trial,
	tab,
	detail,
	helper,
	Base
) {
	'use strict';
	var product = {

		//初始接口
		init: function() {

			this.trial();
			this.detialTab();
			this.recommendTab();
			this.review();
			this.guide();
			detail.init(this.trialBox);

			this.event();
			this.renewal();
		},

		//事件相关
		event: function() {

			//详情导航置顶功能
			$('#detailTabs').on('click', 'li', function() {

				var height = 0 +
					($('.top-nav-wrap').outerHeight() || 0) +
					($('.hz-header-wrap').outerHeight() || 0) +
					($('#detialTab').outerHeight() || 0) -
					($('.detail-hz-tab-box').outerHeight() || 0) +
					($('.detail-hz-tab-boxs').outerHeight() || 0);

				$('html,body').scrollTop(height || 196);
				if (0 === $(this).index()) {
					setTimeout(function() {
						$('#silderbar').addClass('fixed-sidebar');
					}, 300);
				}


			});
		},

		//主题标签切换
		detialTab: function() {
			$('#detailTabs').tab('#detialTabContent', {
				titleCurrent: 'active',
				contentCurrent: 'show'
			});
		},

		//向导
		guide: function() {
			$("#guideTabs")
				.on("hover", "li[data-tab]", function() {
					$("#guideTabs li").removeClass("active");
					$(this).addClass("active");
					$("#guideContentTabs > div").hide();
					$("#guideContentTabs > div[data-tab='" + $(this).attr("data-tab") + "']").show();
				})
		},

		//推荐组合切换
		recommendTab: function() {
			$('#recommendTable').tab('#recommendTableContent', {
				titleCurrent: 'active',
				contentCurrent: 'show',
				onComplete: function($this, index, $title, $content) {

				}
			});
		},

		//
		// 试算容器
		// 产品试算
		//
		trialBox: {},
		trial: function() {
			var _this = this,
				$productPlanName = $('#productPlanName'),
				productId = $('#productId').val(),
				planId = $('#planId').val(),
				baseProductId = $('#baseProductId').val(),
				basePlanId = $('#basePlanId').val(),
				$planId,
				urlProductPlanId = Trial.prototype.getQueryValue('DProtectPlanId'),
				debug = function() {
					var dev = Trial.prototype.getQueryValue('dev'),
						debug;
					try {
						debug = localStorage.getItem('dev') === 'true';
					} catch (ev) {

					}
					if (dev) {
						debug = dev === 'true';
					}
					return debug;
				},
				trialObj = {
					el: $('#trialWrap'),
					genesArea: $('.trail-genes-list'), //试算区域
					protectArea: $('.trial-protect-list'), //保障项区域					
					productId: productId, //产品ID
					productPlanId: planId, //计划ID
					baseProductId: baseProductId, //基础产品ID
					baseProductPlanId: basePlanId, //基础计划ID					
					// ready: function() {
					// 	var className = '';
					// 	if (this.toInt(this.productPlanId) !== this.toInt(urlProductPlanId)) {
					// 		className = 'hidden';
					// 	}
					// 	$('[preminum]').append('<span class="product-price ' + className + '" planid="' + this.productPlanId + '"><span currency="' + this.productPlanId + '">¥</span><i>' + this.priceResult(this.preminum) + '</i></span>');
					// 	$('[preminum]').html(this.setPrice());
					// },
					change: function() {

						//var preminum = this.priceResult(this.preminum);
						//var productPlanId = this.productPlanId;

						//浮动栏
						// $('.product-price[planid]').hide();
						// $('span[currency]').hide();
						// $('[planid="' + this.productPlanId + '"]').show().find('i').text(preminum);
						// if (preminum !== '--') {
						// 	$('span[currency="' + this.productPlanId + '"]').show();
						// }
						if (this.trialPrice) {
							$('[preminum]').html(this.setPrice());
						}
						// if (undefined !== this.isInsure) {
						// 	if (this.isInsure) {
						// 		$('[insuredstart]').removeClass('disabled');
						// 	} else {
						// 		$('[insuredstart]').addClass('disabled');
						// 	}
						// }


						//$('#preminum-' + productPlanId).find('i').text(preminum);

					},
					getSalePromotionList: function(list) { //获取促销信息
						var className = '';
						//隐藏非当前的项
						if (this.toInt(this.productPlanId) !== this.toInt(urlProductPlanId)) {
							className = 'hidden';
						}
						$('[salepromotionlist]').append('<div class="' + className + '" planid="' + this.productPlanId + '">' + list.join('') + '</div>');
					},
					getServiceTimeUrl: '/api/tools/date/now', //获取服务端时间
					serchJobUrl: '/search/job', //职业类别查寻
					debug: debug()
				},
				trial;

			//调整模式，使用前端渲染页面
			if (Trial.prototype.getQueryValue('dev') === 'true') {

				trialObj.renderData = data.restrictRules[0];
				trialObj.data = window.data || {};

			}

			trial = new Trial(trialObj);

			//priceList.push('<div id="price-' + item.planId + '"></div>');

			_this.trialBox[planId] = trial; //保存起来

			//$('.sidebar-product-info .product-price').html(priceList.join(''));
			$(function() {
				$('[rel="prompt"]').prompt({
					position: 'top'
				});
			});

			//初始化计划当前ID
			$planId = $('#planId');
			if (urlProductPlanId) { //判断是否有URL计划参数
				$planId.val(urlProductPlanId);
			}

			if (!urlProductPlanId) {
				$('#planIdBox').find('.filter-tag').eq(0).addClass('filter-active-tag');
				$('.trail-genes-list').eq(0).show();
			}
			// //切换计划
			// $(document)
			// 	.on('click', '#planIdBox span', function() {
			// 		var index = $(this).index();
			// 		var planId = $(this).data('productplanid');
			// 		var planName = $(this).data('productplanname');
			// 		location.href = "/product/detail-" + $("#productId").val() + ".html?DProtectPlanId=" + planId;

			// 		// 标题添加样式
			// 		$(this).parent().find('span').removeClass('filter-active-tag');
			// 		$(this).addClass('filter-active-tag');

			// 		//试算因子
			// 		$('.trail-genes-list')
			// 			.hide()
			// 			.eq(index)
			// 			.show();

			// 		//保障项
			// 		$('.trial-protect-list')
			// 			.hide()
			// 			.eq(index)
			// 			.show();

			// 		//设置当前计划-隐藏域
			// 		$planId.val(planId);

			// 		//设置浮动栏信息
			// 		$('[planid]').hide();
			// 		$('[planid="' + planId + '"]').show();

			// 		//变化投保须知
			// 		$('[noticePlanId]').hide();
			// 		$('[noticePlanId="' + planId + '"]').show();

			// 		//变换计划名
			// 		$productPlanName.text(planName);

			// 		//卖点
			// 		$('[data-salepromotion]').hide();
			// 		$('[data-salepromotion="' + planId + '"]').show();

			// 	});

			window.trialBox = _this.trialBox; //开发用
			window.trial = trial; //开发用
		},

		//评论
		review: function() {
			$('[id="reviewTable"]').tab('[id=reviewTableContent]', {
				titleCurrent: 'active',
				contentCurrent: 'show'
			});
		},
		renewalNum: '',
		isRenewal: false,
		//续保
		renewal: function() {
			var _this = this,
				renewalParam = helper.url.getUrlVar('ep');
			if (renewalParam) {
				var renewalParams = {};
				renewalParam = renewalParam.split('~');
				renewalParam.forEach(function(item, i) {
					var key = item.split('_')[0];
					var value = item.split('_')[1];
					renewalParams[key] = value;
				});
				_this.renewalNum = renewalParams.ins;
				_this.isRenewal = renewalParams.IsRenewal === '1';
			}

			if (_this.renewalNum && _this.isRenewal) {
				$.ajax({
					url: '/api/insurance-slips/renewal/insured?renewalNum=' + _this.renewalNum + "&t=" + (new Date()).getTime(),
					type: 'get',
					success: function(data) {
						var insurant = data.result,
							planId = $('#planId').val(),
							birthdate = new Date(insurant.birthdate),
							$birthdate = $('#trialAreas .trial-item[data-key=insurantDate]');

						if ($birthdate.length > 0 && $birthdate.hasClass('Wdate')) { //出生日期
							var period = _this.getBirthdateTimePeriod($birthdate);
							if (birthdate <= period.maxDate && birthdate >= period.minDate) {
								_this.trialBox[planId].setOldValue($birthdate, $birthdate.val());
								$birthdate.val(insurant.birthdate);
								_this.trialBox[planId].postChange();
							}
						}

						if ($birthdate.length > 1) { //承保年龄
							$birthdate.each(function(item, i) {
								var period = _this.getBirthdateTimePeriod($(this));
								if (birthdate <= period.maxDate && birthdate >= period.minDate) {
									$(this).click();
								}
							});
						}
						if (insurant.sex) {
							$('#trialAreas  .trial-item[data-key=sex][data-default-value=男]').click();
						} else {
							$('#trialAreas  .trial-item[data-key=sex][data-default-value=女]').click();
						}

					},
					error: function(err) {}
				});
			}
		},

		//获取出生日期，或者承保年龄的区间值
		getBirthdateTimePeriod: function($birthdate) {
			var timePeriod = {},
				base = new Base(),
				list = $birthdate.data('list') || '[]',
				max = list.max || 0,
				min = list.min || 0,
				unit = list.unit || 0,

				_MAX_YEAR = 0,
				_MIN_YEAR = 0,
				_MAX_DATE = 0,
				_MIN_DATE = 0;

			if (base.getUnit(unit) === '岁') {
				_MAX_YEAR = min;
				_MIN_YEAR = max;
			}

			if (list.subrestrict && base.getUnit(list.subrestrict.unit) === '天') {
				var subMax = list.subrestrict.max;
				var subMin = list.subrestrict.min;

				if (subMax) {
					_MAX_DATE = subMax;
					//maxText = subMax + _this.getUnit(list.subrestrict.unit);
				}
				if (subMin) {
					_MIN_DATE = subMin;
					//minText = subMin + _this.getUnit(list.subrestrict.unit);
				}
			}

			var _MAX = base.createDate({
				newDate: base.getCurrentTime(new Date()),
				year: -_MAX_YEAR,
				date: _MAX_DATE
			});
			var _MIN = base.createDate({
				newDate: base.getCurrentTime(new Date()),
				year: -_MIN_YEAR - 1,
				date: _MIN_DATE
			});
			timePeriod.maxDate = new Date(_MAX);
			timePeriod.minDate = new Date(_MIN);
			return timePeriod;
		}
	};
	return product;
});