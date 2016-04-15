/**
 * 评论提交页.
 */
define(['jquery','layer','helper'], function($,layer,helper) {

    var comment = {
        init: function() {
            comment.initActions();
            requirejs(["fixed-tool-float"], function (toolFloat) {   // 加载工具条
                var tool = new toolFloat();
                window.toolFloat=tool;//暴露接口，兼容老版本
            });
        },
        initActions:function(){
            $("#ratestar").delegate("i","click",function(){//点击星星交互事件
                $(this).nextAll("i").removeClass("hz-star-icon-selected");
                $(this).prevAll("i").addClass("hz-star-icon-selected");
                $(this).addClass("hz-star-icon-selected");
            });
            var isSubmiting=false;
            $("#postcomment").bind("click",function(){
                if(isSubmiting){
                    return;
                }
                var commentText=$.trim($("#commentText").val());
                if(!commentText){
                    layer.msg("请填写评论内容");
                }else if(commentText.length<5||commentText.length>500){
                    layer.msg("请填写5到500个字的评论");
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

                    isSubmiting = true;
                    helper.request.postData({url:"//www.huize.com/Comment/AddReview",data:dataObj}, function (data) {
                        if(data.IsSuccess){
                            layer.msg("发布成功");
                        }else{
                            layer.msg(data.Message);
                        }
                        isSubmiting=false;
                    });

                }
            });

        }
    };
    return comment;
});