/**
 * 购物车.
 */
define(['jquery', "underscore", 'helper', 'layer', 'my-calendar', 'jquery-prompt', 'fix-float', 'message', 'base'], function($, _, helper, layer, mycalendar, jqprompet, fixFloat, Message, Base) {
    'use strict';
    /*
     * @constructor InsurePost
     * @author
     * @version 0.0.1
     * @description 数据提交
     */
    var isLogin = false;
    var carhtmlItem; //购物车模型html
    var cacheData;
    var message = new Message();
    var base = new Base();
    var car = {
        init: function() {
            car.initData();

        },
        initData: function() {
            helper.state.checkLogin(function(result) {
                isLogin = result.result;
                if (isLogin) { //是否登陆 页面须做处理
                    $("#logintips").html("页面提示购物车是空的，赶紧选购吧！");
                    $("#pingce").removeClass("fn-hide");
                } else {
                    $("#tiplogin").removeClass("fn-hide");
                    $("#loginBtn").click(function() {
                        requirejs(["sign-float"], function(signFloat) {
                            var sign = new signFloat({
                                returnUrl: location.href,
                                showRegister: true,
                                callback: function(data) { //登录成功回调
                                    location.reload();
                                }
                            });
                            setTimeout(function() {
                                $(".placeholder-text").css("top", "0px");
                            }, 500);
                        });
                    });
                    $("#registerBtn").click(function() {
                        requirejs(["sign-float"], function(signFloat) {
                            var sign = new signFloat({
                                returnUrl: location.href,
                                showRegister: true,
                                defaultTab: 2,
                                callback: function(data) { //登录成功回调
                                    location.reload();
                                }
                            });
                            setTimeout(function() {
                                $(".placeholder-text").css("top", "0px");
                            }, 500);
                        });
                    });
                    $("#toLogin").removeClass("fn-hide");
                }
                require(["require-text!/html/shopping-cart/index.html"], function(html) {
                    carhtmlItem = html;
                    car.refreshData();

                });
            });
            car.getHistory(); //获取历史数据
        },
        refreshData: function() { //刷新购物车
            var _this = this;
            // message.show('正在加载...','loading');
            helper.request.getJson({
                url: "/api/shopping-cart/list"
            }, function(data) {

                var result = cacheData = data.result;

                if (result.length > 0) { //判断是否有商品
                    $("#shopCartLoading").addClass("fn-hide");
                    $("#shopCarList").removeClass("fn-hide");
                    var carItem = "",
                        offline = 0,
                        offlineProduct = [{
                            cartItems: [],
                            cartProjectPlans: []
                        }];
                    var planOfflineProduct = [];

                    $(result).each(function(i) {
                        var _self = this;
                        if (_self.cartProjectPlans.length > 0) {
                            var planOfflineFlag = false;
                            var planIsOverFlag = false;
                            $(_self.cartItems).each(function(i) {
                                if (!this.productOnline) {
                                    planOfflineFlag = true;
                                } else if (this.isOver) {
                                    planIsOverFlag = true;
                                }
                            });
                            // 规划，如果其中一款产品下架或失效，均不可投保
                            if (planOfflineFlag) {
                                planOfflineProduct.push({
                                    cartProjectPlans: _self.cartProjectPlans.concat(),
                                    cartItems: _self.cartItems.concat()
                                });
                                _self.cartItems = [];
                                _self.cartProjectPlans = [];
                                offline++;
                            } else if (planIsOverFlag) {
                                // 失效
                                planOfflineProduct.unshift({
                                    cartProjectPlans: _self.cartProjectPlans.concat(),
                                    cartItems: _self.cartItems.concat()
                                });
                                _self.cartItems = [];
                                _self.cartProjectPlans = [];
                                offline++;
                            }
                        } else {
                            $(_self.cartItems).each(function(i) {
                                if (!this.productOnline) {
                                    offlineProduct[0].cartItems.push(this);
                                    _self.cartItems.splice(i, 1);
                                    offline++;
                                } else if (this.isOver) { //把下架的产品放到底部
                                    offlineProduct[0].cartItems.unshift(this);
                                    _self.cartItems.splice(i, 1);
                                    offline++;
                                } else {

                                }
                            });
                        }
                    });

                    // 规划打入数据
                    if (planOfflineProduct.length > 0) {
                        var len = planOfflineProduct.length,
                            i;
                        for (i = 0; i < len; i++) {
                            offlineProduct.push(planOfflineProduct[i]);
                        }
                    }

                    // 失效排序
                    if (offlineProduct.length > 0) {
                        for (var i = 0; i < offlineProduct.length; i++) {
                            var off = offlineProduct[i];
                            off.cartItems.sort(function(a, b) {
                                if (a.updateTime < b.updateTime) {
                                    return 1;
                                } else {
                                    return -1;
                                }
                            });
                            var update = off.cartItems[0] ? off.cartItems[0].updateTime : '0';
                            // 获取第一个更新日期
                            off['updateTime'] = update;
                        }
                        // 大分类排序
                        offlineProduct.sort(function(a, b) {
                            if (a.updateTime < b.updateTime) {
                                return 1;
                            } else {
                                return -1;
                            }
                        })
                    }

                    $("#carItemList").html(_.template(carhtmlItem.split("<area>")[0])({
                        datas: result,
                        OffLine: 0
                    }));
                    $("#carItemList").append(_.template(carhtmlItem.split("<area>")[0])({
                        datas: offlineProduct,
                        OffLine: offline
                    }));
                    setTimeout(function(){
                        $("#carItemList").addClass("temp-ie-fixed");
                    },300);
                    for (var i = 0; i < result.length; i++) { //处理上线产品
                        var percentComplete = 0;
                        var cartlen = result[i].cartItems.length;
                        for (var j = 0; j < cartlen; j++) {

                            carItem = result[i].cartItems[j];
                            if (result[i].cartProjectPlans.length > 0) {
                                _this.renderProtectItem(result[i], 'plan');
                            } else {
                                _this.renderProtectItem(carItem);
                            }
                            _this.renderDateLimit(carItem);

                            // 检测是否存在规划，信息是否完整
                            if (result[i].cartProjectPlans.length > 0) {
                                percentComplete += result[i].cartItems[j].percentComplete;
                                if (j === cartlen - 1 && percentComplete / cartlen !== 100) {
                                    $("i[rel=prompt_" + result[i].cartItems[0].id + "]").attr("data-prompt-html", "投保信息填写不全，请先完善投保信息").prompt();
                                }
                            } else {
                                if (result[i].cartItems[j].percentComplete !== 100) {
                                    $("i[rel=prompt_" + result[i].cartItems[j].id + "]").attr("data-prompt-html", "投保信息填写不全，请先完善投保信息").prompt();
                                }
                            }
                        }
                    }
                    for (var i = 0; i < offlineProduct.length; i++) { //处理下架产品
                        for (var j = 0; j < offlineProduct[i].cartItems.length; j++) {
                            // 设置方案保障权益
                            if (offlineProduct[i].cartProjectPlans.length > 0) {
                                _this.renderProtectItem(offlineProduct[i], 'plan');
                            } else {
                                _this.renderProtectItem(offlineProduct[i].cartItems[j]);
                            }
                            _this.renderDateLimit(offlineProduct[i].cartItems[j]);
                        }
                    }

                    var fix = new fixFloat({
                        el: $("#bottombar"),
                        fixPanel: $("#carItemList"),
                        fixClass: "fixed-insure-cart-foot",
                        fixbuttom: true
                    });

                } else {
                    $("#carItemList").html();
                    $("#shopCarList").addClass("fn-hide");
                    $("#shopCartLoading").addClass("fn-hide");

                    $("#notLoginEmpty").removeClass("fn-hide");
                }
                message.hide();
            }, function(data) {
                if (data.message) {
                    layer.msg(data.message);
                }
            });
        },
        getDoubleNum: function(dateStr) { //格式化日期
            var arrStr = dateStr.split("-");
            $.each(arrStr, function(i) {
                if (parseInt(arrStr[i]) < 9) {
                    arrStr[i] = "0" + parseInt(arrStr[i]);
                }
            });
            return arrStr.join("-");
        },
        renderDateLimit: function(carItem) { //起保日期限制
            var startDate = new Date(),
                _this = this,
                nowDate = new Date(),
                hasStartDate = false,
                curItemMinDate = '',
                c1 = "",
                deadLine,
                deadLineCount = 0,
                endDate = new Date(),
                defaultValue = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + "-" + nowDate.getDate();
            if (carItem.productEffectiveDate) {
                if (carItem.productEffectiveDate.effectiveType === 1) { //起保日期限制

                    if (carItem.productEffectiveDate.effectiveStartDay === 0) { //当日投保
                        deadLine = carItem.productEffectiveDate.deadline.split(":");
                    } else { //次日投保
                        deadLine = carItem.productEffectiveDate.nextDayDeadline.split(":");
                    }
                    if (nowDate.getHours() > deadLine[0] || (nowDate.getHours() === ~~deadLine[0] && nowDate.getMinutes() > deadLine[1])) {
                        deadLineCount = 1;
                    }

                    startDate.setDate(nowDate.getDate() + carItem.productEffectiveDate.effectiveStartDay + deadLineCount);
                    endDate.setDate(nowDate.getDate() + carItem.productEffectiveDate.effectiveEndDay + deadLineCount);

                    // 屏蔽修改起保日期
                    hasStartDate = true;
                    curItemMinDate = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate();
                    // c1 = new MyCalendar({
                    //     el: $('#calendar-' + carItem.id)[0], //触发的元素
                    //     minDate: startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate(), //日期范围控制-最小日期
                    //     maxDate: endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate(),
                    //     callback: _this.canlendarCallback, //回调
                    //     insureNum: carItem.insureNum
                    // });
                } else if (carItem.productEffectiveDate.effectiveType === 2) {
                    // c1 = new MyCalendar({
                    //     el: $('#calendar-' + carItem.id)[0], //触发的元素
                    //     callback: _this.canlendarCallback, //回调
                    //     insureNum: carItem.insureNum,
                    //     minDate: carItem.productEffectiveDate.fixedEffectiveLatestDate.split("T")[0], //日期范围控制-最小日期
                    //     maxDate: carItem.productEffectiveDate.fixedEffectiveLatestDate.split("T")[0]
                    // });

                    // 屏蔽修改起保日期
                    curItemMinDate = carItem.productEffectiveDate.fixedEffectiveLatestDate.split("T")[0];
                    hasStartDate = true;                    
                } else if (carItem.productEffectiveDate.effectiveType === 3) {
                    // $('#calendar-' + carItem.id).parent().html("<span>" + carItem.productEffectiveDate.fixedEffectiveContent + "</span>");
                    $('#txStartDate-' + carItem.id).html(carItem.productEffectiveDate.fixedEffectiveContent);
                }
            } else {
                // c1 = new MyCalendar({
                //     el: $('#calendar-' + carItem.id)[0], //触发的元素
                //     callback: _this.canlendarCallback, //回调
                //     insureNum: carItem.insureNum,
                //     minDate: defaultValue, //日期范围控制-最小日期
                // });
                // 屏蔽修改起保日期
                curItemMinDate = defaultValue;
                hasStartDate = true;                
            }

            if (hasStartDate) {
                var _startDate = carItem.startDate && carItem.startDate.split("T")[0];
                $('#txStartDate-' + carItem.id).html(_startDate || _this.getDoubleNum(curItemMinDate) 
                    || _this.getDoubleNum(defaultValue));
            }

            // if (c1) {
            //     var _startDate = carItem.startDate && carItem.startDate.split("T")[0];
            //     $('#calendar-' + carItem.id).val(_startDate || _this.getDoubleNum(c1.minDate) || _this.getDoubleNum(defaultValue));
            // }
        },
        // 保障权益信息
        renderProtectItem: function(carItem, flag) {
            var flag = flag || ''
            if (!flag) {
                var restrictRuleObj = carItem.restrictRule,
                    relateId;
                if (restrictRuleObj) {
                    $.each((restrictRuleObj.protectTrialItemList || []), function() { //处理关联保额
                        relateId = this.relateCoverageId;
                        var pitem = this;
                        if (relateId) {
                            $.each(restrictRuleObj.restrictGenes, function() {
                                if (this.protectItemId === ~~relateId) {
                                    pitem.fullPremium = this.defaultValue;
                                }
                            });
                        }
                    });
                    $("#protect_" + carItem.id).attr("data-prompt-html", _.template(carhtmlItem.split("<area>")[1])({
                        protectItems: helper.utils.marginProtectList(restrictRuleObj.protectTrialItemList)
                    })).prompt();
                }
            } else if (flag === 'plan') {
                // 规划信息
                var projectPlans = carItem.cartProjectPlans;
                // 取默认第一个
                var protectItem = projectPlans[0].protectItem;
                var cartItemId = carItem.cartItems[0].id;
                if (protectItem !== '') {
                    var item = JSON.parse(protectItem);
                    $('#protect_' + cartItemId).attr("data-prompt-html", _.template(carhtmlItem.split("<area>")[2])({
                        protectItems: item
                    })).prompt();
                }
            }
        },
        canlendarCallback: function(date, args) {
            var _this = this;

            if (args.type !== 'date') {
                return;
            }
            message.show('正在加载...', 'loading');
            helper.request.postData2({
                url: "/api/insurance-slips/" + this.insureNum + "/start-date",
                data: {
                    insureNum: this.insureNum,
                    startDate: date
                },
                method: "PUT"
            }, function(result) {
                message.hide();
                if (!result.result) {
                    layer.msg("更改起保日期失败！");
                } else {
                    $(_this.el).closest(".insure-cart-body").find(".checkItem").attr("over", "false");
                    window.location.reload();
                }
            });
        },
        initReact: function() {
            $("#viewWraper").css("width", $("#viewWraper li").length * 220 + "px");
        },
        deleteInsure: function(insureNum, type) {
            var type = type || '';
            var url = '';
            if (type === 'plan') {
                url = '/api/shopping-cart/items?projectInsuranceGroup=' + insureNum + '&type=' + type;
            } else {
                url = '/api/shopping-cart/items?insuranceNum=' + insureNum;
            }
            if (isLogin) { //判断是否登陆 ，已登录从浏览器删除，未登录从cookie删除
                helper.request.postData({
                    url: url,
                    method: "DELETE",
                    data: {}
                }, function(result) {
                    if (result.result) {
                        layer.msg("删除成功");
                        car.refreshData();
                    } else {
                        layer.msg(result.message);
                    }
                });
            } else {
                var insureNumstr = helper.cookie.getCookie("InsureNums");
                if (typeof insureNum == 'string') {
                    helper.cookie.setCookie("InsureNums", insureNumstr.replace(insureNum + ",", "").replace(insureNum, ""), 0, ".huize.com");
                } else {
                    var len = insureNum.length,
                        i;
                    for (i = 0; i < len; i++) {
                        helper.cookie.setCookie("InsureNums", insureNumstr.replace(insureNum[i] + ",", "").replace(insureNum[i], ""), 0, ".huize.com");
                        insureNumstr = helper.cookie.getCookie("InsureNums");
                    }
                }
                if (insureNumstr.lastIndexOf(',') == insureNumstr.length - 1) {
                    helper.cookie.setCookie("InsureNums", insureNumstr.substring(0, insureNumstr.length - 1), 0, ".huize.com");
                }
                car.refreshData();
            }
        },
        initAction: function() {
            var _this = this;
            $("#shopCarList")
                .on("click", ".delBtn", function() { //删除产品
                    var self = this;
                    layer.confirm('<p class="pt45 pb45 tac">确认要从购物车中删除该产品吗？</p>', { //弹出弹窗让用户确认是否删除投保单号
                        btn: ['取消', '确定'],
                        area: '530px',
                        title: false,
                        btn1: function() {
                            layer.closeAll();
                        },
                        btn2: function(index) {
                            var type = $(self).attr('data-type') || '';
                            if (type === 'plan') {
                                if (isLogin) {
                                    _this.deleteInsure($(self).attr("data-group"), type);
                                } else {
                                    var insurenum = [];
                                    // 未登录
                                    $(self).parents('ul').find('input[type=hidden]').each(function() {
                                        insurenum.push($(this).attr('insurenum'));
                                    });
                                    _this.deleteInsure(insurenum, type);
                                }
                            } else {
                                _this.deleteInsure($(self).attr("pid"));
                            }
                        }
                    });
                })
                .on("click", "#checkAllCom", function() { //选中全部
                    var checked = 'hz-check-item-checked';
                    if ($(this).hasClass(checked)) {
                        $(this).removeClass(checked);
                        $(".checkItem").removeClass(checked);
                    } else {
                        $(this).addClass(checked);
                        $(".checkItem").removeClass(checked);
                        var $checkItem = $(".checkItem[support='true']:not([over='true']):not([online='false'])");
                        var len = $checkItem.length;
                        var flag = false;
                        var status = 1;
                        (function checkInfo(status) {
                            $checkItem.each(function(i) {
                                var $this = $(this);
                                var _type = $this.attr('data-type') || '';
                                if (status === 1) { // 选中单品资料完善100的
                                    if ($this.attr('process') === '100' && _type !== 'plan') {
                                        flag = true;
                                        $this.addClass(checked);
                                    }
                                } else if (status === 2) { // 选中规划完善100的
                                    if ($this.attr('process') === '100') {
                                        flag = true;
                                        $this.addClass(checked);
                                    }
                                } else if (status === 3) { // 选中单品
                                    if (_type !== 'plan') {
                                        flag = true;
                                        $this.addClass(checked);
                                    }
                                } else if (status === 4) {
                                    flag = true;
                                    $this.addClass(checked);
                                }
                                // 方案只能选一个
                                if ((status === 2 || status === 4) && _type === 'plan' && flag) {
                                    return false;
                                }
                                if (i === len - 1 && !flag) {
                                    status++;
                                    checkInfo(status);
                                }
                            });
                        })(status);
                        // $(".checkItem[support='true']:not([over='true']):not([online='false'])").addClass("hz-check-item-checked");
                    }
                    _this.calPrice();
                })
                .on("click", ".checkItem", function() { //点击选择产品
                    var isSupport = $(this).attr("support");
                    var type = $(this).attr('data-type') || '';
                    var checked = 'hz-check-item-checked';

                    if (type === 'plan') {
                        // 方案只能单选
                        if ($(this).hasClass(checked)) {
                            $(this).removeClass(checked);
                            $('#checkAllCom').removeClass(checked);
                        } else {
                            $('.checkItem').removeClass(checked);
                            $(this).addClass(checked);
                        }
                    } else {
                        if ($(this).hasClass(checked)) {
                            $(this).removeClass(checked);
                            $('#checkAllCom').removeClass(checked);
                        } else {
                            if (isSupport === "false") {
                                $(".checkItem").removeClass(checked);
                            } else {
                                $(".checkItem[support='false']").removeClass(checked);
                            }
                            // 规划不能多选
                            $('.checkItem[data-type="plan"]').removeClass(checked);
                            $(this).addClass(checked);
                        }
                    }


                    if ($(this).attr("activeid")) { //营销信息处理
                        var actId = $(this).attr("activeid");
                        var premiumMax = 0;
                        var $checkArray = $("div.hz-check-item-checked[activeid='" + $(this).attr("activeid") + "']");
                        var mincny = $("#actId_" + actId).attr("minCount");
                        var insureNums = [];
                        if ($checkArray.length > 0) {
                            $("#tips_" + actId).removeClass("fn-hide");
                        } else {
                            $("#tips_" + actId).addClass("fn-hide");
                        }
                        $checkArray.each(function(index, item) {
                            var type = $(item).attr('data-type') || '';
                            if (type === 'plan') {
                                var $hidden = $(item).find('input');
                                if ($hidden.length > 0) {
                                    $hidden.each(function() {
                                        premiumMax += parseInt($(this).attr("premium"));
                                        insureNums.push({
                                            insuranceNum: parseFloat($(this).attr("insurenum")),
                                            premium: parseFloat($(this).attr("premium"))
                                        });
                                    });
                                }
                            } else {
                                premiumMax += parseInt($(item).attr("premium"));
                                insureNums.push({
                                    insuranceNum: parseFloat($(item).attr("insurenum")),
                                    premium: parseFloat($(item).attr("premium"))
                                });
                            }
                        });

                        if (premiumMax - mincny < 0) {
                            $("#tips_" + actId).html("还差" + (mincny - premiumMax) / 100);
                        } else {
                            helper.request.postData2({
                                url: "/api/insurance-slips/amount/choosed",
                                data: insureNums
                            }, function(result) {
                                if (result.result) {
                                    $("#tips_" + actId).html("已减" + (mincny - premiumMax) / 100);
                                }
                            }, function(result) {
                                if (result.status === 10302 || result.status === 10401) { //如果不存在则刷新页面
                                    layer.msg(result.message);
                                    setTimeout(function() {
                                        location.reload();
                                    }, 5000);
                                } else if (result.status === -2147483648) {
                                    layer.msg(result.message);
                                }
                            });
                        }
                    }
                    _this.calPrice();
                })
                .on("click", "#toPayAll", function() { //去支付
                    var $checkItemlist = $("#carItemList .hz-check-item-checked");
                    if ($checkItemlist.length === 0) {
                        layer.msg("请选择要支付的产品");
                    } else {
                        message.show("结算中....", "loading");
                        var payAll = function() { //支付
                            var _payArray = [],
                                _invalid = "", //是否包含无效产品
                                _proName = "",
                                _hightfee = "", //高保额
                                _insureErrorNum = "",
                                _noComplete = ""; //没有填写完成的产品
                            $checkItemlist.each(function() {
                                var $this = $(this);
                                var _type = $this.attr('data-type') || '';

                                // 规划数据
                                if (_type === 'plan') {
                                    _proName = $this.attr("data-title");
                                    $this.find('input').each(function() {
                                        _payArray.push({
                                            insuranceNum: $(this).attr("insurenum"),
                                            premium: $(this).attr("premium")
                                        });
                                    });
                                } else {
                                    // 单品数据
                                    _proName = $("#name_" + $this.attr("insureNum")).html();
                                    _payArray.push({
                                        insuranceNum: $this.attr("insurenum"),
                                        premium: $this.attr("premium")
                                    });
                                }

                                if ($this.attr("over") === "true") {
                                    _invalid = _proName + "产品已经过期，请修改起保日期后再结算"
                                } else if ($this.attr("online") === "false") {
                                    _invalid = _proName + "产品已经下架，不能结算"
                                }

                                if ($this.attr("process") !== "100") {
                                    _noComplete = "您勾选的产品中有未填写完整的保单，请填写完再支付";
                                }

                                if ($this.attr("payStatus") === "2" && $checkItemlist.length > 1) { //如果有多个产品，并且其中有一个是高保额则提示
                                    _hightfee = "被保险人" + $("#" + $this.attr("insurenum") + "_insurantName").html() + "保额达到保险公司规定的保额限制，请您单独提交结算";
                                    _insureErrorNum = $this.attr("insurenum");
                                }

                            });

                            if (_invalid) {
                                layer.msg(_invalid);
                                return;
                            }

                            if (_noComplete) {
                                layer.msg(_noComplete);
                                return;
                            }

                            if (_hightfee) {
                                helper.page.showSingleBtn('<p class="pt45 pb45 tac">' + _hightfee + '</p>');
                                return;
                            }

                            message.show('提交结算...', 'loading');
                            helper.request.postData2({
                                url: "/api/orders/settlement",
                                data: _payArray
                            }, function(result) {
                                message.hide();
                                /*
                                if(result.result.insuranceResults&&result.result.insuranceResults[0]&&result.result.insuranceResults[0].errorMsg){
                                    var errMessage=result.result.insuranceResults[0].errorMsg;
                                    helper.page.showSingleBtn(errMessage,function(){
                                        if(errMessage.indexOf("起保日期")===-1){
                                            location.reload();
                                        }else{
                                            layer.closeAll();
                                        }
                                    });
                                    return;
                                }*/
                                if (result.result.uuid) {
                                    location.href = "/orders/settlement/" + result.result.uuid;
                                }
                            }, function(result) {
                                if (result.status === 10261) {
                                    message.show('部分投保单已结算，正在为您刷新页面', 'warning');
                                    setTimeout(function() {
                                        location.reload();
                                    }, 5000);
                                } else {
                                    layer.msg(result.message);
                                }
                            });
                        };
                        helper.state.checkLogin(function(result) {
                            if (!result.result) { //没登录弹出框
                                requirejs(["sign-float"], function(signFloat) {
                                    var sign = new signFloat({
                                        returnUrl: location.href,
                                        showRegister: true,
                                        callback: function(data) { //登录成功回调
                                            location.reload();
                                        }
                                    });
                                });
                            } else {
                                payAll();
                            }
                            message.hide();
                        });
                    }
                })
                .on("click", "#toCompare", function() { //去对比
                    var $checkItemlist = $(".hz-check-item-checked:not(#checkAllCom)"),
                        planIdstr = "",
                        _$item,
                        urlPlanId = [];
                    var flag = false;
                    $checkItemlist.each(function(i) {
                        _$item = $(this);
                        if (planIdstr.indexOf(_$item.attr("planId")) === -1) { //去重
                            urlPlanId.push(_$item.attr("planId"));
                            planIdstr = planIdstr + _$item.attr("planId");
                        }
                        var _type = _$item.attr('data-type') || '';
                        if (_type === 'plan') {
                            layer.msg("规划不能进行对比");
                            flag = true;
                            return false;
                        }
                    });

                    if (flag) {
                        return false;
                    }

                    if (urlPlanId.length < 2) {
                        layer.msg("至少选择两款产品");

                    } else if (urlPlanId.length > 4) {
                        layer.msg("对比的产品不能超过四个");
                    } else {

                        for (var i = urlPlanId.length; i < 4; i++) {
                            urlPlanId.push("0");
                        }
                        helper.page.openNewTag("/contrast-" + urlPlanId.join("-"));
                    }
                })
                .on("click", "a[hrefurl]", function() {
                    var $this = $(this),
                        _insureNum = $this.attr("insureNum"),
                        _url = $this.attr("hrefurl"),
                        _type = $this.attr('data-type') || '';
                    helper.request.getJson({
                        url: "/api/insurance-slips/" + _insureNum + "/is-ready"
                    }, function(data) {
                        location.href = _url;
                    }, function(data) {
                        if (data.status === 10401 || data.status === 10603) {
                            layer.msg(data.message);
                            setTimeout(function() {
                                location.reload();
                            }, 4000);
                        } else if (data.status === 10317) {
                            var productUrl = $this.closest(".insure-cart-body").find(".product-title a").attr("href");
                            if (_type === 'plan') {
                                var group = $this.attr('data-group') || '';
                                helper.page.showSingleBtn('<p class="pt45 pb45 tac">' + $("#name_" + _insureNum).html() + '产品试算信息发生变更，无法结算。需重新添加购物车哦~</p>', function() {
                                    _this.deleteInsure(group, _type);
                                    window.location.href = productUrl;
                                }, "删除并返回产品详情页");
                            } else {
                                helper.page.showSingleBtn('<p class="pt45 pb45 tac">' + $("#name_" + _insureNum).html() + '产品试算信息发生变更，无法结算。需重新添加购物车哦~</p>', function() {
                                    _this.deleteInsure(_insureNum);
                                    window.location.href = productUrl;
                                }, "删除并返回产品详情页");
                            }
                        } else {
                            helper.page.showSingleBtn('<p class="pt45 pb45 tac">' + data.message + '</p>', function() {}, "知道了");
                        }
                    });
                });
            //历史记录动画
            $("#historyData")
                .on("click", "#nextBtn", function() { //浏览记录向前
                    if ($("#viewWraper li").length < 5) {
                        return;
                    }
                    var
                        ulWidth = $("#viewContainer ul").width(),
                        scrollLeft = $("#viewContainer").scrollLeft(),
                        viewWidth = $("#viewContainer").width(),
                        $tempUl = scrollLeft > ulWidth ? $("#viewContainer ul").eq(0) : [];
                    if (ulWidth * 2 - scrollLeft === viewWidth) {
                        $("#historyViewWrap ul").eq(0).remove();
                        $("#viewContainer").scrollLeft(scrollLeft - ulWidth);
                        $("#historyViewWrap").append($tempUl);
                    }
                    scrollLeft = $("#viewContainer").scrollLeft();
                    $("#viewContainer").scrollLeft(scrollLeft + 220);
                })
                .on("click", "#prevBtn", function() { //浏览记录向后
                    if ($("#viewWraper li").length < 5) {
                        return;
                    }
                    var
                        ulWidth = $("#viewContainer ul").width(),
                        scrollLeft = $("#viewContainer").scrollLeft(),
                        viewWidth = $("#viewContainer").width(),
                        $tempUl = $("#viewContainer ul").eq(1);
                    if (scrollLeft === viewWidth) {
                        $("#historyViewWrap ul").eq(1).remove();
                        $("#viewContainer").scrollLeft(scrollLeft + ulWidth);
                        $tempUl.insertBefore($("#historyViewWrap ul"));
                    }
                    scrollLeft = $("#viewContainer").scrollLeft();
                    $("#viewContainer").scrollLeft(scrollLeft - 220);
                });
            $("#notLoginEmpty")
                .on("click", "#toLogin", function() {
                    requirejs(["sign-float"], function(signFloat) {
                        var sign = new signFloat({
                            returnUrl: location.href,
                            showRegister: true,
                            callback: function(data) { //登录成功回调
                                location.reload();
                            }
                        });
                    });
                });
        },
        calPrice: function() { //计算保费
            var $checkList = $("#carItemList .hz-check-item-checked");
            var postData = [];
            var saveMoney = 0;
            for (var i = 0; i < $checkList.length; i++) {
                var $hidden = $($checkList[i]).find('input');
                if ($hidden.length > 0) {
                    // 针对规划多个产品遍历
                    for (var j = 0, jLen = $hidden.length; j < jLen; j++) {
                        var $h = $hidden.eq(j);
                        postData.push({
                            insuranceNum: parseFloat($h.attr("insurenum")),
                            premium: parseFloat($h.attr("premium"))
                        })
                        saveMoney += ($h.attr("originalPrice") - $h.attr("premium"));
                    }
                } else {
                    postData.push({
                        insuranceNum: parseFloat($($checkList[i]).attr("insurenum")),
                        premium: parseFloat($($checkList[i]).attr("premium"))
                    });
                    saveMoney += ($($checkList[i]).attr("originalPrice") - $($checkList[i]).attr("premium"));
                }
            }
            $("#checked").html($checkList.length);

            if (postData.length > 0) { //计算保额
                helper.request.postData2({
                    url: "/api/insurance-slips/amount/choosed",
                    data: postData
                }, function(result) {
                    if (result.result) {
                        $("#totalMoney").html(((result.result.totalPremium - result.result.totalDiscount) / 100).toFixed(2));
                        $("#saveMoney").html((saveMoney / 100).toFixed(2));
                    }
                }, function(result) {
                    if (result.status === 10302 || result.status === 10401) { //如果不存在则刷新页面
                        layer.msg(result.message);
                        setTimeout(function() {
                            location.reload();
                        }, 5000);
                    } else if (result.status === 10317) {
                        helper.page.showSingleBtn(result.message, function() {
                            car.deleteInsure()
                        })
                    } else if (result.status === -2147483648 || result.status === 10305) {
                        layer.msg(result.message);
                    }
                });
            } else {
                $("#totalMoney").html("0.00");
                $("#saveMoney").html("0.00");
            }
        },
        getHistory: function() { //获取浏览数据
            var historyProducts = helper.cookie.getCookie("Product_History");
            var planIds = historyProducts.split(",");
            var productIds = [];
            planIds = $.grep(planIds, function(e) { //删除空元素
                return e !== "";
            });

            $.each(planIds, function(item) {
                if (this.split(":")[1]) {
                    productIds.push(this.split(":")[1]);
                }
            });
            helper.request.postData2({
                url: "/api/products/plans/list",
                data: productIds
            }, function(result) {
                require(["require-text!/html/shopping-cart/product-history.html"], function(html) {
                    if (result.result.length) {
                        var
                            $historyList = $(_.template(html)({
                                datas: result.result
                            })),
                            length = $historyList.find("li").length,
                            ulWidth = length * 220,
                            $historyListClone = length > 5 ? $historyList.width(ulWidth).css("float", "left").clone().attr("id", "historyListClone") : "",
                            $wrap = $("<div id='historyViewWrap'></div>").append($historyList).append($historyListClone).width(ulWidth * (length > 5 ? 2 : 1));
                        $("#viewContainer").html($wrap).scrollLeft(ulWidth);
                        if (length <= 5) {
                            $("#prevBtn,#nextBtn").addClass("view-history-scroll-prev-disabled");
                        }
                    } else {
                        $("#historyPanel").hide();
                        $("#emptyData").show();
                    }
                });

            });
            car.initAction();
        }
    };
    return car;
});