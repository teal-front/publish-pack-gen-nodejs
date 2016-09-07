/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["jquery","helper","fixed-tool-float","animate-fly","layer"],function($,a,b,c,d){"use strict";var e={toolFloat:{},init:function(){this.initData(),this.initView(),this.initEvents()},initData:function(){this.toolFloat=new b},initEvents:function(){var a=this;$(".hz-product-meta").delegate(".add-compare","click",function(){var b=$(this),c=b.attr("planid");b.hasClass("hz-check-item-checked")?(a.toolFloat.delcomparePro(c),b.removeClass("hz-check-item-checked")):a.toolFloat.getCompareCount()>=4?d.msg("对比数目最大不能超过4个"):a.command.animateFly($(this),$("#compareCount"),function(){a.toolFloat.addcomparePro(c)&&b.addClass("hz-check-item-checked")})})},initView:function(){var b=a.cookie.getCookie("compareProducts"),c=b.split(",")||[];$.each(c,function(){$(".add-compare[planid="+this+"]").addClass("hz-check-item-checked")})},command:{animateFly:function(a,b,c){var d="//img.huizecdn.com/hz/www/page/cart-flyer.png",e=$('<img class="u-flyer" src="'+d+'">').width(40).height(40),f=document.body.scrollTop||document.documentElement.scrollTop,g=a.offset().top-a.height()/2-f,h=a.offset().left+a.width()/2,i=b.offset().top+b.height()/2-f;e.fly({start:{left:h,top:g},end:{left:b.offset().left,top:i,width:0,height:0},onEnd:function(){"function"==typeof c&&c()}})}}};return e});