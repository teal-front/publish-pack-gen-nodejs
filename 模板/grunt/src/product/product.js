define(['trial', 'jquery-tab', 'detail', 'jquery-prompt'], function(Trial, tab, detail) {

	var product = {
		init: function() {

			this.trial();

			this.detialTab();
			this.recommendTab();
			this.review();
			this.guide();
			detail.init(this.trialBox);



			this.insuredStart();
		},
		insuredStart: function() { //立即投保
			var _this = this;
			$(document)
				.on('click', '[insuredstart]', function() {
					var id = {},
						trial = _this.trialBox[$planId.val()];
					alert('产品ID：' + trial.productId + '\n' + '计划ID：' + trial.productPlanId + '\n' + '基础层产品ID：' + trial.baseProductId + '\n' + '基础层计划ID：' + trial.baseProductPlanId + '\n' + '保费：' + trial.preminum + '\n' + '试算因子：' + JSON.stringify(trial.getGenes()) + '\n');

				})
				.on('click', '[addshopcard]', function() {
					var id = {},
						trial = _this.trialBox[$planId.val()];
					//alert('产品ID：' + trial.productId + '\n' + '计划ID：' + trial.productPlanId + '\n' + '基础层产品ID：' + trial.baseProductId + '\n' + '基础层计划ID：' + trial.baseProductPlanId + '\n' + '保费：' + trial.preminum + '\n' + '试算因子：' + JSON.stringify(trial.getGenes()) + '\n');

				});
		},
		detialTab: function() { // 主题标签切换
			$('#detailTabs').tab('#detialTabContent', {
				titleCurrent: 'active',
				contentCurrent: 'show'
			});
		},
		guide: function() {
			$('#guideTabs').tab('#guideContentTabs', {
				titleCurrent: 'active',
				contentCurrent: 'show'
			});
		},
		recommendTab: function() { //推荐组合切换
			$('#recommendTable').tab('#recommendTableContent', {
				titleCurrent: 'active',
				contentCurrent: 'show',
				onComplete: function($this, index, $title, $content) {

				}
			});
		},
		trialBox: {}, //试算容器
		trial: function() {
			var data = window.data || {};
			var _this = this,
				security = data.security || {},
				planList = security.planList || [],
				priceList = [],
				$productPlanName = $('#productPlanName');

			var urlProductPlanId = Trial.prototype.getQueryValue('DProtectPlanId');

			$.each(planList, function(i, item) {

				var trial = new Trial({
					el: $('#trialWrap'),
					genesArea: $('.trail-genes-list').eq(i), //试算区域
					protectArea: $('.trial-protect-list').eq(i), //保障项区域
					renderData: data.restrictRules[i],
					productId: $('#productId').val(), //产品ID
					productPlanId: item.planId, //计划ID
					baseProductId: security.baseProductId, //基础产品ID
					baseProductPlanId: item.basePlanId, //基础计划ID
					data: data || {},
					ready: function() {
						var className = '';
						if (this.toInt(this.productPlanId) !== this.toInt(urlProductPlanId)) {
							className = 'hidden';
						}
						$('[preminum]').append('<span class="product-price ' + className + '" planid="' + this.productPlanId + '"><span currency="' + this.productPlanId + '">¥</span><i>' + this.priceResult(this.preminum) + '</i></span>');
					},
					change: function() {

						var preminum = this.priceResult(this.preminum);
						var productPlanId = this.productPlanId;

						//浮动栏
						$('.product-price[planid]').hide();
						$('span[currency]').hide();
						$('[planid="' + this.productPlanId + '"]').show().find('i').text(preminum);
						if (preminum !== '--') {
							$('span[currency="' + this.productPlanId + '"]').show();
						}
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
					getServiceTimeUrl: '/tools/date/now', //获取服务端时间
					serchJobUrl: '/search/job', //职业类别查寻
					debug: true
				});
				//priceList.push('<div id="price-' + item.planId + '"></div>');

				_this.trialBox[item.planId] = trial; //保存起来

			});
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
			//切换计划
			$(document)
				.on('click', '#planIdBox span', function() {
					var index = $(this).index();
					var planId = $(this).data('productplanid');
					var planName = $(this).data('productplanname');
					// 标题添加样式
					$(this).parent().find('span').removeClass('filter-active-tag');
					$(this).addClass('filter-active-tag');

					//试算因子
					$('.trail-genes-list')
						.hide()
						.eq(index)
						.show();

					//保障项
					$('.trial-protect-list')
						.hide()
						.eq(index)
						.show();

					//设置当前计划-隐藏域
					$planId.val(planId);

					//设置浮动栏信息
					$('[planid]').hide();
					$('[planid="' + planId + '"]').show();

					//变换计划名
					$productPlanName.text(planName);

					//卖点
					$('[data-salepromotion]').hide();
					$('[data-salepromotion="' + planId + '"]').show();

				});

			window.trialBox = _this.trialBox; //开发用
		},
		review: function() { //评论
			$('#reviewTable').tab('#reviewTableContent', {
				titleCurrent: 'active',
				contentCurrent: 'show',
				onComplete: function(index, $this, $title, $content) {
					if (detail && $this) {
						detail.render.changekkPager($this);
					}
				}
			});
		}
	};
	return product;
});