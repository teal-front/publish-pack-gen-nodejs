/**
 * 右侧浮层
 */
define(["jquery","underscore","exports","require","module","helper","layer"],function($,_,exports,require,module,helper,layer) {
    "use strict";
    var isLogin=false,
        AdviserInfoDto,//绑定顾问
        context,
        COMPARE_CHECK_ID="checkCompareIds",//产品对比勾选项存放cookieKey
        COMPARE_ITEM="compareProducts",//产品对比存放cookieKey
        compareProductUrl="//www.huize.com/contrast-0-0-0-0";//产品对比URL
    var ToolFloat = function () {
        ToolFloat.prototype.init.apply(this, arguments);
    };
    ToolFloat.prototype = {
        init: function (config) {
            var _self = this;
            this.config = config;
            require(["require-text!/html/product/fixed-tool-float.html"], function (html) {
                $("body").append(html);
                context=$("#fixedsidetool");
                _self.initAction();
               var compareProducts=helper.cookie.getCookie(COMPARE_ITEM);
               var comparePro=$.grep(compareProducts.split(","),function(s){//去掉空字符
                    return s!=="";
                });

                $("#compareCount").html((comparePro.length)+"/"+4);
                _self.refreshShopCar();
                _self.refreshToolPosition(true);
            });
        },
        initAction: function () {//交互JS
            var toolPanel = $("#toolPanel", context),
                title = $("#panelTitle", context),
                _this=this;
            context
                .on("click","#showCarBtn",function () {//购物车面板切换
                toolPanel.show();
                $(".comparer-item", context).addClass("fn-hide");
                $(".car-item:not(.items-empty)", context).removeClass("fn-hide");
                $("#feedCallback").addClass("fn-hide");
                if(isLogin){
                    $("#loginBtn").addClass("fn-hide");
                }

                _this.refreshShopCar(true);
                title.html("购物车");
            })
                .on("click","#loginBtn",function(){

                        requirejs(["sign-float"], function (signFloat) {
                            var sign = new signFloat({returnUrl: location.href, showRegister: false,callback:function(data){//登录成功回调
                                location.reload();
                            }});
                        });
                })
                .on("click","#deleteAll",function(){//清空全部
                    helper.cookie.setCookie(COMPARE_ITEM,"",null,".huize.com");
                    _this.loadComparePro();
                    $('#compareTips,#comparerItemTip,#deleteAll',context).addClass('fn-hide');
                    helper.cookie.setCookie(COMPARE_CHECK_ID,"",null,".huize.com");
                   _this.setStartComparaStats(0);
                    $("#addToCompare").removeClass("hz-check-item-checked");
                    $("#addToCompare .hz-check-text").text("加入对比");
                })
                .on("click","#comparePanel .hz-check-item",function(){ //选择对比产品
                    $(this).toggleClass("hz-check-item-checked");
                    var _planId=$(this).attr("planId"),
                        _cookieIds,
                        _checkIds=helper.cookie.getCookie(COMPARE_CHECK_ID);
                    if($(this).hasClass("hz-check-item-checked")){
                        _cookieIds=_this.cookieStr(_checkIds,_planId,1);
                    }else{
                        _cookieIds=_this.cookieStr(_checkIds,_planId,2);
                    }
                    helper.cookie.setCookie(COMPARE_CHECK_ID,_cookieIds,null,".huize.com");
                    var $checkList=$("#comparePanel .hz-check-item-checked");
                    _this.setStartComparaStats($checkList.length);

                })
                .on("click","#toPay",function(){
                    helper.page.openNewTag("//is.huize.com/shopping-cart/");
                })
                .on("click","#showProductBtn",function(){//显示对比面板
                    toolPanel.show();

                    if($(".comparer-item:not(.items-empty)", context)) {

                        $(".comparer-item:not(.items-empty)", context).removeClass("fn-hide");
                        $('#compareTips,#comparerItemTip,#deleteAll').addClass('fn-hide');
                    }


                    $(".car-item", context).addClass("fn-hide");
                    $("#feedCallback").addClass("fn-hide");
                    title.html("产品对比");
                    _this.loadComparePro();
                })
                .on("click","#startCompara",function(){//开始对比
                    var _$compareCount = $("#comparePanel .hz-check-item-checked");
                    if (_$compareCount.length < 2) {
                        layer.msg("对比的产品不能小于两个");
                        return;
                    }
                    var tempCompareProductUrl = compareProductUrl;
                    _$compareCount.each(function (index, item) {
                        if (index < 4) {
                            tempCompareProductUrl = tempCompareProductUrl.replace("-0", "-" + $(item).attr("planId"));
                        }
                    });

                    helper.page.openNewTag(tempCompareProductUrl);
                })
                .on("click","#comparePanel .hz-close",function(){//删除计划对比
                    var planId=$(this).attr("planId");
                    _this.delcomparePro(planId);
                    var $checkList=$("#comparePanel .hz-check-item-checked");
                    _this.setStartComparaStats($checkList.length);
                })
                .on("click",".side-tool-back",function(){//关闭
                    toolPanel.hide();
                })
                .on("click","#feedBtn",function(){//反馈面板切换
                    toolPanel.show();
                    $(".comparer-item", context).addClass("fn-hide");
                    $(".car-item", context).addClass("fn-hide");
                    $("#feedCallback").removeClass("fn-hide");
                    $("#panelTitle").html("意见反馈");

                    //反馈的大文本框模拟placeholder
                    $('#feedback-area').placeholder({
                        blankCharacter: false,//输入空格是否消失,默认消失,
                        wrapTagName:false//默认为span,是否创建包裹它的父元素；可以是任何合法标签,div,p,a等,如果为false，则不创建
                    });
                })
                .on("click","#feedCall",function(){//提交反馈
                    var _this=this,
                        feedText= $.trim($(".side-tool-feedback-area").val()),
                        $errMsg=$("#feedCallback .hz-alert-error");
                    if(!feedText){
                        $errMsg.html("内容不能为空");
                        return;
                    }else if(feedText.length>500){
                        $errMsg.html("内容不能超过500个字");
                        return;
                    }
                    if($(this).attr("posting")){
                        return;
                    }
                    $(this).attr("posting","true");
                    $errMsg.html("");
                    $(this).html("正在提交......");
                    var isSatFix=$("#feedCallback .hz-radio-item-checked").attr("satfix");
                    if($.trim(feedText)){
                        helper.cookie.setCookie("suggest",$.trim(feedText),null,".huize.com");
                        helper.request.getCrossJson({url:"//www.huize.com/Feedback/AddFeedback",data:{createTime:helper.dateHelper.formatDate("yyyy-MM-dd hh:mm:ss",new Date()),addressUrl:location.href,isSatisfied:isSatFix,title:document.title}},function(result){
                            if(result.IsSuccess){
                                $errMsg.html("");
                                layer.msg("提交成功");
                                toolPanel.hide()
                            }else{
                                $errMsg.html(result.Message);
                            }
                            $(_this).attr("posting","");
                            $(_this).html("提交");
                        });
                    }
                })
                .on("mouseover",".tool-function-item",function(){//二维码切换
                    $(this).addClass("side-tool-current");
                })
                .on("mouseout",".tool-function-item",function(){
                    $(this).removeClass("side-tool-current");
                })
                .on("keydown",".side-tool-feedback-area",function(){
                    var charCount= $.trim($(this).val()).length+1,
                        keyCode= e.keyCode;
                    if (keyCode ===8){

                        return true;
                    }
                    if(charCount>500){
                        return false;
                    }

                })
                .on("click","#feedCallback .hz-radio-item",function(){//反馈是否满意交互
                    $("#feedCallback .hz-radio-item").removeClass("hz-radio-item-checked");
                    $(this).addClass("hz-radio-item-checked");
                })
                .on("click","#kefu",function(){//弹出客服窗口
                    var userId =helper.cookie.getCookie("userId");
                        window.open("http://kefu.hzins.com/chat?domain=hzins&businessType=Xm4FWr0dncw&referrer=" + encodeURIComponent(window.location.href)+"&msrc=HZ&title=" + encodeURIComponent(document.title) + "&mid=" + encodeURIComponent(userId), "kefu", "toolbar=no,location=no,directories=no,resizable=yes,status=yes,menubar=no,scrollbars=yes,width=800,height=600,left=0,top=0");

                });

            $("body").bind("click",function(e){//点击工具栏外面的地方隐藏
                if(!$(e.target).parents("#fixedsidetool").length&&!$(e.target).parents(".layui-layer-dialog").length){
                    toolPanel.hide();
                }
            });
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
            window.onresize = function(){
                _this.refreshToolPosition();
                if($("#detialTab").length > 0){
                    _fixedTopTool();//详情页才执行
                }
            }
            setInterval(function(){//计算反馈用户输入的字数
                var _text= $.trim($(".side-tool-feedback-area",context).val());
                $("#charCount",context).html(_text.length);
            },500);
        },
        refreshToolPosition : function(isInit){
            var
                winWidth = window.document.body.clientWidth,
                fixedSidetool = $("#fixedsidetool"),
                showCarBtn = $("#wrapToolMenu"),
                offsetHeight = window.document.documentElement.clientHeight;
            if(winWidth < 1262){
                if(isInit){
                    fixedSidetool.css("right","-35px");
                    showCarBtn.css({"position":"relative","left":"-35px"});
                }
                else{
                    if($("#toolPanel:visible").length === 0){
                        fixedSidetool.animate({"right": "-35px"}, 30);
                        showCarBtn.css({"position": "relative"}).animate({"left": "-35px"}, 100);
                    }
                }
                fixedSidetool.bind("mouseleave",function(){
                    if($("#toolPanel:visible").length === 0){
                        fixedSidetool.animate({"right":"-35px"},100);
                        showCarBtn.animate({"left": "-35px"},100);
                    }
                });
                showCarBtn.bind("mouseover",function(){
                    $(this).animate({"left":"0"},30);
                    fixedSidetool.animate({"right":"0"},30);
                });
            }
            else{
                if(isInit){
                    fixedSidetool.css("right",0);
                    showCarBtn.css({"position":"relative","left":"0"});
                }
                else{
                    fixedSidetool.animate({"right":"0"},300);
                    showCarBtn.css("position","relative").animate({"left": "0"},300);
                }
                showCarBtn.unbind("mouseover");
                fixedSidetool.unbind("mouseleave");
            }
            if(offsetHeight <= 540){
                $(".side-tool-other").hide();
            }
            else{
                $(".side-tool-other").show();
            }
        },
        refreshShopCar:function(loadDetailData){//刷新购物车
            var _self=this;
            helper.state.checkLogin(function(result){//请求用户是否登陆
                isLogin=result.result;
                // 由于存在规划内容，没登录取cookie会导致取数量为计划包含的产品，
                // 先使用获取数据赋值购物车数量       陈润发  2016-07-05
                if(!isLogin){//没登录获取本地cookie
                    /*var insureNumstr=helper.cookie.getCookie("InsureNums");
                    if(insureNumstr) {
                        $("#carItemCount",context).html(insureNumstr.split(",").length);
                    }else{
                        $("#carItemCount",context).html(0);
                    }*/
                }
                else{
                    helper.request.getJson({url:"/api/shopping-cart/items/count"},function(result){//获取服务器购物车数量
                        $("#fixedsidetool #carItemCount").html(result.result);
                        $(".hz-header-cart-num").html(result.result);
                    });
                    helper.request.getJson({url:"/api/users/customer-service"},function(result){
                        AdviserInfoDto=result.result;
                    })
                    if(!loadDetailData){//是否需要加载详细信息
                        return;
                    }
                }

                helper.request.getJson({url:"/api/shopping-cart/list"},function(data){//请求投保单信息
                    if(data.message){
                        layer.msg(data.message);
                        return;
                    }
                    var result=data.result;
                    if(!result.length){
                        $(".car-item.items-empty").removeClass("fn-hide");
                        $("#carItemCount",context).html(0);
                        $(".hz-header-cart-num").html(0);
                    }else{
                        $(".car-item.items-empty").addClass("fn-hide");
                        $("#carItemCount",context).html(result.length);
                        $(".hz-header-cart-num").html(result.length);
                    }
                    $("#shopcarList",context).html(_.template($("#shopcarhtml").html())({datas:result}));
                    $("#failList",context).html(_.template($("#failItems").html())({datas:result}));
                    if($("#failList li",context).length>0){
                        $("#failList").parent().removeClass("fn-hide");
                    }
                    var preArray=[];
                    $("#shopcarList li",context).each(function(item,index){
                        var $this = $(this);
                        var _type = $this.attr('data-type') || '';
                        // 处理规划信息
                        if (_type === 'plan') {
                            $this.find('.plan-hidden').each(function() {
                                preArray.push({
                                    insuranceNum: $(this).attr("insureNum"),
                                    premium: $(this).attr("premium")
                                });
                            })
                        } else {
                            preArray.push({
                                insuranceNum: $this.attr("insureNum"),
                                premium: $this.attr("premium")
                            });
                        }
                    });
                    if(preArray.length!==0) {
                        helper.request.postData2({
                            url: "/api/insurance-slips/amount/choosed",
                            data: preArray
                        }, function (result) {
                            if (result.result) {
                                $("#totalPrice").html(((result.result.totalPremium - result.result.totalDiscount)/100).toFixed(2));
                            }
                        });
                    }
                    else{
                        $("#totalPrice").html("0.00");
                    }
                    _self.refreshCount();
                    $("#shopcarList,#failList",context).delegate(".delbtn","click",function(){
                        var _this=this;
                        layer.confirm('<p class="pt45 pb45 tac">确认要从购物车中删除该产品吗？</p>', {//弹出弹窗让用户确认是否删除投保单号
                            btn: ['取消','确定'],
                            area: '530px',
                            title:false
                        }, function(){
                            layer.closeAll();
                        }, function(){
                            var _type = $(_this).attr('data-type') || '';
                            if(isLogin){//判断是否登陆 ，已登录从服务器删除，未登录从cookie删除
                                var _url = '';
                                var _data = {};
                                // 规划删除
                                if (_type === 'plan') {
                                    _url = "/api/shopping-cart/items?projectInsuranceGroup="+$(_this).attr("data-group")+"&type="+_type;
                                    data = {
                                        projectInsuranceGroup: $(_this).attr("data-group")
                                    };
                                } else {
                                    _url = "/api/shopping-cart/items?insuranceNum="+$(_this).attr("pid");
                                    data = {
                                        insureNum: $(_this).attr("pid")
                                    };
                                }
                                helper.request.postData({url: _url, method:"DELETE", data: data}, function(result){
                                    if(result.result){
                                        layer.msg("删除成功");
                                        _self.refreshShopCar(true);
                                    }else{
                                        layer.msg("删除失败");
                                    }
                                });
                            }else{
                                var insureNumstr=helper.cookie.getCookie("InsureNums");
                                var pid=$(_this).attr("pid");
                                if (_type === 'plan') {
                                    $(_this).parents('li').find('input[type=hidden]').each(function() {
                                        var idx = $(this).attr('insurenum');
                                        helper.cookie.setCookie("InsureNums",_self.cookieStr(insureNumstr,idx),0,".huize.com");
                                        insureNumstr=helper.cookie.getCookie("InsureNums");
                                    });
                                } else {
                                    helper.cookie.setCookie("InsureNums",_self.cookieStr(insureNumstr,pid),0,".huize.com");
                                }
                                layer.msg("删除成功");
                                _self.refreshShopCar(true);
                            }

                        });
                    });
                });
            });
        },
        refreshCount:function(){//刷新产品数量
            $("#productCount",context).html($('#shopcarList li').length);
            $("#failCount",context).html($('#failList li').length);
        },
        loadComparePro:function(){//更新界面
            var comparePlan=helper.cookie.getCookie(COMPARE_ITEM),
                _this=this,
                planIds=[];
            if(comparePlan){
                planIds=comparePlan.split(",");
            }
            planIds= $.grep(planIds,function(str){//删除空元素
                return str!=="";
            });
            if(!planIds.length){
                $(".comparer-item.items-empty").removeClass("fn-hide");
                //$('#compareTips,#comparerItemTip,#deleteAll').removeClass('fn-hide');

            }else{
                $(".comparer-item.items-empty").addClass("fn-hide");
                $('#compareTips,#comparerItemTip,#deleteAll').removeClass('fn-hide');
            }
            helper.request.postData2({url:"/api/products/plans/list",data:planIds},function(result){
                $("#comparePanel").html(_.template($("#comparehtml").html())({datas:result.result}));
                $("#compareCount #fixedsidetool").html(result.result.length+"/"+"4");
                $("#compareCount").html(result.result.length+"/"+"4");
                var cookieStr=helper.cookie.getCookie(COMPARE_CHECK_ID);
                $("#comparePanel .hz-check-item").each(function(){
                    if(cookieStr.indexOf($(this).attr("planId"))>-1){
                        $(this).addClass("hz-check-item-checked");
                    }
                })
                _this.setStartComparaStats($("#comparePanel .hz-check-item-checked").length);
            });
        },
        setStartComparaStats:function(count){//设置产品对比按钮状态
            if(count>1){
                $("#compareTips").addClass("fn-hide");
                $("#startCompara").removeClass("disabled");
            }else{
                $("#compareTips").removeClass("fn-hide");
                $("#startCompara").addClass("disabled");
                if(count===0){
                    $("#deleteAll").addClass("fn-hide");
                }
            }
        },
        getCompareCount:function(){//获取对比数量
            var comparePlan=helper.cookie.getCookie(COMPARE_ITEM);
            if(comparePlan.indexOf("|")>-1){//清除老网站对比cookie
                comparePlan="";
            }
            comparePlan=comparePlan.split(",");
            comparePlan=$.grep(comparePlan,function(str){
                return str!="";
            });
             return comparePlan.length;
        },
        delcomparePro:function(id){//对比cookie操作
            var comparePlan=helper.cookie.getCookie(COMPARE_ITEM);
            if(comparePlan.indexOf("|")>-1){//清除老网站对比cookie
                comparePlan="";
            }
            comparePlan=this.cookieStr(comparePlan,id);
            comparePlan=comparePlan.split(",");
            comparePlan=$.grep(comparePlan,function(str){
                return str!="";
            });
            $("#compareCount").html(comparePlan.length+"/4");
            helper.cookie.setCookie(COMPARE_ITEM,comparePlan.join(","),null,".huize.com");
            var _checkIds=helper.cookie.getCookie(COMPARE_CHECK_ID);
            var _cookieIds=this.cookieStr(_checkIds,id,2);
            helper.cookie.setCookie(COMPARE_CHECK_ID,_cookieIds,null,".huize.com");
            this.loadComparePro();
        },

        addcomparePro:function(id){//加入计划对比
            var comparePlan=helper.cookie.getCookie(COMPARE_ITEM),
                _checkIds=helper.cookie.getCookie(COMPARE_CHECK_ID);
            if(comparePlan.indexOf("|")>-1){
                comparePlan="";
            }
            comparePlan=this.cookieStr(comparePlan,id,1);
            if(comparePlan.split(",").length>4){
                layer.msg("对比数目最大不能超过4个");
                return;
            }


            _checkIds=this.cookieStr(_checkIds,id,1);


            helper.cookie.setCookie(COMPARE_CHECK_ID,_checkIds,null,".huize.com");

            $("#compareCount").html(comparePlan.split(",").length+"/4");
            helper.cookie.setCookie(COMPARE_ITEM,comparePlan,null,".huize.com");
            this.loadComparePro();
            return true;
        },
        cookieStr:function(str,id,type){//type操作类型,1是增加，2是删除
            var ids=str.split(",");
            ids=$.grep(ids,function(str){//删除空元素
                return str!=="";
            });
            if(type===1){
                for(var i=0;i<ids.length;i++){
                    if(ids[i]===id){
                        return ids.join(",");
                    }
                }
                ids.push(id);
            }else{
                for(var i=0;i<ids.length;i++){
                    if(ids[i]===id){
                        ids.splice(i,1);
                        return ids.join(",");
                    }
                }
            }
            return ids.join(",")
        }
    };
    module.exports = ToolFloat;
});