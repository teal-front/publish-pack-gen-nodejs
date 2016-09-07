/**
 *
 */
define([
    'jquery',
    'underscore',
    'fix-float',
    'helper',
    'my-calendar',
    'base',
    'layer',
    'message',
    'require'
], function($,
    _, //underscore
    fixFloat,
    helper,
    myCalendar,
    Base, //基础类
    layer, //弹出框
    Messager,
    requireJs
) {
    'use strict';
    var protectItemHtml = "",
        notSupportInsure = "--",
        calendars = [],
        downHtml = "", //下拉框模板
        inputHtml = "", //文本输入框模板
        COLS = 4, //固定对比的计划数量
        messager=new Messager(),
        restrictRules="",
        spanHtml = ""; //纯文本
    var otherInfoObj = {
        "periodHesitation": {
            name: "犹豫期限"
        },
        "labelList": {
            name: "卖点"
        },
        "satisfaction": {
            name: "满意度"
        },
        "impressionList": {
            name: "买家印象"
        },
        "insureAreaList": {
            name: "投保地区"
        },
        "salePromotionList": {
            name: "促销信息"
        },
        "sendTypeName": {
            name: "保单形式"
        }
    }; //其他信息
    var compare = {
        init: function() {
            var fix = new fixFloat({
                el: $("#compareFloat"),
                fixPanel: $("#comparePanelProduct"),
                fixClass: "fixed-detail-tab-wrap",
                callback: function(result) {
                    if (result === "add") {
                        $("#compareFloat").removeClass("fn-hide");
                    } else {
                        $("#compareFloat").addClass("fn-hide");
                    }
                }
            });
            var planIds=location.href.split("-").slice(1,5);
            planIds= $.grep(planIds,function(e){
                return e!=="0";
            });
            helper.request.postData2({url:"/api/products/comparison",data:planIds},function(data){
                restrictRules=data.result;
                compare.render.renderProduct();
            });
            requireJs(["fixed-tool-float"], function(toolFloat) { // 加载工具条
                compare.toolFloat=new toolFloat();
            });
        },
        render: {
            renderControl: function(cItem, options) {//渲染控件
                var controlHtml = "",
                    display = cItem.display ? "" : "fn-hide",
                    unitText=options.unitText?options.unitText:cItem.showUnit?cItem.showUnit:"",
                    selectValue,
                    enabled=cItem.enabled?"":"disabled",
                    datas;
                switch (cItem.controlType) {
                    case 0:
                    case 2: //文本框
                        controlHtml = "<div class='hz-dropdown "+enabled+"' planId='" + options.planId + "' isProtect='" + options.isProtect + "' key='" + (cItem.key || "") + "' defaultValue='"+cItem.defaultValue+"' optValue='" + cItem.defaultValue + "' lastValue='" + cItem.defaultValue + "' protectItemId='" + (cItem.protectItemId || "") + "'><div class='input-select "+ display + "'><span class='input-select-text'>" + (enabled?(cItem.dictionaryList&&cItem.dictionaryList[0].value||cItem.defaultValue):cItem.defaultValue) + "</span><b class='iconfont'>&#xe70b;</b></div>";
                        controlHtml = controlHtml + '<div class="hz-dropdown-content" style="display:none;"><ul class="hz-dropdown-menu">';
                        $(cItem.dictionaryList).each(function(index, item) {
                            if (item.step !== 0 && item.type === 2) {
                                for (var i = item.min; i <= item.max; i = i + item.step) {
                                    selectValue = i + compare.utils.getUnit(item.unit);
                                    controlHtml = controlHtml + "<li planId='" + options.planId + "' key='" + (cItem.key || "") + "' protectItemId='" + (cItem.protectItemId || "") + "' class='hz-select-option' selectValue=" + selectValue + ">" + selectValue + "</li>";
                                }
                            } else {
                                selectValue = item.value + compare.utils.getUnit(item.unit);
                                controlHtml = controlHtml + "<li planId='" + options.planId + "' key='" + (cItem.key || "") + "' protectItemId='" + (cItem.protectItemId || "") + "' class='hz-select-option' selectValue='" + selectValue + "'>" + selectValue + "</li>";
                            }
                        });
                        controlHtml = controlHtml+"</div>";
                        break;
                    case 1:
                    case 3: //日期控件
                        datas = {
                            planId: options.planId,
                            className: (cItem.controlType === 1 ? "Wdate" : "input-text ") + display,
                            dict: JSON.stringify(cItem.dictionaryList&&cItem.dictionaryList[0]),
                            isProtect: options.isProtect,
                            key: cItem.key || "",
                            optValue: cItem.defaultValue,
                            defaultValue:cItem.defaultValue,
                            enabled:enabled,
                            protectItemId: cItem.protectItemId || ''
                        };
                        controlHtml = _.template(inputHtml)({
                            datas: datas
                        });
                        break;
                    case 4:
                        controlHtml = "";
                        var restrict = cItem.subRestrictGeneList||[];
                        $.each(restrict, function(index, ritem) {
                            $.each(ritem.dictionaryList, function(index, item) {
                                if (ritem.defaultValue === item.value) {
                                    ritem.defaultText = item.byname;
                                }
                            });
                            ritem.planId = options.planId;
                            ritem.isProtect = options.isProtect;
                            ritem.protectItemId = cItem.protectItemId || "";
                            ritem.controlType = "areaType";
                            controlHtml = controlHtml + _.template(downHtml)({
                                datas: ritem
                            });
                        });
                        if (cItem.dictionaryList&&cItem.dictionaryList.length>0) {
                            $.each(cItem.dictionaryList, function(index, item) {
                                if (cItem.defaultValue === item.value) {
                                    cItem.defaultText = item.byname;
                                }
                            });
                            cItem.planId = options.planId;
                            cItem.isProtect = options.isProtect;
                            cItem.protectItemId = cItem.protectItemId || "";
                            cItem.controlType = "areaType";
                            controlHtml = controlHtml + _.template(downHtml)({
                                datas: cItem
                            });
                        }
                        break;
                    case 5: //省市区
                        datas = {
                            planId: options.planId,
                            className: display,
                            dict: JSON.stringify(cItem.dictionaryList&&cItem.dictionaryList[0]),
                            isProtect: options.isProtect,
                            key: cItem.key || "",
                            optValue: cItem.defaultValue,
                            protectItemId: cItem.protectItemId || ''
                        };
                        $.each(cItem.dictionaryList, function(index, item) {
                            if (item.value === cItem.defaultValue) {
                                datas.defaultValue = item.value;
                                datas.defaultText = item.value;
                            }
                        });
                        datas.dictionaryList = cItem.dictionaryList;
                        controlHtml = _.template(downHtml)({
                            datas: datas
                        });
                        break;
                    case 6: //职业
                        datas = {
                            planId: options.planId,
                            className: display,
                            dict: JSON.stringify(cItem.dictionaryList&&cItem.dictionaryList[0]),
                            isProtect: options.isProtect,
                            key: cItem.key || "",
                            optValue: cItem.defaultValue,
                            protectItemId: cItem.protectItemId || ''
                        };
                        controlHtml = _.template(spanHtml)({
                            datas: datas
                        });
                        break;
                }
                return controlHtml+unitText+(cItem.notice?"</div><div class='mt10'>"+cItem.notice+"</div>":"");
            },
            renderProduct: function() { //渲染计划信息

                require(["require-text!/html/compare/compare-header.html"], function(html) {
                    var templateHtml = html.split("<area>");
                    $("#comparePanelProduct colgroup,#compareFloat colgroup").html(_.template(templateHtml[0])({
                        datas: restrictRules
                    }));
                    $("#comparePanelProduct thead,#compareFloat thead").html(_.template(templateHtml[1])({
                        datas: restrictRules
                    }));
                    protectItemHtml = templateHtml[2];
                    downHtml = templateHtml[3];
                    inputHtml = templateHtml[4];
                    spanHtml = templateHtml[5];
                    compare.render.renderGen();
                    compare.render.renderprotect();
                    compare.actions.initAction();
                    compare.actions.initInputAction();
                    messager.hide();
                    $(".hz-loading-wrap").hide();
                });
            },
            renderGen: function() { //渲染试算因子
                var restrictGenes = [];
                $.each(restrictRules, function(index, item) {
                    restrictGenes = restrictGenes.concat(item.restrictRuleOperList[0].restrictGenes||[]);
                });
                var keyList = compare.utils.maxProperty(restrictGenes),
                    genHtml = "<tr>",
                    itemObjMap={},//合并试算因子映射，例如保额
                    tempHtml="",
                    isMatch = false;
                for (var key in keyList) {
                       genHtml = genHtml + '<th class="tar">' + keyList[key].name + '</th>';
                       for (var i = 0; i < COLS; i++) {
                           var item = restrictRules[i];
                           if (item) {
                               itemObjMap[item.planId]={};
                               isMatch = false;
                               $.each(item.restrictRuleOperList[0].restrictGenes, function(index, gitem) {
                                   if (gitem.key === key||gitem.name === key) {
                                       tempHtml=compare.render.renderControl(gitem, {
                                           planId: item.operPlanId,
                                           isProtect: false
                                       });
                                       var
                                           max = ((gitem.dictionaryList || [])[0] || {}).max,
                                           step = ((gitem.dictionaryList || [])[0] || {}).step,
                                           unit = ((gitem.dictionaryList || [])[0] || {}).unit;
                                       if(max){
                                           //tempHtml += '<p class="f12 pt10 fc6">最大' + max + compare.getUnit(unit) + '，需为' + step + '的倍数</p>';
                                       }
                                       if(!itemObjMap[item.planId][gitem.name]){
                                           itemObjMap[item.planId][gitem.name]=1;
                                           genHtml=genHtml+"<td>"+tempHtml;
                                       }else{
                                           genHtml = genHtml+","+tempHtml;
                                       }
                                       isMatch = true;
                                   }
                               });
                               genHtml=genHtml+"</td>";
                               if (!isMatch) {
                                   genHtml = genHtml + "<td  planId='" + item.operPlanId + "'>-</td>";
                               }
                           } else {
                               genHtml = genHtml + "<td></td>";
                           }
                       }
                       genHtml = genHtml + "</tr>";

                }
                genHtml = genHtml + "</tr>";
                $("#genbodys").html(genHtml);

            },
            getUnit: function(number) {
                return {
                        0: '',
                        1: '份',
                        2: '万元',
                        3: '元',
                        4: '0元',
                        5: '00元', //(作废)
                        6: '000元', //(作废)
                        7: '岁',
                        8: '年',
                        9: '月',
                        10: '天',
                        11: '元/年',
                        12: '个',
                        13: '周岁',
                        14: '岁' //(实现是:岁（起保日）)
                    }[number] || '';
            },
            renderprotect: function() { //渲染保障项目
                var protectType = {},
                    protectItem = [];
                $.each(restrictRules, function(index, item) { //获得所有的分类key
                    var  unitText="",
                        _text="",
                        _premText="",
                    groupMap = item.restrictRuleOperList[0].protectTrialItemGroup;
                    for (var key in groupMap) {
                        if (!protectType[key]) {
                            protectType[key] = {};
                        }
                        $.each(groupMap[key], function(index, ditem) {
                            protectItem = (item.restrictRuleOperList[0].protectTrialItemList&&item.restrictRuleOperList[0].protectTrialItemList[ditem])||{};
                            if(protectItem.display) {
                                if (protectItem) {
                                    _premText = protectItem.fullPremium || protectItem.premium;
                                    unitText=protectItem.showUnit?protectItem.showUnit:"";
                                    protectItem.name = $.trim(protectItem.name.replace(/"/g,""));
                                    if (!protectType[key][protectItem.name]) {
                                        protectType[key][protectItem.name] = {
                                            name: protectItem.name
                                        };
                                        protectType[key][protectItem.name][item.operPlanId] = {};

                                        if(!_premText&&protectItem.relateCoverageId){//如果没有文案，判断是否是关联项
                                            var relateItem = compare.utils.getRelateCoverageItem(protectItem.relateCoverageId);
                                            relateItem.display=true;
                                            _premText = compare.render.renderControl(relateItem, {
                                                planId: item.operPlanId,
                                                isProtect: false,
                                                unitText:protectItem.showUnit
                                            });
                                            unitText="";
                                        }

                                        protectType[key][protectItem.name][item.operPlanId].text = _premText ? (_premText + unitText) : "";
                                        protectType[key][protectItem.name][item.operPlanId].item = protectItem;
                                        protectType[key][protectItem.name][item.operPlanId].combine=protectItem.protectItemId;
                                    } else {
                                        if (!protectType[key][protectItem.name][item.operPlanId]) {
                                            protectType[key][protectItem.name][item.operPlanId] = {};
                                        }

                                        if (protectType[key][protectItem.name][item.operPlanId].text) {
                                            _text = protectType[key][protectItem.name][item.operPlanId].text + "<protectItem/>";
                                        } else {
                                            _text = "";
                                        }
                                        if(!_premText&&protectItem.relateCoverageId){//如果没有文案，判断是否是关联项
                                           var relateItem = compare.utils.getRelateCoverageItem(protectItem.relateCoverageId);
                                            relateItem.display=true;
                                            _premText = compare.render.renderControl(relateItem, {
                                                planId: item.operPlanId,
                                                isProtect: false,
                                                unitText:protectItem.showUnit
                                            });
                                            unitText="";
                                        }
                                        var combinId=protectType[key][protectItem.name][item.operPlanId].combine||"";
                                        protectType[key][protectItem.name][item.operPlanId].item = protectItem;
                                        protectType[key][protectItem.name][item.operPlanId].combine=(combinId?combinId+",":"")+protectItem.protectItemId;
                                        protectType[key][protectItem.name][item.operPlanId].text = _text + (_premText ? (_premText + unitText) : "");
                                    }
                                }
                            }

                        });
                    }
                });

                var otherInfoKey = "其他信息",
                    infoStr = ""; //记录其他信息显示明细
                protectType[otherInfoKey] = {};
                $.each(restrictRules, function(index, item) { //渲染其他信息
                    for (var key in item) {
                        if (key === "insureAreaList") { //投保区域
                            $.each(item[key], function(index, item) {

                                    infoStr += item.provinceName;
                                    if (item.cityName) {
                                        infoStr += "-" + item.cityName;
                                    }
                                    if (item.areaName) {
                                        infoStr += "-" + item.areaName;
                                    }
                                    infoStr += "，";
                            });
                            infoStr=infoStr.replace(/，$/,"");
                            var _tempStr='<div class="inline-block insure-area" planId="'+item.operPlanId+'">'+infoStr+'</div>';
                            if(infoStr.length>15){
                                infoStr=_tempStr+'<a href="javascript:;" showMore="'+item.operPlanId+'" class="inline-block primary-link">查看全部</a>';
                            }else{
                                infoStr=_tempStr;
                            }
                        } else if (key === "impressionList") { //买家印象
                            $.each(item[key], function(index, item) {
                                infoStr += item.title + ",";
                            });
                        } else if (key === "salePromotionList") { //营销活动
                            $.each(item[key], function(index, item) {
                                infoStr += item.activityName + ",";
                            });
                        } else if(key === "labelList"){
                            $.each(item[key], function(index, item) {
                                infoStr += "<p>"+item+"</p>";
                            });
                        }
                        if(infoStr){//去除尾部逗号
                            infoStr=infoStr.replace(/,$/,"");
                        }
                        if(key==="periodHesitation"){
                            if(item[key]){
                                item[key]=item[key]+"天";
                            }
                        }
                        if (item[key] instanceof Array && !item[key].length) { //跳过空内容

                        } else if (otherInfoObj[key]) {
                            if (!protectType[otherInfoKey][key]) {
                                protectType[otherInfoKey][key] = otherInfoObj[key];
                                protectType[otherInfoKey][key][item.operPlanId]={};
                                protectType[otherInfoKey][key][item.operPlanId].text = infoStr || item[key];
                            } else {
                                if(!protectType[otherInfoKey][key][item.operPlanId]){
                                    protectType[otherInfoKey][key][item.operPlanId]={};
                                }
                                protectType[otherInfoKey][key][item.operPlanId].text = infoStr || item[key];
                            }
                        }
                        infoStr = "";
                    }
                });


                var typeIndex = 0,
                    protectItemListHtml = "",
                    protectItem = {},
                    genItem = {};
                for (var key in protectType) { //遍历健值并渲染显示
                    protectItemListHtml = "";
                    var dhtml = _.template(protectItemHtml)({
                        datas: {
                            index: typeIndex,
                            list: restrictRules,
                            title: key
                        }
                    });
                    $("#planscontent").append(dhtml);
                    for (var pkey in protectType[key]) {
                        protectItemListHtml = protectItemListHtml + "<tr><td class='tar'>" + protectType[key][pkey].name + "</td>";
                        for (var i = 0; i < COLS; i++) {
                            var item = restrictRules[i];
                            if (item) {
                                protectItem = protectType[key][pkey][item.operPlanId];
                                if (protectItem&&protectItem.text) {//判断是否是关联保障项
                                    var _protectItem=protectItem.item,
                                        _combineText="",
                                        _unitText=compare.utils.getUnit(protectItem.unit)||"";
                                        if(protectItem.combine&&protectItem.combine.toString().indexOf(",")>-1){//是否有合并保障项
                                            var parry=protectItem.text.split("<protectItem/>");
                                            _combineText= "<td>";
                                            var protectList=protectItem.combine.split(",");
                                            $(parry).each(function(i,dItem){
                                                _combineText+="<div class='mr10' planId='"+item.operPlanId+"' protectitemid='"+protectList[i]+"'>"+dItem+"</div>";
                                            });
                                            _combineText+="</td>";
                                            protectItemListHtml=protectItemListHtml+_combineText;
                                        }else {
                                            protectItemListHtml = protectItemListHtml + "<td><div  planId='" + item.operPlanId + "' protectitemid='" + (_protectItem ? _protectItem.protectItemId : "") + "' class='mr10'>" + protectItem.text + ((_protectItem && _protectItem.unit) ? _unitText : "") + "</div></td>";
                                        }

                                } else {
                                    if (protectItem&&protectItem.item&&protectItem.item.relateCoverageId) {//关联保额的保障项
                                        genItem = compare.utils.getRelateCoverageItem(protectItem.item.relateCoverageId);
                                        genItem.display=true;
                                        protectItemListHtml = protectItemListHtml + "<td  planId='" + item.operPlanId + "' itemtype='protect'>" + compare.render.renderControl(genItem, {
                                            planId: item.operPlanId,
                                            isProtect: false,
                                            unitText:protectItem.item.showUnit
                                        }) + "</td>";

                                    } else {
                                        protectItemListHtml = protectItemListHtml + "<td>-</td>";
                                    }
                                }
                            } else {
                                protectItemListHtml = protectItemListHtml + "<td></td>";
                            }
                        }
                        protectItemListHtml = protectItemListHtml + "</tr>";
                    }
                    $("#protectType" + typeIndex).html(protectItemListHtml);
                    typeIndex++;
                }
            },
            showErrMsg: function(el, msg) { //显示错误信息
                $(el).next(".write-info-error").remove();
                $(el).after('<div class="hz-alert hz-alert-error  mt10 write-info-error">' + msg + '</div>');
            },
            hideErrMsg: function() { //隐藏错误信息
                $(".hz-alert").remove();
            }
        },
        utils: {
            getUnit: function(number) { //转换相应的单位，后台返回的单位是数字
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
                    11: '元/年',
                    12: '个',
                    13: '周岁',
                    14: '岁'
                }[number];
            },
            maxProperty: function(rulesArray) {//试算添加属性映射
                var keyList = {},
                    key;
                $.each(rulesArray, function(index, item) {
                    key =item.name;
                    if(item.display) {
                        if (!keyList[key]) {
                            keyList[key] = {
                                name: item.name
                            };
                        }
                    }
                });
                return keyList;
            },
            getRelateCoverageItem: function(id) {//获取关联保额
                var result = {};
                $.each(restrictRules, function(index, item) {
                    $.each(item.restrictRuleOperList[0].restrictGenes, function(index, genitem) {
                        if (genitem.protectItemId === ~~id) {
                            result = genitem;
                        }
                    });
                });
                return result;
            },
            getPlanInfoById: function(id) { //获取相应计划信息
                var result = {};
                $.each(restrictRules, function(index, item) {
                    if (item.operPlanId === ~~id) {
                        result.planId = item.operPlanId;
                        result.productId = item.operProductId;
                        result.baseProductId = item.productId;
                        result.basePlanId = item.planId;
                        result.platform = 1;
                        result.channel = 1;
                    }
                });
                return result;
            }
        },
        actions: {
            postData: function(el, callback) { //组装试算信息 ,optValue：当前值，lastValue：上次请求值
                var planId = $(el).attr("planId"),
                    rulesData = compare.utils.getPlanInfoById(planId),
                    genItemList = [],
                    protectIdMap={},
                    genList = $("*[planId='" + planId + "'][isProtect=false]"), //获取试算因子
                    objkey = {
                        protectItemId: $(el).attr("protectItemId"),
                        key: $(el).attr("key"),
                        value: $(el).attr("selectValue") || $(el).html() ||$(el).val()
                    };

                $.each(genList, function(index, item) {
                    var $item = $(item),
                        itemKey=$item.attr("key"),
                        protectId=$item.attr("protectItemId");

                    var setMapKey=function(keyValue){
                        if(keyValue){
                            if(protectIdMap[keyValue]){
                                return true;
                            }else{
                                protectIdMap[keyValue]=true;
                            }
                        }
                    };
                    if(setMapKey(itemKey)||setMapKey(protectId)){
                        return;
                    }

                    if (itemKey === objkey.key && protectId === objkey.protectItemId) {
                        $item.attr("lastValue", $item.attr("optValue"));
                        $item.attr("optValue", objkey.value);
                        rulesData.optGeneOldValue = {
                            "protectItemId": objkey.protectItemId,
                            "key": objkey.key,
                            "value": $item.attr("lastValue")
                        };
                    }
                    genItemList.push({
                        protectItemId: protectId,
                        key: itemKey,
                        value: $item.attr("selectValue") || $item.attr("optValue") || $item.val()||$item.html()
                    });
                });
                rulesData.genes = genItemList;
                if (callback) {
                    callback(rulesData);
                    return;
                }
               compare.actions.postChange(rulesData,function(errObj){//错误回调
                   if(errObj&&errObj.noticeMsg&&el[0]&&el[0].tagName==="INPUT"){
                       el.val("");
                   }
                   if(errObj.notice) {
                       var errEl = $("#genbodys *[planId='" + planId + "'][protectItemId='" + errObj.notice + "'],#genbodys *[planId='" + planId + "'][key='" + errObj.notice + "']");
                       errEl.attr("lastValue", errEl.attr("defaultvalue"));
                       errEl.val("");
                       errEl.html("");
                       errEl.attr("selectValue", "");
                       setTimeout(function () {
                           compare.actions.postData(errEl);
                       }, 2000);
                   }
               });
            },
            postChange: function(rulesData,errCallBack) { //提交试算
                messager.show("正在计算中...");
                helper.request.postData2({
                    url: "/api/products/" + rulesData.productId + "/restrict-rule",
                    data: rulesData
                }, function(data) {
                    var restrictGenes = data.result.restrictGenes || [],
                        protectList=data.result.protectTrialItemList || [],
                        trialPrice = data.result.trialPrice;
                    messager.hide();
                    if(data.result.noticeMsg){
                        layer.msg(data.result.noticeMsg);
                        errCallBack(data.result);
                    }
                    $.each(restrictRules, function(index, item) {
                        if (item.operPlanId === rulesData.planId) {
                            item.restrictRuleOperList[0].trialPrice = trialPrice;
                            item.optGeneOldValue = rulesData.optGeneOldValue;
                            item.restrictRuleOperList[0].preminum = data.result.preminum;
                        }
                    });
                    $.each(restrictGenes, function(index, item) {//重新渲染试算因子
                        if (item.key === "area") {
                            $("*[planId='" + rulesData.planId + "'][control='areaType']").parent().html(compare.render.renderControl(item, {
                                planId: rulesData.planId,
                                isProtect: false
                            }));
                        } else {
                            var _$continer;
                            if(item.key) {
                                _$continer = $("*[planId='" + rulesData.planId + "'][key='" + item.key + "'][isProtect=false]").parent();
                            }else{
                                _$continer = $("*[planId='" + rulesData.planId + "'][protectitemid='" + item.protectItemId + "'][isProtect=false]").parent();
                            }

                            if(item.display) {
                                _$continer.html(compare.render.renderControl(item, {
                                    planId: rulesData.planId,
                                    isProtect: false
                                }));
                            }else{
                                _$continer.html("-")
                            }

                        }

                    });
                    $.each(protectList,function(index,item){
                            var _$continer;
                                _$continer = $("*[planId='" + rulesData.planId + "'][protectitemid='" + item.protectItemId + "']");
                            if(item.display) {
                                if(item.relateCoverageId){
                                    $.each(restrictGenes,function(i){
                                        if(this.protectItemId===~~item.relateCoverageId){
                                            item=this;
                                            item.display=true;
                                        }
                                    })
                                }
                                _$continer.html(compare.render.renderControl(item, {
                                    planId: rulesData.planId,
                                    isProtect: false
                                }));
                                if(typeof(item.controlType)==="undefined"){//渲染保障项
                                    _$continer.html(item.fullPremium+item.showUnit);
                                }
                            }else{
                                _$continer.html("-");
                            }

                    });
                    compare.actions.initInputAction();
                    compare.actions.initWDate();
                    $(".planHeader[planId='" + rulesData.planId + "']").html("¥"+(trialPrice.isInsure ? (trialPrice.vipPrice / 100).toFixed(2) : notSupportInsure)); //改变保费
                });
            },


            initAction: function() { //添加下拉框事件
                $("#planscontent")
                    .on("click",".hz-dropdown-content li", function() { //下拉框点击试算
                        var _this = this,
                            _parent = $(_this).parent();
                        compare.actions.postData(_this);
                        _parent.parent().hide();
                        $(".showdropdown span").html($(_this).html());
                        $(".showdropdown").removeClass("showdropdown");
                    })
                    .on("click",".input-select",  function(event) { //显示下拉框
                        var _parent=$(this).parent(),
                            _planId=_parent.attr("planId"),
                             _protectId=_parent.attr("protectitemid");
                        if(_parent.hasClass("disabled")){
                            return;
                        }
                        $(".hz-dropdown-content").hide();
                        $(".showdropdown").removeClass("showdropdown");
                        $(this).next().show();
                        $(this).addClass("showdropdown");
                        if(_protectId) {
                            $("*[planid='" + _planId + "'][protectitemid='" + _protectId + "']").addClass("showdropdown");
                        }
                        event.stopPropagation();
                })
                    .on("mouseover",".input-select",function(){
                        $(this).addClass("input-select-highlight");
                    })
                    .on("mouseout",".input-select",function(){
                        $(this).removeClass("input-select-highlight");
                    })



                $("a[showmore]").bind("click",function(){
                    var _planId=$(this).attr("showmore");
                    $(".insure-area[planId='"+_planId+"']").toggleClass("insure-area-open");
                    $(this).html()==="查看全部"?$(this).html("点击收起"):$(this).html("查看全部");
                });
                this.initWDate();
                $("body").bind("click", function() { //点击空白处隐藏下拉
                    $(".hz-dropdown-content").hide();

                });
                $("a[addToShop]").bind("click", function() {
                    var planId = $(this).attr("planId"),
                        shopList = [],
                        shopCarData = {};
                    compare.actions.postData(this, function(data) {
                        shopCarData.restrictRule = {
                            platform: "1",
                            channel: 1
                        };
                        shopCarData.genes=data.genes;
                        shopCarData.productId = data.productId;
                        shopCarData.planId = data.planId;
                        shopCarData.totalNum = 1;
                        shopCarData.inShoppingCart = true;
                        shopList.push(shopCarData);
                        compare.actions.addToShopCar(shopList);
                    });
                });
                $(".toggle-head a .iconfont").click(function(){
                    $(this).closest("thead").siblings("tbody").toggle();
                    $(this).parent().toggleClass("hide-detail");
                    if($(this).parent().hasClass("hide-detail")) {
                        $(this).html("&#xe711;"); //图标
                    }else{
                        $(this).html("&#xe712;"); //图标
                    }
                });
            },
            addToShopCar: function(insureListCreate) {//加入购物车
                helper.request.postData2({
                    url: "/api/insurance-slips",
                    data: insureListCreate
                }, function(result) {
                    var data = result.result;
                    if (!data) {
                        layer.msg(result.message || "添加购物车失败");
                        return;
                    }
                    helper.state.checkLogin(function(result) {
                        if (result.result) {
                            layer.msg("加入购物车成功");
                            $("#carItemCount").text(+($("#carItemCount").text() || 0) + 1);
                            $(".hz-header-cart-num").text(+($(".hz-header-cart-num").text() || 0) + 1);
                        } else {
                            var insureStr = helper.cookie.getCookie("InsureNums");
                            if (insureStr.split(",").length > 20) {
                                layer.msg("最多只能添加20个产品");
                                return;
                            }
                            $(data).each(function(intex, item) {
                                if (insureStr.indexOf(item.insureNum) === -1) {
                                    if (insureStr) {
                                        insureStr = insureStr + "," + item.insureNum;
                                    } else {
                                        insureStr = insureStr + item.insureNum;
                                    }
                                    helper.cookie.setCookie("InsureNums", insureStr, 1000 * 60 * 60 * 24,".huize.com");
                                }
                            });
                            layer.msg("加入购物车成功");
                            $("#carItemCount").text(+($("#carItemCount").text() || 0) + 1);
                            $(".hz-header-cart-num").text(+($(".hz-header-cart-num").text() || 0) + 1);
                        }
                    });
                });
            },
            initWDate:function(){//绑定日历控件时间
                $("#planscontent input.Wdate").each(function(index, item) { //日历选择

                    var dataInfo = JSON.parse($(item).attr("dict")),
                        maxYear = 0,
                        minYear = 0,
                        maxDate = 0,
                        minDate = 0;
                    if (compare.utils.getUnit(dataInfo.unit) === "岁" || compare.utils.getUnit(dataInfo.unit) === '周岁') {
                        maxYear = dataInfo.min;
                        minYear = dataInfo.max;
                    } else if (compare.utils.getUnit(unit) === '天') {
                        maxDate = dataInfo.min;
                        minDate = dataInfo.max;
                    }

                    //子约束条件 _this.info('子约束条件', list.subrestrict);
                    if (dataInfo.subrestrict && compare.utils.getUnit(dataInfo.subrestrict.unit) === '天') {
                        var subMax = dataInfo.subrestrict.max;
                        var subMin = dataInfo.subrestrict.min;

                        if (subMax) {
                            maxDate = subMax;
                        }
                        if (subMin) {
                            minDate = subMin;
                        }
                    }

                    var max = compare.createDate({
                        newDate: compare.getCurrentTime(new Date()),
                        year: -maxYear,
                        date: maxDate
                    });
                    var min = compare.createDate({
                        newDate: compare.getCurrentTime(new Date()),
                        year: -minYear - 1,
                        date: minDate
                    });
                    calendars[index] = new MyCalendar({
                        el: item,
                        maxDate: max,
                        minDate: min,
                        callback: function(val, obj) {
                            if (obj.type === 'date') {
                                compare.actions.postData(item);
                            }
                        }
                    });
                });
            },
            initInputAction: function() { //绑定文本输入框失去焦点事件
                $("#planscontent .input-text").die().live("blur", function() {
                    var _this = $(this),
                        inputValue = _this.val(),
                        _planId=_this.attr("planId"),
                        _protectId=_this.attr("protectitemid"),
                        dict = JSON.parse(_this.attr("dict"));
                    if (inputValue % dict.step !== 0) {
                        compare.render.showErrMsg(this, "请输入" + dict.step + "的倍数");
                        return;
                    } else if (inputValue < dict.min || inputValue > dict.max) {
                        compare.render.showErrMsg(this, "请输入范围" + dict.min + "到" + dict.max);
                        return;
                    } else {
                        if(_this.attr("protectitemid")){//更新关联保障项
                            $("*[planid='" + _planId + "'][protectitemid='" + _protectId + "']").val(inputValue);
                        }
                        compare.render.hideErrMsg();
                        compare.actions.postData(_this);
                    }
                    compare.render.hideErrMsg();
                });
            }

        }
    };
    Base.extend(compare, new Base());
    return compare;
});