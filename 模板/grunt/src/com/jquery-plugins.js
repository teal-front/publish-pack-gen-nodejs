/**
 * @namespace jQuery plugins
 * @class jQuery plugins
 * @fileOverview 常用jQuery plugins
 * @author kingwell Leng
 * @see  <a href="http://static.huizecdn.com/js/hz/www/src/com/jquery-plugins.js">File Url</a>
 * @see  <a href="https://github.com/lengjh/web">Github</a>
 * @version 0.0.1
 */

define(['jquery'], function($) {
	/**
	 * @fileOverview 下拉显示
	 * @version 0.0.1
	 * @author kingwell Leng
	 * @param selector {node} 节点
	 * @example $('.example').dropDown();
	 * @returns selector
	 * @function  $.fn.dropDown	
	 */
	$.fn.dropDown = function(options) {
		var ops = $.fn.extend({
			eventType: 'click',
			type: 0,
			width: 'auto',
			height: '',
			event: function() {},
			enter: function() {},
			leave: function() {},
			select: function() {}
		}, options);
		return this.each(function() {
			var _this = this,
				$this = $(this),
				rel = $this.attr('rel'),
				dropdown = $this.data('dropdown'),
				height = ops.height || $this.data('height'),
				zIndex = ops.zIndex || $this.data('zindex'),
				timeout,
				boxSize = {
					width: $this.outerWidth(),
					height: $this.outerHeight()
				},
				$item = $('[data-dropdown-item="' + dropdown + '"]'),
				hide = function(fast) {
					timeout = setTimeout(function() {
						var $item = $('[data-dropdown-item="' + dropdown + '"]:visible');
						//$item.stop(true);
						$item.hide();
						ops.leave($this, $item);
						if (!$item.length) {
							$item.hide();
							$(document).data('lock-dropdown', '');
							$(document).off('click', hide);
						}
					}, (fast === true ? 1 : 300));

				},
				setPostion = function() {
					pos = $this.offset();
					$item.css({
						position: 'absolute',
						width: ops.width,
						height: ops.height,
						'overflow-y': 'auto',
						'z-index': zIndex
					});
					if (!ops.type) {
						$item.css({
							left: pos.left,
							top: pos.top + boxSize.height,
							'z-index': zIndex
						});
					}
				};
			if ($(this).data('lock')) {
				return;
			}
			$(this).data('lock', true);
			$('[data-dropdown-item]').hide().on('click');
			$this
				.on('mouseleave', function() {
					if (ops.eventType === 'mouseenter') {
						clearTimeout(timeout);
						hide();
					}
				})
				.on(ops.eventType, function(ev) {
					//ev.stopPropagation();
					setPostion();
					ops.enter($this, $item);
					// if (ops.eventType === 'click') {
					// 	$('[data-dropdown-item="' + dropdown + '"]').slideToggle();
					// } else if (ops.eventType === 'mouseenter') {
					// 	$('[data-dropdown-item="' + dropdown + '"]').slideDown();
					// }
					$('[data-dropdown-item="' + dropdown + '"]').toggle();
					if (!$(document).data('lock-dropdown')) {
						$(document).data('lock-dropdown', true);
						$(document).on('click', function(ev) {
							if (ops.event(ev)) {
								hide();
							}

						});
					}
				});
			$item
				.on('mouseenter', function() {
					clearTimeout(timeout);
				})
				.on('mouseleave', function() {
					if (ops.eventType === 'mouseenter') {
						//$(this).slideUp();
						hide();
					}
				})
				.on('click', function(ev) {
					if (ops.select.call(_this, ev) === true) {
						hide(true);
					} else {
						ev.stopPropagation();
					}

				});
		});
	};


	/**
	 * @fileOverview 只能输入数字
	 * @version 0.0.1
	 * @author kingwell Leng
	 * @param selector {node} 节点
	 * @example $('.example').enterOnlyNumber();
	 * @returns selector
	 * @function  $.fn.enterOnlyNumber	
	 */
	$.fn.enterOnlyNumber = function(options) {
		var ops = $.fn.extend({}, options),
			onlyNumber = function(ev) { //只能是数字
				var $this = $(this),
					keyCode = ev.which,
					max = $this.data('max'),
					min = $this.data('min'),
					arr = [8, 9, 27, 37, 38, 39, 40, 13],
					numberLeft = keyCode >= 96 && keyCode <= 105,
					numberRight = keyCode >= 48 && keyCode <= 57,
					negative = 109;

				if ($.inArray(keyCode, arr) < 0 && !(numberLeft || numberRight)) {
					ev.preventDefault();
					return;
				}
			};
		return this.each(function() {
			if ($(this).data('lock')) {
				return;
			}
			$(this).data('lock', true);
			$(this).keydown(function(ev) {
				onlyNumber(ev);
			});
		});
	};

	/**
	 * @fileOverview 手动增减数字
	 * @version 0.0.1
	 * @author kingwell Leng
	 * @param selector {node} 节点
	 * @example $('.example').eidtNumber();
	 * @returns selector
	 * @function  $.fn.eidtNumber	
	 */
	$.fn.eidtNumber = function(options) {
		var ops = $.fn.extend({
			callback: function() {}
		}, options);
		return this.each(function() {
			var _this = this,
				$this = $(this),
				$add = $this.find('span').eq(1), //增加
				$num = $this.find('input'),
				$sub = $this.find('span').eq(0), //减少
				min = $this.data('min') || 0, //最大值
				max = $this.data('max') || Infinity, //最小值
				defaultValue = $this.data('default') || '',
				lock = $this.data('lock'),
				value = $num.val(),
				setStstus = function() {
					var val = $num.val();
					if (val <= min) {
						$sub.addClass('disabled');
					} else {
						$sub.removeClass('disabled');
					}
					if (val >= max) {
						$add.addClass('disabled');
					} else {
						$add.removeClass('disabled');
					}
				};
			//setStstus();
			if (lock) {
				return;
			}
			$this.on('reset', setStstus); //用于改变状态-如禁用-如果用第三方改变值的话，此功能非常适合
			$this.trigger('reset');
			$this.data('lock', true);
			if ($.isNumeric(defaultValue)) {
				$num.val(defaultValue);
			}
			if (value) {
				if (value > max || value < min) {
					$num.val('');
				}
			}
			$add.on('click', function() { //增加
				var newValue = '',
					oldValue = $num.val();
				value = $num.val();
				if ($(this).hasClass('disabled')) {
					return;
				}
				value++;
				if (max && value <= max) {
					$num.val(value);
				}
				$this.trigger('reset');
				newValue = $num.val();
				ops.callback.call(_this, oldValue, newValue, $num);
			});
			$sub.on('click', function() { //减少
				var newValue = '',
					oldValue = $num.val();
				value = $num.val();
				if ($(this).hasClass('disabled')) {
					return;
				}
				value--;
				if (value >= min) {
					$num.val(value);
				}
				$this.trigger('reset');
				newValue = $num.val();
				ops.callback.call(_this, oldValue, newValue, $num);
			});
			$num.blur(function() { //失去焦点
				var value = $(this).val();
				if (value) {
					if (value < min) {
						$(this).val(min);
					}
					if (value > max) {
						$(this).val(max);
					}
				}
				$this.trigger('reset');
				ops.callback.call(_this, value, $num.val(), $num);
			});
			try { //只能输入数字
				$num.enterOnlyNumber();
			} catch (ev) {}
		});
	};

	// $.fn.selects = function(options) {
	// 	var ops = $.fn.extend({

	// 	}, options);
	// 	return this.each(function() {
	// 		var _this = this,
	// 			$this = $(this);
	// 		$this.find('');
	// 	});
	// };
	/**
	 * @fileOverview 单选框和复选框
	 * @version 1.0.0
	 * @author luozuxiong
	 * @param options 插件配置
	 * @returns selector
	 * @example $(".example").selectBox({data:data,model:1})
	 * @description 暴露两个item、getData两个方法,item操作某一项,例：selectBox.item(index,function(){this....}，getData返回选中的数据,例:selectBox.getData()
     */
	$.fn.selectBox = function(options){
		var defaults = {
			data : [],//传入的数据
			model : 1,// 1表示单选框,2表示复选框
			cls : "",//容器className
			itemCls : "hz-radio-item inline-block",//单个选择框className
			imgCls : "",//图片className
			iconCls : "",//图标className
			textCls : "",//文字className
			selectedClass : "hz-radio-item-checked",//选择后的className
			defaultSelected : 0,//默认被选中项
			onSelect : function(){//选择触发的事件

			}
		};
		var settings = $.extend({},defaults,options);
		if(settings.data.length === 0 || $(this).length === 0)
		{
			return null;
		}

		var $self = $(this).addClass(settings.cls + " " + (settings.model === 1 ? "com-radio-list" : "com-checkbox-list" ));

		$self.each(function(){
			var
				$docFragment = $(document.createDocumentFragment()),
				$item = "";
			$.each(settings.data,function(i,v){//初始HTML，绑定事件
				v.value = v.value || i;
				$item =
					$("<div class='com-selectbox-item'></div>")
						.addClass(settings.itemCls)
						.attr("data-value", v.vaule)
						.append(function(){
							var htmlStr = "";
							htmlStr += "<i class='" + settings.iconCls + "'></i>";
							v.img && (htmlStr += "<img class='" + settings.imgCls + "' src='" + v.img + "' width='" + settings.imgWidth + "' height='" + settings.imgHeight + "' alt='" + (v.alt || "") +"'>");
							v.text && (htmlStr += "<span class='" + settings.textCls + "'> " + v.text + " </span>");
							return htmlStr;
						})
						.bind("click",function(){
							_setSelected.call($(this),v);
							settings.onSelect.call($(this),$(this));
						}).appendTo($docFragment);
			});
			$docFragment.appendTo($self);
			$.each(settings.data,function(i,v){//设置默认选项
				if((v.value === settings.defaultSelected) || (v.value === undefined && i === settings.defaultSelected)){
					v.value = v.value || settings.defaultSelected;
					_setSelected.call($self.find(".com-selectbox-item").eq(settings.defaultSelected),v);
					return;
				}
			})
		});
		$self.item = function(index,callback){
			callback.call($self.find(".com-selectbox-item").eq(index || -1));
			return $self;
		}
		$self.getData = function(){
			return $(this).data("selectData");
		}
		function _setSelected(v){
			var
				data,
				_this = this;
			_this.data("selected",true).addClass(settings.selectedClass);
			if(settings.model === 1){
				_this.data("selected",false).siblings(".com-selectbox-item").removeClass(settings.selectedClass);
				if(!!v.text)
				{
					$self.data("selectData",{
						value : v.value,
						text : v.text
					})
				}
				else{
					$self.data("selectData", v.value);
				}
			}
			else{
				data = $self.data("selectData") || [];
				if(!!v.text){
					data[data.length] = {
						value : v.value,
						text : v.text
					};
				}
				else{
					data[data.length] = v.value;
				}
				$self.data("selectData",data)
			}
		}
		return $self;
	}
	/**
	 * @fileOverview 文本框自动完成
	 * @version 1.0.0
	 * @author luozuxiong
	 * @param options 插件配置
	 * @returns selector
	 * @example $(".example").selectBox({data:data,input:selector})
	 * @description
	 */
	$.fn.autoComplete = function(options){
		var
			defaults = {
				data : [],//待匹配的数据
				input : "",//文本框
				submit : "",//确定按钮
				onSelect : function(){//选中一项的回调

				},
				onSubmit : function(data){//确定按钮的回调,data为选中的数据{text:text,value:value}

				}
			},
			settings,
			$self = $(this);
		settings = $.extend({},defaults,options);
		if(settings.data.length === 0 || $(this).length === 0 || $(this).find(settings.input).length === 0){
			return this;
		}
		return $self.each(function(){
			$(this).find(settings.input).bind("keyup",function(e){
				var
					_this = $(this);
					value = _this.val();
				_debounce(function(){
					if(e.keyCode === 38 || e.keyCode === 40){
						_dropDownHandler(e.keyCode);
						return;
					}
					else if(e.keyCode === 13){
						_enterHandler(_this,settings.onSubmit);
						return;
					}
					_keyupHandler(value);
				},10)();
			});
			$(this).find(settings.submit).bind("click",function(){
				_enterHandler($(this),settings.onSubmit);
			});
		})
		function _filterData(array,value){
			for(i in array){
				if(array[i].text === value){
					return array[i];
				}
			}
		}
		function _debounce(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if(!immediate)
						func.apply(context, args);
				};
				if(immediate && !timeout)
					func.apply(context, args);
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
			};
		};
		function _keyupHandler(value){
			var input = $self.find(settings.input);
			$self.find(".com-autoComplete-box").remove();
			var  $container = $("<div class='com-autoComplete-box'></div>")
				.css({
					position : "absolute",
					border   : "1px solid #eee",
					marginTop:"-1px",
					borderTop:"none",
					backgroundColor : "#fff",
					width : (parseInt(input.width()) + parseInt(input.css("padding-left"))*2) +"px"
				});
			if(value === "") return;
			$.each(settings.data,function(i){
				if(settings.data[i].text.indexOf(value) > -1){
					$("<div class='autoComplete-matched-item'></div>")
						.css({
							padding  : "6px 5px",
							cursor : "pointer"
						})
						.attr("data-value",settings.data[i].value)
						.bind("mouseover",function(){
							$(this).css("background-color","#efefef").addClass("complete-item-current");
						})
						.bind("mouseleave",function(){
							$(this).css("background-color","#fff").removeClass("complete-item-current");
						})
						.bind("click",function(){
							var text = $(this).text();
							$container.remove();
							settings.onSelect.call($(this),_filterData(settings.data,text));
							$self.data("autoCompleteData",_filterData(settings.data,text));
							input.val(settings.data[i].text);
						})
						.append($("<p></p>").text(settings.data[i].text))
						.appendTo($container);
				}
			})
			$container.appendTo($self);
		}
		function _dropDownHandler (keyCode){
			var
				up = keyCode === 38,
				items = $self.find(".autoComplete-matched-item"),
				current = $self.find(".complete-item-current"),
				index;
			if(items.length === 0){
				return;
			}
			if(up){
				current.removeClass("complete-item-current").data("select",false);
				if(current.index() === 0)
				{
					index = items.length - 1;
					items.eq(index).addClass("complete-item-current").data("select",true);
				}
				else{
					index = current.length === 0 ? 1 : current.index();
					items.eq(index -1).addClass("complete-item-current").data("select",true);
				}
			}
			else{
				current.removeClass("complete-item-current").data("select",false);
				if(current.index() === items.length - 1)
				{
					index = 0 ;
					items.eq(index).addClass("complete-item-current").data("select",true);
				}
				else{
					index = current.length === 0 ? -1 : current.index();
					items.eq(index + 1).addClass("complete-item-current").data("select",true);
				}
			}
			$self.data("autoCompleteData",settings.data[index]);
		}
		function _enterHandler(context,callback){
			var selectData = $self.data("autoCompleteData");
			if($self.find(".complete-item-current").length === 0){
				$self.find(".com-autoComplete-box").length > 0 && (selectData = {});
				callback.call(context,selectData);
			}
			else{
				var text = $self.find(".complete-item-current").text();
				$self.find(settings.input).val($self.find(".complete-item-current").text());
				$self.data("autoCompleteData",_filterData(settings.data,text));
				$self.find(".com-autoComplete-box").remove();
			}
		}
	}

});