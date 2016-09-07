/**
 * 详情页交互JS.
 */
define(["jquery", "underscore", "exports", "require", "module", "helper", "layer",'top-menu','animate-fly'], function($, _, exports, require, module, helper, layer,topMenu) {
    'use strict';
    var MAX_SHOPCOUNT = 20; //购物车最大数量
    var AdviserInfoDto;//绑定顾问
    var MAX_VIEW_HISTORY=20; //最多的浏览记录
    var productStatusResult;
    var P = {
        isLogin: false,
        renewalNum: '',
        isRenewal: false,
        toolFloat:{},
        trialBox: {},
        init: function(trialBox) {
            this.trialBox = trialBox;
            P.render.initTool();
            if (helper.cookie.getCookie("compareProducts").indexOf(($("#planId").val() || $("#productId").val())) > -1) {
                $("#addToCompare").addClass("hz-check-item-checked");
                $("#addToCompare .hz-check-text").html("已加入对比");
            }
            if($("#pcProductStatus").val()==="1") {}//20160706
                P.actions.addHistoryPlan($("#planId").val() || $("#productId").val(), $("#productId").val());

            P.actions.getProductStatus();
            P.actions.replaceProduct();
            var renewalParam;
            renewalParam = helper.url.getUrlVar('ep');
            if (renewalParam) {
                var renewalParams = {};
                renewalParam = renewalParam.split('~');
                renewalParam.forEach(function(item, i) {
                    var key = item.split('_')[0];
                    var value = item.split('_')[1];
                    renewalParams[key] = value;
                });
                P.renewalNum = renewalParams.ins;
                P.isRenewal = renewalParams.IsRenewal === '1';
            }
            P.render.combineProtect();
        },
        io: {},
        topMenu: {},
        render: {
            initTool: function() { //加载工具
                var self = this;
                requirejs(["share-panel", "fix-float", "fixed-tool-float"], function(sharePanel, fixFloat, toolFloat) { // 加载工具条
                    var share = new sharePanel({
                        items: ["sina", "zone"],
                        url: location.href,
                        summary: $('#productName').val()+($('#productPlanName').html()||""),
                        productId: $("#productId").val(),
                        planId: ($("#planId").val() || $("#productId").val())
                    });
                    var fix = new fixFloat({
                        el: $("#detialTab"),
                        fixPanel: $("#detaTabLayout"),
                        fixClass: "fixed-detail-tab-wrap"
                    }); //设置滚动固定层
                    var fixPrice = new fixFloat({
                        el: $("#silderbar"),
                        fixPanel: $("#detaTabLayout"),
                        fixClass: "fixed-sidebar"
                    });
                    P.toolFloat=new toolFloat();
                    P.actions.isFavorite();
                    P.actions.initAction();
                });
                helper.state.checkLogin(function(result) {
                    P.isLogin=result.result;
                    if(P.isLogin){
                        helper.request.getJson({url:"/api/users/customer-service"},function(result){
                            AdviserInfoDto=result.result;
                            if(AdviserInfoDto.adviserInfoList&&AdviserInfoDto.adviserInfoList.length){
                                $("#contactkefu").removeClass("fn-hide");
                                $("#onlinekefu").addClass("fn-hide");
                                $("#contactkefu").attr("href","http://kefu.hzins.com/chat?domain=hzins&businessType=Xm4FWr0dncw&referrer=" + encodeURIComponent(window.location.href)+"&consultant="+AdviserInfoDto.adviserInfoList[0].employeeNo);
                            }else{
                                $("#onlinekefu").removeClass("fn-hide");
                                $("#onlinekefu").attr("href","http://kefu.hzins.com/chat?domain=hzins&businessType=Xm4FWr0dncw&referrer=" + encodeURIComponent(window.location.href));
                            }
                        });
                    }else{
                        $("#onlinekefu").removeClass("fn-hide");
                        $("#onlinekefu").attr("href","http://kefu.hzins.com/chat?domain=hzins&businessType=Xm4FWr0dncw&referrer=" + encodeURIComponent(window.location.href));
                    }
                });
            },
            combineProtect:function(){//合并保障项目
                var _$pitem,
                    _$nextpitem,
                    _$prevpitem,
                    _$itemList= $("#protectArea li[trialitemid]");
                _$itemList.each(function(i){
                    _$pitem=$(this);
                    _$nextpitem=$(_$itemList[i+1]);
                    _$prevpitem=((i-1)>=0)?$(_$itemList[i-1]):null;
                    if(_$pitem&&_$nextpitem){
                        if(_$pitem.attr("trialitemid")===_$nextpitem.attr("trialitemid")){
                            _$pitem.css("border-bottom","none");
                        }
                    }
                    if(_$pitem&&_$prevpitem){
                        if(_$pitem.attr("trialitemid")===_$prevpitem.attr("trialitemid")){
                            $("#protectArea .row01 div",_$pitem).hide();
                            $("#protectArea .row02 div",_$pitem).hide();
                        }
                    }
                });
            }
        },
        actions: {
            initAction: function () {//绑定事件
                var _fixedTopTool = function(){//动态绑定头部工具条和右侧浮层
                    var winWidth = window.document.body.clientWidth || 0;
                    if($("#detialTab").hasClass("fixed-detail-tab-wrap") && winWidth < 1190){
                        $("#detialTab .layout").width(winWidth);
                    }
                    else{
                        $("#detialTab .layout").width(1190);
                    }
                    if($("#silderbar").hasClass("fixed-sidebar") && winWidth < 1190){
                        $("#silderbar").css("right","6px");
                    }
                    else{
                        $("#silderbar").css("right",'auto');
                    }
                }
                _fixedTopTool();
                $(window).scroll(function(){
                    _fixedTopTool();
                });
                $("#favorite").bind("click", function () {
                    if(P.isLogin){
                        if(!$("#favorite").hasClass("active")) {
                            helper.request.getCrossJson({
                                url: "//i.huize.com/MyFavorite/Add",
                                data: {
                                    productProtectPlanId: $("#planId").val() || $("#productId").val(),
                                    isFavorite: true
                                }
                            }, function(result) {
                                if (result.IsSuccess) {
                                    layer.msg('收藏成功');
                                    $("#favorite").addClass("active").find("span").text("已收藏");
                                    $("#favorite").find('.iconfont').html("&#xe744;");
                                    //(new topMenu ()).bindFavorite();
                                } else {
                                    layer.msg("收藏失败");
                                }
                            });
                        } else {
                            layer.confirm("<div class='pt45 pb45 tac'>确定取消该产品的收藏吗</div>",{
                                btn : ["取消","确定"],
                                area: "530px",
                                title : false,
                                btn1 : function(index){
                                    layer.close(index);
                                },
                                btn2 : function(index){
                                    helper.request.getCrossJson({
                                        url: "//i.huize.com/MyFavorite/Delete4Jsonp",
                                        data: {
                                            productProtectPlanId: $("#planId").val() || 4776
                                        }
                                    }, function(result) {
                                        if (result.IsSuccess) {
                                            layer.msg('取消成功');
                                            $("#favorite").removeClass("active").find("span").text("收藏");
                                            $("#favorite").find('.iconfont').html("&#xe741;");
                                            //(new topMenu).bindFavorite();
                                        } else {
                                            layer.msg("取消失败");
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        requirejs(["sign-float"], function(signFloat) {
                            var sign = new signFloat({
                                returnUrl: location.href,
                                showRegister: true,
                                callback: function(data) { //登录成功回调
                                    location.reload();
                                }
                            });
                        });
                    }
                });
                $("#addToCompare").bind("click", function() {//加入对比
                    if ($(this).hasClass("hz-check-item-checked")) {
                        $(this).removeClass("hz-check-item-checked");
                        P.toolFloat.delcomparePro($("#planId").val() || $("#productId").val());
                        $("#addToCompare .hz-check-text").html("加入对比");
                    } else {
                         if(P.toolFloat.getCompareCount()>=4){//获取当前对比数量
                             layer.msg("对比数目最大不能超过4个");
                             return;
                         };
                        $(this).addClass("hz-check-item-checked");
                        $("#addToCompare .hz-check-text").html("已加入对比");
                        $("#fixedsidetool").css("right",0);
                        $("#wrapToolMenu").css("left",0);
                        P.actions.animateFly($(this),$("#compareCount"),function(){
                            P.toolFloat.addcomparePro($("#planId").val() || $("#productId").val());
                        });
                    }

                });
                $("a[addtoShopCar],a[insuredstart]").bind("click", function(e) { //添加购物车

                    if ($(this).hasClass("hz-button-disabled")) {
                        return;
                    }
                    var _this = this,
                        trialInfo = P.trialBox[$("#planId").val() || $("#productId").val()],
                        insureListCreate = [],
                        postInsureData = {},

                        startInsure = $(_this).attr("insuredstart") !== undefined; //用户是否是点击立即投保

                    if(startInsure&&$("#pcBuyType").val()==="2"){//如果是保险公司购买，则跳到保险公司页面
                        var companyUrl=$("#companyBuyUrl").val();
                        if(companyUrl.indexOf("http://")===-1){
                            companyUrl="http://"+companyUrl;
                        }
                        helper.page.openNewTag(companyUrl);
                        return;
                    }

                    var showStatusTip=function(){
                        if(startInsure&&productStatusResult.orderStatus===1){
                            var dayText=productStatusResult.failureTimeEnd.split("T")[1].split(":");
                            layer.confirm(productStatusResult.notice.replace("#00:00#","<font color='red'>"+productStatusResult.endHour+"</font>"),{
                                btn: ['看看同类产品','继续购买'],
                                area:'530px',
                                btn1:function(){
                                    helper.page.openNewTag("/product/ins-"+$("#categoryId").val()+"-0-0");
                                },
                                btn2:function(){
                                    toInsure();
                                }
                            });
                        }else {
                            toInsure();
                        }
                    };

                    var toInsure=function() {

                        postInsureData.restrictRule = {
                            platform: "1",
                            channel: 1
                        };
                        //postInsureData.restrictRule.restrictGenes=JSON.parse(trialInfo.getGenesString()).genes;
                        postInsureData.genes = JSON.parse(trialInfo.getGenesString()).genes;
                        postInsureData.productId = ~~trialInfo.productId;
                        postInsureData.planId = trialInfo.productPlanId;
                        postInsureData.totalNum = 1;
                        postInsureData.inShoppingCart = !startInsure;

                        if (P.isRenewal) { //续保
                            postInsureData.renewalInsureNum = P.renewalNum;
                        }
                        insureListCreate.push(postInsureData);
                        helper.request.postData2({
                            url: "/api/insurance-slips",
                            data: insureListCreate
                        }, function (result) {
                            var data = result.result;
                            if (!data) {
                                if (startInsure) {
                                    layer.msg(result.message || "创建投保单失败");
                                } else {
                                    layer.msg(result.message || "添加购物车失败");
                                }
                                return;
                            }
                            var toInsure = function () {//跳到投保页面
                                if (data[0].insureNum) {
                                    if (data[0].healthPosition === 0) {//有健康告知 跳到健康告知
                                        location.href = "//is.huize.com/product/insure/health-inform?insuranceNum=" + data[0].insureNum + "&planId=" + data[0].planId;
                                    } else {
                                        location.href = "//is.huize.com/product/insure?insureNumber=" + data[0].insureNum + "&DProtectPlanId="+postInsureData.planId;
                                    }
                                }
                            };
                            if (P.isLogin) {
                                if (startInsure) {
                                    helper.state.checkLogin(function (result) {
                                        P.isLogin = result.result;
                                        if (P.isLogin) {
                                            toInsure();
                                        } else {
                                            requirejs(["sign-float"], function (signFloat) {
                                                var sign = new signFloat({
                                                    returnUrl: location.href,
                                                    showRegister: true,
                                                    callback: function (loginData) { //登录成功回调
                                                        toInsure();
                                                    }
                                                });
                                            });
                                        }
                                    });

                                } else {
                                    $("#fixedsidetool").css("right",0);
                                    $("#wrapToolMenu").css("left",0);
                                    P.actions.animateFly($(_this), $("#showCarBtn"), function () {
                                        layer.msg("加入购物车成功");
                                        P.toolFloat.refreshShopCar();//刷新购物车数量
                                    });
                                }
                                return;
                            } else {//未登录加入购物车
                                if (startInsure) {
                                    requirejs(["sign-float"], function (signFloat) {
                                        var sign = new signFloat({
                                            returnUrl: location.href,
                                            showRegister: true,
                                            callback: function (loginData) { //登录成功回调
                                                toInsure();
                                            }
                                        });
                                    });
                                    return;
                                }
                                var insureStr = helper.cookie.getCookie("InsureNums");
                                if (insureStr.split(",").length === MAX_SHOPCOUNT) {
                                    layer.alert("购物车数量达到上限，请先结算购物车中的产品", {
                                        btn: ["去购物车"]
                                    }, function (index) {
                                        layer.close(index);
                                        location.href = "//is.huize.com/shopping-cart/";
                                    });
                                    return;
                                }
                                $(data).each(function (intex, item) {
                                    if (insureStr.indexOf(item.insureNum) === -1) {
                                        if (insureStr) {
                                            insureStr = insureStr + "," + item.insureNum;
                                        } else {
                                            insureStr = insureStr + item.insureNum;
                                        }
                                        helper.cookie.setCookie("InsureNums", insureStr, 1000 * 60 * 60 * 24, ".huize.com");
                                    }
                                });
                                $("#fixedsidetool").css("right",0);
                                $("#wrapToolMenu").css("left",0);
                                P.actions.animateFly($(_this), $("#showCarBtn"), function () {
                                    layer.msg("加入购物车成功");
                                    P.toolFloat.refreshShopCar();//刷新购物车数量
                                });

                            }
                        });
                    };

                    if(typeof(productStatusResult)==="undefined"&&!startInsure){
                        P.actions.getProductStatus(function(data){
                            productStatusResult=data.result;
                            showStatusTip();
                        });
                    }else{
                        showStatusTip();
                    }


                });
                $("#recommendTableContent").delegate(".hz-button", "click", function() { //添加组合到购物
                    var $recommd = $("div[data-tab='recommend-" + $(this).attr("dindex") + "'] ul li");
                    var carList = [];
                    var _this = $(this);
                    for (var i = 0; i < $recommd.length; i++) {
                        if ($($recommd[i]).attr("planId")) {
                            carList.push({
                                planId: $($recommd[i]).attr("planId"),
                                productId: $($recommd[i]).attr("productId"),
                                inShoppingCart: true
                            });
                        }
                    }

                    helper.request.postData2({
                        url: "/api/insurance-slips",
                        data: carList
                    }, function(result) {
                        var data = result.result;
                        if (!data) {
                            layer.msg(result.message || "添加购物车失败");
                            return;
                        }
                        if(P.isLogin){
                            P.actions.animateFly($(_this), $("#showCarBtn"), function () {
                                layer.msg("加入购物车成功");
                                P.toolFloat.refreshShopCar();//刷新购物车数量
                            });
                            return;
                        } else { //未登录加入购物车
                            var insureStr = helper.cookie.getCookie("InsureNums");
                            if (insureStr.split(",").length === MAX_SHOPCOUNT) {
                                layer.alert("购物车数量达到上限，请先结算购物车中的产品", {
                                    btn: ["去购物车"]
                                }, function(index) {
                                    layer.close(index);
                                    location.href = "//is.huize.com/shopping-cart/";
                                });
                                return;
                            }

                            $(data).each(function(intex, item) {
                                if (insureStr.indexOf(item.insureNum) === -1) {
                                    if (insureStr) {
                                        insureStr = insureStr + "," + item.insureNum;
                                    } else {
                                        insureStr = insureStr + item.insureNum;
                                    }
                                    helper.cookie.setCookie("InsureNums", insureStr, 1000 * 60 * 60 * 24, ".huize.com");
                                }
                            });
                            P.actions.animateFly($(_this), $("#showCarBtn"), function () {
                                layer.msg("加入购物车成功");
                                P.toolFloat.refreshShopCar();//刷新购物车数量
                            });
                        }
                    });

                });
                $("#planIdBox .primary-link").bind("click", P.actions.showPlansCompare);
            },

            replaceProduct:function(){//显示替换产品
                var pcStatus=$("#pcProductStatus").val();
                var pcReplace=$("#pcReplaceId").val();
                var _this=this;
                if(pcStatus==="2"&&pcReplace){
                    helper.request.getJson({url:"/api/products/plans/"+pcReplace+"/similar"},function(data){
                        if(data.result){
                            require(["require-text!/html/product/replace-product.html"], function(html) {
                                var relateId,
                                    _pitem;
                                    $.each(((data.result.restrictRules&&data.result.restrictRules.protectTrialItemList)||[]), function () {//处理关联保额
                                        relateId = this.relateCoverageId;
                                        _pitem=this;
                                        if (relateId) {
                                            $.each(data.result.restrictRules.restrictGenes, function () {
                                                if (this.protectItemId === ~~relateId) {
                                                    if(!this.defaultValue){//如果没有默认值，则显示范围
                                                        if(this.dictionaryList&&this.dictionaryList.length>0){
                                                            _pitem.fullPremium=this.dictionaryList[0].value+_this.getUnit(this.dictionaryList[0].unit);
                                                        }
                                                    }else {
                                                        _pitem.fullPremium = this.defaultValue;
                                                    }
                                                }
                                            });
                                        }
                                    });
                                layer.open({
                                    type: 1,
                                    title:'系统提示',
                                    area: ['860px'],
                                    content: _.template(html)({data:data.result})
                                });
                            });
                        }
                    });
                }
            },
            getProductStatus: function(callback) {//获取产品状态
                helper.request.getJson({url:"/api/products/"+$("#productId").val()+"/issuing-state"},function(data){
                    productStatusResult=data.result;
                    var pcStatus=$("#pcProductStatus").val();
                    if(productStatusResult.orderStatus===2&&(pcStatus==="2"||pcStatus==="0")){//下架，停售弹
                        var dates=productStatusResult.failureTimeEnd.split("T");
                        var dayText=dates[0].split("-");
                        var timeText=dates[1].split(":");
                        var timeTip=productStatusResult.notice.replace("yyyy",dayText[0]).replace("MM",dayText[1]).replace("dd",dayText[2])
                            .replace("HH",timeText[0]).replace("mm",timeText[1]).replace("#","<font color='red'>").replace("#","</font>").replace(/"/g,"");
                        helper.page.showSingleBtn(timeTip,function(){
                            helper.page.openNewTag("/product/ins-"+$("#categoryId").val()+"-0-0");
                        },'看看同类产品');

                    }
                },function(data){

                });
            },
            showPlansCompare: function() {
                var planIds = [],
                    plans = [],
                    planId,
                    _this=this,
                    planName;
                $("#planIdBox a.filter-tag ").each(function() {
                    planId = $(this).data("productplanid");
                    planName = $(this).html();
                    planIds.push(planId);
                    plans.push({
                        planId: planId,
                        planName: planName
                    });
                });
                helper.request.postData2({
                    url: "/api/products/plans-comparison",
                    data: planIds
                }, function(result) {

                    require(["require-text!/html/product/plans-compara.html"], function(html) {
                        var keyList=P.actions.getPlansCompare(result.result,plans);
                        var index = layer.open({
                            type: 1,
                            closeBtn: 1, //不显示关闭按钮
                            area: ['860px', '500px'],
                            shift: 2,
                            title:"计划对比",
                            shadeClose: true, //开启遮罩关闭
                            content: _.template(html)({
                                plans: plans,
                                keyList:keyList.list,
                                itemIndex:keyList.count,
                                gens:result.result
                            })
                        });
                        var currentLen = $("#planList").find('.hz-check-item-checked').length + 1;
                        //默认宽度800
                        if(currentLen<6) {
                            $('#tabgen').width(5*160);
                        }else { //动态计算div宽度
                            $('#tabgen').width(currentLen*160);
                        }
                        $("#planList").delegate("div", "click", function() {
                            var planId = $(this).attr("planId");
                            $(this).toggleClass("hz-check-item-checked");
                            $("#tabgen td[planId=" + planId + "],#tabgen col[planId=" + planId + "],#tabgen col[planId=" + planId + "],#tabgen th[planId=" + planId + "]").toggleClass("fn-hide");

                            var currentLen = $("#planList").find('.hz-check-item-checked').length + 1;
                            //默认宽度800
                            if(currentLen<6) {
//                                $('#tabgen').width(5*160).find("col").width((800 / currentLen));
                                $('#tabgen').width(5*160).find("col").attr('width',(100/currentLen)+'%');

                            }else { //动态计算div宽度
                                $('#tabgen').width(currentLen*160).find("col").attr('width','160px');
                            }

                        });
                        $("#planHead").delegate("th", "click", function() {
                            var planName = "",
                                planId=$(this).attr("planId");
                            if ($(this).hasClass("active")) {
                                planName = $(".popover-content.fb", this).html();
                                $(this).html(planName);
                                $(this).removeClass("active");
                                $("#tabgen td[planId='"+planId+"']").removeClass("active");
                            } else {
                                planName = $(this).html();
                                if(planName === ""){
                                    return;
                                }
                                $(this).html('<div class="popover top"><div class="popover-content fb">' + planName + '</div><div class="arrow"></div><div class="arrow2"></div></div>');
                                $(this).addClass("active");
                                $("#tabgen td[planId='"+planId+"']").addClass("active");
                            }
                        });
                        $("#planHead th[planid='"+$("#planId").val()+"']").click();
                    });
                });
            },
            favoriteAction: function(option) {
                helper.request.getCrossJson({
                    url: option.url, // "//i.hzins.com/MyFavorite/Add",
                    data: {
                        productProtectPlanId: $("#planId").val() || $("#productId").val(),
                        isFavorite: true
                    }
                }, function(result) {
                    if (result.IsSuccess) {
                        layer.msg('收藏成功');
                        $("#favorite").addClass("active").find("span").text("已收藏");
                        $("#favorite").find('.iconfont').html("&#xe744;");//实心

                    } else {
                        layer.msg("收藏失败");
                    }
                });
            },
            isFavorite: function() { //判断本计划是否已经收藏收藏产品
                helper.request.getCrossJson({
                    url: "//i.huize.com/MyFavorite/CheckProductPlanIsFavorite",
                    data: {
                        productProtectPlanId: $("#planId").val() || $("#productId").val()
                    }
                }, function(result) {
                    if (result.Data) {
                        $("#favorite").addClass("active").find("span").text("已收藏");
                        $("#favorite").find('.iconfont').html("&#xe744;");
                    }
                });
            },
            addHistoryPlan: function(planId,productId) { //保存浏览记录信息
                var _this=this;
                if (!planId) {
                    return;
                }
                var
                    historyPlanListStr = helper.cookie.getCookie("Product_History"),
                    tempArr = historyPlanListStr.split(","),
                    _historyStr;
                if(tempArr.length >= MAX_VIEW_HISTORY){
                    var firstHistory = tempArr[tempArr.length-1];
                    _historyStr = _this.cookieStr(historyPlanListStr,firstHistory.split(":")[1],firstHistory.split(":")[0],2);
                    historyPlanListStr = _historyStr;
                }
                _historyStr = _this.cookieStr(historyPlanListStr,planId,productId,1);
                if (_historyStr&&_historyStr.length>0) { //判断是否存在
                    helper.cookie.setCookie("Product_History", _historyStr, (5 * 24 * 60 * 60 * 1000),".huize.com");
                }
            },
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
            cookieStr:function(str,id,productId,type){//type操作类型
                var ids=str.split(","),
                    tempValue="";
                ids=$.grep(ids,function(str){//删除空元素
                    return str!=="";
                });
                if(type===1){
                    for(var i=0;i<ids.length;i++){
                        if(ids[i]===productId+":"+id||ids[i].split(":")[0]===productId+""){//如果之前有浏览过的话就放在最前面
                            tempValue=ids[i];
                            ids.splice(i,1);
                            ids.unshift(tempValue);
                            return ids.join(",");
                        }
                    }
                    ids.unshift(productId+":"+id);
                }else{
                    for(var i=0;i<ids.length;i++){
                        if(ids[i]===productId+":"+id){
                            ids.splice(i,1);
                            return ids.join(",");
                        }
                    }
                }
                return ids.join(",");
            },
             getUnit:function(number) { //转换相应的单位，后台返回的单位是数字
                return {
                    0: '',
                    1: '份',
                    2: '万元',
                    3: '元',
                    4: '0元',
                    5: '00元',
                    6: '000元',
                    7: '岁',
                    8: '年',
                    9: '月',
                    10: '天',
                    11: '元/年'
                }[number];
            },
            getProtectItem:function(pid,lists){
                    var premeuItem;
                    _.each(lists,function(item,index){
                        if(item.protectItemId===~~pid){
                            premeuItem=item;
                        }
                    });
                     return premeuItem||{};
             },
            getPlanValue:function(protectItem,itemValue,insureItem){//获取值
                var _valueText="",
                    _preText="",//合并保障目值
                    _this=this;
                if(protectItem.subRestrictGeneList&&protectItem.subRestrictGeneList.length>0){//地区
                    if(protectItem.subRestrictGeneList[0].dictionaryList) {
                        $.each(insureItem.insureAreaList,function(){
                            _valueText=_valueText+this.provinceName;
                            if(this.cityName){
                                _valueText=_valueText+"-"+this.cityName;
                            }
                            if(this.areaName){
                                _valueText=_valueText+"-"+this.areaName;
                            }
                            _valueText=_valueText+",";
                        });
                    }
                    if(_valueText){
                        return  _valueText.length>100?_valueText.substr(0,100).replace(/,$/,"")+"...":_valueText;
                    }
                }else if(protectItem.dictionaryList&&protectItem.dictionaryList.length>0&&protectItem.key==="insurantJob"){//职业
                    $(protectItem.dictionaryList).each(function(){
                        _valueText = _valueText +this.value+",";
                    });
                    if(_valueText){
                        return _valueText.replace(/,$/,"");
                    }
                }
                _preText=itemValue?"<p>"+itemValue+"</p>":"";
                return _preText+(protectItem.defaultValue || protectItem.fullPremium || (protectItem.premium && ((protectItem.premium / 100).toFixed(2) + _this.getUnit(protectItem.unit))) || "");
            },
            getPlansCompare:function(gens,plans){
                var keyList={},
                    itemIndex= 0,
                    _this=this,
                    _objkeyList=[],
                    objkey="";
                var objKeyFun=function(optList,pindex,item){
                    _.each(optList,function(opitem){//组装字段
                        objkey=(opitem.key||opitem.name||opitem.trialItemId)+":"+opitem.name;
                        if(opitem.display){
                            if(!keyList[objkey]){

                                keyList[objkey]={t:opitem.name};

                                if(opitem.relateCoverageId){
                                    keyList[objkey][""+plans[pindex].planId]= _this.getProtectItem(opitem.relateCoverageId,item.restrictRuleOperList[0].restrictGenes).defaultValue;
                                }else{
                                    keyList[objkey][""+plans[pindex].planId]=_this.getPlanValue(opitem,keyList[objkey][""+plans[pindex].planId],item);
                                }
                                itemIndex=itemIndex+1;
                                _objkeyList.push(keyList[objkey]);
                            }else{
                                if(opitem.relateCoverageId){
                                    keyList[objkey][""+plans[pindex].planId]= _this.getProtectItem(opitem.relateCoverageId,item.restrictRuleOperList[0].restrictGenes).defaultValue;
                                }else {
                                    keyList[objkey]["" + plans[pindex].planId] =_this.getPlanValue(opitem, keyList[objkey]["" + plans[pindex].planId],item);
                                }
                            }

                        }
                    });
                };
                _.each(gens,function(item,pindex){
                    objKeyFun(item.restrictRuleOperList[0].restrictGenes,pindex,item);//组装试算因子
                });
                _.each(gens,function(item,pindex){
                    objKeyFun(item.restrictRuleOperList[0].protectTrialItemList,pindex,item);//组装保障项目
                });
                var len = _objkeyList.length;
                for(var i = 0; i < len; i++){
                    for(var j = i + 1;j < len; j++){
                        if($.trim(_objkeyList[i].t) === $.trim(_objkeyList[j].t)){
                            _objkeyList[i] = _.extend(_objkeyList[i],_objkeyList[j]);
                            _objkeyList.splice(j,1);
                            len --;
                        }
                    }
                }
                return {list:_objkeyList,count:itemIndex};
            }
        }
    };
    return P;
});