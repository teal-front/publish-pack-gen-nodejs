/**
 * 评论提交页.
 */
define(['jquery','layer','helper',"message"], function($,layer,helper,message) {
    var message = new Message();
    var comment = {
        init: function() {
            comment.initActions();
            requirejs(["fixed-tool-float"], function (toolFloat) {   // 加载工具条
                var tool = new toolFloat();
                window.toolFloat=tool;//暴露接口，兼容老版本
            });
        },
        initActions:function(){
            var _$parent,
                _$startCount;
            $("#ratestar div.hz-star").data("count",5);
            $("#ratestar").on("click","i",function(){//点击星星交互事件
                _$parent=$(this).parent();
                $(this).nextAll("i").removeClass("hz-star-icon-selected");
                $(this).prevAll("i").addClass("hz-star-icon-selected");
                $(this).addClass("hz-star-icon-selected");
                _$parent.data("count",$(".hz-star-icon-selected",_$parent).length)
            })
                .on("mouseover","i",function(){
                    $(this).nextAll("i").removeClass("hz-star-icon-selected");
                    $(this).prevAll("i").addClass("hz-star-icon-selected");
                    $(this).addClass("hz-star-icon-selected");
                })
                .on("mouseleave","div.hz-star",function(){
                    var _this,
                    _$startCount=$(this).data("count");
                    $("i",this).each(function(i){
                        _this=$(this);
                        if(_$startCount>=(i+1)){
                            _this.addClass("hz-star-icon-selected");
                        }else{
                            _this.removeClass("hz-star-icon-selected");
                        }
                    })
                });

            $("#postcomment").bind("click",function(){
                var commentText=$.trim($("#commentText").val());
                if(!commentText){
                    layer.msg("请填写评论内容");
                    return;
                }else if(commentText.length<5||commentText.length>500){
                    layer.msg("请填写5到500个字的评论");
                    return;
                }else{
                    var dataObj = {};
                    dataObj.ProductId = $("#productId").val();
                    dataObj.PlanId = $("#planId").val();
                    dataObj.AttitudeLevel=$("#server .hz-star-icon-selected").length;
                    dataObj.SpeedLevel=$("#speed .hz-star-icon-selected").length;
                    dataObj.DescLevel=$("#descri .hz-star-icon-selected").length;
                    dataObj.Content = commentText;
                    dataObj.InsureNum = $("#insureNum").val();
                    dataObj.CommentType =1;

                    message.show('正在提交...','loading');
                    helper.request.postData2({url:"/api/products/comments",data:dataObj}, function (data) {
                        if(data.result){
                            layer.msg("感谢您对产品的评价！");
                        }else{
                            layer.msg(data.message);
                        }
                        message.hide();
                    },function(data){
                        message.hide();
                        layer.msg(data.message);
                    });

                }
            });

        }
    };
    return comment;
});