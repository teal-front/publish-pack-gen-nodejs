define([
	"helper"
], function(
	helper
) {
	'use strict';
	/*
	 * @constructor InsurePost
	 * @author 
	 * @version 0.0.1
	 * @description 数据提交
	 */
	var InsurePost = function() {

	};
	var commitData;
	var MODULE_EXP = ".field-item *[data-moduleid],.saveContract *[data-moduleid]"; //获取字段jquey选择器
	InsurePost.prototype = {
		isSubmiting: false, //正在提交数据
		initPost: function() {},
		submit: function() { //提交数据
			//this.submitStatus===true;
			if (this.isSubmiting) {
				return;
			}
			var _this = this,
				data = _this.getPostData(),
				url = "/api/insurance-slips/" + _this.insurance.insureNum;
			if (!_this.validatePostData(data)) { //数据组装好后的校验
				return;
			}
			_this.isSubmiting = true;
			_this.message.show(_this.TEXT_SUBMIT, 'loading');
			helper.request.postData2({
				url: url,
				data: data,
				method: "PUT"
			}, function(data) {
				_this.message.hide();
				_this.isSubmiting = false;
				if (!data.message) {
					if (data.result.priceTableChange) { //费率表更新影响价格
						var priceTableChange = _this.saveCallBackErr('priceTableChange');
						priceTableChange();
						return;
					}
					if (data.result.settlementUuid) { //有unid直接跳
						location.href = "/orders/settlement/" + data.result.settlementUuid;
						return;
					}
					if (!data.result.insureResponseInfo.errorCode) {
						// if (data.result.insureResponseInfo.errorCode) {
						// 	_this.showSaveError(data.result.insureResponseInfo);
						// 	return;
						// }
						var payArray = [{
							insuranceNum: data.result.insureNum,
							premium: data.result.restrictRule.preminum
						}];
						helper.request.postData2({
							url: "/api/orders/settlement",
							data: payArray
						}, function(result) {
							if (result.result.insuranceResult && result.result.insuranceResult.errorMsg) {
								_this.message.show(result.result.insuranceResult.errorMsg, "error");
								return;
							}
							if (result.result.uuid) {
								location.href = "/orders/settlement/" + result.result.uuid;
							}
						});
					} else {
						_this.currrentUserId = data.result.userId;
						_this.showSaveError(data.result.insureResponseInfo);
					}
				}
			}, function(data) {
				_this.message.hide();
				_this.isSubmiting = false;
				layer.msg(data.message);
				if (data.status === 10312) {
					setTimeout(function() {
						window.location.href = '//i.huize.com/?url=policy/policyAll';
					}, 2000);
				} else {

				}
			});
		},
		againSubmit: false,
		saveToShopCar: function() {
			if (this.isSubmiting) {
				return;
			}
			var _this = this,
				data = _this.getPostData(true),
				url = "/api/insurance-slips/" + _this.insurance.insureNum;
			_this.message.show(_this.TEXT_SUBMIT, 'loading');
			_this.isSubmiting = true;
			helper.request.postData2({
				url: url,
				data: data,
				method: "PUT"
			}, function(data) {
				_this.message.hide();
				_this.isSubmiting = false;
				if (!data.message) {
					if (data.result.priceTableChange) { //费率表更新影响价格
						var priceTableChange = _this.saveCallBackErr('priceTableChange');
						priceTableChange();
						return;
					}
					if (!data.result.insureResponseInfo.errorCode) {
						// if (data.result.insureResponseInfo.errorCode === '37115') {
						// 	_this.showSaveError(data.result.insureResponseInfo);
						// 	return;
						// }
						layer.msg("保存成功");
						//if (_this.isProjectPolicy) {
						setTimeout(function() {
							window.location.href = '//is.huize.com/shopping-cart/';
						}, 2000);
						//}
					} else {
						_this.currrentUserId = data.result.userId;
						_this.showSaveError(data.result.insureResponseInfo);
					}
				} else {
					_this.currrentUserId = data.result.userId;
					_this.showSaveError(data.result.insureResponseInfo);
				}
			}, function(data) {
				_this.message.hide();
				_this.isSubmiting = false;
				layer.msg(data.message);
			});
		},
		getPostData: function(temp) { //组装POST数据
			var _this = this,
				_cardList;
			commitData = {};
			commitData.frontVipPrice = _this.totalPrice;
			commitData.againSubmit = _this.againSubmit;
			commitData.genes = _this.insurance.genes;
			//commitData.insureinsurantType = _this.insurantTypeArr[0] + _this.insurantTypeArr[1];
			commitData.applicantPersonInfo = _this.getDataByModule("module-10"); //获取投保人信息
			commitData.insuredPersonInfoList = _this.getDataByModule("module-20"); //获取被投保人信息
			commitData.urgencyContactInfo = _this.getDataByModule("module-101"); //紧急联系人
			commitData.dynamicModuleInfoList = _this.getdynamicModule(); //获取动态模块信息
			commitData.insureNum = _this.insurance.insureNum;
			commitData.inShoppingCart = false;
			if (temp) { //如果是保存到购物车则计算未填数目
				commitData.mandatoryAttributeFillSize = _this.getmandatoryAttributeFill();
				commitData.jumpSettlement = false;
			} else {
				commitData.mandatoryAttributeFillSize = _this.getAttributeControl();
				commitData.jumpSettlement = true;
			}
			commitData.mandatoryAttributeTotalSize = _this.getAttributeControl();
			_cardList = $("[name='idCardFileIDList']").val().split(",");
			commitData.idCardFileIDList = $.grep(_cardList, function(e) { //删除空元素
				return e !== "";
			});
			commitData.insuranceDateInfo = _this.getDataByModule("module-102");
			commitData.deallineText = "";
			commitData.planId = _this.productPlanId;
			commitData.productId = _this.productId;
			commitData.tryVerify = _this.submitStatus;
			commitData.agree = $('#clauseInfo').hasClass('hz-check-item-checked');
			commitData = _this.getRelations(commitData);
			if (typeof console != "undefined") {
				console.log(commitData);
			}
			return commitData;
		},
		validatePostData: function(data) { //数据组装好后的校验
			var _this = this,
				status = true;
			if (!_this.validateInsurantRelation(data)) {
				status = false;
			}
			if (!_this.validateInsurantSelfInfo(data)) {
				status = false;
			}
			return status;
		},
		postCallback: function(result) { //提交数据后回调

		},
		getdynamicModule: function() { //获取动态模块信息
			var $moduleItem,
				dynamicModules = [],
				keylist = [],
				_this = this,
				moduleItem,
				moduleId,
				hiddenList;
			$("#insureBox .insure-step-body  .credentials-form[data-index]").each(function() {
				moduleItem = {};
				$moduleItem = $(this);
				if ($moduleItem.attr("id") && !$moduleItem.hasClass('list-table-row')) { //不是团单信息
					moduleId = $moduleItem.attr("id").split("-")[1];
					if ((moduleId.length === 3 && moduleId !== "102") || moduleId === "40") { //过滤掉起保日期
						keylist = $("*[data-moduleid],*[data-moduleid][type='hidden']", $moduleItem);
						moduleItem.data = _this.getKeyValueByModule(keylist);
						moduleItem.moduleId = moduleId;
						dynamicModules.push(moduleItem);
					}
				}
			});
			return dynamicModules;
		},
		getDataByModule: function(module) { //根据模块ID获取相应字段,组装数据并放回
			var $module = $("#" + module + ":visible"),
				_this = this,
				$keyList;

			if (!$module.length) {
				return;
			}
			switch (module) {
				case "module-20":
					var insurantList = [],
						insurantItem = {},
						$dataInsuranttype = $("#module-20 *[data-insuranttype]:visible"),
						insurantType = $dataInsuranttype.attr("data-insuranttype");
					if (insurantType === "more") {
						$("#addMoreBox .person-write-info").each(function() {
							$keyList = $(MODULE_EXP, this); //过滤受益人
							insurantItem = _this.getKeyValueByModule($keyList);
							insurantItem.insureBeneficiaryType = $(this).find('.beneficiarytype-select  .hz-select-option-selected').attr('value') || 1;
							insurantItem.beneficiaryList = _this.getBeneficiarylist($(this));
							insurantItem.genes = JSON.stringify(JSON.parse($(".credentials-form", this).attr("data-genes")).genes);
							commitData.genes = JSON.parse(insurantItem.genes);
							insurantList.push(insurantItem);
						});
						commitData.insureinsurantType = 22;
					} else if (insurantType === "myself") { //为本人投保
						$keyList = $(MODULE_EXP, $module.find('[data-insuranttype=myself]'));
						insurantItem = _this.getKeyValueByModule($keyList);
						insurantItem.insureBeneficiaryType = $module.find('[data-insuranttype=myself] .beneficiarytype-select  .hz-select-option-selected').attr('value') || 1;
						commitData.applicantPersonInfo = $.extend({}, commitData.applicantPersonInfo, insurantItem);
						commitData.genes = JSON.parse($dataInsuranttype.attr("data-genes")).genes;
						commitData.applicantPersonInfo.beneficiaryList = _this.getBeneficiarylist($module);
						commitData.insureinsurantType = 20;
					} else if (insurantType === "team") { //团单
						$("#teamBody > li").each(function() {
							$keyList = $("*[data-moduleid]", this);
							insurantItem = _this.getKeyValueByModule($keyList);
							insurantList.push(insurantItem);
						});
						commitData.insureinsurantType = 30;
					} else {
						$keyList = $(MODULE_EXP, $module.find('[data-insuranttype=others]'));
						insurantItem = _this.getKeyValueByModule($keyList);
						insurantItem.insureBeneficiaryType = $module.find('[data-insuranttype=others] .beneficiarytype-select  .hz-select-option-selected').attr('value') || 1;
						insurantItem.beneficiaryList = _this.getBeneficiarylist($module);
						insurantItem.genes = JSON.stringify(JSON.parse($dataInsuranttype.attr("data-genes")).genes);
						commitData.genes = JSON.parse(insurantItem.genes);
						insurantList.push(insurantItem);
						commitData.insureinsurantType = 21;
					}
					return insurantList;
				default:
					$keyList = $(MODULE_EXP, $module);
					return _this.getKeyValueByModule($keyList);
			}


		},
		getBeneficiarylist: function($module) { //获取受益人
			var $beneficiary = $(".zd-beneficiary:visible", $module),
				beneficiaryItems,
				moduleItem,
				$keyList,
				beneficiaryList = [],
				_this = this;
			if ($beneficiary.length > 0) {
				beneficiaryItems = $(".beneficiaryFirst .beneficiary-sub-box:visible", $module); //获取第一顺序受益人
				beneficiaryItems.each(function() {
					$keyList = $("*[data-moduleid]", this);
					moduleItem = _this.getKeyValueByModule($keyList);
					moduleItem.serial = 1;
					beneficiaryList.push(moduleItem);
				});
				beneficiaryItems = $(".beneficiarySecond .beneficiary-sub-box:visible", $module); //获取第二顺序受益人
				beneficiaryItems.each(function() {
					$keyList = $("*[data-moduleid]", this);
					moduleItem = _this.getKeyValueByModule($keyList);
					moduleItem.serial = 2;
					beneficiaryList.push(moduleItem);
				});
			}
			return JSON.stringify(beneficiaryList);
		},
		getKeyValueByModule: function($keyList) { //获取字段信息
			var moduleObj = {},
				_selectValue = "",
				_selectText = "",
				_keyName,
				$keyItem = {};
			$keyList.each(function() {
				$keyItem = $(this);
				_keyName = $keyItem.attr("name");
				if ($keyItem.attr("isdropdown") === "true" || $keyItem.hasClass("hz-dropdown")) { //下拉框
					var _$selectItem = $(".hz-select-option-selected", $keyItem);
					if ($keyItem.hasClass("select-area")) { //地区选择控件
						_selectText = _$selectItem.attr("text");
						_selectValue = _$selectItem.attr("value");
						var areaName = $keyItem.attr('areaName');
						_selectText = _selectText === "请选择" ? "" : _selectText;
						moduleObj[_keyName + areaName] = _selectValue;
						moduleObj[_keyName + areaName + 'Text'] = _selectText;
						moduleObj[_keyName] = moduleObj[_keyName] ? (moduleObj[_keyName] + (_selectValue ? ("-" + _selectValue) : "")) : _selectValue;
						moduleObj[_keyName + 'Text'] = moduleObj[_keyName + 'Text'] ? (moduleObj[_keyName + 'Text'] + (_selectText ? ("-" + _selectText) : "")) : _selectText;
						if (areaName === 'Area' && !_selectText && _keyName === 'bankAddress') { //银行地址直辖市，二级地区不放值 
							moduleObj[_keyName + areaName] = moduleObj[_keyName + 'City'];
							moduleObj[_keyName + areaName + 'Text'] = moduleObj[_keyName + 'City' + 'Text'];
							moduleObj[_keyName + 'City'] = null;
							moduleObj[_keyName + 'City' + 'Text'] = null;
						}
					} else if ($keyItem.hasClass("job-level")) {
						_selectText = _$selectItem.attr("text");
						moduleObj[_keyName] = moduleObj[_keyName] ? (moduleObj[_keyName] + (_selectText ? ("-" + _selectText) : "")) : _selectText;
					} else {
						moduleObj[_keyName] = _$selectItem.attr("data-value") || _$selectItem.attr('value');
						if (moduleObj[_keyName] === undefined) {
							moduleObj[_keyName] = _$selectItem.attr("text") || _$selectItem.data("value");
						}
						if (_keyName === "cardTypeName") { //添加证件名称和ID
							moduleObj["cardTypeId"] = _$selectItem.val() || _$selectItem.data('value');
							moduleObj["cardTypeName"] = _$selectItem.attr("text") || _$selectItem.html();
						} else if (_keyName === "fromAirport") { //添加航延险奇葩需求
							moduleObj["fromAirportCode"] = _$selectItem.attr("wordCode");
							moduleObj["fromAirport"] = _$selectItem.attr("text") || _$selectItem.data("value");
						} else if (_keyName === "toAirport") {
							moduleObj["toAirportCode"] = _$selectItem.attr("wordCode");
							moduleObj["toAirport"] = _$selectItem.attr("text") || _$selectItem.data("value");
						} else {
							moduleObj[_keyName + 'Text'] = _$selectItem.text();
						}

					}
				} else {
					if ($keyItem.hasClass('hz-radio-item')) {
						_keyName = _keyName.split("-")[0];
						if ($keyItem.hasClass('hz-radio-item-checked')) {
							var val = $keyItem.val() || $keyItem.attr('value') || 0;
							moduleObj[_keyName] = parseInt(val);
							if (_keyName === "sex") {} else {
								moduleObj[_keyName + 'Text'] = $keyItem.find('.hz-radio-text').text();
							}
						}
					} else if ($keyItem.attr("type") === "checkbox") {
						if ($keyItem.attr("checked") === "checked") {
							moduleObj[_keyName.split("-")[0]] = true;
						} else {
							moduleObj[_keyName.split("-")[0]] = false;
						}
					} else {
						moduleObj[_keyName.split("-")[0]] = $keyItem.val() || $keyItem.data('value') || "";
						if(_keyName.split("-")[0]==="sex"){
							moduleObj[_keyName.split("-")[0]]=$keyItem.val() || $keyItem.data('value');
						}
						if (_keyName === 'cardPeriodEnd') { //证件有效期特殊处理
							if (!moduleObj['validityTime'] && $keyItem.val()) {
								moduleObj['cardPeriod'] = moduleObj['cardPeriod'] + '|' + $keyItem.val();
							}
						}
					}
				}
			});
			return moduleObj;
		},
		getmandatoryAttributeFill: function() { //获取必填字段填了多少个
			var $mandatoryList = $("*[data-required='1']:visible:not(.hz-radio-item)"),
				$radioList = $("*[data-required='1']:visible.hz-radio-item"), //单选按钮个数
				$keyItem = {},
				count = 0,
				radioMap = {},
				_this = this;
			$mandatoryList.each(function() {
				$keyItem = $(this);
				if ($keyItem.attr("isdropdown") === "true" || $keyItem.hasClass("hz-dropdown")) { //下拉框
					if (!$(".hz-select-option-selected", $keyItem).length) {
						count++;
					}
				} else {
					if ($keyItem.hasClass('hz-radio-item')) {
						if (!$("input[name='" + $keyItem.attr("name") + "']:checked").length) {
							count++;
						}
					} else {
						if (!$keyItem.val()) {
							count++;
						}
					}
				}
			});
			return _this.getAttributeControl() - count;
		},
		getAttributeControl: function() { //返回当前页面控件的数量
			var $mandatoryList = $("*[data-required='1']:visible:not(.hz-radio-item)"),
				$radioList = $("*[data-required='1']:visible.hz-radio-item");
			return $mandatoryList.length + $radioList.length / 2;
		},
		getRelations: function(commitData) {
			var _this = this,
				insuredPersonInfoList = commitData.insuredPersonInfoList;
			insuredPersonInfoList.forEach(function(item, i) {
				item.relationInsureInsurant = $("#forrelationtype:visible .hz-select-option-selected").val() || item.relationInsureInsurant;
				item.relationInsureInsurant = _this.getTransfromRelations(~~item.relationInsureInsurant, ~~commitData.applicantPersonInfo.sex);
			});
			return commitData;
		},

		/*
		 * ==================== 提交投保单错误信息处理  start ====================
		 */

		layer: function(ops) {
			var _time = ops.time || 0;
			var _closeBtn = 1;
			if (ops.closeBtn || ops.closeBtn == 0) {
				_closeBtn = ops.closeBtn;
			}
			var _skin = ops.skin || 'huize-layer';
			var _type = ops.type || 0; //0（信息框，默认）1（页面层）2（iframe层）3（加载层）4（tips层）
			var _title = ops.title || '提示信息';
			var _shift = ops.shift || 2;
			var _btn = ops.btn;
			var _shadeClose = ops.shadeClose !== undefined ? ops.shadeClose : true;
			var _area = ops.area || ['500px'];
			var _content = ops.content || '';
			layer.open({
				time: _time,
				closeBtn: _closeBtn,
				skin: _skin,
				type: _type,
				title: _title,
				shift: _shift,
				btn: _btn,
				area: _area,
				shadeClose: _shadeClose, //开启遮罩关闭
				content: _content,
				yes: function(index) {
					if (ops.yes) {
						ops.yes();
					}
					layer.closeAll();
				},
				cancel: function(index) {
					if (ops.cancel) {
						ops.cancel();
					}
					layer.closeAll();
				}
			});
			//如果是单个按钮，需要将按钮置为亮色
			if (_btn === undefined || _btn.length === 1) {
				$(".layui-layer-btn0").removeClass("layui-layer-btn0").addClass("layui-layer-btn1");
			}
		},
		submitReview: function() {
			var _this = this;
			//IsSubmitReview = true;
			var time = 3;
			var timeout;
			//$.HzInsInsure.SaveInsure();//?

			this.layer({
				content: '<p>您的投保单已经提交到后台审核列表，请耐心等待客服审核。</p><p style="color:#FF8E0D; font-weight:bold"><span id="insureGoToTime"></span>秒后系统自动跳回慧择网首页</p>',
				btn: false
			});
			helper.timer({
				id: 'insureGoToTime',
				callback: function() {
					layer.closeAll();
					location.href = window.location.protocol + _this.HOMEPAGE;
				}
			});
		},
		saveInsure: function() {
			layer.closeAll();
			this.submit();
			//_this.showMessage('系统正在保存投保信息，请耐心等候...', 'loading');

		},
		submitContinueBuy: function() {
			//isVerifyInsurantBuyCount = false;
			//isContinueBuy = true;
			this.saveInsure();
			//$.HzInsInsure.SaveInsure();//?
		},
		//购买份数处理
		alertExceedBuyCountTipInfo: function(result) {
			var _this = this;
			var insurants = "";
			var productName = "";
			var buyInfoHtml = "";
			var insurantIndex = 0;
			var buyInfoIndex = 0;
			var buyInfoCount = 0;

			var item = result.buyCountResultInfo;
			insurants = item.cname;

			productName = _this.productName;

			for (var j = 0; j < item.insureHistoryParamInfoList.length; j++) {
				var buyInfo = item.insureHistoryParamInfoList[j];
				buyInfoHtml += (buyInfoIndex + 1) + "、被保险人<font color='#0089d8'>" + buyInfo.cname + "</font>,保障期限" + buyInfo.deallineText;
				buyInfoCount += buyInfo.buyAmount;
				buyInfoHtml += "<br />";
				buyInfoIndex++;
			}

			var buyInfoContentStyle = "";
			var height = 386;
			if (buyInfoIndex <= 3) {
				switch (buyInfoIndex) {
					case 1:
						height = 302;
						buyInfoContentStyle = "height:42px;";
						break;
					case 2:
						height = 344;
						buyInfoContentStyle = "height:84px;";
						break;
					default:
						buyInfoContentStyle = "height:126px;";
						break;
				}
			}
			var html = [];
			html.push('<div class="gn-buy" style="_background:#fff;"><div style="width:470px;_width: 458px;"><div>');
			html.push('<div>尊敬的用户，我们检测到被保险人<font color="#0089d8">' + insurants + '</font>已经购买过<font color="#0089d8">' + buyInfoCount + "份</font>" + productName + "，如下：</div>");
			html.push('<div class="gnb-bd" style="' + buyInfoContentStyle + '">' + buyInfoHtml + "</div>");
			html.push('<div style="margin-top: 6px; color: #555;"><strong>相同保障期限内本产品限购' + result.buyCountResultInfo.max + "份，您无需重复投保</strong><br />如有需要，您可以修改保障期限，或者给其他被保险人投保</div>");
			html.push('</div></div><div class="fb_textb" style="padding-left: 150px;"></div></div>');
			_this.layer({
				btn: ['返回修改'],
				content: html.join('')
			});
			if (buyInfoIndex > 3) {
				var buyInfoContentHeight = $("#facebox .gnb-bd").height();
				if (buyInfoContentHeight > 126) {
					$("#facebox .gnb-bd").attr("style", "height:126px;overflow-y:scroll;");
				} else {
					$("#facebox .gnb-bd").attr("style", "height:126px;");
				}
			}
		},
		//购买份数处理
		getExistBuyCountTipInfoHtml: function(result) {
			var _this = this,
				html = [];
			html.push('<div class="gn-buy" style="_background:#fff;"><div style="height:130px;width:470px;_width: 458px; overflow-y:scroll;"><div style="height:130px;"><strong>您好！</strong><br />');
			//for (var i = 0; i < result.BuyCountResultInfo.Results.length; i++) {
			var item = result.buyCountResultInfo;
			// if (item.IsExistEqual) {
			// 	continue;
			// }
			html.push("<div>被保险人" + item.cname + '已经购买过<font color="#0089d8">' + item.total + "份</font>" + item.InsureHistoryParamInfo[0].productName + item.InsureHistoryParamInfo[0].planName + "，保障期限分别为：</div>");
			html.push('<div class="gnb-bd">');
			for (var j = 0; j < item.InsureHistoryParamInfo.length; j++) {
				var buyInfo = item.InsureHistoryParamInfo[j];
				html.push((j + 1) + "、" + buyInfo.deallineText);
				html.push("<br />");
			}
			html.push('</div><div style="margin-top: 6px;">您还可以购买<font color="#0089d8">' + (item.max - item.total) + "份</font>，您是否要继续购买？</div>");
			//}
			html.push('</div></div></div><div class="fb_textb" style="padding-left: 110px;"><div style="clear:both;"></div></div>');
			return html.join('');
		},
		//保险人与投保人证件类型与号码不能一致
		setInsurantRelationshipErr: function() {
			var insureIdentifyType = $("#divInsure [myEvent=IdentifyType]").val();
			var insureIdentifyNumber = $("#divInsure [myEvent=IdentifyNumber]").val();
			$("#Insurant [myEvent=IdentifyType]").each(function() {
				if (!$(this).is(":visible")) {
					return;
				}
				var postfix = $(this).attr("id").replace("ddlInsurantIdentifyType", "");
				var insurantIdentifyNumber = $("#txtInsurantIdentifyNumber" + postfix).val();
				if ($(this).val() == insureIdentifyType && insurantIdentifyNumber == insureIdentifyNumber) {
					$("#ddlInsurantRelationship" + postfix).focus().blur();
					$("#ddlInsurantRelationship" + postfix).attr("class", "reg_inW");
				}
			});
		},
		//投保人信息修改成与被保险人一致
		coverAdultInsurant: function() {
			//一键替换功能 ? 	
			this.replaceInsureInfo();
		},
		replaceInsureInfo: function() { //同被保险人
			var _this = this;
			_this.el.find('#module-20  .credentials-form:visible .insure-form').each(function() {
				var name = $(this).attr('name'),
					val = $(this).val() || $(this).attr('value') || $(this).data('value'),
					_name = name.replace(_this.regReplaceNum, ''),
					$input = _this.insureModules.find('.insure-form[name^="' + _name + '"]');
				// 单选按钮
				if ($input.hasClass('hz-radio-item')) {
					$input.each(function() {
						if ($(this).attr('value') === val) {
							$(this).click();
							//$(this).attr('checked', checkedStatus);
						}
					});
				} else if ($input.hasClass('hz-dropdown')) {
					_this.dropdownSelectItem($input, val);
				} else { // 非单选按钮
					$input.val(val);
				}
			});
			_this.insureModules.find('.id-card-input').trigger('blur');

			// $("#module-20").find('[data-insuranttype="others"]').hide();
			// $("#module-20").find('[data-insuranttype="myself"]').show();
			_this.dropdownSelectItem($("#forrelationtype"), _this.SELFRELATIONTYPE);
			_this.dropdownSelectItem(_this.el.find('#module-20  .credentials-form:visible [data-attributeid=' + _this.ATTR_ID_RELATIONINSUREINSURANT + ']'), _this.SELFRELATIONTYPE);

			// 被保人选中本人
			//$('#myself').click();
		},
		isShowHighPremiumOver: false, //是否显示了高保费的错误提示
		//显示了高保费的错误提示
		showHighPremiumOver: function() {
			var _this = this;
			if (!_this.isShowHighPremiumOver) {
				_this.isShowHighPremiumOver = true;
				_this.layer({
					btn: ['确认'],
					content: _this.TEXT_HIGH_PREMIUM_OVER,
					yes: function() {
						_this.isShowHighPremiumOver = false;
					},
					cancel: function() {
						_this.isShowHighPremiumOver = false;
					},
					shadeClose: false,
				});
			}
		},
		// 保存错误处理
		saveCallBackErr: function(key) {
			var _this = this,
				result;
			var obj = {

				//保存为暂存单
				UnderwritingErr: function(entity, sErrorMsg) {
					if (entity.EncodeId) {
						sErrorMsg += "<span class='rhb-tst'>您的投保单信息已保存为暂存单</span>";
					}
					_this.layer({
						content: sErrorMsg
					});
				},
				Blacklist: function(entity, sErrorMsg) {
					_this.layer({
						content: sErrorMsg
					});
				},
				SevenDay: function(entity, sErrorMsg) { //七天三单
					var insurants = "";
					var highSuminsuredStr = "非常抱歉，被保险人";
					var item;
					var itemStr = "";
					var isFirst = true;
					var insurantCount = entity.sameProductIdResult.length;
					for (var i = 0; i < insurantCount; i++) {
						item = entity.sameProductIdResult[i];
						itemStr = "<font color='#0089d8'>" + item.cname + "</font>";
						if (!isFirst) {
							highSuminsuredStr += "、";
						}
						highSuminsuredStr += itemStr;
						isFirst = false;
					}
					highSuminsuredStr += "保额达到保险公司规定的保额限制，我们会尽快为您审核。";
					var html = "";
					html = '<div class="gn-buy" style="_background:#fff;height:135px;"><div>';
					html += highSuminsuredStr;
					html += '您可以：<a target="_blank" href="//i.huize.com/Policy/Detail?insureNum=' + helper.url.getUrlVar("insureNumber") + '"  style="float:none;padding-right:10px;color:#0089d8;" class="gnb-link">查看订单</a>';
					html += "</div>";
					html += "<div style='clear:both;'></div><div>如有疑问，请联系<a style='color:#0089d8;' href='http://kefu.hzins.com/chat/chatting;jsessionid=1gtraisqc29f31caqabo7vhym1?referrer=" + window.location.href + "&domain=hzins&businessType=Xm4FWr0dncw&language=zh'  target='_blank' id=\"clickFeedBack\">在线客服</a>，感谢您的支持！</div>";
					html += "</div>";

					_this.layer({
						content: html,
						btn: ''
					});
				},
				//将投保人信息修改成与被保险人一致
				AdultInsurantErr1: function(entity, sErrorMsg) {
					if ($('#module-20 .credentials-form:visible').length === 1) {
						sErrorMsg = "尊敬的用户，由于该产品规定满18周岁后，投保人应与被保险人保持一致，请您将投保人信息修改成与被保险人一致。";
						_this.layer({
							btn: ['一键替换', '自己修改'],
							yes: function() {
								_this.coverAdultInsurant();
							},
							content: sErrorMsg
						});
					} else {
						sErrorMsg = "尊敬的用户，由于该产品规定满18周岁后，投保人应与被保险人保持一致，您输入的被保险人信息个数过多，导致不能投保，请确认后重新修改您的投保信息。";
						_this.layer({
							btn: ['我知道了'],
							content: sErrorMsg
						});
					}
				},
				//被保险人信息个数过多，导致不能投保
				AdultInsurantErr2: function(entity, sErrorMsg) {
					sErrorMsg = "尊敬的用户，由于该产品规定满18周岁后，投保人应与被保险人保持一致，您输入的被保险人信息个数过多，导致不能投保，请确认后重新修改您的投保信息。";
					_this.layer({
						btn: ['我知道了'],
						content: sErrorMsg
					});
				},
				//保险人与投保人证件类型与号码不能一致
				RelationErr: function(entity, sErrorMsg) {
					sErrorMsg = "尊敬的用户，我们检测到该被保险人<span style='color: #FF0000;'>" + entity.Tip + "</span>与投保人证件类型与号码一致，请您确认被保险人信息并进行关系的修改。";
					_this.layer({
						btn: ['返回修改'],
						yes: _this.setInsurantRelationshipErr,
						content: sErrorMsg
					});
				},
				//购买份数
				InsurantBuyCount: function(entity, sErrorMsg) {
					//isContinueBuy = false;
					// if (entity.EncodeId != "" && entity.EncodeId != null) {
					// 	tempInsureNum = entity.EncodeId;
					// }
					var html = "";
					switch (entity.buyCountResultInfo.type) {
						case 0:
							html = _this.getExistBuyCountTipInfoHtml(entity);
							_this.layer({
								btn: ['返回修改', '继续购买'],
								cancel: _this.submitContinueBuy,
								content: html
							});
							break;
						case 1:
							_this.alertExceedBuyCountTipInfo(entity);
							break;
					}
				},
				//高保额处理
				InsurantHighSumInsured: function(entity, sErrorMsg) {
					var insurants = "";
					var highSuminsuredStr = "非常抱歉，被保险人";
					var item;
					var itemStr = "";
					var isFirst = true;
					var insurantCount = entity.highSumInsuredResult.length;
					for (var i = 0; i < insurantCount; i++) {
						item = entity.highSumInsuredResult[i];
						itemStr = "<font color='#0089d8'>" + item.cname + "</font>";
						if (!isFirst) {
							highSuminsuredStr += "、";
						}
						highSuminsuredStr += itemStr;
						isFirst = false;
					}
					highSuminsuredStr += "保额达到保险公司规定的保额限制，我们会尽快为您审核";
					var html = "";
					html = '<div class="gn-buy" style="_background:#fff;height:135px;"><div>';
					html += highSuminsuredStr;
					html += '您可以：<a target="_blank" href="//i.huize.com/Policy/Detail?insureNum=' + helper.url.getUrlVar("insureNumber") + '"  style="float:none;padding-right:10px;color:#0089d8;" class="gnb-link">查看订单</a>';
					html += "</div>";
					html += "<div style='clear:both;'></div><div>如有疑问，请联系<a style='color:#0089d8;' href='http://kefu.hzins.com/chat/chatting;jsessionid=1gtraisqc29f31caqabo7vhym1?referrer=" + window.location.href + "&domain=hzins&businessType=Xm4FWr0dncw&language=zh'  target='_blank' id=\"clickFeedBack\">在线客服</a>，感谢您的支持！</div>";
					html += "</div>";

					_this.layer({
						content: html,
						btn: ''
					});
					//调出在线客服
					// $('#clickFeedBack').click(function() {
					// 	$('#feedback').click();
					// });
					$('#submitReview').click(function() {
						_this.againSubmit = true;
						// if (entity.HighSumInsuredResult.IsReviewSubmit) {
						// 	_this.submitReview();
						// } else {
						// 	_this.saveInsure();
						// }
						_this.saveInsure();
					});
				},
				//核保失败
				AcceptancePolicyErr: function(entity, sErrorMsg) {
					var acceptancePolicy = "您的投保单保险公司核保失败!";
					acceptancePolicy += sErrorMsg;
					var html = "";
					html = '<div class="gn-buy" style="_background:#fff;height:135px;"><div>';
					html += acceptancePolicy;
					html += "</div>";
					html += "<div style='clear:both;'></div><div>如有疑问，请联系<a style='color:#0089d8;' href='http://kefu.hzins.com/chat/chatting;jsessionid=1gtraisqc29f31caqabo7vhym1?referrer=" + window.location.href + "&domain=hzins&businessType=Xm4FWr0dncw&language=zh'  target='_blank' id=\"clickFeedBack\">在线客服</a>，感谢您的支持！</div>";
					html += "</div>";

					_this.layer({
						content: html,
						btn: ['我知道了']
					});
				},
				OffLine: function(entity, sErrorMsg) { //产品下架
					_this.layer({
						btn: ['确认'],
						content: sErrorMsg,
						yes: function() {
							window.location.href = '//www.huize.com/product/detail-' + _this.product.operationProductId + '.html';
						}
					});
				},
				IncorrectStartDate: function(entity, sErrorMsg) { // 处理起保日期不在范围内的日期格式错误
					//sErrorMsg = sErrorMsg.replace(/\s\d{2}:\d{2}:\d{2}/g, '');
					_this.layer({
						content: sErrorMsg
					});
				},
				priceTableChange: function() { //费率表并更影响价格
					_this.layer({
						btn: ['确认'],
						content: '后台价格变更，请确认后再次提交！',
						yes: function() {
							_this.trialChange();
						}
					});
				},
				defaults: function(entity, sErrorMsg) {
					_this.layer({
						content: sErrorMsg
					});
				},
			};

			switch (key) {
				case "37115": //高保额
					result = obj['InsurantHighSumInsured'];
					break;
				case "37111": //购买份数
					result = obj['InsurantBuyCount'];
					break;
				case "37109":
					result = obj['AdultInsurantErr1'];
					break;
				case "37120":
					result = obj['SevenDay'];
					break;
				case "37103":
					result = obj['OffLine'];
					break;
				case "37202": // 处理起保日期不在范围内的日期格式错误
					result = obj['IncorrectStartDate'];
					break;
				case "37002":
					result = obj['AcceptancePolicyErr'];
					break;
				case "priceTableChange":
					result = obj['priceTableChange'];
					break;
				default:
					result = obj['defaults'];
					break;
			}

			return result;
		},
		//提交订单后处理后台返回结果
		showSaveError: function(entity) {
			var _this = this;
			var sErrorMsg = entity.errorMessage || "保存保单出错";
			sErrorMsg = "<span class='rhb-tmt'>" + sErrorMsg + "</span>";
			var saveResult = _this.saveCallBackErr(entity.errorCode);
			if (saveResult) {
				saveResult(entity, sErrorMsg);
			} else {
				_this.saveCallBackErr('defaults')(entity, sErrorMsg);
			}
			//}
		},



		/*
		 * ==================== 提交投保单之前的校验 start ====================
		 */

		/**
		 * 验证被保险人为成年人，是否限制投保人只能为本人 is_insurant_adult ：1是 0否
		 */
		validateInsurantAdult: function() {
			var _this = this;
			var $insuredPeoples = $('#module-20').find('.credentials-form:visible'),
				insureCardTypeValue = $.trim($('#module-10').find('.credentials').val()), // 投保人证件类型
				insureCardNumValue = $.trim($('#module-10').find('.id-card-input').val()); // 投保人证件号码
			// 不止一个被保人
			if ($insuredPeoples && $insuredPeoples.length > 1) {
				var this_status = true;
				$insuredPeoples.each(function() {
					// 出生日期
					var $birthdate = $(this).find('[name*="birthdate"]'),
						$relationship = $(this).find('.relationship'),
						insuredCardTypeValue = $.trim($(this).find('.credentials').val()), //被保人证件类型
						insuredCardNumValue = $.trim($(this).find('.id-card-input').val()); //被保人证件号码
					var oldDate = $birthdate.val();
					var selectDate = _this.getFullAge({
						select: oldDate
					});
					if (selectDate >= 18) {
						if (insuredCardTypeValue && insuredCardNumValue) {
							if (insureCardTypeValue != insuredCardTypeValue || insureCardNumValue.toUpperCase() != insuredCardNumValue.toUpperCase()) {
								_this.showInsureAdultMsg(1);
								this_status = false;
								// 跳出循环
								return false;
							}
						}
					}
				});
				return this_status;
			}
			// 只有一个被保人
			if ($insuredPeoples && $insuredPeoples.length === 1) {
				var insuredCardTypeValue = $.trim($insuredPeoples.find('.credentials').val()), //被保人证件类型
					insuredCardNumValue = $.trim($insuredPeoples.find('.id-card-input').val()); //被保人证件号码
				if (!insuredCardTypeValue || !insuredCardNumValue) {
					return true;
				}
				// 出生日期
				var $birthdate = $insuredPeoples.find('[name*="birthdate"]');
				var oldDate = $birthdate.val();
				//var newDate = new Date(_this.getCurrentTime());
				var selectDate = _this.getFullAge({
					select: oldDate
				});
				if (selectDate < 18) {
					return true;
				}
				if (insureCardTypeValue != insuredCardTypeValue || insureCardNumValue.toUpperCase() != insuredCardNumValue.toUpperCase()) {
					_this.showInsureAdultMsg(2);
					return false;
				}
			}
			return true;
		},

		validateInsurantRelation: function(data) { //校验被保险人的证件号码和证件类型和与投保人一致时关系是否为本人
			var _this = this,
				status = true,
				insureCardType = data.applicantPersonInfo.cardTypeId,
				insureCardNum = data.applicantPersonInfo.cardNumber,
				insurantName = '';
			$.each(data.insuredPersonInfoList, function(i, item) {
				if (item.cardTypeId === insureCardType && item.cardNumber === insureCardNum && item.relationInsureInsurant !== _this.SELFRELATIONTYPE) {
					insurantName = item.cName;
					status = false;
				}
			});
			if (!status) {
				var sErrorMsg = '尊敬的用户，我们检测到被保险人"' + insurantName + '"与投保人证件类型与号码一致，请您确认被保险人信息并进行关系的修改。';
				_this.layer({
					content: sErrorMsg
				});
			}
			return status;
		},
		validateInsurantSelfInfo: function(data) { //校验关系为本人时投保人身份信息和被保人身份信息是否一致
			var _this = this,
				status = true,
				insureCardType = data.applicantPersonInfo.cardTypeId,
				insureCardNum = data.applicantPersonInfo.cardNumber,
				insureSex = data.applicantPersonInfo.sex,
				insureBrithDate = data.applicantPersonInfo.birthdate,
				insurantName = '',
				fileName=[];
			$.each(data.insuredPersonInfoList, function(i, item) {
				if (item.relationInsureInsurant === _this.SELFRELATIONTYPE) {
					if (insureCardType && item.cardTypeId && (~~item.cardTypeId !== ~~insureCardType)) {
						status = false;
						fileName.push('证件类型');
					}
					if (insureCardNum && item.cardNumber && (item.cardNumber !== insureCardNum)) {
						status = false;
						fileName.push('证件号码');
					}
					if ( ~~item.sex !== ~~insureSex) {
						status = false;
						fileName.push('性别');
					}
					if (insureBrithDate && item.birthdate && (item.birthdate !== insureBrithDate)) {
						status = false;
						fileName.push('出生日期');
					}
					if(!status){
						insurantName=item.cName;
					}
				}
			});
			if (!status) {
				var sErrorMsg = '被保人为本人时，['+fileName.join('、')+']需要填写一致哦~';
				_this.layer({
					content: sErrorMsg
				});
			}
			return status;
		},

		/**
		 * 被保险人为未成年人，是否限制投保人只能为其父母或法定监护人
		 */
		validateInsurantJuveniles: function() {
			var _this = this;
			var $insuredPeoples = $('#module-20').find('.credentials-form:visible');
			// 不止一个被保人
			if ($insuredPeoples && $insuredPeoples.length > 1) {
				var this_status = true;
				$insuredPeoples.each(function() {
					// 出生日期
					var $birthdate = $(this).find('[name*="birthdate"]'),
						relationship = $(this).find('.relationship:visible').val() || $('#forrelationtype').val();

					var oldDate = $birthdate.val();
					var selectDate = _this.getFullAge({
						select: oldDate
					});
					if (selectDate < 18) {
						if (relationship) {
							relationship = _this.toInt(relationship);
							if (!(relationship === 4 || relationship === 5 || relationship === 1000)) {
								_this.showInsureAdultMsg(3);
								this_status = false;
								// 跳出循环
								return false;
							}
						}
					}
				});
				return this_status;
			}
			// 只有一个被保人
			if ($insuredPeoples && $insuredPeoples.length === 1) {
				var $birthdate = $insuredPeoples.find('[name*="birthdate"]'),
					relationship = $insuredPeoples.find('.relationship:visible').val() || $('#forrelationtype').val();
				if (!relationship) {
					return true;
				}
				var oldDate = $birthdate.val();
				//var newDate = new Date(_this.getCurrentTime());
				var selectDate = _this.getFullAge({
					select: oldDate
				});
				if (selectDate < 18) {
					relationship = _this.toInt(relationship);
					if (!(relationship === 4 || relationship === 5 || relationship === 1000)) {
						_this.showInsureAdultMsg(3);
						// 跳出循环
						return false;
					}
				}
			}
			return true;
		},
		/**
		 * 设置被保险人为成年人，限制投保人只能为本人，验证失败时提示信息
		 */
		showInsureAdultMsg: function(type) {
			var _this = this;
			if (type === 1) {
				layer.open({
					skin: 'huize-layer',
					type: 0, //0（信息框，默认）1（页面层）2（iframe层）3（加载层）4（tips层）
					title: _this.TEXT_DIALOG_TITLE_DEFAULT,
					shift: 2,
					btn: ['我知道了'],
					area: ['500px'],
					shadeClose: true, //开启遮罩关闭
					content: _this.TEXT_MUST_MYSEFT
				});
			} else if (type === 2) {
				layer.open({
					skin: 'huize-layer',
					type: 0, //0（信息框，默认）1（页面层）2（iframe层）3（加载层）4（tips层）
					title: _this.TEXT_DIALOG_TITLE_DEFAULT,
					shift: 2,
					btn: ['一键替换', '自己修改'],
					area: ['500px'],
					yes: function(index) {
						_this.replaceInsureInfo();
						layer.closeAll();
					},
					shadeClose: true, //开启遮罩关闭
					content: _this.TEXT_MUST_MYSEFT_SAME
				});
			} else if (type === 3) {
				layer.open({
					skin: 'huize-layer',
					type: 0, //0（信息框，默认）1（页面层）2（iframe层）3（加载层）4（tips层）
					title: _this.TEXT_DIALOG_TITLE_DEFAULT,
					shift: 2,
					btn: ['我知道了'],
					area: ['500px'],
					shadeClose: true, //开启遮罩关闭
					content: _this.TEXT_INSURANT_JUVENILES
				});
				$(".layui-layer-btn0").removeClass("layui-layer-btn0").addClass("layui-layer-btn1");

			}
		},

		validateInsureAge: function(submit) { //验证投保人出生日期
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

		validateInsurantNum: function() { //验证投保人数
			var _this = this;
			var $insureModules = $('#module-' + _this.MODULES_ID_INSURED);
			var length = $insureModules.find('.form-more').length;
			if (length > _this.maxPeople) {
				_this.layer({
					content: _this.TEXT_INSURE_MAX + _this.maxPeople + _this.TEXT_PEOPLE
				});
				return false;
			}
			if (length < _this.minPeople) {
				_this.layer({
					content: _this.TEXT_INSURE_MIN + _this.minPeople + _this.TEXT_PEOPLE
				});
				return false;
			}
			return true;
		},
		validateHighPremium: function() { //验证高保费
			var _this = this,
				$priceListNode = _this.el.find('[data-price]:visible'),
				showHeightError = false;
			$priceListNode.each(function(i) {
				var price = $(this).attr('data-price') || 0,
					originalPrice = $(this).attr('data-originalPrice') || 0,
					statusCode = $(this).attr('data-statuCode') || '';
				if (statusCode === '36058') {
					showHeightError = true;
				}
			});
			if (showHeightError) { //显示高保费错误提示
				_this.showHighPremiumOver();
				return false;
			}
			return true;
		},

	};
	return InsurePost;
});