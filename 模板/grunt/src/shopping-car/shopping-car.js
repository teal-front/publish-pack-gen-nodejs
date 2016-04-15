/**
 * 购物车.
 */
define(['jquery',"underscore",'helper','layer','my-calendar','jquery-prompt','fix-float'], function($,_,helper,layer,mycalendar,jqprompet,fixFloat) {
    var isLogin=false;
    var carhtmlItem;//购物车模型html
    var cacheData;
    var car = {
        init: function() {
            car.initData();

        },
        initData:function(){
            helper.state.checkLogin(function(result){
                isLogin=result.result;
                if(true){//是否登陆 页面须做处理
                    $("#logintips").html("页面提示购物车是空的，赶紧选购吧！");
                    $("#toLogin").html("风险评测").attr("href","//www.huize.com/demandanalysis/home");
                }
                else{
                    $("#tiplogin").removeClass("fn-hide");
                }
                require(["require-text!/html/shopping-cart/index.html"], function (html) {
                    carhtmlItem=html;
                   car.refreshData();


                });
            });

            car.getHistory();//获取历史数据
        },
        refreshData:function(){//刷新购物车
            helper.request.getJson({url:"/shopping-cart/list"},function(data){
                var result=cacheData=data.result;

                if(result.length>0) {//判断是否有商品

                    $("#shopCarList").removeClass("fn-hide");
                    var nowDate=new Date();
                    var defaultValue;
                    var carItem="";
                    var startDate=new Date();
                    var endDate=new Date();
                    var c1;
                    $("#carItemList").html(_.template(carhtmlItem.split("<area>")[0])({datas:result}));
                    for(var i=0;i<result.length;i++){
                        for(var j=0;j<result[i].cartItems.length;j++){
                            carItem=result[i].cartItems[j];
                            var restrictRuleObj=JSON.parse(carItem.restrictRule);
                            $("#protect_"+carItem.id).attr("data-prompt-html",_.template(carhtmlItem.split("<area>")[1])({protectItems:restrictRuleObj.protectTrialItemList})).prompt();
                            if(!carItem.startDate){
                                defaultValue=nowDate.getFullYear()+"-"+(nowDate.getMonth()+1)+"-"+nowDate.getDate();
                                if(carItem.productEffectiveDate){
                                    if(carItem.productEffectiveDate.effectiveType===1){//起保日期限制
                                        startDate.setDate(nowDate.getDate()+carItem.productEffectiveDate.effectiveStartDay);
                                        endDate.setDate(nowDate.getDate()+carItem.productEffectiveDate.effectiveEndDay);
                                        c1 = new MyCalendar({
                                            el: $('#calendar-' + carItem.id)[0], //触发的元素
                                            minDate:startDate.getFullYear()+"-"+(startDate.getMonth()+1)+"-"+startDate.getDate(), //日期范围控制-最小日期
                                            maxDate:endDate.getFullYear()+"-"+(endDate.getMonth()+1)+"-"+endDate.getDate()
                                        });
                                    }else if(carItem.productEffectiveDate.effectiveType===2){
                                        c1 = new MyCalendar({
                                            el: $('#calendar-' + carItem.id)[0], //触发的元素
                                            minDate:carItem.productEffectiveDate.fixedEffectiveLatestDate.split("T")[0], //日期范围控制-最小日期
                                            maxDate:carItem.productEffectiveDate.fixedEffectiveLatestDate.split("T")[0]
                                        });
                                    }else if(carItem.productEffectiveDate.effectiveType===3){
                                        $('#calendar-' + carItem.id).parent().html("<span>"+carItem.productEffectiveDate.fixedEffectiveContent+"</span>");
                                    }
                                }else {
                                     c1 = new MyCalendar({
                                        el: $('#calendar-' + carItem.id)[0], //触发的元素
                                        minDate: defaultValue //日期范围控制-最小日期
                                    });
                                }
                                $('#calendar-'+carItem.id).val(defaultValue);
                            }
                            if(result[i].cartItems[j].percentComplete!==100){
                                $("i[rel=prompt_"+result[i].cartItems[j].id+"]").attr("data-prompt-html","投保信息不全，请填完整再支付").prompt();

                            }
                        }
                    }
                    var fix=new fixFloat({el:$("#bottombar"),fixPanel:$("#carItemList"),fixClass:"fixed-insure-cart-foot",fixbuttom:true});

                }else{
                    $("#carItemList").html();
                    $("#shopCarList").addClass("fn-hide");
                    $("#notLoginEmpty").removeClass("fn-hide");
                }
            });
        },
        initReact:function(){
            $("#viewWraper").css("width",$("#viewWraper li").length*220+"px");
        },
        initAction:function(){
            $("#prevBtn").bind("click",function(){
                var $wrraper=$("#viewWraper");
                var silidIndex=$wrraper.attr("index");
                if(silidIndex===1){
                    return;
                }
                var silidWidth=$("#viewWraper li")[0].offsetWidth;
                var left=$wrraper[0].style.left.replace("px","");
                $wrraper.css("left",+left+silidWidth+20+"px");
                $wrraper.attr("index",silidIndex-1);
            });
            $("#nextBtn").bind("click",function(){
                var $wrraper=$("#viewWraper");
                var silidIndex=$wrraper.attr("index");
                if(silidIndex===$("#viewWraper li").length){
                    return;
                }
                var silidWidth=$("#viewWraper li")[0].offsetWidth;
                var left=$wrraper[0].style.left.replace("px","");
                $wrraper.css("left",left-silidWidth-20+"px");
                $wrraper.attr("index",+silidIndex+1);
            });
            $("#toLogin").bind("click",function(){
                requirejs(["sign-float"], function (signFloat) {
                    var sign = new signFloat({returnUrl: location.href, showRegister: true,callback:function(data){//登录成功回调
                        location.reload();
                    }});
                });
            });

            $("#carItemList").delegate(".delBtn","click",function(){//删除购物车内容
                var self=this;
                layer.confirm('您确定要删除该保单吗？', {//弹出弹窗让用户确认是否删除投保单号
                    btn: ['取消','确定'],
                    title:"提示"
                }, function(){

                }, function(){
                    if(isLogin){//判断是否登陆 ，已登录从浏览器删除，未登录从cookie删除
                        helper.request.postData({url:"/shopping-cart/items?insuranceNum="+$(self).attr("pid"),method:"DELETE",data:{}},function(result){
                            if(result.result){
                                layer.msg("删除成功");
                                car.refreshData();
                            }else{
                                layer.msg(result.message);
                            }
                        });
                    }else{
                        var insureNumstr=helper.cookie.getCookie("InsureNums");
                        helper.cookie.setCookie("InsureNums",insureNumstr.replace($(self).attr("pid")+",","").replace($(self).attr("pid"),""));
                        car.refreshData();
                    }
                });
            });
            $("#checkAllCom").bind("click",function(){//选择全部支持合并支付的成品
                if($(this).hasClass("hz-check-item-checked")){
                    $(this).removeClass("hz-check-item-checked");
                    $(".checkItem").removeClass("hz-check-item-checked");
                }else{
                    $(this).addClass("hz-check-item-checked");
                    $(".checkItem[support='true']").addClass("hz-check-item-checked");
                }
            });
            $("#carItemList").delegate(".checkItem","click",function(){//选择支付项
                var isSupport=$(this).attr("support");

                if($(this).hasClass("hz-check-item-checked")){
                    $(this).removeClass("hz-check-item-checked");
                }else{
                    if(isSupport==="false"){
                        $(".checkItem").removeClass("hz-check-item-checked");
                        $(this).addClass("hz-check-item-checked");
                    }else{
                        $(".checkItem[support='false']").removeClass("hz-check-item-checked");
                    }
                }
                $("#checked").html($(".hz-check-item-checked").length);
                var $checkList=$(".hz-check-item-checked");
                var postData=[];
                for(var i=0;i<$checkList.length;i++){
                    postData.push({insuranceNum:parseFloat($($checkList[i]).attr("insurenum")),premium:parseFloat($($checkList[i]).attr("premium"))});
                }

                if($(this).attr("activeid")){
                    var actId=$(this).attr("activeid");
                    var premiumMax=0;
                    var $checkArray=$("div.hz-check-item-checked[activeid='"+$(this).attr("activeid")+"']");
                    if($checkArray.length>0){
                        $("#tips_"+actId).removeClass("fn-hide");
                    }else{
                        $("#tips_"+actId).addClass("fn-hide");
                    }
                    var insureNums=[];
                    $checkArray.each(function(index,item){
                        premiumMax=premiumMax+parseInt($(item).attr("premium"));
                        insureNums.push({insuranceNum:parseFloat($(item).attr("insurenum")),premium:parseFloat($(item).attr("premium"))})
                    });
                   var mincny=$("#actId_"+actId).attr("minCount");
                    if(premiumMax-mincny<0){
                        $("#tips_"+actId).html("还差"+(mincny-premiumMax));
                    }else{
                        helper.request.postData2({
                            url: "/insurance-slips/amount/choosed",
                            data: insureNums
                        }, function (result) {
                            if (result.result) {
                                $("#tips_"+actId).html("已减"+(mincny-premiumMax));
                            }
                        });
                    }
                }

                if(postData.length>0) {
                    helper.request.postData2({
                        url: "/insurance-slips/amount/choosed",
                        data: postData
                    }, function (result) {
                        if (result.result) {
                            $("#totalMoney").html(result.result.totalPremium - result.result.totalDiscount);
                            $("#saveMoney").html(result.result.totalDiscount);
                        }
                    });
                }
            });
            $("#toPayAll").bind("click",function(){//支付
                var $checkItemlist=$("hz-check-item-checked");
                if($checkItemlist.length===0){
                    layer.msg("请选择要支付的产品");
                }else{

                }
            });
        },
        getHistory:function(){//获取浏览数据
            var historyProducts=helper.cookie.getCookie("Product_History");
            var planIds=historyProducts.split(":");
            helper.request.postData2({url:"/products/plans/list",data:planIds},function(result){
                require(["require-text!/html/shopping-cart/product-history.html"], function (html) {
                    $("#viewContainer").html(_.template(html)({datas:result.result}));
                });

            });
            car.initAction();
            car.initReact();
        }
    };
    return car;
});