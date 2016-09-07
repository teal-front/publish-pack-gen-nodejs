define(function() {
	'use strict';
	/*
	 * @constructor InsureBeneficiary
	 * @author hz1405863
	 * @version 0.0.1
	 * @description 受益人
	 */
	var InsureBeneficiary = function() {

	};
	InsureBeneficiary.prototype = {
		initBeneficiary: function() {},
		initBeneficiaryType: function(warp) { //受益人类型设置默认值
			var _this = this,
				$warp = warp ? $(warp) : _this.el.find('.insurant-item-form');
			$warp.each(function() {
				var beneficiaryType = $(this).find('.hz-dropdown.beneficiarytype-select');
				if (_this.product.beneficiaryType === 2) { //指定受益人
					_this.dropdownSelectItem(beneficiaryType, 2);
				} else {
					_this.dropdownSelectItem(beneficiaryType, 1);
				}
			});
		},
		validateBeneficiary: function() {
			var _this = this,
				status = true,
				zdBeneficiarys = $('#module-20  .zd-beneficiary:visible');
			zdBeneficiarys.each(function() {
				var $beneficiaryContent = $(this),
					firstArr = [],
					secondArr = [],
					insurantName = $beneficiaryContent.parents('.insurant-item-form').find('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_NAME + ']').val(),
					$firstBeneficiarys = $beneficiaryContent.find('.beneficiaryFirst .beneficiary-item [data-attributeid=128]'),
					$secondBeneficiarys = $beneficiaryContent.find('.beneficiarySecond .beneficiary-item [data-attributeid=128]');
				if (_this.isSelf) {
					insurantName = $('[data-moduleid=' + _this.MODULES_ID_INSURE + '][data-attributeid=' + _this.ATTR_ID_NAME + ']').val();
				}
				if ($beneficiaryContent.find('.beneficiaryFirst .beneficiary-item').length > 0) {
					$firstBeneficiarys.each(function(i, item) {
						var val = parseFloat($(item).data('value'));
						if (!val) {
							if (!_this.saveShopCar) {
								_this.layer({
									content: insurantName + '的' + _this.TEXT_BENEFICIARY_ONE
								});
							}
							status = false;
						} else {
							firstArr.push(val);
						}
					});
					if (_this.sum(firstArr) !== 100) {
						if (!_this.saveShopCar) {
							_this.layer({
								content: insurantName + '的' + _this.TEXT_BENEFICIARY_ONE
							});
						}
						status = false;
					}
				} else {
					if (!_this.saveShopCar) {
						_this.layer({
							content: insurantName + '的' + '至少需要填写一位第一顺序受益人'
						});
					}
					//_this.message.show('至少需要填写一位第一顺序受益人', 'warning', _this.messageTimeOut);
					status = false;
				}
				if ($secondBeneficiarys.length) {
					$secondBeneficiarys.each(function(i, item) {
						var val = parseFloat($(item).data('value'));
						if (!val) {
							if (!_this.saveShopCar) {
								_this.layer({
									content: insurantName + '的' + _this.TEXT_BENEFICIARY_TWO
								});
							}
							//_this.message.show(_this.TEXT_BENEFICIARY_TWO, 'warning', _this.messageTimeOut);
							status = false;
						} else {
							secondArr.push(val);
						}
					});
					if (_this.sum(secondArr) !== 100) {
						if (!_this.saveShopCar) {
							_this.layer({
								content: insurantName + '的' + _this.TEXT_BENEFICIARY_TWO
							});
						}
						status = false;
					}
				}
				if (!status) {
					return status;
				}

				var beneficiarys = $beneficiaryContent.find('.beneficiary-item'),
					$inputArr = [],
					arr = [];
				beneficiarys.each(function() {
					var type = $(this).find('[data-attributeid=' + _this.ATTR_ID_CREDENTIALSTYPE + ']').data('value');
					var input = $(this).find('[data-attributeid=' + _this.ATTR_ID_CREDENTIALSINPUT + ']').data('value');
					var obj = {};
					obj['type'] = type ? type.toString() : '';
					obj['value'] = input ? input.toString() : '';
					if (type && input) {
						arr.push(obj);
						$inputArr.push($(this));
					}
				});

				for (var i = 0; i < arr.length; i++) {
					for (var j = i + 1; j < arr.length; j++) {
						if (arr[i].type === arr[j].type && arr[i].value.toUpperCase() === arr[j].value.toUpperCase()) {
							_this.layer({
								content: insurantName + '的' + '受益人的证件信息出现重复，请重新确认信息'
							});
							//_this.message.show('受益人的证件信息出现重复，请重新确认信息', 'warning', _this.messageTimeOut);
							status = false;
						}
					}
				}
			});

			return status;
		},
		/*
		 **==================== 添加受益人 ====================
		 */
		renderBeneficiary: function(item, index) { //渲染每一行受益人HTML
			var _this = this,
				mHtml = [];
			_this.addIndex++;
			_this.formIndex++;

			mHtml.push('<li class="list-table-row list-table-row-editing beneficiary-sub-box  credentials-form" data-index="' + _this.formIndex + '">');
			mHtml.push('<span class="del-beneficiary del base-btn" data-type="beneficiary"><i class="delete"></i><em>删除</em></span>');
			mHtml.push(_this.renderTable(item));

			mHtml.push('<div class="cell">');
			mHtml.push('<div class="cell-inner">');
			mHtml.push('<div class="hz-check-item inline-block">');
			mHtml.push('<input class="insure-checkbox fl" type="checkbox" name="chkSaveInsure" id="chkSaveInsure-' + item.id + _this.formIndex + '"   data-moduleid="' + item.id + '" class="insure-label" value="1" checked />');
			// result.push('<i class="hz-check-icon"></i>')
			mHtml.push('<span class="hz-check-text f12 fc6">保存为常用联系人</span><span class="fl f12 fc6 ml5">');
			mHtml.push('</div>');
			mHtml.push('</div>');
			mHtml.push('</div>');

			mHtml.push('<input type="hidden" name="serial" value="' + index + '" />');
			mHtml.push('</li>');
			return mHtml.join('');
		},
		addBenficiary: function(input) { //添加受益人
			var _this = this;
			var type = $(input).data('type');
			var num1 = _this.product.firstBeneficiaryLimit;
			var num2 = _this.product.secondBeneficiaryLimit;
			var benefiContent = $(input).parents('[data-insurantindex]');
			var insurantIndex = $(benefiContent).data('insurantindex');
			if (type === 'first') {
				if ($('[data-insurantindex=' + insurantIndex + ']:visible .beneficiaryFirst').find('.beneficiary-sub-box').length < num1) {
					_this.addFirst(insurantIndex);
				} else {
					_this.layer({
						content: '第一顺序受益人最大数为' + num1 + '人',
						btn: false
					});
					//_this.showMessage(, 'warning');
				}
			} else {
				if ($('[data-insurantindex=' + insurantIndex + '] .beneficiarySecond').find('.beneficiary-sub-box').length < num2) {
					_this.addsecond(insurantIndex);
				} else {
					_this.layer({
						content: '第二顺序受益人最大数为' + num2 + '人',
						btn: false
					});
					//_this.showMessage('第二受益人最大数为' + num2, 'warning');
				}
			}
		},
		addFirst: function(insurantIndex) { //添加第一受益人
			var _this = this;
			var $beneficiaryFirst = $('[data-insurantindex=' + insurantIndex + '] .beneficiaryFirst .beneficiary-content');
			var formLength = $beneficiaryFirst.find('.credentials-form').length;
			//_this.refillBeneficiaryInfo(3, _this.testbeneficiary);
			_this.showEditContent(insurantIndex, 1);
		},
		showBeneficiarySecond: function(insurantIndex) {
			var $beneficiarySecond = $('[data-insurantindex=' + insurantIndex + '] .beneficiarySecond');
			if ($beneficiarySecond.find('.beneficiary-sub-box').length) {
				$beneficiarySecond.find('.beneficiary-head').show();
			} else {
				$beneficiarySecond.find('.beneficiary-head').hide();
			}
			this.resetBeneficiaryNum($beneficiarySecond);
		},
		addsecond: function(insurantIndex) { //添加第二受益人
			var _this = this;
			var $beneficiarySecond = $('[data-insurantindex=' + insurantIndex + '] .beneficiarySecond .beneficiary-content');
			var formLength = $beneficiarySecond.find('.credentials-form').length;

			_this.showEditContent(insurantIndex, 2);

			_this.showBeneficiarySecond(insurantIndex);
		},
		delBeneficiary: function(input) { //删除受益人
			var benefiContent = $(input).parents('[data-insurantindex]');
			var insurantIndex = $(benefiContent).data('insurantindex');
			$(input).parents('.beneficiary-sub-box').remove();
			this.setFirstStatus(insurantIndex);
		},
		editBeneficiary: function(input) { //编辑受益人
			var _this = this,
				benefiItem = $(input).parents('.beneficiary-sub-box'),
				insurantIndex = $(benefiItem).data('insurantindex'),
				beneficiaryindex = $(benefiItem).data('beneficiaryindex'),
				fromindex = $(benefiItem).data('fromindex');
			_this.showEditContent(insurantIndex, beneficiaryindex, fromindex);
			// this.setFirstStatus(insurantIndex);
		},
		setFirstStatus: function(insurantIndex) { //设置第一受益人状态
			var _this = this;
			_this.setDeleteStatus($('[data-insurantindex=' + insurantIndex + '] .beneficiaryFirst'), _this.TEXT_DELETED_TYPE_BENEFICIARY);
			_this.showBeneficiarySecond(insurantIndex);
			_this.resetBeneficiaryNum($('[data-insurantindex=' + insurantIndex + '] .beneficiaryFirst'));
		},
		showEditContent: function(insurantIndex, beneficiaryIndex, fromIndex) { //显示编辑框
			var _this = this,
				title = fromIndex ? "编辑受益人" : "添加受益人";
			_this.layer({
				area: "400px",
				content: _this.beneficiaryDialogHtml.join(''),
				btn: false,
				title: title,
				shadeClose: false //点击遮罩关闭
			});
			var calendarTimeout;
			$('#beneficiary-dialog').parent().on('scroll', function() {
				var _that = this;
				clearTimeout(calendarTimeout);
				calendarTimeout = setTimeout(function() {
					MyCalendar.closeAll();
					$(_that).find('input').blur();
				}, 100);
			});
			var $beneficiaryDialog = $('#beneficiary-dialog');
			_this.initCalendar($beneficiaryDialog); //初始化日期控件
			_this.eventCheckbox($beneficiaryDialog);
			_this.eventRadio($beneficiaryDialog); //Radio初始化

			// new MyCalendar({
			// 	el: $beneficiaryDialog.find('.Wdate'),
			// 	parent:$beneficiaryDialog
			// });

			_this.eventDrowDown($beneficiaryDialog); //下拉框
			_this.defaultRestrict($beneficiaryDialog); //默认约束

			$beneficiaryDialog.delegate('.insure-form', 'change', function() {
				//自动设置身份信息
				if ($(this).hasClass('credentials') || $(this).hasClass('id-card-input')) {
					_this.autoSetIdInfo(this);
				}
			});

			$('#beneficiarySave').attr('data-insurantindex', insurantIndex);
			$('#beneficiarySave').attr('data-beneficiaryindex', beneficiaryIndex);
			if (fromIndex) {
				$('#beneficiarySave').attr('data-fromindex', fromIndex);
				_this.fillEditContent(insurantIndex, beneficiaryIndex, fromIndex);
			}
			_this.bindContacts(_this, $beneficiaryDialog, $beneficiaryDialog);

			_this.defaultSelectIdCard($beneficiaryDialog);

			$beneficiaryDialog
				.delegate('.beneficiary-save', 'click', function() {
					_this.beneficiarySaveClick();
				})
				.delegate('.form-item', 'blur', function() {
					if (_this.validate(this)) {
						if ($(this).hasClass('proportion')) { //收益比例
							if (parseFloat($(this).val()) <= 0) {
								_this.beneficiaryValidateError(this, '受益比例应大于0');
								return;
							}
						}
						_this.beneficiaryValidateSuccess(this);
					} else {
						_this.beneficiaryValidateError(this);
					}
				});
			$('#beneficiary-dialog').find('input:visible').placeholder({});
		},
		beneficiarySaveClick: function() { //保存
			var _this = this,
				status = true;
			status = _this.validateSingleBeneficiary();
			if (status) {
				_this.saveBeneficiaryContent();
				layer.closeAll();
			}
		},
		saveBeneficiaryContent: function() { //将浮层信息保存到页面
			var _this = this,
				result = [],
				inputList = $('#beneficiary-dialog').find('.form-item:not(.hz-radio-item)'),
				radioList = $('#beneficiary-dialog').find('.form-item.hz-radio-item.hz-radio-item-checked'),
				insurantindex = $('#beneficiarySave').data('insurantindex'),
				beneficiaryindex = $('#beneficiarySave').data('beneficiaryindex'),
				fromindex = $('#beneficiarySave').data('fromindex'),
				isEdit = true;
			if (!fromindex) {
				isEdit = false;
				_this.formIndex++;
				fromindex = fromindex ? fromindex : _this.formIndex;
			}

			var attr = 'data-insurantindex="' + insurantindex + '" data-beneficiaryindex="' + beneficiaryindex + '" data-fromindex="' + fromindex + '"';
			result.push('<tr class="beneficiary-item  beneficiary-sub-box" ' + attr + '>');
			result.push('<td class="tac current-index">1</td>');
			result.push('<td><ul class="info-list clearfix lh24">');
			inputList.each(function() { //输入框
				var $item = $(this),
					name = $item.attr('name'),
					moduleid = $item.data('moduleid'),
					attributeid = $item.data('attributeid'),
					nameText = $item.data('name'),
					val = $item.val(),
					text = $item.val();
				if (attributeid === _this.ATTR_ID_BENEFICIARY) {
					try {
						val = parseFloat(val).toFixed(2);
						text = val;
					} catch (ex) {}

					text = text + '%';
				}
				if ($item.hasClass('hz-dropdown')) {
					text = $item.find('.hz-select-option-selected').text();
				}
				if ($item.attr('type') === 'checkbox') {
					text = $item.attr('checked') === 'checked' ? "是" : "否";
					val = $item.attr('checked') === 'checked' ? true : false;
				}

				var itemattr = 'data-moduleid="' + moduleid + '" data-attributeid="' + attributeid + '" name="' + name + '" data-value="' + val + '"  value="' + val + '"';

				if (attributeid === _this.ATTR_ID_CREDENTIALSTYPE) {
					result.push('<li class="fl">');

					result.push('<span class="fc9">' + nameText + '：</span><span class="insure-form" data-moduleid="30" data-attributeid="3" name="' + name + '" data-value="' + text + '" value="' + text + '">' + text + '</span>');
					result.push('<span class="insure-form" data-moduleid="30" data-attributeid="3" name="cardTypeId" data-value="' + val + '" value="' + val + '"></span>');

					result.push('</li>');
				} else if (attributeid === _this.ATTR_ID_CREDENTIALSVALIDITY) {
					if (name === 'cardPeriod') {
						var check = $('#beneficiary-dialog').find('[name=validityTime]').parents('.hz-check-item').hasClass('hz-check-item-checked'),
							cardPeriodEnd = $('#beneficiary-dialog').find('[name=cardPeriodEnd]').val();
						if (!check) {
							val = val + '|' + cardPeriodEnd;
						}
						itemattr = 'data-moduleid="' + moduleid + '" data-attributeid="' + attributeid + '" name="' + name + '" data-value="' + val + '"  value="' + val + '"';
						result.push('<li class="fl">');
						result.push('<span class="fc9">' + nameText + '：</span><span class="insure-form" ' + itemattr + '>' + val + '</span>');
						result.push('</li>');
					}

				} else {
					result.push('<li class="fl">');
					result.push('<span class="fc9">' + nameText + '：</span><span class="insure-form" ' + itemattr + '>' + text + '</span>');
					if ($item.hasClass('hz-dropdown')) {
						var textItemAttr = 'data-moduleid="' + moduleid + '" data-attributeid="' + attributeid + '" name="' + name + 'Text" data-value="' + text + '"  value="' + text + '"';
						result.push('<span class="insure-form" ' + textItemAttr + '></span>');
					}
					result.push('</li>');
				}
			});
			radioList.each(function() { //单选按钮
				var $item = $(this),
					name = $item.attr('name'),
					moduleid = $item.data('moduleid'),
					attributeid = $item.data('attributeid'),
					nameText = $item.data('name'),
					val = $item.val() || $item.attr('value'),
					text = $item.find('.hz-radio-text').text(),
					itemattr = 'data-moduleid="' + moduleid + '" data-attributeid="' + attributeid + '" name="' + name + '"data-value="' + val + '"  value="' + val + '"';
				result.push('<li class="fl"><span class="fc9">' + nameText + '：</span><span class="insure-form" ' + itemattr + '>' + text + '</span></li>');

			});
			result.push('</ul></td>');
			result.push('  <td class="tac"><a href="javascript:;" class="primary-link f12 edit" data-type="beneficiary">编辑</a><a href="javascript:;" class="primary-link f12 del" data-type="beneficiary">删除</a></td>');
			result.push('</tr>');

			if (isEdit) { //编辑
				var $tr = $('#module-20 .zd-beneficiary[data-insurantindex=' + insurantindex + '] table').find('tr[data-fromindex=' + fromindex + ']');
				$tr.replaceWith(result.join(''));
			} else {
				var $addtr;
				if (beneficiaryindex == 1) { //第一顺序受益人
					$addtr = $('#module-20 .zd-beneficiary #beneficiaryFirst-' + insurantindex + '').find('.beneficiary-addtr');
				} else {
					$addtr = $('#module-20 .zd-beneficiary #beneficiarySecond-' + insurantindex + '').find('.beneficiary-addtr');
				}
				$addtr.before(result.join(''));
			}
			_this.setFirstStatus(insurantindex);
			return true;
		},
		refillBeneficiaryInfo: function(dataIndex, beneficiary) { //受益人信息回填到页面
			var _this = this,
				result = [],
				insurantindex = $('[data-index=' + dataIndex + ']  [data-insurantindex]').data('insurantindex'),
				beneficiaryindex = beneficiary['serial'],
				modulesItem = _this.beneficiaryItem,
				list = modulesItem.productAttrs || [];

			_this.formIndex++;

			var attr = 'data-insurantindex="' + insurantindex + '" data-beneficiaryindex="' + beneficiaryindex + '" data-fromindex="' + _this.formIndex + '"';
			result.push('<tr class="beneficiary-item  beneficiary-sub-box" ' + attr + '>');
			result.push('<td class="tac current-index">1</td>');
			result.push('<td><ul class="info-list clearfix lh24">');

			list.forEach(function(item, i) { //输入框
				var attribute = item.attribute || {},
					name = attribute.keyCode,
					moduleid = modulesItem.id,
					attributeid = attribute.id,
					nameText = attribute.name,
					options = attribute.values || [],
					val = beneficiary[name],
					text = beneficiary[name];
				text = attributeid === _this.ATTR_ID_BENEFICIARY ? (text + '%') : text;
				if (attribute.type === 0 || attribute.type === 9) { //下拉框或者单选
					options.forEach(function(option, j) {
						if (option.controlValue === val) {
							text = option.value;
						}
					});
				}
				var itemattr = 'data-moduleid="' + moduleid + '" data-attributeid="' + attributeid + '" name="' + name + '"data-value="' + val + '"  value="' + val + '"';
				if (val !== null && val !== "" && val !== undefined) {
					if (attributeid === _this.ATTR_ID_CREDENTIALSTYPE) {
						val = beneficiary['cardTypeId'];
						result.push('<li class="fl">');
						result.push('<span class="fc9">' + nameText + '：</span><span class="insure-form" data-moduleid="30" data-attributeid="3" name="' + name + '" data-value="' + text + '" value="' + text + '">' + text + '</span>');
						result.push('<span class="insure-form" data-moduleid="30" data-attributeid="3" name="cardTypeId" data-value="' + val + '" value="' + val + '"></span>');

						result.push('</li>');
					} else {
						result.push('<li class="fl">');
						result.push('<span class="fc9">' + nameText + '：</span><span class="insure-form" ' + itemattr + '>' + text + '</span>');
						if (attribute.type === 0) {
							var textValue = "";
							var textItemAttr = 'data-moduleid="' + moduleid + '" data-attributeid="' + attributeid + '" name="' + name + 'Text" data-value="' + text + '"  value="' + text + '"';
							result.push('<span class="insure-form" ' + textItemAttr + '></span>');
						}
						result.push('</li>');
					}
				}
			});

			var chkSaveInsure = beneficiary['chkSaveInsure'] || false,
				chkSaveInsureText = chkSaveInsure ? '是' : '否';
			result.push('<li class="fl"><span class="fc9">保存为常用联系人：</span><span class="insure-form" data-moduleid="30" data-attributeid="" name="chkSaveInsure" data-value="' + chkSaveInsure + '" value="' + chkSaveInsure + '">' + chkSaveInsureText + '</span></li>');

			result.push('</ul></td>');
			result.push('  <td class="tac"><a href="javascript:;" class="primary-link f12 edit" data-type="beneficiary">编辑</a><a href="javascript:;" class="primary-link f12 del" data-type="beneficiary">删除</a></td>');
			result.push('</tr>');

			var $addtr;
			if (beneficiaryindex == 1) { //第一顺序受益人
				$addtr = $('#module-20 .zd-beneficiary #beneficiaryFirst-' + insurantindex + '').find('.beneficiary-addtr');
			} else {
				$addtr = $('#module-20 .zd-beneficiary #beneficiarySecond-' + insurantindex + '').find('.beneficiary-addtr');
			}
			$addtr.before(result.join(''));

			_this.setFirstStatus(insurantindex);
			return true;
		},
		resetBeneficiaryNum: function(from) { //重置页面上的受益人的顺序和个数
			var $from = $(from),
				benlength = $from.find('.beneficiary-sub-box').length,
				index = 1;
			$from.find('.beneficiary-count').html(benlength);
			$from.find('.current-index').each(function() {
				$(this).html(index);
				index++;
			});
		},
		validateSingleBeneficiary: function() { //校验单个受益人
			var _this = this,
				inputList = $('#beneficiary-dialog').find('.form-item:visible'),
				status = true;
			inputList.each(function() { //单个校验
				var currentstatus = _this.validate(this);
				if (currentstatus) {
					status = status;
					_this.beneficiaryValidateSuccess(this);
				} else {
					status = false;
					_this.beneficiaryValidateError(this);
				}
			});
			return status;
		},
		beneficiaryValidateSuccess: function(input) { //受益人字段验证成功
			var $input = $(input),
				$tips = $('#beneficiaryTips');
			if ($input.hasClass('hz-dropdown')) {
				$input.find('.input-text').removeClass('input-text-error');
			} else {
				$input.removeClass('input-text-error');
			}
			$tips.html('');
		},
		beneficiaryValidateError: function(input, errText) { //受益人字段验证失败
			var $input = $(input),
				$tips = $('#beneficiaryTips'),
				text = errText || $input.data('errorremind') || '';
			if ($input.hasClass('hz-dropdown')) {
				$input.find('.input-text').addClass('input-text-error');
			} else {
				$input.addClass('input-text-error');
			}
			$tips.html(text);
		},
		fillEditContent: function(insurantIndex, beneficiaryIndex, fromIndex) { //编辑回填受益人信息
			var _this = this,
				$beneficiaryDialog = $('#beneficiary-dialog'),
				fieldList = $('[data-insurantindex=' + insurantIndex + '][data-beneficiaryindex=' + beneficiaryIndex + '][data-fromindex=' + fromIndex + ']').find('.insure-form');
			fieldList.each(function() {
				var $item = $(this),
					value = $item.data('value'),
					attributeid = $item.data('attributeid'),
					$input = $beneficiaryDialog.find('[data-attributeid=' + attributeid + ']');
				if ($input.length > 1) {
					if (attributeid === _this.ATTR_ID_CREDENTIALSVALIDITY) {
						var cardPeriod = value.split('|');
						if (cardPeriod.length > 1) {
							$beneficiaryDialog.find('[name=cardPeriod]').val(cardPeriod[0]);
							$beneficiaryDialog.find('[name=cardPeriodEnd]').val(cardPeriod[1]);
						} else {
							$beneficiaryDialog.find('[name=cardPeriod]').val(cardPeriod[0]);
							$beneficiaryDialog.find('[name=validityTime]').parents('.hz-check-item').click();
						}
					} else {
						$input.each(function() {
							if ($(this).hasClass('hz-radio-item') && $(this).attr('value') == value) { //单选框
								$(this).click();
							}
						});
					}
				} else {
					if ($input.attr('type') === 'checkbox') { //复选框
						if (value === true) {
							$input.parents('.hz-check-item').addClass('hz-check-item-checked');
							$input.attr('checked', true);
						} else {
							$input.parents('.hz-check-item').removeClass('hz-check-item-checked');
							$input.attr('checked', false);
						}
					} else if ($input.hasClass('hz-dropdown')) { //下拉框
						_this.dropdownSelectItem($input, value);
					} else {
						$input.val(value);
					}
				}
			});
			return true;
		},

		beneficiaryItem: '',
	};
	return InsureBeneficiary;
});