/**
 * 登陆组件
 */
define(["jquery","underscore","exports","require","module","helper","layer"],function($,_,exports,require,module,helper,layer) {
    "use strict";
    var SignFloat = function () {
        SignFloat.prototype.init.apply(this, arguments);
    };
    SignFloat.prototype = {
        defaults : {
            returnUrl : "",
            callback : function(){},
            replyHost : (function(){
                var host = window.location.host;
                if(host.indexOf("www") > -1){
                    return "http://www.huize.com";
                }
                else{
                    return "//is.huize.com";
                }
            })()
        },
        init : function(opts){
            var P = this;
            helper.state.checkLogin(function(result){
                if((result || {}).result){
                    window.location.reload();
                }
                else{
                    var _opts = P.opts = $.extend({},P.defaults,opts);
                    window['_loginCallback'] = function(otherLoginUrl){
                        if(otherLoginUrl){
                            window.location.href = "http://passport.huize.com" + otherLoginUrl + "=" + (_opts.returnUrl || window.location.href || "http://www.huize.com");
                            return;
                        }
                        if(_opts.returnUrl){
                            window.location.href = _opts.returnUrl;
                        }
                        if(_opts.callback){
                            opts.callback.call(window);
                        }
                    };
                    P.render();
                }
            });

        },
        render : function(){
            var P = this;
            layer.open({
                type: 2,
                title: false,
                shadeClose: true,
                shade: 0.8,
                area: ['360px', '445px'],
                content: '//passport.huize.com/signin/SampleLogin?newreturnurl='+ (P.opts.returnUrl || window.location.href) +'&returnurl=' + P.opts.replyHost  + '/html/public/reply.html?callback=_loginCallback'
            });
        }
    }
    return SignFloat;
});