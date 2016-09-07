/**
 *固定浮层
 */
define(function(require, exports, module) {
    "use strict";
    var FixFloat = function() {
        FixFloat.prototype.init.apply(this, arguments);
    };
    FixFloat.prototype = {
        init: function (config) {
            var $el =config.el;//固定的层
            var $elchild=config.fixPanel;//固定层的参照物
            if($el.length===0||$elchild.length===0){
                return;
            }
            var scrollCallBack=function () {
                var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                var scrollHeight=document.documentElement.clientHeight;
                var topNav = $elchild.offset().top - parseInt($elchild.css("padding-top"));
                if(config.fixbuttom){
                    if (topNav + $elchild.outerHeight()-scrollTop>scrollHeight) {
                        $el.addClass(config.fixClass);

                    }
                    else {
                        $el.removeClass(config.fixClass);
                    }
                }else {
                    if (scrollTop >= topNav) {
                        if (config.callback) {//如果有自定义处理函数则调用
                            config.callback("add");
                        }
                        $el.addClass(config.fixClass);
                    }
                    else {
                        if (config.callback) {
                            config.callback("remove");
                        }
                        $el.removeClass(config.fixClass);
                    }
                }
            };
            $(window).bind("scroll",scrollCallBack);
            scrollCallBack();
        }
    };
    module.exports = FixFloat;
});