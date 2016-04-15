/**
 * 所有评论页.
 */
define(['jquery','kkpager','helper'], function($,layer,helper) {

    var allComment = {
        init: function() {
            var pages=Math.ceil($("#total").val()/10);
            if(pages===0){//如果页数不等于则显示分页
                kkpager.generPageHtml({
                    pno: $("#pageIndex").val(),
                    total: Math.ceil($("#total").val()/10),
                    totalRecords: ~~$("#total").val(),
                    hrefFormer: 'showlist',
                    hrefLatter: '.html?type='+helper.url.getUrlVar("type"),
                    getLink: function (n) {
                        return this.hrefFormer+"239"+"-"+n+this.hrefLatter;
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
                kkpager.selectPage($("pageIndex").val());
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