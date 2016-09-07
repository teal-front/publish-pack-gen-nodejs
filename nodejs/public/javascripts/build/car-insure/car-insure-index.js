/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["jquery","helper"],function($,a){"use strict";var b={iframeUrl:"//daren-cx-h5.huize.com/chexian/step1.html",platformFlag:61,iframe:"",init:function(){var b=this;a.state.checkLogin(function(a){a.result?(b.iframe=$("#iframepage"),b.initEvent()):window.location.href="//passport.huize.com/?returnurl="+window.location.href})},initEvent:function(){var a=this,b=a.iframeUrl;b=b.indexOf("?")>0?b+"&platformFlag="+a.platformFlag:b+"?platformFlag="+a.platformFlag,a.iframe.attr("src",b),window.setInterval(function(){var a=document.getElementById("iframepage");try{var b=a.contentWindow.document.body.scrollHeight,c=a.contentWindow.document.documentElement.scrollHeight,d=Math.max(b,c);a.height=d}catch(e){a.height=0}},200)}};return b});