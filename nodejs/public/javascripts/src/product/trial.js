define([
	'jquery',
	'base',
	'trial-render',
	'my-calendar',
	'message',
	'layer',
	'jquery-prompt'
], function(
	$, //jQuery
	Base, //基础方法
	RenderTrial, //渲染页面
	MyCalendar, //日期控件
	Message, //提示信息
	layer
) {
	'use strict';

	/**
	 ** @constructor Trial
	 ** @author Kingwell Leng
	 ** @version 0.0.1
	 ** @description 产品详情试算模块
	 **/

	var Trial = function(options) {
		var ops = options || {};
		for (var key in ops) {
			this[key] = ops[key];
		}
		/**
		 ** @description 提示信息 
		 ** message.show('成功','success');
		 ** message.show('失败','error');
		 ** message.show('正在加载...','loading');
		 **/
		this.message = new Message();
		this.init();
	};
	Trial.prototype = {
		ready: function() {},
		change: function() {},

		//渲染HTML
		render: function() {
			var html = '';
			this.genesArea.html(this.renderGenes());
			this.protectArea.html(this.renderProtect());
		},
		init: function() {

			//开发调试用
			if (this.getQueryValue('dev') === 'true') {
				this.info('调试模式开启：前端渲染页面');
				this.setData();
				this.render();
			}

			this.setDefaultValue();
			this.eventInit();
			this.ready();
			this.change();
			this.mergeIdenticalProtectItem();
			//this.setPrice();
		},

		/* 产品基础信息 */
		productId: '', //产品ID
		productPlanId: '', //产品计划ID
		baseProductId: '', //基础ID
		baseProductPlanId: '', //基础计划ID
		platform: 1,
		channel: 1,
		loadProtectDesc: true, //是否需要描述

		messageTimeOut: 2000, //提示信息显示时间

		eventInit: function() {},

		//获取——组装试算因子-试算
		getGenes: function() {
			var _this = this;
			var result = [];
			_this.genesArea.find('.trial-list').each(function(i, list) {

				var $currentListItem = $(this).find('.' + _this.itemStyle),
					$item = $(this).find('.' + _this.activeStyle + ',input.trial-item,.product-amount-input,.hz-dropdown[disabled]'),

					protectItemId = $item.data('protectitemid'),
					key = $item.data('key'),

					value = $item.data('default-value') !== undefined ? $item.data('default-value') : ($item.val() || ''),

					$address = $(list).find('.hz-dropdown[address]'),
					obj;

				//省-市-区，做特殊处理
				if ($address.length) {
					$address.each(function(i, item) {
						obj = {
							protectItemId: '',
							key: $(item).attr('address'),
							value: String($(item).data('default-value'))
						};
						result.push(obj);
					});
				} else {
					if (!(protectItemId || key)) {
						protectItemId = $currentListItem.data('protectitemid');
						key = $currentListItem.data('key');
						if (!(protectItemId || key)) {
							return;
						}
					}
					obj = {
						protectItemId: String(protectItemId),
						key: key,
						value: String(value)
					};
					result.push(obj);
				}
			});
			return result;
		},
		//获取——产品信息
		getProductInfo: function(options) {

			var ops = options || {};
			return this.extend({
				planId: this.productPlanId,
				productId: this.productId,
				baseProductId: this.baseProductId, //todo规范统一
				basePlanId: this.baseProductPlanId,
				platform: this.platform,
				channel: this.channel //loadProtectDesc: this.loadProtectDesc
			}, ops);

		},
		//获取变更数据
		getData: function() {}

	};

	//Event Modules
	var TrialEvent = function() {};
	TrialEvent.prototype = {
		listStyle: 'trial-list',
		itemStyle: 'trial-item',
		activeStyle: 'filter-active-tag',
		eventInit: function() {

			var _this = this;
			_this.eventEnterValue();
			_this.eventSelect();
			_this.eventPlugin();
			_this.eventCalendar();

			//隐藏保障期限错误信息
			$('.insurant-date-limit-select').change(function() {
				$(this)
					.parents('.hz-dropdown-content')
					.find('.error-text')
					.hide()
					.find('span')
					.text('');
			});


		},

		//保存日期控件信息
		calendar: [],

		//保障项日期选择
		insurantDateStart: {
			max: '',
			min: ''
		},

		//保障项日期选择
		insurantDateEnd: {
			max: '',
			min: ''
		},

		//日期选择
		eventCalendar: function() {

			var _this = this;
			_this.genesArea.find('.trial-calendar').each(function(i) {

				var maxDate = $(this).data('maxdate') || '',
					minDate = $(this).data('mindate') || '',
					max = $(this).data('max') || 0,
					min = $(this).data('min') || 0,
					unit = $(this).data('unit') || 0,
					list = $(this).data('list') || '[]',
					maxText = '',
					minText = '';

				//避免多次绑定
				if ($(this).data('lock')) {
					return;
				}
				$(this).data('lock', true);

				var dateNow = new Date(),
					dateMax = new Date(),
					dateMin = new Date(),
					nowYear = dateNow.getFullYear(),
					nowDate = dateNow.getDate(),
					_YEAR = 0,

					_MAX_YEAR = 0,
					_MIN_YEAR = 0,
					_MAX_DATE = 0,
					_MIN_DATE = 0,
					_SUB_MAX_DATE = 0,
					_SUB_MIN_DATE = 0;

				if (_this.getUnit(unit) === '岁' || _this.getUnit(unit) === '周岁') {
					_MAX_YEAR = min;
					_MIN_YEAR = max;
					_YEAR = 1;
				} else if (_this.getUnit(unit) === '天') {
					_MAX_DATE = min;
					_MIN_DATE = max;
				}
				maxText = max + _this.getUnit(unit);
				minText = min + _this.getUnit(unit);

				//子约束条件 _this.info('子约束条件', list.subrestrict);
				if (list.subrestrict && _this.getUnit(list.subrestrict.unit) === '天') {
					var subMax = list.subrestrict.max;
					var subMin = list.subrestrict.min;

					if (subMax) {
						_SUB_MAX_DATE = subMax;
						//maxText = subMax + _this.getUnit(list.subrestrict.unit);
					}
					if (subMin) {
						_SUB_MIN_DATE = subMin;
						//minText = subMin + _this.getUnit(list.subrestrict.unit);
					}
				}
				var _MAX = _this.createDate({
					newDate: _this.getCurrentTime(new Date()),
					year: -_MAX_YEAR,
					date: -_MAX_DATE + _SUB_MAX_DATE
				});
				var _MIN = _this.createDate({
					newDate: _this.getCurrentTime(new Date()),
					year: -_MIN_YEAR - _YEAR,
					date: -_MIN_DATE + _SUB_MIN_DATE
				});

				_this.calendar[i] = new MyCalendar({
					el: this,
					maxDate: _MAX,
					minDate: _MIN,
					callback: function(val, obj) {

						if (obj.type === 'date') {
							_this.postChange();
						}
					}
				});

			});

			//旅行开始，结束时间
			_this.travel = {
				start: {
					max: '',
					min: ''
				},
				end: {
					max: '',
					min: ''
				}
			};

			//保障期限
			_this.genesArea
				.find('.trial-insurant-date-limit')
				.each(function() {
					var max, min;
					if ($(this).data('lock')) {
						return;
					}
					$(this).data('lock', true);

					new MyCalendar({

						//当前元素
						el: this,
						zIndex: 55555,

						//最小日期
						minDate: function() {
							var type = $(this.el).data('type'),
								date = '',
								$start = $('[data-type="start"]'),
								startValue = $start.val(),
								today = _this.createDate({
									date: 1
								});
							if (type === 'start') {
								date = today;
							} else if (type === 'end') {
								if (startValue) {
									date = startValue;
								} else {
									date = today;
								}
							}
							return date;
						},

						//最大日期
						maxDate: function() {
							var type = $(this.el).data('type'),
								date = '',
								$end = $('[data-type="end"]'),
								endValue = $end.val();
							if (type === 'start') {
								if (endValue) {
									date = endValue;
								} else {
									date = '';
								}
							} else if (type === 'end') {

							}
							return date;
						},

						//先后回调
						callback: function(val, obj) {

							var $input = $(this.el),
								$parent = $input.parents('.hz-dropdown-content'),

								startTime = $parent.find('[data-type="start"]').val(), //开始时间
								endTime = $parent.find('[data-type="end"]').val(), //结束时间

								$tips = $parent.find('[data-tips]'), //选择时间提示
								$date = $parent.find('[data-date]'), //显示几天
								$select = $parent.find('select'), //时间天数

								dates = _this.dateDifference(startTime, endTime),

								isYear = false,
								YEAR = 365,
								years = 0;

							if (obj.type === 'date' && startTime && endTime) {

								if (dates >= 0) {

									$tips.hide().find('span').html('');
									if (dates === 0) {
										dates = 1;
									} else {
										dates++;
									}
									isYear = dates % YEAR === 0;
									years = dates / YEAR;
									$date.html('<strong>' + dates + '天</strong>');
									if (_this.__findSelectValue($select, dates + '天')) {
										$select.val(dates + '天');
										_this.__selectTimeStatus = true;
									} else if (_this.__findSelectValue($select, years + '年') && isYear) { //配置有N年的
										$select.val(years + '年');
										_this.__selectTimeStatus = true;
									} else {
										$tips.show().find('span').html(_this.TEXT_DATE_INVALID);
										_this.__selectTimeStatus = false;
									}

								} else {

									//TODO 配置有时间段的
									$date.html('');
									$tips.show().find('span').html(_this.TEXT_DATE_ERROR);
									_this.__selectTimeStatus = false;
								}

							}

						}
					});
				});


			//显示-隐藏 通过出发和结束日期自动计算保障天数
			_this.genesArea
				.find('.hz-check-item')
				.off('click')
				.on('click', function() {
					var $next = $(this).nextAll('.calendar-box-wrap');

					$(this).toggleClass('hz-check-item-checked');

					//关闭所有日期插件
					MyCalendar.closeAll();

					if ($(this).hasClass('hz-check-item-checked')) {
						$next.removeClass('fn-hide');
					} else {
						$next.addClass('fn-hide');
					}
				});

		},

		//下拉-日期
		__selectTimeStatus: false,

		//查看是否有默认值
		__findSelectValue: function($select, val) {
			var status = false;
			$select.find('option').each(function() {
				var _val = $(this).attr('value');
				if (_val === val) {
					status = true;
				}
			});
			return status;
		},

		//验证表单合法性
		eventEnterValue: function() {
			var _this = this;
			//只能输入合法值，否则清空
			_this.el
				.find('.only-number')
				.blur(function() {
					if (!_this.validateInput(this)) {
						$(this).val('');
					}
				});

			//只能输入数字
			_this.el
				.find('.only-number')
				.enterOnlyNumber();

			//份数
			_this.el
				.find('.product-amount-wrap')
				.eidtNumber({
					//callback: function(oldValue, newValue, $num) {}
				});
		},

		//设置旧值
		setOldValue: function($item, value) {

			var _this = this,
				protectItemId = $item.data('protectitemid'),
				key = $item.data('key'),
				val = value || $item.data('default-value');

			//重置旧值
			_this.optGeneOldValue = {};

			if (protectItemId) {
				_this.optGeneOldValue.protectItemId = protectItemId;
			}
			if (key) {
				_this.optGeneOldValue.key = key;
			}
			_this.optGeneOldValue.value = _this.replaceNull(val);

		},

		//验证表单合法性
		validateInput: function(input) {

			var _this = this,
				$input = $(input),
				val = $input.val(),

				max = $input.data('max'), //最大值
				min = $input.data('min'), //最小值
				step = $input.data('step'), //步长

				status = false;

			if ($.isNumeric(val)) {
				if (max) {
					if (val > max) {
						$input.val('');
						status = false;
					} else {
						status = true;
					}
				}
				if (min) {
					if (val < min) {
						$input.val('');
						status = false;
					} else {
						status = true;
					}
				}
				if ((val - min) % step === 0) {
					status = true;
				} else {
					status = false;
				}
			} else {
				$input.val('');
			}
			return status;
		},

		//表单工获取旧值
		getOldValue: function(input) {
			var _this = this,
				$input = $(input),
				$parent = $(input).parents('.trial-list'),

				$current = $parent.find('.' + _this.activeStyle).length ? $parent.find('.' + _this.activeStyle) : $parent.find('span.' + _this.itemStyle),
				protectItemId = $current.data('protectitemid'),
				key = $current.data('key');

			_this.optGeneOldValue = {};

			if (!protectItemId && !key) {
				protectItemId = $input.data('protectItemid') || '';
				key = $input.data('key') || '';
			}

			if (protectItemId) {
				_this.optGeneOldValue.protectItemId = protectItemId;
			}

			if (key) {
				_this.optGeneOldValue.key = key;
			}

			_this.optGeneOldValue.value = $current.data('default-value') || $current.text() || $input.val();
			_this.info(_this.optGeneOldValue);
		},

		//设置下拉框的值
		setSelectValue: function($select, val) {
			var _this = this,
				status = false;
			if (!val) {
				return;
			}
			$select.find('.hz-dropdown-menu >li').each(function() {

				var defaultValue = $(this).data('default-value'),
					$input = $select.find('input');
				if (val === defaultValue) {
					$select.find('li').removeClass('hz-select-option-selected');
					$input.val(val);
					$(this).addClass('hz-select-option-selected');
					status = true;
				}
			});
			if (status) {
				$select.parent().find('.' + _this.itemStyle).removeClass(_this.activeStyle);
				$select.data('default-value', val).addClass(_this.activeStyle);
			}
			return status;
		},

		//设置默认值-下拉框
		setDefaultValue: function() {
			//return;
			// var _this = this;
			// //信息因子
			// _this.genesArea.find('.' + _this.listStyle).each(function() {
			// 	var defaultValue = $(this).data('default-value'),
			// 		$hzDropdown = $(this).find('.hz-dropdown'),
			// 		$filterTag = $(this).find('.filter-tag');
			// 	if (!$(this).find('.' + _this.activeStyle).length && defaultValue && $hzDropdown.length) {
			// 		_this.setSelectValue($hzDropdown, defaultValue);
			// 	}
			// });
			// //保障项
			// _this.protectArea.find('.hz-dropdown').each(function() {
			// 	var $li = $(this).find('.hz-select-option');
			// 	var text = $li.text();
			// 	if ($li.hasClass('hz-select-option-selected')) {
			// 		$(this).data('defaultvalue', text);
			// 		$(this).addClass(_this.activeStyle);
			// 		$(this).find('.input-select>.input-select-text').text(text);
			// 	}
			// });
		},

		//操作事件
		eventSelect: function() {
			var _this = this;

			_this.genesArea
				.on('click', '[address]', function(ev) { //获取地区旧值
					if ($(ev.target).hasClass('input-select-text') || $(ev.target).hasClass('iconfont')) {
						_this.optGeneOldValue = {};
						_this.optGeneOldValue.protectItemId = '';
						_this.optGeneOldValue.key = String($(this).attr('address'));
						_this.optGeneOldValue.value = String($(this).data('default-value'));
					}
				})
				.on('change', '.' + _this.itemStyle, function() {
					var val = $(this).val();
					$(this).parent().find('.' + _this.activeStyle).removeClass(_this.activeStyle);
					$(this).parent().find('[data-default-value="' + val + '"]').addClass(_this.activeStyle);
					if (!$(this).hasClass('trial-calendar')) { //非日历控件
						_this.postChange();
					}
				})
				.on('focus', '.' + _this.itemStyle, function(ev) {
					if ($(this).is('input')) {
						_this.getOldValue(ev.target);
					}
				})
				.on('click', '.' + _this.itemStyle, function(ev) {
					var $parent = $(this).parents('.' + _this.listStyle),
						$current = $parent.find('.' + _this.activeStyle),
						protectItemId = $current.data('protectitemid') || '',
						key = $current.data('key') || '',
						value = $current.data('default-value') || '',
						unit = $(this).data('unit') || '',
						_unit = '',

						controltype = $(this).attr('controltype'),

						$protect,
						currentValue;

					//如果禁用
					if ($(this).hasClass('disabled')) {
						return;
					}


					//如果是下拉
					if ($(this).is('li')) {
						return;
					}

					//文本类型
					if ($(this).hasClass('filter-tag-text')) {
						return;
					}

					//文本框类型
					if ($(this).is('input')) {
						if (ev.type === 'click') {
							_this.getOldValue(ev.target);
						}
						return;
					}

					//重置旧值
					_this.optGeneOldValue = {};

					if (protectItemId) {
						_this.optGeneOldValue.protectItemId = protectItemId;
					}

					if (key) {
						_this.optGeneOldValue.key = key;
					}

					if (!protectItemId && !key) {

						protectItemId = $(this).data('protectitemid');
						key = $(this).data('key');
						if (protectItemId) {
							_this.optGeneOldValue.protectItemId = protectItemId;
						}
						if (key) {
							_this.optGeneOldValue.key = key;
						}

					}

					_this.optGeneOldValue.value = value;

					$parent.find('.' + _this.itemStyle + ',.hz-dropdown').removeClass(_this.activeStyle);


					//恢复显示“更多选择”
					$parent.find('.hz-dropdown .input-select-text').text(_this.TEXT_SELECT_MORE);
					$parent.find('.hz-dropdown').find('li.hz-select-option').removeClass('hz-select-option-selected');
					$parent.find('.hz-dropdown').data('default-value');

					if ($(this).hasClass('filter-tag')) {
						$(this).addClass(_this.activeStyle);
						$parent.find('.input-select>.trial-item,input.product-amount-input').val($parent.find('.' + _this.activeStyle).data('default-value'));
						$parent.find('input.product-amount-input').trigger('reset'); //重置状态
						_this.postChange();
					}

					//同步保障项				
					$protect = _this.protectArea.find('.hz-dropdown[data-protectitemid="' + (protectItemId || 'test') + '"],.hz-dropdown[data-key="' + (key || 'test') + '"]');


					currentValue = $(this).data('default-value');
					if (3 === _this.toInt(controltype)) {
						_unit = unit;
					}
					if (protectItemId || key) {
						$protect
							.data('default-value', currentValue)
							.addClass(_this.activeStyle)
							.find('.input-select-text').text(currentValue + _unit);
						$protect.find('li').removeClass('hz-select-option-selected');
						$protect.find('li[data-value="' + currentValue + '"],li[data-default-value="' + currentValue + '"]').addClass('hz-select-option-selected');
					}

				});
		},

		//绑定插件事件
		eventPlugin: function() {
			var _this = this;
			_this.el.find('.trial-calendar').click(function() {

				var key = $(this).data('key'),
					protectItemId = $(this).data('protectitemid');

				//重置旧值
				_this.optGeneOldValue = {};
				if (key) {
					_this.optGeneOldValue.key = key;
				}
				if (protectItemId) {
					_this.optGeneOldValue.protectItemId = protectItemId;
				}
				_this.optGeneOldValue.value = $(this).val();
			});

			//下拉框
			_this.el
				.find('.hz-dropdown')
				.dropDown({
					type: 1,
					//width: 265, 
					//height: 300,
					event: function(ev) {
						if ($(ev.target).hasClass('iconfont') || $(ev.target).hasClass('more-tag')) {
							return false;
						} else {
							return true;
						}
					},
					select: function(ev) {
						return _this.dropDownCallback1(this, ev);
					}
				});

			_this.bindPrompt();
		},

		//获取旧值
		__getItemOldValue: function(wrap) {

			var _this = this,
				$wrap = $(wrap),
				$current = $wrap.find('.' + _this.activeStyle).eq(0),

				//key = $wrap.data('key'),
				key = $wrap.find('.' + _this.itemStyle + ',.hz-dropdown').data('key'),
				protectItemId = $wrap.data('protectitemid'),

				value = $current.data('default-value') || '';

			_this.optGeneOldValue = {};

			if (key) {
				_this.optGeneOldValue.key = key;
			}
			if (protectItemId) {
				_this.optGeneOldValue.protectItemId = protectItemId;
			}
			_this.optGeneOldValue.value = value;
			_this.info(_this.optGeneOldValue);
		},

		//下拉回调
		dropDownCallback1: function(dropDown, ev) {
			var _this = this,
				closeStatus = false, //关闭状态

				$target = $(ev.target),
				$dropDown = $(dropDown), //$target.parents('.hz-dropdown'), //,
				$select = $dropDown.find('.input-select-text'),
				$options = $dropDown.find('.hz-select-option'),
				$listParent = $dropDown.parents('.' + _this.listStyle),
				$inputEnter = $dropDown.find('.input-enter'), //输出框
				$errorText = $dropDown.find('.error-text'),
				$startDate = $dropDown.find('[data-type="start"]'),
				$endDate = $dropDown.find('[data-type="end"]'),
				$hzCheckItem = $dropDown.find('.hz-check-item'),

				protectItemId = $dropDown.data('protectitemid'),
				key = $dropDown.data('key'),
				id = protectItemId || key,

				otherAreaKey,
				otherProtectItemId,
				otherOldValue,

				controltype = _this.toInt($target.attr('controltype')),

				isArea = $dropDown.attr('address') ? true : false, //地区
				isProtect = $dropDown.attr('protect') === 'true' ? true : false, //保障项
				isSelect = $target.hasClass(_this.itemStyle),
				selectValue = $target.data('value') || $target.data('default-value'), //下拉

				isTime = $target.attr('edit') === 'time',
				isOk = $target.attr('edit') === 'ok',
				isCancel = $target.attr('edit') === 'cancel',

				//设置下拉样式，赋值
				setDropDownStyle = function(val) {
					var value = val || '';
					$dropDown.data('default-value', value);
					$dropDown.find('li').removeClass('hz-select-option-selected');
					$target.addClass('hz-select-option-selected');
				},

				//设置样式
				setStyle = function() {
					$listParent.find('.' + _this.itemStyle + ',.hz-dropdown').removeClass(_this.activeStyle);
					$dropDown.addClass(_this.activeStyle);
				},

				//出错提示
				error = function(val, text) {
					var _val = val || '';
					var _text = text || '请输入合法内容';
					if (!_val) {
						$errorText.show().find('span').text(_text); //.delay(1000).end().hide();
					} else {
						$errorText.hide().find('span').text('');
					}
				};

			if (isSelect) { //

				$select.text($target.text());

				//如果是地区
				if (isArea) {

					var areaKey = $dropDown.data('key'),
						areaProtectItemId = $dropDown.data('protectitemid'),
						areaOldValue = $dropDown.data('default-value');

					_this.optGeneOldValue = {};
					if (areaKey) {
						_this.optGeneOldValue.key = areaKey;
					}
					if (areaProtectItemId) {
						_this.optGeneOldValue.protectItemId = areaProtectItemId;
					}
					_this.optGeneOldValue.value = areaOldValue;
					_this.info(_this.optGeneOldValue);
					_this.postChange();

				} else {
					var $protectItem = _this.protectArea.find('.hz-dropdown[data-protectitemid="' + id + '"],.hz-dropdown[data-key="' + id + '"]'),
						$protectItemOption = $protectItem.find('.hz-select-option[data-protectitemid="' + id + '"][data-value="' + selectValue + '"],.hz-select-option[data-key="' + id + '"][data-value="' + selectValue + '"]');

					//保障项
					if (isProtect) {
						//alert(id);
						var $keyWrap = _this.genesArea.find('[data-protectitemid="' + (id || 'test') + '"],[data-key="' + (id || 'test') + '"]');
						var $keyDropDown = $keyWrap.find('.hz-dropdown');
						//alert(id + '\n' + selectValue + '\n' + controltype);
						if (3 === controltype) {
							selectValue = parseInt(selectValue, 10);
						}
						$keyWrap.find('.trial-item,.hz-dropdown').removeClass(_this.activeStyle);
						$keyWrap.find('.hz-dropdown')
							.attr('data-default-value', '')
							.data('default-value', '');
						var $keyItem = $keyWrap.find('[data-default-value="' + selectValue + '"]');
						$keyItem.addClass(_this.activeStyle);

						//如果没有默认选择，摸查下拉内容
						if (!$keyItem.length) {
							$keyDropDown.addClass(_this.activeStyle).find('.input-select-text').text(selectValue);
							$keyDropDown.data('default-value', selectValue);
							$keyDropDown.find('.hz-select-option').removeClass('hz-select-option-selected');
							$keyDropDown.find('.hz-select-option[data-value="' + selectValue + '"]').addClass('hz-select-option-selected');
						}

						otherAreaKey = $dropDown.data('key');
						otherProtectItemId = $dropDown.data('protectitemid');
						otherOldValue = $dropDown.data('default-value');

						_this.optGeneOldValue = {};
						if (otherAreaKey) {
							_this.optGeneOldValue.key = otherAreaKey;
						}
						if (otherProtectItemId) {
							_this.optGeneOldValue.protectItemId = otherProtectItemId;
						}
						_this.optGeneOldValue.value = otherOldValue;
						_this.info(_this.optGeneOldValue);

						//如果为下拉类型，保障项有相同的ID项，同步
						if (0 === controltype) {
							$protectItem.addClass(_this.activeStyle);
							$protectItem.find('li').removeClass('hz-select-option-selected');
							$protectItemOption.addClass('hz-select-option-selected');
							$protectItem.find('.input-select-text').text($protectItemOption.eq(0).text());
							$protectItem.data('default-value', $protectItemOption.data('value'));
						}

						_this.logRed('保障项下拉');

					} else {

						//同步保障项

						$protectItem.addClass(_this.activeStyle);
						$protectItem.find('li').removeClass('hz-select-option-selected');
						$protectItemOption.addClass('hz-select-option-selected');
						$protectItem.find('.input-select-text').text($protectItemOption.eq(0).text());
						$protectItem.data('default-value', $protectItemOption.data('value'));

						_this.__getItemOldValue($listParent);

						if (3 === controltype) {
							selectValue = parseInt(selectValue, 10);
						}
						$target.parents('.hz-dropdown').attr('data-default-value', selectValue);
						//$dropDown.data('default-value', selectValue);

						_this.logGreen('试算因子下拉');
					}
					_this.postChange();
					setStyle();
				}
				closeStatus = true;
				setDropDownStyle(selectValue);


			}

			//保障时间
			else if (isTime) {

				var val = $dropDown.find('select').val();
				closeStatus = false;
				error(val);
				if ($hzCheckItem.hasClass('hz-check-item-checked')) {
					if (!$startDate.val() || !$endDate.val()) {
						error('', _this.TEXT_DATE_INVALID);
						return;
					}
				}
				//没有选择
				if (val === _this.TEXT_SELECT_MORE) {
					closeStatus = false;
					error();
					return;
				}

				//获取旧值
				_this.__getItemOldValue($listParent);
				setStyle();
				$select.text(val);
				$dropDown.data('default-value', val);
				closeStatus = true;
				_this.postChange();

			}

			//如果是确定
			else if (isOk) {

				var val = $inputEnter.val(),
					resultVal = '',
					$option = $dropDown.find('.hz-select-option[data-value="' + val + '"]'),
					unit = $target.data('unit');

				closeStatus = false;

				//获取旧值
				_this.__getItemOldValue($listParent);

				error(val);

				//如果值为空
				if (!val) {
					closeStatus = false;
					return false;
				}

				//如果有下拉
				if ($option.length) {
					$option.click();
				} else {

					//获取旧值
					//_this.__getItemOldValue($listParent);

					//不为输入框类型
					if (3 !== controltype) {
						resultVal = val; // + $dropDown.find('.hz-select-option').data('unit');
					}

					setStyle();
					$select.text(val + ($dropDown.data('unit') || _this.getUnit($inputEnter.data('unit')) || ''));
					$dropDown.data('default-value', val);


					if (isProtect) {

						otherAreaKey = $dropDown.data('key');
						otherProtectItemId = $dropDown.data('protectitemid');
						otherOldValue = $dropDown.data('default-value');
						if (otherAreaKey) {
							_this.optGeneOldValue.key = otherAreaKey;
						}
						if (otherProtectItemId) {
							_this.optGeneOldValue.protectItemId = otherProtectItemId;
						}
						_this.optGeneOldValue.value = otherOldValue;
						_this.info(_this.optGeneOldValue);

						var $keyWrap = $('dd[data-protectitemid="' + id + '"]'),
							$item = $keyWrap.find('[data-protectitemid="' + id + '"][data-default-value="' + val + '"]');

						//清除当前样式
						$keyWrap
							.find('.' + _this.itemStyle + ',.hz-dropdown')
							.removeClass(_this.activeStyle);

						if ($item.length) { //如果有就直接选中
							$item.addClass(_this.activeStyle);
						} else { //如果没有就赋值给下拉
							$keyWrap.find('.hz-dropdown')
								.data('defaultValue', val)
								.addClass(_this.activeStyle)
								.find('.input-select-text').text(val);
						}

						$dropDown.find('.hz-select-option').removeClass('hz-select-option-selected');
						$dropDown.find('.hz-select-option[data-default-value="' + resultVal + '"]').addClass('hz-select-option-selected');
						$select.text(resultVal + _this.getUnit($inputEnter.data('unit')));


					} else {

						var $protectDropDown = _this.protectArea.find('.hz-dropdown[protect="true"][data-protectitemid="' + id + '"]');

						$protectDropDown.data('default-value', val);
						$protectDropDown
							.find('.input-select-text')
							.text(val);
						$protectDropDown.addClass(_this.activeStyle);
						$protectDropDown.find('.hz-select-option').removeClass('hz-select-option-selected');
						$protectDropDown
							.find('.hz-select-option[data-default-value="' + resultVal + '"],.hz-select-option[data-default-value="' + resultVal + unit + '"]')
							.addClass('hz-select-option-selected');

					}
					_this.postChange();
					closeStatus = true;
				}

				//清空值
				//$inputEnter.val('');
			}

			//取消按钮
			if (isCancel) {
				closeStatus = true;
			}
			return closeStatus;
		},

		//试算-更换之前的值
		optGeneOldValue: {
			key: '',
			protectItemId: '',
			value: ''
		},

		//延迟POST
		postDelayTime: 300,
		__postTimer: null,

		//发送变更请求
		postChange: function() {
			var _this = this;
			if (_this.postDelayTime) {
				clearTimeout(_this.__postTimer);
				_this.__postTimer = setTimeout(function() {
					_this.postChangeData();
				}, _this.postDelayTime);
			} else {
				_this.postChangeData();
			}
		},

		//绑定提示信息
		bindPrompt: function() {

			$('.trial-prompt').prompt({
				position: 'top'
			});

		},

		//获取试算因子
		getGenesString: function() {

			var _this = this,
				data = _this.getProductInfo({
					genes: _this.getGenes() || [],
					optGeneOldValue: _this.optGeneOldValue
				});
			if (window.JSON2) {
				data = JSON2.stringify(data);
			}else{
				data = JSON.stringify(data);
			}
			
			_this.info(data);
			_this.trialString = data;
			return data;

		},
		trialString: '',

		//Post 变更数据
		postChangeData: function() {

			var _this = this;
			_this.logRed((_this.optGeneOldValue.key || _this.optGeneOldValue.protectItemId) + ' 的旧值：' + _this.optGeneOldValue.value);

			_this.message.show(_this.TEXT_UPDATING, 'loading');

			$.post("/api/products/" + _this.productId + '/restrict-rule', {
				data: _this.getGenesString(),
				time: _this.getTime()
			}, function(data) {

				_this.message.hide();
				_this.updateRender(data.result);
				if (data && data.result && data.result) {

					//如果有notice，清空默认值，再重新请求结果
					if (data.result.notice) {

						var $item = $('[data-protectitemid="' + data.result.notice + '"],[data-key="' + data.result.notice + '"]'),
							$activeStyle = $item.find('.' + _this.activeStyle),
							defaultValue = $activeStyle.data('default-value');

						//$item.find('.' + _this.itemStyle + ',.hz-dropdown').removeClass(_this.activeStyle);
						$activeStyle.removeClass(_this.activeStyle);

						if (defaultValue) {
							_this.optGeneOldValue = {};
							if (typeof defaultValue === 'string') {
								_this.optGeneOldValue.key = data.result.notice;
							} else {
								_this.optGeneOldValue.protectItemId = data.result.notice;
							}
							_this.optGeneOldValue.value = defaultValue;
						}
						//_this.optGeneOldValue = {};

						setTimeout(function() {
							_this.postChangeData();
						}, _this.messageTimeOut);

					}

					//如果有提示信息
					if (data.result.noticeMsg) {
						if (data.result.restrictResult && data.result.restrictResult.status && data.result.restrictResult.status === '36058') { //高保费特殊处理
							layer.msg('保监会规定单笔保费不能超过20万哦~您可以降低保额或者分几单提交投保！');
						} else { //
							layer.msg(data.result.noticeMsg);
						}
					}
					return;
				}

				//其它情况，只要不为“00000” 就提示出错原因
				if (data.status !== '00000') {
					_this.message.show(data.message, 'warning', _this.messageTimeOut);
				}

			});
		},
		updateProtect: function(data) {

			var _this = this,
				_data = data || {},
				protectTrialItemList = _data.protectTrialItemList || [],
				restrictGenes = _data.restrictGenes || [];

			protectTrialItemList.forEach(function(item, i) {

				var description = item.description || '',
					$item = $('[id="protect-' + item.protectItemId + '-' + item.trialItemId + '"]'),
					myItem = '',
					result = [];

				restrictGenes.forEach(function(_item) {
					if (
						_this.toInt(item.relateCoverageId) === _this.toInt(_item.protectItemId) ||
						_this.toInt(item.relateCoverageId) === _this.toInt(_item.key)
					) {
						myItem = _item;
					}
				});

				result.push('<li class="ensure-protect-item ' + _this.listStyle + '" id="protect-' + item.protectItemId + '-' + item.trialItemId + '" protectname="' + item.name + '" trialItemId="' + item.trialItemId + '">');
				result.push('<div class="row01"><div class="protect-item-icon">' + (item.icon ? '<img src="' + item.icon + '" width="24" height="24" alt="图标" title="' + item.name + '"/>' : '<i class="iconfont icon-item f24">&#xe702;</i>') + '</div></div>');
				result.push('<div class="row02"><div class="protect-item-name">' + item.name + '</div></div>');
				result.push('<div class="row03">');

				//关联试算因子ID
				if (item.relateCoverageId) {
					//为输入框类型，且不投保，清空试算因子的值
					if (3 === myItem.controlType && !myItem.dictionaryList) {
						_this.genesArea.find('[data-protectitemid="' + myItem.protectItemId + '"]').removeClass('filter-active-tag');
					}
					result.push(_this.renderForm({
						item: item,
						formObject: myItem,
						isProtect: true
					}));
					//$('.hidden').show();
					//console.log('myItem', myItem);
				} else {
					result.push((item.fullPremium ? item.fullPremium : item.premium) || '');
				}

				//显示保障项单位
				result.push(item.showUnit);
				result.push('</div>');

				//描述
				result.push('<div class="row04"><div class="protect-item-des f12 fc6">' + description + '</div></div>');
				result.push('</li>');

				//如果有关联，操作状态，不清除
				// if (item.relateCoverageId && myItem.controlType === 3) {
				// 	if (!myItem.enabled) {
				// 		$item.find('.hz-dropdown').addClass('disabled');
				// 	} else {
				// 		$item.find('.hz-dropdown').removeClass('disabled');
				// 	}
				// } else {

				// }
				$item.after(result.join(''));
				$item.remove();

			});

		},
		//updateAfter: function(updateData) {}, //变更后执行

		//变化之后重新渲染
		updateRender: function(data) {

			var _this = this,
				restrictGenes = data.restrictGenes || [];

			//_this.updateAfter.call(_this, data);
			_this.preminum = data.preminum || _this.notInsureText;

			_this.trialPrice = data.trialPrice || {};
			_this.change();
			_this.setPrice();
			_this.info(data);
			_this.updateProtect(data);

			//变换金豆
			$('.golden-span').text(_this.trialPrice.goldenBean);

			restrictGenes.forEach(function(item) {
				var id = item.protectItemId || item.key,
					$id,
					//hiddenStyle = '',
					hiddenStyle = item.display === false ? 'hidden' : '', //是否隐藏
					formHtml = _this.renderForm({
						formObject: item,
						disabled: item.disabled
					}),
					html = _this.renderGenesRow({
						boxClass: hiddenStyle,
						name: item.name,
						item: item,
						id: item.protectItemId || item.key,
						content: formHtml
					});
				$id = $('#list-item-' + _this.productPlanId + '-' + id);

				//_this.info('变更项', $id);				
				if (item.enabled === false && item.key === 'area') {

					$id.find('.trial-item,.hz-dropdown').addClass('disabled'); //.removeClass(_this.activeStyle);

				} else {

					$id.after(html);
					$id.remove();

				}

				_this.setDefaultValue();
				_this.eventEnterValue();
				_this.eventPlugin();
				_this.eventCalendar();
				_this.mergeIdenticalProtectItem();
			});
		},

		//合并保障项相同项
		mergeIdenticalProtectItem: function() {
			var _this = this;
			_this.protectArea
				.find('[protectname]')
				.each(function() {
					var protectname = $(this).attr('protectname');
					_this.protectArea
						.find('[protectname="' + protectname + '"]')
						.each(function(index) {
							var style = '';
							if (index) {
								style = 'hidden';
							} else {
								style = '';
							}
							$(this).find('.row01,.row02').css({
								visibility: style
							});
						});
				});
		}
	};

	//文本类
	var TrialText = function() {};
	TrialText.prototype = {
		TEXT_DATE_INVALID: '您选择的日期无效，请重新选择！',
		TEXT_DATE_ERROR: '出发日期不能晚于结束日期',
		TEXT_UPDATING: '正在更新...'
	};

	//继承类
	Base.extend(Trial.prototype, new Base());
	Base.extend(Trial.prototype, new RenderTrial());
	Base.extend(Trial.prototype, new TrialEvent());
	Base.extend(Trial.prototype, new TrialText());

	return Trial;
});