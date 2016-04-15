/**
 * 右侧浮层
 */
define(["jquery","underscore","exports","require","module","helper","layer"],function($,_,exports,require,module,helper,layer) {
    "use strict";
    var isLogin=false;
    var ToolFloat = function () {
        ToolFloat.prototype.init.apply(this, arguments);
    };
    ToolFloat.prototype = {
        init: function (config) {
            var _self = this;
            this.config = config;
            require(["require-text!/html/product/fixed-tool-float.html"], function (html) {
                $("body").append(html);
                _self.initAction();
               var compareProducts=helper.cookie.getCookie("compareProducts");

                $("#compareCount").html((compareProducts.split(":").length-1)+"/"+4);
                helper.state.checkLogin(function(result){
                    isLogin=result.result;
                    if(!isLogin){
                        var insureNumstr=helper.cookie.getCookie("InsureNums");
                        if(insureNumstr) {
                            $("#carItemCount").html(insureNumstr.split(",").length);
                        }else{
                            $("#carItemCount").html(0);
                        }
                    }
                    else{
                        helper.request.getJson({url:"/shopping-cart/items/count"},function(result){
                            $("#carItemCount").html(result.result);
                        });
                    }
                });

            });
        },
        initAction: function () {//交互JS
            var _this=this;
            var context = $("#fixedsidetool");
            var toolPanel = $("#toolPanel", context);
            var title = $("#panelTitle", context);
            var comparaerPanel = $(".comparer-product-box", context);
            var carPanel = $(".cart-product-box", context);
            $("#showCarBtn", context).bind("click", function () {//购物车面板切换
                toolPanel.show();
                $(".comparer-item", context).addClass("fn-hide");
                $(".car-item", context).removeClass("fn-hide");
                $("#feedCallback").addClass("fn-hide");

                helper.state.checkLogin(function(result){
                    isLogin=result.result;
                    if(isLogin){
                        $("#loginBtn").addClass("fn-hide");
                    }
                    else{
                        $("#loginBtn").bind("click",function(){
                            requirejs(["sign-float"], function (signFloat) {
                                var sign = new signFloat({returnUrl: location.href, showRegister: false,callback:function(data){//登录成功回调
                                    location.reload();
                                }});
                            });
                        });
                    }
                });
                    helper.request.getJson({url:"/shopping-cart/list"},function(data){
                        var result=data.result;
                        $("#shopcarList").html(_.template($("#shopcarhtml").html())({datas:result}));
                        $("#failList").html(_.template($("#failItems").html())({datas:result}));
                        if($("#failList li").length>0){
                            $("#failList").parent().removeClass("fn-hide");
                        }
                        var preArray=[];
                        $("#shopcarList li").each(function(item,index){
                           preArray.push({insuranceNum:$(this).attr("insureNum"),premium:$(this).attr("premium")});
                        });
                        helper.request.postData2({url:"/insurance-slips/amount/choosed",data:preArray},function(result){
                            if(result.result){
                                $("#totalPrice").html(result.result.totalPremium-result.result.totalDiscount);
                            }
                        });

                        $("#productCount").html($("#shopcarList li").length+$("#failList li").length);
                        $("#shopcarList").delegate(".delbtn","click",function(){
                            var _this=this
                            layer.confirm('您确定要删除该保单吗？', {//弹出弹窗让用户确认是否删除投保单号
                                btn: ['取消','确定'],
                                title:"提示"
                            }, function(){
                                layer.closeAll();
                            }, function(){
                                if(isLogin){//判断是否登陆 ，已登录从浏览器删除，未登录从cookie删除
                                    helper.request.postData({url:"/shopping-cart/items?insuranceNum="+$(self).attr("pid"),method:"DELETE",data:{insureNum:$(self).attr("pid"),userId:$(self).attr("userid")}},function(result){
                                        if(result.result){
                                            layer.msg("删除成功");
                                        }else{
                                            layer.msg("删除失败");
                                        }
                                    });
                                }else{
                                    var insureNumstr=helper.cookie.getCookie("InsureNums");
                                    var pid=$(_this).attr("pid");
                                    helper.cookie.setCookie("InsureNums",insureNumstr.replace(pid+",","").replace(pid,""));
                                    layer.msg("删除成功");
                                }
                            });
                        });
                    });


                title.html("购物车");
            });
            $("#showProductBtn", context).bind("click", function () {//显示对比面板
                toolPanel.show();
                $(".comparer-item", context).removeClass("fn-hide");
                $(".car-item", context).addClass("fn-hide");
                $("#feedCallback").addClass("fn-hide");
                title.html("产品对比");
            });
            $("#toPay").bind("click",function(){
               location.href="/shopping-cart/";
            });

            $("#fixedsidetool .tool-function-item").bind("mouseover", function () {//二维码切换
                $(this).addClass("side-tool-current");
            });

            $("#fixedsidetool .tool-function-item").bind("mouseout", function () {//二维码切换
                $(this).removeClass("side-tool-current");
            });



            $(".side-tool-back", context).bind("click", function () {
                toolPanel.hide();
            });

            $("#feedBtn", context).bind("click", function () {//反馈面板切换
                toolPanel.show();
                $(".comparer-item", context).addClass("fn-hide");
                $(".car-item", context).addClass("fn-hide");
                $("#feedCallback").removeClass("fn-hide");
            });

            $("#feedCall",context).bind("click",function(){//提交反馈
                var _this=this;
                if($(this).attr("posting")){
                    return;
                }
                $(this).attr("posting","true");
                $(this).html("正在提交......");
                var feedText=$(".side-tool-feedback-area").val();
                var isSatFix=$(".hz-radio-item .hz-radio-item-checked").attr("satfix");
                if($.trim(feedText)){
                   helper.request.getCrossJson({url:"/Feedback/AddFeedback",data:{createTime:helper.dateHelper.formatDate("yyyy-MM-dd hh:mm:ss",new Date()),addressUrl:location.href,isSatisfied:isSatFix,title:feedText}},function(result){
                       if(result.IsSuccess){
                           $("#feedCallback .error-msg").addClass("fn-hide");
                           layer.msg("提交成功")
                       }else{
                           $("#feedCallback .error-msg").removeClass("fn-hide");
                           $("#feedCallback .error-msg").html(result.Message);
                       }
                       $(this).removeAttribute("posting");
                       $(_this).html("提交");
                   });
                }
            });

            $(".side-tool-feedback-area").keyup(function(){//记录字数
                var charCount= $.trim($(this).val()).length;
                $("#charCount").html(charCount);
            });

            $("#feedCallback").delegate(".hz-radio-item","click",function(){
                $("#feedCallback .hz-radio-item").removeClass("hz-radio-item-checked");
                $(this).addClass("hz-radio-item-checked");
            });

            $("#fixedsidetool #kefu").click(function (evt) {//弹出客服窗口
                window.open("http://kefu.hzins.com/chat?domain=hzins&businessType=Xm4FWr0dncw&referrer=" + encodeURIComponent(window.location.href), "kefu", "toolbar=no,location=no,directories=no,resizable=yes,status=yes,menubar=no,scrollbars=yes,width=800,height=600,left=0,top=0");
            });
        },
        loadComparePro:function(){//更新界面
            var comparePlan=helper.cookie.getCookie("compareProducts");
            var planIds=comparePlan.split(":");
            var ids=[];
            for(var i=0;i<planIds.length;i++){
                if(planIds[i]) {
                    ids.push(~~planIds[i]);
                }
            }
            helper.request.postData({url:"/products/plans/list",data:ids},function(result){
                $("#comparePanel").html(_.template($("#comparehtml").html())({datas:result.result}));
            });
        },
        initComparePro:function(){//初始化对比按钮是否选中
            var comparePlan=helper.cookie.getCookie("compareProducts");

        },
        delcomparePro:function(id){//对比cookie操作
            var comparePlan=helper.cookie.getCookie("compareProducts");
            if(comparePlan.indexOf("|")>-1){//清除老网站对比cookie
                comparePlan="";
            }
            if(comparePlan.indexOf(id+":")>-1){
                comparePlan=comparePlan.replace(id+":","");

            }
            helper.cookie.setCookie("compareProducts",comparePlan);
            toolFloat.loadComparePro();
        },

        addcomparePro:function(id){
            var comparePlan=helper.cookie.getCookie("compareProducts");
            if(comparePlan.indexOf("|")>-1){
                comparePlan="";
            }
            if(comparePlan.indexOf(id+":")===-1){
                comparePlan=comparePlan+id+":";
            }
            helper.cookie.setCookie("compareProducts",comparePlan);
            toolFloat.loadComparePro();
        }
    };
    module.exports = ToolFloat;
});