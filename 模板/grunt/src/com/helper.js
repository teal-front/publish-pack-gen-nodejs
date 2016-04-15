/**
 *帮助类
 */
define(['jquery','layer'],function($,layer) {
    "use strict";
    var helper = {
        loadCss: function (fileName) {
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", fileName);
            document.getElementsByTagName("head")[0].appendChild(fileref);
        },
        request: {
            //获取JSON
            getJson: function (options, callback, callbackType) {
                $.ajax({
                    async: true,
                    url: options.url+"?"+new Date(),
                    type: "GET",
                    data: options.data,
                    success: function (result) {
                        if (callback) {
                            callback(result);
                        }
                    },
                    error: function (xhr) {
                        console.log("dsfsdf");
                    }
                });
            },
            //跨域获取JSON
            getCrossJson: function (options, callback) {
                $.ajax({
                    async: true,
                    url: options.url,
                    type: "GET",
                    dataType:"jsonp",
                    jsonp: options.callbackType || 'callback',
                    data: options.data,
                    success: function (result) {
                        if (callback) {
                            callback(result);
                        }
                    },
                    error: function (xhr) {
                        console.error("网络连接错误");
                    }
                });
            },

            //POST提交数据
            postData: function (options,callback) {//兼容老系统
                $.ajax({
                    type: options.method||"POST",
                    url: options.url,
                    data: JSON.stringify(options.data) || "{}",
                    success: function (data) {
                        if(!data.result){
                            layer.msg(data.message);
                            return;
                        }
                        if (callback) {
                            callback(data);
                        }
                    }
                });
            },
            postData2: function (options,callback) {
                $.ajax({
                    type: options.method||"POST",
                    url: options.url,
                    dataType:"json",
                    data: {data:JSON.stringify(options.data) || "{}"},
                    success: function (data) {
                        if(!data.result){
                            layer.msg(data.message);
                            return;
                        }
                        if (callback) {
                            callback(data);
                        }
                    }
                });
            }
        },

        cookie: {//操作cookie
            delCookie: function (name) {
                var date = new Date();
                date.setTime(date.getTime() - 10000);
                document.cookie = name + "=a; expires=" + date.toGMTString();
            },
            setCookie: function (cname, cvalue,time,domain) {
                var d = new Date();
                if (time) {
                    d.setTime(d.getTime() + (time ? time : 0));
                    var expires = "expires=" + d.toUTCString();
                }
                if(domain){
                   var domain="domain="+domain;
                }
                document.cookie = cname + "=" + cvalue + "; " + expires+"; "+domain+";Path=/";
            },
            getCookie: function (name) {
                var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
                if (arr = document.cookie.match(reg)) {
                    return arr[2];
                }
                else {
                    return "";
                }
            }
        },
        CheckMobile: function (a) {
            var b = new RegExp("^1(3|4|5|8|7)[0-9]{9}$");
            if (!b.test(a)) {
                return false;
            }
            return true;
        },
        dateHelper: {//格式化日期
            //格式化日期
            formatDate: function (format, date) {
                if (!date){
                    return "";
                }
                if (typeof date === "number") {
                    date = new Date(date * 1000);
                }
                var o = {
                    "M+": date.getMonth() + 1, //month
                    "d+": date.getDate(),    //day
                    "h+": date.getHours(),   //hour
                    "m+": date.getMinutes(), //minute
                    "s+": date.getSeconds(), //second
                    "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
                    "S": date.getMilliseconds(), //millisecond
                    "w": "日一二三四五六".charAt(date.getDay())
                };
                format = format.replace(/y{4}/, date.getFullYear())
                    .replace(/y{2}/, date.getFullYear().toString().substring(2));

                for (var k in o) {
                    var reg = new RegExp(k);
                    format = format.replace(reg, match);
                }
                function match(m) {
                    return m.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length);
                }

                return format;
            }
        },
        tips:{


        },
        text:{
          formatMoney:function(money){
              return money/100;
          }
        },
        state:{
            checkLogin:function(callback){
                helper.request.getJson({url:"/users/islogin"},function(result){
                    callback(result);
                });

            }
        },
        url:{
        getUrlVar:function(name){ //获取url参数
            var getUrlVars=function(){
                var vars = [], hash;
                var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
                for(var i = 0; i < hashes.length; i++)
                {
                    hash = hashes[i].split('=');
                    vars.push(hash[0]);
                    vars[hash[0]] = hash[1];
                }
                return vars;
            };
            return getUrlVars()[name];
          }
        }
    };
    return helper;
});