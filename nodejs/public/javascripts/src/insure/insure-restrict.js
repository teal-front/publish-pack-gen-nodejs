define(function() {
	'use strict';
	/*
	 * @constructor InsureRestrict
	 * @author 
	 * @version 0.0.1
	 * @description 约束模块
	 */
	var InsureRestrict = function() {};
	InsureRestrict.prototype = {
		restrictId: {}, //保存约束ID
		restrictStatus: {}, //约束状态，是否可以提交数据
		getREstrictStatus: function() {
			var _this = this;
			var status = true;
			var showErrorStatus = true;
			$.each(this.restrictStatus, function(key, object) {
				var obj = object;
				if (false === obj.status) {
					status = false;
					if (showErrorStatus) {
						showErrorStatus = false;
						_this.scrollTo(obj.element);
						_this.showError(obj.element, obj.errorText);
					}
				}

			});
			return status;
		},
		defaultRestrict: function($wrap) { //默认约束，无条件执行
			//return;
			var _this = this,
				insureIncludeBirthday = _this.insureIncludeBirthday,
				$wrap = $wrap || this.el,
				newDate = '';
			//this.info('默认约束date前时间：', this.date);
			//this.info('默认约束前insured date:', _this.insuredDate);

			if (_this.insuredAgeCalculation === 1) {
				newDate = _this.getFixedDateValue();
			}
			//$wrap.addClass('box-shadow');
			$.each(_this.restricts, function(i, item) {
				var results = item.results || [];
				if (item.type === 1) { //默认约束
					$.each(results, function(i, item) {
						var $form = _this.$get(item.moduleId, item.attributeId);
						$form = $wrap ? $wrap.find('.insure-form[data-moduleid="' + item.moduleId + '"][data-attributeid="' + item.attributeId + '"]') : $form;
						var val = $form.val();
						var value = item.value;
						var isRadio = $form.is(':radio') || $form.hasClass('hz-radio-item');
						var isSelect = $form.is('select') || $form.hasClass('hz-dropdown');
						//$form.addClass('default-shadow'); 					 
						switch (item.conditions) {
							case 0: //大于
								if (item.unit === 0) {

								} else if (item.unit === 7 || item.unit === 13) { //岁 	
									var maxDate, minDate;
									maxDate = _this.createDate({
										newDate: newDate,
										year: -item.value,
										date: insureIncludeBirthday
									});
									minDate = _this.createDate({
										newDate: newDate,
										year: -_this.maxAge,
										date: insureIncludeBirthday
									});

									_this.compareTime({
										type: 1,
										maxDate: maxDate,
										minDate: minDate,
										item: item
									});

								} else if (item.unit === 10) { //天
									var maxDate, minDate;
									maxDate = _this.createDate({
										newDate: newDate,
										//year: -item.value,
										date: -item.value + insureIncludeBirthday - 1
									});
									_this.compareTime({
										type: 1,
										maxDate: maxDate,
										item: item
									});
								}
								break;
							case 1: //大于等于
								if (item.unit === 3) { //元
									//alert(item.value);
									var obj = {
										value: item.value,
										conditions: item.conditions,
										unit: item.unit
									};
									// if (!_this.restrictId[item.restrictId]) {
									// 	_this.restrictId[item.restrictId] ={};
									// }
									_this.restrictId[item.restrictId] = obj;

									_this.$get(item.moduleId, item.attributeId)
										//.data('conditions', item.conditions)
										//.data('value', item.value)
										.data('restrictId', item.restrictId)
										.addClass('validate-restricts-value');
								} else if (item.unit === 10) { //天
									var maxDate = _this.createDate({
										newDate: newDate,
										date: -item.value + insureIncludeBirthday
									});
									var minDate = _this.createDate({
										//newDate: newDate,
										year: -1,
										date: -item.value + insureIncludeBirthday
									});
									_this.compareTime({
										type: 1,
										item: item,
										maxDate: maxDate
											//minDate: minDate
									});

								}
								break;
							case 4: //不等于
								if (item.unit === 0) {
									if (isRadio) {
										_this.restrictRadio($form, value, item.conditions);
									} else if (isSelect) {
										_this.defaultRestrictSelect($form, item.value, 4);
									}
								}
								break;
							case 5: //===
								if (item.unit === 0) {
									if (isSelect) {
										_this.defaultRestrictSelect($form, item.value, 5);
									} else if (isRadio) {
										//$form.addClass('box-shadow');
										_this.restrictRadio($form, value, item.conditions, 1);
									}

								}
								break;
							case 6: //包含
								if (item.unit === 0) {
									if (isRadio) {
										_this.restrictRadio($form, value, item.conditions);
									} else if (isSelect) {
										_this.defaultRestrictSelect($form, item.value, 5);
									}
								}
								break;
							case 7: //不包含
								if (item.unit === 0) {
									if (isRadio) {
										_this.restrictRadio($form, value, item.conditions);
									} else if (isSelect) {
										_this.defaultRestrictSelect($form, item.value, 4);
									}
								}
								break;
							case 8: //提示
								if (!$form.next().hasClass('js-insure-tips')) {
									$form.after('<span class="js-insure-tips pl5" >' + item.value + '</span>');
								}
								//$form.nextAll('.default-tips').text(item.value);
								break;
							case 9: //隐藏
								$form.parents('tr').hide().find('.insure-form').attr('disabled', true);
								break;
						}
						if (item.moduleId === _this.MODULES_ID_INSURED) {
							if (item.attributeId === _this.ATTR_ID_BUYCOUNT) { //设置份数的区间值
								_this.setBuyRestrictCountRange(item);
							}
							if (item.attributeId === _this.ATTR_ID_CREDENTIALSTYPE) { //团单证件类型
								_this.cardType = _this.defaultRestrictSelectValue(_this.cardType, item.value, item.conditions); //设置团单约束后的值
							}
							if (item.attributeId === _this.ATTR_ID_RELATIONINSUREINSURANT) { //团单关系
								_this.relationships = _this.defaultRestrictSelectValue(_this.relationships, item.value, item.conditions); //设置团单约束后的值
							}
						}
					});
				}
			});
			//_this.changeCredentials();
			_this.runGenesRestrict();
		},
		eventRestrict: function() { //Restrict Event
			var _this = this;
			_this.el
				.delegate('.insure-form', 'change', function() {
					if ($(this).attr('executes')) {
						_this.restrictRun(this);
					}
				})
				.delegate('.insure-form.hz-radio-item', 'click', function() {
					if ($(this).attr('executes')) {
						_this.restrictRun(this);
					}
				})
				.delegate('.insure-form', 'blur', function() {
					if ($(this).attr('executes') && !$(this).hasClass('insure-birthdate')) {
						_this.restrictRun(this);
					}
				});
		},
		restrictCale: function(val1, conditions, val2) { //Cale
			var status = false;

			if (eval(val1 + conditions + val2)) {
				status = true;
			} else {
				status = false;
			}
			return status;
		},
		setGeneralRestrictsItem: function() { //标记一般约束的项
			var _this = this;
			$.each(_this.restricts, function(i, item) {
				var executes = item.executes || [],
					results = item.results || [];

				$.each(executes, function(i, item) {
					var $form = _this.$get(item.moduleId, item.attributeId),
						$parent = $form.parents('.credentials-form');
					//return;
					$form.attr('executes', true); //.parent().append('<span class="" style="color:#fff;background:green; padding:2px; margin-left: 5px;">开发用，这里有约束</span>');
					//.addClass('default-shadow');
				});
			});
		},
		selectContain: function($select, val) {
			var status = false;
			var str = val || '';
			var arr = str.split(',');
			var $options = $select.hasClass('hz-dropdown') ? $select.find('.hz-select-option-selected') : $select.find('option:selected');
			if ($options.length > 0 && $.inArray($options.val().toString(), arr) !== -1) {
				status = true;
			}
			return status;
		},
		restrictRunStatus: {}, //数据组装
		selectChangeBefore: {}, //下拉框改变之前的值，用于恢复约束后还原
		selectChangeBeforeValue: {}, //记录改变前的值
		restrictSelect: function(obj) { //约束下拉框
			var _this = this,
				str = obj.value || '',
				arr = str.split(','),
				key = obj.key,
				val = obj.form.val(),
				$options = obj.form.hasClass('hz-dropdown') ? obj.form.find('.hz-dropdown-content  .hz-select-option') : obj.form.find('option');
			if (obj.status) {
				if (!_this.selectChangeBeforeValue[key]) {
					_this.selectChangeBeforeValue[key] = obj.form.val();
				}
				if (!_this.selectChangeBefore[key]) {
					_this.selectChangeBefore[key] = $options.clone(true);
				}

				$options.each(function(i) {
					var val = $(this).attr('value').toString();
					if (!val) {
						return;
					}
					if (obj.conditions === 5 || obj.conditions === 6) { //包含
						if ($.inArray(val, arr) === -1) {
							$(this).remove();
						}
					} else if (obj.conditions === 7) { //不包含
						if ($.inArray(val, arr) !== -1) {
							$(this).remove();
						}
					}
				});
				_this.validate(obj.form);
			} else {
				if (_this.selectChangeBefore[key]) {
					if (obj.form.hasClass('hz-dropdown')) {
						obj.form.find('.hz-dropdown-menu').empty().append(_this.selectChangeBefore[key]).val(_this.selectChangeBeforeValue[key]);
					} else {
						obj.form.empty().append(_this.selectChangeBefore[key]).val(_this.selectChangeBeforeValue[key]);
					}
					delete _this.selectChangeBefore[key];
					delete _this.selectChangeBeforeValue[key];
				}

				_this.validate(obj.form);
			}
			if (obj.form.find('.hz-select-option-selected').length < 1) {
				var $input = obj.form.find('.input-select-text');
				if ($input.is(':text')) {
					$input.val('请选择');
				} else {
					$input.text('请选择');
				}
				obj.form.data('value', '请选择').attr('value', '请选择');
			}
		},
		setRadioStatus: function($radio, conditions) {

		},
		restrictRadioNew: function(obj) { //约束Radio类型
			var _this = this,
				$radio = obj.parent.find('[data-moduleid="' + obj.moduleId + '"][data-attributeid="' + obj.attributeId + '"]');
			$radio.each(function() {
				var id = $(this).attr('id'),
					$label = $(this).next('label'),
					val = $(this).val() || $(this).attr('value');

				if (obj.conditions === 4 || obj.conditions === 7) { //4不等于
					if (val === obj.value) {
						if (obj.status) {
							$(this).hide();
							$(this).attr('disabled', true);
							//$label.hide();
						} else {
							$(this).show();
							$(this).removeAttr('disabled');
							//$label.show();
						}
					} else { //不管条件满不满足都保留不包含的值
						$(this).show();
						$(this).removeAttr('disabled');
						//$label.parents('.hz-radio-item').show();
					}

				} else if (obj.conditions === 5 || obj.conditions === 6) { //5包含与6等于
					if (val === obj.value) { //不管条件满不满足都保留当前值
						$(this).show();
						$(this).removeAttr('disabled');
						//$label.show();
					} else {
						if (obj.status) {
							$(this).hide();
							$(this).attr('disabled', true);
							//$label.hide();
						} else {
							$(this).show();
							$(this).removeAttr('disabled');
							//$label.show();
						}
					}
				}
			});
		},
		getStatus: function(executeType, calcStatus, status) { //获取状态
			// var status = false;
			if (executeType === 0) { //满足所有条件才执行
				if (!calcStatus) {
					status = false;
				} else {
					status = status;
				}
			} else if (executeType === 1) { //满足一个条件就执行
				status = calcStatus || status;
			}
			return status;
		},
		restrictRun: function(input) { //一般约束

			var _this = this,
				$input = $(input),
				$wrap = $input.parents('.credentials-form'),

				moduleId = _this.toInt($input.data('moduleid')),
				attributeId = _this.toInt($input.data('attributeid'));

			_this.restrictRunStatus = {}; //重置

			//遍历所有约束
			$.each(_this.restricts, function(i, item) {
				var executes = item.executes || [],
					results = item.results || [],
					myName = item.name,
					status = item.executeType === 0, //当前约束的执行状态，如果满足所有条件才执行，初始状态为true，如果满足其中一个条件执行初始状态为false；
					executesStautsType0 = true,
					executesStautsType1 = false,
					id = item.id,
					executeType = item.executeType; //为0时-满足所有条件才执行；为1时-满足其中一个条件执行；
				if (item.type !== 0) { //1为默认约束；0为一般约束；
					return;
				}
				//执行条件
				$.each(executes, function(e, eItem) {
					var _moduleId = eItem.moduleId,
						_attributeId = eItem.attributeId,
						restrictId = eItem.restrictId,
						unit = eItem.unit,
						conditions = _this.getConditions[eItem.conditions],
						executesVal = eItem.value,
						$form, $radio, isSelect, isRadio, isInput, innerStatus, val;

					if (_this.MODULES_ID_INSURED === _moduleId && moduleId === _moduleId) {
						$wrap = $input.parents('.credentials-form');
					} else {
						$wrap = _this.el;
					}
					//console.log(_moduleId, _attributeId);
					$form = $wrap.find('[data-moduleid="' + _moduleId + '"][data-attributeid="' + _attributeId + '"]');
					$radio = $wrap.find('[data-moduleid="' + _moduleId + '"][data-attributeid="' + _attributeId + '"].hz-radio-item-checked');

					_this.logRed($form.length);
					isSelect = $form.is('select') || $form.hasClass('hz-dropdown');
					isRadio = $form.is(':radio') || $form.hasClass('hz-radio-item');
					isInput = $form.is('input');

					val = $form.val();
					if (isRadio) {
						val = $radio.val() || $radio.attr('value');
					}

					if (unit === 0) { //无单位
						if (eItem.conditions === 6) { //包含
							if (isRadio) {
								$form = $radio;
								innerStatus = val === executesVal;
								status = _this.getStatus(executeType, innerStatus, status);
							}
						} else if (eItem.conditions === 4) { //不等于
							if (isRadio) {
								$form = $radio;
								innerStatus = val !== executesVal;
								status = _this.getStatus(executeType, innerStatus, status);
							}
						} else if (eItem.conditions === 7) { //不包含
							if (isRadio) {
								$form = $radio;
								innerStatus = val === executesVal;
								status = _this.getStatus(executeType, innerStatus, status);
							}
						} else {

							if (isRadio) { //单选-性别类型//if (_attributeId === _this.ATTR_ID_SEX) { //单选-性别类型
								$form = $radio;
								innerStatus = val === executesVal;
								status = _this.getStatus(executeType, innerStatus, status);
							} else if (isSelect) {
								innerStatus = _this.selectContain($form, executesVal);
								status = _this.getStatus(executeType, innerStatus, status);
							} else if (isInput) {

							} else {

							}
						}


					} else if (unit === 7 || unit === 13) { //岁
						if (isInput) { //文框
							val = _this.getFullAge({
								select: val
							});
							innerStatus = _this.restrictCale(val, conditions, executesVal);
							status = _this.getStatus(executeType, innerStatus, status);
						}
					}
				});

				//执行结果
				$.each(results, function(r, rItem) {
					var _moduleId = rItem.moduleId,
						_attributeId = rItem.attributeId,
						conditions = rItem.conditions,
						value = _this.replaceNull(rItem.value),
						unit = rItem.unit,
						restrictId = rItem.restrictId,
						$forms;
					if (_this.MODULES_ID_INSURED === _moduleId && moduleId === _moduleId) {
						$wrap = $input.parents('.credentials-form');
					} else {
						$wrap = _this.el;
					}
					$forms = $wrap.find('[data-moduleid="' + _moduleId + '"][data-attributeid="' + _attributeId + '"]');
					//$forms.addClass('box-shadow');

					$forms.each(function(i) {
						var $form = $(this),
							$wrap = $form.parents('.credentials-form'),
							$tips = $form.nextAll('.default-tips'),
							wrapTag = $wrap.data('index'),
							key = wrapTag + '[' + restrictId + ']';
						if (!_this.restrictRunStatus[key]) {
							_this.restrictRunStatus[key] = {};
						}
						_this.restrictRunStatus[key]['parent'] = $wrap;
						_this.restrictRunStatus[key]['status'] = status;
						_this.restrictRunStatus[key]['moduleId'] = _moduleId;
						_this.restrictRunStatus[key]['attributeId'] = _attributeId;
						_this.restrictRunStatus[key]['key'] = key;
						_this.restrictRunStatus[key]['value'] = value;
						_this.restrictRunStatus[key]['form'] = $form;
						_this.restrictRunStatus[key]['conditions'] = conditions;
						$tips.text('');
					});

				});

			});

			$.each(_this.restrictRunStatus, function(key, obj) {
				//console.log(key, obj);
				var $tips;
				switch (obj.conditions) {
					case 0: //大于
						break;
					case 1: //大于等于
						break;
					case 2: //小于
						break;
					case 3: //小于等于
						break;
					case 4: //不等于
						break;
					case 5: //等于
						break;
					case 6: //包含 
						break;
					case 7: //不包含
						break;
					case 8: //提示
						if (obj.status) {
							$tips = obj.form.nextAll('.default-tips');
							$tips.text(obj.value); //obj.tips.text(obj.value + obj.tips.text());
						}
						break;
					case 9: //隐藏
						if (obj.status) {
							obj.form.parents('tr').hide();
						} else {
							obj.form.parents('tr').show();
						}
						break;
				}

				if (obj.form.is('select') || obj.form.hasClass('hz-dropdown')) { //如果是下拉框类型
					//return;
					//obj.form.addClass('box-shadow')
					if (attributeId === _this.restrictRunStatus[key].attributeId) { //如果是本身，则不动
						return;
					}
					_this.restrictSelect(obj);

				} else if (obj.form.is(':radio') || obj.form.hasClass('hz-radio-item')) { //如果是单选类型
					_this.restrictRadioNew(obj);
				}
			});
		},
		restrictDefaultTeam: function() {

		},
		resetRestrictedSelectValue: function(modulesId, attributesId, index) { //获取车团单默认约束后的关系
			var obj = {},
				index = index || 0;
			this.$get(modulesId, attributesId).eq(0).find('option').each(function(i, item) {
				var val = $(this).attr('value');
				var text = $(this).text();
				if (val) {
					obj[val] = text;
				}
			});
			return obj;
		},
		getFixedDateValue: function() {
			var date = $('.fixed-date').val();
			if (!date) {
				date = this.startDate.minDate;
			}
			return date;
		},
		restrictRadio: function($form, value, conditions, type) {
			var _this = this,
				type = type || 1;
			$form.each(function(i, item) {
				var val = $(item).val() || $(item).attr('value');
				var id = $(item).attr('id');
				var $label = $('[for="' + id + '"]');

				if (conditions === 4 || conditions === 7) { //不等于、不包含
					if (val !== value) {
						return;
					}
					if (type === 1) { //默认约束直接删除掉
						$(item).remove();
						$label.remove();
					} else if (type === 2) {
						$(item).hide();
						$label.hide();
					}
				} else if (conditions === 5 || conditions === 6) { // 包含
					if (val === value) {
						return;
					}
					if (type === 1) { //默认约束直接删除掉
						$(item).remove();
						$label.remove();
					} else if (type === 2) {
						$(item).hide();
						$label.hide();
					}
				}
			});
		},
		defaultRestrictSelect: function($select, data, type) { //默认约束，下拉框
			var str = data || '',
				arr = str.split(','),
				type = type || 5,
				_this = this,
				options = [];
			if ($select.hasClass('select-area')) {
				$select = $select.eq(0);
			}
			options = $select.hasClass('hz-dropdown') ? $select.find('.hz-dropdown-content  .hz-select-option') : $select.find('option');
			if ($select.data("attributeid") === this.ATTR_ID_RELATIONINSUREINSURANT) { //如果是与被保险人的关系，同步修改为谁投保
				var rdata = [];
				arr.forEach(function(val, i) {
					var isExist = false;
					_this.RELATIONMAP.forEach(function(item, j) {
						if (item.defaultValue.toString() === val) {
							isExist = true;
							item.transRelation.forEach(function(tItem, k) {
								rdata.push(tItem.controlValue);
							});
						}
					});
					if (!isExist) {
						rdata.push(val);
					}
				});
				str = rdata.join(',');
				arr = str.split(',');
				_this.defaultRestrictSelect(this.forRelationTypeSelect, str, type);
			}


			options.each(function() {
				var val = $(this).attr('value') || $(this).attr('data-value');
				if ($select.hasClass('select-area') && val) { //地区控件
					val = $(this).attr('text');
				}
				val = val ? val.toString() : "";
				if (type === 5) {
					if (val && $.inArray(val, arr) === -1) {
						$(this).remove();
					}
				} else if (type === 4) {
					if (val && $.inArray(val, arr) !== -1) {
						$(this).remove();
					}
				}
			});
		},
		defaultRestrictSelectValue: function(select, data, type) { //团单默认约束后的值
			var rselect = [],
				str = data || '',
				arr = str.split(',');
			if (select) {
				select.forEach(function(item) {
					var val = item.controlValue.toString();
					if (type === 5 || type === 6) {
						if (val && $.inArray(val, arr) !== -1) {
							rselect.push(item);
						}
					} else if (type === 4 || type === 7) {
						if (val && $.inArray(val, arr) === -1) {
							rselect.push(item);
						}
					}

				});
			}
			return rselect;
		},
		compareTime: function(options) { //对比时间
			var _this = this,
				ops = options || {},
				item = ops.item || {};
			if (item.moduleId !== 20) {
				return;
			}
			if (ops.maxDate) {
				if (_this.dateDifference(_this.date.maxDate, ops.maxDate) < 0) {
					_this.insuredDate.maxDate = ops.maxDate;
					if (ops.type === 1) { //如果是默认约束，改变出生日期范围上限
						_this.date.maxDate = ops.maxDate;
						_this.insuredDate.maxValue = item.value;
						_this.insuredDate.unit = item.unit;
					}
				} else {
					_this.insuredDate.maxDate = _this.date.maxDate;
				}
			}
			if (ops.minDate) {
				if (_this.dateDifference(_this.date.minDate, ops.minDate) < 0) {
					_this.insuredDate.minDate = ops.minDate;
					if (ops.type === 1) { //如果是默认约束，改变出生日期范围下限
						_this.date.maxDate = ops.minDate;
					}
				} else {
					_this.insuredDate.minDate = _this.date.minDate;
				}
			}
		},
		buyCountRange: {
			min: 1,
			max: 10000
		},
		setBuyRestrictCountRange: function(item) {
			var _this = this,
				val = parseInt(item.value);
			if (item.unit === 1) { //单位为份数
				switch (item.conditions) {
					case 0: //大于
						var min = _this.buyCountRange.min > (val + 1) ? _this.buyCountRange.min : (val + 1);
						_this.buyCountRange.min = min;
						break;
					case 1: //大于等于
						var min = _this.buyCountRange.min > val ? _this.buyCountRange.min : val;
						_this.buyCountRange.min = min;
						break;
					case 2: //小于
						var max = _this.buyCountRange.max < (val - 1) ? _this.buyCountRange.max : (val - 1);
						_this.buyCountRange.max = max;
						break;
					case 3: //小于等于
						var max = _this.buyCountRange.max < val ? _this.buyCountRange.max : val;
						_this.buyCountRange.max = max;
						break;
				}
			}
		},

		/*
		 * 为谁投保选中关系为本人时，投保人执行被保险人相关的约束处理，为非本人时，投保人还原约束项
		 */
		insureBeforeRestrict: {},
		selfDefaultRestrict: function() { //为谁投保选中关系为本人时，投保人执行被保险人相关的约束
			var _this = this;
			$.each(_this.restricts, function(j, restrict) {
				var results = restrict.results || [];
				if (restrict.type === 1) { //只处理默认约束
					$.each(results, function(i, item) {
						if (item.moduleId === _this.MODULES_ID_INSURED) { //只处理被保人的默认约束
							var $form = $('#module-10').find('.insure-form[data-moduleid=10][data-attributeid=' + item.attributeId + ']'); //从投保人模块去找相关控件
							if ($form.length > 0) {
								var val = $form.val() || $form.attr('value');
								var value = item.value;
								var isRadio = $form.is(':radio') || $form.hasClass('hz-radio-item');
								var isSelect = $form.is('select') || $form.hasClass('hz-dropdown');
								var key = item.attributeId;
								if (!_this.insureBeforeRestrict[item.attributeId]) {
									if (isSelect) {
										_this.insureBeforeRestrict[item.attributeId] = $form.find('.hz-select-option');
									} else if (isRadio) {
										_this.insureBeforeRestrict[item.attributeId] = $form.parent('.field-row').html();
									}
								}
								switch (item.conditions) {
									case 0: //大于
										break;
									case 1: //大于等于
										break;
									case 4: //不等于
										if (item.unit === 0) {
											if (isRadio) {
												_this.restrictRadio($form, value, item.conditions);
											} else if (isSelect) {
												_this.defaultRestrictSelect($form, item.value, 4);
											}
										}
										break;
									case 5: //===
										if (item.unit === 0) {
											if (isSelect) {
												_this.defaultRestrictSelect($form, item.value, 5);
											} else if (isRadio) {
												//$form.addClass('box-shadow');
												_this.restrictRadio($form, value, item.conditions, 1);
											}

										}
										break;
									case 6: //包含
										if (item.unit === 0) {
											if (isRadio) {
												_this.restrictRadio($form, value, item.conditions);
											} else if (isSelect) {
												_this.defaultRestrictSelect($form, item.value, 5);
											}
										}
										break;
									case 7: //不包含
										if (item.unit === 0) {
											if (isRadio) {
												_this.restrictRadio($form, value, item.conditions);
											} else if (isSelect) {
												_this.defaultRestrictSelect($form, item.value, 4);
											}
										}
										break;
									case 8: //提示
										break;
									case 9: //隐藏
										break;
								}
							}
						}
					});
				}
			});
		},
		restSelfDefaultRestrict: function() { //为非本人时，投保人还原约束项
			var _this = this;
			$.each(_this.restricts, function(j, restrict) {
				var results = restrict.results || [];
				if (restrict.type === 1) { //只处理默认约束
					$.each(results, function(i, item) {
						if (item.moduleId === _this.MODULES_ID_INSURED) { //只处理被保人的默认约束
							var $form = $('#module-10').find('.insure-form[data-moduleid=10][data-attributeid=' + item.attributeId + ']'); //从投保人模块去找相关控件
							if ($form.length > 0) {
								var val = $form.val() || $form.attr('value');
								var value = item.value;
								var isRadio = $form.is(':radio') || $form.hasClass('hz-radio-item');
								var isSelect = $form.is('select') || $form.hasClass('hz-dropdown');
								var key = item.attributeId;
								if (_this.insureBeforeRestrict[item.attributeId]) {
									if (isSelect) {
										$form.find('.hz-dropdown-menu').html(_this.insureBeforeRestrict[item.attributeId]);
										//_this.insureBeforeRestrict[item.attributeId] = $form.find('.hz-select-option');
									} else if (isRadio) {
										$form.parent('.field-row').html(_this.insureBeforeRestrict[item.attributeId]);
									}
								}
							}
						}
					});
				}
			});
		},
	};
	return InsureRestrict;
});