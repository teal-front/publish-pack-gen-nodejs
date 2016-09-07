define(['helper', 'jquery'], function(helper, $) {
	'use strict';
	/*
	 * @constructor InsureTrial
	 * @author 
	 * @version 0.0.1
	 * @description 试算
	 */
	var InsureTrial = function() {

	};
	InsureTrial.prototype = {
		initTrial: function() {
			this.setTrialItem();
			var _this = this;
			_this.el
				.delegate('.insure-form', 'change', function() {
					if ($(this).attr('trial')) {
						_this.trialChange(this);
					}
					if ($(this).attr('name') === 'cName') {
						_this.resetRightContent();
					}
				});
		},
		lastGenes: {},
		setTrialItem: function(wrap) { //标记试算项
			var _this = this,
				$wrap = wrap || _this.el;
			$.each(_this.ruleParam.genes, function(i, item) {
				if (item.key) {
					switch (item.key) {
						case _this.INSURANTDATEKEY: //承保年龄
							$wrap.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_BIRTHDATE + ']').attr('trial', true);
							_this.el.find('[data-attributeid=' + _this.ATTR_ID_INSURE_DATE + ']').attr('trial', true);
							_this.el.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_BIRTHDATE + ']').attr('trial', true);
							break;
						case _this.INSURANTJOBKEY: //承保职业
							$wrap.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_JOB + ']').attr('trial', true);
							_this.el.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_JOB + ']').attr('trial', true);
							break;
							// case _this.BUYCOUNTKEY: //份数变化都重新试算
							// 	$wrap.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_BUYCOUNT + ']').attr('trial', true);
							// 	break;
						case _this.SEXKEY: //被保人性别
							$wrap.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_SEX + ']').attr('trial', true);
							_this.el.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_SEX + ']').attr('trial', true);
							break;
						case _this.VESTERAGEKEY: //投保人年龄
							$wrap.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_BIRTHDATE + ']').attr('trial', true);
							_this.el.find('[data-attributeid=' + _this.ATTR_ID_INSURE_DATE + ']').attr('trial', true);
							break;
						case _this.VESTERSEX: //投保人性别
							_this.el.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_SEX + ']').attr('trial', true);
							break;
					}
				}
			});
			$wrap.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_BUYCOUNT + ']').attr('trial', true); //份数变化都重新试算
			_this.trialChange();
			_this.isPriceModify = _this.insurance.priceModify || false;
		},
		isTrialChange: false, //试算信息是否手动改变
		isPriceModify: false, //是否是改价的单
		trialChange: function(input) { //试算项改变
			var _this = this;
			var $insurantList = $('#module-20').find('.insurant-item-form');
			// if (_this.isReady) { //页面加载完成，触发试算信息，则上一单保存的试算信息改变
			// 	_this.isTrialChange = true;
			// }
			if (!input) { //重新计算所有的被保人
				$insurantList.each(function(i) {
					var $this = $(this);
					var genes = _this.getGenesString($this);
					_this.postChangeData(genes, $this);
				});
				return;
			}
			var $input = $(input),
				attributeid = $input.data('attributeid'),
				moduleid = $input.data('moduleid');
			if (attributeid === _this.ATTR_ID_INSURE_DATE || moduleid === _this.MODULES_ID_INSURE) { //重新试算所有被保人
				$insurantList.each(function(i) {
					var $this = $(this);
					var genes = _this.getGenesString($this);
					_this.postChangeData(genes, $this);
				});
				return;
			} else { //重新试算当前被保人
				var $from = $input.parents('.insurant-item-form');
				var genes = _this.getGenesString($from);
				_this.postChangeData(genes, $from);
			}
		},
		getGenesString: function($from) { //组装试算因子
			var _this = this,
				geneOldValue = {
					value: ""
				},
				genesParam = {
					"planId": _this.ruleParam.planId,
					"productId": _this.ruleParam.productId,
					"baseProductId": _this.ruleParam.baseProductId,
					"basePlanId": _this.ruleParam.basePlanId,
					"platform": 1,
					"channel": 1,
					"genes": [],
				},
				genes = [];

			if (_this.ruleParam.optGeneOldValue) {
				geneOldValue.value = _this.ruleParam.optGeneOldValue.value;
				if (_this.ruleParam.optGeneOldValue.key) {
					geneOldValue.key = _this.ruleParam.optGeneOldValue.key;
				}
				if (_this.ruleParam.optGeneOldValue.protectItemId) {
					geneOldValue.protectItemId = _this.ruleParam.optGeneOldValue.protectItemId;
				}
				genesParam.optGeneOldValue = geneOldValue;
			}

			$.each(_this.ruleParam.genes, function(i, item) {
				var val;
				var gene = {
					protectItemId: item.protectItemId || "",
					key: item.key || "",
					value: ""
				};
				if (item.key) {
					switch (item.key) {
						case _this.INSURANTDATEKEY: //承保年龄
							val = $from.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_BIRTHDATE + ']').val();
							if (_this.isSelf) { //如果是本人，则拿被保人或者投保人的信息
								val = val || _this.el.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_BIRTHDATE + ']').val();
							}
							break;
						case _this.INSURANTJOBKEY: //承保职业
							val = $from.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_JOB + '][job=3]:visible').find('.hz-select-option-selected').attr('level') || $from.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_JOB + '][job=2]:visible').find('.hz-select-option-selected').attr('level');
							if (_this.isSelf) { //如果是本人，则拿被保人或者投保人的信息
								val = val || _this.el.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_JOB + '][job=3]:visible').find('.hz-select-option-selected').attr('level') || _this.el.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_JOB + '][job=2]:visible').find('.hz-select-option-selected').attr('level');
							}
							break;
						case _this.BUYCOUNTKEY: //购买份数
							val = $from.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_BUYCOUNT + ']').val();
							break;
						case _this.SEXKEY: //被保人性别
							val = $from.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_SEX + '].hz-radio-item-checked  .hz-radio-text').html();
							if (_this.isSelf) { //如果是本人，则拿被保人或者投保人的信息
								val = val || _this.el.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_SEX + '].hz-radio-item-checked .hz-radio-text').html();
							}
							break;
						case _this.VESTERAGEKEY: //投保人年龄
							val = _this.el.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_BIRTHDATE + ']').val();
							break;
						case _this.VESTERSEX: //投保人性别
							val = _this.el.find('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_SEX + '].hz-radio-item-checked .hz-radio-text').html();
							break;
					}
				}
				gene.value = val || item.value;
				genes.push(gene);

			});
			var insureDateText = _this.el.find('[data-attributeid=' + _this.ATTR_ID_INSURE_DATE + ']').val();
			if (insureDateText&&insureDateText.replace(/\s/g, "")) {//处理起保日期格式
				try {
						var insuredate = new Date(insureDateText.replace(/\s/g, "")); 
						if (insuredate&&!isNaN(insuredate.getDay())) {
							insureDateText = _this.getCurrentTime(insuredate);
							genesParam.insureDateTime = insureDateText;
						}
					} catch (ex) {
					}
			}
			genesParam.genes = genes;
			genesParam = JSON.stringify(genesParam);
			$from.attr('data-genes', genesParam);
			return genesParam;
		},
		postChangeData: function(genes, $from) { //提交试算信息
			var _this = this;
			var url = '/api/insurance-slips/restrict-rule';
			$.post(url, {
				data: genes
			}, function(data) {
				_this.info(data);
				_this.resetSinglePrice(data, $from);
				_this.lastGenes = data.result;
				// _this.updateRender(data.result);
			});
		},
		resetSinglePrice: function(data, $from) { //计算每个被保险人的价格
			var result = data.result,
				statusCode = data.status;
			if (result.trialPrice && result.trialPrice.isInsure) {
				var price = 0,
					originalPrice = 0,
					_this = this;
				var buyCount = $from.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_BUYCOUNT + ']').val() || 1;
				originalPrice = result.trialPrice.totalPreminum;
				price = result.trialPrice.vipPrice;
				buyCount = result.trialPrice.buyCount;

				if (_this.isReady) { //比较上次的
					var lastPrice = parseInt($(this).attr('data-price') || 0);
					if (lastPrice !== price) { //如果手动修改影响试算的项，并且影响了试算的价格，则改价价格无效，使用重新试算的价格
						_this.isTrialChange = true;
					}
				}
				$from.attr('data-restrictRule', JSON.stringify(result));
				$from.attr('data-price', price);
				$from.attr('data-originalPrice', originalPrice);
				$from.attr('data-buycount', buyCount);
				$from.attr('data-statuCode', statusCode);
			} else {
				if (result.restrictResult && result.restrictResult.status) { //保费超额
					statusCode = result.restrictResult.status;
					var total = result.restrictResult.data.total || 0;
					$from.attr('data-price', total);
					//this.info('保费超额试算失败:' + data.message);
				} else {
					//this.info('试算失败:' + result.noticeMsg);
				}
				$from.attr('data-statuCode', statusCode);
			}
			this.resetTotalPrice();
		},
		totalPrice: 0,
		resetTotalPrice: function() { //计算总价
			var _this = this,
				$priceListNode = _this.el.find('[data-price]:visible'),
				totalPrice = 0,
				totalOriginalPrice = 0,
				showUploadImg = false,
				showHeightError = false;
			$priceListNode.each(function(i) {
				var price = $(this).attr('data-price') || 0,
					originalPrice = $(this).attr('data-originalPrice') || 0,
					statusCode = $(this).attr('data-statuCode') || '';
				totalPrice += parseInt(price, 10);
				totalOriginalPrice += parseInt(originalPrice, 10);
				if (originalPrice / 100 >= _this.HEIGHTPRICE && statusCode !== '36058') { //超过二十万保费，并且等于不能超过二十万 
					showUploadImg = true;
				}
				if (statusCode === '36058') {
					showHeightError = true;
				}
			});

			if (!_this.insurance.restrictRule.trialPrice.insurantPayment) { //是否是多人共享保费 InsurantPayment===true表示非保费共享
				totalPrice = parseInt($priceListNode.eq(0).attr('data-price') || 0);
				totalOriginalPrice = parseInt($priceListNode.eq(0).attr('data-originalPrice') || 0);
			}

			if (showUploadImg) { //高保费
				_this.showUploadImg(true); //显示证件上传 
			} else {
				_this.showUploadImg(false); //隐藏证件上传 
			}

			if (showHeightError) { //显示高保费错误提示
				_this.showHighPremiumOver();
			}

			_this.totalPrice = totalPrice;

			_this.resetRightContent();
		},
		resetRightContent: function() { //重置右侧信息
			var _this = this,
				rightBodyHtml = [],
				rightFootHtml = [],
				totalPrice = 0,
				singlePrice = 0,
				isPriceChange = _this.insurance.vipPrice === _this.totalPrice && _this.insurance.payAmount && _this.insurance.payAmount !== _this.insurance.vipPrice, //是否是改价
				$priceListNode = _this.el.find('[data-price]:visible');
			if (!_this.isMoreInsurant && !_this.isTeamInsurant) { //不是团单，并且不是多人
				var fistpriceNode = $priceListNode[0],
					price = $(fistpriceNode).attr('data-price') || 0,
					buycount = $(fistpriceNode).attr('data-buycount') || 1;
				if (isPriceChange) {
					price = _this.insurance.payAmount;
				}
				singlePrice = (price / buycount);
				singlePrice = (singlePrice / 100).toFixed(2);
				price = (price / 100).toFixed(2);
				rightFootHtml.push('<div class="hz-list lh20">');
				rightFootHtml.push('<div class="hz-list-item">');
				rightFootHtml.push('<span class="hz-list-title">价格</span>');
				rightFootHtml.push('<p class="hz-list-content tar">¥' + singlePrice + '</p>');
				rightFootHtml.push('</div>');
				rightFootHtml.push('<div class="hz-list-item">');
				rightFootHtml.push('<span class="hz-list-title">份数</span>');
				rightFootHtml.push('<p class="hz-list-content tar">' + buycount + ' 份</p>');
				rightFootHtml.push('</div>');
				rightFootHtml.push('</div>');

				rightBodyHtml.push(_this.renderProtectItme());

			} else if (_this.isMoreInsurant) { //多人
				var totalNum = 0;
				rightFootHtml.push('<ul class="hz-list lh20">');
				$priceListNode.each(function(i) {
					var price = $(this).attr('data-price') || 0,
						buycount = $(this).attr('data-buycount') || 1,
						nameInput = $(this).find('[name="cName"]'),
						name = $(nameInput).val();
					price = (price / 100).toFixed(2);
					if (isPriceChange) { //未修改
						price = '-  -';
					} else {
						price = '¥' + price;
					}
					if (!_this.insurance.restrictRule.trialPrice.insurantPayment && totalNum >= 1) { //是否是多人共享保费 InsurantPayment===true表示非保费共享
						price = '¥0.00';
					}
					if (name) {
						var prompthtml = [],
							showStyle = '';
						if (totalNum >= 5) {
							showStyle = 'collapse-item fn-hide'; //超过5个隐藏
						}
						totalNum++;
						prompthtml.push('<h4 class="fc6 f14 fb mb5">投保份数</h4><p class="f12 fc6 mb15">' + buycount + ' 份</p>');
						prompthtml.push(_this.renderProtectItme());
						rightFootHtml.push(' <li class="hz-list-item ' + showStyle + '" rel="prompt" data-prompt-html=\'' + prompthtml.join('') + '\' data-prompt-position="left">');
						rightFootHtml.push(' <div class="hz-list-title"><span class="list-sub-title inline-block ell">' + name + '</span></div>');
						rightFootHtml.push(' <p class="hz-list-content tar">' + price + '</p>');
						rightFootHtml.push('</li>');

					}

				});
				rightFootHtml.push('</ul>');
				if (totalNum > 5) {
					rightFootHtml.push('<p class="tac mt15 f12 fc6 show-more"><a href="javascript:;">显示全部<i class="iconfont">&#xe70b;</i></a></p>');
					rightFootHtml.push('<p class="tac mt15 f12 fc6 collapse-more fn-hide"><a href="javascript:;">收起<i class="iconfont">&#xe708;</i></a></p>');
				}
				rightFootHtml.push('<div class="hz-list lh20">');
				rightFootHtml.push('<div class="hz-list-item">');
				rightFootHtml.push('<div class="hz-list-title">人数</div>');
				rightFootHtml.push('<p class="hz-list-content tar">' + $priceListNode.length + '</p>');
				rightFootHtml.push('</div>');
				rightFootHtml.push('</div>');
			} else if (_this.isTeamInsurant) { //团单
				var teamtotalNum = _this.teamNum,
					singlePrice = _this.trialPrice.singlePrice || 0,
					vipPrice = _this.trialPrice.vipPrice || 0,
					originalPrice = _this.trialPrice.originalPrice || 0,
					buyCount = _this.trialPrice.buyCount || 1,
					teamTotalPrice = vipPrice * teamtotalNum,
					totalOriginalPrice = originalPrice * teamtotalNum;

				singlePrice = (singlePrice / 100).toFixed(2);
				rightFootHtml.push('<div class="hz-list lh20">');
				rightFootHtml.push('<div class="hz-list-item">');
				rightFootHtml.push('<span class="hz-list-title">价格</span>');
				rightFootHtml.push('<p class="hz-list-content tar">¥' + singlePrice + '</p>');
				rightFootHtml.push('</div>');
				rightFootHtml.push('<div class="hz-list-item">');
				rightFootHtml.push('<span class="hz-list-title">人数</span>');
				rightFootHtml.push('<p class="hz-list-content tar">' + teamtotalNum + '</p>');
				rightFootHtml.push('</div>');
				rightFootHtml.push('<div class="hz-list-item">');
				rightFootHtml.push('<span class="hz-list-title">份数</span>');
				rightFootHtml.push('<p class="hz-list-content tar">每人' + buyCount + ' 份</p>');
				rightFootHtml.push('</div>');
				rightFootHtml.push('</div>');

				rightBodyHtml.push(_this.renderProtectItme());
				_this.totalPrice = teamTotalPrice;

				if (_this.trialPrice.originalPrice / 100 >= _this.HEIGHTPRICE) { //高保费
					_this.showUploadImg(true); //显示证件上传 
				} else {
					_this.showUploadImg(false); //隐藏证件上传 
				}

			}

			$('#rightBody').html(rightBodyHtml.join(''));
			$('#rightFoot').html(rightFootHtml.join(''));
			if (isPriceChange) {
				_this.totalPrice = _this.insurance.payAmount;
			}
			totalPrice = (_this.totalPrice / 100).toFixed(2);
			$(".secondary-hot-product .secondary-hot-product-foot .primary-color span").html(totalPrice);

			$('[rel="prompt"]').prompt();

			$('#rightFoot')
				.delegate('.show-more', 'click', function() {
					$(this).prevAll('.hz-list').find('.fn-hide').removeClass('fn-hide');
					$(this).addClass('fn-hide');
					$(this).siblings('.collapse-more').removeClass('fn-hide');
				})

			.delegate('.collapse-more', 'click', function() {
				$(this).prevAll('.hz-list').find('.collapse-item').addClass('fn-hide');
				$(this).addClass('fn-hide');
				$(this).siblings('.show-more').removeClass('fn-hide');
			});
		},
		getLastGenesString: function() {
			return this.lastGenes;
		},
		renderProtectItme: function() { //读取保障项目
			var _this = this,
				result = [],
				protectItmes = helper.utils.marginProtectList(_this.protectItmes);

			result.push('<h4 class="fc6 f14 fb mb5">保障权益</h4>');
			if (protectItmes.length > 6) {
				result.push('<div class="protect-list-box" style="overflow: hidden;overflow-y: auto;height: 166px;"><ul class="hz-list f12 fc6 lh20">');
			} else {
				result.push('<div class="protect-list-box"><ul class="hz-list f12 fc6 lh20">');
			}
			protectItmes.forEach(function(item, i) {
				var protectText = item.fullPremium,
					relateCoverageId = item.relateCoverageId;
				if (!protectText) {
					var genes = _this.insurance.genes;
					genes.forEach(function(gene, j) {
						if (gene.protectItemId && gene.protectItemId === parseInt(relateCoverageId)) {
							protectText = gene.value;
						}
					});
				}
				if (protectText) { //无保额
					if (item.showUnit) {
						protectText = protectText + item.showUnit;
					}
					result.push('<li class="hz-list-item">');
					result.push('<span class="hz-list-title ell">' + item.name + '</span>');
					result.push('<p class="hz-list-content ell"><span class="pl10">' + protectText + '</span></p>');
					result.push('</li>');
				}
			});
			result.push('</ul></div>');
			return result.join('');
		},
		defaultGenesRestrict: [], //试算约束
		getGenesRestrict: function(callback) { // 获取详情页试算的约束
			var _this = this;
			if (_this.defaultGenesRestrict && _this.defaultGenesRestrict.length > 0) {
				callback();
			} else {
				var url = '/api/products/' + _this.ruleParam.productId + '/restrict-rule',
					genesParam = {
						"planId": _this.ruleParam.planId,
						"productId": _this.ruleParam.productId,
						"baseProductId": _this.ruleParam.baseProductId,
						"basePlanId": _this.ruleParam.basePlanId,
						"platform": 1,
						"channel": 1,
						"genes": [],
					},
					genes = [];
				$.each(_this.ruleParam.genes, function(i, item) {
					var gene = {
						protectItemId: item.protectItemId || "",
						key: item.key || "",
						value: item.value
					};
					genes.push(gene);
				});
				genesParam.genes = genes;
				genesParam = JSON.stringify(genesParam);
				$.post(url, {
					data: genesParam
				}, function(data) {
					var restrictGenes = data.result.restrictGenes;
					_this.info('获取详情页试算的约束');
					_this.info(restrictGenes);
					_this.defaultGenesRestrict = restrictGenes;
					callback();
				});
			}
		},
		runGenesRestrict: function(warp) { //执行试算约束
			var _this = this,
				$warp = warp || _this.el;
			if (_this.isTeamInsurant) {
				return;
			}
			_this.getGenesRestrict(function() {
				var genesRestrict = _this.defaultGenesRestrict;
				$.each(genesRestrict, function(i, item) {
					if (item.key && item.key === 'sex') { //性别约束
						var dictionaryList = item.dictionaryList || [],
							sexRadios = $warp.find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_SEX + ']');
						$.each(sexRadios, function() {
							var text = $(this).find('.hz-radio-text').html(),
								exist = false;
							$.each(dictionaryList, function() { //返回的试算约束中是否包含当前的性别
								if (this.value.indexOf(text) > -1) {
									exist = true;
								}
							});
							if (!exist) {
								$(this).remove();
							}
						});
					} else if (item.key && item.key === 'buyCount') { //份数约束
						var dictionaryList = item.dictionaryList || [],
							max = item.dictionaryList[0].max,
							min = item.dictionaryList[0].min;
						$.each(dictionaryList, function() {
							max = this.max > max ? this.max : max;
							min = this.min < min ? this.min : min;
						});
						_this.buyCountRange.max = _this.buyCountRange.max < max ? _this.buyCountRange.max : max;
						_this.buyCountRange.min = _this.buyCountRange.min > min ? _this.buyCountRange.min : min;
					}
				});
			});
		},
	};
	return InsureTrial;
});