/**
 * 详情页交互JS.
 */
define(["jquery","underscore","exports","require","module","helper","layer"],function($,_,exports,require,module,helper,layer) {
    var P = {
        isLogin:false,
        trialBox:{},
        init: function (trialBox) {
            this.trialBox=trialBox;
            P.render.initTool();
            if(helper.cookie.getCookie("compareProducts").indexOf("20024:")>-1){
                $("#addToCompare").addClass("hz-check-item-checked");
            }
           P.actions.addHistoryPlan($("#planId").val()||$("#productId").val());
        },
        io: {},
        topMenu:{},
        render: {
            initTool: function () {//加载工具
                var self=this;
                requirejs(["share-panel","fix-float","fixed-tool-float"], function (sharePanel, fixFloat,toolFloat) {   // 加载工具条
                    var share = new sharePanel({
                        items: ["sina", "zone"],
                        url: this.location.href,
                        summary: "afsdfsdfsdf"
                    });
                    var fix=new fixFloat({el:$("#detialTab"),fixPanel:$("#detaTabLayout"),fixClass:"fixed-detail-tab-wrap"});//设置滚动固定层
                    var fixPrice=new fixFloat({el:$("#silderbar"),fixPanel:$("#detaTabLayout"),fixClass:"fixed-sidebar"});
                    var tool = new toolFloat();
                    window.toolFloat=tool;//暴露接口，兼容老版本
                    P.actions.isFavorite();
                    P.actions.initAction();
                });
                helper.state.checkLogin(function(result){
                    isLogin=result.result;
                });

            },
            initKkPager:function(total){
                if(!Math.floor(~~total/10)){//判断是否足够分页，不足够则隐藏分页组件
                    $("#kkpager").hide();
                }else{
                    $("#kkpager").show();
                }
                if(kkpager.generPageHtml) {
                    kkpager.generPageHtml({
                        pno: 1,
                        total: Math.ceil(total/10),
                        totalRecords: ~~total,
                        hrefFormer: 'pager_test',
                        hrefLatter: '.html',
                        click: function (n) {
                            var productId = 10;
                            var dataString = $("#reviewTable li.active").attr("data-tab");
                            var type = dataString.substr(dataString.length - 1, 1);
                            helper.request.getJson({
                                url: "/products/" + productId + "/comments?",
                                data: {limit: 10, page: n, type: ~~type}
                            }, function (result) {//kkpager分页事件
                                var dataList = result.result.data;
                                kkpager.totalRecords = result.result.total;
                                kkpager.selectPage(n);
                                var listHtml = _.template(itemhtml)({datas: dataList});
                                $("#reviewTableContent .comment-tab-pane.show").html(listHtml);
                            });
                        },
                        mode: "click",
                        isGoPage: false,
                        isShowTotalPage: false,
                        isShowCurrPage: false,
                        lang: {
                            firstPageText: '首页',
                            firstPageTipText: '首页',
                            lastPageText: '尾页',
                            lastPageTipText: '尾页',
                            prePageText: '上一页',
                            prePageTipText: '上一页',
                            nextPageText: '下一页',
                            nextPageTipText: '下一页'
                        }
                    });
                }
            },
            changekkPager:function(context){ //切换tab进行分页
                P.render.initKkPager($("span",context).html());
            }

        },
        actions: {
            initAction: function () {//绑定事件
                $("#favorite").bind("click", function () {
                    if(isLogin){
                        if(!$("#favorite").hasClass("active")) {
                            helper.request.getCrossJson({
                                url: "//i.huize.com/MyFavorite/Add",
                                data: {productProtectPlanId: $("#planId").val()||$("#productId").val(), isFavorite: true}
                            }, function (result) {
                                if (result.IsSuccess) {
                                    layer.msg('收藏成功');
                                    $("#favorite").addClass("active");
                                } else {
                                    layer.msg("收藏失败");
                                }
                            });
                        }else{
                            helper.request.getCrossJson({
                                url: "//i.huize.com/MyFavorite/Delete",
                                data: {productProtectPlanId: $("#planId").val() || 4776}
                            }, function (result) {
                                if (result.IsSuccess) {
                                    layer.msg('取消成功');
                                    $("#favorite").removeClass("active");
                                } else {
                                    layer.msg("取消失败");
                                }
                            });
                        }
                    }else{
                        requirejs(["sign-float"], function (signFloat) {
                            var sign = new signFloat({returnUrl: location.href, showRegister: true,callback:function(data){//登录成功回调
                                location.reload();
                            }});
                        });
                    }



                });
                $("#detialTab").delegate("li", "click", function () { //菜单切换
                    if ($(this).attr("data-tab") === "detial-5") {//加载kkpager
                        helper.loadCss("http://pgkk.github.io/kkpager/src/kkpager_blue.css");
                        requirejs(["kkpager","require-text!/html/product/comment-item.html"], function (res,itemhtml) {
                            P.render.initKkPager($(".hz-tab-menu-item.active span").html());
                        });
                    }
                });
                $("#addToCompare").bind("click",function(){
                    if($(this).hasClass("hz-check-item-checked")){
                        $(this).removeClass("hz-check-item-checked");
                        toolFloat.delcomparePro(20024);
                    }else {
                        $(this).addClass("hz-check-item-checked");
                        toolFloat.addcomparePro(20024);
                    }

                });
                $("#addToShopCar").bind("click",function(){//添加购物车
                            var trialInfo = P.trialBox[$("#planId").val()||$("#productId").val()];
                            var insureListCreate=[];
                            var postInsureData = {};
                            var protectItems=[];
                            var protectItem=trialInfo.renderData.protectTrialItemList;
                            $.each(protectItem,function(index,item){
                                protectItems.push({name:item.name,description:item.description,premium:item.premium,protectItemId:item.protectItemId,showUnit:item.showUnit});
                            });
                            postInsureData.restrictRule = {platform: "1", channel: 1};
                            postInsureData.productId = ~~trialInfo.productId;
                            postInsureData.planId = trialInfo.productPlanId;
                            postInsureData.restrictRule.protectTrialItemList = trialInfo.getGenes().concat(protectItems);
                            postInsureData.restrictRule.trialPrice = trialInfo.trialPrice;
                            postInsureData.preminum = trialInfo.preminum;
                            postInsureData.restrictRule.optGeneOldValue = trialInfo.optGeneOldValue;
                            postInsureData.totalNum = 1;
                            postInsureData.inShoppingCart = true;
                            insureListCreate.push(postInsureData);
                            helper.request.postData2({url: "/insurance-slips", data:insureListCreate}, function (result) {
                                var data=result.result;
                                if(!data){
                                    layer.msg(result.message||"添加购物车失败");
                                    return;
                                }
                                if(isLogin){
                                    layer.msg("加入购物车成功");
                                    return;
                                }else{//未登录加入购物车
                                    var insureStr= helper.cookie.getCookie("InsureNums");
                                    if(insureStr.split(",").length>20){
                                        layer.msg("最多只能添加20个产品");
                                        return;
                                    }
                                    $(data).each(function(intex,item){
                                        if(insureStr.indexOf(item.insureNum)===-1){
                                            if(insureStr) {
                                                insureStr =insureStr +","+ item.insureNum;
                                            }else{
                                                insureStr = insureStr + item.insureNum;
                                            }
                                            helper.cookie.setCookie("InsureNums",insureStr,1000*60*60*24);
                                        }
                                    });
                                    layer.msg("加入购物车成功");

                                }
                            });

                });
                $("#recommendTableContent").delegate(".hz-button","click",function(){//添加组合到购物
                   var $recommd= $("div[data-tab='recommend-"+$(this).attr("dindex")+"'] ul li");
                    var carList=[];
                    for(var i=0;i<$recommd.length;i++){
                        if($($recommd[i]).attr("planId")) {
                            carList.push({
                                planId: $($recommd[i]).attr("planId"),
                                productId: $($recommd[i]).attr("productId"),
                                inShoppingCart:true
                            });
                        }
                    }

                    helper.request.postData2({url: "/insurance-slips", data:carList}, function (result) {
                        var data=result.result;
                        if(!data){
                            layer.msg(result.message||"添加购物车失败");
                            return;
                        }
                        if(isLogin){
                            layer.msg("加入购物车成功");
                            return;
                        }else{//未登录加入购物车
                            var insureStr= helper.cookie.getCookie("InsureNums");
                            if(insureStr.split(",").length>20){
                                layer.msg("最多只能添加20个产品");
                                return;
                            }

                            $(data).each(function(intex,item){
                                if(insureStr.indexOf(item.insureNum)===-1){
                                    if(insureStr) {
                                        insureStr =insureStr +","+ item.insureNum;
                                    }else{
                                        insureStr = insureStr + item.insureNum;
                                    }
                                    helper.cookie.setCookie("InsureNums",insureStr,1000*60*60*24);
                                }
                            });
                            layer.msg("加入购物车成功");
                        }
                    });

                });
                $("#planIdBox .primary-link").bind("click", P.actions.showPlansCompare);
            },
            showPlansCompare:function(){
                var planIds=[];
                $(data.security.planList).each(function(index,item){
                    planIds.push(item.planId);
                })
                helper.request.postData2({url:"/products/plans-comparison",data:planIds},function(result){

                    require(["require-text!/html/product/plans-compara.html"], function (html) {
                       var index=layer.open({
                            type: 1,
                            closeBtn: 1, //不显示关闭按钮
                            width:700,
                            shift: 2,
                            shadeClose: true, //开启遮罩关闭
                            content:_.template(html)({plans:data.security.planList,gens:result.result})
                        });
                        layer.style(index,{width: '850px',height:'400px',overflow:"scroll"});
                        $("#planList").delegate("a","click",function(){
                            var planId=$(this).attr("planId");
                            if($(this).hasClass("filter-active-tag")){
                                $(this).removeClass("filter-active-tag");
                                $("#tabgen td[planId="+planId+"],#tabgen col[planId="+planId+"],#tabgen col[planId="+planId+"],#tabgen th[planId="+planId+"]").addClass("fn-hide");
                            }else{
                                $(this).addClass("filter-active-tag");
                                $("#tabgen td[planId="+planId+"],#tabgen col[planId="+planId+"],#tabgen col[planId="+planId+"],#tabgen th[planId="+planId+"]").removeClass("fn-hide");
                            }

                        });
                        $("#planHead").delegate("th","click",function(){
                            var planName="";
                            if($(this).hasClass("active")){
                                planName=$(".popover-content.fb",this).html();
                                $(this).html(planName);
                                $(this).removeClass("active");
                            }else{
                                planName=$(this).html();
                                $(this).html('<div class="popover top"><div class="popover-content fb">'+planName+'</div><div class="arrow"></div><div class="arrow2"></div></div>');
                                $(this).addClass("active");
                            }
                        })
                    });
                });
             },
            favoriteAction:function(option){
                helper.request.getCrossJson({
                    url:option.url,// "//i.hzins.com/MyFavorite/Add",
                    data: {productProtectPlanId: $("#planId").val() || $("#productId").val() , isFavorite: true}
                }, function (result) {
                    if (result.IsSuccess) {
                        layer.msg('收藏成功');
                        $("#favorite").addClass("active");
                    } else {
                        layer.msg("收藏失败");
                    }
                });
            },
            isFavorite:function(){//判断本计划是否已经收藏收藏产品
                helper.request.getCrossJson({url:"//i.huize.com/MyFavorite/CheckProductPlanIsFavorite",data:{productProtectPlanId:$("#planId").val()||$("#productId").val()}},function(result){
                    if(result.Data){
                        $("#favorite").addClass("active");
                    }
                });
            },
            addHistoryPlan:function(planId){//保存浏览记录信息
                if(!planId){
                    return;
                }
                var historyPlanListStr=helper.cookie.getCookie("Product_History");
                if(historyPlanListStr.indexOf(planId)===-1){//判断是否存在
                    var historyPlanList=historyPlanListStr.split(",");
                    if(!historyPlanListStr){
                        historyPlanListStr=planId;
                    }else if(historyPlanList.length<=5){
                        historyPlanListStr=historyPlanListStr+","+planId;
                    }else{
                        var tempHistory="";
                        for(var i=i;i<historyPlanList.length;i++){
                            tempHistory=tempHistory+","+historyPlanList[i];
                        }
                        historyPlanListStr=tempHistory+planId+",";
                    }
                    helper.cookie.setCookie("Product_History",historyPlanListStr,(5*24*60*60*1000));

                }
            }
        }
    };

    return P;
});