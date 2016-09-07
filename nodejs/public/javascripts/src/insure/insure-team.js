define([
	'jquery',
	'webuploader',
	'helper'
], function(
	$, //jQuery
	WebUploader, //上传插件
	helper
) {
	'use strict';
	/*
	 * @constructor InsureTeam
	 * @author 
	 * @version 0.0.1
	 * @description 团单模块
	 */

	var InsureTeam = function() {};
	InsureTeam.prototype = {
		//editClassName: 'list-table-row-editing',
		editClassName: '',
		__randomId: 0,
		getRandomId: function() {
			this.__randomId++;
			return 'r-' + this.__randomId;
		},
		initTeam: function() {

			var _this = this,
				num = ' 最小人数：' + _this.product.minPeople + ' 最大人数：' + _this.product.maxPeople;
			_this.relationship = [];
			for (var key in _this.getRelationship) {

				_this.relationship.push({
					text: _this.getRelationship[key],
					value: key
				});

			}
			if (_this.debug) {
				if (_this.teamTemplateType === 2) {
					_this.logRed('团单模板类型：境外模板' + num);
				} else {
					_this.logRed('团单模板类型：国内模板' + num);
				}
			}

			//设置证件类型
			_this.cardTypeArr = [];
			$.each(_this.cardType, function(i, item) {
				_this.cardTypeArr.push({
					value: item.controlValue,
					text: item.value
				});
			});

			_this.setInsuredSomeReg();
			//团单区域
			_this.teamBody = _this.el.find('#teamBody');
			//显示团单数量
			_this.insuredNumber = _this.el.find('#insuredNumber');

			if (_this.isTeamInsurant) {
				this.setTeamStatus();
			}

			_this.eventTeam();
			_this.resetTotalPrice();
			_this.eventTeamInit();

		},
		setInsuredSomeReg: function() { //获取投保的姓名正则

			var insuredModule = this.data.modules || [];
			this.insuredNameReg = '';
			this.insuredNameRegErrorText = '';
			this.insuredTelReg = '';
			this.insuredTelRegErrorText = '';
			this.insuredCardNumberRequire = '';
			this.insuredENameReg = ''; //英文名
			for (var i = 0, len = insuredModule.length; i < len; i++) {
				var productAttrs = insuredModule[i].productAttrs || [];

				for (var attr = 0, attrLen = productAttrs.length; attr < attrLen; attr++) {
					var attribute = productAttrs[attr].attribute || {};
					//if (insuredModule[i].id === this.MODULES_ID_INSURE) {} if (insuredModule[i].id === this.MODULES_ID_INSURED) {}
					if (productAttrs[attr].attributeId === this.ATTR_ID_NAME) { //用户名
						this.insuredNameReg = attribute.regex; //用户名正则
						this.insuredNameRegErrorText = attribute.errorRemind; //用户名错误信息
					}

					if (productAttrs[attr].attributeId === this.ATTR_ID_TEL) { //手机号码
						this.insuredTelReg = attribute.regex; //手机正则
						this.insuredTelRegErrorText = attribute.errorRemind; //手机号码错误信息
					}

					if (productAttrs[attr].attributeId === this.ATTR_ID_CREDENTIALSINPUT) { //证件号码
						this.insuredCardNumberRequire = productAttrs[attr].required; //获取证件号码是否必填
						this.insuredCardRegErrorText = productAttrs[attr].attribute.errorRemind;
					}


					if (productAttrs[attr].attributeId === this.ATTR_ID_ENAME) {
						this.insuredENameReg = attribute.regex;
						this.insuredENameErrorRemind = attribute.errorRemind;
					}

				}
			}

		},
		eventTeamInit: function() {
			var _this = this;
			//设置Style
			this.teamBody.css({
				position: 'relative'
			});

			// //添加默认的
			if (!_this.teamNum) {
				$('.add-link[type=team]').click();
			}


			//滚动时关闭日期控件
			var calendarTimeout;
			_this.teamBody.on('scroll', function() {
				clearTimeout(calendarTimeout);
				calendarTimeout = setTimeout(function() {
					MyCalendar.closeAll();
				}, 100);
			});

			_this.teamBody.on('blur', 'li.list-table-row .insure-team-input', function() {

				_this.setTeamItemInfo(this);

			});
		},

		setTeamItemInfo: function(input) {
			var _this = this,
				$parent = $(input).parents('li'),
				index = $parent.data('index');

			_this.teamInfo[index] = {
				type: $parent.find('.insure-code-type').data('value'),
				code: $parent.find('.insure-code').val() || ''
			};
			_this.info(_this.teamInfo[index]);
		},

		validateTeamDateRange: function() {
			var _this = this,
				listData = _this.getTeamData() || {},
				min = _this.insuredDate.minDate,
				max = _this.insuredDate.maxDate,
				status = true;
			_this.startTime('校验团单出生日期范围');
			$.each(listData, function(key, item) {
				var date = item.date || '';
				if (!date) {
					return;
				}
				if (_this.dateDifference(min, date) < 0 || _this.dateDifference(max, date) > 0) {
					status = false;
					//$('#' + key).addClass(_this.editClassName);
				}

			});
			_this.endTime('校验团单出生日期范围');
			return status;
		},
		getTeamData: function() {
			var _this = this;
			_this.startTime('获取团单数据');
			_this.teamBody.find('.list-table-row').each(function(i, item) {
				var key = $(item).attr('id') || '-';
				_this.teamData[key] = {
					name: $(this).find('[name="cName"]').val(),
					date: $(this).find('input.Wdate').val(),
					type: $(this).find('.insure-code-type').data('value'),
					code: $(this).find('.insure-code').val()
				};
			});
			_this.endTime('获取团单数据');
			return _this.teamData;
		},
		validateDuplicate: function(obj) { //校验重复项
			var _this = this,
				data = obj || {},
				newData = {},
				tempList = [],
				list = [],
				result = [],
				temp = {},
				sum = 0;

			_this.teamBody.find('li').removeClass('dup');
			//_this.startTime('getTeamData');
			_this.getTeamData();
			//_this.endTime('getTeamData');
			data = this.teamData;
			$.extend(newData, data);
			_this.startTime('校验团单重复项');
			for (var key in data) {
				for (var _key in newData) {
					if (key.toString() === _key.toString() || !data[key].code) {
						continue;
					}
					if (data[key].type === data[_key].type && data[key].code === data[_key].code) {
						data[key].lock = 1;
						result.push(key);
					}
				}
			}
			$.each(data, function(key, item) {

				if (item.lock === 1) {
					list.push(key);
					sum++;
				}

			});
			$.each(list, function(i, item) {

				temp[data[item].code] = item;
			});
			$.extend(tempList, list);
			for (var _tKey in temp) {
				var index = $.inArray(temp[_tKey], list);
				if (index !== -1) {
					list.splice(index, 1);
				}
			}
			_this.endTime('校验团单重复项');
			if (sum > 0 && !_this.saveShopCar) {
				layer.open({
					title: '清除重复项',
					area: ['400px'],
					content: '有<span class="primary-color">' + sum + '</span>条重复数据，是否自动清除？',
					btn: ['不清除', '清除'],
					btn1: function(index) {
						$.each(tempList, function(i, item) {

							$('#' + item)
								.addClass('dup')
								//.addClass(_this.editClassName)
								.find('.insure-code')
								.addClass('input-text-error');

						});
						layer.close(index);
					},
					btn2: function() {
						$.each(list, function(i, item) {
							_this.teamData[item] = null;
							delete _this.teamData[item];

							if ($('#' + item).length) {
								_this.teamNum--;
								//_this.updateTeamIndex();
								_this.setCloseStatus();
							}
							$('#' + item).remove();
						});
					}
				});
			}
			return {
				number: sum,
				list: list
			};
		},
		eventTeam: function() {
			var _this = this;

			_this.teamBody
				.on('click', '.close', function(ev) { //删除项
					_this.deleteTeamItem(ev);
				})
				.on('mouseenter', '.list-table-row', function() {
					//$(this).addClass(_this.editClassName);
				})
				.on('blur', '.eidt-item', function() {
					_this.updateTemaValue($(this).parents('.list-table-row'));
				})
				.on('mouseleave', '.list-table-row', function() {
					//$('.hz-dropdown-content').hide();
					// if (_this.validateTeamItem(this)) {
					// 	$(this).removeClass(_this.editClassName).addClass(_this.__validClassName);
					// } else {
					// 	$(this).removeClass(_this.__validClassName);
					// }
					//_this.updateTemaValue(this);
				})
				.on('change', '.eidt-item', function() {
					_this.teamItemChange(this);
				});

			_this.el
				.on('click', '.add-link', function() { //添加项
					if ($(this).attr('type') === "team") {
						if (_this.teamNum < _this.maxPeople) {
							_this.teamInfo[_this.teamIndexs] = {};
							_this.addTeamItem();
							_this.setCloseStatus();

							//_this.updateTeamIndex();
						} else {
							_this.showTeamError({
								type: 'max'
							});
						}
					}

				})
				.on('click', '.upload-excel', function() {
					_this.showUploadExcel();
				});
		},
		getUploadHtml: function() {
			var result = [];
			var link = this.teamTemplateType === 1 ? this.URL_TEMPLATE_DOMESTIC : this.URL_TEMPLATE_FOREIGN;
			var linkText = this.teamTemplateType === 1 ? '境内旅游模板' : '境外旅游模板';
			result.push('<div id="uploadArea" style="">');
			result.push('<div class="tac  file-upload-start">');
			result.push('<p class="f14 mb30">请上传按' + linkText + '填好的Excel文档。 <a class="download-link tdl" href="' + link + '" target="_blank"> 下载' + linkText + '</a></p>');
			result.push('<a class="hz-button hz-button-primary" href="javascript:;" id="uploadExcel">上传Excel文档</a>');
			result.push('</div>');
			result.push('</div>');

			result.push('<div class="progress-area" id="progressArea" style="display:none">');
			result.push('<div class="file-upload-processing">');
			result.push('<p class="des">');
			result.push('文档：<span id="excelFileName">我是文档名称.xls</span>上传中');
			result.push('</p>');
			result.push('<div class="progress-bar">');
			result.push('<div class="progress f14 tar" style="width: 70%;" id="progressExcel"><span class="text">70%</span></div>');
			result.push('</div>');
			result.push('</div>');
			result.push('</div>');

			return result.join('');
		},
		getUploadingHtml: function() {
			var result = [];
			result.push('<div class="progress-area" id="progressArea">');
			result.push('<div class="file-upload-processing">');
			result.push('<p class="des">');
			result.push('文档：<span id="excelFileName">我是文档名称.xls</span>上传中');
			result.push('</p>');
			result.push('<div class="progress-bar">');
			result.push('<div class="progress f14 tar" style="width: 10%;" id="progressExcel"><span class="text">70%</span></div>');
			result.push('</div>');
			result.push('</div>');
			result.push('</div>');
			return result.join('');
		},
		showUploadExcel: function() {
			var _this = this;
			layer.open({
				type: 1,
				title: '批量导入被保人信息（上限为' + _this.maxPeople + '人）',
				area: ['870px', '480px'], //宽高
				content: _this.getUploadHtml(),
				cancel: function() {
					layer.open({
						title: '取消上传',
						area: '530px',
						content: '<div class="pt45 pb45 tac">放弃导入？</div>',
						btn: ['不导入', '导入'],
						cancel: function() {
							_this.__uploadStatus = true;
						},
						btn1: function() {
							_this.__uploadStatus = false;
							_this.swapBtn();
							layer.closeAll();
						},
						btn2: function(index) {
							_this.__uploadStatus = true;
							layer.close(index);
						},
					});
					return false;
				}
			});
			_this.swapBtn();
			_this.teamUpload();

		},
		getId: function(id) {
			return typeof id === 'string' ? document.getElementById(id) : id;
		},
		isElement: function(element) {
			return element && element.nodeName ? true : false;
		},
		__swapBtnStatus: true,
		swapBtn: function() {
			if (this.__swapBtnStatus) {
				this.__swapBtnStatus = false;
				$('#uploadExcel1').css({
					visibility: 'visible'
				});
			} else {
				this.__swapBtnStatus = true;
				$('#uploadExcel1').css({
					visibility: 'hidden'
				});
			}
			this.swapNode('uploadExcel1', 'uploadExcel');
		},
		swapNode: function(node1, node2) {
			var n1 = this.getId(node1),
				n2 = this.getId(node2),
				next, parent;
			if (this.isElement(n1) && this.isElement(n2)) {
				if (document.swapNode) {
					n1.swapNode(n2);
				} else {
					next = n1.nextSibling;
					parent = n1.parentNode;
					n2.parentNode.replaceChild(n1, n2);
					parent.insertBefore(n2, next);
				}
				return true;
			}
		},
		__validClassName: 'ok', //验证通过的项
		validateTeam: function() {
			var _this = this,
				status = true,
				scrollStatus = true;
			_this.startTime('验证所有团单');
			_this.teamBody.find('.list-table-row').not('.' + _this.__validClassName).each(function() {
				var li = this;
				if (!_this.validateTeamItem(this)) {
					$(this).addClass(_this.editClassName);
					$(this).removeClass(_this.__validClassName);
					status = false;
					if (scrollStatus) {
						scrollStatus = false;
						var pos = $(li).position();
						_this.teamBody.scrollTop(pos.top + _this.teamBody.scrollTop());
						_this.scrollTo(_this.teamBody);
					}
					_this.updateTemaValue(li);
				} else {
					$(this).addClass(_this.__validClassName);
				}

			});
			_this.endTime('验证所有团单');
			return status;
		},
		validateDateItem: function(dateString) {
			var _this = this,
				date = dateString || '',
				status = true;

			if (!date) {
				return false;
			}
			if (
				_this.dateDifference(_this.insuredDate.minDate, date) < 0 ||
				_this.dateDifference(_this.insuredDate.maxDate, date) > 0
			) {
				status = false;
			}
			return status;
		},
		validateTeamItem: function(wrap) {
			var _this = this,
				status = true,
				lock = true,
				dateLock = true;
			$(wrap)
				.find('input.eidt-item').each(function(item, i) {
					var $that = $(this),
						$parent = $that.parents('li.list-table-row').find('.insure-tips'),
						errorrEmind = $that.data('errorremind') || '',
						attributeid = $that.data('attributeid'),
						isDate = $(this).hasClass('Wdate');


					if (!_this.validate(this)) {
						if (lock) {
							lock = false;
							$parent.text(errorrEmind);
						}
						status = false;
					}
					if (status && attributeid === _this.ATTR_ID_CREDENTIALSINPUT) { //证件号码
						if (!_this.teamCardIdValidate($that)) {
							$that.addClass('input-text-error');
							$parent.text(errorrEmind);
							status = false;
							// return status;
						} else {
							$that.removeClass('input-text-error');
							$parent.text('');
						}
					}
					if (isDate && status) {
						if (!_this.validateDateItem($that.val())) {
							$that.addClass('input-text-error');
							errorrEmind = _this.TEXT_INSURED_DATA_ERROR;
							if (dateLock) {
								dateLock = false;
								if (status) {
									$parent.text(errorrEmind);
								}
							}
							status = false;
						} else {

							if (status) {
								$that.removeClass('input-text-error');
								$parent.text('');
							}

						}
					}
				});
			if (status) {
				$(wrap).find('.insure-tips').text('');
			}
			return status;
		},
		teamItemChange: function(input) {
			var _this = this,
				$input = $(input),
				attributeId = $input.data('attributeid');
			if (attributeId === _this.ATTR_ID_CREDENTIALSTYPE) { //证件类型
				_this.teamCardTypeEvent($input);
			} else if (attributeId === _this.ATTR_ID_CREDENTIALSINPUT) { //证件号码
				_this.teamCardIdEvent($input);
			} else if (attributeId === _this.ATTR_ID_RELATIONINSUREINSURANT) { //关系
				_this.teamRelationEvent($input);
			}
		},
		teamCardTypeEvent: function($input) {
			var _this = this,
				val = $input.data('value'),
				$parent = $input.parents('.credentials-form');
			if (val === _this.ATTR_ID_IDCARD) {
				$parent.find('[name=birthdate]').attr('disabled', true);
				$parent.find('[name=sex]').addClass('disabled').attr('disabled', true);
				$parent.find('[name=cardNumber]').change();
			} else {
				$parent.find('[name=birthdate]').removeAttr('disabled');
				$parent.find('[name=sex]').removeClass('disabled').removeAttr('disabled');
			}
		},
		teamCardIdEvent: function($input) {
			var _this = this,
				status = true,
				cardNum = $input.val(),
				$parent = $input.parents('.credentials-form'),
				cardType = $parent.find('[name=cardTypeName]').data('value');
			if (cardNum && cardType === _this.ATTR_ID_IDCARD) {
				if (_this.identityCodeValid(cardNum)) {
					var $birthdate = $parent.find('[name=birthdate]'),
						$sex = $parent.find('[name=sex]'),
						sex = _this.getSex(cardNum),
						birthdate = _this.getIdDate(cardNum);
					$sex.removeAttr('disabled');
					_this.dropdownSelectItem($sex, sex);
					$sex.attr('disabled', true);
					$birthdate.val(birthdate);
					$birthdate.mouseleave();
				} else {
					status = false;
				}
			}
			return status;
		},
		teamRelationEvent: function($input) { //关系变更
			var _this = this,
				val = $input.data('value'),
				$parent = $input.parents('.credentials-form'),
				$insureModule = $('#module-10');
			if (val === _this.SELFRELATIONTYPE) {
				var $inputList = $parent.find('.form-item');
				$.each($inputList, function() {
					var $this = $(this),
						attributeid = $(this).data('attributeid'),
						value = '',
						$insureInput = $insureModule.find('[data-attributeid=' + attributeid + ']');
					value = $insureInput.val();
					if ($insureInput.hasClass('hz-radio-item')) {
						value = $insureModule.find('[data-attributeid=' + attributeid + '].hz-radio-item-checked').attr('value');
					}
					if ($this.hasClass('hz-dropdown')) {
						if (value) {
							_this.dropdownSelectItem($this, value);
						}
					} else {
						$this.val(value);
						$this.change();
						$this.trigger('blur');
					}
				});
			}
		},
		teamCardIdValidate: function($input) {
			var _this = this,
				status = true,
				cardNum = $input.val(),
				$parent = $input.parents('.credentials-form'),
				cardType = $parent.find('[name=cardTypeName]').data('value');
			if (!cardNum) {
				status = false;
				return status;
			}
			if (cardType === _this.ATTR_ID_IDCARD) {
				if (!_this.identityCodeValid(cardNum)) {
					status = false;
				}
			}
			return status;
		},
		setCloseStatus: function(all) { //删除状态，最后一个无法删除
			// var $close = this.teamBody.find('.close');
			var isAll = all || false;
			// if (this.teamNum <= 1) {
			// 	$close.hide();
			// } else {
			// 	$close.show();
			// }
			this.startTime('设置状态');
			this.setTeamStatus();
			this.endTime('设置状态');
			//todo
			this.startTime('初始化日期');
			this.initCalendar();
			this.endTime('初始化日期');

			if (!isAll) {
				this.startTime('验证证件类型');
				this.teamBody.find('[name=cardTypeName]').change();
				this.endTime('验证证件类型');
			}


		},
		setTeamStatus: function() { //设置团单数量
			var _this = this;
			_this.resetTotalPrice(); //重新计算价格
			_this.insuredNumber.html(_this.teamNum + '/' + _this.maxPeople);
		},
		deleteTeamItem: function(ev) { //删除项
			var _this = this,
				$close = _this.teamBody.find('.close');
			this.confirm(
				this.TEXT_DEL,
				function() {
					var $parent = $(ev.target).parents('.list-table-row');
					$parent.remove();
					delete _this.teamData[$parent.attr('id')];
					_this.teamNum--;
					//_this.setTeamStatus();
					_this.setCloseStatus();
					//_this.updateTeamIndex();
					delete _this.teamInfo[$parent.data('index')];
					_this.isTrialChange = true;
				});
		},
		deleteTeamItemActually: function($item) {
			var _this = this,
				$parent = $item;
			$parent.remove();
			delete _this.teamData[$parent.attr('id')];
			_this.teamNum--;
			//_this.setTeamStatus();
			_this.setCloseStatus();
			//_this.updateTeamIndex();
			_this.isTrialChange = true;
		},
		scrollTeamBottom: function() { //滚动到底部
			try {
				this.teamBody.scrollTop(this.teamBody[0].scrollHeight - 700);
			} catch (ev) {}
		},
		addTeamItem: function(obj) { //添加项
			var _this = this,
				addItem = obj || {
					name: '',
					idType: '1',
					idNumber: '',
					moblie: ''
				};
			this.teamBody.append(this.renderTeamItem(addItem, {
				addClass: _this.editClassName
			}));
			_this.teamNum++;
			//_this.teamIndexs++;
			this.scrollTeamBottom();
			_this.isTrialChange = true;
			_this.eventDrowDown(_this.teamBody);
		},
		updateTemaValue: function(wrap) {

			$(wrap)
				.find('.eidt-item').each(function() {
					var val = $(this).data('text') || $(this).val() || '';
					var text = $(this).parent().find('span.text-item');
					text.text(val);
				});

		},
		updateTeamIndex: function() {
			var _this = this;
			// this.teamBody.find('.insure-team-index').each(function(i) {
			// 	$(this).text(_this.completionNumber(i + 1));
			// });
			//_this.initCalendar();
			//_this.resetTotalPrice(); //重新计算价格
		},
		teamFileType: true, //模板类型是否正确
		teamAccept: ['xlsx', 'xls'],
		__uploadStatus: true, //上传状态，用于取消上传
		__uploadProgressInterval: '', //用于假的进度条
		__progessNum: 0, //进度
		teamUpload: function() { //上传
			var _this = this;
			var $progressExcel = $('#progressExcel');
			var $progressExcelText = $progressExcel.find('span');
			try {
				_this.uploader.reset();
			} catch (ev) {}
			$('#uploadExcel1').html('上传Excel文档');
			//创建上传实例
			_this.uploader = new WebUploader.Uploader({
				auto: true,
				swf: _this.uploadSWFUrl,
				server: _this.uploadUrl,
				fileSingleSizeLimit: _this.SIZE_UPLOAD_EXCEL * _this.SIZE_FILE,
				accept: { //指定接受哪些类型的文件
					title: 'filetype', //文字描述
					extensions: 'xlsx,xls' //允许的文件后缀，不带点，多个用逗号分割。
				}
			});

			_this.uploader.addButton({
				id: '#uploadExcel1' //innerHTML: '测试'
			});

			//还原进度条
			setProgess(0);
			_this.__uploadStatus=true;

			//错误处理
			_this.uploader.on('error', function(errorType, err) {
				var message = '';
				_this.info(errorType, err);

				switch (errorType) {
					case 'F_EXCEED_SIZE':
						message = _this.TEXT_UPLOAD_MAX_SIZE_FN();
						break;
					case 'Q_TYPE_DENIED':
						message = _this.TEXT_UPLOAD_FORMAT_ERROR;
						break;
				}
				_this.message.show(message, 'warning', _this.messageTimeOut);
			});

			//上传开始
			_this.uploader.on('uploadStart', function(file) {
				var fileName = file.name,
					resultFileName = '',
					html = _this.getUploadingHtml();

				//$('#uploadArea').hide();
				$('#uploadArea').css({
					visibility: 'hidden'
				});

				_this.teamFileType = true;
				if ($.inArray(file.ext, _this.teamAccept) === -1) {
					_this.teamFileType = false;
				}

				if (!_this.teamFileType) {
					_this.message.show(_this.TEXT_UPLOAD_FORMAT_ERROR, 'warning', _this.messageTimeOut);
					$('#uploadArea').css({
						visibility: 'visible'
					});
					return;
				}
				$('#progressArea').show();

				if (fileName.length > 30) {
					resultFileName = fileName.substr(0, 30) + '...';
				} else {
					resultFileName = fileName;
				}
				$('#excelFileName')
					.attr('title', fileName)
					.text(resultFileName);
				_this.startTime('上传Excel时间');

				_this.__progessNum = 0;
				_this.__uploadProgressInterval = setInterval(function() {
					_this.__progessNum += _this.getRandomRange(0, 10);

					setProgess(_this.__progessNum);
					if (_this.__progessNum > 100 || _this.__progessNum > _this.getRandomRange(70, 100)) {
						//_this.__progessNum = 100;
						//setProgess(_this.__progessNum);
						clearInterval(_this.__uploadProgressInterval);
					}
				}, 50);

			});

			//进度条
			///_this.uploader.on('uploadProgress', function(file, number) {
			function setProgess(num) {
				var progreess = num + '%';
				//debugger;
				if (num > 100) {
					progreess = '100%';
				}
				$progressExcel
					.css({
						width: progreess
					});
				$progressExcelText.text(progreess);

			}


			//成功回调
			_this.uploader.on('uploadSuccess', function(files, response) {


				//return;
				var res = response || {},
					result = res.result || [0],
					fileId = result[0].fileId;

				if (!_this.__uploadStatus) {
					return;
				}
				//设置为完成
				setProgess(100);
				_this.__progessNum = 0;
				_this.swapBtn();
				layer.closeAll();
				_this.message.show(_this.TEXT_PARSE_EXCEL, 'loading', _this.messageTimeOut);
				_this.endTime('上传Excel时间');
				_this.info('文件ID', fileId);
				_this.parseExcel(fileId);



			});
			//出错回调
			_this.uploader.on('uploadError', function(file, number) {
				_this.info(file);
			});

		},
		parseExcel: function(fileId) { //解析Excel
			var _this = this;
			if (!_this.teamFileType) {
				return;
			}

			_this.startTime('Java解析Excel时间');
			$.ajax({
				url: _this.parseExcelUrl,
				type: 'get',
				data: {
					fileId: fileId,
					type: _this.teamTemplateType
				},
				success: function(data) {
					_this.message.hide();
					_this.endTime('Java解析Excel时间');
					layer.closeAll();
					if (data.status !== '00000') {
						_this.error(data.message);
					} else {
						_this.renderTeam(data);
					}
				},
				error: function(err) {
					layer.closeAll();
					_this.error(err.status, err);
				},
				complete: function() {

				}
			});
		},

		renderTeamWarp: function() {
			var _this = this,
				result = [],
				items;

			if (_this.teamTemplateType === 2) {
				_this.tableTitleItem.splice(1, 0, '英文名');
			}
			items = _this.tableTitleItem || [];
			result.push('<div class="person-write-info ">');
			result.push('<div class="team-template-' + _this.teamTemplateType + '">');
			result.push('<div class="insured-list list-table-wrap">');
			result.push('<ul class="list-table list-table-head">');
			result.push('<li class="list-table-row list-table-row-editing">');
			items.forEach(function(item, i) {
				result.push('<div class="cell cell0' + (i + 1) + '">');
				result.push('<div class="cell-inner">' + item + '</div>');
				result.push('</div>');
			});
			result.push('</li>');
			result.push('</ul>');

			result.push('<ul class="list-table list-table-body" id="teamBody"></ul>');

			result.push('</div>');
			result.push('</div>');

			result.push('<dd class="last-item mt10 tar">');
			//result.push('<a href="javascript:;" type="team" class="add-link f12"><i class="iconfont fc9 f22 mr5">&#xe70c;</i>新增被保险人</a>');
			//result.push('<a href="javascript:;" class="f12 ml40 upload-excel" id=""><i class="iconfont fc9 f22 mr5">&#xe701;</i>批量导入被保人</a>');
			result.push('</dd>');
			result.push('</div>');
			return result.join('');
		},
		renderTeamHeader: function() {
			var result = [];
			return result.join('');
		},
		renderTeamViewItem: function(teamItem) {
			var _this = this,
				item = teamItem || {},
				result = [],
				buyCount = _this.trialPrice.buyCount || 1;

			result.push('<tr>');
			//result.push('<td>' + _this.completionNumber(item.index) + '</td>');
			result.push('<td>' + item.name + '</td>');
			if (_this.teamTemplateType === 2) {
				result.push('<td>' + item.eName + '</td>');
			}
			var relationshipType = _this.getRelationship[item.rType] || _this.getRelationship[23];

			result.push('<td>' + (_this.getRelativeShip(item.idType)) + '</td>');
			result.push('<td>' + item.idNumber + '</td>');
			result.push('<td>' + (item.sex || '男') + '</td>');
			result.push('<td>' + item.birthdate + '</td>');
			result.push('<td>' + relationshipType + '</td>');

			result.push('<td>' + buyCount + '份</td>');
			result.push('</tr>');

			return result.join('');
		},
		tableTitleItem: ['姓名', '证件类型', '证件号码', '性别', '出生日期', '与投保人关系', '份数'],
		__getNameHTML: function(item, cAttr) { //获取姓名HTML
			var _this = this,
				attr = cAttr + ' name="cName" data-attributeid="' + _this.ATTR_ID_NAME + '" data-name="姓名" ';
			return '<input type="text" class="insure-team-input input-text insure-form form-item eidt-item"  value="' + item + '" data-defaultRemind="" data-errorremind="' + _this.insuredNameRegErrorText + '" data-required="1" data-regex="' + _this.insuredNameReg + '" ' + attr + '/>';
		},
		__getENameHTML: function(item, cAttr) { //获取英文名HTML
			var _this = this,
				attr = cAttr + ' name="eName" data-attributeid="' + _this.ATTR_ID_ENAME + '" data-name="英文名" ';
			return '<input type="text" class="insure-team-input input-text insure-form form-item eidt-item"  value="' + (item || '') + '" data-defaultRemind="" data-errorremind="' + (_this.insuredENameErrorRemind || '') + '" data-required="1" data-regex="' + (_this.insuredENameReg || '') + '" ' + attr + '/>';
		},
		__getTypeHtml: function(item, cAttr) { //获取证件类型
			var _this = this,
				val = item || 1,
				attr = cAttr + ' name="cardTypeName" data-attributeid="' + _this.ATTR_ID_CREDENTIALSTYPE + '" ' + ' data-name="证件类型" data-text="' + _this.getRelativeShip(val) + '" ';
			return _this.renderSelect({
				attr: attr,
				listWidth: '150',
				addClass: ' eidt-item insure-code-type ',
				value: val
			});
		},
		__getCodeHTML: function(item, type, cAttr) { //获取证件号码HTML
			var _this = this,
				_type = type || 1,
				attr = cAttr + '  name="cardNumber" data-attributeid="' + _this.ATTR_ID_CREDENTIALSINPUT + '" ' + ' data-name="证件号码" data-regex="' + (_this.cardNumRegex[_type] || '') + '" data-required="' + _this.insuredCardNumberRequire + '" data-errorremind="' + _this.insuredCardRegErrorText + '" ';
			return '<input type="text" class="insure-team-input input-text insure-form form-item insure-code eidt-item" value="' + item + '" ' + attr + '/>';
		},
		__getRelationshipHTML: function(item, cAttr) { //获取关系HTML
			var _this = this,
				attr = cAttr + ' name="relationInsureInsurant" data-attributeid="' + _this.ATTR_ID_RELATIONINSUREINSURANT + '" ' + ' data-name="与投保人关系" data-text="' + _this.getRelationship[item] + '" ';
			return _this.renderSelect({
				attr: attr,
				listWidth: '150',
				addClass: 'eidt-item',
				list: _this.relationship || [],
				value: item || 3
			});
		},
		__getBirthdayHTML: function(item, cAttr) { //获取出生日期HTML
			var _this = this,
				attr = cAttr + ' name="birthdate" data-required="1" data-attributeid="' + _this.ATTR_ID_BIRTHDATE + '" ';
			return '<input class="insure-team-input Wdate insure-tel insure-form form-item eidt-item" value="' + (item || '') + '" type="text" ' + attr + ' readonly data-calendartype="team" data-type="team"/>';
		},
		__getDelHTMl: function() { //获取删除HTML
			return '<a class="close ml5" title="删除" href="javascript:;"><i class="iconfont">&#xe70a;</i></a>';
		},
		__getSexHTML: function(item, cAttr) { //获取性别HTML
			var _this = this,
				val = item || 1,
				attr = cAttr + ' name="sex" data-attributeid="' + _this.ATTR_ID_SEX + '" ' + ' data-name="性别" data-text="' + (item || '男') + '" ';
			return _this.renderSelect({
				attr: attr,
				listWidth: '50',
				list: [{
					text: '男',
					value: 1
				}, {
					text: '女',
					value: 0
				}],
				addClass: 'eidt-item insure-sex ',
				value: _this.sex[val]
			});
		},
		sex: {
			'男': 1,
			'女': 0
		},
		teamData: {},
		renderTeamItem: function(item, options) {
			var _this = this,
				ops = options || {},
				teamTemplateType = _this.teamTemplateType,
				obj = item || {},
				addClass = ops.addClass || '',
				result = [],
				relationship = _this.relationship || [],
				_attr = ' data-moduleid="' + _this.MODULES_ID_INSURED + '" ',
				type = 1,
				//teamIndex = ops.index || _this.teamIndexs,
				getRandomId = _this.getRandomId(),
				buyCount = _this.trialPrice.buyCount || 1,
				moblie = obj.moblie || '',
				items = [
					obj.name, //姓名
					obj.idType || '1', //证件类型
					obj.idNumber, //证件号码
					obj.sex || '男', //性别
					obj.birthdate, //联系方式
					obj.rType || '23', //关系
					buyCount + '份<input type="hidden" ' + _attr + ' name="buyCount" value="' + buyCount + '" />'
				],
				len = 6;
			if (teamTemplateType === 2) {
				items.splice(1, 0, item.eName);
				len = 7;
			}
			_this.teamData[getRandomId] = {};
			_this.teamIndexs++;
			result.push('<li class="list-table-row list-table-row-editing ' + addClass + ' ' + _this.insureFormClassName + '" id="' + getRandomId + '" data-index="' + _this.teamIndexs + '">');
			$.each(items, function(i, item) {
				var itemStyle = 'text-item';
				result.push('<div class="cell cell0' + (i + 1) + '">');
				result.push('<div class="cell-inner">');

				if (i === len) {
					itemStyle = '';
				}
				if (teamTemplateType === 2) { //境外模板
					//__getENameHTML
					if (i === 3) {
						result.push('<span class="' + itemStyle + '">' + _this.getRelativeShip(item) + '</span>');
					} else if (i === 5) {
						var rTypeText = _this.getRelationship[item] || _this.getRelationship[23];
						result.push('<span class="' + itemStyle + '">' + rTypeText + '</span>');
					} else {
						result.push('<span class="' + itemStyle + '">' + item + '</span>');
					}
					switch (i) {
						case 0:
							result.push(_this.__getNameHTML(item, _attr));
							break;
						case 1:
							result.push(_this.__getENameHTML(item, _attr));
							break;
						case 2:
							type = item;
							result.push(_this.__getTypeHtml(item, _attr));
							break;
						case 3:
							result.push(_this.__getCodeHTML(item, type, _attr));
							break;
						case 4:
							result.push(_this.__getSexHTML(item || '男', _attr));
							break;
						case 5:
							result.push(_this.__getBirthdayHTML(item, _attr));
							break;
						case 6:
							result.push(_this.__getRelationshipHTML(item, _attr));
							break;
						case 7:
							result.push(_this.__getDelHTMl());
							break;
					}
				} else { //境内模板
					if (i === 2) {
						result.push('<span class="' + itemStyle + '">' + _this.getRelativeShip(item) + '</span>');
					} else if (i === 4) {
						var relationshipType = _this.getRelationship[item] || _this.getRelationship[23];
						result.push('<span class="' + itemStyle + '">' + relationshipType + '</span>');
					} else {
						result.push('<span class="' + itemStyle + '">' + item + '</span>');
					}
					switch (i) {
						case 0: //姓名
							result.push(_this.__getNameHTML(item, _attr));
							break;
						case 1: //证件类型
							type = item;
							_this.teamData[getRandomId]['type'] = item;
							result.push(_this.__getTypeHtml(item, _attr));
							break;
						case 2: //证件号码
							_this.teamData[getRandomId]['code'] = item;
							result.push(_this.__getCodeHTML(item, type, _attr));
							break;
						case 3: //性别
							result.push(_this.__getSexHTML(item || '男', _attr));
							break;
						case 4: //出生日期
							result.push(_this.__getBirthdayHTML(item, _attr));
							break;
						case 5: //与投保人关系
							result.push(_this.__getRelationshipHTML(item, _attr));
							break;
						case 6: //人数
							result.push(_this.__getDelHTMl());
							break;
					}
				}
				result.push('</div>');
				result.push('</div>');
			});
			if (moblie) {
				result.push('<input type="hidden" name="moblie" value="' + moblie + '" data-moduleid="" />');
			}
			result.push('<div class="insure-tips write-info-error"></div>');
			result.push('</li>');
			return result.join('');
		},
		teamNum: 0, //团单人数
		showTeamError: function(options) {
			var _this = this,
				ops = options || {},
				//text = _this.TEXT_IMPORT_ERROR + '<br />',
				area = ['530px', '200px'],
				content = '';
			if (ops.type === 'min') {

				layer.open({
					type: 1,
					title: false,
					btn: ['确定'],
					//skin: 'layui-layer-rim', //加上边框
					area: area, //宽高
					content: '<div class="mt30 pt30 tac" ><br />每单最少添加<span class="primary-color">' + _this.minPeople + '</span>个被保人，请添加被保人！</div>'
				});

			} else if (ops.type === 'max') {

				layer.open({
					type: 1,
					title: false,
					btn: ['确定'],
					area: area,
					content: '<div class="mt30 pt30 tac" >每单最多添加<span class="primary-color">' + _this.maxPeople + '</span>个被保险人，超出请分开投保！</div>',
					end: function() {
						//_this.showUploadExcel();
					}
				});

			} else if (ops.type === 'tpl') {

				layer.open({
					type: 1,
					title: false,
					area: area,
					content: '<div class="mt30 pt30 tac" >' + _this.TEXT_TEMPLATE_ERROR + '</div>',
					end: function() {
						_this.showUploadExcel();
					},
					btn: ['确定']
				});
			}

		},
		getTeamViewResultHtml: function() {

			var result = [];
			result.push('<div class="name-list-dialog p20">');
			result.push('<div class="file-upload-complete">');
			result.push('<table class="hz-table ">');
			result.push('<thead>');
			result.push('<tr class="tal">');
			this.tableTitleItem.forEach(function(item) {
				result.push('<th>' + item + '</th>');
			});
			result.push('</tr>');
			result.push('</thead>');
			result.push('<tbody id="teamView">');
			result.push('</tbody>');
			result.push('</table>');
			result.push('</div>');
			result.push('</div>');
			return result.join('');

		},
		isTeamEmpty: function() { //如果团单为空
			var _this = this,
				status = true;
			if (_this.teamNum === 1) {
				_this.teamBody.find('.input-text').each(function() {
					if ($.trim($(this).val()) !== '') {
						status = false;
					}
				});
			}
			return status;
		},
		teamItemInfo: [],
		teamInfo: {},
		teamIndexs: 1,
		renderTeam: function(data, fillData) { //渲染团单,fillData是否直接填充
			var _this = this,
				result = [],
				resultView = [],
				dataResult = data.result || {},
				type = dataResult.type,
				list = dataResult.teamPersonInfoList || [],
				teamLenth = 0,
				emptyLength = 0,
				arr = [],
				obj = {}; //保存类型与证件号码;
			if (type !== _this.teamTemplateType) {
				//_this.message.show(_this.TEXT_TEMPLATE_ERROR, 'warning', _this.messageTimeOut);
				_this.showTeamError({
					type: 'tpl'
				});
				return;
			}
			if (_this.isTeamEmpty() && _this.teamNum === 1) {
				emptyLength = 1;
				_this.teamNum = 0;
			} else {
				emptyLength = 0;
			}

			if (_this.teamNum + list.length - emptyLength > _this.maxPeople) {

				_this.showTeamError({
					type: 'max'
				});
				return;
			}
			_this.startTime('JS渲染Excel时间');

			if (!fillData) {
				//显示预览结果
				layer.open({
					type: 1,
					title: '上传入' + list.length + '人',
					area: ['870px', '480px'], //宽高
					btn: ['取消', '导入'],
					btn1: function(index) {
						layer.close(index);
					},
					btn2: function(index) {

						if (_this.isTeamEmpty() && !_this.teamNum) {
							_this.teamBody.find('.list-table-row').remove();
						}
						_this.startTime('导入团单总时间');
						_this.startTime('导入团单时间');
						_this.teamBody.append(result.join(''));
						_this.endTime('导入团单时间');
						//_this.updateTeamIndex();
						_this.teamNum += teamLenth;
						_this.setCloseStatus(true);
						_this.endTime('导入团单总时间');
						layer.close(index);
						_this.teamBody.find('[data-attributeid=' + _this.ATTR_ID_CREDENTIALSTYPE + ']').change();
						//_this.teamItemInfo.push(arr);
						_this.validateTeam();
						$.extend(_this.teamInfo, obj);
					},
					content: _this.getTeamViewResultHtml()

				});
			}
			list.forEach(function(item) {
				if (item.birthdate && item.birthdate.replace(/\s/g, "")) {
					try {
						var birthdate = new Date(item.birthdate.replace(/\s/g, ""));
						if (!birthdate||isNaN(birthdate.getDay())) {
							item.birthdate = "";
						}else {
							var birthdateText = _this.getCurrentTime(birthdate);
							// if (_this.dateDifference(_this.insuredDate.minDate, birthdateText) >= 0 &&
							// 	_this.dateDifference(birthdateText, _this.insuredDate.maxDate) >= 0) {
							item.birthdate = birthdateText;
							// } else {
							// 	item.birthdate = "";
							// }
						}
					} catch (ex) {
						item.birthdate = "";
					}
				}
				if (item.moblie && item.moblie.replace(/\s/g, "")) {
					item.moblie = item.moblie.replace(/\s/g, "");
					if (!helper.CheckMobile(item.moblie)) { //如果不是手机号码则置空手机号码
						item.moblie = "";
					}
				}
				teamLenth++;
				//_this.teamIndexs++;
				result.push(_this.renderTeamItem(item));
				resultView.push(_this.renderTeamViewItem(item));
				if (item.idType !== undefined && item.idNumber.length) {
					arr.push({
						code: item.idNumber,
						type: item.idType
					});

					obj[_this.teamIndexs] = {
						code: item.idNumber,
						type: item.idType
					};
				}
			});

			$('#teamView').append(resultView.join(''));

			_this.endTime('JS渲染Excel时间', function(a, b) {

				_this.__renderTeams.push(a);
				_this.caleRenderTeam();
			});
			_this.setCloseStatus();
			if (fillData) {
				$('#teamBody').append(result.join(''));
				//_this.updateTeamIndex();
			}
			_this.eventDrowDown(_this.teamBody);

		},

		//判断是否已经有相同联系人
		getSameContacts: function(options) {
			var _this = this,
				ops = options || {},
				type = ops.type || '',
				code = ops.code || '',
				status = false,
				html, $html, arr = [];
			if (!(type && code)) {
				return status;
			}
			// html = _this.teamBody.wrapAll();
			// $html = $(html).find('li.list-table-row');
			// $html.each(function(index, item) {
			// 	var _type = $(item).find('.insure-code-type').data('value') || '',
			// 		_code = $(item).find('.insure-code').val() || '';

			// 	if (_type && _code && _type === type && _code === code) {
			// 		status = true;
			// 		return false;
			// 	}
			// });
			// _this.teamBody.find('.list-table-row').each(function(index) {
			// 	_this.teamItemInfo.push({
			// 		type: '',
			// 		code: ''
			// 	});
			// });
			_this.teamItemInfo = [];
			_this.startTime('判断是否已经有相同联系人');
			$.each(_this.teamInfo, function(key, obj) {

				_this.teamItemInfo.push({
					type: obj.type,
					code: obj.code
				});

			});
			$.each(_this.teamItemInfo, function(index, item) {
				if (type === item.type && code === item.code) {
					status = true;
				}
			});
			_this.endTime('判断是否已经有相同联系人');
			return status;
		},
		__renderTeams: [],
		caleRenderTeam: function() {
			var sum = 0;
			$.each(this.__renderTeams, function(i, item) {
				sum += item;
			});
			_this.logRed('平均时间：' + sum / this.__renderTeams.length);
		},
		__selectIndex: 0,
		relativeShip: {
			1: '身份证',
			2: '护照',
			3: '出生证',
			4: '驾照',
			5: '港澳通行证',
			6: '军官证',
			7: '台胞证',
			8: '警官证',
			9: '港澳台回乡证',
			99: '其他'
		},
		getRelativeShip: function(key) {
			var _key = key || 1;
			return this.relativeShip[_key] || '身份证';
		},
		renderSelect: function(options) { //渲染下拉
			var _this = this,
				ops = options || {},
				result = [],
				listWidth = ops.listWidth || '',
				attr = ops.attr,
				addClass = ops.addClass || '',
				list = ops.list || _this.cardTypeArr || [{
					text: '身份证',
					value: 1
				}, {
					text: '护照',
					value: 2
				}, {
					text: '其他',
					value: 99
				}],
				val = ops.value || '',
				lis = [],
				defaultValue = '',
				defaultText = '',
				dropDownItem = _this.__selectIndex + '-select';
			_this.__selectIndex++;
			list.forEach(function(item, i) {
				var obj = item || {};
				var style = '';
				if (+val === +item.value) {
					style = ' hz-select-option-selected ';
					defaultValue = item.value;
					defaultText = item.text;
				}
				lis.push('<li class="hz-select-option ' + style + ' " data-value="' + obj.value + '" data-default-value="' + obj.value + '">' + obj.text + '</li>');
			});
			result.push('<div class="hz-dropdown form-item insure-form form-item ' + addClass + ' " data-value="' + (defaultValue || 1) + '" data-dropdown="' + dropDownItem + '" ' + attr + ' data-width="' + listWidth + '" data-show="body" data-type="team">');
			result.push('<div class="input-select"><span class="input-select-text more-tag no-select">' + defaultText + '</span><b class="iconfont">&#xe70b;</b></div>');
			result.push('<div class="hz-dropdown-content" dddd="dd" style="width:' + listWidth + '" data-dropdown-item="' + dropDownItem + '">');
			result.push('<ul class="hz-dropdown-menu">');
			result.push(lis.join(''));
			result.push('</ul>');
			result.push('</div>');
			result.push('</div>');
			return result.join('');
		}
	};
	return InsureTeam;
});