/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["jquery","fixed-tool-float"],function($,a){"use strict";var b={toolFloat:{},init:function(){this.initData(),this.initEvents()},initData:function(){this.toolFloat=new a},initEvents:function(){$("#btnShowAll").click(function(){$(".word-link").removeClass("selected"),$(this).addClass("selected"),$(".brand-item").show()}),$(".brand-item").hover(function(){$(this).addClass("brand-item-hover")},function(){$(this).removeClass("brand-item-hover")}),$(".search-bar").delegate("a","click",function(){$("#btnShowAll").removeClass("selected"),$(".word-link").removeClass("selected"),$(this).addClass("selected");var a=$(this).text();$(".brand-item").each(function(b,c){var d=$(this).find("input[type=hidden]").val();a===d?$(this).show():$(this).hide()})})}};return b});