define([
	'jquery',
	'my-calendar'
], function(
	$,
	MyCalendar
) {
	'use strict';
	/*
	 * @constructor InsureDate
	 * @author 
	 * @version 0.0.1
	 * @description 日期
	 */
	var InsureDate = function() {

	};
	InsureDate.prototype = {
		startDate: { //起保日期范围
			maxDate: '',
			minDate: ''
		},
		insureDate: { //投保人日期范围
			maxDate: '',
			minDate: ''
		},
		insuredDate: { //被保人日期范围
			maxDate: '',
			minDate: ''
		},
		date: {
			maxDate: '',
			minDate: ''
		},
		initDate: function() {
			var _this = this;

			this.setDateValue();
			this.setInsureDate();
			this.eventCalendar();

		},
		eventCalendar: function() { //日期
			var _this = this;
			this.el.on('blur', '.insure-calendar', function() {
				var moduleid = _this.toInt($(this).data('moduleid')),
					attributeid = _this.toInt($(this).data('attributeid'));
				if (attributeid === _this.ATTR_ID_BIRTHDATE && _this.MODULES_ID_INSURED === moduleid) { //被保险人
					_this.setJuvenilesJob(this);
				}
			});
			this.el.delegate('.credentials-validity', 'change', function() { //证件有效期
				_this.credentialsValidity(this);
			});

			_this.initCalendar();

		},
		__initCalendarLock: true,
		calendarBox: {},
		calendarIndex: 0,
		initCalendar: function(from, parent) { //初始化日期控件
			var _this = this,
				$from = from ? $(from) : _this.el;

			// if (!_this.__initCalendarLock) {
			// 	return;
			// }
			// _this.__initCalendarLock = false;
			// _this.el
			// 	.on('click', 'input.Wdate', function() {
			// 		alert(2);
			// 	});
			$from.find('.Wdate').not('.bind').each(function() {

				var moduleId = _this.toInt($(this).data('moduleid')),
					attributeId = _this.toInt($(this).data('attributeid')),
					maxDate, minDate;
				$(this).addClass('bind');
				if ($(this).data('lock')) {
					return;
				}
				$(this).data('lock', true);

				// 起保日期默认值
				var defaultStartMinDate = _this.getDefaultStartMinDate(moduleId, attributeId);
				_this.calendarIndex++;
				_this.calendarBox[_this.calendarIndex] = new MyCalendar({
					el: this,
					parent: parent,
					zIndex: 9999999999,
					//scrollTime:10,//default
					top: function() { //获取TOP方式，可为静态，可为动态
						var top = 0,
							bodyTop = $('body').scrollTop() || $('html').scrollTop() || 0,
							isTeam = $(this.el).data('calendartype') === 'team', //团单
							isBeneficiary = $(this.el).data('calendartype') === 'beneficiary'; //受益人
						if (isTeam) { //如果是团单，刚要减去团单Scroll的高度，否则无法定位
							top = -_this.teamBody.scrollTop() - 2;
						}
						if (isBeneficiary) {
							top = bodyTop - $('#beneficiary-dialog').parent().scrollTop();
						}
						return top;
					},
					defaultValue: defaultStartMinDate,
					maxDate: function() { //获取日期控件的最大值
						var result = _this.getCurrentTime();
						if (moduleId === _this.MODULES_ID_INSURE && attributeId === _this.ATTR_ID_BIRTHDATE) { //投保人
							result = _this.insureDate.maxDate;
							if (_this.isSelf) { //如果是给本人投保
								result = _this.dateDifference(_this.insureDate.maxDate, _this.insuredDate.maxDate) >= 0 ? _this.insureDate.maxDate : _this.insuredDate.maxDate;
							}
						} else if (moduleId === _this.MODULES_ID_INSURED && attributeId === _this.ATTR_ID_BIRTHDATE) { //被保人
							result = _this.insuredDate.maxDate;
						} else if (_this.MODULES_ID_INSURE_DATE === moduleId && _this.ATTR_ID_INSURE_DATE === attributeId) { //起保日期
							result = _this.startDate.maxDate;
						} else if (_this.ATTR_ID_CREDENTIALSVALIDITY === attributeId) {
							result = $(this.el).attr('maxDate');
						}
						return result;
					},
					minDate: function() { //获取日期控件的最小值
						var result = '1900-1-1';
						if (moduleId === _this.MODULES_ID_INSURE && attributeId === _this.ATTR_ID_BIRTHDATE) { //投保人
							result = _this.insureDate.minDate;
							if (_this.isSelf) { //如果是给本人投保
								result = _this.dateDifference(_this.insureDate.minDate, _this.insuredDate.minDate) >= 0 ? _this.insuredDate.minDate : _this.insureDate.minDate;
							}
						} else if (moduleId === _this.MODULES_ID_INSURED && attributeId === _this.ATTR_ID_BIRTHDATE) { //被保人
							result = _this.insuredDate.minDate;
						} else if (_this.MODULES_ID_INSURE_DATE === moduleId && _this.ATTR_ID_INSURE_DATE === attributeId) { //起保日期
							result = _this.startDate.minDate;
						} else if (_this.ATTR_ID_CREDENTIALSVALIDITY === attributeId) {
							result = $(this.el).attr('minDate');
						}
						return result;
					},
					callback: function(date, dateObj) {
						var value = date || '',
							$parentTeamList;
						$(this.el).blur(); //校验

						//根据起保日期重新计算
						if (_this.insuredAgeCalculation && _this.MODULES_ID_INSURE_DATE === moduleId && _this.ATTR_ID_INSURE_DATE === attributeId) {
							_this.setInsuredDate({ //被保人出生日期
								newDate: value
							});
							_this.setInsureDate({ //投保人出生日期
								newDate: value
							});
							_this.validateInsureDate();
						}
						//显示保障期限
						if (_this.MODULES_ID_INSURE_DATE === moduleId && _this.ATTR_ID_INSURE_DATE === attributeId) {
							_this.showInsurantDateLimit(this.el);
						}
						// if (_this.MODULES_ID_INSURED === moduleId && _this.ATTR_ID_BIRTHDATE === attributeId) { //被保险人出生日期
						// 	_this.setJuvenilesJob(this.el);
						// }
						//团单
						if ($(this.el).data('type') === 'team') {
							$parentTeamList = $(this.el).parents('.list-table-row');
							_this.validateTeamItem($parentTeamList);
							_this.updateTemaValue($parentTeamList);
						}
						_this.trialChange(this.el);
					}
				});
			});
		},
		validateInsureDate: function(input) { //校验日期是否在合理范围内
			var _this = this,
				status = true;
			if (input) { //校验单个
				var val = $(input).val(),
					isOk = _this.dateDifference(_this.insuredDate.minDate, val) >= 0 &&
					_this.dateDifference(val, _this.insuredDate.maxDate) >= 0;
				if (!isOk && val) {
					status = isOk;
					_this.hideSuccess(input);
					_this.showError(input, _this.TEXT_INSURE_DATA_ERROR);
				}
			} else {
				_this.insuredModules.find('.insurant-item-form:visible').find('.insure-calendar[data-attributeid="' + _this.ATTR_ID_BIRTHDATE + '"]').each(function() { //校验所有
					var val = $(this).val(),
						isOk = _this.dateDifference(_this.insuredDate.minDate, val) >= 0 &&
						_this.dateDifference(val, _this.insuredDate.maxDate) >= 0;
					if (!isOk && val) {
						status = isOk;
						_this.hideSuccess(this);
						_this.showError(this, _this.TEXT_INSURE_DATA_ERROR);
					}
				});
			}
			return status;
		},
		validateInsureAge: function(submit) { //校验投保人出生日期
			var _this = this,
				status = true,
				$calendar = $('#module-10').find('.insure-calendar[name*="birthdate"]'),
				val = $calendar.val(),
				age = _this.getFullAge({ //获取年龄
					nowDate: _this.getStartDateValue(),
					select: val
				});
			if (age < 18) {
				_this.showError($calendar[0], _this.TEXT_INSURE_MIN_AGE);
				status = false;
				_this.submitStatus = false;
				if (submit) {
					_this.scrollTo($calendar);
				}
			} else {
				var isOk = _this.dateDifference(_this.insuredDate.minDate, val) >= 0 &&
					_this.dateDifference(val, _this.insuredDate.maxDate) >= 0;
				if (!isOk && val && _this.isSelf) {
					status = isOk;
					_this.hideSuccess($calendar[0]);
					_this.showError($calendar[0], _this.TEXT_INSURE_DATA_ERROR);
				}
			}
			return status;
		},
		getStartDateValue: function() { //获取起保日期值
			var result = '',
				startValue = $.trim($('#module-first [data-moduleid=102]').val()) || ''; //获取起保日期
			//如果按起保日期计算而有值时，重新计算日期
			if (this.insuredAgeCalculation === 1 && startValue) {
				result = startValue;
			}
			return result;
		},
		setDateValue: function() {
			var _this = this,
				restrictRule = this.insurance.restrictRule || {},
				restrictGenes = restrictRule.restrictGenes || [];
			_this.insurantDate = '';
			_this.insurantDateLimit = ''; //保障期限
			_this.dateDefaultValue = '';
			var dictionaryList = [];
			var dateRange = '';

			restrictGenes.forEach(function(item, i) {
				//console.log(item, i);
				if (item.key === 'insurantDate') {
					_this.insurantDate = item.defaultValue;
					dictionaryList = item.dictionaryList || [];
					_this.dateDefaultValue = item.defaultValue;
					_this.dateRange = item.rangeDic || ''; //如果带过来的时间是连续的，如：10-20，20-30，30-40；如果时间范围就是10-40；不由没有这个字段
				}
				if (item.key === 'insurantDateLimit') {
					_this.insurantDateLimit = item.defaultValue || '';
				}
			});

			_this.dateDictionaryList = dictionaryList; //保存时间字典

			_this.info('连续的时间段范围', _this.dateRange);

			_this.info('', restrictGenes);

			_this.setInsureStartDate();

			_this.setInsuredDate({
				dictionaryList: dictionaryList
			});

			_this.logRed('默认日期：' + _this.insurantDate);
		},
		setInsureDate: function(options) { //投保人日期范围
			//投保人必须大于18岁
			// var _this = this,
			// 	ops = options || {},
			// 	insuranceDate = ops.newDate || _this.startDate.minDate,
			// 	diffDate = _this.getDates(insuranceDate);
			// if (!this.isNumber(diffDate)) {
			// 	diffDate = 0;
			// }
			// diffDate = 0;
			this.insureDate.maxDate = this.createDate({
				year: -18
					//date: diffDate
			});
			this.insureDate.minDate = this.createDate({
				year: -120
					//date: diffDate
			});
		},
		setInsuredDate: function(options) { //被保人日期范围
			var _this = this,
				ops = options || {},
				maxDate = '',
				minDate = '',
				minDay = 0,
				insureIncludeBirthday = _this.insureIncludeBirthday;
			//console.clear();
			var insuranceDate = ops.newDate || _this.startDate.minDate;
			var diffDate = _this.getDates(insuranceDate);
			if (!_this.isNumber(diffDate) || _this.product.insuredAgeCalculation === 2) {
				diffDate = 0;
			}

			_this.insuredDate.maxDate = this.createDate({
				year: 0,
				date: diffDate
			});
			_this.insuredDate.minDate = this.createDate({
				year: -120,
				date: diffDate
			});
			// _this.insuredDate = {
			// 	maxDate: maxDate,
			// 	minDate: minDate
			// };
			var status = true;
			_this.logGreen('选中日期：' + _this.dateDefaultValue);
			// if (_this.isValidDate(_this.dateDefaultValue)) { //合法日期
			// 	alert(0);
			// } else { //范围

			// }
			if (_this.dateRange && !_this.isTeamInsurant) { //团单不参与试算
				(function() {
					var max,
						min,

						maxYear = 0,
						maxMonth = 0,
						maxDate = 0,

						minYear = 0,
						minMonth = 0,
						minDate = 0,

						_YEAR = 0,

						subMaxYear = 0,
						subMaxMonth = 0,
						subMaxDate = 0,

						subMinYear = 0,
						subMinMonth = 0,
						subMinDate = 0,

						unit = _this.dateRange.unit,
						subrestrict = _this.dateRange.subrestrict,
						subUnit;

					if (unit === 7 || unit === 8 || unit === 13||unit===0) { //年或岁或者不限年龄
						maxYear = _this.dateRange.max;
						minYear = _this.dateRange.min;
						_YEAR = 1;
					} else if (unit === 9) { //月
						maxMonth = _this.dateRange.max;
						minMonth = _this.dateRange.min;
					} else if (unit === 10) { //天
						maxDate = _this.dateRange.max;
						minDate = _this.dateRange.min;
					}

					//子约束
					if (subrestrict) {
						subUnit = subrestrict.unit;
						if (subUnit === 7 || subUnit === 8 || subUnit === 13) { //年或岁
							if (subrestrict.min) {
								subMaxYear = subrestrict.min;
							}
							if (subrestrict.max) {
								subMinYear = subrestrict.max;
							}
						} else if (subUnit === 9) { //月
							if (subrestrict.min) {
								subMaxMonth = subrestrict.min;
							}
							if (subrestrict.max) {
								subMinMonth = subrestrict.max;
							}
						} else if (subUnit === 10) { //天
							if (subrestrict.min) {
								subMaxDate = subrestrict.min;
							}
							if (subrestrict.max) {
								subMinDate = subrestrict.max;
							}
						}
					}

					// var diffDate = _this.getDates(ops.newDate);
					// if (!_this.isNumber(diffDate) || _this.product.insuredAgeCalculation === 2) {
					// 	diffDate = 0;
					// }

					max = _this.createDate({
						year: -maxYear - _YEAR + subMaxYear,
						month: -maxMonth + subMaxMonth,
						date: -maxDate + subMaxDate + diffDate
					});
					min = _this.createDate({
						year: -minYear + subMinYear,
						month: -minMonth + subMinMonth,
						date: -minDate + subMinDate + diffDate
					});
					_this.insuredDate.maxDate = min;
					_this.insuredDate.minDate = max;
				})();

			} else {
				_this.dateDictionaryList.forEach(function(item, i) {

					if (!status) {
						return;
					}
					_this.insuredDate = {
						maxDate: '',
						minDate: ''
					};
					if (item.value && item.value + _this.getUnit(item.unit) === _this.dateDefaultValue) {
						status = false;
					}

					_this.info('日期范围', item, item.value, item.value + _this.getUnit(item.unit), _this.dateDefaultValue);
					var maxDate = '',
						minDate = '',

						max = item.max || 0,
						min = item.min || 0,
						unit = item.unit || 0,

						list = item.subrestrict || {},
						newDate = ops.newDate || null,

						maxText = '',
						minText = '',
						_YEAR = 0,

						dateNow = new Date(),
						dateMax = new Date(),
						dateMin = new Date(),
						nowYear = dateNow.getFullYear(),
						nowDate = dateNow.getDate(),

						_MAX_YEAR = 0,
						_MIN_YEAR = 0,
						_MAX_DATE = 0,
						_MIN_DATE = 0;

					if (_this.getUnit(unit) === '岁' || _this.getUnit(unit) === '周岁' || unit === 0) { //和刘洪确认不限年龄单位为0，默认单位为年
						_MAX_YEAR = min;
						_MIN_YEAR = max;
						_YEAR = 1;
					}
					maxText = max + _this.getUnit(unit);
					minText = min + _this.getUnit(unit);

					//子约束条件 _this.info('子约束条件', list.subrestrict);				 
					if (!_this.isValidDate(_this.dateDefaultValue)) {
						//minDay = 1;
						insureIncludeBirthday = 0;
					}
					if (list && _this.getUnit(list.unit) === '天') {
						var subMax = list.max;
						var subMin = list.min;
						//alert(subMax + '\n' + subMin + '\n' + _this.getUnit(list.unit))
						if (subMax) {
							_MAX_DATE = subMax;
						}
						if (subMin) {
							_MIN_DATE = subMin;
						}

					}

					var _MAX = _this.createDate({
						newDate: _this.getCurrentTime(),
						year: -_MAX_YEAR,
						date: _MAX_DATE + insureIncludeBirthday + diffDate
					});
					var _MIN = _this.createDate({
						newDate: _this.getCurrentTime(),
						year: -_MIN_YEAR - _YEAR,
						date: _MIN_DATE + insureIncludeBirthday + diffDate + minDay
					});

					//获取区间的最大值
					_MAX = _this.insuredDate.maxDate && new Date(_this.insuredDate.maxDate) >= new Date(_MAX) ? _this.insuredDate.maxDate : _MAX;
					_MIN = _this.insuredDate.minDate && new Date(_this.insuredDate.minDate) <= new Date(_MIN) ? _this.insuredDate.minDate : _MIN;
					_this.insuredDate = {
						maxDate: _MAX,
						minDate: _MIN
					};
				});
			}

			var now = _this.getCurrentTime(_this.getServiceTime(true)); //被保险人的出生日期不能晚于当前时间
			if (_this.dateDifference(_this.insuredDate.maxDate, now) < 0) {
				_this.insuredDate.maxDate = now;
			}
			_this.date.maxDate = _this.insuredDate.maxDate;
			_this.date.minDate = _this.insuredDate.minDate;

			_this.defaultRestrict();
			_this.logRed('被保人日期：' + _this.insuredDate.minDate + '——' + _this.insuredDate.maxDate);
		},
		setInsureStartDate: function(options) { //起保日期
			var _this = this,
				ops = options || {};

			if (_this.data.product.deadline) { // 判断当天时间是否超过当天投保截止时间
				var now = new Date();
				try {
					var deadLineHour = parseInt(_this.data.product.deadline.split(':')[0]),
						deadLineMinute = parseInt(_this.data.product.deadline.split(':')[1]),
						deadLineTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), deadLineHour, deadLineMinute);
					if (now.getTime() - deadLineTime.getTime() > 0) {
						_this.firstDate = _this.firstDate + 1;
					}
				} catch (error) {}
			}
			if (_this.data.product.nextDayDeadline) { //判断次日投保截止日期
				var now = _this.getServiceTime(true);
				try {
					var ndeadLineHour = parseInt(_this.data.product.nextDayDeadline.split(':')[0]),
						ndeadLineMinute = parseInt(_this.data.product.nextDayDeadline.split(':')[1]),
						ndeadLineTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ndeadLineHour, ndeadLineMinute);
					if (now.getTime() - ndeadLineTime.getTime() > 0) {
						_this.firstDate = _this.firstDate + 1;
					}
				} catch (error) {}
			}

			var minDate = _this.createDate({
					// date: _this.firstDate + _this.insureIncludeBirthday
					date: _this.firstDate
				}),
				maxDate = _this.createDate({
					// date: _this.latestDate + _this.insureIncludeBirthday
					date: _this.latestDate
				});

			if (_this.product.insureTime === 2) {
				var fixedDate = _this.getCurrentTime(_this.getDateFormat(_this.fixedDate));
				minDate = maxDate = fixedDate;
				var fixedLatestDate = _this.getCurrentTime(_this.getDateFormat(_this.product.fixedLatestDate));
				var currentDate = _this.getCurrentTime();
				if (_this.dateDifference(fixedLatestDate, currentDate) >= 0) { //已经过了最后的投保日期
					maxDate = this.createDate({
						newDate: maxDate,
						date: -1
					});
				}


			}

			_this.startDate = {
				maxDate: maxDate,
				minDate: minDate
			};
			_this.logRed('起保日期：' + _this.startDate.minDate + '——' + _this.startDate.maxDate);
		},
		showInsurantDateLimit: function(input) { //显示保障期限
			var _this = this,
				$insurantDate = $('#insurantDate'),
				startTime = $(input).val(),
				endTime = _this.insurantDateLimit || '',
				includeYear = endTime.indexOf('年'),
				includeMonth = endTime.indexOf('月'),
				includeDate = endTime.indexOf('天'),
				lifelong = endTime.indexOf('终身'),
				startStr = '',
				endStr = '',
				fixStr = '',
				year = '',
				html = [],
				fixedDate = _this.getDateFormat(_this.fixedDate); //new Date(_this.fixedDate), //固定起保时间
			//planeNumber = $(input).attr('id').indexOf('planeNumber') >= 0; //add by tangguangde:判断是否为航意险，如果是则起保日期显示航意险的提示

			if (!startTime) {
				return;
			}

			if (startTime === _this.getCurrentTime()) { //如果选择当天
				html.push('如果您选择当日生效，请务必于当日' + _this.replaceNull(_this.data.product.deadline) + '前完成支付，以确保电子保单的顺利生成。');
			} else if (lifelong !== -1) { //包含“终身”
				html.push('保险期限为终身，具体详情以保单为准（起保时间：' + startTime + '）');
			} else if (_this.flightNumber) {
				html.push('保险期间，由被保险人进入机舱起到出机舱结束（起保时间：' + startTime + '）');
			} else {

				startStr = '自<span class="insure-bold">' + startTime + '零时</span>起 ';
				if (_this.insurantDateLimit) {
					var nowTime = new Date(_this.compatibleDateFormat(startTime)),
						nowYear = nowTime.getFullYear(),
						nowMonth = nowTime.getMonth(),
						nowDate,
						calculateType = _this.product.calculateType; //如果是固定方式，一年按365天算，一个月按30天算，根据开始时间算截止时间，获得保障期限，显示规则跟现在一样
					if (endTime.indexOf('-') !== -1) {
						endTime = endTime.split('-')[1];
					}
					if (includeYear !== -1) {
						var _year = parseInt(endTime, 10);
						if (!calculateType) {
							nowTime.setYear(nowYear + _year);
							nowTime.setDate(nowTime.getDate() - 1);
						} else {
							nowTime.setDate(nowTime.getDate() + _year * 365 - 1);
						}
						endTime = _this.getCurrentTime(nowTime);
						endStr = '至<span class="insure-bold">' + endTime + '二十四时止</span>（北京时间）';
					} else if (includeMonth !== -1) {
						var month = parseInt(endTime, 10);
						if (!calculateType) {
							nowTime.setMonth(nowMonth + month);
							nowTime.setDate(nowTime.getDate() - 1);
							// 按照自然月时，如果截止月份与开始月份超过保障期限，则需要控制截止日期在上一个月末。例：选择2017-01-30或2017-01-31，保障期限一个月，则需要控制在2月底
							if ((nowTime.getMonth() - nowMonth + (nowTime.getFullYear() - nowYear) * 12) > month) {
								nowTime.setDate(0);
							}
						} else {
							nowTime.setDate(nowTime.getDate() + month * 30 - 1);
						}
						endTime = _this.getCurrentTime(nowTime);
						endStr = '至<span class="insure-bold">' + endTime + '二十四时止</span>（北京时间）';
					} else if (includeDate !== -1) {
						var date = parseInt(endTime, 10);
						nowTime.setDate(nowTime.getDate() + date - 1);
						endTime = _this.getCurrentTime(nowTime);
						endStr = '至<span class="insure-bold">' + endTime + '二十四时止</span>（北京时间）';
					} else {
						endTime = _this.insurantDateLimit;
						endStr = '<span class="insure-bold">保障' + endTime + '</span>';
					}

				} else if (_this.isInsurantDate) {
					endTime = _this.isInsurantDate;
					endStr = '至<span class="insure-bold">' + endTime + '</span>二十四时止（北京时间' + fixStr + '）';
				}
				html.push(startStr + endStr);
			}
			$insurantDate.html(html.join(''));
		},
		getDefaultStartMinDate: function(moduleId, attributeId) {
			var result = '';
			if (this.MODULES_ID_INSURE_DATE === moduleId && this.ATTR_ID_INSURE_DATE === attributeId) { //起保日期
				if (this.dateDifference(this.startDate.minDate, this.startDate.maxDate) >= 0) {
					result = this.startDate.minDate;
				}
			}
			return result;
		},
		getMaxDate: function(moduleId, attributeId) { //获取日期控件的最大值
			var _this = this,
				result = _this.getCurrentTime();
			if (moduleId === _this.MODULES_ID_INSURE && attributeId === _this.ATTR_ID_BIRTHDATE) { //投保人
				result = _this.insureDate.maxDate;
				if (_this.isSelf) { //如果是给本人投保
					result = _this.dateDifference(_this.insureDate.maxDate, _this.insuredDate.maxDate) >= 0 ? _this.insureDate.maxDate : _this.insuredDate.maxDate;
				}
			} else if (moduleId === _this.MODULES_ID_INSURED && attributeId === _this.ATTR_ID_BIRTHDATE) { //被保人
				result = _this.insuredDate.maxDate;
			} else if (_this.MODULES_ID_INSURE_DATE === moduleId && _this.ATTR_ID_INSURE_DATE === attributeId) { //起保日期
				result = _this.startDate.maxDate;
			} else if (_this.ATTR_ID_CREDENTIALSVALIDITY === attributeId) {
				//result = $(this.el).attr('maxDate');
			}
			return result;
		},
		getMinDate: function(moduleId, attributeId) { //获取日期控件的最小值
			var _this = this,
				result = '1900-1-1';
			if (moduleId === _this.MODULES_ID_INSURE && attributeId === _this.ATTR_ID_BIRTHDATE) { //投保人
				result = _this.insureDate.minDate;
				if (_this.isSelf) { //如果是给本人投保
					result = _this.dateDifference(_this.insureDate.minDate, _this.insuredDate.minDate) >= 0 ? _this.insuredDate.minDate : _this.insureDate.minDate;
				}
			} else if (moduleId === _this.MODULES_ID_INSURED && attributeId === _this.ATTR_ID_BIRTHDATE) { //被保人
				result = _this.insuredDate.minDate;
			} else if (_this.MODULES_ID_INSURE_DATE === moduleId && _this.ATTR_ID_INSURE_DATE === attributeId) { //起保日期
				result = _this.startDate.minDate;
			} else if (_this.ATTR_ID_CREDENTIALSVALIDITY === attributeId) {
				//result = $(this.el).attr('minDate');
			}
			return result;
		},

		/*
		 *  证件有效期
		 */
		credentialsValidity: function(input) {
			var moduleId = $(input).data('moduleid'),
				$cardPeriodEnd = $(input).parents('dd').find('.validity-span'),
				$insureTips = $cardPeriodEnd.nextAll('.insure-tips');
			if ($(input).is(':checked')) {
				$cardPeriodEnd.hide().attr('disabled', true);
				$insureTips.hide();
				$(input).val(1);
			} else {
				$cardPeriodEnd.show().attr('disabled', false);
				$insureTips.show();
				$(input).val(0);
			}
		}
	};
	return InsureDate;
});