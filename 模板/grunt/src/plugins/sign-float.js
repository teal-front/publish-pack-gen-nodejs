/**
 * 登陆组件
 */
define(["jquery","underscore","exports","require","module","helper","layer"],function($,_,exports,require,module,helper,layer) {
    "use strict";
    var SignFloat = function () {
        SignFloat.prototype.init.apply(this, arguments);
    };
    SignFloat.prototype = {
        saveUserName: false,//是否保存账号名
        config: null,
        init: function (config) {
            var self = this;
            this.config = config;

            require(["layer", "require-text!/html/public/accout-login.html"], function (layer, html) {
                layer.config({//配置layer
                    path: "//static.huizecdn.com/js/plugins/layer/1.9.3/",
                    extend: 'extend/layer.ext.js'
                });
                var loginCount = helper.cookie.getCookie("LoginErrCount");
                var userName = unescape(helper.cookie.getCookie("RemberUserName"));
                var tabs = [{
                    title: '账号密码登录',
                    content: _.template(html.split("<area>")[0])({isshowcode: loginCount ? (loginCount >= 3 ? "" : "fn-hide") : "fn-hide"})
                }];
                if (config.showRegister) {
                    tabs.push({title: '注册', content: html.split("<area>")[1]});
                }
                layer.ready(function () {//加载layer完成回调
                    layer.tab({
                        skin: 'dialog-login layui-layer-tab',
                        area: '400px',
                        tab: tabs
                    });
                    $(".share-wx-icon").attr("href", "//passport.huize.com/OtherLogin/WXlogin?returnurl=" + config.returnUrl);
                    $(".share-qq-icon").attr("href", "//passport.huize.com/OtherLogin/qqlogin?returnurl=" + config.returnUrl);
                    $(".share-sina-icon").attr("href", "//passport.huize.com/OtherLogin/sinalogin?returnurl=" + config.returnUrl);

                    if (userName) {
                        $("#accountUsername").val(userName);
                    }
                    self.initAction();
                });
            });
        },

        initAction: function () {
            var self = this;
            //登陆相关交互
            $("#accountName").bind("click", function () {
                if ($(this).parent().hasClass("hz-check-item-checked")) {
                    $(this).parent().removeClass("hz-check-item-checked");
                    self.saveUserName = false;
                } else {
                    $(this).parent().addClass("hz-check-item-checked");
                    self.saveUserName = true;
                }
            });
            $("#accountLogin").bind("click", function () {//登陆按钮
                var postData = {};
                postData.LoginName = $("#accountUsername").val();
                postData.Password = $("#accountPassport").val();
                if (!$("#imgCode").hasClass("fn-hide")) {
                    postData.VerificationCode = $("#verifycode").val();
                }
                if (!$.trim(postData.LoginName)) {
                    self.showErrMsg("logininfo", "请输入用户名!");
                    return;
                } else if (!$.trim(postData.Password)) {
                    self.showErrMsg("logininfo", "请输入密码!");
                    return;
                } else if (!$("#imgCode").hasClass("fn-hide") && !$.trim(postData.VerificationCode)) {
                    self.showErrMsg("logininfo", "请输入验证码!");
                    return;
                }
                if (self.saveUserName) {
                    postData.RememberUserName = true;
                } else {
                    postData.RememberUserName = false;
                }
                postData["X-Requested-With"] = "XMLHttpRequest";
                postData.ClientTime = helper.dateHelper.formatDate("yyyy-MM-dd hh:mm:ss", new Date());
                postData.Source = encodeURIComponent(location.href);
                helper.request.getCrossJson({
                    url: "http://passport.huize.com/SignIn/AjaxSignIn",
                    data: postData,
                    callbackType:"jsoncallback"
                }, function (data) {
                    if (data.IsSuccess) {
                        if (self.config.callback) {
                            self.config.callback(data);
                        }
                    } else {
                        if (data.Message) {
                            self.showErrMsg("logininfo", data.Message);
                        }
                        if (data.Pramas && data.Pramas[0] && data.Params[0] > 3) {
                            $("#imgCode").removeClass("fn-hide");
                        }
                    }

                });
            });

            //注册相关的业务
            var checkPhone = function (callback) {
                var phoneNum = $.trim($("#mobilePhone").val());
                if (!phoneNum) {
                    self.showErrMsg("registerinfo", "请输入手机号码!");
                    return;
                } else if (!helper.CheckMobile(phoneNum)) {
                    self.showErrMsg("registerinfo", "请输入正确的手机号码");
                    return;
                } else {
                    helper.request.getCrossJson({
                        url: "http://passport.huize.com/register/CheckMobileExist",
                        data: {Mobile: phoneNum}
                    }, function (result) {
                        if (result && result.IsSuccess) {
                            self.showErrMsg("registerinfo", "对不起，您输入的手机号已存在");
                        } else {
                            self.showErrMsg("registerinfo", "");
                            if (callback && typeof callback === "function") {
                                callback(phoneNum);
                            }
                        }
                    });

                }
            };
            var messageBtn = $("#getMsgCode");
            var timckCount = 0;
            var inputingCode = false;
            var setTimck = function () {
                $("#getMsgCode").html((timckCount--) + "秒后后重新获取");
                if (timckCount === 0) {
                    messageBtn.removeClass("disabled");
                    messageBtn.html("点击获取验证码");
                    return;
                }
                setTimeout(setTimck, 1000);
            };
            if (this.config.showRegister) {
                $("#mobilePhone").blur(checkPhone);
                $("#verifyImg").bind("click", function () {
                    $(this).attr("src", "//passport.huize.com/SignIn/VerifyCode?" + new Date());
                });
                helper.request.getCrossJson({url:"//passport.huize.com/SignIn/CheckPageNeedVerifyCode"},function(result){//是否需要向上图形验证码
                    if(!result.Data){
                        $("#registCode").addClass("fn-hide");
                    }
                });
                $("#getMsgCode").bind("click", function () {
                    if (messageBtn.hasClass("disabled")) {
                        return;
                    }
                    var result = checkPhone(function (result) {
                        if (result) {
                            var param = {Mobile: result};
                            if (!$("#registCode").hasClass("fn-hide")) {
                                param.verificationCode = $("#registerVerifycode").val();
                            }
                            helper.request.getCrossJson({
                                url: "http://passport.huize.com/Register/SenMessage4Jsonp",
                                data: {Mobile: result, verificationCode: param.verificationCode}
                            }, function (result) {
                                if (result && result.IsSuccess) {
                                    timckCount = 120;
                                    messageBtn.addClass("disabled");
                                    setTimck();
                                }else{
                                    self.showErrMsg("registerinfo", result.Message);
                                }
                            });
                        }
                    });


                });
                $("#userPassword").blur(function () {
                    var userPass = $.trim($(this).val());
                    if (!userPass) {
                        self.showErrMsg("registerinfo", "请输入用户密码!");
                        return;
                    }else {
                        var levelStr=self.passwordLevel(userPass);
                        self.showErrMsg("registerinfo","密码等级:"+levelStr);
                        self.hideErrMsg();
                        return;
                    }
                });
            }
            //注册相关交互
            $("#registerBtn").bind("click", function () {
                var shortCode = $("#shortMessageCode").val();

                checkPhone(function () {
                    if (!shortCode) {
                        self.showErrMsg("registerinfo", "请输入验证码");
                    }
                    helper.request.getCrossJson({
                        url: "http://passport.huize.com/register/CheckIdentify",
                        data: {identify: shortCode, mobile: $("#mobilePhone").val()}
                    }, function (result) {
                        if (result && !result.IsSuccess) {
                            self.showErrMsg("registerinfo", "短信验证码输入错误");
                        } else if (result && result.IsSuccess) {
                            var userPass = $.trim($("#userPassword").val());
                            var comfirmPass= $.trim($("#comfirmPassport").val());
                            if (!userPass) {
                                self.showErrMsg("registerinfo", "请输入用户密码!");
                            }else if(!comfirmPass){
                                self.showErrMsg("registerinfo", "请输入确认密码!");
                            }
                            else if(userPass!=comfirmPass){
                                self.showErrMsg("registerinfo", "密码输入不一致!");
                            }
                            else {
                                helper.request.getCrossJson({
                                    url: "http://passport.huize.com/Register/NewJsonpRegister",
                                    callbackType: "jsoncallback",
                                    data: {
                                        Identify: shortCode,
                                        Moblie: $("#mobilePhone").val(),
                                        LoginPassword: userPass
                                    }
                                }, function (result) {
                                    if (result && result.IsSuccess) {
                                        layer.msg('注册成功');
                                        if (config.callback) {
                                            setTimeout(function() {
                                                config.callback(data);
                                            },1000);
                                        }
                                    }
                                });
                            }
                        }
                    });
                });

            });
        },

        bindBlur: function () {
            if (!$.trim(phoneNum)) {
                this.showErrMsg("registerinfo", "请输入手机号码");
                return;
            }
        },
        showErrMsg: function (el, info) {
            var infoMsg = $("#" + el);
            infoMsg.removeClass("fn-hide");
            infoMsg.css("visibility","visible");
            infoMsg.html(info);
        },
        hideErrMsg: function (el) {
            $("#" + el).css("visibility","hidden");
        },
        checkRegisterMobileExit: function (data, callback) {
            $.getJson("http://passport.huize.com/register/CheckEmailExist", data, function () {

            });
        },
        passwordLevel:function(str) {
            var result = "安全等级：";

            if (new RegExp(/^[0-9]*$/).test(str) ||
                new RegExp(/^[A-Za-z]+$/).test(str) ||
                new RegExp(/^\W+$/).test(str)) {
                result += "低";
            }
            else if (new RegExp(/^[A-Za-z0-9]+$/).test(str) ||
                new RegExp(/^[0-9\W]+$/).test(str) ||
                new RegExp(/^[a-zA-Z\W]+$/).test(str)) {
                result += "中";
            }
            else {
                result += "高";
            }
             return result;
    }


};

    module.exports = SignFloat;
});