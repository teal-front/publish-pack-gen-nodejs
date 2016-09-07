define([
    'jquery'
], function(
    $
) {
    'use strict';
    /*
     * @constructor InsureContacts
     * @author
     * @version 0.0.1
     * @description 数据自动填充模块
     */
    var InsureFill = function() {

    };
    InsureFill.prototype = {
        fillData: function() {
            var _this = this,
                _insurants = _this.insurance.insuredPersonInfoList || [], //被保险人
                _insureType,
                _insurePanels,
                _benefiaryList, //受益人列表
                _firstBenefiary, //第一受益人
                _secondBenefiary, //第二受益人
                _dynamicModules = _this.insurance.dynamicModuleInfoList || [], //动态模块
                _genes = _this.insurance.genes,
                _insurantIndex = 0;
            if (!_this.insurance.aftertEdit && _insurants.length === 0) {
                return false;
            }
            _this.setKeyValue(_this.insurance.applicantPersonInfo, $("#module-10")); //初始化投保人信息
            _insureType = $("#module-20 *[data-insuranttype]:visible").attr("data-insuranttype"); //初始化被投保人信息

            if (_insurants[0] && _insurants[0].relationInsureInsurant) {
                var _relationType = _insurants[0].relationInsureInsurant,
                    _item;
                _relationType = _this.getTransfromRelations(~~_relationType, ~~_insurants[0].sex);
                _this.dropdownSelectItem($("#forrelationtype"), _relationType);
                if (_relationType === 1) { //如果是本人的话，则隐藏被投保人
                    _this.dropdownSelectItem($("#forrelationtype")[0], 1);
                    // if (_insurants[0] && _insurants[0].beneficiaryList) {
                    //     _benefiaryList = eval(_insurants[0].beneficiaryList);
                    //     var context = $("#module-20 > div")[0];
                    //     _this.fillBenefiaryList(_benefiaryList, context, $(context).data("index"));
                    // }
                }
            }

            if (_insureType === "more") { //多人投保
                _insurePanels = $("#addMoreBox > div > div:visible");
                $.each(_insurants, function(index, item) {
                    if (index < _insurePanels.length) {
                        _this.setKeyValue(item, $(_insurePanels[index]));
                    } else { //不止则增加被保险人
                        _this.addTable();
                        _insurePanels = $("#addMoreBox > div > div");
                        _this.setKeyValue(item, _insurePanels[index]);
                    }
                    _benefiaryList = eval(item.beneficiaryList);
                    _this.fillBenefiaryList(_benefiaryList, $(_insurePanels[index]), $(_insurePanels[index]).data("index"));
                });
            } else if (_insureType === "others" || _insureType === "myself") { //为他人投保

                _this.setKeyValue(_insurants[0] || {}, $("#module-20 *[data-insuranttype]:visible > div"));
                if (_insurants[0] && _insurants[0].beneficiaryList) {
                    _benefiaryList = eval(_insurants[0].beneficiaryList);
                    var context = $("#module-20 *[data-insuranttype]:visible")[0];
                    _this.fillBenefiaryList(_benefiaryList, context, $(context).data("index"));
                }
            } else if (_insureType === "team") {
                var _teams = [];
                $.each(_insurants, function(i) {
                    var _relationType = this.relationInsureInsurant,
                        _item;
                    _relationType = _this.getTransfromRelations(~~_relationType, ~~this.sex);
                    _teams.push({
                        birthdate: this.birthdate,
                        eName: this.eName,
                        idNumber: this.cardNumber,
                        idType: this.cardTypeId,
                        name: this.cName,
                        moblie: this.moblie,
                        sex: this.sex === "1" ? "男" : "女",
                        rType: _relationType
                    });
                });
                if (_teams.length) {
                    _this.deleteTeamItemActually(_this.teamBody.find('.list-table-row'));
                    _this.renderTeam({
                        result: {
                            type: _this.teamTemplateType,
                            teamPersonInfoList: _teams
                        }
                    }, true);
                    _this.teamNum += _teams.length;
                } else {
                    //添加默认的
                    //$('.add-link[type=team]').click();
                }
                _this.setCloseStatus();
            }
            $.each(_dynamicModules, function() { //初始化动态模块
                var $module = $("#module-" + this.moduleId);
                if (this.moduleId === 0) {
                    $module = _this.el;
                }
                _this.setKeyValue(this.data, $module);
            });
            if (_this.insurance.insuranceDateInfo && _this.insurance.insuranceDateInfo.insuranceDate) {
                $("*[name='insuranceDate'][data-moduleid]").val(_this.insurance.insuranceDateInfo.insuranceDate);
            }
            if (_this.insurance.agree) {
                _this.checkboxSelectItem($('#clauseInfo'));
            }

            var $insure = $('[data-moduleid=' + _this.MODULES_ID_INSURE_DATE + '][data-attributeid=' + _this.ATTR_ID_INSURE_DATE + ']'),
                insureStartDate = $insure.val(),
                isOk = _this.dateDifference(_this.startDate.minDate, insureStartDate) >= 0 && _this.dateDifference(insureStartDate, _this.startDate.maxDate) >= 0;
            if (isOk) { //验证日期是否在可选择的范围内
                _this.showInsurantDateLimit($insure);
                var options = {};
                options.newDate = $insure.val();
                _this.setInsuredDate(options);
            } else {
                $insure.val('');
                $('#insurantDate').html('');
            }
            $.each($('[data-moduleid=' + _this.MODULES_ID_INSURED + '][data-attributeid=' + _this.ATTR_ID_BIRTHDATE + ']'), function(i, item) {
                if ($(item).val()) {
                    $(item).trigger('blur');
                }
            });

            if (_this.insurance.idCardFileUrlList && _this.insurance.idCardFileUrlList.length > 0) { //回填证件号码
                var idCardFileUrlList = _this.insurance.idCardFileUrlList || [],
                    idCardFileIDList = _this.insurance.idCardFileIDList || [],
                    $idCardFileIDList = $("[name='idCardFileIDList']"),
                    $thumbPhoto = $("#thumbPhoto");
                if ($('#thumbPhoto img[defaultImg]').length) { //判断是否有默认图片,有的话清掉
                    $thumbPhoto.html("");
                }
                $.each(idCardFileUrlList, function(index, item) {
                    $thumbPhoto.append("<div class='fl pic-placeholder p5 bgfb mr10'><span class='iconfont delete-icon fb' title='删除' delId='" + idCardFileIDList[index] + "'>&#xe70a;</span><img src='" + item + "' width=\"150\" height=\"150\"/></div>");
                });
                $idCardFileIDList.val(idCardFileIDList.join(","));
                _this.setIDCardUploadStatus();
            }
        },
        fillBenefiaryList: function(beneficiaryList, context, index) { //
            var _this = this;
            if (beneficiaryList.length > 0) { //如果是指定受益人
                _this.dropdownSelectItem($(".beneficiarytype-select", context), 2);
                $.each(beneficiaryList, function() {
                    _this.refillBeneficiaryInfo(index, this);
                });
            }
        },
        setGenDefaultValue: function() { //设置试算默认值
            $.each(_genes, function(index) {
                switch (this.key) {
                    case "buyCount":
                        $("#module-20 [name='buyCount']").val(this.value); //被保险人购买份数
                        break;
                    case "vesterAge":
                        $("#module-10 [name='birthdate']").val(this.value); //投保人年龄
                        break;
                    case "sex":
                        $("#module-20 [name='sex']").val(this.value); //投保人性别
                        break;
                }
            });
        },
        setKeyValue: function(keyobj, $module) { //设置字段值
            var $keyItem,
                _this = this,
                raidoItem,
                checkboxItem,
                _keyValue;
            for (var key in keyobj) {
                if (key === "cardTypeName") { //兼容证件证类型
                    keyobj[key] = keyobj["cardTypeId"];
                }
                _keyValue = keyobj[key];
                if (_keyValue) {
                    $keyItem = $("*[name='" + key + "'][data-moduleid]", $module);
                    if (key === "jobId") { //职业
                        $keyItem = $("*[name='jobText'][data-moduleid]", $module);
                    }
                    if ($keyItem.attr("isdropdown") === "true" || $keyItem.hasClass("hz-dropdown")) { //下拉框
                        if ($keyItem.hasClass("select-area")) { //如果是地区控件
                            _this.dynamicSettingArea($keyItem[0], _keyValue);
                        } else if ($keyItem.hasClass("job-level")) {
                            _this.dynamicSettingJob($keyItem[0], _keyValue);
                        } else {
                            if (key === "relationInsureInsurant") {
                                var _relationType = keyobj.relationInsureInsurant,
                                    _item;
                                _relationType = _this.getTransfromRelations(~~_relationType, ~~keyobj.sex);
                                _keyValue = _relationType;
                            }
                            _this.dropdownSelectItem($keyItem, _keyValue);
                        }
                    } else if ($keyItem.attr("type") === "text" || $keyItem.attr("type") === "password") { //文本框
                        // if ($keyItem.hasClass('Wdate')) { //日期
                        //     $keyItem.attr('value', _keyValue);
                        // }

                        if (key === "cardPeriod") { //证件有效期
                            var $validityTime = $module.find('[name=validityTime] '),
                                cardPeriod = _keyValue.split('|');
                            if (cardPeriod.length > 1) {
                                $validityTime.attr("checked", false);
                                $validityTime.parents('.hz-check-item').removeClass('hz-check-item-checked');
                                _keyValue = cardPeriod[0];
                            } else {
                                _this.checkboxSelectItem($validityTime.parents('.hz-check-item'));
                            }
                        }
                        $keyItem.val(_keyValue);
                        if ($keyItem.attr("type") === "password") { //密码回填
                            $('[name=reconfim-password]').val(_keyValue);
                        }
                        if (key === 'cName') {
                            var moduleid = $keyItem.data('moduleid'),
                                attributeid = $keyItem.data('attributeid');
                            if (moduleid === _this.MODULES_ID_INSURE && attributeid === _this.ATTR_ID_NAME) {
                                _this.insurerName($keyItem);
                            }
                        }
                        $keyItem.trigger('blur');
                    } else if (key === "tripDestination") { //出现目的地
                        $keyItem.val(_keyValue);
                        var _contryies = _keyValue.split("、"),
                            _tripHtml = '<ul class="country-select-box">';
                        $.each(_contryies, function(i) {
                            _tripHtml += '<li>' + _contryies[i] + '<span class="del-country" title="点击删除" data-country="48" data-value="48" data-index="2" data-sort="2"></span></li>'
                        });
                        _tripHtml += "</ul>";
                        $("#selectCountries").html(_tripHtml);
                    } else if (key === "flightToCity") { //航班目的地
                        _this.fillAirProtsInfo('To', _keyValue, keyobj['toAirportCode']);
                    } else if (key === "flightFromCity") { //航班出发城市
                        _this.fillAirProtsInfo('From', _keyValue, keyobj['fromAirportCode']);
                    }
                }
            }
            $(".hz-radio-item", $module).each(function() { //单选按钮
                raidoItem = $(this);
                if (keyobj.hasOwnProperty(raidoItem.attr("name").split("-")[0])) {
                    if (~~raidoItem.attr('value') === ~~keyobj[raidoItem.attr("name").split("-")[0]]) {
                        raidoItem.click();
                        raidoItem.attr("checked", "checked");
                    }
                }
            });
            $(":checkbox", $module).each(function() { //单选按钮
                checkboxItem = $(this);
                var checkboxName = checkboxItem.attr("name").split("-")[0];
                _keyValue = keyobj[checkboxName];
                if (checkboxName !== "validityTime") {
                    if (keyobj.hasOwnProperty(checkboxName)) {
                        if (_keyValue && _keyValue !== 'false') {
                            _this.checkboxSelectItem(checkboxItem.parents('.hz-check-item'));
                            //checkboxItem.parents('.hz-check-item').addClass('hz-check-item-checked');
                        } else {
                            checkboxItem.attr("checked", false);
                            checkboxItem.parents('.hz-check-item').removeClass('hz-check-item-checked');
                        }
                    }
                }
            });
            if ($module.length && $module.find('.id-card-input').val()) {
                $module.find('.id-card-input').trigger('blur');
            }
        },
        setGenValue: function() { //设置试算默认值
            var _genes = _this.insurance.genes;


        },
    };

    return InsureFill;
});