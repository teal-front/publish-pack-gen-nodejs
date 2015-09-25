# Placeholder plugins Version1.0

### 【说明】解决低版本不支持placeholder问题，支持IE6+，Chorme，Firefox，Opera,Safari等
#### 本插件基础jQuery v1.8.0
   
> http://static.huizecdn.com/js/libs/jquery/1.8.0/jquery.min.js

> http://static.huizecdn.com/js/plugins/placeholder/jquery-placeholder.js
	
### 【使用例子】

>$(selector).placeholder(options);
	
### 【HTML Code】
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>placeholder demo</title>
		<script src="http://static.huizecdn.com/js/libs/jquery/1.8.0/jquery.min.js"></script>
		<script src="../jquery-placeholder.js"></script>
		<style>
		body{
			font-size: 14px;
			margin: 'auto'
		}
		input{
			border:1px solid #ddd;
			}
		</style>
	</head>
	<body>
		<div class="test">
			<input type="text" name="" id="test1"  />
			<input type="text" name="" id="test2" placeholder-text="请输入关键字" placeholder-left="10" placeholder-width=""  placeholder-height="18"  placeholder-color="#666" placeholder-size="12"  placeholder-zindex="5" />
		</div>
		
		<script>
		$('#test1').placeholder({
			blankCharacter: false,//输入空格是否消失,默认消失
			text:'请输入姓名',
			left:10,
			top:0,
			wrapTagName:false,//默认为span,是否创建包裹它的父元素；可以是任何合法标签,div,p,a等,如果为false，则不创建
			width:200,
			color:'red'
		});
		$('#test2').placeholder({
			blankCharacter: false,//输入空格是否消失,默认消失,
			wrapTagName:false,//默认为span,是否创建包裹它的父元素；可以是任何合法标签,div,p,a等,如果为false，则不创建
		});
		</script>
	</body>
	</html>

### 【Javascript Code】

	(function($) {
	/*
		Name: jq Placeholder For IE;
		Author:Kingwell Leng;
		Date:2015-09-25;
		Version:1.0;
	*/

	$.fn.placeholder = function(options) {
		var style = '.placeholder-wrap{position: relative;display: inline-block;}.placeholder-text{position: absolute; }.placeholder-input{position: relative;background: transparent url(http://img.huizecdn.com/com/opacity_0.gif) repeat 0 0;z-index: 1;}';
		var ops = $.fn.extend({
			left: 0,
			top: 0,
			extendStyle: '',
			blankCharacter: true,
			color: '',
			wrapTagName: 'span'
		}, options);
		var head = $('head').append('<style>' + ops.extendStyle + style + '</style>');

		function returnValue(_this, property) {
			return parseInt($(_this).attr(property), 10) || 0;
		}

		return this.each(function() {
			var _this = this,
				text = ops.text || $(_this).attr('placeholder-text') || '',
				$text,
				$input,
				timeout,
				color = ops.color || $(_this).attr('placeholder-color') || '#999',
				left = ops.left !== 0 ? ops.left : returnValue(_this, 'placeholder-left'),
				top = ops.top || returnValue(_this, 'placeholder-top'),
				width = ops.width || (returnValue(_this, 'placeholder-width') || 'auto'),
				height = ops.height || returnValue(_this, 'placeholder-height'),
				fontSize = ops.fontSize || parseInt($(_this).attr('placeholder-size'), 10),
				pos,
				zIndex = parseInt($('body').css('z-index')) || 1,
				isBody = $(_this).parent()[0].tagName.toLowerCase() === 'body',
				box = {
					width: $(_this).outerWidth(),
					height: $(_this).outerHeight(),
					size: fontSize || parseInt($(_this).css('fontSize'), 10)
				},
				tagName = document.createElement($(_this).attr('placeholder-tag') || (ops.wrapTagName || 'span'));

			$(tagName).addClass('placeholder-wrap');
			$(_this).addClass('placeholder-input');
			if (ops.wrapTagName === false) {
				if (isBody) {

				}
				$(_this).parent().css({
					position: 'relative'
				});
			} else {
				$(_this).wrap(tagName);
			}

			$(_this).before('<span class="placeholder-text">' + text + '</span>');
			$text = $(_this).prev('.placeholder-text');
			pos = $(_this).position();
			left += pos.left + parseInt($(_this).css('padding-left'), 10) || 0;
			top += pos.top;
			if (isBody) {
				left = left - parseInt($('body').css('margin-left'), 10) || 0;
				top = top - parseInt($('body').css('margin-top'), 10) || 0;
			}
			//console.log(pos);
			$text.css({
				width: width || box.width,
				height: box.height,
				left: left,
				top: top,
				zIndex: zIndex,
				fontSize: box.size,
				lineHeight: box.height + 'px',
				color: ops.color || color
			});
			$(_this).css({
				zIndex: zIndex + 1
			});
			//Set Status show Or hide;
			function _set() {
				var val = $(_this).val(),
					_val = $.trim(val);
				if (ops.blankCharacter) {
					if (val.length) {
						$text.hide();
					} else {
						$text.show();
					}
				} else {
					if (_val.length) {
						$text.hide();
					} else {
						$text.show();
					}
				}

			}
			//Bind Events;
			$(_this)
				.on('keydown', _set)
				.on('blur', _set)
				.on('paste', function() {
					clearTimeout(timeout);
					_set();
				})
				.on('keyup', _set)
				.on('change', _set)
				.on('click', _set)
				.on('change', _set);
			$(function() {
				_set();
			})
		});
	};
	})(jQuery);