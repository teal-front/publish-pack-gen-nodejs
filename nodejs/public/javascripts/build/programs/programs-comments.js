/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["require","kkpager"],function(a){var b={init:function(){this.initData(),this.render()},initData:function(){this.data.pageIndex=(paginationData||{}).pageIndex||0,this.data.pageCount=(paginationData||{}).paginaion.total||0,this.data.projectId=(paginationData||{}).projectId||0},data:{projectId:101,pageIndex:0},render:function(){var c=b.data.pageCount,d=Math.ceil(c/10);0!==d&&(kkpager.generPageHtml({pno:$("#pageIndex").val(),total:Math.ceil(c/10),totalRecords:c,getLink:function(a){return"/guihua/comment/p"+b.data.projectId+"?pageIndex="+a},mode:"link",isGoPage:!1,isShowTotalPage:!1,isShowCurrPage:!1,lang:{firstPageText:"首页",firstPageTipText:"首页",lastPageText:"尾页",lastPageTipText:"尾页",prePageText:"上一页",prePageTipText:"上一页",nextPageText:"下一页",nextPageTipText:"下一页"}}),kkpager.selectPage(b.data.pageIndex)),a(["fixed-tool-float"],function(a){b.toolFloat=new a})}};return b});