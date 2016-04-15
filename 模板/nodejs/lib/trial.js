/*
 * @constructor RenderTrial
 * @author Kingwell Leng
 * @version 0.0.1
 * @description 渲染试算-前后端共用渲染代码
 */

var Base = function() {};
Base.prototype = {
	toInt: function(value) {
		if (value && isFinite(value) && !isNaN(value)) {
			return parseInt(value);
		} else {
			return this.replaceNull(value);
		}
	},
	getQueryValue: function(name) { //获取URL参数
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = location.search.substr(1).match(reg);
		if (r !== null) {
			return unescape(r[2]);
		}
		return null;
	},
	replaceNull: function(text) { //将null转换成空'';		
		return (text === undefined || text === 'undefined') ? '' : text;
	}
};

var RenderTrial = function(options) {
	var ops = options || {};
	this.renderData = {};
	for (var key in ops) {
		this[key] = ops[key];
	}
	this.setData();
};
RenderTrial.prototype = {
	TEXT_SELECT_MORE: '更多选择',
	listStyle: ' trial-list ',
	itemStyle: ' trial-item ',
	activeStyle: ' filter-active-tag ',
	getUnit: function(number) { //转换相应的单位，后台返回的单位是数字	 
		return {
			0: '',
			1: '份',
			2: '万元',
			3: '元',
			4: '0元',
			5: '00元',
			6: '000元',
			7: '岁',
			8: '年',
			9: '月',
			10: '天',
			11: '元/年'
		}[number];
	},
	setData: function() {
		var _this = this,
			data = _this.data || {};
		_this.restrictRules = data.restrictRules || {};
		_this.security = data.security || {};
	},
	getSalePromotionList: function(array) {}, //获取促销信息
	getFinalList: function(list) { //获取最终结果-计算自增的
		var _list = list || [],
			result = [];
		_list.forEach(function(item) {
			var max = item.max,
				min = item.min,
				step = item.step,
				type = item.type,
				unit = item.unit || 0;
			if (item.type === 2) { //自增类型
				for (var i = min; i <= max; i += step) {
					result.push({
						value: i,
						max: max,
						min: min,
						step: step,
						unit: unit,
						type: type
					});
				}
				if (!max % step === 0 && i !== max + step) {
					result.push({
						value: max,
						max: max,
						min: min,
						step: step,
						unit: unit,
						type: type
					});
				}
			} else {
				result.push({
					value: item.value,
					max: max,
					min: min,
					step: step,
					unit: unit,
					type: type
				});
			}
		});
		return result;
	},
	__renderMore: function(name, content, options) {
		var _this = this,
			result = [],
			ops = options || {},
			className = ops.className || '',
			attr = ops.attr || '',
			list = list || [];
		if (_this._dropDownIndex) {
			_this._dropDownIndex++;
		} else {
			_this._dropDownIndex = 1;
		}
		result.push('<div class="hz-dropdown mr10 ' + className + ' " ' + ops.attr + ' data-dropdown="dropdown-item-' + _this.productId + '-' + _this.productPlanId + '-' + _this._dropDownIndex + '">');
		result.push('<div class="input-select">');
		result.push('<input class="input-select-text more-tag no-select" type="text" value="' + name + '" readonly="readonly">');
		result.push('<b class="iconfont"></b>');
		result.push('</div>');
		result.push('<div class="hz-dropdown-content" data-dropdown-item="dropdown-item-' + _this.productId + '-' + _this.productPlanId + '-' + _this._dropDownIndex + '">');
		result.push(typeof content === 'string' ? content : content());
		result.push('</div>');
		result.push('</div>');
		return result.join('');
	},
	__renderList: function(options) { //渲染列表-SelectOr Ul-LI

		var _this = this,
			ops = options || {},
			result = [],
			list = ops.list || [],
			item = ops.formItem || {},
			isSelect = ops.isSelect,
			optionsSelectClass = ' hz-select-option-selected ',
			attr = ops.attr,

			controlType = ops.controlType;

		if (isSelect === true) {
			result.push('<select name="" id="">');
		} else {
			result.push('<ul class="hz-dropdown-menu">');
		}
		//trial-item 
		list.forEach(function(item) {
			var max = item.max,
				min = item.min,
				step = item.step,
				type = item.type,
				unit = item.unit || 0,
				_className = _this.itemStyle,
				addUnit = controlType !== 3,
				value;

			if (item.type === 20) { //自增类型
				for (var i = min; i <= max; i += step) {
					if (addUnit) {
						value = i + _this.getUnit(unit);
					} else {
						value = i;
					}
					if (ops.defaultValue === value) {
						_className += optionsSelectClass;
					}
					if (isSelect === true) {
						result.push('<option value="' + value + '">' + i + _this.getUnit(unit) + '</option>');
					} else {
						result.push('<li class="hz-select-option ' + _className + ' " ' + attr + ' data-default-value="' + value + '">' + i + _this.getUnit(unit) + '</li>');
					}
				}
				if (!max % step === 0 && i !== max + step) {
					if (addUnit) {
						value = max + _this.getUnit(unit);
					} else {
						value = max;
					}
					if (ops.defaultValue === value) {
						_className += optionsSelectClass;
					}
					if (isSelect === true) {
						result.push('<option value="' + value + '">' + max + _this.getUnit(unit) + '</option>');
					} else {
						result.push('<li class="hz-select-option ' + _className + ' " ' + attr + ' data-default-value="' + value + '">' + max + _this.getUnit(unit) + '</li>');
					}
				}
			} else {
				if (addUnit) {
					value = item.value + _this.getUnit(unit);
				} else {
					value = item.value;
				}
				if (ops.defaultValue === value) {
					_className += optionsSelectClass;
				}
				if (isSelect === true) {
					result.push('<option value="' + value + '">' + item.value + _this.getUnit(unit) + '</option>');
				} else {
					result.push('<li class="hz-select-option ' + _className + ' " ' + attr + ' data-default-value="' + value + '">' + item.value + _this.getUnit(unit) + '</li>');
				}
			}
		});
		if (isSelect === true) {
			result.push('</select>');
		} else {
			result.push('</ul>');
		}
		return result.join('');
	},
	__renderDefaultItem: function(options) { //渲染常用设置项
		var _this = this,
			ops = options || {},
			list = ops.list || [],
			result = [],
			item = ops.item || {},
			defaultValue = ops.defaultValue,
			className = ops.className,
			attr = ops.attr,
			value = '',
			controlType = item.controlType;

		list.forEach(function(item) {

			var active = '';

			if (+defaultValue === item.value || defaultValue === item.value + _this.getUnit(item.unit)) {
				active = _this.activeStyle;
			} else {
				active = '';
			}

			if (item.showType === 2) {
				result.push(_this.__renderMore(item.byname, function() {
					return _this.__renderList({
						list: _dictionaryList,
						attr: attr,
						defaultValue: defaultValue,
						controlType: ops.controlType
					});
				}), {
					attr: attr
				});
			} else {
				if (controlType === 0 || controlType === 2) {
					value = item.value + _this.getUnit(item.unit);
				} else {
					value = item.value;
				}
				result.push('<span class="' + className + active + '" ' + attr + ' data-default-value="' + value + '">' + (item.byname || item.value + _this.getUnit(item.unit)) + '</span>');
			}

		});
		return result.join('');
	},
	defaultItemMaxLength: 5, //默认显示几条-常用设置项
	renderForm: function(options) { //渲染表单类型formObject

		var _this = this,
			ops = options || {},
			formResult = [],
			formItem = ops.formObject,
			controlType = formItem.controlType, //控件类型
			key = formItem.key || '',
			protectItemId = formItem.protectItemId || '',
			id = key || protectItemId || '',
			defaultValue = formItem.defaultValue || '',
			dictionaryList = formItem.dictionaryList || [], //下拉列表选项
			showDefault = formItem.showDictionaryList || [], //常用设置
			isProtect = ops.isProtect,
			enabled = formItem.enabled ? '' : ' disabled ',
			attr = ' protect="' + (isProtect ? true : false) + '" _tabindex="0" data-key="' + key + '" data-key="' + key + '" ' + enabled + ' data-protectitemid="' + protectItemId + '" ', //公共属性
			className = ' filter-tag ' + _this.itemStyle + ' ';
		/*
			@description ControlType 控件类型
			0-表示下拉框;
			1-日历控件;
			2-同时出现下拉框和日历控件区间;
			3-文本框;
			4-地区;
			5-职业;
			6-文本;
		*/

		if (controlType === 0 || controlType === 2 || controlType === 3) {
			var _dictionaryList = _this.getFinalList(dictionaryList); //最终的结果
		}

		switch (controlType) {
			case 0: //表示下拉框
				var showList = [],
					slice = 0;

				if (!isProtect && showDefault.length) { //常用设置-非保障项
					showList.push(_this.__renderDefaultItem({
						list: showDefault,
						defaultValue: defaultValue,
						className: className,
						attr: attr
					}));
				}
				if (!dictionaryList.length) {
					formResult.push('<span class=" ' + className + _this.activeStyle + ' " ' + attr + ' data-default-value="' + defaultValue + '">' + defaultValue + '</span>');
					break;
				}
				if (_dictionaryList.length <= _this.defaultItemMaxLength && !isProtect) {

					_dictionaryList.forEach(function(item) {
						var max = item.max,
							min = item.min,
							step = item.step,
							type = item.type,
							value = item.value,
							unit = item.unit || 0,
							activeStyle = (defaultValue === value + _this.getUnit(unit) || _dictionaryList.length === 1) ? _this.activeStyle : ''; // 添加当前样式
						formResult.push('<span class=" ' + className + ' ' + activeStyle + '" ' + attr + ' data-default-value="' + value + _this.getUnit(unit) + '">' + value + _this.getUnit(unit) + '</span>');
					});

				} else {
					if (isProtect) {
						slice = 0;
					} else {
						slice = _this.defaultItemMaxLength;
						formResult.push(_this.__renderDefaultItem({
							list: _dictionaryList.slice(0, _this.defaultItemMaxLength),
							defaultValue: defaultValue,
							className: className,
							item: formItem,
							attr: attr,
							controlType: controlType
						}));
					}

					formResult.push(_this.__renderMore(_this.TEXT_SELECT_MORE, _this.__renderList({
						list: _dictionaryList.slice(slice),
						controlType: controlType,
						defaultValue: defaultValue,
						item: formItem,
						attr: attr
					}), {
						attr: attr
					}));
				}

				formResult.push(showList.join(''));
				break;
			case 1: //日历控件

				dictionaryList.forEach(function(item) {
					var max = item.max,
						min = item.min,
						step = item.step,
						unit = item.unit,
						type = item.type,
						value = item.value || '',
						prop = ' data-list=\'' + JSON.stringify(item) + '\' data-min="' + min + '" data-max="' + max + '" data-step="' + step + '" data-type="' + type + '" data-unit="' + unit + '" ';
					formResult.push('<input type="text" class="' + className + ' Wdate trial-calendar" ' + attr + ' ' + prop + ' value="' + defaultValue + '"/>');
				});
				break;
			case 2: //同时出现下拉框和日历控件区间

				formResult.push(_this.__renderDefaultItem({
					list: _dictionaryList.slice(0, _this.defaultItemMaxLength),
					defaultValue: defaultValue,
					className: className,
					item: formItem,
					attr: attr
				}));
				formResult.push(_this.__renderMore(_this.TEXT_SELECT_MORE, function() {
					var result = [];
					result.push('<div class="pl10 pr10 mb20 mt20">');
					result.push('<span class="mr10">保障天数</span>');
					//result.push(_this.__renderMore('asdf', '65'));
					result.push(_this.__renderList({
						list: _dictionaryList,
						isSelect: true,
						item: formItem,
						defaultValue: defaultValue,
						attr: attr
					}));
					result.push('</div>');
					result.push('<div class="others-content">');
					result.push('<div class="hz-check-item mb10">');
					result.push('<i class="hz-check-icon"></i>');
					result.push('<span class="check-text f12 no-select">通过<strong>出发</strong>和<strong>结束日期</strong>自动计算保障天数</span>');
					result.push('</div>');
					result.push('<div class="calendar-box-wrap fn-hide">');
					result.push('<div class="mt10"><span class="mr5">出生日期</span><input type="text" class="Wdate trial-insurant-date-limit" data-type="start"/></div>');
					result.push('<div class="mt10"><span class="mr5">出生日期</span><input type="text" class="Wdate trial-insurant-date-limit" data-type="end"/></div>');
					result.push('<div class="mt10">');
					result.push('总计天数： <span data-date=""></span>');
					result.push('</div>');
					result.push('<div class="mt10">');
					result.push('<span class="hz-alert hz-alert-error hidden" data-tips=""><i class="iconfont f18"></i><span></span></span>');
					result.push('</div>');
					result.push('<div class="mt20">');
					result.push('<a class="hz-button hz-button-small cancel-button mr5" href="javascript:;">取消</a>');
					result.push('<a class="hz-button hz-button-primary hz-button-small confirm-button" href="javascript:;">确定</a>');
					result.push('</div>');
					result.push('</div>');
					result.push('</div>');
					return result.join('');
				}, {
					attr: attr
				}));

				break;
			case 3: //文本框
				dictionaryList = dictionaryList[0];

				if (!dictionaryList) {
					if (defaultValue) {
						formResult.push('<span class=" ' + className + _this.activeStyle + ' " ' + attr + '>' + defaultValue + '</span>');
					}
					formResult.push('<input type="text" class="' + className + '" ' + attr + ' />');
					break;
				}
				(function(item) {
					var inputHtml = '',
						_className = '';
					if (key === 'buyCount') {
						_className = ' product-amount-input  ';
					} else {
						_className = className;
					}
					inputHtml = '<input type="text" class="only-number ' + _className + '" ' + attr + ' data-max="' + item.max + '" data-min="' + item.min + '" data-step="' + item.step + '" data-type="' + item.type + '" data-unit="' + item.unit + '" value="' + defaultValue + '"/>';

					if (isProtect) {

						formResult.push(
							_this.__renderMore(_this.TEXT_SELECT_MORE, function() {
								var result = [];
								result.push(_this.__renderList({
									list: _dictionaryList.slice(0, _this.defaultItemMaxLength),
									defaultValue: defaultValue,
									attr: attr
								}));
								result.push('<div class="others-content">');
								result.push('<p>');
								result.push(inputHtml);
								result.push('</p>');
								if (item.max) {
									result.push('<p class="f12 pt10 pb10 fc6">');
									result.push('保额最大' + item.max + _this.getUnit(item.unit) + '，需为' + item.step + '的倍数');
									result.push('</p>');
								}

								result.push('<div class="action">');
								result.push('<a class="hz-button hz-button-small mr5" href="javascript:;">取消</a>');
								result.push('<a class="hz-button hz-button-primary hz-button-small" href="javascript:;">确定</a>');
								result.push('</div>');
								result.push('</div>');
								return result.join('');

							})
						);
					} else {
						formResult.push(_this.__renderDefaultItem({
							list: _dictionaryList.slice(0, _this.defaultItemMaxLength),
							defaultValue: defaultValue,
							className: className,
							attr: attr
						}));
						if (key === 'buyCount') {
							formResult.push('<div class="product-amount-wrap" data-max="' + item.max + '" data-min="' + item.min + '" data-default="' + defaultValue + '">');
							formResult.push('<span class="product-amount-increase">-</span>');
						}
						formResult.push(inputHtml);
						if (key === 'buyCount') {
							formResult.push('<span class="product-amount-decrease">+</span>');
							formResult.push('</div>');
						}
					}
				})(dictionaryList);

				break;
			case 4: //地区

				var subRestrictGeneList = formItem.subRestrictGeneList || [],
					areaResult = [],
					provinceList = subRestrictGeneList[0], //省
					provinceDefault = '', //下拉默认显示文本
					cityList = subRestrictGeneList[1], //市
					cityDefault = '', //下拉默认显示文本
					areaList = formItem.dictionaryList || [], //区
					areaDefault = '', //下拉默认显示文本

					_className = '  mr10 ',
					subHide = formItem.subHide ? 'fn-hide' : ''; //是否隐藏地区-有些只有两级，如北京（省）-定海区（市）

				provinceList.dictionaryList.forEach(function(item, i) {
					if (item.value === provinceList.defaultValue) {
						provinceDefault = item.byname;
					}
				});
				cityList.dictionaryList.forEach(function(item, i) {
					if (item.value === cityList.defaultValue) {
						cityDefault = item.byname;
					}
				});
				areaList.forEach(function(item, i) {

					if (item.value === formItem.defaultValue) {
						areaDefault = item.byname;
					}
				});
				areaResult.push(_this.__renderMore(provinceDefault, function() {
					return _this.__renderAreaList({
						item: provinceList
					});
				}, {
					className: _className,
					attr: ' address="' + provinceList.key + '" data-default-value="' + provinceList.defaultValue + '" '
				}));
				areaResult.push(_this.__renderMore(cityDefault, function() {
					return _this.__renderAreaList({
						item: cityList
					});
				}, {
					className: _className,
					attr: ' address="' + cityList.key + '" data-default-value="' + cityList.defaultValue + '" '
				}));
				areaResult.push(_this.__renderMore(areaDefault, function() {
					return _this.__renderAreaList({
						item: areaList
					});
				}, {
					className: subHide,
					attr: ' address="' + formItem.key + '" data-default-value="' + formItem.defaultValue + '" '
				}));

				formResult.push(areaResult.join(''));
				break;
			case 5: //职业

				if (showDefault.length) {
					formResult.push(_this.__renderDefaultItem({
						list: showDefault,
						defaultValue: defaultValue,
						className: className,
						attr: attr
					}));
				} else {

					if (dictionaryList.length <= _this.defaultItemMaxLength) {

						dictionaryList.forEach(function(item) {
							var max = item.max,
								min = item.min,
								step = item.step,
								type = item.type,
								value = item.value,
								unit = item.unit || 0,
								activeStyle = (defaultValue === value + _this.getUnit(unit) || dictionaryList.length === 1) ? _this.activeStyle : ''; // 添加当前样式
							formResult.push('<span class=" ' + className + ' ' + activeStyle + '" ' + attr + ' data-default-value="' + value + _this.getUnit(unit) + '">' + value + _this.getUnit(unit) + '</span>');
						});

					} else {

						formResult.push(_this.__renderDefaultItem({
							list: dictionaryList.slice(0, _this.defaultItemMaxLength),
							defaultValue: defaultValue,
							className: className,
							attr: attr
						}));
						formResult.push(_this.__renderMore(_this.TEXT_SELECT_MORE, _this.__renderList({
							list: dictionaryList.slice(_this.defaultItemMaxLength),
							defaultValue: defaultValue,
							attr: attr
						}), {
							attr: attr
						}));
					}
				}

				formResult.push('<a href="' + (_this.serchJobUrl || '/search/job') + '" target="_blank" class="primary-link ml10">查询职业类别</a>');

				break;
			case 6: //文本
				dictionaryList.forEach(function(item) {
					var unit = item.unit || 0;
					defaultValue = item.defaultValue || item.value || '';
					//className = className.replace(/filter-tag/g, '');
					className += ' filter-tag-text filter-active-tag';
					//attr = attr.replace(/tabindex="0"/g, '');
					attr += ' data-default-value="' + defaultValue + '" ';
					formResult.push('<span class="' + className + '" ' + attr + '>' + item.value + _this.getUnit(unit) +
						'</span>');
				});

				break;
		}
		return formResult.join('');
	},
	__renderAreaList: function(options) { //渲染地区列表
		var _this = this,
			ops = options || {},
			item = ops.item,
			list = item.dictionaryList || item || [],
			result = [];
		result.push('<ul class="hz-dropdown-menu">');
		list.forEach(function(item) {
			result.push('<li class="hz-select-option trial-item " data-default-value="" data-value="' + item.value + '" data-byname="' + item.byname + '">' + item.byname + '</li>');
		});
		result.push('</ul>');
		return result.join('');
	},
	renderGenesRow: function(options) {
		var _this = this,
			ops = options || {},
			boxClass = ops.boxClass || '',
			titleClass = ops.titleClass || '',
			item = ops.item || {},
			contentClass = ops.contentClass || '',
			result = [];
		result.push('<dl class="ensure-opt-item clearfix ' + boxClass + '" id="list-' + ops.id + '">');
		result.push('<dt class="ensure-opt-title fl ' + titleClass + '"><strong>' + ops.name + '</strong></dt>');
		result.push('<dd class="ensure-opt-content ' + contentClass + ' ' + this.listStyle + '" data-default-value="' + (item.defaultValue || '') + '">' + (typeof ops.content === 'string' ? ops.content : ops.content()) + '</dd>');
		result.push('</dl>');
		return result.join('');
	},
	renderGenes: function(restrictRule) { //渲染结果-试算因子、保障项
		var _this = this,
			restrictRule = _this.renderData, // 试算信息;
			restrictGenes = restrictRule.restrictGenes || [],
			restrictGenesResult = [],
			protectTrialItemList = restrictRule.protectTrialItemList || [], //保障项
			preminum = restrictRule.preminum || '', //保费
			restrictGenesHtml = [],
			trialLayoutItemList = restrictRule.trialLayoutItemList || [], //排版信息
			layoutObject = {};

		_this.preminum = restrictRule.preminum || null;
		_this.trialPrice = restrictRule.trialPrice || {};

		if (trialLayoutItemList.length) { //有排版

			//_this.logGreen('有排版');
			trialLayoutItemList.forEach(function(item) {
				var geneOrderMap = item.geneOrderMap || {};
				layoutObject[item.title] = [];
				for (var key in geneOrderMap) {
					restrictGenes.forEach(function(genesItem) {
						if ((genesItem.protectItemId || genesItem.key) == geneOrderMap[key]) {
							layoutObject[item.title].push(genesItem);
						}
					});
				}

			});
			for (var key in layoutObject) {
				restrictGenesHtml.push('<div class="bor-bottom pb5 mb20">');
				layoutObject[key].forEach(function(item) {

					var hiddenStyle = item.display === false ? 'hidden' : ''; //是否隐藏
					restrictGenesHtml.push(_this.renderGenesRow({
						boxClass: hiddenStyle,
						name: item.name,
						id: item.l,
						item: item,
						content: _this.renderForm({
							formObject: item
						})
					}));
				});
				restrictGenesHtml.push('</div>');
			}
		} else { //没有排版
			//_this.logRed('没有排版');
			restrictGenes.forEach(function(item) {
				var hiddenStyle = item.display === false ? 'hidden' : ''; //是否隐藏
				restrictGenesHtml.push(_this.renderGenesRow({
					boxClass: hiddenStyle,
					name: item.name,
					item: item,
					id: item.protectItemId || item.key,
					content: _this.renderForm({
						formObject: item
					})
				}));
			});
		}

		if (restrictGenes.length) {
			restrictGenesHtml.push(_this.renderGenesRow({
				name: '保费',
				content: function() {
					var result = '<span id="preminum-' + _this.productPlanId + '">' + _this.setPrice() + '</span>';
					return result;
				}
			}));
			var salePromotionRresult = [];
			var planList = _this.security.planList || [1];
			var salePromotaionArr = ['赠品', '红包', '金豆', '满减', '预约'];
			planList.forEach(function(item) {
				//console.log(item);
				var salePromotionList = item.salePromotionList || [];
				if (item.planId === _this.productPlanId) {
					salePromotionList.forEach(function(item) {
						salePromotionRresult.push('<div><span class="hz-badge hz-badge-primary hz-radius">' + salePromotaionArr[item.typeCode] + '</span><span class="fc9"> ' + item.activityName + '</span></div>');
					});
				}
			});
			if (_this.trialPrice.goldenBean) {
				salePromotionRresult.push('<div><span class="hz-badge hz-badge-primary hz-radius">赠品</span><span class="fc9"> ' + _this.trialPrice.goldenBean + '金豆</span></div>');
			}
			_this.getSalePromotionList.call(_this, salePromotionRresult);
			if (salePromotionRresult.length) {
				restrictGenesHtml.push(_this.renderGenesRow({
					name: '促销信息',
					content: function() {
						return salePromotionRresult.join('');
					}
				}));
			}

		}
		return restrictGenesHtml.join('');
	},
	notInsureText: '--', //不投保显示
	setPrice: function() {
		var _this = this;
		var result = '';
		if (_this.trialPrice.isInsure) {
			result = '<span class="product-price" >￥<i class="preminum-result">' + (_this.trialPrice.vipPrice / 100).toFixed(2) + '</i></span><del class="ml10">' + (_this.trialPrice.originalPrice / 100).toFixed(2) + '</del>';
		} else {
			result = '<span class="product-price" ><i class="preminum-result">' + _this.notInsureText + '</i></span>';
			//result = _this.notInsureText;
		}
		try {
			$('#preminum-' + _this.productPlanId).html(result);
		} catch (ev) {}
		return result;
	},
	getRelateCoverageItem: function(id) {
		var _this = this,
			resutl = null;
		_this.renderData.restrictGenes.forEach(function(item) {
			if (item.protectItemId === id || item.key === id) {
				resutl = item;
			}
		});
		return resutl;
	},
	renderProtectRow: function(protectTrialItemList) {
		var _this = this,
			result = [],
			list = protectTrialItemList || [];
		result.push('<div class="detail-ensure-protect f14">');
		result.push('<h3 class="f14 pb20 pt20 fb fc6">保障权益</h3>');
		result.push('<ul class="ensure-protect-list">');
		result.push('<li class="ensure-protect-item ensure-protect-head">');
		result.push('<h4 class="protect-item-title">医疗保障</h4>');
		result.push('</li>');

		list.forEach(function(item) {
			var description = item.description || '';
			var getRelateCoverageItem;
			result.push('<li class="ensure-protect-item ' + _this.listStyle + '">');
			result.push('<div class="row01"><div class="protect-item-icon"><i class="iconfont icon-item f24"></i></div></div>');
			result.push('<div class="row02"><div class="protect-item-name">' + item.name + '</div></div>');
			result.push('<div class="row03">');
			if (item.relateCoverageId) {
				getRelateCoverageItem = _this.getRelateCoverageItem(item.relateCoverageId);
				if (getRelateCoverageItem) {
					result.push(_this.renderForm({
						item: item,
						formObject: getRelateCoverageItem,
						isProtect: true
					}));
				}
			} else {
				result.push((item.fullPremium ? item.fullPremium : item.premium) || '');
			}
			result.push('</div>');
			result.push('<div class="row04"><div class="protect-item-des f12 fc6"><a class="toggle-btn toggle-open iconfont f14 fr" href="javascript:;"></a>' + description + '</div></div>');
			result.push('</li>');
		});
		result.push('');
		result.push('</ul>');
		result.push('</div>');
		return result.join('');
	},
	renderProtect: function(restrictRule) {
		var _this = this;
		protectTrialItemList = _this.renderData.protectTrialItemList;
		return _this.renderProtectRow(protectTrialItemList);
	}
};

for (var key in Base.prototype) {
	RenderTrial.prototype[key] = Base.prototype[key];
}


module.exports = RenderTrial;