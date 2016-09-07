/**
 * Created by hz16032113 on 2016/5/12.
 */
define(['helper','message'],function(helper,Message){
    "use strict";
    var Process = {
        init : function(){
            this.initData();
            this.command.message = new Message();
            this.command.pollingPaymentStatus();
        },
        initData : function(){
            this.data.orderNum = window.orderNum || "";
            this.data.paymentReceiptNum = window.paymentReceiptNum || "";
            this.data.transactionNum = window.transactionNum || "";
        },
        data : {
            orderNum : "",
            paymentReceiptNum : "",
            transactionNum : ""
        },
        command : {
            message : {},
            pollingPaymentStatus : function(){
                var
                    localData = Process.data,
                    orderNum = localData.orderNum,
                    paymentReceiptNum = localData.paymentReceiptNum,
                    transactionNum = localData.transactionNum;
                if(!orderNum || !paymentReceiptNum || !transactionNum){
                    return;
                }
                Process.command.message.show("正在跳转...","loading");
                var
                    result = {
                        url : "/api/orders/" + orderNum + "/payment/status?paymentReceiptNum",
                        data : {
                            paymentReceiptNum : paymentReceiptNum,
                            bsId : transactionNum
                        }
                    },
                    callback = function(data){
                        var status = (data.result || {}).status || 1;
                        switch(status){
                            case 0 :
                                break;
                            case 1 :
                                window.location.href = "/orders/payment-success?orderNum=" + orderNum;
                                break;
                            case -1 :
                                window.location.href = "/orders/payment-fail?orderNum=" + orderNum;
                                break;
                        }
                    };
                window.setInterval(function(){
                    helper.request.getJson(result,callback);
                },1000);
            }
        }
    };
    return Process;
});