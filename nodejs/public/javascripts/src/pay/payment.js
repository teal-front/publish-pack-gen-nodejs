/**
 * Created by hz16032113 on 2016/4/7.
 */
define(['jquery-tab','layer','helper'],function(tab,layer,helper){
    "use strict";
    var Payment = {
        init : function(){
            this.initData();
            this.render();
            this.initEvents();//页面事件初始化
        },
        render : function(){
            $("#kfLink").attr("href","http://kefu.hzins.com/chat?domain=hzins&businessType=Xm4FWr0dncw&referrer="  + encodeURIComponent(window.location.href));
            layer.alert2 = function(){
                layer.alert.apply(this,arguments);
                $(".layui-layer-btn0").removeClass("layui-layer-btn0").addClass("layui-layer-btn1");
            }
        },
        initData : function(){
            var
                localData = this.data,
                orderData = window.pageData || {};//订单数据，页面中获取
            localData.orderNum = orderData.orderNum || "";
            localData.totalBuyPrice = orderData.totalBuyPrice || 0;
            localData.totalDiscount = orderData.totalDiscount || 0;
            localData.totalPayable = orderData.totalPayableAmount || 0;
            //上一次的支付方式
            localData.gatewayId = (orderData.gateways || {}).lastGatewayCode || "";
            localData.bankId = (orderData.gateways || {}).lastBankId || "";
        },
        data : {
            orderNum : "",//订单Id
            totalBuyPrice : 0, //订单总支付价
            totalDiscount : 0,//订单总折扣（满减折扣）
            totalPayable : 0,//订单应付金额(网关支付金额)
            gatewayId : "",//网关Id
            gatewayName : "",
            bankId : "", //银行Id
            wxTimer : null //微信支付状态轮询定时器
        },
        initEvents : function(){
            $("#toggleProductDetail").click(function(){//查看产品详情
                $(this).toggleClass("show-detail");
                $(".checkout-product-dropdown").toggle();
            });

            $("#payTypeMenu").tab("#payTypeContent",{//支付方式切换
                titleCurrent: 'active',
                contentCurrent: 'show'
            });
            $("#payTypeContent .hz-radio-item").click(function(){//支付方式选择
                Payment.command.paymentTypeSelect.call(this);
            });
            $("#submitGatewayPayment").click(function(){//提交网关支付
                if(Payment.data.gatewayId === 21){//微信支付轮询支付结果
                    Payment.command.pollingPaymentStatus();
                }
                if(Payment.data.gatewayId !== 21){
                    Payment.data.newWindow = window.open();
                }
                Payment.command.submitGatewayPayment.call(this,function(data){
                    if(Payment.data.gatewayId === 21){
                        if(!data.result){
                            layer.msg("获取不到二维码");
                        }
                        setTimeout(function(){
                            $("#wechatPayment .qr-code-img").attr("src",data.result);
                            layer.open({
                                type: 1,
                                title: false,
                                area: '870px',
                                content: $('#wechatPayment')
                            });
                        },300);
                        return ;
                    }
                    if(Payment.data.wxTimer){
                        clearInterval(Payment.data.wxTimer);
                        Payment.data.wxTimer = null;
                    }
                    if(data.result !== ""){
                        $("#gatewayName").text(Payment.data.gatewayName);
                        layer.open({
                            type: 1,
                            title: false,
                            area: '870px',
                            shadeClose: true, //点击遮罩关闭
                            content: $('#paymentHelp')
                        });
                        Payment.data.newWindow.location.href ="/orders/payment-transfer?id=" + data.result;
                    }
                    else{
                        layer.msg("支付失败");
                        if(Payment.data.newWindow){
                            Payment.data.newWindow.close();
                        }
                    }
                });
            });
            $(".other-payment-type").click(function(){//其它支付方式
                $(this).closest(".layui-layer").find(".layui-layer-close").trigger("click");
            });
            $("#morePaymentType").click(function(){//更改支付方式
                $("#allPaymentType").show();
                $("#lastPaymentType").hide();
            });
            $("#completedPayment").click(function(){//已完成支付
                Payment.command.getPaymentStatus(function(status){
                   switch(status){
                       case 1 :
                           layer.msg("未支付");
                           break;
                       case 2 :
                           layer.msg("付款中");
                           break;
                       case 3 :
                           layer.msg("支付失败");
                           break;
                       case 4 :
                           window.location.href = "/orders/payment-success?orderNum=" + Payment.data.orderNum;
                           break;
                       case 5 :
                           layer.msg("已取消");
                           break;
                       case 10 :
                           layer.msg("已删除");
                           break;
                       default:
                           layer.msg("未支付");
                           break;
                   }
                   window.setTimeout(function(){
                       window.location.reload();
                   },1000);
                });
            });
            $("#otherPaymentType").click(function(){//更改支付方式
                Payment.command.getPaymentStatus(function(status){
                    if(status === 4){
                        window.location.href = "/orders/payment-success?orderNum=" + Payment.data.orderNum;
                    }
                    else{
                        window.location.reload();
                    }
                });
            });
            $(".help-link").click(function(){
                $(".payment-help").toggle();
                $(this).toggleClass("show-detail");
            });
        },
        command : {
            paymentTypeSelect : function(){
                var
                    isCheck = $(this).data("checked"),
                    gatewayId = "",
                    bankId = "",
                    localData = Payment.data;
                if(isCheck !== true){
                    $("#payTypeContent .hz-radio-item").data("checked",false).removeClass("hz-radio-item-checked");
                    $(this).data("checked",true).addClass("hz-radio-item-checked");
                    gatewayId = $(this).data("gateway-code");
                    bankId = $(this).data("bankid");
                    gatewayId = bankId !== undefined ? 1 : gatewayId;
                    localData.gatewayId = gatewayId;
                    localData.gatewayName = $(this).find("img").attr("alt");
                    localData.bankId  = bankId || "";
                }

            },
            submitGatewayPayment : function(func){
                var
                    localData = Payment.data;
                if(localData.submitLocked){
                    return;
                }
                localData.submitLocked = true;
                if(localData.gatewayId === ""){
                    layer.msg("请选择支付方式");
                    return ;
                }
                var
                    request = {
                        url : "/api/orders/payment/gateway",
                        data : {
                            orderNum : localData.orderNum ,
                            totalBuyPrice : localData.totalBuyPrice,
                            totalDiscount : localData.totalDiscount,
                            totalPayable : localData.totalPayable,
                            gatewayId : localData.gatewayId
                        },
                        async : false
                    },
                    successCallback = function(data){
                        typeof func === "function" && func(data);
                        localData.submitLocked = false;
                    },
                    failCallback = function(data){
                        if(Payment.data.newWindow){
                            Payment.data.newWindow.close();
                        }
                        localData.submitLocked = false;
                        var
                            errorCode = data.status,
                            message = data.message || "系统错误，无法提交",
                            orderNum = localData.orderNum;

                        if(errorCode){
                            switch (errorCode){
                                case "00001":
                                    requirejs(["sign-float"], function (signFloat) {
                                        var sign = new signFloat({returnUrl: location.href, showRegister: true,callback:function(data){//登录成功回调
                                            location.reload();
                                        }});
                                    });
                                    break;
                                case 10253:
                                case 10401:
                                case 36057:
                                case 10311:
                                case 37111:
                                case 10602:
                                case 10276 :
                                case 10254:
                                case 5:
                                case 4:
                                    layer.alert2(message,{
                                        btn : ["知道了"]
                                    },function(){
                                        var
                                            request = {
                                                url : "/api/orders/" + localData.orderNum,
                                                type : "PUT",
                                                success : function(){
                                                     window.location.href = "http://i.huize.com/";
                                                }
                                            };
                                        $.ajax(request);
                                    });
                                    break;
                                case 10260:
                                    layer.confirm('<div class="pt45 pb45 tac">' + message + '</div>' || "系统错误",{
                                        title:false,
                                        btn : ["知道了"]
                                    },function(index){
                                        window.location.reload();
                                        layer.close(index);
                                    });
                                    break;
                                case 37115:
                                case 37120:
                                    layer.confirm(
                                        '<div class="pt45 pb45 tac">'+message+'</div>',
                                        {
                                            btn : ["查看订单","联系客服"],
                                            title: false,
                                            area : "530px"
                                        },function(e){
                                            layer.close(e);
                                            var transferWindow = window.open('about:blank');
                                            transferWindow.location.href = "http://i.huize.com/Order/Detail?orderNum=" + localData.orderNum;
                                        },function(e){
                                            var transferWindow = window.open('about:blank');
                                            transferWindow.location.href = "http://kefu.hzins.com/chat?domain=hzins&businessType=Xm4FWr0dncw&referrer="  + encodeURIComponent(window.location.href)
                                            layer.close(e);
                                        });
                                    break;
                                case 10003:
                                    layer.confirm(
                                        '<div class="pt45 pb45 tac">'+message+'</div>'
                                        ,{
                                            btn : ["取消","确认"],
                                            title: false,
                                            area : "530px"
                                        },function(e){
                                            layer.close(e);
                                        },function(e){
                                            window.location.href = "http://passport.huize.com/SignIn/Quit?returnurl=" + window.location.href;
                                            layer.close(e);
                                        });
                                    break;
                                default :
                                    layer.confirm('<div class="pt45 pb45 tac">' + message + '</div>' || "系统错误",{
                                        title:false,
                                        btn : ["知道了"]
                                    },function(index){
                                        var
                                            request = {
                                                url : "/api/orders/" + localData.orderNum,
                                                type : "PUT",
                                                success : function(){
                                                    window.location.href = "http://i.huize.com/";
                                                }
                                            };
                                        $.ajax(request);
                                        layer.close(index);
                                    });
                                    break;
                            }
                            return ;
                        }

                    };
                localData.bankId !== "" && (request.data.bankId = localData.bankId);
                helper.request.postData2(request,successCallback,failCallback);
            },
            getPaymentStatus : function(func){
                var
                    request = {
                        url : "/api/orders/" + Payment.data.orderNum + "/detail"
                    },
                    callback = function(data){
                        func(data.result.status || 1);
                    };
                helper.request.getJson(request,callback);
            },
            pollingPaymentStatus : function(){
                var localData = Payment.data;
                if(localData.wxTimer !== null){
                    return;
                }
                localData.wxTimer = window.setInterval(function(){
                    Payment.command.getPaymentStatus(function(status){
                        switch(status){
                            case 3 :
                                layer.msg("支付失败");
                                break;
                            case 4 :
                                window.location.href = "/orders/payment-success?orderNum=" + Payment.data.orderNum;
                                break;
                            case 5 :
                                layer.msg("已取消");
                                break;
                            case 10 :
                                layer.msg("已删除");
                                break;
                        }
                    });
                },1000);
            }
        }
    }
    return Payment;
})