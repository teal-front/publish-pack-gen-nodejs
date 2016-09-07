
define(['main','jquery', 'helper','underscore','message','layer'], function(global,$,helper,_,message,layer) {
    var message=new Message();
    var insureNum=helper.url.getUrlVar("insuranceNum");
    var protectItemhtml='<li class="hz-list-item"><span class="hz-list-title ell"><%=data.name%></span><p class="hz-list-content ell"><span class="pl10"><%= data.fullPremium%><%=(data.showUnit?data.showUnit:"")%></span></p></li>';
    var health={
        init:function(){
            message.show('正在加载...','loading');
            helper.request.getJson({url:"/api/insurance-slips/"+insureNum+"/health-inform"},function(data){
                message.hide()
                var insureData=data.result.insurance;
                         Duck.prototype.trialGenes=function (){
                           return JSON.parse(insureData.genesJson||"{}");
                         };
                        Duck.prototype.settingAnserJson=function(){
                          return JSON.parse(data.result.answer||"{}");
                        };
                        /**
                         健康告知成功跳转的页面
                         **/

                        Duck.prototype.pass = function(notifyAnswerId) {

                            //跳转购买
                            var url = '//is.huize.com/product/insure';
                            var insureNum=helper.url.getUrlVar("insuranceNum");
                            var productId =helper.url.getUrlVar("productId");
                            var planId =helper.url.getUrlVar("planId");
                            var trialGenesId = helper.url.getUrlVar("trialGenesId");
                            var preminum = helper.url.getUrlVar("preminum");
                            var productInfo = '-' + productId + '-' + planId;
                            var orderNO =helper.url.getUrlVar("orderNO");
                            var type = helper.url.getUrlVar("type");
                            var payUrl =helper.url.getUrlVar("payUrl");
                            var qhSuccessUrl = "//lf.huize.com/Appointment/QHSuccess";
                            var qhReservationUrl = "//lf.huize.com/Appointment/QHReservation";
                            if(orderNO && type && payUrl){
                                //转向支付页面
                                if (type == 1) {
                                    if (payUrl.indexOf("?") != -1) {
                                        payUrl += "&";
                                    } else {
                                        payUrl += "?";
                                    }
                                    window.location.href = payUrl;
                                } else if (type == 2) {

                                } else if (type == 3) { //聚米

                                }
                            }else{
                                //转向投保页面
                                var resultUrl = url+"?insureNumber="+insureNum + "&DProtectPlanId="+planId;
                                location.href=resultUrl;
                            }

                        }
                        Duck.prototype.nopass = function(notifyAnswerId) {
                            var planId =helper.url.getUrlVar("planId");
                            var insureNum=helper.url.getUrlVar("insuranceNum");

                            layer.alert("您的健康告知不符合保险公司的审核标准，无法提交保单。建议您联系我们的专业顾问协助您处理！",{
                                btn : ["预约顾问"]
                            },function(){
                                window.location.href = "http://www.huize.com/baoxianyuyue?planid=" + planId + "&oppName=健康告知不通过&insureNum="+insureNum+"&notifyAnswerId=" + notifyAnswerId;
                            });
                            $(".layui-layer-btn0").removeClass("layui-layer-btn0").addClass("layui-layer-btn1");
                        }
                        Duck.prototype.postNotifyAnswer = function () {
                            var notifyAnswerId=0;
                            helper.request.postData3({url:"/api/insurance-slips/"+insureNum+"/health-inform",data:this.getHealthOld(),async:false},function(data){
                                notifyAnswerId=data.result;
                            });
                            return notifyAnswerId;
                        }

                $("#companyLogoUrl").attr("src",insureData.companyLogo);
                $("#productName").html(insureData.productName + " " + (insureData.planName || "")).attr("href","http://www.huize.com/product/detail-" + insureData.productId + ".html?DProtectPlanId="+insureData.planId);
                var _ruleData= JSON.parse(insureData.genesJson) ,
                    protectTrialItemList =helper.utils.marginProtectList(insureData.restrictRule.protectTrialItemList),
                    _protectHtml=[],
                    _restrictRule=insureData.restrictRule;
                $.each(protectTrialItemList,function(index,item){
                    var newValue = ((_.find(_ruleData,function(key){
                        return key.protectItemId == item.relateCoverageId;
                    })) || {}).value || "";
                    item.fullPremium = item.fullPremium ? item.fullPremium : newValue;
                    _protectHtml.push(_.template(protectItemhtml)({data:item}));
                });
                $("#protectList").html(_protectHtml.join(""));
                if(protectTrialItemList.length > 6){
                    $(".protect-list-box").css({
                        "overflow" : "hidden",
                        "overflow-y" : "auto",
                        "height" : "166px"
                    })
                }
                $("#price").html((_restrictRule.trialPrice.vipPrice/insureData.totalNum/100).toFixed(2));
                $("#count").html(insureData.totalNum);
                var
                    paymentType = (_.find(_ruleData,function(item){return item.key === "paymentType"}) || {}).value,
                    ageLimit = (_.find(_ruleData,function(item){return item.key === "insureAgeLimit"}) || {}).value;
                paymentType !== undefined && $("#paymentType").html(paymentType + (ageLimit !== undefined ? "," + ageLimit : "")).siblings("[for='paymentType']").show();
                $("#protectYear").html((_.find(_ruleData,function(item){return item.key === "insurantDateLimit"}) || {}).value);
                $("#totalPrice").html((_restrictRule.trialPrice.vipPrice/100).toFixed(2));
                $(".insure-step-secondary").show();
                init();
            });


        }
    }
    return health;
});
