define([
	'jquery',
	'my-calendar',
	'layer',
	'helper'
], function(
	$,
	MyCalendar,
	Layer,
	helper
) {
	'use strict';
	/*
	 * @constructor InsureEvent
	 * @author 
	 * @version 0.0.1
	 * @description Event
	 */
	var InsureEvent = function() {

	};
	InsureEvent.prototype = {
		event: function() {
			var _this = this;
			// $(window)
			// 	.on('scroll', function() {
			// 		_this.closeCalendar();
			// 	});
			_this.el
				.delegate('.insure-form', 'change', function() {
					if (_this.isPriceModify && _this.isReady) { //页面加载完成，并且是改过价的单，则变更保单信息的时就重新试算
						_this.trialChange();
					}

					if ($(this).hasClass('job-level')) {
						_this.changeJob(this);
					}

				})
				.delegate('.insure-form', 'blur', function() {
					//自动设置身份信息
					if ($(this).hasClass('id-card-input')) {
						_this.autoSetIdInfo(this);
						_this.validateInsuredSameCardInfo(this);
					}
				})
				.delegate('.insure-form', 'click', function() {})
				/*
				 *地区选择控件的改变相应事件
				 */
				// .delegate('select.select-area', 'change', function() {
				// 	_this.changeArea(this);
				// })
				/*
				 *添加
				 */
				.delegate('.add', 'click', function() { //添加多名被保险人、团单
					var type = $(this).data('type');
					_this.addIndex++;
					var $insureModules = $('#module-' + _this.MODULES_ID_INSURED);
					if (type === 'more') {
						if ($insureModules.find('.form-more').length < _this.maxPeople) {
							_this.addTable();
							//_this.isTrialChange = true;
							// _this.setGeneralRestrictsItem();
						} else {
							_this.layer({
								content: _this.TEXT_INSURE_MAX + _this.maxPeople + _this.TEXT_PEOPLE
							});
						}
					} else if (type === 'team') {}
					// _this.changeCredentials();
				})
				/*
				 *删除
				 */
				.delegate('.del', 'click', function() { //删除多名被保险人、团单
					var type = $(this).data('type');
					var $this = this;
					if (type === 'team') { //团单

						// _this.confirm({
						// 	content: _this.TEXT_DEL,
						// 	yes: function(index) {
						// 		_this.removeTeamTr($this);
						// 		this.close(index);
						// 	}
						// });

					} else if (type === 'more') { //多名
						// layer.open({
						// 	type: 1,
						// 	skin: 'layui-layer-demo', //样式类名
						// 	closeBtn: 1, //不显示关闭按钮
						// 	shift: 2,
						// 	title: false,
						// 	area: ['530px'],
						// 	btn: ['取消', '确认'],
						// 	shadeClose: true, //开启遮罩关闭
						// 	content: '<div class="pt45 pb45 tac">' +_this.TEXT_DEL+'</div>',
						// 	btn2: function() {
						// 		_this.removeMoreTable($this);
						// 		//_this.isTrialChange = true;
						// 	},
						// 	btn1: function() {
						// 		layer.closeAll();
						// 	}
						// });
						_this.confirm(_this.TEXT_DEL, function() {
							_this.removeMoreTable($this);
						});

					} else if (type === 'beneficiary') { //删除受益人
						// layer.open({
						// 	type: 1,
						// 	skin: 'layui-layer-demo', //样式类名
						// 	closeBtn: 1, //不显示关闭按钮
						// 	shift: 2,
						// 	title:false,
						// 	area: ['530px'],
						// 	btn: ['取消', '确认'],
						// 	shadeClose: true, //开启遮罩关闭
						// 	content:'<div class="pt45 pb45 tac">' +_this.TEXT_DEL+'</div>',
						// 	btn2: function() {
						// 		_this.delBeneficiary($this);
						// 	},
						// 	btn1: function() {
						// 		layer.closeAll();
						// 	}
						// });
						_this.confirm(_this.TEXT_DEL, function() {
							_this.delBeneficiary($this);
						});
					}
				})
				/*
				 *编辑
				 */
				.delegate('.edit', 'click', function() { //编辑受益人
					var type = $(this).data('type');
					var $this = this;
					if (type === 'beneficiary') { //编辑受益人
						_this.editBeneficiary($this);
						$.placeholder.resetStatus();
					}
				})
				/*
				 * 下拉框
				 */
				.delegate('.hz-dropdown', 'click', function(event) {
					if (!$(this).attr('isDropDown')) {
						$(this).dropDown({
							type: 1,
							//width: "auto", //height: 300,
							event: function(ev) {
								if ($(ev.target).hasClass('iconfont') || $(ev.target).hasClass('more-tag')) {
									return false;
								} else {
									return true;
								}
							},
							select: function(ev) {
								return _this.dropDwonSelectChange(this, ev.target);
							}
						});
						var $target = event.target;
						if (event.target) {
							$target.click();
						}
						// $('[data-dropdown-item="' + $(this).data('dropdown') + '"]').toggle();
						//$(this).click();
					}
				})
				/*
				 * 添加受益人
				 */
				.delegate('.add-beneficiary', 'click', function() { //添加受益人
					_this.addBenficiary(this);
					_this.setGeneralRestrictsItem();
				})
				/*
				 *  投保申明
				 */
				.delegate('#insureDeclare', 'click', function() {
					_this.showDeclare();
				})
				.delegate('.urgency-toggle', 'click', function() { //紧急联系人
					_this.urgencyToggle();
				})
				.delegate('.hz-radio-item', 'click', function() { //单选按钮
					if (!$(this).data('lock')) {
						$(this).myForm({
							checkedClass: 'hz-radio-item-checked',
							checked: function(checked, rel) {
								_this.radioChecked(this, checked);
							}
						});
						$(this).click();
					}
				});


			_this.eventRestrict();
			_this.eventCheckbox();
			_this.eventRadio();

			//自动续保
			if (_this.product.isForcePay === 1) { //默认选择否
				$('#noForcePay').click();
			}
			var $forcepay = _this.el.find('.insure-form[data-attributeid="' + _this.ATTR_ID_BANK_NAME_1 + '"]');
			$forcepay.attr('disabled', true);
			_this.fixedInfo($forcepay, $forcepay.data('defaultremind'));
			//持卡人姓名
			var $hasIdCardName = _this.el.find('.insure-form[data-attributeid="' + _this.ATTR_ID_BANK_NAME_2 + '"]');
			$hasIdCardName.attr('disabled', true);
		},
		closeCalendar: function() { //关闭日期插件

			try {
				MyCalendar.closeAll();
			} catch (ev) {}

		},
		eventCheckbox: function(wrap) {
			var _this = this,
				$warp = wrap || _this.el;
			$warp.find('.hz-check-item').myForm({
				checked: function(checked, rel) {
					_this.checkboxChecked(this, checked);
				}
			});
		},
		checkboxChecked: function(input, checked) {
			var _this = this,
				required,
				$input = $(input),
				$insureTips,
				$checkbox = $input.find('[type=checkbox]');
			$checkbox.attr("checked", checked);

			//_this.info(this, checked, rel);
			//同意条款
			if ($input.attr('id') === 'clauseInfo') {
				$insureTips = $('.clause-insure-tips');
				if (checked) {
					$insureTips.text('');
				} else {
					$insureTips.text(($('#clauseInfo').data('errorremind') || ''));
				}
			} else if ($input.hasClass('credentials-validity')) {
				if (checked) {
					$input.parents('.credentials-form').find('.validity-end-item').hide().parents('.placeholder-wrap').hide();
				} else {
					$input.parents('.credentials-form').find('.validity-end-item').show().parents('.placeholder-wrap').show();
				}
			} else {
				$insureTips = $input.find('.write-info-error');
				required = _this.toInt($input.data('required'));
				if (!required) {
					return;
				}
				if (checked) {
					$insureTips.text('');
				} else {
					$insureTips.text(($input.data('errorremind') || ''));
				}
			}
		},
		checkboxSelectItem: function(input) { //选中checkbox
			var _this = this,
				$input = $(input);
			if (!$input.hasClass('hz-check-item-checked')) {
				$input.click();
			} else {
				_this.checkboxChecked(input, true);
			}
		},
		eventRadio: function(wrap) {
			var _this = this,
				$warp = wrap || _this.el;
			$warp.find('.hz-radio-item').myForm({
				checkedClass: 'hz-radio-item-checked',
				checked: function(checked, rel) {
					_this.radioChecked(this, checked);

				}
			});
		},
		radioChecked: function(input, checked) {
			var _this = this,
				$this = $(input),
				name = $this.attr('name'),
				val = $this.attr('value');
			$('[name=' + name + ']').each(function() {
				if ($(this).attr('value') === val) {
					$(this).attr('checked', checked);
					if ($(this).hasClass('forcepay')) { //是否自动续保
						var $forcePayContent = $('#forcePayContent');
						if (val === "0") {
							$forcePayContent.hide();
						} else {
							$forcePayContent.show();
						}
					}
					//$this.click();
				} else {
					$(this).removeClass('hz-radio-item-checked');
					$(this).attr('checked', false);
				}
			});
			if ($this.attr('trial')) {
				_this.trialChange($this);
			}
		},
		eventValidate: function() { //绑定校验-正则
			var _this = this;
			this.el
				.on('click', '.insure-team-input', function() {
					$(this).parents('.list-table-row').find('.insure-tips').html('');
				})
				.on('blur', '.form-item', function() {
					var input = this,
						status;
					_this.hideDefault(this);

					if (!$(this).hasClass('hz-dropdown')) {

						//团单做特殊处理
						if ($(this).hasClass('insure-team-input')) {
							var $parents = $(this).parents('.list-table-row'),
								$tips = $parents.find('.write-info-error'),
								errorremind = $(this).data('errorremind') || '';

							status = _this.validate(this, function() {
								$tips.html('');
								_this.hideError(input);
								_this.showSuccess(input);
							}, function() {
								$tips.html(errorremind);
								_this.hideSuccess(input);
								_this.showError(input);
							});

						} else {

							status = _this.validate(this);
							if (status) {
								var attributeid = $(this).data('attributeid'),
									moduleid = $(this).data('moduleid');
								if (moduleid === _this.MODULES_ID_INSURE && attributeid === _this.ATTR_ID_NAME) {
									_this.insurerName(this);
								}
							}
						}

					}
				})
				.on('focus', '.form-item', function() {
					_this.hideSuccess(this);
					_this.hideError(this);
					_this.showDefault(this);
				})
				.on('blur', '.validate-restricts-value', function() {
					var restrictId = $(this).data('restrictId');
					var val = $(this).val();
					var obj;
					var errorText = '';
					if (_this.validate(this)) {

						obj = _this.restrictId[restrictId];
						_this.info(obj);
						//todo 
						switch (obj.conditions) {
							case 0:
								errorText = '大于';
								break;
							case 1:
								errorText = '必须大于等于';
								break;
							case 2:
								errorText = '大于';
								break;
							case 3:
								errorText = '小于等于';
								break;
						}

						if (!_this.restrictCale(val, _this.getConditions[obj.conditions], obj.value)) {
							errorText += obj.value + _this.getUnit(obj.unit);
							_this.showError(this, errorText);
							_this.restrictStatus[restrictId] = {
								status: false,
								errorText: errorText,
								element: this
							};

						} else {

							_this.restrictStatus[restrictId] = {
								status: true,
								errorText: errorText,
								element: this
							};

						}

					}
				});
		},
		eventDrowDown: function(warp) { //初始化下拉框
			var _this = this,
				$warp = warp ? $(warp) : _this.el;
			$warp.find('.hz-dropdown').dropDown({
				type: 1,
				width: "auto", //height: 300,
				time: 50,
				event: function(ev) {
					if ($(ev.target).hasClass('iconfont') || $(ev.target).hasClass('more-tag')) {
						return false;
					} else {
						return true;
					}
				},
				select: function(ev) {
					return _this.dropDwonSelectChange(this, ev.target);
				}
			});
		},
		dropDwonSelectChange: function(dropDown, target) { //响应下拉框选中事件
			var _this = this,
				//target = ev.target,
				$target = $(target),
				// tagName = target.tagName.toLowerCase(),
				//$dropdown = $target.parents('.hz-dropdown'),
				$dropdown = $('.hz-dropdown[data-dropdown="' + $target.parents('.hz-dropdown-content').data('dropdown-item') + '"]'),
				$input = $dropdown.find('.input-select-text'),
				closeStatus = false,
				text = '',
				defaultValue = '',
				attributeId = _this.toInt($(dropDown).data('attributeid')),
				selectValue = '';

			if (!$target.hasClass('hz-select-option')) {
				return false;
			}

			text = $target.text();

			_this.oldValue = _this.toInt($(dropDown).val());

			if ($input.is(':text')) {
				$input.val(text);
			} else {
				$input.text(text);
			}
			selectValue = $target.data('value') === undefined ? ($target.attr('value') === undefined ? $target.attr('text') : $target.attr('value')) : $target.data('value');

			$dropdown.find('.hz-select-option-selected').removeClass('hz-select-option-selected');
			$('#dropDownSelectArea').find('.hz-select-option-selected').removeClass('hz-select-option-selected');
			$target.addClass('hz-select-option-selected');
			$(dropDown).data('value', selectValue).attr('value', selectValue).blur();

			if ($dropdown.data('show') === 'body') {
				$dropdown.find('[data-value=' + selectValue + ']').addClass('hz-select-option-selected');
			}
			if ($dropdown.hasClass('for-relation-select')) { //为谁投保
				//$input.text(text);
				var forrelationType = $target.data('forrelationtype');

				_this.forrelationChange(dropDown);
			}
			if ($dropdown.hasClass('beneficiarytype-select')) { //受益人
				//$input.text(text);
				var beneficiaryType = $target.data('beneficiarytype');
				var insurantIndex = $dropdown.data('insurantindex');

				if (beneficiaryType === 1) { //法定继承人
					$('.zd-beneficiary[data-insurantindex=' + insurantIndex + ']').hide();
				} else { //指定受益人
					$('.zd-beneficiary[data-insurantindex=' + insurantIndex + ']').show();
				}
			}

			if ($dropdown.data('attributeid') === _this.ATTR_ID_RELATIONINSUREINSURANT) { //被保险人是投保人的关系
				_this.relationChange(dropDown);
			}

			if ($(dropDown).attr('executes')) { //如果是一般约束项
				_this.restrictRun(dropDown);
			}

			if ($(dropDown).hasClass('select-area')) {
				_this.changeArea(dropDown);
			}
			closeStatus = true;

			$(dropDown).data('text', $input.text());
			if ($(dropDown).data('type') === 'team') { //团单
				$(dropDown).data('value', $target.data('value'));
				_this.setTeamItemInfo(dropDown);
			}
			//切换证件类型
			if (attributeId === _this.ATTR_ID_CREDENTIALSTYPE) {
				_this.eventIDCard(dropDown);
				var $parent = $(dropDown).parents('.credentials-form');
				var _dataValue = _this.replaceNull(
					_this.data.cardNumRegexJson[($target.val() || $target.data('value'))]
				);
				
				var $input = $(dropDown).parents('li.list-table-row').find('.insure-code');
				var $parents = $(dropDown).parents('.list-table-row'),
					$tips = $parents.find('.write-info-error'),
					errorremind = $input.data('errorremind') || '';


				$parent
					.find('input.insure-form[data-attributeid="' + _this.ATTR_ID_CREDENTIALSINPUT + '"]')
					.data('regex', _dataValue);

				//校验团单表单
				_this.validate($input, function() {
					$tips.html('');
					_this.hideError($input);
					_this.showSuccess($input);
				}, function() {
					$tips.html(errorremind);
					_this.hideSuccess($input);
					_this.showError($input);
				});

			}
			$(dropDown).change();
			_this.validate(dropDown);
			$('#beneficiary-dialog').find('input:visible').placeholder({});
			try {
				$.placeholder.resetStatus();
			} catch (ev) {}
			return closeStatus;
		},
		dropdownSelectItem: function(dropDown, val) { //下拉框  选中某一项
			var _this = this,
				$dropdown = $(dropDown),
				$item = $dropdown.find('.hz-select-option[data-value="' + val + '"]').length > 0 ? $dropdown.find('.hz-select-option[data-value="' + val + '"]') : $dropdown.find('.hz-select-option[value="' + val + '"]');
			if ($item.length > 0) {
				_this.setDropdownSelectValue(dropDown, val);
				_this.dropDwonSelectChange(dropDown, $item);
				//$item.click();
			}
		},
		setDropdownSelectValue: function(dropDown, val) { //值设置下拉框的值，不触发默认事件
			var _this = this,
				$dropdown = $(dropDown),
				$input = $dropdown.find('.input-select-text'),
				$item = $dropdown.find('.hz-select-option[data-value="' + val + '"]').length > 0 ? $dropdown.find('.hz-select-option[data-value="' + val + '"]') : $dropdown.find('.hz-select-option[value="' + val + '"]');
			if ($item) {
				var text = $item.text();
				$dropdown.find('.hz-select-option-selected').removeClass('hz-select-option-selected');
				$item.addClass('hz-select-option-selected');
				$dropdown.data('value', ($item.attr('value') || $item.attr('text'))).attr('value', ($item.attr('value') || $item.attr('text')));
				if ($input.is(':text')) {
					$input.val(text);
				} else {
					$input.text(text);
				}
			}
		},
		dropdownSelectItemClear: function(dropDown) { //清空选中项
			var _this = this,
				$dropdown = $(dropDown),
				$input = $dropdown.find('.input-select-text'),
				$item = $dropdown.find('.hz-select-option:eq(0)'),
				val = $item.data('value') === undefined ? ($item.attr('value') === undefined ? $item.attr('text') : $item.attr('value')) : $item.data('value'),
				attributeId=$item.attr('data-attributeid');
				if(attributeId===_this.ATTR_ID_CREDENTIALSTYPE||$dropdown.hasClass('beneficiarytype-select')){
					_this.dropdownSelectItem(dropDown, val);
				}else{
					$dropdown.data('value', '').attr('value', '');
					$input.text('请选择');
					$dropdown.find('.hz-select-option-selected').removeClass('hz-select-option-selected');
				}
		},
		eventIDCard: function(select) { //选择身份证
			var _this = this,
				$select = $(select),
				moduleId = $select.data('moduleid'),
				$parent = $select.parents('.credentials-form'),
				attributeId = $select.data('attributeid'),
				$sex = $parent.find('[data-moduleid=' + moduleId + '][data-attributeid=' + _this.ATTR_ID_SEX + ']').parents('.field-row'),
				$birthdate = $parent.find('[data-moduleid=' + moduleId + '][data-attributeid=' + this.ATTR_ID_BIRTHDATE + ']').parents('.field-row'),
				$cardNum = $parent.find('[data-moduleid=' + moduleId + '][data-attributeid=' + this.ATTR_ID_CREDENTIALSINPUT + ']');

			if (_this.ATTR_ID_CREDENTIALSTYPE === attributeId) { //如果是证件类型
				if ($select.data('value') === 1) {
					$sex.hide();
					$birthdate.hide();
				} else {
					$sex.show();
					$birthdate.show();
				}
				if ($cardNum.val()) {
					$cardNum.trigger('blur');
				}
			}

		},
		eventSubmit: function() {
			var _this = this;
			_this.submitStatus = true;
			_this.el.on('click', '.submit-button', function() {

					_this.submitStatus = _this.validateAll(); //校验所有表单

					if (_this.submitStatus) {
						if (!_this.validateTeam()) {
							_this.submitStatus = false;
							_this.logRed('团单校验没通过');
						}
					}
					if (_this.submitStatus && _this.isTeamInsurant && _this.teamNum < _this.minPeople) {
						_this.showTeamError({
							type: 'min'
						});
						_this.submitStatus = false;
						_this.logRed('团单最小人数校验没通过');
					}
					//是否在合法范围
					if (_this.submitStatus && !_this.validateInsureDate()) {
						_this.submitStatus = false;
						_this.logRed('日期范围校验没通过');

					}
					//团单重复项验证
					if (_this.submitStatus && _this.validateDuplicate().number) {
						_this.logRed('团单重复项验证没通过');
						_this.submitStatus = false;
						return;
					}

					if (_this.submitStatus && !_this.isTeamInsurant) {
						if (!_this.validateInsureAge()) { //校验投保人为成年人
							_this.submitStatus = false;
						}
					}

					if (_this.submitStatus && !_this.isTeamInsurant) {
						if (!_this.validateInsurantNum()) { //验证被保险人的数量
							_this.submitStatus = false;
						}
					}

					if (_this.submitStatus && _this.toInt(_this.data.product.isInsurantAdult) === 1) {
						if (!_this.validateInsurantAdult()) { //验证被保险人为成年人，是否限制投保人只能为本人
							_this.submitStatus = false;
						}
					}

					if (_this.submitStatus && _this.toInt(_this.data.product.isInsurantJuveniles) === 1&&!_this.isSelf) {
						if (!_this.validateInsurantJuveniles()) { //被保险人为未成年人，是否限制投保人只能为其父母或法定监护人
							_this.submitStatus = false;
						}
					}

					if (_this.submitStatus && !_this.validateBeneficiary()) { //受益人校验
						_this.submitStatus = false;
					}
					if (_this.submitStatus && !_this.validateDestination()) { //校验出行目的地
						_this.submitStatus = false;
					}
					if (!_this.validateHighPremium()) {
						_this.submitStatus = false;
						return;
					}
					if (!$('#clauseInfo').hasClass('hz-check-item-checked')) {
						_this.logRed('请选择同意条款');
						$('.clause-insure-tips').text(($('#clauseInfo').data('errorremind') || ''));
						_this.submitStatus = false;
						return;
					}
					//验证约束
					if (!_this.getREstrictStatus()) {

						return;
					}
					if (_this.submitStatus) {
						_this.checkLogin(_this.submit);
					}
				})
				.on("click", "#saveInsureToCar", function() { //保存到购物车
					_this.saveShopCar = true;
					_this.submitStatus = _this.validateAll(null, null, true); //校验所有表单

					//是否在合法范围
					if (!_this.validateInsureDate()) {
						_this.submitStatus = false;
					}
					if (_this.submitStatus) {
						if (!_this.validateTeam()) {
							_this.submitStatus = false;
							_this.logRed('团单校验没通过');
						}
					}
					if (_this.submitStatus && _this.isTeamInsurant && _this.teamNum < _this.minPeople) {
						_this.submitStatus = false;
						_this.logRed('团单最小人数校验没通过');
					}
					//是否在合法范围
					if (_this.submitStatus && !_this.validateInsureDate()) {
						_this.submitStatus = false;
						_this.logRed('日期范围校验没通过');
					}
					//团单重复项验证
					if (_this.submitStatus && _this.validateDuplicate().number) {
						_this.logRed('团单重复项验证没通过');
						_this.submitStatus = false;
					}
					if (_this.submitStatus && !_this.validateBeneficiary()) { //受益人校验
						_this.submitStatus = false;
					}
					if (_this.submitStatus && !_this.validateDestination()) { //校验出行目的地
						_this.submitStatus = false;
					}
					if (!$('#clauseInfo').hasClass('hz-check-item-checked')) {//同意条款校验
						_this.submitStatus = false;
					}
					_this.saveShopCar = false;
					_this.checkLogin(_this.saveToShopCar);
				});
		},

		/*
		 * ==================== 职业相关处理  start ====================
		 */

		getFirstJob: function(warp, onCallback) {
			var _this = this,
				$warp = warp || _this.el,
				firstJobDataOptions = _this.firstJobDataOptions,
				callback = onCallback || function() {};
			var $jobLevel1 = $warp.find('.job-level[data-attributeid="' + _this.ATTR_ID_JOB + '"]');
			$.each($jobLevel1, function(i, item) {
				if ($(this).find('.hz-select-option').length <= 1) {
					_this.resetSelect($jobLevel1, firstJobDataOptions);
				}
			});
			callback.call(this);
			// body...
		},
		getJobData: function(options) { //获取职业数据
			var _this = this;
			var ops = options || {};
			var obj = {
				productId: _this.baseProductId,
				companyJobParentId: ops.companyJobParentId || 0
			};
			_this.jsonp(_this.getJobUrl, obj, function(data) {
				var options = [];
				var result = data.data || [];
				$.each(result, function(i, item) {
					options.push('<li class="hz-select-option"   value="' + item.id + '" id="' + item.id + '" code="' + item.code + '" text="' + item.name + '" level="' + item.level + '">' + item.name + '</li>');
				});
				if (ops.callback) {
					ops.callback(options, data);
				}
			});
		},
		jobTips: function(callback) { //不在承保职业内提示
			var _this = this;
			layer.closeAll();
			layer.open({
				skin: 'huize-layer',
				type: 1,
				title: _this.TEXT_DIALOG_TITLE_DEFAULT, //skin: false, //样式类名//closeBtn: false, //不显示关闭按钮
				shift: 2,
				btn: ['确定'],
				area: ['350px'],
				yes: function(index) {
					layer.close(index);
					if (callback) {
						callback();
					}
				},
				cancel: function() {
					if (callback) {
						callback();
					}
				},
				shadeClose: true, //开启遮罩关闭
				content: '<div style="padding:20px;">' + this.TEXT_JOBTIPS + '</div>'
			});
		},
		changeJob: function(input, onCallback) { // 职业变更
			var _this = this,
				$this = $(input),
				val = $this.val(),
				job = _this.toInt($this.attr('job')),
				$next = $this.nextAll('[job="' + job + '"]'),
				$job1 = $this.parent().find('[job="1"]'), //职业1
				$job2 = $this.parent().find('[job="2"]'), //职业2
				$job3 = $this.parent().find('[job="3"]'), //职业3
				$selectedOption = $this.find('.hz-select-option.hz-select-option-selected'), //获取选择项的属性

				$jobText = $this.nextAll('input[name="jobText"]'),
				$jobId = $this.nextAll('input[name="jobId"]'),
				$jobNum = $this.nextAll('input[name="jobNum"]'),
				$jobLevel = $this.nextAll('input[name="jobLevel"]'),

				callback = onCallback || function() {},

				jobText, //职业文本
				jobId, //职业ID
				jobNum, //职业Code
				jobLevel; //职业等级

			function clearValue() {
				$jobText.val('');
				$jobId.val('');
				$jobNum.val('');
				$jobLevel.val('');
			}

			clearValue();

			$this.data('jobText', $selectedOption.attr('text'));
			$this.data('jobId', $selectedOption.attr('id'));
			$this.data('jobNum', $selectedOption.attr('code'));
			$this.data('jobLevel', $selectedOption.attr('level'));

			if (job === 1) {
				_this.resetSelect($job2);
				_this.resetSelect($job3);
				$job2.hide();
				$job3.hide();
			} else if (job === 2) {
				_this.resetSelect($job3);
				$job3.hide();
			}

			if (!val || val === '请选择') {
				return;
			}
			_this.getJobData({
				companyJobParentId: val,
				callback: function(data) {
					if (job === 1) {
						_this.resetSelect($job2, data);
						callback();
						$job2.show().data('required', 1);
					} else if (job === 2) {

						if (data.length) {
							_this.resetSelect($job3, data);
							$job3.show().data('required', 1);
							callback();
						} else {
							$job3.hide();
							jobText = $job1.data('jobText') + '-' + $job2.data('jobText');
							jobId = $job1.data('jobId') + '-' + $job2.data('jobId');
							jobNum = ($job1.data('jobNum') ? $job1.data('jobNum') + '-' : '') + ($job2.data('jobNum') ? $job2.data('jobNum') : '');
							jobLevel = $job1.data('jobLevel') || $job2.data('jobLevel') || $job3.data('jobLevel');

							$jobText.val(jobText);
							$jobId.val(jobId);
							$jobNum.val(jobNum);
							$jobLevel.val(jobLevel);

							if (_this.data.product.jobGrade.indexOf(jobLevel) === -1) {
								_this.jobTips(function() {
									$job2.hide();
									$job3.hide();
									$job1.val('');
									$job2.val('');
									$job3.val('');
									_this.validate($job1);
									_this.resetSelect($job2);
									_this.resetSelect($job3);
									clearValue();
								});

							}
						}
					} else if (job === 3) {
						callback();
						jobText = $job1.data('jobText') + '-' + $job2.data('jobText') + '-' + $job3.data('jobText');
						jobId = $job1.data('jobId') + '-' + $job2.data('jobId') + '-' + $job3.data('jobId');
						jobNum = ($job1.data('jobNum') ? $job1.data('jobNum') + '-' : '') + ($job2.data('jobNum') ? $job2.data('jobNum') + '-' : '') + $job3.data('jobNum');
						jobLevel = $job1.data('jobLevel') || $job2.data('jobLevel') || $job3.data('jobLevel');

						$jobText.val(jobText);
						$jobId.val(jobId);
						$jobNum.val(jobNum);
						$jobLevel.val(jobLevel);

						if (_this.data.product.jobGrade.indexOf(jobLevel) === -1) {
							_this.jobTips(function() {
								$job2.hide();
								$job3.hide();
								$job1.val('');
								$job2.val('');
								$job3.val('');
								_this.validate($job1);
								_this.resetSelect($job2);
								_this.resetSelect($job3);
								clearValue();
							});

						}
					}
				}
			});
		},
		dynamicSettingJob: function(input, myJobId) { //动态设置职业-常用投保人
			var _this = this,
				$job1 = $(input),
				$job2 = $job1.nextAll('.hz-dropdown').eq(0),
				$job3 = $job1.nextAll('.hz-dropdown').eq(1),
				$parent = $job1.parents('.credentials-form'),
				jobId = myJobId || '',
				jobIdArr = jobId.split('-'),
				$jobId, $jobText, $jobNum; //Job Id Job Text Job Number
			$job1.val('');
			$job2.val('').hide();
			$job3.val('').hide();
			if (!jobIdArr.length || !$job1.length) {
				return;
			}
			if ($job1.find('.hz-select-option').length <= 1) { //如果没有一级没有加载完成，则延迟执行
				_this.getFirstJob($parent, function() {
					_this.dynamicSettingJob(input, provCityId);
				});
				return;
			}

			if (!$job1.find('.hz-select-option[value="' + jobIdArr[0] + '"]').length) {
				return;
			}
			//$job1.val(jobIdArr[0]);
			_this.setDropdownSelectValue($job1, jobIdArr[0]);
			//_this.validate($job1);
			_this.changeJob($job1, function() {
				if (!$job2.find('.hz-select-option[value="' + jobIdArr[1] + '"]').length) {
					return;
				}
				_this.setDropdownSelectValue($job2, jobIdArr[1]);

				//_this.validate($job2);

				if (jobIdArr <= 2) {
					$job3.hide();
					return;
				}
				_this.changeJob($job2, function() {
					if (!$job3.find('.hz-select-option[value="' + jobIdArr[2] + '"]').length) {
						return;
					}
					_this.setDropdownSelectValue($job3, jobIdArr[2]);

					_this.changeJob($job3);
					//_this.validate($job3);

				});
			});
		},
		setJuvenilesJob: function(input) { //未成年人设置默认职业
			var _this = this,
				$input = $(input),
				birthDate = $input.val(),
				$warp = $input.parents('.credentials-form'),
				$jobInput = $warp.find('[data-attributeid=' + _this.ATTR_ID_JOB + ']').eq(0),
				juvenilesJobId = _this.product.juvenilesJobFullId,
				age;
			age = _this.getFullAge({
				select: birthDate
			});
			if (juvenilesJobId && age < 18) { //未成年
				$jobInput.parents('.field-row').hide();
				_this.dynamicSettingJob($jobInput, juvenilesJobId);
			} else {
				$jobInput.parents('.field-row').show();
			}
		},

		/*
		 *==================== 添加多名被保险人 start ====================
		 */
		// setCount: function() {
		// 	$('.insure-input[name*="buyCount"]').val(this.genes.buyCount);
		// },
		addTable: function() { //添加多名被保险人
			var _this = this,
				$form,
				length;
			$.each(this.data.modules, function(i, item) {
				if (item.id === 20) {
					_this.addMoreBox.append(_this.addMoreTable(item));
					_this.setAreaData();
					//_this.addFirst(_this.insurantIndex);
					// _this.addContacts(_this.contactsData);
				}
			});
			this.setTableIndex();
			this.setDeleteStatus(_this.addMoreBox, _this.TEXT_DELETED_TYPE_INSURANT);
			//_this.setCount();
			$form = _this.addMoreBox.find('.credentials-form.insurant-item-form');
			length = $form.length;

			_this.initCalendar($form.eq(length - 1)); //初始化日期控件
			_this.eventCheckbox($form.eq(length - 1)); //checkbox初始化
			_this.eventRadio($form.eq(length - 1)); //Radio初始化

			_this.getFirstInsureArea($form.eq(length - 1)); //获取投保地区的第一级
			_this.getAllArea($form.eq(length - 1)); //获取所有地区 
			_this.getFirstJob($form.eq(length - 1)); //获取一级职业

			_this.defaultRestrict($form.eq(length - 1)); //默认约束

			_this.setGeneralRestrictsItem(); //标准约束项

			_this.setTrialItem($form.eq(length - 1)); //设置试算项

			_this.initBeneficiaryType($form.eq(length - 1)); //受益人类型设置默认值

			_this.defaultSelectIdCard($form.eq(length - 1));
			$.each($form.eq(length - 1).find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_BIRTHDATE + ']'), function(i, item) {
				if ($(item).val()) {
					$(item).trigger('blur');
				}
			});
		},
		formIndex: 0,
		addMoreTable: function(item) { //添加多名被保险人
			var _this = this;
			var result = [];
			_this.formIndex++;
			_this.insurantIndex++;

			result.push('<div class="person-write-info more-insure"  sort="' + _this.formIndex + '">');
			result.push('<div class="form-more credentials-form insurant-item-form" data-type="more" data-index="' + _this.formIndex + '">');
			result.push('<div class="info-title"><a href="javascript:;" title="删除" data-type="more" class="fr iconfont  del delete">&#xe70a;</a>第<span class="table-index"></span>名被保人</div>');
			result.push(_this.renderTable(item, false));
			result.push(_this.renderBeneficiaryModule(_this.insurantIndex));
			result.push('<div class="saveContract mb10"><label class="label-item vis-hide">保存为常用联系人</label>');
			result.push('<div class="hz-check-item hz-check-item-checked inline-block"  rel="checkbox"> <i class="hz-check-icon"></i>');
			result.push('<input class="insure-checkbox fn-hide" type="checkbox" name="chkSaveInsure" id="chkSaveInsure-' + item.id + '-' + _this.formIndex + '"  data-moduleid="' + item.id + '" class="insure-label" value="1" checked />');
			// result.push('<i class="hz-check-icon"></i>')
			result.push('<label class="hz-check-text f12 fc6 ml5" for="chkSaveInsure-' + item.id + '-' + _this.formIndex + '">保存为常用联系人</label>');
			result.push('</div>');
			result.push('</div>');
			result.push('</div>');
			result.push('</div>');

			return result.join('');
		},
		setTableIndex: function() { //设置第几个被保险人
			this.el.find('.table-index').each(function(i, item) {
				$(this).text(i + 1);
			});
		},
		setDeleteStatus: function($id, dataType) { //设置删除多名投保人删除按钮状态
			var $del = $id.find('.del[data-type=' + dataType + ']');
			var length = $del.length;
			if (length === 1) {
				$del.hide();
			} else {
				$del.show();
			}
		},
		removeMoreTable: function(node) { //删除多名被保险人
			$(node).parents('.more-insure').remove();
			this.setTableIndex();
			this.setDeleteStatus(this.addMoreBox, this.TEXT_DELETED_TYPE_INSURANT);
			this.trialChange();
		},

		/*
		 **==================== 为谁投保关系处理 ====================
		 */

		initRelationSelect: function() { //为谁投保初始化
			var _this = this,
				result = [],
				insurantTypeArr = _this.insurantTypeArr,
				defaultRelation = _this.defaultInsureInsurantRelation,
				tranfromRelations = [];
			if (!defaultRelation && insurantTypeArr[0] !== '1') {
				$('#forrelationtype').parents('.field-item').addClass('fn-hide');
				$("#module-20").find('[data-insuranttype="myself"]').hide();
			} else {
				if (insurantTypeArr[2] !== '1' && insurantTypeArr[3] !== '1' && insurantTypeArr[1] === '1') { //被保险人为其他时候
					tranfromRelations = _this.tranfromRelations(defaultRelation);
					tranfromRelations.forEach(function(val, i) {
						result.push('<li class="hz-select-option"  value="' + val.controlValue + '" text="' + val.value + '"> ' + val.value + '</li>');
					});
					$("#module-20").find('[data-insuranttype="myself"]').hide();

				} else if (insurantTypeArr[0] === '1' && insurantTypeArr[1] !== '1' && insurantTypeArr[2] !== '1' && insurantTypeArr[3] !== '1') { //被保险人只是本人的时候
					result.push('<li class="hz-select-option" value=' + _this.SELFRELATIONTYPE + ' text="本人">本人</li>');
					$('#module-10 .saveContract').hide();
				}
				$('#forrelationtype .hz-dropdown-menu').append(result.join(''));
			}
		},
		tranfromRelations: function(relations) { //关系转换
			var _this = this,
				tranfromRelations = [];
			relations.forEach(function(val, i) {
				var isExist = false;
				_this.RELATIONMAP.forEach(function(item, j) {
					if (val.controlValue === item.defaultValue) { //如果匹配到需要转换的关系
						tranfromRelations = tranfromRelations.concat(item.transRelation); //则添加转换后的关系
						isExist = true;
					}
				});
				if (!isExist) {
					tranfromRelations.push(val); //如果未匹配到需要转换的关系，则直接添加该关系到不需要转换列表
				}
			});

			var tempRelationShips = [];
			tranfromRelations.forEach(function(val, j) {
				var repeat = false;
				for (var i = 0; i < tempRelationShips.length; i++) {
					if (tempRelationShips[i].controlValue === val.controlValue) {
						repeat = true;
						break;
					}
				}
				if (!repeat) {
					tempRelationShips.push(val);
				}
			});
			tranfromRelations = tempRelationShips;

			return tranfromRelations;
		},
		getTransfromRelations: function(relationType, sex) { //保存保单的时候还原关系
			var _this = this,
				trelationType = relationType;
			_this.RELATIONMAP.forEach(function(item, j) {
				if (relationType === item.defaultValue) { //如果匹配到需要转换的关系
					if (item.transRelation.length > 1 && !sex) {
						trelationType = item.transRelation[1].controlValue;
					} else {
						trelationType = item.transRelation[0].controlValue;
					}
				}
			});
			return trelationType;
		},
		relationChange: function(select) { //关系改变时
			var _this = this,
				$select = $(select);
			// if ($select.data('value') === _this.SELFRELATIONTYPE) { //本人
			_this.syncInsureInfo(select);
			// }
		},
		syncInsureInfo: function(input) { //当多名被保险选“本人”时，将投保人信息同步过来
			var _this = this,
				$this = $(input),
				valInput = _this.toInt($this.val()),
				$parent = $this.parents('.insurant-item-form'),
				jobIdArr = [],
				proviceLivingArr = [], //省市
				provicePropertyArr = [], //财产
				cardArr = [], //证件有效期
				$form = _this.insureModules.find('.insure-form:visible'),
				length = $form.length;

			$form.each(function(i) {
				var name = $(this).attr('name') || '',
					val = $(this).val() || $(this).attr('value'),
					$insuredInput,
					_name = name.replace(_this.regReplaceNum, ''),
					attributeid = _this.toInt($(this).data('attributeid'));
				if (_name.indexOf('job') !== -1) {
					jobIdArr.push(val);
				}
				if (attributeid === _this.ATTR_ID_AREA_LIVING) { //居住省市
					proviceLivingArr.push(val);
				}
				if (attributeid === _this.ATTR_ID_AREA_PROPERTY) { //财产
					provicePropertyArr.push(val);
				}

				// 如果选择本人
				if (valInput === _this.SELFRELATIONTYPE) {
					if ($(this).hasClass('hz-radio-item')) {
						if ($(this).hasClass('hz-radio-item-checked')) {
							_name = _name.split('-')[0];
							$insuredInput = $parent.find('[name^="' + _name + '"][value="' + val + '"]');
							$insuredInput.click();
						}
					} else if ($(this).hasClass('hz-dropdown')) {
						_this.dropdownSelectItem($parent.find('[name^="' + _name + '"][data-moduleid=20]:visible'), val);
					} else {
						$insuredInput = $parent.find('[name^="' + _name + '"][data-moduleid=20]:visible');
						if (_name.indexOf('UserInfo') !== -1) {
							$insuredInput = $parent.find('[name^="UserInfo"]:visible');
						}
						$insuredInput.val(val);
					}
					if (_name === 'cardPeriod' && val) {
						cardArr.push(val);
					}
					if (_name === 'cardPeriodEnd' && val) {
						cardArr.push(val);
					}

					if (i === length - 1) {
						_this.dynamicSettingArea($parent.find('.select-area[data-attributeid="' + _this.ATTR_ID_AREA_LIVING + '"]').eq(0), proviceLivingArr.join('-'));
						_this.dynamicSettingArea($parent.find('.select-area[data-attributeid="' + _this.ATTR_ID_AREA_PROPERTY + '"]').eq(0), provicePropertyArr.join('-'));
						_this.dynamicSettingJob($parent.find('.job-level').eq(0), jobIdArr.join('-'));
						_this.setCardInfo($parent, cardArr);
					}
				} else {
					// 如果改变之前的关系是本人，则清空
					// if (_this.oldValue === 1 && $(this).attr('type') !== 'radio') {
					// 	var $item = $parent.find('[name*="' + _name + '"]:visible');
					// 	$item.val('');
					// 	_this.validate($item);
					// 	if (i === length - 1) {
					// 		_this.dynamicSettingArea($parent.find('.select-area[data-attributeid="' + _this.ATTR_ID_AREA_LIVING + '"]').eq(0), '');
					// 		_this.dynamicSettingArea($parent.find('.select-area[data-attributeid="' + _this.ATTR_ID_AREA_PROPERTY + '"]').eq(0), '');
					// 		_this.dynamicSettingJob($parent.find('.select-job').eq(0), '');
					// 		_this.setCardInfo($parent, '');
					// 	}
					// }
				}
				_this.validate($insuredInput);
			});
			_this.autoSetIdInfo($parent.find('.id-card-input'));
			_this.validateInsuredSameCardInfo($parent.find('.id-card-input'));
		},
		setCardInfo: function($wrap, valueArr) { //设置证件有效期
			var valArr = valueArr || [],
				$checkbox = $wrap.find('.credentials-validity'),
				$startDate = $wrap.find('.insure-calendar[name*=cardPeriod]'),
				$endDate = $wrap.find('.insure-calendar[name*=cardPeriodEnd]');
			if (valArr.length === 0) {
				$checkbox.attr('checked', false);
				$startDate.val('').show();
				$endDate.val('').show();
			} else if (valArr.length === 1) {
				$checkbox.attr('checked', true);
				$startDate.val(valArr[0]).show();
				$endDate.val('').hide();
			} else if (valArr.length === 2) {
				$checkbox.attr('checked', false);
				$startDate.val(valArr[0]).show();
				$endDate.val(valArr[1]).show();
			}
			$checkbox.change();
			this.validate($startDate);
			this.validate($endDate);
		},
		isSelf: false, //当前是否是选中本人
		forrelationChange: function(select) { //为谁投保
			var _this = this,
				$this = $(select),
				valSelect = _this.toInt($this.val()),
				insurecardType = $('#module-10  [data-attributeid=' + _this.ATTR_ID_CREDENTIALSINPUT + ']'),
				insureBirthdate = $('#module-10 [data-attributeid=' + _this.ATTR_ID_BIRTHDATE + ']');
			if (valSelect === _this.SELFRELATIONTYPE) { //为本人投保
				$('#module-20  [data-insuranttype="myself"]').show();
				$('#module-20  [data-insuranttype="others"]').hide();
				$('#module-10 .saveContract').hide();
				_this.isSelf = true;
				_this.selfDefaultRestrict();
				_this.validateInsureAge();
				_this.trialChange();
				$('#module-10 .info-title').html('您的信息');
				$('#module-10.person-write-info').addClass('pb0');
				$('#module-20 .person-write-info').addClass('pt0');
				if (insurecardType.val()) {
					insurecardType.trigger('blur');
				}
				if (insureBirthdate.val()) {
					insureBirthdate.trigger('blur');
				}
			} else {
				$('#module-20  [data-insuranttype="myself"]').hide();
				$('#module-20  [data-insuranttype="others"]').show();
				$('#module-10 .saveContract').show();
				_this.isSelf = false;
				_this.restSelfDefaultRestrict();
				_this.validateInsureAge();
				_this.trialChange();
				$('#module-10 .info-title').html('投保人信息');
				$('#module-10.person-write-info').removeClass('pb0');
				$('#module-20 .person-write-info').removeClass('pt0');
				if (insurecardType.val()) {
					insurecardType.trigger('blur');
				}
				if (insureBirthdate.val()) {
					insureBirthdate.trigger('blur');
				}
			}
		},
		defaultSelectSelf: function() { //能选择本人时候默认选择本人
			var _this = this,
				insurantTypeArr = _this.insurantTypeArr,
				$forrelation = $('#forrelationtype');
			// if (insurantTypeArr[0] === '1' && insurantTypeArr[1] !== '1' && insurantTypeArr[2] !== '1' && insurantTypeArr[3] !== '1') { //只有本人的时候
			if ($forrelation.find('.hz-select-option[value=' + _this.SELFRELATIONTYPE + ']').length > 0) {
				_this.dropdownSelectItem($forrelation, _this.SELFRELATIONTYPE);
				$.each(_this.ruleParam.genes, function(i, item) { //带入产品详情页面的试算信息
					if (item.key) {
						switch (item.key) {
							case _this.SEXKEY: //性别
								// item.value;
								var sexRadios = $('[data-moduleid=10][data-attributeid=' + _this.ATTR_ID_SEX + ']');
								$.each(sexRadios, function() {
									if (item.value.indexOf($(this).find('.hz-radio-text').text()) > -1) {
										$(this).click();
									}
								});
								break;
							case _this.INSURANTDATEKEY: //出生日期
								if (item.value.split('-').length > 2) { //只带入 year-moth-day ，不带入1-80周岁
									$('[data-moduleid=10][data-attributeid=' + _this.ATTR_ID_BIRTHDATE + ']').val(item.value);
								}
								// item.value;
								break;
						}
					}
				});
				_this.trialChange();
			}
			//}
		},

		/*
		 * ==================== 起保日期  start ====================
		 */
		getFixedDateValue: function() {
			var date = $('.fixed-date').val();
			if (!date) {
				date = this.startDate.minDate;
			}
			return date;
		},
		setStartDate: function(callback) { //设置起保日期范围
			var _this = this,
				date = 0;
			//如果超过指定当天的时间，则第二天才能起保
			_this.jsonp(_this.getInsureTimeUrl, {
				baseProductId: _this.baseProductId
			}, function(data) {
				date = data.result;
			}, false);
			_this.startDate = {
				maxDate: _this.createDate({
					date: _this.product.latestDate
				}),
				minDate: _this.createDate({
					date: _this.product.firstDate + date
				})
			};
			if (callback) {
				callback();
			}
		},

		/*
		 * ==================== 投保申明  start ====================
		 */
		showDeclare: function() {
			var _this = this,
				insureDeclare = _this.product.insureDeclare || _this.TEXT_DEFAULT_DECLARE,
				_content;
			insureDeclare = insureDeclare.replace('#ProductClauseUrl#', _this.clauseUrl);
			_content = '<div class="insure-des-dialog p20 f12">' + insureDeclare + '</div>';
			Layer.open({
				type: 1,
				shift: 2,
				title: "投保申明",
				area: ['870px', '450px'],
				shadeClose: true, //开启遮罩关闭
				content: _content
			});
		},

		/*
		 * ====================紧急联系人============================
		 */
		urgencyToggle: function() {
			var _this = this,
				$urgencyTitle = _this.el.find('.urgency-toggle'),
				$urgencyContent = $("#urgencyContent");
			$urgencyTitle.toggleClass('urgency-show');
			if ($urgencyTitle.hasClass('urgency-show')) {
				$urgencyTitle.find('.iconfont').html('&#xe712;');
				$urgencyContent.show();
			} else {
				$urgencyTitle.find('.iconfont').html('&#xe711;');
				$urgencyContent.hide();
			}
		},
		checkLogin: function(callback) { //校验是否登录
			var _this = this;
			helper.state.checkLogin(function(result) {
				if (result.result) {
					callback.apply(_this);
				} else {
					requirejs(["sign-float"], function(signFloat) {
						var sign = new signFloat({
							//returnUrl: location.href,
							showRegister: true,
							callback: function(loginData) { //登录成功回调
								layer.closeAll();
								callback.apply(_this);
							}
						});
					});
				}
			});
		},

	};
	return InsureEvent;
});