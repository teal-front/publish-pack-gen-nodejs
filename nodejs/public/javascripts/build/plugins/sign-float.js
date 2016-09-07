/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["jquery","underscore","exports","require","module","helper","layer"],function($,a,b,c,d,e,f){"use strict";var g=function(){g.prototype.init.apply(this,arguments)};return g.prototype={defaults:{returnUrl:"",callback:function(){},replyHost:function(){var a=window.location.host;return a.indexOf("www")>-1?"http://www.huize.com":"//is.huize.com"}()},init:function(a){var b=this;e.state.checkLogin(function(c){if((c||{}).result)window.location.reload();else{var d=b.opts=$.extend({},b.defaults,a);window._loginCallback=function(b){return b?void(window.location.href="http://passport.huize.com"+b+"="+(d.returnUrl||window.location.href||"http://www.huize.com")):(d.returnUrl&&(window.location.href=d.returnUrl),void(d.callback&&a.callback.call(window)))},b.render()}})},render:function(){var a=this;f.open({type:2,title:!1,shadeClose:!0,shade:.8,area:["360px","445px"],content:"//passport.huize.com/signin/SampleLogin?newreturnurl="+(a.opts.returnUrl||window.location.href)+"&returnurl="+a.opts.replyHost+"/html/public/reply.html?callback=_loginCallback"})}},g});