# jQuery Prompt #
>依赖文件：

	http://static.huizecdn.com/js/libs/jquery/1.8.0/jquery.min.js
	http://static.huizecdn.com/js/plugins/jq-prompt/build/jq-prompt.min.js

> 调用方法

	$(function() {
	  $('[rel="prompt"]').prompt();
	});

> 使用例子

	<span class="" rel="prompt" data-prompt-arrow-size="8" data-prompt-width="200" data-prompt-height="50" data-prompt-show-arrow="true" data-prompt-align="left" data-prompt-position="bottom" data-prompt-html="提示内容" data-prompt-class="asdfasdf">提示DEMO</span>


>通过HTML data控制：

	rel="prompt"              ===>来源
	data-prompt-show-arrow    ===>是否显示箭头；布尔值
	data-prompt-arrow-size    ===>箭头大小；数字
	data-prompt-width         ===>宽度；数字
	data-prompt-height        ===>高度；数字
	data-prompt-align         ===>对齐方式，左、中、右
	data-prompt-position      ===>位置，可取值：top、right、bottom、left;默认：top;
	data-prompt-html          ===>提示内容；可取值：HTML或TEXT；
	data-prompt-class         ===>添加自定义样式
>通过Javascript控制

	$('[rel="prompt"]').prompt({
		width: 100,
		height: 'auto',
		align: 'center',
		showArrow: true,
		arrowSize: 10,
		html:'提示内容',
		left:50,
		position: 'bottom',
		onShow: function(_this,_tips,_fnSetPostion) {
			_this当前元素,_tips提示框,_fnSetPostion重新设置位置
			//$(this).text('回调事件，显示了');
		},
		onHide:function(_this,_tips,_fnSetPostion){
			//$(this).text('回调事件，隐藏了');
		},		
		addClass:'asdf'
	});

	
	![](../images/bg.jpg 100*20)