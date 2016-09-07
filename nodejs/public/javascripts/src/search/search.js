/**
 * Created by hz16032113 on 2016/6/29.
 */
define(['helper','animate-fly','require','kkpager'],function(helper,fly,requireJs){
    var Search = {
        init : function(){
            this.initData();
            this.render();
            this.initEvent();
        },
        data : {
            searchData : {}
        },
        initData : function(){
            //this.data.searchData = searchData ;
        },
        render : function(){
            $("#kfLink").attr("href","http://kefu.hzins.com/chat?domain=hzins&businessType=Xm4FWr0dncw&referrer="  + encodeURIComponent(window.location.href));
            $(".select-column").each(function(){
                var $column = $(this);
                if($column.find(".js-select-content").height() > 33){
                    var $moreBtn = $('<a class="select-toggle" href="javascript:;"><span>更多</span> <i class="iconfont"></i></a>').click(function(){
                        $column.find(".select-list").toggleClass("select-list-open");
                        $(this).toggleClass("show-more").find("span").text($(this).hasClass("show-more") ? "隐藏" : "更多");
                    });
                    $column.append($moreBtn);
                }
            });
            requireJs(["fixed-tool-float"], function(toolFloat) { // 加载工具条
                Search.data.toolFloat=new toolFloat();
            });
            var  compareProducts = helper.cookie.getCookie("compareProducts");
            $(".hz-product-item").each(function(i){
                if (compareProducts.indexOf(($(this).find(".add-compare").attr("planId") || $(this).find(".add-compare").attr("productId"))) > -1) {
                    $(this).find(".add-compare").addClass("hz-check-item-checked").find(".hz-check-text").html("已加入对比");
                }
            });

            var _totalCount = $("#totalCount").val() || 0;
            kkpager.generPageHtml({
                pno: $("#pageIndex").val(),
                total: Math.ceil(_totalCount/10),
                totalRecords: _totalCount,
                getLink: function (n) {
                    var href = window.location.href;
                    href = href.replace(/p-(\d+)/,"p-"+n);
                    return href;
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
            kkpager.selectPage(+$("#pageNo").val() + 1 || 1);
        },
        initEvent : function(){
            var
                localData = Search.data,
                command = Search.command;
            $(".select-tag .select-close-btn").click(function(){
                $(this).parent().remove();
            });
            $(".select-item").click(function(){

            });
            $(".hz-product-list").delegate(".add-compare","click",function(){
                var $this = $(this);
                if($(this).hasClass("hz-check-item-checked")) {
                    $(this).removeClass("hz-check-item-checked");
                    localData.toolFloat.delcomparePro($(this).attr("planId") || $(this).attr("productId"));
                    $(this).find(".hz-check-text").text("加入对比");
                }else{
                    if(localData.toolFloat.getCompareCount()>= 4){//获取当前对比数量
                        layer.msg("对比数目最大不能超过4个");
                        return;
                    };
                    $(this).addClass("hz-check-item-checked");
                    $("#addToCompare .hz-check-text").html("已加入对比");
                    $("#fixedsidetool").css("right",0);
                    $("#wrapToolMenu").css("left",0);
                    command.animateFly($(this),$("#compareCount"),function(){
                        localData.toolFloat.addcomparePro($this.attr("planId") || $this.attr("productId"));
                    });
                }
            });
            //右侧选项卡切换
            $(".tab-ranking li").mouseover(function(){
                var index = $(this).index();
                $(this).addClass("active").siblings("li").removeClass("active");
                $(".ranking-container .tab-pane").eq(index).addClass("fn-show").siblings(".tab-pane").removeClass("fn-show");
            });
        },
        command : {
            animateFly : function(startEl,endEl,callback){
                var
                    img = "//img.huizecdn.com/hz/www/page/cart-flyer.png",
                    flyer = $('<img class="u-flyer" src="'+img+'">').width(40).height(40),
                    bodyScrollTop = document.body.scrollTop || document.documentElement.scrollTop,
                    startTop = startEl.offset().top - startEl.height() / 2 - bodyScrollTop,
                    startLeft = startEl.offset().left + startEl.width() / 2,
                    endTop = endEl.offset().top + endEl.height() / 2 - bodyScrollTop;
                flyer.fly({
                    start: {
                        left: startLeft, //开始位置（必填）#fly元素会被设置成position: fixed
                        top: startTop //开始位置（必填）
                    },
                    end: {
                        left: endEl.offset().left, //结束位置（必填）
                        top: endTop, //结束位置（必填）
                        width: 0, //结束时宽度
                        height: 0 //结束时高度
                    },
                    onEnd: function(){ //结束回调
                        typeof callback === "function" &&  callback();
                    }
                });
            }
        }
    };
    return Search;
});