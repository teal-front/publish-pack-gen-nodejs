/**
 * Created by hz16032113 on 2016/4/12.
 */
define(['layer','helper',"underscore","jquery-prompt",'message',],function(layer,helper,_,prompt,Message){
    var Settlement = {
        init : function(){
            this.initData();
            this.render();
            this.initEvent();
        },
        render : function(){
            layer.alert2 = function(){
                layer.alert.apply(this,arguments);
                $(".layui-layer-btn0").removeClass("layui-layer-btn0").addClass("layui-layer-btn1");
            }
            this.command.initExceptions();
            var localData = this.data;
            var $goldBean = $("#beanPay").closest(".confirm-order-operate-item"); //绑定金豆
            this.command.bindBalanceBeanAmount.call($goldBean,3,true);

            var $balance = $("#balancePay").closest(".confirm-order-operate-item"); //绑定余额
            this.command.bindBalanceBeanAmount.call($balance,1,true);

            if(localData.frozenAmount.redEnvelope.length === 0 && localData.ableAmount.redEnvelope.length === 0){//如果本单没有红包
                //$(".red-envelope-pay i[rel='prompt']").prompt();
            }
            //是否显示寄送费
            $("#shipPayment")[this.data.isShowShipAddress && this.data.totalPremium < 30000 ? "show" : "hide"]();
            $("#sendMessage")[this.data.isShowShipAddress ? "show" : "hide"]();
            this.command.bindTotalPremium();//计算应付金额
            this.command.message = new Message();
            this.data.submitLocked = false;//锁住提交按钮
            //this.command.initPaymentCombination();
        },
        initData : function(){
            var localData = this.data;
            $("#insureList tr[data-insurenum]").each(function(){//缓存投保单号
                var policyType = $(this).find("[data-policy-selected]").data("policy-selected");
                localData.insureNumList.push(
                    {
                        insuranceNum : $(this).data("insurenum"),
                        needPaper : +policyType === 2 || +policyType === 3,
                        premium : Math.round($(this).find(".primary-color").text() * 100 || 0)
                    }
                );
                localData.planIds.push($(this).data("planid"));
            });
            var data = userData || [];
            $.each((data.accountBalanceInfo || {}).accountBalances || [],function(i,v){
                if(v.currencyId === 1001){
                    v.currentAmount = data.paymentCombinationVerificationResult.maxBalanceAmount;
                }
                else if(v.currencyId === 1003){
                    v.currentAmount = data.paymentCombinationVerificationResult.maxGolderBeanAmount;
                }
            });
            this.command.refreshBalancesBeanRedEnvelope(data.accountBalanceInfo || {});
            //缓存默认选中的红包
            var bestRedEnvelope = ((data || {}).paymentCombinationVerificationResult || {}).bestRedEnvelope || {};
            var voucherSerialNo =  bestRedEnvelope.voucherSerialNo || "";
            if(voucherSerialNo !== ""){
                this.data.alreadyUsedAmount.redEnvelope.voucherSerialNo = voucherSerialNo;
                this.data.alreadyUsedAmount.redEnvelope.discountRedEnvelope =((_.filter(data.accountBalanceInfo.accountRedEnvelopeInfo.availableRedEnvelopes,function(item){
                        return item.voucherSerialNo === voucherSerialNo;
                }) || [])[0]||{}).amount || 0;
                this.data.alreadyUsedAmount.redEnvelope.discountRedEnvelope =  (data.paymentCombinationVerificationResult.bestRedEnvelope || {}).amount || 0;
            }
            //缓存付款金额
            this.data.totalPremium =  data.totalPremium || 0;
            this.data.totalDiscount = data.totalDiscount || 0;
            this.data.totalPayableAmount.redEnvelope = data.discountRedEnvelope || bestRedEnvelope.amount || 0;
            this.data.shipAddress = data.shipAddress || {};
            this.data.shipPayAmount = 1500 || data.shipPayAmount || 0;
            this.data.paymentType = data.paymentType || 2;
            //是否显示配送地址
            this.data.isShowShipAddress = data.showShipAddress;
            this.command.getUserAddress();
            this.data.insuranceResults = data.insuranceResults || [];
            //重新修改支付方式，页面带有订单号
            var
                orderNum = /\?orderNum=(\d+)&?/ig.exec(window.location.href);
            orderNum = orderNum ? orderNum[1] : null;
            this.data.orderNum = orderNum;
        },
        data : {
            insureNumList : [],//保单号列表
            planIds : [],
            postAddress : {},//配送地址
            totalPremium : 0.00,//总保费
            ableAmount : {//当前账户可用
                bean : 0,//金豆
                balance : 0,//余额,
                redEnvelope : []
            },
            currentAbleAmount : {
                bean : 0,
                balance : 0
            },
            frozenAmount : {//冻结
                bean : 0,
                balance : 0,
                redEnvelope : []
            },
            shipPayAmount : 0.00, //寄送费
            frozenAccountBalances : {
                bean : [],
                balance : []
            },
            alreadyUsedAmount : {
                bean : "",//金豆,
                redEnvelope : {
                    voucherSerialNo : "", //已经使用的红包编号
                    discountRedEnvelope : 0 //使用的红包金额
                }
            },
            totalGatewayPay : 0.00,//网关支付
            totalDiscount : 0.00 ,//优惠活动金额
            totalPayableAmount : {
                bean : 0.00,//金豆抵扣金额
                balance : 0.00,//余额抵扣金额
                redEnvelope : 0.00//红包抵扣金额
            },
            blurInput : [], //当前失去焦点的文本框
            blurInputOldValue : 0,
            shipAddress : {},
            isShowShipAddress : true,
            submitLocked : false
        },
        template : {
            balanceBeanTpl : "",
            redEnvelopeTpl : ""
        },
        command : {
            message : {},
            initExceptions : function(){
                var orderException = Settlement.data.insuranceResults[0] || {};
                Settlement.command.handlingExceptions(orderException,0);
            },
            initPaymentCombination : function(){
                 var
                     orderNum = /\?orderNum=(\d+)&?/ig.exec(window.location.href),
                     localData = Settlement.data;
                 orderNum = orderNum ? orderNum[1] : null;
                 if(orderNum){
                     localData.orderNum = orderNum;
                     Settlement.command.checkInputPaymentInfos(function(data){
                         var
                             isShowRedEnvelope = $("#redEnvelopePay").hasClass("hz-check-item-checked"),
                             combinationData = data.result || {},
                             voucherSerialNo = (combinationData.bestRedEnvelope || {}).voucherSerialNo || "";
                         if(voucherSerialNo){
                             localData.ableAmount.redEnvelope = (combinationData.accountRedEnvelopeInfo || {}).availableRedEnvelopes || [];
                             localData.frozenAmount.redEnvelope = (combinationData.accountRedEnvelopeInfo || {}).frozenRedEnvelopes || [];
                             Settlement.command.bindRedEnvelope(voucherSerialNo,isShowRedEnvelope);
                         }
                         else{
                             $("#redEnvelopePay").removeClass("hz-check-item-checked");
                             localData.totalPayableAmount.redEnvelope = 0;
                         }
                     },function(){

                     });
                 }
            },
            handlingExceptions : function(orderException,showClose){
                var
                    errorCode =  orderException.errorCode,
                    message = orderException.errorMsg || "系统错误",
                    closeBtn = showClose === undefined ? 1 : showClose;
                if(!errorCode){
                    return;
                }
                switch (errorCode){
                    case "00001":
                        requirejs(["sign-float"], function (signFloat) {
                            var sign = new signFloat({returnUrl: location.href, showRegister: true,callback:function(data){//登录成功回调
                                location.reload();
                            }});
                        });
                        break;
                    case 10254:
                    case 10253:
                    case 10401:
                    case 36057:
                    case 10311:
                    case 37111:
                    case 10317:
                    case 10602:
                    case 1:
                        layer.alert2(
                            '<div class="pt45 pb45 tac">'+message+'</div>',
                        {
                            btn : ["知道了"],
                            closeBtn : closeBtn,
                            area : "530px",
                            title : false
                        },function(){
                            window.location.href = "/shopping-cart";
                        });
                        break;
                    //case 10317:
                    //    layer.alert2('<div class="pt45 pb45 tac">'+message+'</div>',
                    //        {
                    //            btn : ["知道了"],
                    //            closeBtn : closeBtn,
                    //            area : "530px",
                    //            title : false
                    //        },function(){
                    //             var
                    //                 request = {
                    //                     url : "/api/shopping-cart/items?insuranceNum=" + userData.insuranceResults[0].insuranceNum,
                    //                     method : "DELETE"
                    //                 },
                    //                 callback = function(){
                    //                     window.location.href = "/shopping-cart";
                    //                 };
                    //             helper.request.postData(request,callback);
                    //        });
                    //    break;
                    case 37115:
                    case 37120:
                        layer.confirm(
                            '<div class="pt45 pb45 tac">'+message+'</div>',
                            {
                                btn : ["返回购物车","联系客服"],
                                title: false,
                                closeBtn : closeBtn,
                                area : "530px"
                            },function(e){
                                layer.close(e);
                                var transferWindow = window.open('about:blank');
                                transferWindow.location.href = "/shopping-cart";
                            },function(e){
                                var transferWindow = window.open('about:blank');
                                transferWindow.location.href = "http://kefu.hzins.com/chat?domain=hzins&businessType=Xm4FWr0dncw&referrer="  + encodeURIComponent(window.location.href);
                                layer.close(e);
                            });
                        break;
                    case 10003:
                        layer.confirm('<div class="pt45 pb45 tac">'+message+'</div>',
                            {
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
                        case 10102:
                            layer.alert2('<div class="pt45 pb45 tac">'+message+'</div>',
                                {
                                    btn : ["知道了"],
                                    title : false,
                                    closeBtn : closeBtn,
                                    area : "530px"
                                },function(e){
                                    layer.close(e);
                                });
                            break;
                    default :
                        layer.alert2('<div class="pt45 pb45 tac">'+message+'</div>',
                        {
                            btn : ["知道了"],
                            title : false,
                            closeBtn : closeBtn,
                            area : "530px"
                        },function(){
                            window.location.href = "/shopping-cart";
                        });
                        break;
                }
            },
            getUserAddress : function(){
                var
                    request = {
                        url : "/api/users/addresses"
                    },
                    callback = function(data){
                        var shipAddress = Settlement.data.shipAddress = data.result || {};
                        shipAddress = data.result || {};
                        helper.request.getJson({url:"/api/tools/address/province"},function(data){
                            var
                                province = data.result,
                                provinceName = "",
                                districtName = "";
                            $.each(province,function(i,v){
                                if(+v.provinceCode === +shipAddress.provinceCode){
                                    provinceName = v.name;
                                    helper.request.getJson({url:"/api/tools/address/city?province=" +  shipAddress.provinceCode},function(cityData){
                                        var
                                            city = cityData.result || {},
                                            cityName = "";
                                        $.each(city,function(ii,vv){
                                            if(+vv.cityCode === +shipAddress.cityCode || +vv.cityCode === +shipAddress.provinceCode){
                                                cityName = vv.name;
                                                if(shipAddress.provinceCode == "810000"|| shipAddress.provinceCode == 820000){
                                                    $("#sendMessage .send-add").text((provinceName == cityName ? provinceName : provinceName + cityName) + districtName + shipAddress.address);
                                                    return;
                                                }
                                                helper.request.getJson({url:"/api/tools/address/district?city=" +  ($.trim(shipAddress.cityCode) || shipAddress.provinceCode)},function(districtData){
                                                    var district = districtData.result;
                                                    $.each(district,function(iii,vvv){
                                                        if(+vvv.districtCode === +shipAddress.districtCode){
                                                            shipAddress.disdistrictName = districtName = vvv.name;
                                                            $("#sendMessage .send-add").text((provinceName == cityName ? provinceName : provinceName + cityName) + districtName + shipAddress.address);
                                                            return;
                                                        }
                                                    });
                                                });
                                                return;
                                            }
                                        });
                                        return;
                                    });
                                }
                            });
                        });
                        $("#sendMessage .send-user").text(shipAddress.name);
                        $("#sendMessage .send-tel").text(shipAddress.mobileNo);
                    };
                helper.request.getJson(request,callback);
            },
            linkAddress : function(){//省市县绑定
                var
                    localData = Settlement.data,
                    userAddress = {
                        province :  localData.shipAddress.provinceCode,
                        city : localData.shipAddress.cityCode,
                        district : localData.shipAddress.districtCode,
                        fullAddress : localData.shipAddress.address,
                        username : localData.shipAddress.name,
                        phone : localData.shipAddress.mobileNo
                    },
                    addressTextTemp = {
                        province : "",
                        city : "",
                        district : ""
                    };
                var
                    bindAddressSelect = this.bindAddressSelect,
                    url = {
                        province : "/api/tools/address/province",
                        city : "/api/tools/address/city?province=",
                        district : "/api/tools/address/district?city="
                    };
                var
                    directCityCode = ["120000","110000","310000","500000"],
                    directDistrictCode = ["810000","820000"];

                if(_.find(_.union(directCityCode,directDistrictCode),function(value){return +value === +userAddress.province;}) === undefined){
                    $("#citySelect").show();
                    $("#areaSelect").show();
                }
                bindAddressSelect(url.province,"#provinceSelect","省份/自治区",function(item){
                    $("#areaSelect .hz-dropdown-menu").empty();
                    $("#areaSelect .input-select-text").val("区/县");
                    //直辖市、特别行政区不需要三级联动
                    if(_.find(directCityCode,function(value){return +value === +item.provinceCode;}) !== undefined){
                        $("#citySelect").hide().find(".input-select-text").val("城市/地区");
                        bindAddressSelect(url.district + (item.provinceCode || "00000"),"#areaSelect","区/县",function(item){
                        });
                        $("#areaSelect").show();
                        return;
                    }
                    else if(_.find(directDistrictCode,function(value){return +value === +item.provinceCode;}) !== undefined){
                        $("#areaSelect").hide().find(".input-select-text").val("区/县");
                        bindAddressSelect(url.city + (item.provinceCode || "00000"),"#citySelect","区/县",function(item){});
                        $("#citySelect").show();
                        return;
                    }
                    $("#citySelect").show();
                    $("#areaSelect").show();
                    bindAddressSelect(url.city + (item.provinceCode || "00000"),"#citySelect","城市/地区",function(item){
                        bindAddressSelect(url.district + (item.cityCode || "00000"),"#areaSelect","区/县",function(item){
                        });
                    });
                },function(item){
                    if(!$.isEmptyObject(userAddress) && userAddress.province !== undefined){
                        if(+userAddress.province === +item.provinceCode){
                            addressTextTemp.province = item.name;
                            if(!$.trim(userAddress.city)){
                                $("#citySelect").hide();
                                bindAddressSelect(url.district + (userAddress.province || ""),"#areaSelect",localData.shipAddress.disdistrictName,function(item){
                                });
                            }
                            if(!$.trim(userAddress.district)){
                                $("#areaSelect").hide();
                            }
                            bindAddressSelect(url.city + item.provinceCode,"#citySelect",userAddress.city,function(item){
                                bindAddressSelect(url.district + (item.cityCode || ""),"#areaSelect","区/县",function(item){
                                });
                            },function(item){
                                if(+item.cityCode === +userAddress.city){
                                    bindAddressSelect(url.district + (item.cityCode || "00000"),"#areaSelect",userAddress.district || "区/县");
                                }
                                $("#provinceSelect").find(".input-select-text").val(addressTextTemp.province).attr("selected-code",userAddress.province);
                            });
                        }
                    }
                });
                if(!userAddress.province){
                    $("#provinceSelect").find(".input-select-text").val("省份/自治区");
                }
                if(!userAddress.city){
                    $("#citySelect").find(".input-select-text").val("城市/地区");
                }
                if(!userAddress.district){
                    $("#areaSelect").find(".input-select-text").val("区/县");
                }
                if(userAddress.fullAddress !== undefined){
                    $("#mailingAddressDialog textarea[name='fullAddress']").val(userAddress.fullAddress);
                }
                if(userAddress.username !== undefined){
                    $("#mailingAddressDialog input[name='addressee']").val(userAddress.username);
                }
                if(userAddress.phone !== undefined){
                    $("#mailingAddressDialog input[name='phone']").val(userAddress.phone);
                }

                //重置placeholder
                if(userAddress.fullAddress === ""){
                    $("#mailingAddressDialog textarea[name='fullAddress']").siblings(".placeholder-text").show();
                }
                if(userAddress.username === ""){
                    $("#mailingAddressDialog input[name='addressee']").siblings(".placeholder-text").show();
                }
                if(userAddress.phone === ""){
                    $("#mailingAddressDialog input[name='phone']").siblings(".placeholder-text").show();
                }

            },
            bindAddressSelect : function(url,select,defaultValue,clickHandler,callback){
                var $frgDoc = $(document.createDocumentFragment());
                helper.request.getJson({url:url},function(data){
                    var
                        addressData = (data || {}).result || [],
                        defaultValueText = defaultValue;
                    $.each(addressData,function(ii,vv){
                        if(/^\d+$/.test(defaultValue) && (+vv.cityCode === +defaultValue || +vv.districtCode === +defaultValue)){
                            defaultValueText = vv.name;
                        }
                        $("<li class='hz-select-option'> " + vv.name + "</li>").data("item",vv).appendTo($frgDoc);
                        if(typeof callback === "function"){
                            callback.call(null,vv);
                        }
                    });
                    $(select).delegate(".hz-select-option","click",function(){
                        if(typeof clickHandler === "function"){
                            clickHandler.call($(this),$(this).data("item"));
                        }
                    });
                    $(select).find(".input-select-text").val(defaultValueText).attr("selected-code",defaultValue);
                    $(select).find(".hz-dropdown-menu").empty().append($frgDoc);
                });
            },
            toggleSelectPayment : function(type){
                var
                    payment = "",
                    command = Settlement.command;
                switch(type){
                    case 1 :
                        payment = "balance";
                        break;
                    case 2 :
                        payment = "redEnvelope";
                        break;
                    case 3 :
                        payment = "bean";
                        break;
                }
                var
                    localData = Settlement.data,
                    noRedEnvelope = localData.frozenAmount.redEnvelope.length === 0 && localData.ableAmount.redEnvelope.length === 0,
                    noBalanceBean = localData.frozenAmount[payment] === 0 && localData.ableAmount[payment] === 0;
                if(type === 1 || type === 3){
                    if(noBalanceBean){
                        return false;
                    }
                }
                else if(type === 2){
                    //!noRedEnvelope && $(this).toggleClass("hz-check-item-checked");
                    //if(noRedEnvelope && $("#redEnvelope").css("visibility") !== "hidden"){
                    //    return false;
                    //}
                }
                $(this).toggleClass("hz-check-item-checked");

                localData.pushAmountType = type;
                var
                    haveValue = $(this).parent().find(".have-value,#redEnvelope"),
                    $curType = $(this);
                haveValue.css("visibility",haveValue.css("visibility") === "hidden" ? "visible" : "hidden");
                var
                    $thisInput = $(this).parent().find(".discount-pay-input"),
                    isUse = !$(this).hasClass("hz-check-item-checked");
                if(isUse){
                    $(this).data("amount", localData.totalPayableAmount[payment]);
                    localData.totalPayableAmount[payment] = 0;
                    $thisInput.val('');
                    //$thisInput.val(type == 1 ? "0.00" : "0");
                    if(type === 2){
                        localData.alreadyUsedAmount.redEnvelope.voucherSerialNo = "";
                        localData.totalPayableAmount.redEnvelope = 0;
                    }
                    command.bindTotalPremium();
                }
                if(type === 2){
                    localData.needRedEnvelope = true;
                    if($(this).hasClass("hz-check-item-checked"))
                    {
                        $("#redEnvelope").hide();
                        if($(this).parent().find(".small-loading").length === 0){
                            $(this).parent().append("<span class='small-loading fcc'>正在加载...</span>");
                        }
                        command.useRedEnvelope(localData.alreadyUsedAmount.redEnvelope.voucherSerialNo,localData.totalPayableAmount.redEnvelope,true);
                    }
                }
                else{
                    if(!isUse){
                        $(this).siblings("div").find(".have-value").css("display","none");
                        if($(this).siblings("div").find(".small-loading").length === 0){
                           $(this).siblings("div").append("<span class='small-loading fcc'>正在加载...</span>");
                        }
                    }
                    if(localData.ableAmount[payment] === 0){
                        $curType.siblings("div").find(".small-loading").remove();
                        $curType.siblings("div").find(".have-value").css("display","inline-block");
                        return false;
                    }
                    command.checkBalanceBean.call($(this).siblings("div").find(".discount-pay-input"),type,function(discountAmount){
                        localData.totalPayableAmount[payment] = discountAmount;
                        if(+discountAmount === 0 && !$curType.hasClass("hz-check-item-checked")){
                            $thisInput.val('');
                        }else{
                            $thisInput.val(type === 1 ? (discountAmount / 100).toFixed(2) : discountAmount);
                            if(localData.ableAmount[type === 1 ? "balance" : "bean"] > 0){
                                $thisInput.parent().append("<span class='discount-amount-value pl5'>-￥" + (discountAmount / 100).toFixed(2) + "</span>");
                            }
                        }
                        if(localData.ableAmount[type === 1 ? "balance" : "bean"] > 0)
                        {
                            $thisInput.show();
                        }
                        setTimeout(function(){
                            $curType.siblings("div").find(".small-loading").remove();
                            $curType.siblings("div").find(".have-value").css("display","inline-block");
                        },300);
                        command.bindTotalPremium();
                    },true);
                }
            },
            refreshBalancesBeanRedEnvelope : function(result){//刷新金豆、红包、余额
                if(!result || $.isEmptyObject(result) || result.accountBalances.length === 0){
                    return ;
                }
                var localData = Settlement.data;
                localData.ableAmount.redEnvelope = (result.accountRedEnvelopeInfo || {}).availableRedEnvelopes;
                localData.frozenAmount.redEnvelope = (result.accountRedEnvelopeInfo || {}).frozenRedEnvelopes;
                $.each(result.accountBalances,function(i,v){
                    if(+v.currencyId === 1001){
                        localData.ableAmount.balance = v.amount;
                        localData.currentAbleAmount.balance =  v.currentAmount || 0;
                        localData.frozenAmount.balance = v.frozenAmount;
                        localData.frozenAccountBalances.balance = v.frozenAccountBalances;
                    }
                    else if(+v.currencyId === 1003){
                        localData.ableAmount.bean = v.amount;
                        localData.currentAbleAmount.bean = v.currentAmount || 0;
                        localData.frozenAmount.bean = v.frozenAmount;
                        localData.frozenAccountBalances.bean = v.frozenAccountBalances;
                    }
                });
            },
            bindBalanceBeanAmount : function(type){//绑定余额、金豆
                if(type !==1 && type !== 3){
                    return ;
                }
                var
                    $this = $(this),
                    item = $this.find(".hz-check-item"),
                    $input = $this.find(".discount-pay-input"),
                    currentAmount,
                    localData = Settlement.data,
                    amountName = type === 1 ? "balance" : "bean",
                    result = {
                        amount : localData.ableAmount[amountName],
                        frozenAmount : localData.frozenAmount[amountName],
                        frozenAccountBalances : localData.frozenAccountBalances[amountName],
                        type : type
                    },
                    template = Settlement.template;
                    currentAmount = localData.currentAbleAmount[amountName] || 0;
                    if($.isEmptyObject(result)){
                        return;
                    }
                    if(result.amount <= 0 && result.frozenAmount <= 0){
                        item.find('[rel="prompt"]').prompt();
                        item.removeClass("hz-check-item-checked");
                    }
                    else if((result.amount <= 0 && result.frozenAmount > 0) || currentAmount <= 0){
                        item.find(".hz-check-icon").unbind("mouseenter");
                        item.removeClass("hz-check-item-checked");
                        var haveValue = $(this).find(".have-value,#redEnvelope");
                        haveValue.css("visibility",haveValue.css("visibility") === "hidden" ? "visible" : "hidden");
                    }
                    else{
                        item.find(".hz-check-icon").unbind("mouseenter");
                        item.addClass("hz-check-item-checked");
                    }
                    if(result.amount > 0){
                        if($this.find(".hz-check-item-checked").length === 0){
                            $input.val('').show();
                        }
                        else{
                        $input.val(type === 1 ? (currentAmount / 100).toFixed(2) : currentAmount).show();
                        }
                    }
                    if(type === 1){
                        localData.totalPayableAmount.balance = Math.round($input.val() * 100) || 0;
                    }
                    else{
                        localData.totalPayableAmount.bean = $input.val() || 0;
                    }
                    result.has = result.amount;
                    result.discountAmount = localData.totalPayableAmount[amountName];
                ;(function(result){
                    require(["require-text!/html/pay/balance-bean.html"], function (tpl) {
                        template.balanceBeanTpl = tpl;
                        var htmlStr = _.template(tpl)(result);
                        $this.find(".have-value span,.have-value div").remove();
                        $this.find(".have-value").append($(htmlStr));
                    });
                })(result);
            },
            editAmount : function(type){
                var
                    $this = $(this).closest("li"),
                    localData = Settlement.data,
                    template = Settlement.template,
                    result = {
                        amount : type === 1 ? localData.ableAmount.balance : localData.ableAmount.bean,
                        frozenAmount : type ===1 ? localData.frozenAmount.balance : localData.frozenAmount.bean,
                        frozenAccountBalances : localData.frozenAccountBalances[type === 1 ? "balance" : "bean"],
                        has : false,
                        type : type
                    };
                if(template.balanceBeanTpl){
                    var htmlStr = _.template(template.balanceBeanTpl)(result);
                    $this.find(".have-value span,.have-value div").remove();
                    $this.find(".have-value").append($(htmlStr));
                }
            },
            checkBalanceBean : function(type,func,isPushAmount){
                var
                    $input = $(this),
                    localData = Settlement.data,
                    command = Settlement.command;
                if($input.val() > localData.ableAmount[type === 1 ? "balance" : "bean"]){
                    $input.val(localData.ableAmount[type === 1 ? "balance" : "bean"]);
                }
                var
                    successCallback = function(data){
                        var
                            result = (data || {}).result || {},
                            discountAmount = 0,
                            bestRedEnvelope = result.bestRedEnvelope || {},
                            voucherSerialNo = bestRedEnvelope.voucherSerialNo || "",
                            _continueUsed = function(custom){
                                localData.alreadyUsedAmount.redEnvelope.voucherSerialNo = voucherSerialNo;
                                localData.totalPayableAmount.redEnvelope = bestRedEnvelope.amount || 0;
                                localData.ableAmount.redEnvelope = (result.accountRedEnvelopeInfo || {}).availableRedEnvelopes || [];
                                localData.frozenAmount.redEnvelope = (result.accountRedEnvelopeInfo || {}).frozenRedEnvelopes || [];
                                var
                                    isShowRedEnvelope = $("#redEnvelopePay").hasClass("hz-check-item-checked"),
                                    ableResultAmount = result[type === 1 ? "maxBalanceAmount" : "maxGolderBeanAmount" ] || 0;
                                    command.bindRedEnvelope(voucherSerialNo,isShowRedEnvelope);
                                if(!$("#redEnvelopePay").hasClass("hz-check-item-checked")  ){
                                    localData.alreadyUsedAmount.redEnvelope.voucherSerialNo = "";
                                    localData.totalPayableAmount.redEnvelope = 0;
                                }
                                discountAmount = (!custom && isPushAmount) ? ableResultAmount : $input.val();
                                if(ableResultAmount <discountAmount){
                                    discountAmount = ableResultAmount;
                                    $input.val(type === 1 ? discountAmount / 100: discountAmount);
                                }
                                localData.totalPayableAmount[type === 1 ? "balance" : "bean"] = type === 1 ? Math.round(discountAmount * 100) : discountAmount;
                                if(localData.ableAmount[type === 1 ? "balance" : "bean"] > 0){
                                    $input.siblings().remove();
                                }
                                func(discountAmount);
                            },
                            _confirmFunc = function(msg,useRedEnvelope,useBalance){
                                layer.confirm(
                                    '<div class="pt45 pb45 tac">' + msg + '</div>',

                                    {
                                        title: false,
                                        area : '530px',
                                        btn : ["取消","确定"]
                                    },
                                    function(e){
                                        $input.val(localData.blurInputOldValue || 0).siblings().remove();
                                        $input.parent().append(
                                            $("<span class= 'discount-amount-value'></span>").text("-￥" + (localData.blurInputOldValue / 100).toFixed(2))
                                        );
                                        localData.totalPayableAmount.bean = localData.blurInputOldValue || 0;
                                        //_continueUsed(useRedEnvelope || useBalance);
                                        layer.close(e);
                                    },function(e){
                                        if(useRedEnvelope){
                                            if($.isEmptyObject(bestRedEnvelope)){
                                                $("#redEnvelopePay").removeClass("hz-check-item-checked");
                                            }
                                            localData.totalPayableAmount.redEnvelope = bestRedEnvelope.amount || 0;
                                            localData.alreadyUsedAmount.redEnvelope.discountRedEnvelope = bestRedEnvelope.amount || 0;
                                            localData.alreadyUsedAmount.redEnvelope.voucherSerialNo = voucherSerialNo || "";
                                        }
                                        if(useBalance){
                                            if(!maxBalanceAmount){
                                                $("#balancePay").removeClass("hz-check-item-checked").siblings("div").find(".have-value").css("visibility","hidden");
                                            }
                                            $("#balancePaymentInput").val((maxBalanceAmount / 100).toFixed(2));
                                            $(".balance-amount-pay .discount-amount-value").text("-￥" + (maxBalanceAmount / 100).toFixed(2));
                                            localData.totalPayableAmount.balance = maxBalanceAmount;
                                        }
                                        layer.close(e);
                                        _continueUsed();
                                    }
                                );
                            };
                        if(type === 1 && Math.round(Number($input.val() || 0) * 100) > result.maxBalanceAmount && $("#balancePay").hasClass("hz-check-item-checked")){
                            layer.alert2("余额使用超过总保费金额，请确认后再修改",function(e){
                                $input.val(result.maxBalanceAmount / 100);
                                _continueUsed();
                                layer.close(e);
                            });
                        }
                        else if(type === 3){
                            var
                                maxBalanceAmount = data.result.maxBalanceAmount || 0;
                            if(localData.totalPayableAmount.redEnvelope > 0 && $.isEmptyObject(bestRedEnvelope) && localData.totalPayableAmount.balance > maxBalanceAmount){
                                    if($.isEmptyObject(bestRedEnvelope)){
                                        $("#redEnvelopePay").removeClass("hz-check-item-checked");
                                    }
                                    localData.totalPayableAmount.redEnvelope = bestRedEnvelope.amount || 0;
                                    localData.alreadyUsedAmount.redEnvelope.discountRedEnvelope = bestRedEnvelope.amount || 0;
                                    localData.alreadyUsedAmount.redEnvelope.voucherSerialNo = voucherSerialNo || "";
                                    if(!maxBalanceAmount){
                                        $("#balancePay").removeClass("hz-check-item-checked").siblings("div").find(".have-value").css("visibility","hidden");
                                    }
                                    $("#balancePaymentInput").val((maxBalanceAmount / 100).toFixed(2));
                                    $(".balance-amount-pay .discount-amount-value").text("-￥" + (maxBalanceAmount / 100).toFixed(2));
                                    localData.totalPayableAmount.balance = maxBalanceAmount;
                                _continueUsed();
                            }
                            else  if(localData.totalPayableAmount.balance > maxBalanceAmount){
                                    if(!maxBalanceAmount){
                                        $("#balancePay").removeClass("hz-check-item-checked").siblings("div").find(".have-value").css("visibility","hidden");
                                    }
                                    $("#balancePaymentInput").val((maxBalanceAmount / 100).toFixed(2));
                                    $(".balance-amount-pay .discount-amount-value").text("-￥" + (maxBalanceAmount / 100).toFixed(2));
                                    localData.totalPayableAmount.balance = maxBalanceAmount;
                                _continueUsed();
                            }
                            else if(localData.totalPayableAmount.redEnvelope > (bestRedEnvelope.amount || 0)){
                                _confirmFunc("使用金豆超过红包满减条件后，将无法使用红包",true,false);
                            }
                            else{
                                _continueUsed();
                            }
                        }
                        else {
                            _continueUsed();
                        }
                        localData.blurInput = "";
                        command.unlockSubmitPayment();
                    },
                    failCallback = function(data){
                        localData.blurInput = [];
                        command.unlockSubmitPayment();
                        layer.msg(data.message || "验证失败");
                        $input.val(type === 1 ? "0.00" : "0");
                    };
                command.checkInputPaymentInfos(successCallback,failCallback);
            },
            bindRedEnvelope : function(voucherSerialNo,show){
                var
                    localData = Settlement.data,
                    command = Settlement.command,
                    result = {
                        availableRedEnvelopes : localData.ableAmount.redEnvelope,
                        frozenRedEnvelopes : localData.frozenAmount.redEnvelope,
                        bestRedEnvelope : voucherSerialNo,
                        show : show === undefined ? true : show
                    };
                result.haveRedEnvelope= !(result.availableRedEnvelopes.length === 0 && result.frozenRedEnvelopes.length === 0);
                result.discountRedEnvelope = ((_.filter(result.availableRedEnvelopes,function(item){
                       return item.voucherSerialNo === voucherSerialNo;
                }))[0] || {}).amount || 0;
                command.renderRedEnvelope(result);
            },
            renderRedEnvelope : function(tplData){
                var
                    _render = function(tpl){
                        var htmlStr = _.template(tpl)(tplData);
                        $("#redEnvelope").remove();
                        $("#redEnvelopePay").parent().append($(htmlStr));
                    },
                    localData = Settlement.data,
                    template = Settlement.template;
                if(localData.frozenAmount.redEnvelope.length !== 0 || localData.ableAmount.redEnvelope.length !== 0){
                    $(".red-envelope-pay i[rel='prompt']").unbind("mouseenter");
                }
                if(template.redEnvelopeTpl === ""){
                    require(["require-text!/html/pay/red-envelope.html"], function (tpl) {
                        template.redEnvelopeTpl = tpl;
                        _render(tpl);
                    });
                    return;
                }
                _render(template.redEnvelopeTpl);
            },
            bindTotalPremium : function(){//应付总额计算
                var
                    localData = Settlement.data,
                    payAmount = localData.totalPremium - localData.totalPayableAmount.bean - localData.totalPayableAmount.redEnvelope - localData.totalDiscount;
                payAmount = Number(payAmount < 0 ? 0 : payAmount);
                payAmount = localData.totalPremium >= 30000  ? payAmount - localData.totalPayableAmount.balance : payAmount + Number(localData.isShowShipAddress ? localData.shipPayAmount : 0) - localData.totalPayableAmount.balance;
                payAmount = Number(payAmount < 0 ? 0 : payAmount);
                $("#payTypeSelect")[payAmount <=0 ? "hide" : "show"]();
                localData.totalGatewayPay = payAmount < 0 ? 0 : payAmount;
                $("#totalPayableAmount").text((localData.totalGatewayPay / 100).toFixed(2));
                $("#beanTotalPayment .total-value").text("-￥" + (localData.totalPayableAmount.bean / 100).toFixed(2));
                $("#redEnvelopeTotalPayment .total-value").text("-￥" + (localData.totalPayableAmount.redEnvelope / 100).toFixed(2));
                $("#balanceTotalPayment .total-value").text("-￥" + (localData.totalPayableAmount.balance / 100).toFixed(2));
                $("#beanTotalPayment")[$("#beanPay").hasClass("hz-check-item-checked") ? "removeClass" : "addClass"]("fn-hide");
                $("#redEnvelopeTotalPayment")[$("#redEnvelopePay").hasClass("hz-check-item-checked") ? "removeClass" : "addClass"]("fn-hide");
                $("#balanceTotalPayment")[$("#balancePay").hasClass("hz-check-item-checked") ? "removeClass" : "addClass"]("fn-hide");
            },
            useRedEnvelope : function(voucherSerialNo,amount,isToggle){//使用红包
                var
                    localData = Settlement.data,
                    command = Settlement.command,
                    callbackFunc = function(paymentCombinationData){
                        var
                            bestRedEnvelope = paymentCombinationData.result.bestRedEnvelope || {},
                            maxBalanceAmount = paymentCombinationData.result.maxBalanceAmount,
                            _continueUsed = function(){
                                var tplData;
                                localData.alreadyUsedAmount.redEnvelope.voucherSerialNo = bestRedEnvelope.voucherSerialNo || voucherSerialNo;
                                localData.totalPayableAmount.redEnvelope = amount = (_.find(localData.ableAmount.redEnvelope,function(item){return item.voucherSerialNo === (bestRedEnvelope.voucherSerialNo || voucherSerialNo);}) || {}).amount || 0;
                                localData.alreadyUsedAmount.redEnvelope.discountRedEnvelope = amount;
                                command.bindTotalPremium();
                                tplData = {
                                    discountRedEnvelope : amount,
                                    availableRedEnvelopes : localData.ableAmount.redEnvelope,
                                    frozenRedEnvelopes : localData.frozenAmount.redEnvelope,
                                    bestRedEnvelope : bestRedEnvelope.voucherSerialNo || voucherSerialNo,
                                    show : true
                                };
                                tplData.haveRedEnvelope = (tplData.availableRedEnvelopes.length + tplData.frozenRedEnvelopes.length) > 0;
                                command.renderRedEnvelope(tplData);
                                command.unlockSubmitPayment();
                            };

                        if(!$.isEmptyObject(bestRedEnvelope) || isToggle){
                            if(maxBalanceAmount < localData.totalPayableAmount.balance){
                                layer.confirm(
                                    "<div class='pt45 pb45 tac'>当前支付超出订单总额,继续支付将调整余额支付</div>",
                                    {
                                        area: "530px",
                                        btn : ["确定","取消"],
                                        title : false
                                    },
                                    function(e){
                                        $("#balancePaymentInput").val((maxBalanceAmount / 100).toFixed(2));
                                        $(".balance-amount-pay .discount-amount-value").text("-￥" + (maxBalanceAmount / 100).toFixed(2));
                                        localData.totalPayableAmount.balance = maxBalanceAmount;
                                        _continueUsed(voucherSerialNo);
                                        layer.close(e);
                                    },
                                    function(){
                                        $("#redEnvelope .hz-dropdown-content").hide();
                                    }
                                );
                            }
                            else{
                                var accountRedEnvelopeInfo = (paymentCombinationData.result || {}).accountRedEnvelopeInfo;
                                localData.ableAmount.redEnvelope = accountRedEnvelopeInfo.availableRedEnvelopes || [];
                                localData.frozenAmount.redEnvelope = accountRedEnvelopeInfo.frozenRedEnvelopes || [];
                                _continueUsed(bestRedEnvelope.voucherSerialNo || voucherSerialNo);
                            }
                            $("#redEnvelopePay").siblings(".small-loading").remove();
                            //if($.isEmptyObject(bestRedEnvelope) && isToggle){
                            //    $("#redEnvelopePay").removeClass("hz-check-item-checked");
                            //}
                            //else {
                            //    $("#redEnvelopePay").addClass("hz-check-item-checked");
                            //}
                        }
                        else{
                            if(voucherSerialNo && !isToggle)
                            {
                                layer.alert2(
                                    "<div class='pt45 pb45 tac'>该红包暂时不能使用</div>",
                                    {
                                        area: "530px",
                                        title:false
                                    },
                                    function(e){
                                    $("#redEnvelope .hz-dropdown-content").hide();
                                    layer.close(e);
                                });
                                return;
                            }
                            $("#redEnvelope .hz-dropdown-content").hide();
                        }
                    },
                    failCallback = function(data){
                        command.unlockSubmitPayment();
                        layer.msg(data.message || "使用红包失败");
                    };
                command.checkInputPaymentInfos(callbackFunc,failCallback);
            },
            unFrozenAmount : function(orderNum,type,func){
                if(orderNum === undefined){
                    return ;
                }
                var
                    request = {
                    url : "/api/orders/" + orderNum  + "/freezed/currency",
                    method : "DELETE"
                    },
                    callback = function(data){
                        if(data.result === true){
                           func();
                        }
                        layer.msg(data.result === true ? "解冻成功!" : "解冻失败!");
                    };
                helper.request.postData(request,callback);
            },
            checkInputPaymentInfos : function(successCallback,failCallback,voucher){
                var
                    localData = Settlement.data,
                    voucherNum = voucher || localData.alreadyUsedAmount.redEnvelope.voucherSerialNo,
                    currentBalance = $("#balancePay").hasClass("hz-check-item-checked") ? Math.round($(".balance-amount-pay .discount-pay-input").val() * 100) : 0,
                    currentBean = $("#beanPay").hasClass("hz-check-item-checked") ? Math.round($(".bean-amount-pay .discount-pay-input").val()) : 0,
                    paymentArr = [];
                if($("#balancePay").hasClass("hz-check-item-checked") && (currentBalance !== 0 || +localData.pushAmountType === 1)) {
                    paymentArr.push({
                        currencyId : 1001,
                        amount : currentBalance
                    });
                }
                if($("#beanPay").hasClass("hz-check-item-checked") && (currentBean !== 0 || +localData.pushAmountType === 3)) {
                    paymentArr.push({
                        currencyId : 1003,
                        amount : currentBean
                    });
                }
                if($("#redEnvelopePay").hasClass("hz-check-item-checked")) {
                    var voucherSerialNo = voucherNum;
                    if(!voucherSerialNo){
                        paymentArr.push({
                            currencyId : 1022,
                            voucherNum :  null
                        });
                    }
                    else{
                        paymentArr.push({
                            currencyId : 1022,
                            voucherNum : voucherSerialNo || null
                            //amount : localData.totalPayableAmount.redEnvelope || localData.ableAmount.tryRedEnvelopeAmount || ""
                        });
                    }
                }
                var
                    request = {
                        url : "/api/orders/payment-combination",
                        data :
                        {
                            insurancePaymentInfos : localData.insureNumList,
                            paymentItemInfos : paymentArr || [],
                            expressFee : localData.isShowShipAddress ? (localData.totalPremium >= 30000 ? 0 : localData.shipPayAmount ) : 0
                        }
                    };
                if(localData.orderNum){
                    request.data.orderNum = localData.orderNum;
                }
                helper.request.postData2(request,successCallback,failCallback);
            },
            getBalanceBeanAmount : function(func){//获取金豆
                var
                    request = {
                        url : "/api/orders/available/balance",
                        data : Settlement.data.planIds || []
                    },
                    callback = function(data){
                        Settlement.command.refreshBalancesBeanRedEnvelope(data.result || {});
                        if(typeof callback === "function"){
                            func(data.result || {});
                        }
                    };
                helper.request.postData2(request,callback);
            },
            activateRedEnvelope : function(voucherSerialNo){
                var
                    $this = $(this),
                    localData = Settlement.data,
                    command = Settlement.command,
                    request = {
                        url : "/api/users/actived/red-envelope",
                        data : {
                            redEnvelopeNum : voucherSerialNo || ""
                        }
                    },
                    callback = function(data){
                        var
                            callbackFunc = function(paymentCombinationData){
                                command.getBalanceBeanAmount(function(){
                                    localData.needRedEnvelope = false;
                                    var
                                        result = paymentCombinationData.result || {},
                                        bestRedEnvelope = result.bestRedEnvelope || {},
                                        tplData,
                                        amount;
                                    if(!$.isEmptyObject(bestRedEnvelope)){
                                        localData.alreadyUsedAmount.redEnvelope.voucherSerialNo = bestRedEnvelope.voucherSerialNo;
                                        localData.totalPayableAmount.redEnvelope = amount = (_.find(localData.ableAmount.redEnvelope,function(item){return item.voucherSerialNo === bestRedEnvelope.voucherSerialNo;}) || {}).amount || 0;
                                        localData.alreadyUsedAmount.redEnvelope.discountRedEnvelope = localData.ableAmount.tryRedEnvelopeAmount = amount || 0;
                                        command.bindTotalPremium();
                                        tplData = {
                                            discountRedEnvelope : amount,
                                            availableRedEnvelopes : localData.ableAmount.redEnvelope,
                                            frozenRedEnvelopes : localData.frozenAmount.redEnvelope,
                                            bestRedEnvelope : bestRedEnvelope.voucherSerialNo,
                                            show : true
                                        };
                                        tplData.haveRedEnvelope = (tplData.availableRedEnvelopes.length + tplData.frozenRedEnvelopes.length) > 0;
                                        command.renderRedEnvelope(tplData);
                                        if(!$("#redEnvelopePay").hasClass("hz-check-item-checked")){
                                            $("#redEnvelopePay").addClass("hz-check-item-checked");
                                        }
                                        layer.msg("红包激活成功!");
                                    }
                                    else{
                                        layer.alert2(
                                            "<div class='pt45 pb45 tac'>红包激活成功并保存至您账户</div>",
                                            {
                                                area: "530px",
                                                title:false
                                            },
                                            function(e){
                                            $("#redEnvelope .hz-dropdown-content").hide();
                                            layer.close(e);
                                        });
                                    }
                                    $this.closest(".layui-layer").find(".voucher-serial-input").val("");
                                    $this.closest(".layui-layer").find(".layui-layer-close").trigger("click");
                                });
                            },
                            failCallback = function(){
                                command.unlockSubmitPayment();
                                layer.alert2(data.message || "激活失败，请检查输入" );
                            };
                        if(data.result) {
                            localData.needRedEnvelope = true;
                            command.checkInputPaymentInfos(callbackFunc,failCallback,voucherSerialNo);
                        }
                        else {
                            layer.alert2(data.message || "激活失败");
                        }
                    };
                helper.request.postData2(request,callback);
            },
            lockSubmitPayment : function(msg){
                Settlement.data.submitLocked = true;
                Settlement.command.message.show(msg || "正在验证","loading");
            },
            unlockSubmitPayment : function(){
                Settlement.data.submitLocked = false;
                Settlement.command.message.hide();
            },
            submitPayment : function(type){
                if(Settlement.data.submitLocked){
                    return;
                }
                if(Settlement.data.blurInput.length > 0){
                    return;
                }
                Settlement.data.submitLocked = true;
                var
                    localData = Settlement.data,
                    request = {
                        url : "/api/orders",
                        data :{
                            insurancePaymentInfos : localData.insureNumList,
                            paymentItemInfos : [],
                            totalBuyPrice : localData.totalPremium,
                            totalDiscount : localData.totalDiscount,
                            totalPayable : localData.totalGatewayPay,
                            expressFee : localData.isShowShipAddress ? (localData.totalPremium >= 30000 ? 0 : localData.shipPayAmount ) : 0
                        }
                    },
                    successCallback = function(data){
                        var
                            errors = data.result.errors || [],
                            errorCode = (errors[0] || {}).errorCode,
                            message = (errors[0] || {}).message || "系统错误，无法提交",
                            orderNum = data.result.orderNum;
                        if(errorCode){
                            Settlement.command.handlingExceptions({
                                errorCode : errorCode,
                                errorMsg : message
                            });
                            Settlement.data.submitLocked = false;
                            return;
                        }
                        if(orderNum === undefined){
                            layer.msg("未知异常，创建订单失败");
                            Settlement.data.submitLocked = false;
                            return;
                        }
                        if(type === 0){
                            window.location.href = "/orders/payment-bank?orderNum=" + orderNum;
                            return ;
                        }
                        if(data.result.paymentType === 1 || data.result.paymentType === 3){
                            window.location.href = "/orders/payment-success?orderNum=" + data.result.orderNum +"&time=" + Date.now();
                            return ;
                        }
                        window.location.href = "/orders/payment?orderNum=" + data.result.orderNum +"&time=" + Date.now();
                    },
                    failCallback = function(data){
                        Settlement.data.submitLocked = false;
                        var
                            status = data.status || "";
                        status = status.toString();
                        if(status === "00001"){//用户尚未登陆
                            requirejs(["sign-float"], function (signFloat) {
                                var sign = new signFloat({returnUrl: location.href, showRegister: true,callback:function(data){//登录成功回调
                                    location.reload();
                                }});
                                setTimeout(function(){
                                    $(".placeholder-text").css("top","0px");
                                },500);
                            });
                        }
                        else if(status === "10003"){
                            layer.confirm('<div class="pt45 pb45 tac">'+data.message+'</div>',
                                {
                                    btn : ["取消","确认"],
                                    title: false,
                                    area : "530px"
                                },function(e){
                                    layer.close(e);
                                },function(e){
                                    window.location.href = "http://passport.huize.com/SignIn/Quit?returnurl=" + window.location.href;
                                    layer.close(e);
                            });
                        }
                        else if(+status === 10102)
                        {
                            layer.alert2('<div class="pt45 pb45 tac">'+data.message+'</div>',
                                {
                                    btn : ["知道了"],
                                    title : false,
                                    area : "530px"
                                },function(e){
                                    layer.close(e);
                             });
                        }
                        else if(+status === -2147483648){
                            layer.alert2(data.message,{
                                btn : ["知道了"]
                            },function(){
                                window.location.href = "/shopping-cart";
                            });
                        }
                        else if(data.message){
                            layer.alert2('<div class="pt45 pb45 tac">' + data.message + '</div>',
                                {
                                    title: false,
                                    btn : ["知道了"],
                                    area: '530px'
                                },
                                function(){
                                    window.location.href = "/shopping-cart";
                                }
                            );
                        }
                    };
                if(localData.orderNum){
                    request.data.orderNum = localData.orderNum;
                }
                if(localData.totalPayableAmount.bean > 0 && localData.paymentType !== 3){
                    request.data.paymentItemInfos.push({
                        currencyId : 1003,
                        amount : localData.totalPayableAmount.bean
                    });
                }
                if(localData.totalPayableAmount.redEnvelope > 0 && localData.paymentType !== 3){
                    request.data.paymentItemInfos.push({
                        currencyId : 1022,
                        voucherNum : localData.alreadyUsedAmount.redEnvelope.voucherSerialNo,
                        amount : localData.totalPayableAmount.redEnvelope
                    });
                }
                if(localData.totalPayableAmount.balance > 0 && localData.paymentType !== 3){
                    request.data.paymentItemInfos.push({
                        currencyId : 1001,
                        amount : localData.totalPayableAmount.balance
                    });
                }
                if(localData.totalGatewayPay > 0 && localData.paymentType !== 3){
                    request.data.gatewayPaymentItemInfo = {
                        amount : localData.totalGatewayPay,
                        paymentGatewayId : type
                    };
                }
                if(localData.paymentType === 3){
                    request.data.bankWitholdingPaymentInfo = {
                        amount : localData.totalPremium
                    };
                    delete request.data.paymentItemInfos;
                }
                if(localData.isShowShipAddress){
                    var shipAddressIsEmpty = true;
                    for(var i in localData.shipAddress){
                        if(localData.shipAddress[i] && i !== "id"){
                            shipAddressIsEmpty = false;
                        }
                    }
                    if(shipAddressIsEmpty){
                        layer.alert2("<div class='pt45 pb45 tac'>请填写寄送地址</div>",
                        {
                            title: false,
                            area: "530px",
                            btn : ["知道了"]
                        },function(e){
                            layer.close(e);
                        });
                        return false;
                    }
                    request.data.shipAddress = localData.shipAddress;
                }
                helper.request.postData2(request,successCallback,failCallback);
            }
        },
        initEvent : function(){
            $(document).delegate(".input-select","click",function(){
                var $selectedOption = $(this).find(".input-select-text"),
                    $optionsWrap = $(this).siblings(".hz-dropdown-content"),
                    tagName = ($selectedOption[0] || {}).tagName.toLowerCase() ;
                $optionsWrap.toggle().delegate(".hz-select-option","click",function(){
                    if(tagName === "input"){
                        $selectedOption.attr("readOnly",false).val($(this).text());
                    }
                    else if(tagName === "span"){
                        $selectedOption.text($(this).text());
                    }
                    $(this).closest(".hz-dropdown-content").hide();
                    $(this).unbind("click");
                });
            });
            $(".send-type-select").click(function(){//保单类型选择
                var
                    $optionsWrap = $(this).siblings(".hz-dropdown-content"),
                    localData = Settlement.data;
                $optionsWrap.find(".hz-select-option").click(function(){
                    var
                        needPaper = false,
                        $input = $(this).closest(".hz-dropdown").find(".input-select-text"),
                        currentInsureNum = $(this).closest("tr").data("insurenum"),
                        insureNumList = localData.insureNumList,
                        insureNumLength = insureNumList.length;
                    while (insureNumLength --){
                        if(insureNumList[insureNumLength].insuranceNum === currentInsureNum){
                            insureNumList[insureNumLength].needPaper = +$(this).data("policy-value") === 2 || +$(this).data("policy-value") === 3 ;
                        }
                    }
                    $input.data("policy-selected",$(this).data("policy-value"));
                    $(this).closest(".hz-dropdown-content").hide();
                    var
                        policySelected = $("[data-policy-selected]");
                    policySelected.each(function(){
                        if(+$(this).data("policy-selected") === 2 || +$(this).data("policy-selected") === 3)
                        {
                            needPaper = true;
                            return;
                        }
                    });
                    localData.isShowShipAddress = needPaper;
                    $("#sendMessage")[needPaper ? "show" : "hide"]();
                    $("#shipPayment")[needPaper && localData.totalPremium < 30000 ? "show" : "hide"]();
                    Settlement.command.bindTotalPremium();
                    $(this).unbind("click");
                });
            });
            $("#editAddress").click(function(){
                 Settlement.command.linkAddress();//加载地址
                 setTimeout(function(){
                    $("#mailingAddressDialog").find("input[name='addressee'],input[name='phone']").placeholder({wrapTagName: false});
                    $("#mailingAddressDialog").find("textarea[name='fullAddress']").placeholder({wrapTagName: false}).siblings("span").css("top","-22px");
                    if(Settlement.data.firstEditAddress === void 0){
                        $("#mailingAddressDialog").delegate(".hz-select-option","click",function(){
                            var
                                $form = $("#mailingAddressDialog"),
                                errorMessage = $form.data("errorMessage") || {},
                                $input = $(this).closest(".hz-dropdown").find(".input-select-text");
                            if(errorMessage[$input.attr("name")]){
                                delete errorMessage[$input.attr("name")];
                            }
                            if($.isEmptyObject(errorMessage)){
                                $form.find(".hz-alert-text").text("");
                                $form.find(".hz-alert").hide();
                            }
                            else{
                                var showMeg;
                                for(var i in errorMessage){
                                    showMeg = errorMessage[i];
                                    break;
                                }
                                $form.find(".hz-alert-text").text(showMeg);
                            }
                            $input.removeClass("input-text-error");
                            var itemData = $(this).data("item") || {};
                            $input.attr("selected-code",itemData.districtCode || itemData.cityCode || itemData.provinceCode || "");
                        });
                    }
                    Settlement.data.firstEditAddress = false;
                     var userAddress = Settlement.data.shipAddress;
                     //重置placeholder
                     if(userAddress.fullAddress === ""){
                         $("#mailingAddressDialog textarea[name='fullAddress']").siblings(".placeholder-text").show();
                     }
                     else{
                         $("#mailingAddressDialog textarea[name='fullAddress']").siblings(".placeholder-text").hide();
                     }
                     if(userAddress.name === ""){
                         $("#mailingAddressDialog input[name='addressee']").siblings(".placeholder-text").show();
                     }
                     else{
                         $("#mailingAddressDialog input[name='addressee']").siblings(".placeholder-text").hide();
                     }
                     if(userAddress.mobileNo === ""){
                         $("#mailingAddressDialog input[name='phone']").siblings(".placeholder-text").show();
                     }
                     else{
                         $("#mailingAddressDialog input[name='phone']").siblings(".placeholder-text").hide();
                     }

                 },500);
                layer.open({
                    type: 1,
                    title: "寄送地址",
                    area: '400px',
                    shadeClose: true, //点击遮罩关闭
                    content: $('.mailing-address-dialog'),
                    end : function(){
                      var
                          $form = $("#mailingAddressDialog"),
                          changeAddress = $form.data("changeAddress"),
                          errorMessage = $form.data("errorMessage");
                      $form.data("errorMessage",{});
                      $form.find("input,textarea").removeClass("input-text-error");
                      $("#mailingAddressDialog .hz-alert-error").hide();
                    }
                });

            });
            $("#beanPay").click(function(){//金豆支付
                Settlement.command.toggleSelectPayment.call(this,3);
            });
            $("#redEnvelopePay").click(function(){//红包支付
                Settlement.command.toggleSelectPayment.call(this,2);
            });
            $("#balancePay").click(function(){//余额支付
                Settlement.command.toggleSelectPayment.call(this,1);
            });
            $(".bean-amount-pay")
                .find(".discount-pay-input")
                .blur(function(){
                    Settlement.data.blurInput = $(this);
                })
                .focus(function(){//输入校验
                    Settlement.command.editAmount.call(this,3);
                    Settlement.data.blurInputOldValue = $(this).val();
                    if($("#redEnvelope .hz-dropdown-content").css("display") !== "none"){
                        $("#redEnvelope .hz-dropdown-content").hide();
                    }
                });
            $(".balance-amount-pay")
                .find(".discount-pay-input")
                .blur(function(){
                    Settlement.data.blurInput = $(this);
                })
                .focus(function(){
                    Settlement.command.editAmount.call(this,1);
                    if($("#redEnvelope .hz-dropdown-content").css("display") !== "none"){
                        $("#redEnvelope .hz-dropdown-content").hide();
                    }
                });
            $("#mailingAddressDialog").verify({//验证配送地址表单，保存配送地址
                submit : "#saveAddressBtn",
                errorAction : function($form){
                    var
                        errorMessage = $form.data("errorMessage"),
                        thisError = errorMessage[$(this).attr("name")];
                    if(thisError !== undefined){
                        $form.find(".hz-alert-text").text(thisError);
                        $(this).addClass("input-text-error");
                        $form.find(".hz-alert").show();
                    }
                    else{
                        delete errorMessage[$(this).attr("name")];
                        if($.isEmptyObject(errorMessage)){
                            $form.find(".hz-alert-text").text("");
                            $form.find(".hz-alert").hide();
                        }
                        else{
                            var showMeg;
                            for(var i in errorMessage){
                                showMeg = errorMessage[i];
                                break;
                            }
                            $form.find(".hz-alert-text").text(showMeg);
                        }
                        $(this).removeClass("input-text-error");
                    }
                },
                onSubmit : function(){
                    var
                        postAddress =  {},
                        $form = $(this),
                        errorMessage,
                        userAddress = Settlement.data.shipAddress,
                        localData = Settlement.data;
                    $form.find(".input-select-text").each(function(){
                        errorMessage = $form.data("errorMessage") || {};
                        if(($(this).val().indexOf("/") > -1 && $(this).closest(".hz-dropdown").css("display") !== "none" ) || $(this).val() === ""){
                            if($(this).attr("name") !== undefined){
                                errorMessage[$(this).attr("name")] = $(this).attr("msg");
                            }
                            $form.data("errorMessage",errorMessage).data("valid",false);
                        }
                        else{
                            delete errorMessage[$(this).attr("name")];
                        }
                    });
                    $form.find("input[type='text'],textarea").each(function(){
                        if($(this).closest(".hz-dropdown").css("display") !== "none"){
                            postAddress[$(this).attr('name')] = $(this).val();
                        }
                    });
                    errorMessage = $form.getError();
                    if($.isEmptyObject(postAddress) || !$form.data("valid")){
                        $form.find("input,textarea").each(function(){
                            if(errorMessage[$(this).attr("name")] !== undefined){
                                $form.find(".hz-alert-text").text(errorMessage[$(this).attr("name")]);
                                $(this).addClass("input-text-error");
                                $form.find(".hz-alert").show();
                                return false;
                            }
                        });
                        return false;
                    }
                    else{
                        if($.isEmptyObject(errorMessage)){
                            $form.find(".hz-alert-text").text("");
                            $form.find(".hz-alert").hide();
                            $("input,textarea").removeClass("input-text-error");
                        }
                    }
                    if($("#provinceSelect .input-select").css("display") !== "none"){
                        userAddress.provinceCode = $("#provinceSelect input").attr("selected-code");
                    }
                    if($("#citySelect").css("display") !== "none") {
                        userAddress.cityCode = $("#citySelect input").attr("selected-code");
                    }
                    else{
                        userAddress.cityCode = "";
                    }
                    if($("#areaSelect").css("display") !== "none") {
                        userAddress.districtCode = $("#areaSelect input").attr("selected-code");
                    }
                    else{
                        userAddress.districtCode = "";
                    }
                    $("#sendMessage .send-add").text(postAddress.province + (postAddress.city || "") + (postAddress.district || "") + postAddress.fullAddress).show();
                    $("#sendMessage .send-user").text(postAddress.addressee).show();
                    $("#sendMessage .send-tel").text(postAddress.phone).show();
                    Settlement.data.shipAddress.address = postAddress.fullAddress;
                    Settlement.data.shipAddress.name = postAddress.addressee;
                    Settlement.data.shipAddress.mobileNo = postAddress.phone;
                    $form.data("changeAddress",true);
                    $(this).closest(".layui-layer").find(".layui-layer-close").trigger("click");
                    $("#editAddress").text("修改");
                    //保存配送地址
                    var
                        shipAddress = localData.shipAddress,
                        request = {
                            url : "/api/users/addresses/" + localData.shipAddress.id,
                            method : "PUT",
                            data : {
                                name : shipAddress.name,
                                address : shipAddress.address,
                                mobileNo : shipAddress.mobileNo,
                                provinceCode : shipAddress.provinceCode,
                                cityCode : shipAddress.cityCode,
                                districtCode : shipAddress.districtCode
                            }
                        },
                        callback = function(data){
                        };
                    helper.request.postData2(request,callback);
                }
            });
            $("body").click(function(e){ //模拟输入框失去焦点事件
                    var
                        target = e.target,
                        $input = Settlement.data.blurInput || [];
                //关闭已经打开的下拉框
                var
                    targetDropdown = $(target).closest(".pay-amount-dropdown,#redEnvelope"),
                    toggleEl = $(target).closest("#beanPay,#redEnvelopePay,#balancePay"),
                    tTagert = $(".confirm-order-operate-list .hz-dropdown-content:visible").closest(".confirm-order-operate-item").find(".hz-check-item"),
                    cTagert = $(target).closest(".confirm-order-operate-item").find(".hz-check-item");
                if((targetDropdown.length === 0 && !(toggleEl.length !== 0 && (toggleEl.hasClass("hz-check-item-checked") || toggleEl.find(".hz-check-item-checked").length > 0))) || (cTagert.length !== 0 && tTagert.length !== 0 && cTagert[0].id !== tTagert[0].id)){
                    $(".pay-amount-dropdown .hz-dropdown-content,#redEnvelope .hz-dropdown-content").hide();
                }
                var
                    cateDrop = $(".bd-cate-dropdown .hz-dropdown-content:visible"),
                    curCateDrop = $(target).closest(".bd-cate-dropdown");
                if(curCateDrop.length === 0){
                    $(".bd-cate-dropdown .hz-dropdown-content").hide();
                }
                else if(cateDrop.closest("tr").data("insurenum") !== curCateDrop.closest("tr").data("insurenum")){
                    $(".bd-cate-dropdown .hz-dropdown-content").hide();
                }
                //关闭下拉的支付
                if($(target).closest("#payTypeSelect").length === 0 && $("#payTypeSelect .hz-dropdown-content").css("display") !== "none"){
                    $("#payTypeSelect .hz-dropdown-content").hide();
                }
                if($input.length === 0){
                    return;
                }
                //验证支付组合
                var
                    isFrozenSelect = $(target).closest(".bean-amount-pay,.balance-amount-pay").length !== 0 && $(target).closest(".pay-amount-dropdown").length !== 0,
                    isThisInput = ($input[0] || {}).id === target.id,
                    isSubmitBtn = target.id === "submitPayment",
                    type = 0,
                    localData = Settlement.data,
                    command = Settlement.command,
                    checkBtnId = $input.closest(".confirm-order-operate-item").find(".hz-check-item").attr("id"),
                    isCurrentCheck = target.id === checkBtnId || $(target).closest(".hz-check-item").attr("id") === checkBtnId;
                if(!isFrozenSelect && !isThisInput && $input.length !== 0 && !isCurrentCheck){
                    $input.val($input.val().trim());
                    if($input[0].id === "beanPaymentInput" && !/^\d+$/.test($input.val())){
                        layer.msg("请输入正整数");
                        $input.val(0);
                    }
                    if($input[0].id === "balancePaymentInput"){
                        var dotValue = /^\d+(?:\.(\d+))?$/.exec($input.val());
                        if(dotValue === null){
                            layer.msg("请输入正确的金额");
                            $input.val("0.00");
                        }
                        else if(dotValue[1] !== undefined && dotValue[0].length > 2){
                            $input.val(Number($input.val()).toFixed(2));
                        }
                    }
                    type = $input.closest(".bean-amount-pay,.balance-amount-pay").hasClass("bean-amount-pay") === true ? 3 : 1;
                    var inputVal = Number(localData.blurInput.val());
                    if((type === 1 ? Math.round(inputVal * 100) : inputVal) > localData.ableAmount[type === 1 ? "balance" : "bean"]){
                        var lastInput = localData.blurInputOldValue;
                        layer.alert2("你输入的" + (type === 1 ? "金额" : "金豆数量") + "不能大于当前可用的"+ (type === 1 ? "金额" : "金豆数量") + "",{
                            btn : ["知道了"],
                            closeBtn : 0
                        },function(e){
                            $input.val(lastInput);
                            localData.totalPayableAmount[type === 1 ? "balance" : "bean"] = Math.round((lastInput * (type === 1 ? 100 : 1)));
                            layer.close(e);
                        });
                        localData.blurInput = [];
                        return;
                    }
                    if(isSubmitBtn){
                        layer.msg("正在验证支付方式，请稍后提交!");
                        localData.submitLocked = true;
                    }
                    else{
                        command.lockSubmitPayment();
                    }
                    command.checkBalanceBean.call($input,type, function(){
                        var discountAmount = $input.val();
                        $input.parent().append($("<span class='discount-amount-value'></span>").text("-￥" + (type === 1 ? Number(discountAmount) : discountAmount / 100).toFixed(2)));
                        command.bindTotalPremium();
                    });
                }
            });
            $(".bean-amount-pay,.balance-amount-pay,.red-envelope-pay").delegate(".un-frozen-account","click",function(){//解冻
                var
                    localData = Settlement.data,
                    orderNum = $(this).parent().data("order-num") || "",
                    type = $(this).closest(".bean-amount-pay").length > 0 ? 3 : $(this).closest(".balance-amount-pay").length > 0 ? 1 : 2,
                    $pay = $(this).closest(".bean-amount-pay,.balance-amount-pay,.red-envelope-pay"),
                    voucherSerialNo = localData.alreadyUsedAmount.redEnvelope.voucherSerialNo,
                    frozenAmount = $(this).parent().data("amount"),
                    $input = $pay.find(".discount-pay-input"),
                    command = Settlement.command;
                command.unFrozenAmount.call($pay,orderNum,type,function(data){
                    command.lockSubmitPayment("正在解冻");
                    command.getBalanceBeanAmount(function(data){
                        command.checkInputPaymentInfos(function(combinationData){
                            var combinationResult = (combinationData || {}).result || {};
                            localData.ableAmount.redEnvelope = (combinationResult.accountRedEnvelopeInfo || {}).availableRedEnvelopes || [];
                            localData.frozenAmount.redEnvelope = (combinationResult.accountRedEnvelopeInfo || {}).frozenRedEnvelopes || [];
                            var
                                balanceBeanInfos = data,
                                isShowRedEnvelope = $("#redEnvelopePay").hasClass("hz-check-item-checked");
                            $.each(balanceBeanInfos.accountBalances || [],function(i,v){
                                if(v.currencyId === 1001){
                                    localData.currentAbleAmount.balance = $("#balancePaymentInput").val() || localData.currentAbleAmount.balance;
                                }
                                else if(v.currencyId === 1003){
                                    localData.currentAbleAmount.bean = $("#beanPaymentInput").val() || localData.currentAbleAmount.bean;
                                }
                            });
                            command.bindRedEnvelope((combinationResult.bestRedEnvelope || {}).voucherSerialNo || voucherSerialNo,isShowRedEnvelope);
                            command.bindBalanceBeanAmount.call($pay,type);
                            command.unlockSubmitPayment();
                        });
                    });
                });
            });
            $(".red-envelope-pay").delegate('.target-red-button','click', function(){//激活新红包
                $('.dialog-new-red').find(".voucher-serial-input").val("").removeClass("input-text-error");
                $('.dialog-new-red').find(".hz-alert").hide();
                var x = layer.open({
                    type: 1,
                    title: "激活新红包",
                    area: '400px',
                    shadeClose: true, //点击遮罩关闭
                    content: $('.dialog-new-red')
                });
            });
            $("#activateRedEnvelope").click(function(){
                var
                    $input = $(".dialog-new-red").find(".voucher-serial-input"),
                    voucherSerialNo = $input.val() || "";
                if(voucherSerialNo === ""){
                    $(".dialog-new-red").find(".hz-alert").addClass("hz-alert-error").show();
                    $input.addClass("input-text-error");
                    return;
                }
                else{
                    $(".dialog-new-red").find(".hz-alert").removeClass("hz-alert-error").hide();
                    $input.removeClass("input-text-error");
                }
                Settlement.command.activateRedEnvelope.call(this,voucherSerialNo);
            });
            $(".red-envelope-pay").delegate(".use-redEnvelope-btn","click",function(){//使用红包
                var
                    voucherSerialNo = $(this).parent().data("oucher-num"),
                    amount = $(this).parent().data("discount-redenvelope");
                Settlement.data.alreadyUsedAmount.redEnvelope.voucherSerialNo = voucherSerialNo;
                Settlement.data.ableAmount.tryRedEnvelopeAmount = amount;
                if(voucherSerialNo){
                    Settlement.command.useRedEnvelope.call($(this),voucherSerialNo,amount);
                }
            });
            $("#submitPayment").click(function(){//立即支付
                var gateWayType = $.trim($("#payTypeSelect .input-select-text:visible").text()) === "转账汇款" ? 0 : 99;
                Settlement.command.submitPayment(gateWayType);
            });
            //$("#bankTransfer").click(function(){//立即支付
            //    Settlement.command.submitPayment(0);
            //});
        }
    };
    return Settlement;
});