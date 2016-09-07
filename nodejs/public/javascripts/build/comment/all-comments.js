/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["jquery","kkpager","helper"],function($,a,b){var c={init:function(){var a=$(".hz-tab-menu-item.active").data("count"),c=Math.ceil(a/10),d=$("#productId").val();0!==c&&(kkpager.generPageHtml({pno:$("#pageIndex").val(),total:Math.ceil(a/10),totalRecords:a,hrefFormer:"showlist",hrefLatter:".html?type="+b.url.getUrlVar("type"),getLink:function(a){return this.hrefFormer+d+"-"+a+this.hrefLatter},mode:"link",isGoPage:!1,isShowTotalPage:!1,isShowCurrPage:!1,lang:{firstPageText:"首页",firstPageTipText:"首页",lastPageText:"尾页",lastPageTipText:"尾页",prePageText:"上一页",prePageTipText:"上一页",nextPageText:"下一页",nextPageTipText:"下一页"}}),kkpager.selectPage($("#pageIndex").val())),requirejs(["fixed-tool-float"],function(a){var b=new a;window.toolFloat=b})},initActions:function(){}};return c});