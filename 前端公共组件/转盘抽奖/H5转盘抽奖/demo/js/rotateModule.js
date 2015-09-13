/* 
 * author : fang yongbao
 * data : 2014.07.14
 * model : 基于jquery/zepto的css3旋转模块，可用来实现转盘抽奖。
 * info : 知识在于积累，每天一小步，成功永远属于坚持的人。
 * blog : http://www.best-html5.net
 */

/*
 *
 * @param {type} option
 * {
 *   @param beginAngle: num,//初始化的角度
 *   @param time: num,//动画时间
 *   @param callBack: function(){},//动画结束的回调
 *   @param easing: ease/ease-in/ease-out/linear,//动画的运动曲线
 * }
 * 
 * return obj
 *   @param rotateTo(deg)//旋转的度数
 *
 */

(function($, undefined) {
	var prefix,
		eventPrefix,
		vendors = {
			Webkit: 'webkit',
			Moz: '',
			O: 'o',
			M: 'm'
		},
		testEl = document.createElement('p')

	$.each(vendors, function(vendor, event) {
		if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
			prefix = '-' + vendor.toLowerCase() + '-'
			eventPrefix = event
			return false
		}
	})

	function normalizeEvent(name) {
		return eventPrefix ? eventPrefix + name : name.toLowerCase()
	}

	var cssSupport = {
		cssPrefix: prefix,
		transition: normalizeEvent('Transition'),
		transform: normalizeEvent('Transform'),
		transitionEnd: normalizeEvent('TransitionEnd'),
		animationEnd: normalizeEvent('AnimationEnd')
	}


	var transition = cssSupport.transition;
	var transform = cssSupport.transform;
	var transitionEnd = cssSupport.transitionEnd;

	$.extend($.fn,{
		rotateModule: function(options) {
			var config = {
				beginAngle: 0,
				time: 4,
				callBack: function() {},
				easing: "ease"

			}
			this.config = $.extend(config, options);
			this.mainObj = $(this);
			this.init = function() {
				this.mainObj.get(0).style[transition] = "all " + this.config.time + "s " + this.config.easing;
			}



			var _this = this;

			var wrappedCallback = function(event) {
				if (typeof event !== undefined) {
					if (event.target !== event.currentTarget) return
					$(event.target).unbind(transitionEnd, wrappedCallback)
				} else
					$(this).unbind(transitionEnd, wrappedCallback)
				event.target.style[transition] = "";
				_this.config.callBack && _this.config.callBack();

			}

			this.bindEndEvent = function() {

				if (this.config.time > 0) {
					this.bind(transitionEnd, wrappedCallback)
				}
			}

			this.rotateTo = function(deg) {
				this.mainObj.get(0).style[transform] = "rotate(0)";
				setTimeout(function() {
					_this.init();
					_this.bindEndEvent();
					_this.mainObj.get(0).style[transform] = "rotate(" + deg + "deg)";
				}, 30)


			}

			return this;
		}
	});
})(Zepto);