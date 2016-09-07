define([
    "helper",
    "layer"
], function(
    helper,
    layer
) {
    'use strict';
    /*
     * @constructor InsureArea
     * @author
     * @version 0.0.1
     * @description 航延险
     */
    var InsureFight = function() {

    };
    var layerOpen,
        airportMap = []; //城市机场映射
    InsureFight.prototype = {
        eventInsureFight: function() {
            var _this = this,
                _html = "";
            $("#insureBox")
                .on("click", ".flightSelect", function() {
                    var _self = this,
                        selectVal = $(_self).html();
                    helper.request.getJson({
                        url: "/api/tools/airports"
                    }, function(result) {
                        _html = _this.renderCityItemHtml(result.result, selectVal);
                        _this.showLayer(_html, $(_self).data("name"), _self);
                    });
                });
            $("body")
                .on("click", "#alphabetlist .alphabet-item ", function() {
                    $("#alphabetlist .alphabet-item").removeClass("current");
                    $(this).addClass("current");
                    $(".accept-country #cityListPanel").html(_this.renderCityActiveHtml(airportMap[$(this).data("index")]));
                });
        },
        showLayer: function(html, name, btn) {
            var _this = this;
            if (layerOpen) {
                return;
            }
            layerOpen = layer.open({
                skin: 'huize-layer huize-countries',
                type: 1,
                title: name,
                shift: 2,
                btn: ['取消', '确定'],
                area: _this.dialogBaseWidth * 1.5 + 'px',
                btn2: function(index) {
                    var _checkItem = $("#cityListPanel :radio:checked"),
                        _cityName = _checkItem.val(),
                        _alphabetIndex = $("#alphabetlist span.current").data("index"),
                        _cityIndex = _checkItem.data("index"),
                        _aircontext;
                    if (!_checkItem.length) {
                        layer.close(index);
                    }
                    $(btn).prev("input").val(_cityName);
                    $(btn).html(_cityName);
                    $("#alphabetlist span.current").data("index");
                    if (name === "航班出发城市") {
                        _aircontext = $("[name='fromAirport']");
                    } else {
                        _aircontext = $("[name='toAirport']");
                    }
                    _this.renderAirPorts(airportMap[_alphabetIndex].List[_cityIndex].airportInfos, _aircontext);
                    _this.validate(_aircontext);
                    layer.close(index);
                    layerOpen = null;
                },
                btn1: function(index) {
                    layer.close(index);
                    layerOpen = null;
                },
                shadeClose: true, //开启遮罩关闭
                content: '<div class="destination-wrap fight-city-wrap" id="">' + html + '</div>'
            });
        },
        renderAirPorts: function(airports, context, selectCode) {
            $(".hz-dropdown-menu", context).html("");
            $.each(airports, function(i) {
                if ((selectCode && selectCode === this.wordCode) || (!selectCode && i === 0)) {
                    $(".input-select-text", context).html(this.airportName);
                    $(context).data("value", this.airportName);
                    $(context).data("code", this.wordCode);
                }
                $(".hz-dropdown-menu", context).append('<li class="hz-select-option ' + (i === 0 ? "hz-select-option-selected" : "") + '" wordcode="' + this.wordCode + '" value="' + this.airportName + '" text="' + this.airportName + '">' + this.airportName + '</li>');
            });
        },
        renderCityItemHtml: function(datas, selectVal) { //组装显示HTML
            var _resultHtml = [],
                _this = this,
                _cityList = [], //城市列表
                _alphabet = []; //字母列表
            _resultHtml.push('<div class="accept-country clearfix">');
            _resultHtml.push('<div class="country-content">');
            _resultHtml.push('<dl class="country-alphabet clearfix" id="alphabetlist">');
            _resultHtml.push('<dd>');
            _alphabet = _this.getCityAlphabet(datas);
            $.each(_alphabet, function(i, item) {
                _resultHtml.push('<span class="alphabet-item fight ' + (i === 0 ? 'current' : '') + '" data-content="' + item + '" data-index="' + i + '">' + item + '</span>');
            });
            _resultHtml.push('</dd>');
            _resultHtml.push('</dl>');
            _resultHtml.push('<div class="country-box"><ul class="clearfix" id="cityListPanel">');;
            _cityList = airportMap[0];
            _resultHtml.push(_this.renderCityActiveHtml(_cityList, selectVal));
            _resultHtml.push('</ul></div></div></div>');
            return _resultHtml.join("");
        },
        renderCityActiveHtml: function(cityList, selectVal) {
            var _resultHtml = [];
            $.each(cityList.List, function(i) {
                var checked = this.itemValue === selectVal ? 'checked="checked"' : '';
                _resultHtml.push('<li class="country-item">');

                _resultHtml.push('<input class="" type="radio" name="city" id="city' + i + '" value="' + this.itemValue + '" data-index="' + i + '" ' + checked + '/>');
                _resultHtml.push('<label class="insure-label" for="city' + i + '" title="' + this.itemValue + '">' + this.itemValue + '</label></li>');
            });
            return _resultHtml.join("");
        },
        getCityAlphabet: function(cityList) { //获取城市首字母
            var _alphabet = [];
            $.each(cityList, function() {
                if (!this.isCityName) {
                    _alphabet.push(this.itemValue);
                    airportMap.push({
                        name: this.itemValue,
                        List: []
                    });
                } else {
                    airportMap[airportMap.length - 1].List.push(this);
                }
            });
            return _alphabet;
        },
        fillAirProtsInfo: function(type, city, code) {
            var _this = this;
            helper.request.getJson({
                url: "/api/tools/airports"
            }, function(data) {
                var airports = [];
                $.each(data.result, function(i,item) {
                    if (item.itemValue === city) {
                        airports = item.airportInfos;
                    }
                });
                var $cityInput = $('[name=flight' + type + 'City]');
                $cityInput.val(city);
                $cityInput.next('.flightSelect').html(city);
                var $airprot;
                if (type === 'From') {
                    $airprot = $('[name=fromAirport]');
                } else {
                    $airprot = $('[name=toAirport]');
                }
                _this.renderAirPorts(airports, $airprot, code);
            });
        },
    };
    return InsureFight;
});