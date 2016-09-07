/**
 * Created by hz16032113 on 2016/6/24.
 */
define(['helper','jquery-tab',"underscore",'animate-fly',"require","layer"],function(helper,tab,_,fly,requireJs,layer){
    var ProductRank = {
        init : function(){
            this.render();
            this.initEvent();
        },
        data : {

        },
        render : function(){
            requireJs(["fixed-tool-float"], function(toolFloat) { // 加载工具条
                ProductRank.data.toolFloat=new toolFloat();
            });
            var  compareProducts = helper.cookie.getCookie("compareProducts");
            $(".hz-product-item").each(function(){
                if (compareProducts.indexOf(($(this).find(".add-compare").attr("planId") || $(this).find(".add-compare").attr("productId"))) > -1) {
                    $(this).find(".add-compare").addClass("hz-check-item-checked").find(".hz-check-text").html("已加入对比");
                }
            });
        },
        initEvent : function(){
            var
                localData = ProductRank.data,
                command = ProductRank.command;

            $(".js-rank-list").delegate(".add-compare","click",function(){
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
            },
        }
    };
    return ProductRank;
});