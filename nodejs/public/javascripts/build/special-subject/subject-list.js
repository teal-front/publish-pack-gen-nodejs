/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["jquery","jq-slide","fixed-tool-float"],function($,a,b){"use strict";var c={toolFloat:{},init:function(){this.initData(),this.initView()},initData:function(){this.toolFloat=new b},initView:function(){$(".jq-slide").slide({width:"100%",height:308,autoPlay:5e3,prevBtn:$(".pre-arrow"),nextBtn:$(".next-arrow"),callback:function(a,b){$(".slider-page .num").html('<span class="f36">'+a+"</span>/"+b)}})}};return c});