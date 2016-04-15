define(['jquery'], function($) {
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
		renderModule: function(modules) { //渲染模块
			var _this = this,
				result = [];
			result.push('<div class="insure-step-body p30 bgfw">');
			result.push('<div class="person-write-info first-item">');
			modules.forEach(function(item, i) {
				var modulesItem = item || {};
				result.push('<div class="person-write-info" id="module-' + item.id + '">');
				result.push('<dt class="info-title">' + item.name + '</dt>');
				result.push(_this.renderTable(item));
				result.push('</div>');
			});
			result.push('</div>');
			result.push('</div>');
			return result.join('');
		},
		renderTable: function(modulesItem) { //渲染Table
			var _this = this,
				result = [],
				list = modulesItem.productAttrs || [];
			list.forEach(function(item, i) {
				var attribute = item.attribute || {},
					styles = [], //添加样式
					stylesJoin = ' ',
					inputName = attribute.keyCode, //keyCode
					attr = ' ' +
					'data-moduleid="' + modulesItem.id + '" data-attributeid="' + attribute.id + '" ' +
					'data-defaultvalue="' + 0 + '" data-errorremind="' + attribute.errorRemind + '" data-defaultremind="' + attribute.defaultRemind + '"  ' +
					'data-required="' + item.required + '" data-regex="' + attribute.regex + '" ' +
					'maxlength="' + _this.inputMaxLength + '" ', //属性

					id = 'item-' + modulesItem.id + '-' + item.attributeId, //ID
					values = attribute.values || []; //单选，多选
				//_this.info(item);

				result.push('<dd>');
				result.push('<label class="label-item" for="' + id + '">' + attribute.name + '</label>');
				switch (attribute.id) {
					case _this.ATTR_TEL_ID: //手机号码-只能数字
						styles.push('only-number');
						break;
					case _this.ATTR_PROPORTION_ID:
						styles.push('only-number'); //受益比例-只能数字
						break;
				}

				switch (attribute.type) {
					case 0: //下拉框
						result.push('<select name="" id=""><option value="">asdf</option></select>');
						break;
					case 1: //日历控件
						result.push('<input class="Wdate" type="text" name="' + inputName + '" id="' + id + '" ' + attr + '>')
						break;
					case 2: //同时出现下拉框和日历控件区间
						result.push('同时出现下拉框和日历控件区间');
						break;
					case 3: //文本框
						styles.push('input-text');
						result.push('<input type="text" class=" ' + styles.join(stylesJoin) + ' " name="' + inputName + '" id="' + id + '"  ' + attr + '/>');
						break;
					case 4: //地区控件
						result.push('地区控件');
						break;
					case 5: //职业控件
						result.push('职业控件');
						break;
					case 6: //密码控件
						result.push('密码控件');
						break;
					case 7: //文本
						result.push('文本类型');
						break;
					case 8: //对话框
						result.push('对话框类型');
						break;
					case 9: //单选
						values.forEach(function(item, i) {
							var _id = 'input-' + id + i;
							//_this.info(item);
							result.push('<input type="radio" name="' + inputName + '" id="' + _id + '" class=""  ' + attr + '/>');
							result.push('<label for="' + _id + '">' + item.value + '</label>');
						});
						break;
					case 10: //多选
						rvalues.forEach(function(item, i) {
							var _id = 'input-' + id + i;
							//_this.info(item);
							result.push('<input type="checkbox" name="' + inputName + '" id="' + _id + '" class=""  ' + attr + '/>');
							result.push('<label for="' + _id + '">' + item.value + '</label>');
						});
						break;
				}
				result.push('</dd>');
				result.push();
			});
			return result.join('');
		}
	};

	return InsureRender;
});