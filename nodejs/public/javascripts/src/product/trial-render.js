define(function() {
	'use strict';

	/**
	 ** @constructor RenderTrial
	 ** @author Kingwell Leng
	 ** @version 0.0.1
	 ** @description 渲染试算-前后端共用渲染代码
	 **/

	//通用方法
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
		inArray: function(item, arr) {
			var index = -1,
				arrs = arr || [];
			for (var i = 0, len = arr.length; i < len; i++) {
				if (arr[i] === item) {
					index = i;
				}
			}
			return index;
		},
		replaceNull: function(text) { //将null转换成空'';		
			return (text === undefined || text === 'undefined') ? '' : text;
		}
	};


	//渲染HTML
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

		//转换相应的单位，后台返回的单位是数字
		getUnit: function(number) {
			return {
				0: '',
				1: '份',
				2: '万元',
				3: '元',
				4: '0元',
				5: '00元', //(作废)
				6: '000元', //(作废)
				7: '岁',
				8: '年',
				9: '月',
				10: '天',
				11: '元/年',
				12: '个',
				13: '周岁',
				14: '岁' //(实现是:岁（起保日）)
			}[number] || '';
		},
		setData: function() {
			var _this = this,
				data = _this.data || {};
			_this.restrictRules = data.restrictRules || {};
			_this.security = data.security || {};
		},

		//获取促销信息
		getSalePromotionList: function(array) {},

		//获取最终结果-计算自增的
		getFinalList: function(list, maxLength) {
			var _this = this,
				_list = list || [],
				result = [],
				len = 0;
			for (var ii = 0; ii < _list.length; ii++) {
				var item = _list[ii];
				var max = item.max,
					min = item.min,
					step = item.step,
					type = item.type,
					unit = item.unit || 0;

				//自增类型
				if (item.type === 2) {
					for (var i = min; i <= max; i += step) {
						len++;
						if (maxLength) {
							if (len > maxLength) {

								break;
							}
						}
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
						len++;
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
					len++;
					result.push({
						value: item.value,
						max: max,
						min: min,
						step: step,
						unit: unit,
						type: type
					});
				}
			}

			return result;
		},

		//渲染下拉选择
		renderSelect: function(options) {
			var _this = this,
				ops = options || {},
				result = [],

				className = ops.className || '',
				defaultValue = ops.defaultValue || '',
				isTime = ops.type === 'time' ? true : false,
				item = ops.item || '',
				formItem = ops.formItem || {},
				list = ops.list || [],
				content = ops.content || '',
				attr = ops.attr || '',
				width = ops.width || '',
				listWidth = ops.listWidth || '',
				listHeight = ops.listHeight || '',
				customizeHTML = ops.customizeHTML || '',
				showList = ops.showList === false ? false : true,
				name = ops.name || _this.TEXT_SELECT_MORE, //默认名称
				edit = ops.edit || 'ok',
				unit = '',
				controlType = '',
				_selected = ops.selected,
				activeStyle = '',
				dictionaryList = formItem.dictionaryList || [{
					unit: ''
				}];

			//列表项
			var listResult = [];
			var selectOptions = [];
			listResult.push('<ul class="hz-dropdown-menu">');
			if (!list.length && defaultValue) {
				name = defaultValue + _this.getUnit(dictionaryList[0].unit);
				activeStyle = ' filter-active-tag ';
			}
			list.forEach(function(item, i) {
				var selected = '',
					text = item.value + _this.getUnit(item.unit),
					byname = item.byname,
					resultName = byname || text,
					value = text,

					controlType = formItem.controlType || '';

				if (formItem.controlType === 3) { //输入不用带单位
					value = item.value;
					unit = item.unit;
				}


				if (_this.toInt(defaultValue) === _this.toInt(value)) {
					if (!byname && _selected !== false) {
						className += ' ' + _this.activeStyle + ' ';
					}
					selected = ' hz-select-option-selected ';
					name = resultName;
				}


				listResult.push('<li class="hz-select-option trial-item ' + selected + '" data-list=\'' + JSON.stringify(item) + '\' ' + attr + ' data-unit="' + _this.getUnit(item.unit) + '" data-value="' + value + '">' + resultName + '</li>');
				selectOptions.push('<option value="' + resultName + '">' + resultName + '</option>');
			});
			listResult.push('</ul>');



			//用户自定义输入
			var customizeResult = [];
			customizeResult.push('<div class="others-content">');
			customizeResult.push(typeof customizeHTML === 'string' ? customizeHTML : customizeHTML());
			customizeResult.push('<div class="mt10 f12 hidden error-text"><div class="hz-alert hz-alert-error"><span></span></div></div>');
			customizeResult.push('<div class="mt15"><a class="hz-button hz-button-small button-cancel f14" href="javascript:;" edit="cancel">取消</a><a class="hz-button hz-button-primary hz-button-small button-ok f14" href="javascript:;" data-unit="' + (_this.getUnit(dictionaryList[0].unit) || '') + '" edit="' + edit + '">确定</a></div>');
			customizeResult.push('</div>');
			//customizeResult.push();

			if (_this._dropDownIndex) {
				_this._dropDownIndex++;
			} else {
				_this._dropDownIndex = 1;
			}
			_this._dropDownIndex += new Date().getTime();
			className += activeStyle
			result.push('<div data-unit="' + (_this.getUnit(unit) || '') + '" newselect class="hz-dropdown mr10 ' + className + ' " ' + attr + ' data-dropdown="dropdown-item-' + _this._dropDownIndex + _this.productId + '-' + _this.productPlanId + '-' + _this._dropDownIndex + '" data-default-value="' + defaultValue + '" style="width:' + width + '">');
			result.push('<div class="input-select">');
			result.push('<span class="input-select-text more-tag no-select">' + name + '</span>');
			result.push('<b class="iconfont">&#xe70b;</b>');
			result.push('</div>');
			result.push('<div class="hz-dropdown-content" data-dropdown-item="dropdown-item-' + _this._dropDownIndex + _this.productId + '-' + _this.productPlanId + '-' + _this._dropDownIndex + '" abc="' + listWidth + '" style="width:' + listWidth + '; height:' + listHeight + '">');
			result.push(typeof content === 'string' ? content : content());

			//如果有下拉列表
			if (list.length && showList) {
				result.push(listResult.join(''));
			}
			// if (isTime) {
			// 	result.push('<select name="" id="">');
			// 	result.push(selectOptions.join(''));
			// 	result.push('</select>');
			// }
			//如果有自定义
			if (customizeHTML) {
				result.push(customizeResult.join(''));
			}

			result.push('</div>');
			result.push('</div>');

			return result.join('');
		},

		//渲染更多
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
			result.push('<div class="hz-dropdown mr10 ' + className + ' " ' + ops.attr + ' data-dropdown="dropdown-item-' + _this._dropDownIndex + _this.productId + '-' + _this.productPlanId + '-' + _this._dropDownIndex + '">');
			result.push('<div class="input-select">');
			//result.push('<input class="input-select-text more-tag no-select" type="text" value="' + name + '" readonly="readonly">');
			result.push('<span class="input-select-text more-tag no-select">' + name + '</span>');
			result.push('<b class="iconfont">&#xe70b;</b>');
			result.push('</div>');
			result.push('<div class="hz-dropdown-content" data-dropdown-item="dropdown-item-' + _this._dropDownIndex + _this.productId + '-' + _this.productPlanId + '-' + _this._dropDownIndex + '">');
			result.push(typeof content === 'string' ? content : content());
			result.push('</div>');
			result.push('</div>');
			return result.join('');
		},

		//渲染下拉列表
		__renderList: function(options) { //渲染列表-SelectOr Ul-LI

			var _this = this,
				ops = options || {},
				result = [],
				list = ops.list || [],
				item = ops.formItem || {},
				isSelect = ops.isSelect,
				optionsSelectClass = ' hz-select-option-selected ',
				attr = ops.attr,
				selectClassName = ops.selectClassName || '',

				controlType = ops.controlType || item.controlType;

			if (isSelect === true) {
				result.push('<select name="" id="" class="' + selectClassName + '">');
			} else {
				result.push('<ul class="hz-dropdown-menu">');
			}

			list.forEach(function(item) {
				var max = item.max,
					min = item.min,
					step = item.step,
					type = item.type,
					unit = item.unit || 0,
					_className = _this.itemStyle,
					addUnit = controlType !== 3,
					value;

				//自增类型
				if (item.type === 20) {
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
						if (_this.toInt(ops.defaultValue) === _this.toInt(value)) {
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
					if (_this.toInt(ops.defaultValue) === _this.toInt(value)) {
						_className += optionsSelectClass;
					}
					if (isSelect === true) {
						result.push('<option value="' + value + '">' + item.value + _this.getUnit(unit) + '</option>');
					} else {
						result.push('<li class="hz-select-option ' + _className + ' " ' + attr + ' data-default-value="' + value + '" data-unit="' + _this.getUnit(unit) + '">' + item.value + _this.getUnit(unit) + '</li>');
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

		//暂时常用设置项
		__saveDefaultItem: [],

		//渲染常用设置项
		__renderDefaultItem: function(options) {
			var _this = this,
				ops = options || {},
				list = ops.list || [],
				result = [],
				item = ops.item || {},
				defaultValue = ops.defaultValue,
				className = ops.className,
				attr = ops.attr,
				value = '',
				_dictionaryList = [],
				controlType = item.controlType;

			list.forEach(function(item) {

				var active = '';
				if (!item) {
					return;
				}
				if ((+defaultValue === item.value || defaultValue === item.value + _this.getUnit(item.unit)) && defaultValue) {
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
					}, {
						attr: attr
					}));
				} else {
					if (controlType === 0 || controlType === 2) {
						if (item.value.toString().indexOf(_this.getUnit(item.unit)) === -1) {
							value = item.value + _this.getUnit(item.unit);
						} else {
							value = item.value;
						}

					} else {
						value = item.value;
					}

					_this.__saveDefaultItem.push(value);

					result.push('<span class="' + className + active + '" ' + attr + ' data-default-value="' + value + '" data-unit="' + _this.getUnit(item.unit) + '" >' + (item.byname || item.value + _this.getUnit(item.unit)) + '</span>');
				}

			});
			return result.join('');
		},

		//是否已经有选中默认值-输入类型
		hasDefaultValue: function(list, defaultValue) {
			var _this = this,
				status = false,
				_list = list || [],
				num = 1;
			if (!defaultValue) {
				return status;
			}

			for (var j = 0, len = _list.length; j < len; j++) {
				var item = _list[j] || {},
					max = item.max,
					min = item.min,
					step = item.step,
					type = item.type;
				for (var i = min; i <= max; i += step) {

					if (i === _this.toInt(defaultValue)) {
						status = true;
					}
					num++;
					if (num > 5) {
						num = 1;
						break;
					}

				}

			}


			return status;
		},
		//地区选择宽度
		areaOptionWidth: '150px',

		//默认显示几条-常用设置项
		defaultItemMaxLength: 5,

		//渲染表单类型formObject
		renderForm: function(options) {

			var _this = this,

				ops = options || {},

				//最终HTML
				formResult = [],

				formItem = ops.formObject,

				//控件类型
				controlType = formItem.controlType,

				key = formItem.key || '',
				protectItemId = formItem.protectItemId || '',
				id = key || protectItemId || '',

				//默认值
				defaultValue = formItem.defaultValue || '',

				//下拉列表选项
				dictionaryList = formItem.dictionaryList || [],
				_dictionaryList = [],

				//常用设置
				showDefault = formItem.showDictionaryList || [],
				showDefaultLength = showDefault.length,

				//是否保障
				isProtect = ops.isProtect,


				//名词解释，职业模板信息
				additInfo = ops.additInfo || {},

				//显示单位
				showUnit = formItem.showUnit || '',
				//显示提示文字
				notice = formItem.notice || '',
				//是否显示提示
				showNotice = ops.showNotice || true,

				//是否是禁用
				enabled = formItem.enabled === false ? ' disabled ' : '  ',

				//公共属性
				attr = ' controlType="' + controlType + '"   protect="' + (isProtect ? true : false) + '" _tabindex="0" data-key="' + key + '" data-key="' + key + '" ' + enabled + ' data-protectitemid="' + protectItemId + '" ',

				//样式名
				className = ' filter-tag ' + _this.itemStyle + ' ' + enabled + ' ';

			_this.__saveDefaultItem = [];

			/**
			 **	@description ControlType 控件类型
			 **	0-表示下拉框;
			 **	1-日历控件;
			 **	2-同时出现下拉框和日历控件区间;
			 **	3-文本框;
			 **	4-地区;
			 **	5-职业;
			 **	6-文本;
			 */

			//这里是自增类型，输出最终的结果
			if (controlType === 0 || controlType === 2) {
				_dictionaryList = _this.getFinalList(dictionaryList);
			} else if (controlType === 3) {
				_dictionaryList = _this.getFinalList(dictionaryList, 5);
			}

			//有默认设置就显示默认设置，否则显示前5个
			if (showDefault.length) {
				showDefault.length = 5;
			} else {
				showDefault = _dictionaryList.slice(0, 5);
			}

			//显示默认选项
			if (!isProtect && (controlType === 0 || controlType === 2 || controlType === 3 || controlType === 5)) {
				formResult.push(_this.__renderDefaultItem({
					list: showDefault,
					defaultValue: defaultValue,
					className: className,
					item: formItem,
					attr: attr,
					controlType: controlType
				}));
				//formResult.push('显示默' + controlType + '认选项');
			}

			switch (controlType) {

				case 0: //表示下拉框					 

					var isShowDefault = false; //是否显示常用设置项
					var slice = 0;
					if (!isProtect && !showDefaultLength) {
						slice = _this.defaultItemMaxLength;
					}

					//是否显示默认值
					if (isProtect || -1 === _this.inArray(defaultValue, _this.__saveDefaultItem)) {
						isShowDefault = true;

					}


					if (!dictionaryList.length) { //只有默认值
						formResult.push('<span class=" ' + className + _this.activeStyle + ' " ' + attr + ' data-default-value="' + defaultValue + '">' + defaultValue + '</span>');
						break;
					}

					//如果有常用设置或常用设置为空且下拉数据大于5，则显示更多
					if (
						(
							showDefaultLength ||
							(!showDefaultLength && _dictionaryList.length > 5)
						) ||
						isProtect
					) {
						formResult.push(_this.renderSelect({
							item: formItem,
							list: _dictionaryList.slice(slice),
							//defaultValue: isProtect ? defaultValue : '',
							defaultValue: isShowDefault ? defaultValue : '',
							listWidth: '150px',
							isProtect: isProtect,
							attr: attr
						}));
					}
					break;

				case 1: //日历控件

					className = className.replace(/filter-tag/, '');
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

					var defaultItem = _dictionaryList.slice(0, _this.defaultItemMaxLength);

					formResult.push(_this.renderSelect({
						item: formItem,
						list: _dictionaryList,
						defaultValue: isProtect ? defaultValue : '',
						selected: !defaultItem.length,
						type: 'time',
						attr: attr,
						showList: false,
						edit: 'time',
						listWidth: '260px',
						customizeHTML: function() {
							var result = [];

							result.push('<div class="hz-check-item mb10">');
							result.push('<i class="hz-check-icon"></i>');
							result.push('<span class="check-text f12 no-select">通过<strong>出发</strong>和<strong>结束日期</strong>自动计算保障天数</span>');
							result.push('</div>');
							result.push('<div class="calendar-box-wrap fn-hide">');

							result.push('<div class="mt20"><span class="mr5">出发日期：</span><input type="text" class="Wdate trial-insurant-date-limit" data-type="start"/></div>');

							result.push('<div><span class="mr5">结束日期：</span><input type="text" class="Wdate trial-insurant-date-limit" data-type="end"/></div>');

							result.push('<div>');
							result.push('总计天数： <span data-date=""></span>');
							result.push('</div>');

							result.push('<div class="mt10 f12">');
							result.push('<span class="hz-alert hz-alert-error hidden" data-tips=""><span></span></span>');
							result.push('</div>');

							result.push('</div>');
							return result.join('');
						},
						content: function() {
							var result = [];
							result.push('<div class="pl10 pr10 mb20 mt20">');
							result.push('<span class="mr10">保障天数</span>');
							_dictionaryList.unshift({
								value: _this.TEXT_SELECT_MORE
							});
							result.push(_this.__renderList({
								list: _dictionaryList,
								isSelect: true,
								item: formItem,
								defaultValue: defaultValue,
								attr: attr,
								selectClassName: 'insurant-date-limit-select'
							}));
							result.push('</div>');
							return result.join('');
						}
					}));

					break;

				case 3: //文本框
					var showDefaultValue = false;
					dictionaryList = dictionaryList[0];

					(function(item) {
						var inputHtml = '', //表单
							_className = '', //样式名
							selectContent = '', //保障项下拉HTML
							selectHtml = _this.__renderDefaultItem({
								list: showDefault,
								defaultValue: defaultValue,
								className: className,
								attr: attr
							});
						var _result = [];
						if (!item) {
							formResult.push(_this.renderSelect({
								item: item,
								formItem: formItem,
								content: selectContent,
								//list: _dictionaryList.slice(_this.defaultItemMaxLength),
								defaultValue: defaultValue,
								className: ' ' + enabled + ' ',
								listWidth: '260px',
								//width:'200px',
								customizeHTML: function() {
									return _result.join('');
								},
								attr: attr
							}));
							return;
						}

						if (isProtect) { //保障项需要添加常用设置下拉
							selectContent = _this.__renderList({
								list: showDefault,
								defaultValue: defaultValue,
								formItem: formItem,
								attr: attr
							});
						} else {
							//formResult.push(selectHtml);
						}
						//如果是可输入份数
						if (key === 'buyCount') {
							_className = ' product-amount-input  ';
						}
						inputHtml = '<input type="text" style="width:160px;" class="only-number other-input-text lh15 input-enter ' + _className + '" ' + attr + ' data-max="' + item.max + '" data-min="' + item.min + '" data-step="' + item.step + '" data-type="' + item.type + '" data-unit="' + item.unit + '" value=""/>';

						//输入份数
						if (key === 'buyCount') {
							_result.push('<div class="product-amount-wrap" data-max="' + item.max + '" data-min="' + item.min + '" data-default="' + defaultValue + '">');
							_result.push('<span class="product-amount-increase">-</span>');
						}

						_result.push(inputHtml);

						if (key === 'buyCount') {
							_result.push('<span class="product-amount-decrease">+</span>');
							_result.push('</div>');
						}
						_result.push('<span class="ml10">' + showUnit + '</span>');

						//提示输入的范围
						if (item.max) {
							_result.push('<p class="f12 pt10 fc6">');
							_result.push('最大' + item.max + _this.getUnit(item.unit) + '，需为' + item.step + '的倍数');
							_result.push('</p>');
						}

						if (!isProtect) {
							showDefaultValue = !_this.hasDefaultValue(showDefault, defaultValue);
						}
						formResult.push(_this.renderSelect({
							item: item,
							formItem: formItem,
							content: selectContent,
							//list: _dictionaryList.slice(_this.defaultItemMaxLength),
							defaultValue: !showDefaultValue ? '' : defaultValue,
							className: ' ' + enabled + ' ',
							listWidth: '260px',
							//width:'200px',
							customizeHTML: function() {
								return _result.join('');
							},
							attr: attr
						}));

					})(dictionaryList);

					break;

				case 4: //地区

					var subRestrictGeneList = formItem.subRestrictGeneList || [],
						areaResult = [],

						//省
						provinceList = subRestrictGeneList[0],
						//下拉默认显示文本
						provinceDefault = '',

						//市
						cityList = subRestrictGeneList[1],
						//下拉默认显示文本
						cityDefault = '',

						//区
						areaList = formItem.dictionaryList || [],

						//下拉默认显示文本
						areaDefault = '',

						returnAttr = function(key) {
							return ' address="' + key + '" data-protectitemid="" data-key="' + key + '" ';
						},

						_className = '  mr10 ',

						//是否隐藏地区-有些只有两级，如北京（省）-定海区（市）
						subHide = formItem.subHide ? 'fn-hide' : '';

					try {

						provinceList.dictionaryList.forEach(function(item, i) {
							if (item.value === provinceList.defaultValue) {
								provinceDefault = item.byname;
							}
						});

						areaResult.push(_this.renderSelect({
							list: provinceList.dictionaryList,
							//className: className,
							defaultValue: provinceList.defaultValue,
							listWidth: this.areaOptionWidth,
							attr: returnAttr(provinceList.key)
						}));

					} catch (ev) {}

					try {

						cityList.dictionaryList.forEach(function(item) {
							if (item.value === cityList.defaultValue) {
								cityDefault = item.byname;
							}
						});
						areaResult.push(_this.renderSelect({
							list: cityList.dictionaryList,
							//className: className,
							listWidth: this.areaOptionWidth,
							defaultValue: cityList.defaultValue,
							attr: returnAttr(cityList.key)
						}));

					} catch (ev) {}

					try {

						areaList.forEach(function(item) {

							if (item.value === formItem.defaultValue) {
								areaDefault = item.byname;
							}
						});
						areaResult.push(_this.renderSelect({
							list: areaList,
							className: subHide,
							listWidth: this.areaOptionWidth,
							defaultValue: defaultValue,
							attr: returnAttr(formItem.key)
						}));

					} catch (ev) {}

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
							//TODO
							formResult.push(_this.__renderDefaultItem({
								list: dictionaryList.slice(0, _this.defaultItemMaxLength),
								defaultValue: defaultValue,
								className: className,
								attr: attr
							}));
							// formResult.push(_this.__renderMore(_this.TEXT_SELECT_MORE, _this.__renderList({
							// 	list: dictionaryList.slice(_this.defaultItemMaxLength),
							// 	defaultValue: defaultValue,
							// 	attr: attr
							// }), {
							// 	attr: attr
							// }));
							formResult.push(_this.renderSelect({
								list: dictionaryList.slice(_this.defaultItemMaxLength),
								defaultValue: defaultValue,
								attr: attr
							}));

						}
					}

					break;

				case 6: //文本

					dictionaryList.forEach(function(item) {
						var unit = item.unit || 0;
						defaultValue = item.defaultValue || item.value + _this.getUnit(unit) || '';
						//className = className.replace(/filter-tag/g, '');
						className += ' filter-tag-text filter-active-tag';
						//attr = attr.replace(/tabindex="0"/g, '');
						attr += ' data-default-value="' + defaultValue + '" ';
						formResult.push('<span class="' + className + '" data-list=\'' + JSON.stringify(item) + '\'' + attr + '>' + item.value + _this.getUnit(unit) +
							'</span>');
					});

					break;

			}

			/**
			 **	//显示链接//formResult.push(formItem.controlType);
			 **	配置承保职业、 职业等级因子， 并且配置有模板， 显示在这两个因子后面
			 **	只配置了承保职业、 职业等级， 但没有配置职业模板， 不显示
			 **/
			if (additInfo.jobTemplateId && (key === 'jobLevel' || key === 'insurantJob')) {

				formResult.push('<a href="/product/dialog/job-' + _this.productId + '-0.html" target="_blank" class="primary-link ml10">查询职业类别</a>');
			}

			//显示单位
			if (!isProtect) {
				formResult.push('<span class="show-unit">' + showUnit + '</span>');
			}

			//是否显示提示
			if (showNotice && notice) {
				formResult.push('<span class="warn-msg f12">' + notice + '</span>');
			}

			return formResult.join('');

		},

		//渲染地区列表
		__renderAreaList: function(options) {

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

		//渲染试算因子行
		renderGenesRow: function(options) {

			var _this = this,
				ops = options || {},
				boxClass = ops.boxClass || '',
				titleClass = ops.titleClass || '',
				item = ops.item || {},
				contentClass = ops.contentClass || '',
				result = [],
				id = item.key || item.protectItemId || '',
				listIdName = 'list-item-' + _this.productPlanId + '-' + id;

			result.push('<dl class="ensure-opt-item clearfix ' + boxClass + '" id="' + listIdName + '" >');
			result.push('<dt class="ensure-opt-title fl ' + titleClass + '"><strong>' + ops.name + '</strong></dt>');
			result.push('<dd class="ensure-opt-content ' + contentClass + ' ' + this.listStyle + '"  data-protectitemid="' + (item.protectItemId || '') + '" data-key="' + (item.key || '') + '" data-default-value="' + (item.defaultValue || '') + '">' + (typeof ops.content === 'string' ? ops.content : ops.content()) + '</dd>');
			result.push('</dl>');
			return result.join('');

		},

		//渲染结果-试算因子、保障项
		renderGenes: function() {
			var _this = this,
				restrictRule = _this.renderData || {}, // 试算信息;
				restrictGenes = restrictRule.restrictGenes || [],
				restrictGenesResult = [],
				protectTrialItemList = restrictRule.protectTrialItemList || [], //保障项
				preminum = restrictRule.preminum || '', //保费
				restrictGenesHtml = [],
				trialLayoutItemList = restrictRule.trialLayoutItemList || [], //排版信息
				layoutObject = {},
				layoutLength = 0,
				lineStyle = ' bor-bottom mb20 ';

			_this.preminum = restrictRule.preminum || _this.notInsureText;
			_this.trialPrice = restrictRule.trialPrice || {};


			//有排版
			if (trialLayoutItemList.length) {

				//_this.logGreen('有排版');
				trialLayoutItemList.forEach(function(item) {

					var geneOrderMap = item.geneOrderMap || {};
					layoutObject[item.title] = [];
					layoutLength++;
					for (var key in geneOrderMap) {

						restrictGenes.forEach(function(genesItem) {
							if ((genesItem.protectItemId || genesItem.key) === _this.toInt(geneOrderMap[key])) {
								layoutObject[item.title].push(genesItem);
							}
						});

					}

				});
				var lineLength = 0;
				for (var key in layoutObject) {
					lineLength++;
					if (lineLength === layoutLength) {
						lineStyle = '';
					}
					if (!layoutObject[key].length) {
						lineStyle = '';
					}
					restrictGenesHtml.push('<div class="' + lineStyle + ' pb5 ">');

					layoutObject[key].forEach(function(item) {

						var hiddenStyle = item.display === false ? 'hidden' : ''; //是否隐藏
						restrictGenesHtml.push(_this.renderGenesRow({
							boxClass: hiddenStyle,
							name: item.name,
							id: item.l,
							item: item,
							content: _this.renderForm({
								additInfo: restrictRule.additInfo,
								formObject: item
							})
						}));
					});
					restrictGenesHtml.push('</div>');
				}
			} else {
				//没有排版

				//_this.logRed('没有排版');
				restrictGenes.forEach(function(item) {
					var hiddenStyle = item.display === false ? 'hidden' : ''; //是否隐藏
					restrictGenesHtml.push(_this.renderGenesRow({
						boxClass: hiddenStyle,
						name: item.name,
						item: item,
						id: item.protectItemId || item.key,
						content: _this.renderForm({
							additInfo: restrictRule.additInfo,
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
					var salePromotionList = item.salePromotionList || [];
					if (item.planId === _this.productPlanId) {
						salePromotionList.forEach(function(item) {
							salePromotionRresult.push('<div><span class="hz-badge hz-badge-primary hz-radius mr10">' + salePromotaionArr[item.typeCode] + '</span><span class="fc9"> ' + item.activityName + '</span></div>');
						});
					}
				});
				if (_this.trialPrice.goldenBean) {
					salePromotionRresult.push('<div><span class="hz-badge hz-badge-primary hz-radius mr10">赠品</span><span style="color:#ff5400 "> <span class="golden-span">' + _this.trialPrice.goldenBean + '</span>金豆</span></div>');
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

		//特殊处理，禁用地区选择
		editArea: function(disabled) {

			try {
				var $area = $('[address]');
				if (true === disabled) {
					$area.addClass('disabled');
				} else {
					$area.removeClass('disabled');
				}
			} catch (ev) {

			}

		},

		//不投保显示
		notInsureText: '--',

		//设置价格
		setPrice: function() {

			var _this = this,
				result = '',
				oldPrice = '',
				trialPrice = _this.trialPrice || {},
				vipPrice = '';
			_this.isInsure = trialPrice.isInsure;
			
			if (undefined !== trialPrice.vipPrice) {
				if (trialPrice.vipPrice !== trialPrice.originalPrice) {
					oldPrice = '<del class="fc9 f14 ml10">¥' + (trialPrice.originalPrice / 100).toFixed(2) + '</del>';
				}
				vipPrice = trialPrice.vipPrice / 100;
				result = '<span class="product-price" >¥<i class="preminum-result">' + vipPrice.toFixed(2) + '</i></span>' + oldPrice;
				_this.editArea();
			} else {
				result = '<div class="product-price" ><i class="preminum-result">' + _this.notInsureText + '</i></div>';
				_this.editArea(true);
				//result = _this.notInsureText;
			}
			try {

				$('#preminum-' + _this.productPlanId).html(result);

			} catch (ev) {}

			return result;

		},

		//获取关联保障数据
		getRelateCoverageItem: function(id) {

			var _this = this,
				result = null;

			_this.renderData.restrictGenes.forEach(function(item) {
				if (item.protectItemId === _this.toInt(id) || item.key === id) {
					result = item;
				}
			});
			return result;

		},

		//根据索引组装需要的保障项
		buildProtect: function() {

			var _this = this,
				result = [],
				renderData = _this.renderData || {},
				protectTrialItemGroup = renderData.protectTrialItemGroup || {},
				protectTrialItemList = renderData.protectTrialItemList || [];

			_this.additInfo = renderData.additInfo || {};

			for (var key in protectTrialItemGroup) {
				var list = protectTrialItemGroup[key];
				var obj = {
					name: key,
					list: []
				};
				list.forEach(function(item) {
					obj.list.push(protectTrialItemList[item]);
				});
				result.push(obj);
			}
			//_this.renderProtectRow(result);
			_this.protectList = result || [];

		},

		//名称解释
		getExplainList: function(explainList, content) {

			var result = content || '';
			var list = explainList || [];
			//var itemName = item.name || '';
			list.forEach(function(item) {

				var explainName = item.explainName || '',
					explainByname = item.explainByname || '',
					description = item.description || '',
					text = '';

				if (explainName) {
					if (result.indexOf(explainName) !== -1) {
						text = '<label class="trial-prompt primary-link explain-list" rel="prompt" data-prompt-width="" data-prompt-html="<div class=\'prompt-content\'>' + description + '</div>" data-prompt-position="top">' + result + '</label>';
						result = result.replace(explainName, text);
					}
				} else if (explainByname) {
					if (result.indexOf(explainByname) !== -1) {
						text = '<label class="trial-prompt primary-link explain-list" rel="prompt" data-prompt-width="" data-prompt-html="<div class=\'prompt-content\'>' + description + '</div>" data-prompt-position="top">' + result + '</label>';
						result = result.replace(explainByname, text);
					}
				}
			});

			return result;

		},

		identicalProtectItem: {},
		//渲染保障项
		renderProtectRow: function(protectTrialItemList) {
			var _this = this,
				result = [],
				list = protectTrialItemList || [],
				explainList = _this.additInfo.explainList || [];

			_this.identicalProtectItem = {};

			if (_this.protectList.length) {
				result.push('<div class="detail-ensure-protect f14">');
				result.push('<h3 class="f14 pb20 pt20 fb fc6">保障权益</h3>');
				_this.protectList.forEach(function(item, i) {
					var list = item.list || [];
					result.push('<ul class="ensure-protect-list">');
					result.push('<li class="ensure-protect-item ensure-protect-head">');
					result.push('<h4 class="protect-item-title">' + item.name + '</h4>');
					result.push('</li>');
					list.forEach(function(item) {

						if (!item) {
							return;
						}
						var description = item.description || '';
						var protectNoteMap = _this.renderData.protectNoteMap || {};
						var getRelateCoverageItem;
						var style = '';
						for (var key in protectNoteMap) {
							if (~~item.protectItemId === ~~key) {
								for (var _key in protectNoteMap[key]) {
									description = description.replace(_key, '<label rel="prompt" class="trial-prompt primary-link" data-prompt-width="" data-prompt-html=" <div class=\'prompt-content\'>' + protectNoteMap[key][_key] + '</div>" data-prompt-position="top" for="" content="' + protectNoteMap[key][_key] + '">' + _key + '[注]</label>');
								}

							}
						}
						if (!_this.identicalProtectItem[item.name]) {
							_this.identicalProtectItem[item.name] = [];
						}
						_this.identicalProtectItem[item.name].push(item.name);
						if (_this.identicalProtectItem[item.name].length > 1) {
							style = ' style="visibility:hidden;" ';
						} else {
							style = '';
						}

						//description = _this.getExplainList(explainList, description);
						result.push('<li class="ensure-protect-item ' + _this.listStyle + '" id="protect-' + item.protectItemId + '-' + item.trialItemId + '" protectname="' + item.name + '" trialItemId="' + item.trialItemId + '">');
						result.push('<div class="row01" ' + style + '><div class="protect-item-icon">' + (item.icon ? '<img src="' + item.icon + '" width="24" height="24" alt="图标" title="' + item.name + '"/>' : '<i class="iconfont icon-item f24">&#xe702;</i>') + '</div></div>');


						result.push('<div class="row02" ' + style + '><div class="protect-item-name">');


						result.push(_this.getExplainList(explainList, item.name));

						result.push('</div></div>');
						result.push('<div class="row03">');
						if (item.relateCoverageId) {
							getRelateCoverageItem = _this.getRelateCoverageItem(item.relateCoverageId);
							if (getRelateCoverageItem) {
								getRelateCoverageItem.showUnit = item.showUnit;
								result.push(_this.renderForm({
									item: item,
									formObject: getRelateCoverageItem,
									isProtect: true
								}));
							}
						} else {
							result.push((item.fullPremium ? item.fullPremium : item.premium) || '');
						}
						//if (!getRelateCoverageItem) {
						result.push(item.showUnit);
						//}

						result.push('</div>');
						result.push('<div class="row04"><div class="protect-item-des f12 fc6">' + description + '</div></div>');
						result.push('</li>');
					});
					result.push('</ul>');
				});
				result.push('</div>');
			}
			return result.join('');
		},
		renderProtect: function(restrictRule) {

			var _this = this,
				renderData = _this.renderData || {},
				protectTrialItemList = renderData.protectTrialItemList;
			_this.buildProtect();
			return _this.renderProtectRow(protectTrialItemList);

		}
	};

	//继承公共方法
	for (var key in Base.prototype) {
		RenderTrial.prototype[key] = Base.prototype[key];
	}


	return RenderTrial;
});