/**
 *顶部菜单.
 */
define(["jquery", "underscore", "exports", "require", "module", "helper", "layer"], function($, _, exports, require, module, helper, layer) {
    "use strict";
    var TopMenu = function() {
        TopMenu.prototype.init.apply(this, arguments);
    };
    var PASSPORTURL = "https://passport.huize.com";
    TopMenu.prototype = {
        personInfo: {},
        init: function() {
            var self = this;
            self.initActions();
            require(["require-text!/html/public/top-menu.html"], function(html) { //加载模板
                helper.request.getCrossJson({
                    url: "//passport.huize.com/Signin/GetCustomerStateData4Jsonp"
                }, function(data) {
                    data.QuitUrl = PASSPORTURL + data.QuitUrl + "?returnurl=" + location.href;
                    data.SignInUrl = PASSPORTURL + data.SignInUrl + "?returnurl=" + location.href;
                    data.RegisterUrl = PASSPORTURL + data.RegisterUrl + "?returnurl=" + location.href;
                    $(".top-nav-wrap .top-nav-menu").prepend($(_.template(html)(data)));
                    self.initActions();
                    if (data.CustomerCode !== "0") {
                        window.hzins = {}; //储存共享信息
                        window.hzins.login = true; //已经登陆
                       // self.bindFavorite();
                    }
                });
            });

            //解决ipad样式问题
            //if(/iPad/ig.test(window.navigator.userAgent)){
            //    $("body").width(1200)
            //}
        },

        initActions: function() { //顶部菜单栏交互
            var _this = this;
            $("#myinfo").delegate("li","mouseover", function() {
                $(".drop-menu-item-body", this).removeClass("fn-hide");
                $(this).addClass("top-nav-menu-item-hover");
            });
            $("#myinfo").delegate("li","mouseleave", function() {
                $(".drop-menu-item-body", this).addClass("fn-hide");
                $(this).removeClass("top-nav-menu-item-hover");
            });
            $("#topMenuLoginBtn").click(function(){
                var href = $(this).data("href");
                helper.state.checkLogin(function(result){
                    if((result || {}).result){
                        window.location.reload();
                    }
                    else{
                        window.location.href = href;
                    }
                });
            });

            $("#btnSearchProduct").click(function() {
                var keyWords = _this.filterKeyWords($("#txtSearchProduct").val());
                if (keyWords === "") {
                    return;
                }
                var enKeyWords = "//search.huize.com/p-1-" + encodeURI(keyWords) + "-0-0-1";
                location.href = enKeyWords;
                return false;
            });
            $("#txtSearchProduct").keydown(function(e) {
                // 兼容FF和IE和Opera  
                var theEvent = e || window.event;
                var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
                if (code == 13) {
                    $("#btnSearchProduct").click();
                    return false;
                }
                return true;

            });
        },
        filterKeyWords: function(key) { //搜索关键字过滤
            var regEx = /<[^>]+>/g;
            var reght = /[\~\`\!\@\#\$\%\^\&\*\{\}\,\-\_\]\[\+\:\;\"\'\=\|\\\<\>\?\/\.\(\)]/g;
            var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]");

            key = key.replace(regEx, '').replace(reght, '').replace(/^\s*/, "").replace(/\s*$/, "");
            var rs = "";
            for (var i = 0; i < key.length; i++) {
                rs = rs + key.substr(i, 1).replace(pattern, '');
            }
            return rs;
        }
    };

    module.exports = TopMenu;
});