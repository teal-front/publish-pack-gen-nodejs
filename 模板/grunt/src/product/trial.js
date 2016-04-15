define(['jquery', 'base', 'trial-render', 'my-calendar'], function($, Base, RenderTrial, MyCalendar) {
	var TrialText = function() {

	};
	TrialText.prototype = {
		TEXT_DATE_INVALID: '您选择的日期无效，请重新选择！',
		TEXT_DATE_ERROR: '出发日期不能晚于结束日期'
	};
	/*
	 * @constructor Trial
	 * @description Trial类
	 * @author Kingwell Leng
	 * @version 0.0.1
	 */
	var Trial = function(options) {
		var ops = options || {};
		for (var key in ops) {
			this[key] = ops[key];
		}
		this.init();
	};
	Trial.prototype = {
		ready: function() {},
		change: function() {},
		render: function() {
			var html = '';
			this.genesArea.html(this.renderGenes());
			this.protectArea.html(this.renderProtect());
		},
		init: function() {
			//this.setData();
			this.render();
			this.setDefaultValue();
			this.eventInit();
			this.ready();
			this.change();
			this.setPrice();
		},
		productId: '', //产品ID
		productPlanId: '', //产品计划ID
		baseProductId: '', //基础ID
		baseProductPlanId: '', //基础计划ID
		platform: 1,
		channel: 1,
		loadProtectDesc: true, //是否需要描述
		eventInit: function() {},
		getGenes: function() { //获取——组装试算因子-试算
			var _this = this;
			var result = [];
			_this.genesArea.find('.trial-list').each(function(i, list) {
				var $item = $(this).find('.' + _this.activeStyle + ',input.trial-item,.product-amount-input'),
					protectItemId = $item.data('protectitemid'),
					key = $item.data('key'),
					value = $item.data('default-value') || $item.val() || '',
					$address = $(list).find('[address]'),
					obj;

				if ($address.length) { //省-市-区
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
						return;
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
		getData: function() { //获取变更数据

		}

	};
	//Event Modules
	var TrialEvent = function() {

	};
	TrialEvent.prototype = {
		listStyle: 'trial-list',
		itemStyle: 'trial-item',
		activeStyle: 'filter-active-tag',
		eventInit: function() {
			var _this = this;
			$(document).on('click', '.' + _this.itemStyle, function() {});
			_this.eventEnterValue();
			_this.eventSelect();
			_this.eventCalendar();
		},
		calendar: [],
		insurantDateStart: { //保障项日期选择
			max: '',
			min: ''
		},
		insurantDateEnd: { //保障项日期选择
			max: '',
			min: ''
		},
		eventCalendar: function() { //日期选择
			var _this = this;
			_this.genesArea.find('.trial-calendar').each(function(i) {
				var maxDate = $(this).data('maxdate') || '',
					minDate = $(this).data('mindate') || '',
					max = $(this).data('max') || 0,
					min = $(this).data('min') || 0,
					unit = $(this).data('unit') || 0,
					list = $(this).data('list') || '[]';

				var dateNow = new Date(),
					dateMax = new Date(),
					dateMin = new Date(),
					nowYear = dateNow.getFullYear(),
					nowDate = dateNow.getDate(),

					_MAX_YEAR = 0,
					_MIN_YEAR = 0,
					_MAX_DATE = 0,
					_MIN_DATE = 0;

				if (_this.getUnit(unit) === '岁') {
					_MAX_YEAR = min;
					_MIN_YEAR = max;
				}

				//子约束条件 _this.info('子约束条件', list.subrestrict);
				if (list.subrestrict && _this.getUnit(list.subrestrict.unit) === '天') {
					var subMax = list.subrestrict.max;
					var subMin = list.subrestrict.min;

					if (subMax) {
						_MAX_DATE = subMax;
					}
					if (subMin) {
						_MIN_DATE = subMin;
					}
				}

				var _MAX = _this.createDate({
					newDate: _this.getCurrentTime(new Date()),
					year: -_MAX_YEAR,
					date: _MAX_DATE
				});
				var _MIN = _this.createDate({
					newDate: _this.getCurrentTime(new Date()),
					year: -_MIN_YEAR - 1,
					date: _MIN_DATE
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
			_this.genesArea.find('.trial-insurant-date-limit').each(function() { //保障期限
				var max, min;
				new MyCalendar({
					el: this,
					zIndex: 55555,
					minDate: function() {
						return _this.insurantDateStart.min || _this.getCurrentTime();
					},
					maxDate: function() {
						return _this.insurantDateStart.max || '';
					},
					callback: function(val, obj) {
						var $input = $(this.el),
							$parent = $input.parents('.hz-dropdown-content'),
							startTime = $parent.find('[data-type="start"]').val(), //开始时间
							endTime = $parent.find('[data-type="end"]').val(), //结束时间
							$tips = $parent.find('[data-tips]'), //选择时间提示
							$date = $parent.find('[data-date]'), //显示几天
							$select = $parent.find('select'), //时间天数
							dates = _this.dateDifference(startTime, endTime);

						if (obj.type === 'date' && startTime && endTime) {
							if (dates >= 0) {
								$tips.hide().find('span').html('');
								if (dates === 0) {
									//dates = 1;
								}
								$date.html('<strong>' + dates + '天</strong>');
								if (_this.__findSelectValue($select, dates + '天')) {
									$select.val(dates + '天');
									_this.__selectTimeStatus = true;
								} else {
									$tips.show().find('span').html(_this.TEXT_DATE_INVALID);
									_this.__selectTimeStatus = false;
								}
							} else {
								$date.html('');
								$tips.show().find('span').html(_this.TEXT_DATE_ERROR);
								_this.__selectTimeStatus = false;
							}
							//return true;
						}

					}
				});
			});

			_this.genesArea.find('.hz-check-item').on('click', function() { //显示-隐藏 通过出发和结束日期自动计算保障天数
				var $next = $(this).nextAll('.calendar-box-wrap');
				$(this).toggleClass('hz-check-item-checked');
				MyCalendar.closeAll();
				if ($(this).hasClass('hz-check-item-checked')) {
					$next.removeClass('fn-hide');
				} else {
					$next.addClass('fn-hide');
				}
			});
		},
		__selectTimeStatus: false, //下拉-日期
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
		eventEnterValue: function() { //验证表单合法性
			var _this = this;
			//只能输入合法值，否则清空
			_this.el.find('.only-number').blur(function() {
				if (!_this.validateInput(this)) {
					$(this).val('');
				}
			});
			//只能输入数字
			_this.el.find('.only-number').enterOnlyNumber();
			//份数
			_this.el.find('.product-amount-wrap').eidtNumber({
				callback: function(oldValue, newValue, $num) {
					var $parent = $(this).parent();
					$parent.find('.' + _this.itemStyle).removeClass(_this.activeStyle);
					$parent.find('[data-default-value="' + newValue + '"]').addClass(_this.activeStyle);
					_this.setOldValue($parent.find('.product-amount-input'), oldValue);
					//$(this).addClass(_this.activeStyle);
					_this.postChange();
				}
			});
		},
		setOldValue: function($item, value) { //设置旧值
			var _this = this,
				protectItemId = $item.data('protectitemid'),
				key = $item.data('key'),
				val = value || $item.data('default-value');
			_this.optGeneOldValue = {};
			if (protectItemId) {
				_this.optGeneOldValue.protectItemId = protectItemId;
			}
			if (key) {
				_this.optGeneOldValue.key = key;
			}
			_this.optGeneOldValue.value = _this.replaceNull(val);
		},
		validateInput: function(input) { //验证表单合法性
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
						//$input.val('');
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
				if (!((val - min) % step === 0)) {
					status = false;
				} else {
					status = true;
				}
			} else {
				//$input.val('');
			}
			return status;
		},
		getOldValue: function(input) { //表单工获取旧值
			var _this = this;
			var $input = $(input);
			var $parent = $(input).parents('.trial-list');

			var $current = $parent.find('.' + _this.activeStyle).length ? $parent.find('.' + _this.activeStyle) : $parent.find('input.' + _this.itemStyle);
			var protectItemId = $current.data('protectitemid');
			var key = $current.data('key');
			_this.optGeneOldValue = {};
			if (protectItemId) {
				_this.optGeneOldValue.protectItemId = protectItemId;
			}
			if (key) {
				_this.optGeneOldValue.key = key;
			}
			_this.optGeneOldValue.value = $current.data('default-value') || $current.val();
			_this.info(_this.optGeneOldValue);
		},
		setSelectValue: function($select, val) { //设置下拉框的值
			var _this = this,
				status = false;
			if (!val) {
				return;
			}
			$select.find('.hz-dropdown-menu >li').each(function() {
				var defaultValue = $(this).data('default-value');
				var $input = $select.find('input');
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
		setDefaultValue: function() { //设置默认值-下拉框
			var _this = this;
			_this.genesArea.find('.' + _this.listStyle).each(function() {
				var defaultValue = $(this).data('default-value'),
					$hzDropdown = $(this).find('.hz-dropdown'),
					$filterTag = $(this).find('.filter-tag');
				if (!$(this).find('.' + _this.activeStyle).length && defaultValue && $hzDropdown.length) {
					_this.setSelectValue($hzDropdown, defaultValue);
				}
			});
		},
		eventSelect: function() { //操作事件
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
						protectItemId = $current.data('protectitemid'),
						key = $current.data('key'),
						value = $current.data('default-value') || '';

					if ($(this).is('li')) {
						return;
					}
					if ($(this).is('input')) {
						if (ev.type === 'click') {
							_this.getOldValue(ev.target);
						}
						return;
					}
					//debugger;
					_this.optGeneOldValue = {};
					if (protectItemId) {
						_this.optGeneOldValue.protectItemId = protectItemId;
					}
					if (key) {
						_this.optGeneOldValue.key = key;
					}
					_this.optGeneOldValue.value = value;

					$parent.find('.' + _this.itemStyle + ',.hz-dropdown').removeClass(_this.activeStyle);
					if ($(this).hasClass('filter-tag')) {
						$(this).addClass(_this.activeStyle);
						$parent.find('input.trial-item,input.product-amount-input').val($parent.find('.' + _this.activeStyle).data('default-value'));
						$parent.find('input.product-amount-input').trigger('reset'); //重置状态
						_this.postChange();
					}

					//同步保障项
					var $protect = _this.protectArea.find('.hz-dropdown[data-key="' + key + '"],.hz-dropdown[data-protectitemid="' + protectItemId + '"]');
					_this.setSelectValue($protect, $(this).text());

				});
			_this.el.find('.trial-calendar').click(function() {
				var key = $(this).data('key');
				var protectItemId = $(this).data('protectitemid');
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
			_this.el.find('.hz-dropdown').dropDown({
				type: 1,
				width: 265, //height: 300,
				event: function(ev) {
					if ($(ev.target).hasClass('iconfont') || $(ev.target).hasClass('more-tag')) {
						return false;
					} else {
						return true;
					}
				},
				select: function(ev) {
					return _this.dropDwonSelect(this, ev);
				}
			});
		},
		dropDwonSelect: function(dropDown, ev) { //下拉框选择事件
			var _this = this,
				target = ev.target,
				$target = $(target),
				tagName = target.tagName.toLowerCase(),
				$dropdown = $target.parents('.hz-dropdown'),
				$parent = $(dropDown).parents('.' + _this.listStyle),
				$input = $dropdown.find('.input-select-text'),
				$selectItem = $parent.find('.hz-dropdown'),
				closeStatus = false,
				isProtect = $target.attr('protect') === 'true',
				text = '',
				byname = $target.data('byname'),
				defaultValue = '',
				$current = $parent.find('.' + _this.activeStyle),
				key = $current.data('key'),
				protectItemId = $current.data('protectitemid');
			text = $target.text();
			if (isProtect) {
				var $genesList, value;
				value = $target.data('default-value');
				key = $target.data('key');
				protectItemId = $target.data('protectitemid');
				if (key) {
					$genesList = _this.genesArea.find('[data-protectitemid="' + key + '"]').parents('.' + _this.listStyle);
				} else if (protectItemId) {
					$genesList = _this.genesArea.find('[data-protectitemid="' + protectItemId + '"]').parents('.' + _this.listStyle);
				}
				_this.setOldValue($genesList.find('.' + _this.activeStyle));
				$genesList.find('.' + _this.itemStyle + ',.hz-dropdown').removeClass(_this.activeStyle);
				$dropdown.addClass(_this.activeStyle);
				//同步试算因子
				if ($genesList.find('.filter-tag[data-default-value="' + value + '"]').length) {
					$genesList.find('.filter-tag[data-default-value="' + value + '"]').addClass(_this.activeStyle);
				} else {
					_this.setSelectValue($genesList.find('.hz-dropdown'), value);
				}
				$input.val(text);
				_this.postChange();
				closeStatus = true;

			} else if ($target.hasClass('hz-select-option')) { //下拉选择

				if (!byname) {
					_this.optGeneOldValue = {};
					if (key) {
						_this.optGeneOldValue.key = key;
					}
					if (protectItemId) {
						_this.optGeneOldValue.protectItemId = protectItemId;
					}
					_this.optGeneOldValue.value = $current.data('default-value') || '';
				}

				defaultValue = $target.data('default-value');
				$item = $parent.find('[data-default-value="' + text + '"]'); //常用选项
				$parent.find('.' + _this.itemStyle).removeClass('filter-active-tag');

				if ($item.length) { //是否有常用设置选项
					//$item.click();
					//$item.addClass(_this.activeStyle);
					$selectItem.data('default-value', '');
				} else {

				}
				$selectItem.data('default-value', defaultValue);

				//添加下拉选中样式
				$(target).parent().find('li').removeClass('hz-select-option-selected')
				$(target).addClass('hz-select-option-selected');

				//添加当前样式
				if (!byname) {
					$input.parents('.hz-dropdown').addClass(_this.activeStyle);
				} else {
					//console.log($target.data('default-value'));
					$dropdown.data('default-value', $target.data('value'));
				}
				//同步保障项
				var $protect = _this.protectArea.find('.hz-dropdown[data-key="' + key + '"],.hz-dropdown[data-protectitemid="' + protectItemId + '"]');
				_this.setSelectValue($protect, text);
				$input.val(text);
				closeStatus = true;
				_this.postChange();

			} else if ($target.hasClass('hz-button-primary')) { //保障项-下拉{输入框类型}

				if (_this.__selectTimeStatus) {
					var val = $dropdown.find('select').val();
					var $defaulItem = $parent.find('[data-default-value="' + val + '"]');
					_this.setOldValue($parent.find('.' + _this.activeStyle));

					$parent.find('.' + _this.itemStyle).removeClass(_this.activeStyle);
					if ($defaulItem.length) {
						$defaulItem.addClass(_this.activeStyle);
					} else {
						$input.val(val);
						$dropdown.addClass(_this.activeStyle).data('default-value', val);
					}
					_this.postChange();
					closeStatus = true;
				} else {
					$dropdown.find('.hz-alert-error').show().find('span').text(_this.TEXT_DATE_INVALID);
				}
			}
			return closeStatus;
		},
		optGeneOldValue: { //试算-更换之前的值
			key: '',
			protectItemId: '',
			value: ''
		},
		postDelayTime: 300, //延迟POST
		__postTimer: null,
		postChange: function() { //发送变更请求
			var _this = this;
			if (_this.postDelayTime) {
				clearTimeout(_this.__postTimer);
				_this.__postTimer = setTimeout(function() {
					_this.postChangeData();
				}, _this.postDelayTime);;
			} else {
				_this.postChangeData();
			}
		},
		getGenesString: function() {
			var _this = this,
				data = _this.getProductInfo({
					genes: _this.getGenes() || [],
					optGeneOldValue: _this.optGeneOldValue
				});
			data = JSON.stringify(data);
			_this.info(data);
			_this.trialString = data;
			return data;
		},
		trialString: '',
		postChangeData: function() { //Post 变更数据
			var _this = this
			$.post(_this.productId + '/restrict-rule', {
				data: _this.getGenesString()
			}, function(data) {
				_this.updateRender(data.result);
			});
		},
		//updateAfter: function(updateData) {}, //变更后执行
		updateRender: function(data) { //变化之后重新渲染
			var _this = this;
			var restrictGenes = data.restrictGenes || [];
			//_this.updateAfter.call(_this, data);
			_this.preminum = data.preminum || _this.notInsureText;

			_this.trialPrice = data.trialPrice || {};
			_this.change();
			_this.setPrice();
			_this.info(data);
			restrictGenes.forEach(function(item) {
				var id = item.protectItemId || item.key,
					hiddenStyle = '',
					html = _this.renderGenesRow({
						boxClass: hiddenStyle,
						name: item.name,
						item: item,
						id: item.protectItemId || item.key,
						content: _this.renderForm({
							formObject: item
						})
					});
				$id = $('#list-' + id);
				$id.after(html);
				$id.remove();
				_this.setDefaultValue();
				_this.eventEnterValue();
				_this.eventSelect();

			});
		}
	};

	//继承类
	Base.extend(Trial.prototype, new Base());
	Base.extend(Trial.prototype, new RenderTrial());
	Base.extend(Trial.prototype, new TrialEvent());
	Base.extend(Trial.prototype, new TrialText());

	return Trial;
});