define(['jquery', "layer", "helper", "insure-validate"], function($, layer, hepler, InsureValidate) {
	'use strict';
	/*
	 * @constructor InsureContacts
	 * @author 
	 * @version 0.0.1
	 * @description 常用联系人模块
	 */
	var insureValidate = new InsureValidate();
	var InsureContacts = function() {

	};
	InsureContacts.prototype = {
		isShowContacts: false, //判断是否打开了常用联系人弹框
		bindContacts: function(context, from, fillContent) { //选择常用联系人
			var _this = this,
				_context = context,
				_activeId,
				_content,
				_sortIndex,
				_optiontext,
				$from = from ? $(from) : $("#insureBox");

			var showHtml = '<div class="general-contact-dialog layui-layer-wrap" id="contactsList"><% _.each(datas,function(item,index){%>' +
				'<a class="general-contact-name  <%=item.id==activeId?"active":" "%>" href="javascript:;" contactsId="<%=item.id%>"><i class="iconfont f22">&#xe71d;</i><%=item.cName%></a><%})%></div>';
			$from.on("click", "a[contactsIndex]", function() {
				if (_this.isShowContacts) {
					return;
				}
				_this.isShowContacts = true;
				_sortIndex = $(this).attr("contactsIndex");
				_activeId = $(this).attr("data-contactId");
				_this.checkLogin(function() {
					_this.getContactdata(function(data) {
						_content = _.template(showHtml)({
							datas: data,
							activeId: _activeId
						});
						_this.isShowContacts = false;
						layer.open({
							type: 1,
							shift: 2,
							title: "选择联系人",
							area: ['890px', '480px'],
							shadeClose: true, //开启遮罩关闭
							content: _content,
							btn1: function() {
								layer.closeAll('page');
							}
						});
						$("#contactsList").on("click", "a", function() {
							var _$context = fillContent || $(".person-write-info[sort='" + _sortIndex + "']");
							var $insurant,
								isInsured = false;
							if (_$context.attr("id") === "module-10") {
								$insurant = $(".insurant [data-insuranttype='myself']");
								isInsured = true;
							}

							$("#contactsList a").removeClass("active");
							$(this).addClass("active");
							_this.emptyContactsField(_$context);
							_activeId = parseInt($("#contactsList a.active").attr("contactsId"));
							$.each(data, function(index, item) {
								//添加团单插件联系人功能
								if (!_sortIndex && _activeId === item.id) {
									_this.info(item);
									if (
										_this.getSameContacts({
											code: item.cardNumber,
											type: item.cardTypeId
										})
									) {

										setTimeout(function() {
											layer.open({
												title: false,
												type: 0,
												area: ['530px'],
												content: '<div class="pt45 pb45 tac">此联系人已经存在</div>',
												btn: ['确定']
											});
										}, 200);

									} else {

										if (_this.isTeamEmpty()&& _this.teamNum === 1) {
											_this.teamNum = 0;
											_this.teamBody.find('.list-table-row').remove();
										}
										_this.addTeamItem({
											name: item.cName,
											eName: item.eName,
											idType: item.cardTypeId,
											idNumber: item.cardNumber,
											moblie: item.moblie,
											birthdate: item.birthdate.slice(0, 10)
										});
										_this.setCloseStatus();

										_this.teamInfo[_this.teamIndexs] = {
											type: item.cardTypeId,
											code: item.cardNumber
										};
									}

									return;
								}
								item.birthdate = hepler.dateHelper.getDatefromText(item.birthdate);
								if (item.id === _activeId) {
									var _$control;
									for (var key in item) {
										if (key === "provCityId") {
											_$control = $("*[name=provCityText][select=province]", _$context);
											if (_$control.length === 0 && isInsured) {
												_$control = $("*[name=provCityText][select=province]", $insurant);
											}
											_this.dynamicSettingArea(_$control, item[key]);
										} else if (key === "jobInfo") {
											_$control = $("*[name=jobText][job=1]", _$context);
											if (_$control.length === 0 && isInsured) {
												_$control = $("*[name=jobText][job=1]", $insurant);
											}
											_this.dynamicSettingJob(_$control, item[key]);
										} else {
											_$control = $("*[name^='" + key + "']", _$context);
											if (_$control.length === 0 && isInsured) {
												_$control = $("*[name^='" + key + "']", $insurant);
											}
											if (_$control.length > 0) {
												if (_$control.hasClass("hz-dropdown")) {
													if (key === "cardTypeName") { //如果是身份证做处理
														key = "cardTypeId";
													}
													_context.dropdownSelectItem(_$control, item[key]);
												} else if (_$control[0].tagName === "INPUT" && _$control.attr("type") === "text") { //判断文本框
													if (key === "cardPeriod") { //证件有效期
														_$control = $("*[name='" + key + "']", _$context);
														var $validityTime = _$context.find('[name=validityTime]'),
															cardPeriod = item[key].split('|');
														if (cardPeriod.length > 1) {
															$validityTime.attr("checked", false);
															$validityTime.parents('.hz-check-item').removeClass('hz-check-item-checked');
															_$context.find('[name=cardPeriodEnd]').val(cardPeriod[1]);
															_$control.nextAll('.validity-end-item').show();
															item[key] = cardPeriod[0];
														} else {
															_this.checkboxSelectItem($validityTime.parents('.hz-check-item'));
														}
													}
													_$control.val(item[key]);
													_context.validate(_$control[0]);
													_$control.trigger('blur');
												} else if (_$control.hasClass('hz-radio-item')) { //判断单选按钮
													_$control.each(function(index, ritem) {
														if (key === "sex") {
															var val = ~~$(ritem).attr('value');
															if (val === item[key]) {
																$(ritem).click();
															}
														}
													});
												}
												if (_$control.attr('trial')) {
													_this.trialChange(_$control[0]);
												}
											}
										}
									}
									_$context.find('.select-contacts-link').attr('data-contactId', _activeId);
								}
								layer.closeAll('page');
							});
							try {
								$.placeholder.resetStatus();
							} catch (ev) {}
							_this.validateAll(_$context);
							_$context.find('.id-card-input').trigger('blur');
						});
					});
				});
			});
		},
		emptyContactsField: function(module) {
			var _this = this;
			if (module && module.length > 0) {
				module.find("input[type='text']:not('.buycount')").val('');
				module.find("input[type='text'].buycount").val(module.find("input[type='text'].buycount").attr("defaultvalue"));
				module.find(".hz-dropdown").each(function() {
					_this.dropdownSelectItemClear(this);
				});
				if (module.attr("id") === "module-10") {
					var $insurant = $(".insurant [data-insuranttype='myself']");
					$insurant.find("input[type='text']:not('.buycount')").val('');
					$insurant.find("input[type='text'].buycount").val($insurant.find("input[type='text'].buycount").attr("defaultvalue"));
					$insurant.find(".hz-dropdown").each(function() {
						_this.dropdownSelectItemClear(this);
					});
				}
			}
		},
		getContactdata: function(callback) {
			var _this = this;
			$.ajax({
				url: '/api/users/contacts' + '?t=' + (new Date()).getTime(),
				type: 'get',
				success: function(data) {
					if (callback && data) {
						callback(data.result);
					}
				},
				error: function(err) {
					_this.error(err.status, err);
				}
			});
		},
		fillSelfInfo: function() { //投保人默认带入账户里的本人资料
			var _this = this,
				isCanFill = true,
				isEdit = _this.insurance.aftertEdit; //是否是编辑投保单，编辑投保单的时候不带入账户的本人资料

			$.each(_this.ruleParam.genes, function(i, item) {
				if (item.key) {
					if (item.key === _this.INSURANTDATEKEY || item.key === _this.VESTERAGEKEY || item.key === _this.SEXKEY) { //试算信息中包含年龄或者承保年龄或者性别，则不回填数据
						isCanFill = false;
					}
				}
			});
			if (!isEdit && isCanFill) {
				_this.getContactdata(function(data) {
					$.each(data, function() {
						this.birthdate = hepler.dateHelper.getDatefromText(this.birthdate);
						if (this.relationShip === 1) { //如果是本人则填充投保人信息
							_this.setKeyValue(this, $('#module-10'));
						}
					});
				});
			}
			var $insure = $('[data-moduleid=' + _this.MODULES_ID_INSURE_DATE + '][data-attributeid=' + _this.ATTR_ID_INSURE_DATE + ']');
			_this.showInsurantDateLimit($insure);
			var options = {};
			options.newDate = $insure.val();
			_this.setInsuredDate(options);
		},
	};
	return InsureContacts;
});