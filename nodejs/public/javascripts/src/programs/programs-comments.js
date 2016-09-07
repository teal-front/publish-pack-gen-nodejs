/**
 * Created by hz16032113 on 2016/6/28.
 */
define(['require','kkpager'],function(requireJs){
    var Comments = {
        init : function(){
            this.initData();
            this.render();
        },
        initData : function(){
            this.data.pageIndex = (paginationData || {}).pageIndex || 0;
            this.data.pageCount = ((paginationData || {}).paginaion).total || 0;
            this.data.projectId = (paginationData || {}).projectId || 0;
        },
        data : {
            projectId : 101,
            pageIndex : 0
        },
        render : function(){
            var _totalCount= Comments.data.pageCount,
                _pages=Math.ceil(_totalCount/10);
            if(_pages!==0){//如果页数不等于则显示分页
                kkpager.generPageHtml({
                    pno: $("#pageIndex").val(),
                    total: Math.ceil(_totalCount/10),
                    totalRecords: _totalCount,
                    getLink: function (n) {
                        return "/guihua/comment/p"+ Comments.data.projectId +"?pageIndex=" + n;
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
                kkpager.selectPage(Comments.data.pageIndex);
            }
            requireJs(["fixed-tool-float"], function(toolFloat) { // 加载工具条
                Comments.toolFloat=new toolFloat();
            });
        }
    };
    return Comments;
});