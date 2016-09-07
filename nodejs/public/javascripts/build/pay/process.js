/**
 ** 
 ** www.huize.com; 
 ** Version:0.1.0;
 ** Last Updated:2016-08-09; 
 **
 **/
define(["helper","message"],function(a,b){"use strict";var c={init:function(){this.initData(),this.command.message=new b,this.command.pollingPaymentStatus()},initData:function(){this.data.orderNum=window.orderNum||"",this.data.paymentReceiptNum=window.paymentReceiptNum||"",this.data.transactionNum=window.transactionNum||""},data:{orderNum:"",paymentReceiptNum:"",transactionNum:""},command:{message:{},pollingPaymentStatus:function(){var b=c.data,d=b.orderNum,e=b.paymentReceiptNum,f=b.transactionNum;if(d&&e&&f){c.command.message.show("正在跳转...","loading");var g={url:"/api/orders/"+d+"/payment/status?paymentReceiptNum",data:{paymentReceiptNum:e,bsId:f}},h=function(a){var b=(a.result||{}).status||1;switch(b){case 0:break;case 1:window.location.href="/orders/payment-success?orderNum="+d;break;case-1:window.location.href="/orders/payment-fail?orderNum="+d}};window.setInterval(function(){a.request.getJson(g,h)},1e3)}}}};return c});