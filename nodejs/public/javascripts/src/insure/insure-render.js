define([
	'jquery'
], function(
	$
) {
	'use strict';
	/*
	 * @constructor InsureRender
	 * @author 
	 * @version 0.0.1
	 * @description 渲染页面模块
	 */
	var InsureRender = function() {};

	InsureRender.prototype = {
		render: function() {
			var _this = this,
				modules = _this.modules || testData.modules || [],
				result = [];
			result.push(_this.renderModule(modules));
			return result.join('');
		},
		insurantIndex: 0,
		clauseUrl: '',
		isProjectPolicy: false,
		renderModule: function(modules) { //渲染模块
			var _this = this,
				firstModel = [],
				result = [],
				clauseUrl,
				// modules = data.modules || [],
				// product = data.product || {},
				// insurantType = product.insurantType || '',
				insurantTypeArr = _this.insurantTypeArr;
			_this.clauseUrl = 'http://www.huize.com/product/dialog/clause-' + _this.product.operationProductId + '-' + _this.product.operationPlanId + '.html';
			clauseUrl = _this.clauseUrl;
			firstModel.push('<div class="insure-step-body pr30 pl30 bgfw">');
			firstModel.push('<div class="person-write-info  first-item" id="module-first">');
			firstModel.push(_this.renderFirstModeule());

			modules.forEach(function(item, i) {
				var modulesItem = item || {};
				_this.formIndex++;
				switch (item.id) {
					case _this.MODULES_ID_INSURE: //投保人
						result.push('<div class="person-write-info credentials-form" sort="' + _this.formIndex + '" id="module-' + item.id + '"data-index="' + _this.formIndex + '"  data-moduleid="module-' + item.id + '">');
						result.push('<div class="info-title">' + item.name + '</div>');
						result.push(_this.renderTable(item));

						result.push('<div class="mb10 saveContract"><label class="label-item vis-hide">保存为常用联系人</label>');
						result.push('<div class="hz-check-item  hz-check-item-checked inline-block" for="contacts' + item.id + '" rel="checkbox"><i class="hz-check-icon"></i>');
						result.push('<input class="insure-checkbox fn-hide" type="checkbox" name="chkSaveInsure" id="chkSaveInsure' + item.id + '" data-moduleid="' + item.id + '"  class="insure-label" value="1" checked />');
						// result.push('<i class="hz-check-icon"></i>')
						result.push('<label class="hz-check-text f12 fc6" >保存为常用联系人</label>');
						result.push('</div>');
						result.push('</div>');

						result.push('</div>');
						break;
					case _this.MODULES_ID_INSURED: //被保险人
						result.push('<div class="insurant" id="module-' + item.id + '">');
						var myselfModule = [],
							othersModule = [],
							moreModule = [],
							teamModule = [];
						if (insurantTypeArr[0] === '1') { //本人
							myselfModule.push('<div class=" person-write-info  first-item insurant-type credentials-form insurant-item-form" data-insurantType="myself" data-index="' + _this.formIndex + '"  data-moduleid="module-' + item.id + '">');
							myselfModule.push('<div class="">');
							myselfModule.push('<div class="info-title"  style="display:none">本人信息</div>');
							myselfModule.push(_this.renderTable(item, true));
							myselfModule.push(_this.renderBeneficiaryModule(_this.insurantIndex));

							myselfModule.push('<div class="mb10 saveContract"><label class="label-item vis-hide">保存为常用联系人</label>');
							myselfModule.push('<div class="hz-check-item inline-block  hz-check-item-checked" rel="checkbox"><i class="hz-check-icon"></i>');
							myselfModule.push('<input class="insure-checkbox fn-hide" type="checkbox" name="chkSaveInsure" id="chkSaveInsure' + item.id + '" data-moduleid="' + item.id + '" class="insure-label" value="1" checked />');
							// result.push('<i class="hz-check-icon"></i>')
							myselfModule.push('<label class="hz-check-text f12 fc6" for="chkSaveInsure' + item.id + '">保存为常用联系人</label>');
							myselfModule.push('</div>');
							myselfModule.push('</div>');

							myselfModule.push('</div>');
							myselfModule.push('</div>');
						}
						if (insurantTypeArr[1] === '1') { //其他被保险人
							_this.insurantIndex++;
							_this.formIndex++;
							othersModule.push('<div class="insurant-type credentials-form insurant-item-form" data-insurantType="others" data-moduleid="module-' + item.id + '" data-index="' + _this.formIndex + '">');
							othersModule.push('<div class="person-write-info" sort="' + _this.formIndex + '">');
							othersModule.push('<div class="info-title">' + item.name + '</div>');
							othersModule.push(_this.renderTable(item, false));
							othersModule.push(_this.renderBeneficiaryModule(_this.insurantIndex));
							othersModule.push('<div class="mb10 saveContract"><label class="label-item vis-hide">保存为常用联系人</label>');
							othersModule.push('<div class="hz-check-item  hz-check-item-checked inline-block" rel="checkbox"><i class="hz-check-icon"></i>');
							othersModule.push('<input class="insure-checkbox fn-hide" type="checkbox" name="chkSaveInsure" id="chkSaveInsure' + item.id + '" data-moduleid="' + item.id + '" class="insure-label" value="1" checked />');
							// result.push('<i class="hz-check-icon"></i>')
							othersModule.push('<label class="hz-check-text f12 fc6" for="chkSaveInsure' + item.id + '">保存为常用联系人</label>');
							othersModule.push('</div>');
							othersModule.push('</div>');

							othersModule.push('</div>');
							othersModule.push('</div>');
						}
						if (insurantTypeArr[2] === '1') { //多名被保险人
							moreModule.push('<div class="insurant-type" data-insurantType="more" data-moduleid="module-' + item.id + '">');
							moreModule.push('<div id="addMoreBox"></div>');
							moreModule.push('<div class="last-item tar pb20"><a href="javascript:;" class="add add-link f12" data-type="more" ><i class="iconfont fc9  f18 mr5">&#xe70c;</i>新增被保险人</a></div>');
							moreModule.push('</div>');
						}
						if (insurantTypeArr[3] === '1') { //团单
							teamModule.push('<div class="insurant-type" data-insurantType="team" data-moduleid="module-' + item.id + '">');
							teamModule.push('<div class="person-write-info">');
							teamModule.push('<div class="info-title">' + item.name + '</div>');
							teamModule.push('团单信息导入');
							teamModule.push('</div>');
							teamModule.push('</div>');
							// result.push('<div class="info-title">' + item.name + '</div>');
						}

						if (insurantTypeArr[3] === '1') { //团单
							//result.push(teamModule.join(' '));
							result.push('<div class="insurant-type" data-insurantType="team" data-moduleid="module-' + item.id + '">'); //添加团单标示
							result.push('<div class="info-title">' + item.name + ' <span id="insuredNumber"></span><div class="fr" id="teamBtn"><a href="javascript:;" type="team" class="add-link f12 ml10"><i class="iconfont fc9 f22 mr5">&#xe70c;</i>新增被保险人</a><a href="javascript:;" class="add-link f12" contactsIndex><i class="iconfont fc9 f22 ml10">&#xe70c;</i>导入常用联系人</a><a href="javascript:;" class="f12 ml10 upload-excel" id=""><i class="iconfont fc9 f22 mr5">&#xe701;</i>批量导入被保人</a></div></div></div>');
							result.push(_this.renderTeamWarp());
						} else if (insurantTypeArr[2] === '1') { //多名被保险人
							result.push(moreModule.join(' '));
						} else if (insurantTypeArr[1] === '1') { //其他被保险人
							if (insurantTypeArr[0] === '1') { //如果有本人，先加本人
								result.push(myselfModule.join(''));
							}
							result.push(othersModule.join(' '));
						} else if (insurantTypeArr[0] === '1') { //本人
							result.push(myselfModule.join(' '));
						}

						result.push('</div>');
						break;
					case _this.MODULES_ID_BENEFICIARY: //受益人
						if (insurantTypeArr[3] === '1') {
							result.push('<div class="person-write-info">');
							result.push('<div class="info-title">受益人信息</div>');
							result.push('<div class="field-item">');
							result.push('<label class="label-item" for="beneficiarytype">受益人信息</label>');
							result.push('<span class="inline-block">法定继承人</span>');
							result.push('</div>');
							result.push('</div>');
						}
						_this.beneficiaryItem = item;
						break;
					case _this.MODULES_ID_INSURE_DATE: //起保日期
						firstModel.push('<div class="credentials-form" id="module-' + item.id + '" data-index="' + _this.formIndex + '" >');
						// firstModel.push('<div class="info-title">' + item.name + '</div>');
						firstModel.push(_this.renderTable(item));
						firstModel.push('</div>');
						break;

					case _this.MODULES_ID_FORCEPAYID: //缴费方式
						result.push('<div class="person-write-info credentials-form"  id="module-' + item.id + '" data-index="' + _this.formIndex + '">');
						result.push('<div class="info-title">' + item.name + '</div>');

						if (_this.product.isForcePay === 1) {
							result.push('<div class="field-item  field-row">');
							result.push('<label class="label-item">是否自动续保</label>');
							result.push('<div class="hz-radio-item insure-form inline-block forcepay" rel="radio"  name="forcepay" id="forcePay" value="1" data-moduleid="' + item.id + '" ><i class="hz-radio-icon"></i>');
							result.push('<span class="insure-label mr10" for="forcePay">是</span>');
							result.push('</div>');
							result.push('<div class="hz-radio-item  insure-form inline-block forcepay hz-radio-item-checked" rel="radio" name="forcepay" value="0" id="noForcePay" data-moduleid="' + item.id + '" ><i class="hz-radio-icon"></i>');
							result.push('<span class=" insure-label mr10" for="noForcePay">否</span>');
							result.push('</div>');
							result.push('</div>');
						}
						result.push('<div id="forcePayContent">');
						result.push('<div class="field-item">');
						result.push('<div class="mt20 f12">');
						result.push('<p class="pb15"><strong>说明：</strong>续期转账授权声明</p>');
						result.push('<div class="pb15">');
						result.push(_this.product.forcePayContent);
						result.push('</div>');
						// if (_this.product.isForcePay === 1) { //是否强制续期费：0不支持续期、1支持续期但不强制、2按照续期缴费方式确定是否强制续费
						// 	result.push('<div class="pb15">' + _this.TEXT_FORCEPAY(_this.replaceNull(_this.company.simpName)) + '</div>');
						// }

						result.push('</div>');
						result.push('</div>');
						result.push(_this.renderTable(item));
						result.push('<div class="field-item"><label class="label-item vis-hide"></label><div class="inline-block"><div class="insure-form form-item hz-check-item fl" rel="checkbox" for="" id="insureStatement" data-errorremind="请选择同意条款" data-required="1" ><i class="hz-check-icon"></i><span class="hz-check-text f12 fc6">' + _this.TEXT_INSURESTATEMENT + '</span> <span class="insure-tips write-info-error ml10"></span></div></div></div>');
						result.push('</div>');

						result.push('</div>');
						break;

					case _this.MODULES_ID_URGENCY: //紧急联系人
						result.push('<div class="person-write-info credentials-form" id="module-' + item.id + '" data-index="' + _this.formIndex + '" >');
						result.push('<div class="info-title urgency-toggle"><i class="iconfont f18 fc9">&#xe711;</i>' + item.name + '（选填）</div>'); //&#xe712;
						result.push('<div id="urgencyContent" style="display:none">');
						result.push(_this.renderTable(item));
						result.push('</div>');
						result.push('</div>');
						break;
					default:
						result.push('<div class="person-write-info credentials-form" id="module-' + item.id + '" data-index="' + _this.formIndex + '" >');
						result.push('<div class="info-title">' + item.name + '</div>');
						result.push(_this.renderTable(item));
						result.push('</div>');
						break;
				}
			});

			firstModel.push('</div>');



			//添加投按钮
			result.push('<div class="person-write-info" style="border-top: none;">');
			result.push('<div class="person-write-action">');
			result.push('<label class="label-item vis-hide">保险条款</label>');
			result.push('<div class="inline-block"><div class="hz-check-item fl" rel="checkbox" for="" id="clauseInfo" data-errorremind="请选择同意条款" >');
			result.push('<i class="hz-check-icon"></i>');
			result.push('<span class="hz-check-text f12 fc6">');
			result.push('我已查看并同意');
			result.push('</span></div>');
			result.push('<span class="fl f12 fc6 ml5">');
			result.push('<a target="_blank" href="' + clauseUrl + '" id="insureClause" class="primary-link">保险条款</a>');
			result.push('&nbsp;和&nbsp;');
			result.push('<a href="javascript:;" id="insureDeclare" class="primary-link">投保人申明</a>');
			result.push('<span class="insure-tips clause-insure-tips write-info-error ml10"></span>'); //提示
			result.push('</span>');
			result.push('</div>');
			result.push('</div>');
			result.push('<div class="mt20 mb30">');
			result.push('<label class="label-item vis-hide">提交</label>');
			var isProjectPolicy = _this.insurance.projectInsuranceGroup ? true : false;
			if (!isProjectPolicy) { //方案单不显示提交投保单按钮 
				result.push('<a class="hz-button hz-button-primary submit-button fb" href="javascript:;"><span class="f16">提交投保单</span></a>');
			} else {
				_this.isProjectPolicy = isProjectPolicy;
			}

			var isCanSave = true,
				saveStyle = "";

			isCanSave = _this.insurance.planDetailInfo.supportShoppingCart; //是否支持加入购物车

			//isCanSave = _this.product.isCompanyCharge ? false : isCanSave; //是否是银行代扣

			//isCanSave = _this.product.payWay && _this.product.payWay.indexOf('8') > -1 ? false : isCanSave; //序列号支付

			saveStyle = isCanSave ? "" : "fn-hide";
			if (!isProjectPolicy) { //方案单不显示提交投保单按钮 
				result.push('<a class="ml30 tdl save-link ' + saveStyle + '" href="javascript:;" id="saveInsureToCar">保存投保信息</a>');
			} else {
				result.push('<a class="hz-button hz-button-primary  fb" href="javascript:;" id="saveInsureToCar" ><span class="f16">保存投保信息</span></a>');
			}

			result.push('</div>');
			result.push('</div>');

			result.push('</div>');

			firstModel.push(result.join(''));
			return firstModel.join('');
		},
		firstJobDataOptions: [],
		renderTable: function(modulesItem, mysefl) { //渲染Table
			var _this = this,
				result = [],
				cardNumConten = [],
				list = (mysefl === true ? modulesItem.selfProductAttrs : modulesItem.productAttrs) || [];

			list.forEach(function(item, i) {
				var attribute = item.attribute || {},
					styles = ['form-item', 'insure-form'], //添加样式
					stylesJoin = ' ',
					inputName = attribute.keyCode, //keyCode
					keyCode = attribute.keyCode,
					moduleId = modulesItem.id,
					attributeId = attribute.id,
					attr = ' ' +
					'data-name="' + attribute.name + '"  ' +
					'data-moduleid="' + moduleId + '" data-attributeid="' + attribute.id + '" ' +
					'data-defaultvalue="' + 0 + '" data-errorremind="' + (attribute.errorRemind || '') + '" data-defaultremind="' + (attribute.defaultRemind || '') + '"  ' +
					'data-required="' + (item.required || '') + '" data-regex="' + (attribute.regex || '') + '" ' +
					'maxlength="' + _this.inputMaxLength + '" ', //属性

					id = 'item-' + moduleId + '-' + item.attributeId + '-' + _this.formIndex, //ID
					values = attribute.values || [], //单选，多选
					insureName = _this.insureCName ? _this.insureCName : '投保人',
					attrNameText = (attribute.id === _this.ATTR_ID_RELATIONINSUREINSURANT) ? '被保人是<span class="js-insure-name">' + insureName + '</span>的' : attribute.name,
					relationStyle = (!_this.isMoreInsurant && !_this.isTeamInsurant) && item.attribute.id === _this.ATTR_ID_RELATIONINSUREINSURANT ? "display:none;" : "", //不是团单，并且不是多人，则不渲染关系字段
					showUnit = false, //是否显示单位
					unitText = '';

				if (attribute.id !== _this.ATTR_ID_CREDENTIALSINPUT) {
					result.push('<div class="field-item  field-row" style="' + relationStyle + '" id="item-' + moduleId + '-' + attributeId + '">');
					result.push('<label class="label-item" for="' + id + '">');
					if (item.required) {
						result.push('<span class="secondary-color pr5">*</span>');
					}
					result.push(attrNameText + '</label>');
					switch (attribute.id) {
						case _this.ATTR_ID_TEL: //手机号码-只能数字
							styles.push('only-number');
							break;
						case _this.ATTR_ID_BENEFICIARY:
							styles.push('only-number'); //受益比例-只能数字
							break;
						case _this.ATTR_ID_AREA_PROPERTY: // 产财地区
							styles.push('select-area');
							break;
						case _this.ATTR_ID_AREA_INSURE: //投保地区
							styles.push('select-area');
							break;
						case _this.ATTR_ID_AREA_BANK: //银行地址
							styles.push('select-area');
							break;
						case _this.ATTR_ID_AREA_LIVING: //居住省市地址
							styles.push('select-area');
							break;
						case _this.ATTR_ID_AREA_ACCOUNT: //开户省份
							styles.push('select-area');
							break;
						case _this.ATTR_ID_AREA_RECEIVER: //开户省份
							styles.push('select-area');
							break;
						case _this.ATTR_ID_JOB: //职业
							styles.push('job-level');
							break;
						case _this.ATTR_ID_INSURE_DATE: //起保日期
							styles.push('fixed-date');
							break;
						case _this.ATTR_ID_CREDENTIALSTYPE: //证件类型  重构控件样式classsdropdown-credentials
							styles.push('credentials dropdown-credentials');
							if (moduleId === 20) {
								_this.cardType = values;
							}
							break;
						case _this.ATTR_ID_BUYCOUNT: //购买份数
							styles.push('buycount');
							break;
						case _this.ATTR_ID_DELIVERADDRESS: //寄送地址
							styles.push('input-address-text');
							break;
						case _this.ATTR_ID_CREDENTIALSINPUT: //证件号码
							styles.push('id-card-input');
							break;
						case _this.ATTR_ID_RELATIONINSUREINSURANT: //我是被保人  关系
							_this.defaultInsureInsurantRelation = values;
							_this.relationships = values;
							styles.push('relationship');
							break;
						case _this.ATTR_ID_HEIGHT: //身高
							showUnit = true; //是否显示单位
							unitText = 'cm';
							break;
						case _this.ATTR_ID_WEIGHT: //体重
							showUnit = true; //是否显示单位
							unitText = 'kg';
							break;
						case _this.ATTR_ID_YEARLYINCOME: //年收入
							showUnit = true; //是否显示单位
							unitText = '元';
							break;
					}
					switch (attribute.type) {
						case 0: //下拉框
							if (inputName === "flightFromCity" || inputName === "flightToCity" || inputName === "fromAirport" || inputName === "toAirport") { //是否是航延险
								if (inputName === "fromAirport" || inputName === "toAirport") { //航延险特殊需求 只要配置了城市就得渲染机场，不管后台有没有配置机场

								} else {
									result.push('<input class="insure-form  ' + styles.join(stylesJoin) + '" type="hidden" name="' + inputName + '" id="' + id + '" ' + attr + '/>');
									result.push('<span class="destination vm flightSelect" tableIndex="0" data-name="' + attribute.name + '"  data-attributeid="' + attribute.id + '">选择城市</span>');
									var relationAttributeId = 0,
										relationAttributeName = '',
										relationAttributeText = '';
									if (inputName === "flightFromCity") { //航班出发城市 航延险特殊处理
										relationAttributeId = _this.ATTR_ID_FROMAIRPORT;
										relationAttributeName = 'fromAirport';
										relationAttributeText = '航班出发机场';
									} else {
										relationAttributeId = _this.ATTR_ID_TOAIRPORT;
										relationAttributeName = 'toAirport';
										relationAttributeText = '航班到达机场';
									}
									result.push('<span class="insure-tips ml10"></span>'); //添加文字提示
									result.push('</div>');
									result.push('<div class="field-item  field-row" style="' + relationStyle + '" id="item-' + moduleId + '-' + relationAttributeId + '">');
									result.push('<label class="label-item">' + relationAttributeText + '</label>');
									attr = ' ' +
										'data-name="' + relationAttributeText + '"  ' +
										'data-moduleid="' + moduleId + '" data-attributeid="' + relationAttributeId + '" ' +
										'data-defaultvalue="' + 0 + '" data-errorremind="' + (attribute.errorRemind || '') + '" data-defaultremind="' + (attribute.defaultRemind || '') + '"  ' +
										'data-required="' + (item.required || '') + '" data-regex="' + (attribute.regex || '') + '" ' +
										'maxlength="' + _this.inputMaxLength + '" '; //属性
									id = 'item-' + moduleId + '-' + relationAttributeId + '-' + _this.formIndex;


									result.push('<div tabindex="0" class="hz-dropdown ' + styles.join(stylesJoin) + ' " ' + attr + ' data-dropdown="dropdown-' + id + '" name="' + relationAttributeName + '"  id="' + id + '">');
									result.push('<div class="input-select">');
									result.push('<span class="input-select-text more-tag no-select">请选择</span>');
									result.push('<b class="iconfont">&#xe70b;</b>');
									result.push('</div>');
									result.push('<div class="hz-dropdown-content"  data-dropdown-item="dropdown-' + id + '" id="dropdown-' + id + '">');
									result.push('<ul class="hz-dropdown-menu">');
									result.push('</ul>');
									result.push('</div>');
									result.push('</div>');
								}
							} else {
								result.push('<div tabindex="0" class="hz-dropdown ' + styles.join(stylesJoin) + ' " ' + attr + ' data-dropdown="dropdown-' + id + '" name="' + inputName + '"  id="' + id + '">');
								result.push('<div class="input-select">');
								result.push('<span class="input-select-text more-tag no-select">请选择</span>');
								result.push('<b class="iconfont">&#xe70b;</b>');
								result.push('</div>');
								result.push('<div class="hz-dropdown-content"  data-dropdown-item="dropdown-' + id + '" id="dropdown-' + id + '">');
								result.push('<ul class="hz-dropdown-menu">');

								if (attribute.id === _this.ATTR_ID_RELATIONINSUREINSURANT) {
									values = _this.tranfromRelations(values);
								}
								values.forEach(function(val, j) {
									result.push('<li class="hz-select-option" id="dropdown-option-' + id + '-' + val.controlValue + '"value="' + val.controlValue + '" text="' + val.value + '" >' + val.value + '</li>');
								});

								result.push('</ul>');
								result.push('</div>');
								result.push('</div>');

								if (attribute.id === _this.ATTR_ID_CREDENTIALSTYPE) {
									result.push('#CardNumContent#');
								}
							}

							// result.push('<select name="" id=""><option value="">asdf</option></select>');
							break;
						case 1: //日历控件
							var maxDate = '',
								minDate = '',
								endMaxDate = '',
								endMinDate = '',
								defaultText = '',
								startText = '';
							if (attribute.id === _this.ATTR_ID_INSURE_DATE && _this.product.insureTime === 3) { //以保险公司出单为准
								result.push('<span class="fc6">' + _this.TEXT_INSURANCE_START_DATE + '</span>');
							} else {
								if (attributeId === _this.ATTR_ID_CREDENTIALSVALIDITY) { //证件有效期
									maxDate = 'maxDate="' + _this.getCurrentTime() + '"';
									minDate = 'minDate="1900-1-1"';
									endMaxDate = 'maxDate="2100-12-30"';
									endMinDate = 'minDate="' + _this.getCurrentTime() + '"';
									startText = '<span class="insure-span ml20">起：</span>';
									result.push('<div class="hz-check-item inline-block  credentials-validity" style="width:60px" rel="checkbox" > <i class="hz-check-icon"></i>');
									result.push('<input class="insure-checkbox insure-form credentials-validity fn-hide" type="checkbox" name="validityTime" id="' + id + '" ' + attr + '/><label for="' + id + '" class="insure-label">长期</label>');
									result.push('</div>');
								} else if (attributeId === _this.ATTR_ID_BIRTHDATE && moduleId === _this.MODULES_ID_INSURED) { //出生日期
									$.each(_this.ruleParam.genes, function(i, item) { //带入产品详情页面的试算信息
										if (item.key) {
											switch (item.key) {
												case _this.INSURANTDATEKEY: //承保年龄
													try { //只带入 year-moth-day ，不带入1-80周岁
														if (item.value.split('-').length > 2) {
															defaultText = item.value;
															_this.logRed('产品详情页的试算信息带入的日期：' + defaultText);
														}
													} catch (ex) {
														defaultText = '';
													}
													break;
											}
										}
									});
								}

								styles.push('styleItem');
								result.push(startText);
								result.push('<input class="Wdate insure-calendar ' + styles.join(stylesJoin) + '" type="text" name="' + inputName + '" id="' + id + '" ' + attr + ' ' + maxDate + ' ' + minDate + ' ' + ' value="' + defaultText + '" />');
								if (attributeId === _this.ATTR_ID_CREDENTIALSVALIDITY) { //证件有效期
									result.push('<span class="insure-tips ml10"></span>'); //添加文字提示
									result.push('<span class="insure-span validity-end-item validity-span">止：</span><input class="validity-span  validity-end-item ' + styles.join(stylesJoin) + ' insure-calendar Wdate " type="text" name="cardPeriodEnd" id="" ' + endMaxDate + ' ' + endMinDate + ' ' + attr + ' />');
								}
							}
							break;
						case 2: //同时出现下拉框和日历控件区间
							result.push('同时出现下拉框和日历控件区间');
							break;
						case 3: //文本框
							styles.push('input-text');
							var val = "",
								defaultValue = "";

							if (attribute.id === _this.ATTR_ID_BUYCOUNT) {
								$.each(_this.ruleParam.genes, function(i, item) {
									if (item.key) {
										switch (item.key) {
											case _this.BUYCOUNTKEY: //购买份数
												val = parseInt(item.value);
												defaultValue = val;
												break;
										}
									}
								});
							}
							if (inputName.indexOf('Address') > 0) { //地址展示长输入框
								styles.push('long-input-text');
							}
							result.push('<input type="text" class=" ' + styles.join(stylesJoin) + ' " name="' + inputName + '" id="' + id + '"  ' + attr + ' defaultvalue="' + defaultValue + '"value="' + val + '"/>');
							if (inputName === "cName") {
								result.push('<a href="javascript:;" class="select-contacts-link f12 fc6 ml10" contactsIndex="' + _this.formIndex + '"><i class="iconfont fc9 f22 mr5">&#xe710;</i>选择联系人</a>');
							}
							if (showUnit) {
								result.push('<span class="js-insure-tips  pl5">' + unitText + '</span>');
							}
							break;
						case 4: //地区控件
							var firstArea = attribute.areaWealth || [], //财产所有地初始地区
								areaNameArr = ['Province', 'City', 'Area'],
								selectAttr = ' ' + 'data-name="' + attribute.name + '"  ' + 'data-moduleid="' + moduleId + '" data-attributeid="' + attribute.id + '" ' + 'data-defaultvalue="' + 0 + '" data-errorremind=" " data-defaultremind=" "  ' + 'data-required="' + (item.required || '') + '" data-regex="' + (attribute.regex || '') + '" ' + 'maxlength="' + _this.inputMaxLength + '" ';

							//var firstArea = [];

							// $.each(areaWealth, function(i, item) {
							// 	firstArea.push('<option value="' + item.code + '" text="' + item.text + '">' + item.text + '</option>');
							// });

							$.each(areaNameArr, function(i, item) {

								var name = keyCode + item;
								var id = keyCode + '-' + item + '-' + moduleId;
								var _style = '';
								if (i !== 0) {
									firstArea = [];
									_style = 'display:none;margin-left:10px';
									// styles.push('ml10');
								}

								var obj = {};

								obj.options = firstArea;
								obj.attr = selectAttr + '  name="' + inputName + '" areaName="' + item + '"  id="' + id + '"  select="' + item.toLowerCase() + '"  style="' + _style + '"  ';
								obj.showDefaultText = true;
								obj.styles = styles;
								//obj.listWidth="300px";

								result.push(_this.renderSelectHmtl(obj));

								// result.push('<select class="' + styles.join(stylesJoin) + '" name="' + inputName + '" id="' + id + '" ' + attr + ' select="' + item.toLowerCase() + '" style="' + _style + '">' + _this.DEFAULTOPTION + firstArea.join('') + '</select>');

								result.push('<input class="area-text" name="' + inputName + 'Text" type="hidden" id="' + item + 'Text"/>');

							});

							if (attributeId === _this.ATTR_ID_AREA_PROPERTY) {
								styles.push('input-text');
								result.push('<span class="insure-tips ml10"></span>'); //添加文字提示
								result.push('</div>');
								result.push('<div class="field-item  field-row" ><label class="label-item" for="item-10-2-1"></label>');
								result.push('<input class="' + styles.join(stylesJoin) + '  insure-address-user" data-required="0" type="text" name="' + inputName + 'UserInfo"  style="width:400px"  id=""  ' + attr + '/>');
							}

							break;
						case 5: //职业控件
							var jobDataOptions = attribute.companyJobList || [];
							// result.push('<select class=" insure-form select-job ' + styles.join(stylesJoin) + '"  job="1"  id="' + id + '" ' + attr + '">');
							// result.push(_this.DEFAULTOPTION);

							var firstJobDataOptions = [];
							$.each(jobDataOptions, function(i, item) {
								firstJobDataOptions.push('<li class="hz-select-option"   value="' + item.id + '" id="' + item.id + '" code="' + item.code + '" text="' + item.name + '" level="' + item.level + '">' + item.name + '</li>');
							});
							_this.firstJobDataOptions = firstJobDataOptions;


							var obj1 = {};
							obj1.options = firstArea;
							obj1.attr = attr + '  name="' + inputName + '" id="' + id + '"  job="1" ';
							obj1.showDefaultText = true;
							obj1.styles = styles;
							obj1.listWidth = "300px";
							result.push(_this.renderSelectHmtl(obj1));


							styles.push('ml10');
							var obj2 = {};
							obj2.options = firstArea;
							obj2.attr = attr + '  name="' + inputName + '" id=""  job="2"  style="display:none;"  ';
							obj2.showDefaultText = true;
							obj2.styles = styles;
							obj2.listWidth = "300px";
							result.push(_this.renderSelectHmtl(obj2));

							var obj3 = {};
							obj3.options = firstArea;
							obj3.attr = attr + '  name="' + inputName + '" id=""  job="3"  style="display:none;"  ';
							obj3.showDefaultText = true;
							obj3.styles = styles;
							obj3.listWidth = "300px";

							result.push(_this.renderSelectHmtl(obj3));



							// result.push('</select>');
							// result.push('<select class="insure-form select-job ' + styles.join(stylesJoin) + '" job="2"  id="" ' + attr + ' style="display:none;">' + _this.DEFAULTOPTION + '</select>');
							// result.push('<select class="insure-form select-job ' + styles.join(stylesJoin) + '" job="3"  id="" ' + attr + ' style="display:none;">' + _this.DEFAULTOPTION + '</select>');
							// result.push('<input class="hidden-job-text" type="hidden" name="' + inputName + '" ' + attr + '/>'); //职业文本
							result.push('<input class="hidden-job-text" type="hidden" name="jobId" ' + attr + '/>'); //职业ID
							result.push('<input class="hidden-job-text" type="hidden" name="jobNum" ' + attr + '/>'); //职业Code
							result.push('<input class="hidden-job-text" type="hidden" name="jobLevel" ' + attr + '/>'); //职业等级 
							break;
						case 6: //密码控件
							styles.push('password');
							styles.push('input-text');
							result.push('<input type="password" class=" ' + styles.join(stylesJoin) + ' " name="' + inputName + '" id="' + id + '"  ' + attr + '/>');
							result.push('<span class="insure-tips ml10"></span>'); //添加文字提示
							result.push('</div>');
							result.push('<div>');
							result.push('<label class="label-item" for="reconfim-' + id + '">' + "密码确认" + '</label>');
							result.push('<input type="password"  data-errorremind="必须与保单密码一致" class=" ' + styles.join(stylesJoin) + ' " name="reconfim-' + inputName + '" id="reconfim-' + id + '"  ' + attr + '/>');

							// result.push('密码控件'); 必须与保单密码一致
							break;
						case 7: //文本
							result.push('文本类型');
							break;
						case 8: //对话框
							result.push('<input class="insure-form  ' + styles.join(stylesJoin) + '" type="hidden" name="' + inputName + '" id="' + id + '" ' + attr + '/>');
							if (inputName === "flightFromCity" || inputName === "flightToCity") { //是否是航延险
								result.push('<span class="destination vm flightSelect" tableIndex="0" data-name="' + attribute.name + '"  data-attributeid="' + attribute.id + '">选择城市</span>');
							} else {
								result.push('<span class="destination vm" tableIndex="0" id="destination" data-attributeid="' + attribute.id + '"> 选择目的地</span><a class="insure-link-color ml10 vm" href="javascript:;" id="noAcceptCountry">不承保国家或地区</a>');
								result.push('<div class="select-countries" style="margin:0 0 10px 180px;" data-attributeId="' + attribute.id + '" id="selectCountries"></div><input class="select-countries" type="hidden" name="' + inputName + '" data-attributeId="' + attribute.id + '" />');
							}
							// result.push('对话框类型');
							break;
						case 9: //单选
							var checked, checkVal;
							if (attribute.id === _this.ATTR_ID_SEX && (moduleId === 20)) {
								$.each(_this.ruleParam.genes, function(i, item) { //带入产品详情页面的试算信息
									if (item.key) {
										switch (item.key) {
											case _this.SEXKEY: //性别
												checkVal = item.value;
												break;
										}
									}
								});
							}

							values.forEach(function(item, i) {
								var _id = 'input-' + id + i;
								if (checkVal === item.value) {
									checked = 'hz-radio-item-checked';
								} else {
									checked = "";
								} //_this.info(item);

								result.push('<div class="hz-radio-item inline-block  insure-radio  ' + checked + ' ' + styles.join(stylesJoin) + '" value="' + item.controlValue + '" name="' + inputName + "-" + id + '" id="' + _id + '" ' + attr + ' rel="radio"><i class="hz-radio-icon"></i>');
								result.push('<span class="hz-radio-text">' + item.value + '</span>');
								result.push('</div>');
							});
							break;
						case 10: //多选
							rvalues.forEach(function(item, i) {
								var _id = 'input-' + id + i;
								//_this.info(item);
								styles.push('fn-hide');
								result.push('<div class="hz-check-item inline-block " rel="checkbox" > <i class="hz-check-icon"></i>');
								result.push('<input type="checkbox" value="' + item.controlValue + '"  name="' + inputName + '" id="' + _id + '" class="' + styles.join(stylesJoin) + '"  ' + attr + '/>');
								result.push('<label class = "insure-label "  for="' + _id + '">' + item.value + '</label>');
								result.push('</div>');
							});
							break;
					}
					//添加保障期限提示
					if (_this.MODULES_ID_INSURE_DATE === moduleId && _this.ATTR_ID_INSURE_DATE === attributeId) {
						result.push('<span class="write-info-default ml10" id="insurantDate"></span>');
					}

					result.push('<span class="insure-tips ml10"></span>'); //添加文字提示
					result.push('</div>');
				} else {
					styles.push('id-card-input');
					styles.push('input-text');
					cardNumConten.push('<input type="text" class="ml10  ' + styles.join(stylesJoin) + ' " name="' + inputName + '" id="' + id + '"  ' + attr + '  value=""/>');
				}
				result.push('');
			});
			return result.join('').replace('#CardNumContent#', cardNumConten.join(''));
		},
		renderBeneficiaryModule: function(insurantIndex) { //渲染受益人模块
			var _this = this,
				result = [],
				length;
			$.each(this.data.modules, function(i, item) {
				if (item.id === _this.MODULES_ID_BENEFICIARY) {
					// _this.addMoreBox.append(_this.addMoreTable(item));
					// result.push('<div class="person-write-info" id="module-' + item.id + insurantIndex + '">');
					// result.push('<div class="info-title">' + item.name + '</div>');

					if (_this.data.product.beneficiaryType !== 0) {
						result.push('<div class="field-item">');
						result.push('<label class="label-item" for="beneficiarytype"><span class="secondary-color pr5">*</span>受益人信息</label>');
						result.push('<div class="hz-dropdown form-item  beneficiarytype-select"  data-insurantindex="' + insurantIndex + '"  data-dropdown="dropdown-item-beneficiarytype-' + item.id + '-' + insurantIndex + '">');
						result.push('<div class="input-select">');
						result.push('<span class="input-select-text more-tag no-select">法定继承人</span>');
						result.push('<b class="iconfont">&#xe70b;</b>');
						result.push('</div>');
						result.push('<div class="hz-dropdown-content" data-dropdown-item="dropdown-item-beneficiarytype-' + item.id + '-' + insurantIndex + '">');
						result.push('<ul class="hz-dropdown-menu">');

						var fdHtml = '<li class="hz-select-option"  name="beneficiarytype" value="1"  data-beneficiarytype="1" text="法定继承人" > 法定继承人</li>';
						var zdHtml = '<li class="hz-select-option"  name="beneficiarytype"  value="2" data-beneficiarytype="2" text="指定受益人" > 指定受益人</li>';
						if (_this.data.product.beneficiaryType === 1) { //法定
							result.push(fdHtml);
						} else if (_this.data.product.beneficiaryType === 2) { //指定
							result.push(zdHtml);
						} else if (_this.data.product.beneficiaryType === 12) { //法定+指定
							result.push(fdHtml + zdHtml);
						}
						result.push('</ul>');
						result.push('</div>');
						result.push('</div>');
						result.push('<span class="insure-tips ml10"></span>'); //添加文字提示
						result.push('</div>');
						if (_this.data.product.beneficiaryType.toString().indexOf('2') > -1) {
							var zdContentStyle = _this.data.product.beneficiaryType === 12 ? 'style="display:none"' : '';
							var secondBeneficiaryStyle = _this.data.product.secondBeneficiaryLimit > 0 ? '' : 'style="display:none"';

							result.push('<div class="pb10 zd-beneficiary" data-insurantindex="' + insurantIndex + '" id="zd-beneficiary-content' + '-' + insurantIndex + '" ' + zdContentStyle + '>');
							result.push('<label class="label-item vis-hide" for="beneficiary">受益人</label>');
							result.push('<div class="inline-block beneficiary-zd-conten">');

							result.push('<div class="beneficiaryFirst" id="beneficiaryFirst' + '-' + insurantIndex + '"> <p class="hz-alert mb10"><strong class="inline-block fc6">第一顺序受益人（<span class="beneficiary-count">0</span>/' + _this.product.firstBeneficiaryLimit + '）</strong><i class="iconfont f18" rel="prompt" data-prompt-html="《继承法》规定的法定继承人范围是,第一顺序继承人为配偶、子女、父母">&#xe715;</i></p>');
							result.push('<div class="beneficiaries-list  beneficiary-content">');
							result.push('<table class="hz-table hz-table-bordered f12 beneficiary-table">');
							result.push('<col width="8%"/> <col width="84%"/> <col width="8%"/>');
							result.push('<tr><td class="tac">序号</td><td>受益人信息</td><td>操作</td></tr>');
							result.push('<tr class="beneficiary-addtr"><td colspan="3" class="tac"><a href="javascript:;" class="add-link f12 add-beneficiary" data-type="first"><i class="iconfont fc9 f18 mr5">&#xe70c;</i>新增第一顺序受益人</a></td></tr>');
							result.push('</table>');
							result.push('</div>');
							result.push('</div>');


							result.push('<div  class="beneficiarySecond mt30"   id="beneficiarySecond' + '-' + insurantIndex + '"' + secondBeneficiaryStyle + ' > <p class="hz-alert mb10"><strong class="inline-block fc6">第二顺序受益人（<span class="beneficiary-count">0</span>/' + _this.product.secondBeneficiaryLimit + '）</strong><i class="iconfont f18" rel="prompt" data-prompt-html="《继承法》规定的法定继承人范围是,第二顺序继承人为兄弟姐妹、祖父母、外祖父母">&#xe715;</i></p>');
							result.push('<div class="beneficiaries-list ">');
							result.push('<table class="hz-table hz-table-bordered f12 beneficiary-table">');
							result.push('<col width="8%"/> <col width="84%"/> <col width="8%"/>');
							result.push('<tr class="beneficiary-head"><td class="tac">序号</td><td>受益人信息</td><td>操作</td></tr>');
							result.push('<tr class="beneficiary-addtr"><td colspan="3" class="tac"><a href="javascript:;" class="add-link f12 add-beneficiary" data-type="second"><i class="iconfont fc9 f18 mr5">&#xe70c;</i>新增第二顺序受益人</a></td></tr>');
							result.push('</table>');
							result.push('</div>');
							result.push('</div>');

							result.push('</div>');
							result.push('</div>');
						}
					}
				}
			});
			return result.join('');
		},
		renderFirstModeule: function() { //渲染第一个模块
			var _this = this,
				result = [],
				insurantTypeArr = _this.insurantTypeArr;
			result.push('<div class="info-title"></div>');
			if (insurantTypeArr[2] != '1' && insurantTypeArr[3] != '1') { //不是团单，并且不能给多人投保则展示为谁投保
				result.push('<div class="field-item">');
				result.push('<label class="label-item" for="forrelationtype"><span class="secondary-color pr5">*</span>为谁投保</label>');
				result.push('<div class="hz-dropdown  form-item  for-relation-select" data-dropdown="dropdown-item-forrelationtype"  data-required="1" id="forrelationtype">');
				result.push('<div class="input-select">');
				result.push('<span class="input-select-text more-tag no-select">请选择</span>');
				result.push('<b class="iconfont">&#xe70b;</b>');
				result.push('</div>');
				result.push('<div class="hz-dropdown-content" data-dropdown-item="dropdown-item-forrelationtype">');
				result.push('<ul class="hz-dropdown-menu ">');

				result.push('</ul>');
				result.push('</div>');
				result.push('</div>');
				result.push('<span class="insure-tips ml10"></span>'); //添加文字提示
				result.push('</div>');
			}
			return result.join('');
		},
		protectItmes: [],
		renderRight: function(data) { //渲染右侧信息
			var _this = this,
				result = [],
				dateLimit = '', //保障期限
				paymentType = '', //缴费类型
				paymentTime = '', //缴费年限
				productName = '',
				genes = data.result.insurance.genes;

			_this.protectItmes = data.result.insurance.restrictRule.protectTrialItemList;

			genes.forEach(function(item, i) {
				switch (item.key) {
					case _this.INSURANTDATELIMIT: //保障期限
						dateLimit = item.value;
						break;
					case _this.PAYMENTTYPE: //缴费类型
						paymentType = item.value;
						break;
					case _this.INSUREAGELIMIT: //缴费年限
						paymentTime = item.value;
						break;
					default:
						break;
				}
			});

			productName = data.result.insurance.planDetailInfo.productName + ' ' + data.result.insurance.planDetailInfo.planName;
			_this.productName = productName;
			result.push('<div class="secondary-hot-product bgfw">');
			result.push('<div class="secondary-hot-product-head">');
			result.push('<a class="company-logo" target="_blank"  href="http://www.huize.com/brand/detail/' + _this.product.company.id + '">');
			result.push('<img src="' + _this.product.company.bigLogoImg + '" alt="' + _this.product.company.compCnName + '" title="' + _this.product.company.compCnName + '" height="45">');
			result.push('</a>');
			result.push('<h2 class="hot-product-title mt35 f18"><a target="_blank" href="http://www.huize.com/product/detail-' + _this.product.operationProductId + '.html?DProtectPlanId=' + _this.product.operationPlanId + '">' + productName + '</a></h2>');
			result.push('</div>');

			result.push('<div class="secondary-hot-product-body">');
			result.push('<div class="protect-item">');
			if (paymentType && paymentType.indexOf('一次性') < 0) {
				var paymentText = paymentType + (paymentTime ? ',' + paymentTime : '');
				result.push('<h4 class="fc6 f14 fb mb5">缴费方式</h4>');
				result.push('<p class="f12 fc6 mb15">' + paymentText + '</p>');
			}

			result.push('<h4 class="fc6 f14 fb mb5">保障期限</h4>');
			result.push('<p class="f12 fc6 mb15">' + dateLimit + '</p>');
			result.push('<div id="rightBody">');
			//result.push(_this.renderProtectItme());
			result.push('</div>');
			result.push('</div>');
			result.push('</div>');

			result.push('<div class="secondary-hot-product-foot">');
			result.push('<div id="rightFoot">');

			result.push('</div>');
			result.push('<div class="mt15 hot-product-price">');
			result.push('<p class="primary-color fr">¥<span class="f36" id="totalPrice">150</span></p>');
			result.push('<span>合计</span>');
			result.push('</div>');
			result.push('</div>');

			result.push('</div>');

			return result.join('');
		},
		renderSteps: function() {
			var _this = this,
				result = [],
				step = 1;
			result.push('<li class="hz-step-item hz-step-item-active"><i class="dot">' + step + '</i><span>购物车</span></li>');
			if (_this.product.healthInformWebId) { //有健康告知
				if (_this.product.healthInformPosition) { /** 健康告知显示时间：0填写投保信息中，1填写投保信息后 */
					step += 1;
					result.push('<li class="hz-step-item hz-step-item-active"><i class="dot">' + step + '</i><span class="hz-step-text" style="right: -22px;">填写投保信息</span></li>');
					step += 1;
					result.push('<li class="hz-step-item hz-step-item-active"><i class="dot">' + step + '</i><span class="hz-step-text" style="right: -10px;">投保告知</span></li>');
				} else {
					step += 1;
					result.push('<li class="hz-step-item hz-step-item-active"><i class="dot">' + step + '</i><span class="hz-step-text" style="right: -10px;">投保告知</span></li>');
					step += 1;
					result.push('<li class="hz-step-item hz-step-item-active"><i class="dot">' + step + '</i><span class="hz-step-text" style="right: -22px;">填写投保信息</span></li>');
				}
			} else {
				step += 1;
				result.push('<li class="hz-step-item hz-step-item-active"><i class="dot">' + step + '</i><span class="hz-step-text" style="right: -22px;">填写投保信息</span></li>');
			}
			step += 1;
			result.push('<li class="hz-step-item"><i class="dot">' + step + '</i><span class="hz-step-text" style="right: -17px;">确认并支付</span></li>');
			result.push('<li class="hz-step-item last-item"></li>');

			$('#steps').html(result.join(''));
		},
		beneficiaryDialogHtml: [],
		renderBeneficiarydDialog: function() { //受益人弹出框
			var _this = this,
				result = [],
				modulesItem = _this.beneficiaryItem,
				list = modulesItem.productAttrs || [];
			result.push('<div id="beneficiary-dialog"  class="beneficiary-dialog layui-layer-wrap credentials-form" style="padding: 10px 40px; position: relative;">');
			result.push('<div>');
			list.forEach(function(item, i) {
				var attribute = item.attribute || {},
					styles = ['form-item', 'insure-form'], //添加样式
					stylesJoin = ' ',
					inputName = attribute.keyCode, //keyCode
					keyCode = attribute.keyCode,
					moduleId = modulesItem.id,
					attributeId = attribute.id,
					attr = ' ' +
					'data-name="' + attribute.name + '"  ' +
					'data-moduleid="' + moduleId + '" data-attributeid="' + attribute.id + '" ' +
					'data-defaultvalue="' + 0 + '" data-errorremind="' + (attribute.errorRemind || '') + '" data-defaultremind="' + (attribute.defaultRemind || '') + '"  ' +
					'data-required="' + (item.required || '') + '" data-regex="' + (attribute.regex || '') + '" ' +
					'maxlength="' + _this.inputMaxLength + '" ', //属性

					id = 'item-' + moduleId + '-' + item.attributeId + '-' + _this.formIndex, //ID
					values = attribute.values || [], //单选，多选
					attrNameText = attribute.name;

				switch (attribute.id) {
					case _this.ATTR_ID_TEL: //手机号码-只能数字
						styles.push('only-number');
						break;
					case _this.ATTR_ID_BENEFICIARY:
						styles.push('proportion'); //受益比例-只能数字
						break;
					case _this.ATTR_ID_CREDENTIALSTYPE: //证件类型
						styles.push('credentials');
						break;
					case _this.ATTR_ID_CREDENTIALSINPUT: //证件号码
						styles.push('id-card-input');
						break;
				}
				result.push('<div class="mb20 field-row">');
				if (i === 0) {
					result.push('<div class="hz-alert hz-alert-error f12" id="beneficiaryTips"></div>');
				}
				switch (attribute.type) {
					case 0: //下拉框
						result.push('<div  class="hz-dropdown ' + styles.join(stylesJoin) + ' " ' + attr + ' data-dropdown="dropdown-' + id + '" name="' + inputName + '"  id="' + id + '">');
						result.push('<div class="input-select">');
						result.push('<input type="text"  readonly  class="input-select-text more-tag no-select" placeholder-text="' + attrNameText + '" style="background-color:transparent"/>');
						result.push('<b class="iconfont">&#xe70b;</b>');
						result.push('</div>');
						result.push('<div class="hz-dropdown-content"  data-dropdown-item="dropdown-' + id + '" id="dropdown-' + id + '">');
						result.push('<ul class="hz-dropdown-menu">');

						values.forEach(function(val, j) {
							result.push('<li class="hz-select-option" id="dropdown-option-' + id + '-' + val.controlValue + '"value="' + val.controlValue + '" text="' + val.value + '" >' + val.value + '</li>');
						});

						result.push('</ul>');
						result.push('</div>');
						result.push('</div>');

						// result.push('<select name="" id=""><option value="">asdf</option></select>');
						break;
					case 1: //日历控件
						var maxDate = '',
							minDate = '',
							endMaxDate = '',
							endMinDate = '',
							startText = '',
							dateStyle = '';
						if (attributeId === _this.ATTR_ID_CREDENTIALSVALIDITY) { //证件有效期
							maxDate = 'maxDate="' + _this.getCurrentTime() + '"';
							minDate = 'minDate="1900-1-1"';
							endMaxDate = 'maxDate="2100-12-30"';
							endMinDate = 'minDate="' + _this.getCurrentTime() + '"';
							dateStyle = "width:100px;";
							startText = '<span class="insure-span">起：</span>';
							result.push('<div class="hz-check-item inline-block  credentials-validity" style="width:60px" rel="checkbox" > <i class="hz-check-icon"></i>');
							result.push('<input class="insure-checkbox insure-form credentials-validity fn-hide" type="checkbox" name="validityTime" id="' + id + '" ' + attr + '/><label for="' + id + '" class="insure-label">长期</label>');
							result.push('</div>');
							result.push('</div>');
							result.push('<div class="mb20 field-row">');
						}
						styles.push('styleItem');
						result.push(startText);
						result.push('<input class="Wdate insure-calendar input-text ' + styles.join(stylesJoin) + '" placeholder-text="' + attrNameText + '"  type="text"  style="' + dateStyle + '"  name="' + inputName + '" id="' + id + '" ' + attr + ' ' + maxDate + ' ' + minDate + ' ' + ' data-calendartype="beneficiary"/>');
						if (attributeId === _this.ATTR_ID_CREDENTIALSVALIDITY) { //证件有效期
							result.push('<span class="insure-span validity-end-item validity-span">止：</span><input class="validity-span  validity-end-item input-text ' + styles.join(stylesJoin) + ' insure-calendar Wdate "  style="' + dateStyle + '"  placeholder-text="' + attrNameText + '"  type="text" name="cardPeriodEnd" id="" ' + endMaxDate + ' ' + endMinDate + ' ' + attr + '  data-calendartype="beneficiary" />');
						}
						break;
					case 2: //同时出现下拉框和日历控件区间
						result.push('同时出现下拉框和日历控件区间');
						break;
					case 3: //文本框
						styles.push('input-text');
						if (attributeId === _this.ATTR_ID_BENEFICIARY) { //收益比例
							attr = attr + ' style="width:230px;"';
						}
						result.push('<input type="text" placeholder-text="' + attrNameText + '"   class=" input-text ' + styles.join(stylesJoin) + ' " name="' + inputName + '" id="' + id + '"  ' + attr + '/>');
						if (inputName === "cName") {
							result.push('<p class="mt5"><a href="javascript:;" class="select-contacts-link f12 fc6" contactsIndex="' + modulesItem.sort + '"><i class="iconfont fc9 f22 mr5">&#xe710;</i>选择联系人</a></p>');
						}
						if (attributeId === _this.ATTR_ID_BENEFICIARY) { //收益比例
							result.push('<span class="inline-block pt10 ml10">%</span>');
						}
						break;
					case 4: //地区控件
						var areaWealth = attribute.areaWealth || []; //财产所有地初始地区
						var areaNameArr = ['Province', 'City', 'Area'];
						var firstArea = [];
						break;
					case 5: //职业控件

						break;
					case 6: //密码控件
						styles.push('input-text');
						result.push('<input type="password"  placeholder-text="' + attrNameText + '" class=" input-text ' + styles.join(stylesJoin) + ' " name="' + inputName + '" id="' + id + '"  ' + attr + '/>');
						result.push('<input type="password"   placeholder-text="确认密码" class=" input-text' + styles.join(stylesJoin) + ' " name="reconfim-' + inputName + '" id="reconfim-' + id + '"  ' + attr + '/>');
						// result.push('密码控件');
						break;
					case 7: //文本
						result.push('文本类型');
						break;
					case 8: //对话框
						break;
					case 9: //单选
						result.push('<span class="inline-block tar mr10">' + attrNameText + '</span>');
						var checked, checkVal = 0;
						values.forEach(function(item, i) {
							var _id = 'input-' + id + i;
							if (checkVal === item.controlValue) {
								checked = ' hz-radio-item-checked ';
							} else {
								checked = ' ';
							}
							result.push('<div class="hz-radio-item inline-block  insure-radio  ' + checked + ' ' + styles.join(stylesJoin) + '" value="' + item.controlValue + '" name="' + inputName + "-" + id + '" id="' + _id + '" ' + attr + ' rel="radio"><i class="hz-radio-icon"></i>');
							result.push('<span class="hz-radio-text">' + item.value + '</span>');
							result.push('</div>');
						});
						break;
					case 10: //多选
						rvalues.forEach(function(item, i) {
							var _id = 'input-' + id + i;
							//_this.info(item);
							result.push('<input type="checkbox" value="' + item.controlValue + '"  name="' + inputName + '" id="' + _id + '" class="' + styles.join(stylesJoin) + '"  ' + attr + '/>');
							result.push('<label class = "insure-label mr10"  for="' + _id + '">' + item.value + '</label>');
						});
						break;
				}

				result.push('</div>');
			});
			result.push('<div class="hz-check-item hz-check-item-checked inline-block mb20 saveContract" rel="checkbox" > <i class="hz-check-icon"></i>');
			result.push('<input class="insure-checkbox insure-form form-item fn-hide" type="checkbox" name="chkSaveInsure" id="chkSaveInsureBeneficiary" data-moduleid="30"  data-attributeid="" data-name="保存为常用联系人" value="1" checked="true" />');
			result.push('<label class="hz-check-text f12 fc6" for="chkSaveInsureBeneficiary">保存为常用联系人</label>');
			result.push('</div>');
			result.push('<div><a class="hz-button hz-button-primary hz-button-block beneficiary-save" id="beneficiarySave" href="javascript:;">保&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;存</a></div>');

			result.push('</div>');
			result.push('</div>');
			_this.beneficiaryDialogHtml = result;
		},

	};
	return InsureRender;
});