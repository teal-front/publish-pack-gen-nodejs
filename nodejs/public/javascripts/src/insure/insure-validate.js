define([
	'jquery'
], function(
	$
) {
	'use strict';

	/*
	 * @constructor InsureValidate
	 * @author 
	 * @version 0.0.1
	 * @description 验证模块
	 */

	var InsureValidate = function() {};

	InsureValidate.prototype = {
		validateStatus: true, //校验初始状态
		validate: function(input, success, error) { //校验每一项
			var _this = this,
				status = true,
				$input = $(input),
				name = $input.data('name'),
				val = $.trim($input.val()).replace(/\s+/g, ' '),
				formName = $input.attr('name'),
				regex = $input.data('regex'),
				reg = new RegExp(regex, 'ig'),
				isOk = reg.test(val),
				required = _this.toInt($input.data('required'));
			if (formName === 'cName') {
				val = val.replace(/\s+/g, '');
			}
			if ($input.attr('type') === 'text') {
				$input.val(val);
			}
			if ($input.hasClass('hz-dropdown')) { //下拉框
				val = $input.data('value') === undefined ? '' : $input.data('value');
				val = val === '请选择' ? '' : val;
				if ($input.find('.hz-select-option-selected').text() === '请选择') {
					val = '';
				}
			}
			if (required) { //必填
				if ($input.is(':radio') || $input.hasClass('hz-radio-item')) {
					if (!_this.validateRadio(formName)) {
						$input.attr('data-errorremind', '请选择');
						status = false;
					}
				} else if ($(input).hasClass('hz-check-item')) {
					if (!$(input).hasClass('hz-check-item-checked') && $(input).attr('id') !== 'clauseInfo') {
						status = false;
						var $insureTips = $(input).find('.write-info-error');
						$insureTips.text(($(input).data('errorremind') || ''));
					}
				} else {
					if (!val && val !== 0 && val !== '0') {
						status = false;

					} else if (!isOk) {
						status = false;
					}
				}

			} else { //选填
				if (val && !isOk) {
					status = false;
				}
			}
			//校验通过回调
			if (success && status) {
				success.call(_this, this);
			}
			//校验失败回调
			if (error && !status) {
				error.call(_this, this);
			}


			if (status) {
				if (!success) { //没有回调的情况
					_this.hideError(input);
					_this.showSuccess(input);
				}
			} else {
				if (!error) { //没有回调的情况
					_this.hideSuccess(input);
					_this.showError(input);
				}
			}
			if ($(input).hasClass('id-card-input')) { // 证件号码验证
				if (!_this.validateCardInput(input) || !_this.validateInsuredSameCardInfo(input)) {
					status = false;
				}
			}
			if ($(input).hasClass('insure-calendar')) {
				var moduleid = _this.toInt($(input).data('moduleid')),
					attributeid = _this.toInt($(input).data('attributeid'));
				if (attributeid === _this.ATTR_ID_BIRTHDATE && moduleid === _this.MODULES_ID_INSURED) { //被保险人
					if (!_this.validateInsureDate(input)) {
						status = false;
					}
				} else if (attributeid === _this.ATTR_ID_BIRTHDATE && moduleid === _this.MODULES_ID_INSURE) { //投保人
					if (!_this.validateInsureAge()) {
						status = false;
					}
					if (_this.isSelf && (!_this.validateInsureDate(input))) {
						status = false;
					}
				} else if (attributeid === _this.ATTR_ID_CREDENTIALSVALIDITY) { //证件有效期
					var maxDate = $(input).attr('maxDate'),
						minDate = $(input).attr('minDate'),
						isOk = _this.dateDifference(minDate, val) >= 0 && _this.dateDifference(val, maxDate) >= 0;
					if (!isOk) {
						_this.hideSuccess(input);
						_this.showError(input, '');
						status = false;
					}
				}
			}

			if (status && $(input).hasClass('buycount')) {
				if (val < _this.buyCountRange.min || val > _this.buyCountRange.max) {
					_this.hideSuccess(input);
					_this.showError(input, '同一被保人同一时间限购' + _this.buyCountRange.min + '-' + _this.buyCountRange.max + '份');
					status = false;
				}
			}

			if (status && $(input).hasClass('password')) {
				var $password = $('[name=password]'),
					$reconfimPassword = $('[name=reconfim-password]'),
					password = $password.val(),
					reconfimPassword = $reconfimPassword.val();
				if (password !== reconfimPassword) {
					_this.hideSuccess(input);
					_this.showError($reconfimPassword[0], '两次输入的密码不一致');
					status = false;
				}
			}

			if (status && (formName==="cName"||formName==="Lover")) { //恋爱险校验心上人姓名不能和投保人姓名一致
				var $Lover = $('[name=Lover]'),
					$cName = $('[name=cName][data-moduleid=10]'),
					Lover = $Lover.val(),
					cName = $cName.val();
				if (Lover===cName) {
					_this.hideSuccess(input);
					_this.showError($Lover, ' 投保人与心上人姓名不可以相同哦');
					status = false;
				}
			}

			// if (!status) {
			// 	_this.info(name, status);
			// }
			return status;
		},

		//校验所有 增加是否保存到购物车，必填字段可以为空
		validateAll: function(wrap, scrollTo, saveToShopCar) {
			var _this = this,

				//范围-如果没有指定范围就是整个模块，如果有指定范围就验资某个范围
				$wrap = wrap || _this.el,
				status = true,
				scrollStatus = false;
			$wrap.find('div > .form-item:visible').each(function() {
				if (!_this.validate(this, null, null, saveToShopCar)) {
					var isTeamItem = $(this).hasClass('insure-team-input');
					status = false;
					if (!scrollStatus) {
						scrollStatus = true;
						if (isTeamItem) {

							_this.scrollTo(_this.teamBody);

						} else {
							_this.scrollTo(this);
						}

					}
				}
			});

			try {

				var top = _this.teamBody.find('.input-text-error').eq(0).position().top;
				var height = _this.teamBody.height();
				var scrollHeight = _this.teamBody[0].scrollHeight;
				_this.info(top);
				_this.info(height);
				_this.info(scrollHeight);
				_this.teamBody.scrollTop(scrollHeight - 520 + top);

			} catch (ev) {}

			return status;
		},
		validateRadio: function(inputName) {
			var _this = this,
				name = inputName || '',
				status = false,
				$input = $('[name="' + name + '"]');
			$input.each(function() {
				if ($(this).hasClass('hz-radio-item-checked')) {
					status = true;
				}
			});
			return status;
		},
		__defaultIconHTML: '',
		__successIconHTML: '',
		//__errorIconHTML: '<i class="iconfont f18"></i>',
		__errorIconHTML: '',
		showError: function(input, errText) { //显示错误信息

			var _this = this,
				$input = $(input),
				$tips = $input.nextAll('.insure-tips'),
				text = errText || $input.data('errorremind') || '';
			if (_this.saveShopCar) { //如果是保存至购物车则不显示
				return;
			}
			$input.addClass('input-text-error');
			$tips.addClass('write-info-error').html(_this.__errorIconHTML + text).removeClass('write-info-success');
		},
		hideError: function(input) { //隐藏错误信息
			var _this = this,
				$input = $(input),
				$tips = $input.nextAll('.insure-tips');
			$input.removeClass('input-text-error');
			$tips.removeClass('write-info-error').html('');
		},
		showSuccess: function(input) { //显示成功信息
			var _this = this,
				$input = $(input),
				$tips = $input.nextAll('.insure-tips');
			$input.addClass('input-text-success');
			$tips.addClass('write-info-success').html('');
		},
		hideSuccess: function(input) { //隐藏成功信息
			var _this = this,
				$input = $(input),
				$tips = $input.nextAll('.insure-tips');
			$input.removeClass('input-text-success');
			$tips.removeClass('write-info-success').html('');
		},
		showDefault: function(input, newText) { //显示默认信息
			var _this = this;
			var text = newText || $(input).data('defaultremind') || '';
			var $tips = $(input).nextAll('.insure-tips').eq(0);
			var isRadio = $(input).is(':radio');
			if (!isRadio) {
				$(input).addClass('insure-info');
			}
			$tips.addClass('write-info-default').html(_this.__defaultIconHTML + text);
		},
		hideDefault: function() { //隐藏默认信息
			var tips = $(this).nextAll('.insure-tips').eq(0);
			$(this).removeClass('insure-info');
			tips
				.html('')
				.removeClass('insure-tips-info');
		},
		fixedInfo: function($input, text) { //只读取时，而且不触发显示文字
			$input.show().nextAll('.insure-tips').addClass('write-info-default').text(text);
		},

		/*
		 * ==================== 身份证验证 ====================
		 */
		getSex: function(idCard) { //获取身份证性别
			idCard=idCard.trim();
			if (parseInt(idCard.substr(16, 1)) % 2 == 1) {
				return 1;
			} else {
				return 0;
			}
		},
		getIdDate: function(idCard) { //获取身份证出生日期
			idCard=idCard.trim();
			if (this.identityCodeValid(idCard)) {
				return idCard.slice(6, 10) + '-' + idCard.slice(10, 12) + '-' + idCard.slice(12, 14);
			}
			return '';
		},
		validateCardInput: function(input) { //证件类型
			var _this = this,
				// 获取证件类型下拉列表
				cardTypeSelect = $(input).parents('.credentials-form').find('.credentials'),
				regexJson = _this.data.cardNumRegexJson || [],
				remindJson = _this.data.cardNumRemindJson || [],
				typeValue = ~~cardTypeSelect.val(),
				regex = regexJson[typeValue] || '^[\\w \\(\\)-]{8,30}$', // 如果没有数据，采用默认值
				remind = remindJson[typeValue] || '证件号码校验失败：不是有效的证件号码，请核对后重新确认',
				val, reg;
			$(input).data('errorRemind', remind);
			val = $.trim($(input).val());
			if (!val) {
				return false;
			}
			reg = new RegExp(regex, 'ig');
			if (!reg.test(val)) {
				_this.hideSuccess(input);
				_this.showError(input);

				return false;
			}
			// 身份证
			if (typeValue === 1) {
				if (!_this.identityCodeValid(val)) {
					_this.hideSuccess(input);
					_this.showError(input);
					return false;
				}
				if (!this.identityValueValid(input)) { //校验性别和出生日期是否能够带入
					return false;
				}
			}
			_this.hideError(input);
			_this.showSuccess(input);
			return true;
		},
		identityCodeValid: function(code) { //身份证校验	

			var num = $.trim(code);
			var Y, JYM;
			var S, M, ereg;
			var idcard_array = new Array();
			idcard_array = num.split("");

			//基本检验
			if (!num) {
				return false;
			}
			//地区检验 
			// if (this.city[parseInt(num.substr(0, 2))] == null) {
			// 	return false;
			// }
			if (num == '111111111111111') {
				return false;
			}
			if (parseInt(num.substr(6, 4)) % 4 == 0 || (parseInt(num.substr(6, 4)) % 100 == 0 && parseInt(num.substr(6, 4)) % 4 == 0)) {
				ereg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/; //闰年出生日期的合法性正则表达式   
			} else {
				ereg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/; //平年出生日期的合法性正则表达式   
			}
			if (ereg.test(num)) { //测试出生日期的合法性   
				//计算校验位   
				S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10])) * 7 + (parseInt(idcard_array[1]) + parseInt(idcard_array[11])) * 9 + (parseInt(idcard_array[2]) + parseInt(idcard_array[12])) * 10 + (parseInt(idcard_array[3]) + parseInt(idcard_array[13])) * 5 + (parseInt(idcard_array[4]) + parseInt(idcard_array[14])) * 8 + (parseInt(idcard_array[5]) + parseInt(idcard_array[15])) * 4 + (parseInt(idcard_array[6]) + parseInt(idcard_array[16])) * 2 + parseInt(idcard_array[7]) * 1 + parseInt(idcard_array[8]) * 6 + parseInt(idcard_array[9]) * 3;
				Y = S % 11;
				M = "F";
				JYM = "10X98765432";
				M = JYM.substr(Y, 1);
				if (M == idcard_array[17].toUpperCase()) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
		identityValueValid: function(input) { //根据身份证值去校验出生日期和性别是否符合投保要求
			var _this = this,
				$this = $(input),
				val = $this.val(),
				sexValue = _this.getSex(val),
				dateValue = _this.getIdDate(val),
				moduleid = $this.data('moduleid'),
				age = _this.getFullAge({ //获取年龄
					nowDate: _this.getStartDateValue(),
					select: val
				}),
				status = true,
				dateMax = _this.getMaxDate(moduleid, _this.ATTR_ID_BIRTHDATE),
				dateMin = _this.getMinDate(moduleid, _this.ATTR_ID_BIRTHDATE),
				$parent = $this.parents('.credentials-form'),
				$sex = $parent.find('[data-moduleid="' + moduleid + '"][data-attributeid="' + _this.ATTR_ID_SEX + '"]:not(:disabled)'),
				errorText = '';

			if (_this.dateDifference(dateMin, dateValue) < 0 ||
				_this.dateDifference(dateValue, dateMax) < 0) {
				if (moduleid === _this.MODULES_ID_INSURE && age < 18) {
					errorText = _this.TEXT_INSURE_MIN_AGE;
				} else {
					errorText = '证件对应的年龄不符合投保要求！';
				}
				status = false;
			}
			if ($sex.hasClass('hz-radio-item')) {
				var isCanChecked = false;
				$sex.each(function(i, item) { //sex自动设置性别
					var _val = _this.toInt($(item).attr('value'));
					if (_val === sexValue) {
						isCanChecked = true;
					}
				});
				if (!isCanChecked) {
					errorText = '证件对应的性别不符合投保要求！';
					status = false;
				}
			}

			if (!status) {
				_this.hideSuccess(input);
				_this.showError(input, errorText);
			} else {
				_this.hideError(input);
				_this.showSuccess(input);
			}
			return status;
		},
		autoSetIdInfo: function(input, parent) { //根据身份证自动设置出生日期，性别 
			var _this = this,
				$this = $(input),
				$parent = parent ? $(parent) : $this.parents('.credentials-form'),
				$idCardInput = $parent.find('.id-card-input'),
				$cardTypeInput = $parent.find('.credentials'),
				cardTypeValue = ~~$cardTypeInput.val();
			// 如果是证件类型切换时，验证身份证；证件号码值改变时，此处不验证身份证，因为已经在绑定事件处验证过了
			if ($this.hasClass('credentials') && !_this.validateCardInput($idCardInput[0])) {
				return false;
			}

			if (cardTypeValue === 1) {
				var val = $idCardInput.val(),
					sexValue = _this.getSex(val),
					moduleId = $idCardInput.data('moduleid'),

					$birthday = $parent.find('input.insure-calendar[data-moduleid="' + moduleId + '"][data-attributeid="' + _this.ATTR_ID_BIRTHDATE + '"]'),
					$sex = $parent.find('[data-moduleid="' + moduleId + '"][data-attributeid="' + _this.ATTR_ID_SEX + '"]');
				if (_this.identityCodeValid(val)) {
					$birthday.val(_this.getIdDate(val)); //自动设置出生日期
					$birthday.trigger('blur');
					if ($sex.hasClass('hz-radio-item')) {
						$sex.each(function(i, item) { //sex自动设置性别
							var _val = _this.toInt($(item).attr('value'));
							if (_val === _this.VALUE_ID_FEMALE && sexValue === _this.VALUE_ID_FEMALE) {
								$(item).attr('checked', true);
								$(item).click();
							}
							if (_val === _this.VALUE_ID_MALE && sexValue === _this.VALUE_ID_MALE) {
								$(item).attr('checked', true);
								$(item).click();
							}
						});
					} else {
						$sex.val(sexValue);
					}
					$birthday.change();
				}
			}
			return true;
		},
		validateInsuredSameCardInfo: function(input) { //校验当前被保险人的证件信息是否和其他被保险人证件信息相同
			var _this = this,
				$input = $(input),
				$parent = $input.parents('.credentials-form'),
				$curIdCardInput = $parent.find('.id-card-input'),
				$curCardTypeInput = $parent.find('.credentials'),
				curIndex = $parent.data('index'),
				curCardType = ~~$curCardTypeInput.val(),
				curCardNum = $curIdCardInput.val(),
				status = true,
				insurants = $('#module-20').find('.credentials-form:visible');
			if ($curIdCardInput.data('moduleid') !== _this.MODULES_ID_INSURED) { //投保人进行校验
				return true;
			}
			$.each(insurants, function(i, item) {
				var $idCardInput = $(item).find('.id-card-input'),
					$cardTypeInput = $(item).find('.credentials'),
					index = $(item).data('index'),
					cardType = ~~$cardTypeInput.val(),
					cardNum = $idCardInput.val();
				if (_this.validateCardInput($idCardInput[0])) {
					if (index !== curIndex && curCardType === cardType && cardNum === curCardNum) {
						status = false;
						//$idCardInput.data('errorRemind', _this.TEXT_SAME_ERROR);
						_this.hideSuccess($idCardInput[0]);
						_this.showError($idCardInput[0], _this.TEXT_SAME_ERROR);
					}
				}
			});
			if (!status) {
				//$curIdCardInput.data('errorRemind', _this.TEXT_SAME_ERROR);
				_this.hideSuccess($curIdCardInput[0]);
				_this.showError($curIdCardInput[0], _this.TEXT_SAME_ERROR);
			}
			return status;
		},
		defaultSelectIdCard: function(warp) {
			var _this = this,
				$warp = warp || _this.el,
				cardTypes = $warp.find('[data-attributeid=' + _this.ATTR_ID_CREDENTIALSTYPE + '].hz-dropdown');
			$.each(cardTypes, function() {
				if (!$(this).data('value')) {
					_this.dropdownSelectItem(this, 1);
				}
			});
		},
		insureCName: '', //投保人的中文名 
		insurerName: function(input) { //自动设置持卡人姓名，此不可编辑
			var _this = this,
				val = $(input).val(); //$('#modules' + this.MODULES_ID_FORCEPAYID)
			_this.el.find('.insure-form[data-attributeid="' + _this.ATTR_ID_BANK_NAME_1 + '"]').val(val).blur();
			_this.el.find('.insure-form[data-attributeid="' + _this.ATTR_ID_BANK_NAME_2 + '"]').val(val).blur();
			if (val) {
				$('.js-insure-name').html(val);
				_this.insureCName = val;
			} else {
				$('.js-insure-name').html('投保人');
			}
		},
	};
	return InsureValidate;
});