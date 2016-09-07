/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["jquery","exports","require","module"],function($,a,b,c){"use strict";var d=function(){d.prototype.init.apply(this,arguments)};d.prototype={init:function(){var a=$("#submenulist");a.delegate("li","mouseover",function(){var a=$("a",this).siblings("div");$("a",this).addClass("main-menu-link-hover"),a.length>0&&a.removeClass("fn-hide")}),a.delegate("li","mouseout",function(){var a=$("a",this).siblings("div");$("a",this).removeClass("main-menu-link-hover"),a.length>0&&a.addClass("fn-hide")})}},c.exports=d});