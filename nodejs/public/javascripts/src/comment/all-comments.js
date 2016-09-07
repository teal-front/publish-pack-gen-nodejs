/**
 * 所有评论页.
 */
define(['jquery','kkpager','helper'], function($,layer,helper) {

    var allComment = {
        init: function() {
            var _totalCount=$(".hz-tab-menu-item.active").data("count"),
                _pages=Math.ceil(_totalCount/10),
                _productId=$("#productId").val();
            if(_pages!==0){//如果页数不等于则显示分页
                kkpager.generPageHtml({
                    pno: $("#pageIndex").val(),
                    total: Math.ceil(_totalCount/10),
                    totalRecords: _totalCount,
                    hrefFormer: 'showlist',
                    hrefLatter: '.html?type='+helper.url.getUrlVar("type"),
                    getLink: function (n) {
                        return this.hrefFormer+_productId+"-"+n+this.hrefLatter;
                    },
                    mode: "link",
                    isGoPage: false,
                    isShowTotalPage: false,
                    isShowCurrPage: false,
                    lang: {
                        firstPageText: '首页',
                        firstPageTipText: '首页',
                        lastPageText: '尾页',
                        lastPageTipText: '尾页',
                        prePageText: '上一页',
                        prePageTipText: '上一页',
                        nextPageText: '下一页',
                        nextPageTipText: '下一页'
                    }
                });
                kkpager.selectPage($("#pageIndex").val());
            }
            requirejs(["fixed-tool-float"], function (toolFloat) {   // 加载工具条
                var tool = new toolFloat();
                window.toolFloat=tool;//暴露接口，兼容老版本
            });

        },
        initActions:function(){

        }
    };
    return allComment;
});