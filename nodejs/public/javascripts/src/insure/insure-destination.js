define([
	'jquery'
], function(
	$
) {
	'use strict';
	/*
	 * @constructor InsureDestination
	 * @author 
	 * @version 0.0.1
	 * @description 出行目的地
	 */
	var InsureDestination = function() {

	};
	InsureDestination.prototype = {
		countryObj: {},
		countryMax: 5,
		countries: [],
		countriesObj: {},
		searchCountries: [],
		destinationEvent: function() {
			var _this = this;
			$('body')
				.delegate('#noAcceptCountry', 'click', function() { //显示不承保国家
					_this.noAcceptCountry();
				})
				.delegate('#destination', 'click', function() { //显示承保国家
					var attributeId = $(this).data('attributeid');
					_this.countryAttributeId = attributeId;
					_this.logRed(attributeId);
					_this.acceptCountry(attributeId);
				})
				.delegate('.clear-country', 'click', function(ev) { //清空选择的国家
					_this.clearCountrySelect(_this.countryAttributeId);
				})
				.delegate('.country-select-box li', 'mouseenter', function() { //显示删除选择的国家
					$(this).addClass('mouse-enter');
				})
				.delegate('.country-select-box li', 'mouseleave', function() { //隐藏删除选择的国家
					$(this).removeClass('mouse-enter');
				})
				.delegate('.search-country-input', 'keyup', function(ev) { //搜索国家，回车事件
					if (ev.which === 13) {
						_this.destinationSearch('', _this.countryAttributeId);
					}
				})
				.delegate('.search-country-btn', 'click', function() { //搜索国家
					_this.destinationSearch('', _this.countryAttributeId);
				})
				.delegate('.alphabet-item:not(.fight)', 'click', function() { //按字母过滤
					var content = $(this).data('content') || '';
					var $country = $('.country-content:visible').find('.country-item');
					_this.destinationType(3);
					$('.alphabet-item:visible').removeClass('current');
					$(this).addClass('current');
					if (content === '全部') {
						$country.show();
					} else {
						$country.hide();
						$country.each(function(i, item) {
							var item = $(this).data('item');
							if (content.indexOf(item) !== -1) {
								$(this).show();
							}
						});
					}
				})
				.delegate('.del-country', 'click', function() { //删除国家
					var $this = $(this);
					var $input = $this.parent().find('.insure-country');
					var sort = $this.data('sort');
					var id = $(this).data('value');
					var country = $(this).data('country');
					var index = $(this).data('index');
					$(this).parent().remove();
					delete _this.countryObj[_this.countryAttributeId][sort];
					_this.resetCounty(_this.countryAttributeId);
				})
				.delegate('.insure-country', 'change', function() { // 
					var value = $(this).val();
					var sort = $(this).data('sort');
					var isChecked = $(this).is(':checked');
					if ($(this).is(':radio')) {
						_this.countryObj[_this.countryAttributeId] = {};
						_this.setCountry(null, _this.countryAttributeId);
					} else {
						if (!isChecked) {
							delete _this.countryObj[_this.countryAttributeId][sort];
						} else {
							_this.setCountry(true, _this.countryAttributeId);
						}
					}
					_this.resetCounty(_this.countryAttributeId);
				})
				.delegate('.title-item', 'click', function() { //国家标签切换
					var type = $(this).data('type');
					var index = $(this).index();
					var countryType = _this.toInt($(this).data('country'));
					_this.countryType = countryType;
					_this.destinationType(1);
					//添加样式
					$('.accept-country .title-item').removeClass('active');
					$(this).addClass('active');
					//控制下面显、隐
					$('.accept-country .country-content').hide();
					$('.accept-country .country-content[data-type="' + type + '"]').show();

					$('.country-alphabet').eq(index).find('.alphabet-item').eq(0).click();
				});
		},
		destinationType: function(type) {
			if (type === 1) {
				$('.country-box').show();
				$('#searchCountryResult').hide();
			} else if (type === 2) {
				$('.country-box').hide();
				$('#searchCountryResult').show();
			} else if (type === 3) {
				$('.country-box').show();
				$('#searchCountryResult').hide().html('');
			}
		},
		destinationInt: function() { //初始化
			var _this = this;
			
			_this.jsonp(_this.getDestinationUrl, {
				time: _this.getTime(),
				baseProductId: _this.baseProductId, //1002
				productId: _this.productId,
				channel: _this.channel,
				platform: _this.platform
			}, function(data) {
				_this.destinationData = data.result || {};
				_this.destinationEvent();
				if (_this.destinationData.chooseOne) {
					_this.countryMax = 1;
				}
			});
		},
		destinationSearch: function(key, attributesId) {
			var _this = this,
				acceptCountry = {},
				key = key || $('#searchCountryInput').val() || '',
				html = [],
				size = 0;
			key = $.trim(key);
			if (!key) {
				return;
			}
			$('.alphabet-item').removeClass('current');
			_this.searchCountries = [];
			_this.countriesObj = {};
			$.extend(_this.countries, this.destinationData.acceptCountry);
			$.each(this.countries, function(i, item) {
				var destinationTypeId = item.destinationTypeId,
					destinationTypeName = item.destinationTypeName,
					countrys = item.countrys || [];
				$.each(countrys, function(c, item) {
					var cName = item.cName || '';
					var eName = item.eName || '';
					key = key.toLowerCase();
					cName = cName.toLowerCase();
					eName = eName.toLowerCase();
					if (cName.indexOf(key) !== -1 || eName.indexOf(key) !== -1) {
						_this.countriesObj[item.id] = {
							destinationTypeId: destinationTypeId,
							destinationTypeName: destinationTypeName,
							countrys: item
						};
					}
				});
			});
			html.push('<div class="country-box">');
			html.push('<div class="search-country-content">');
			html.push('<ul class="clearfix">');
			$.each(_this.countriesObj, function(a, cItem) {
				size++;
				var item = cItem.countrys;
				html.push(_this.reunderCountryItem(item));
			});
			html.push('</ul>');
			html.push('</div>');
			html.push('</div>');
			_this.destinationType(2);
			if (size > 0) {
				$('#searchCountryResult .country-box').show();
				$('#searchCountryResult').show().html(html.join(''));
				_this.resetCounty(_this.countryAttributeId);
			} else {
				html.push('<dl class="no-country clearfix">');
				html.push('<dt></dt>');
				html.push('<dd>');
				html.push('<p>对不起，没有找到"<i class="insure-color">' + key + '</i>"相关国家或地区</p>');
				html.push('<p>可能不属于该产品承保范围。</p>');
				html.push('</dd>');
				html.push('</dl>');
				$('#searchCountryResult').show().html(html.join(''));
				$('#searchCountryResult .country-box').hide();
			}
		},
		countryItemIndex: 0,
		reunderCountryItem: function(cItem) {
			var _this = this,
				html = [];
			var initial = cItem.initial;
			var countryId = cItem.id;
			var cName = cItem.cName;
			var eName = cItem.eName;
			var name = cName + '[' + eName + ']';
			var nameAll = name;
			var sort = cItem.sort;
			var countryIdName = 'country' + _this.countryItemIndex;
			_this.countryItemIndex++;
			html.push('<li class="country-item" data-item="' + initial + '" data-country="' + countryId + '">');
			if (_this.destinationData.chooseOne) {
				html.push('<input class="insure-country insure-radio" type="radio" data-index="' + _this.countryItemIndex + '" data-country="' + countryId + '" data-cname="' + cName + '" data-ename="' + eName + '" name="country" data-sort="' + sort + '" value="' + cItem.id + '" id="' + countryIdName + '" />');
			} else {
				html.push('<input class="insure-country insure-checkbox" type="checkbox" data-index="' + _this.countryItemIndex + '" data-country="' + countryId + '" data-cname="' + cName + '" data-ename="' + eName + '" name="country" data-sort="' + sort + '"  value="' + cItem.id + '" id="' + countryIdName + '" />');
			}
			html.push('<label for="' + countryIdName + '" class="insure-label" title="' + nameAll + '">' + name + '</label>');
			html.push('</li>');
			return html.join('');
		},
		clearCountrySelect: function(attributeId) { //清除选中
			var _this = this;
			_this.countryObj[attributeId] = {};
			$('#countryItem').html('');
			_this.resetCounty(attributeId);
			$('.destination-wrap').find('.insure-country').each(function() {
				$(this).removeAttr('checked');
			});
		},
		calcCountrySize: function(attributeId) { //计算多少
			var size = 0;
			if(this.countryObj[attributeId]){
			$.each(this.countryObj[attributeId], function() {
				size++;
			});}
			return size;
		},
		setCountry: function(change, attributeId) {
			var _this = this,
				size;
			if (!_this.countryObj[attributeId]) {
				_this.countryObj[attributeId] = {};
			}
			size = _this.calcCountrySize(attributeId);
			if (_this.countryMax === 5) {
				if (size >= _this.countryMax && change) {
					_this.message.show('您最多可以选择' + _this.countryMax + '个国家或地区！', 'warning',2000);
					return;
				}
			}
			$('#acceptCountry').find('.insure-country').each(function() {
				var id = $(this).val(),
					cName = $(this).data('cname'),
					eName = $(this).data('ename'),
					country = $(this).data('country'),
					sort = $(this).data('sort'),
					index = $(this).data('index');
				if ($(this).is(':checked') && _this.replaceNull(sort)) {
					_this.countryObj[attributeId][sort] = {
						index: index,
						sort: sort,
						value: id,
						cName: cName,
						eName: eName,
						country: country
					};
				}
			});
			this.setSelectCountryStatus();
		},
		resetCounty: function(attributeId) {
			var _this = this,
				itemHtml = [],
				valArr = [],
				require = _this.toInt($('.insure-form[data-attributeid="' + attributeId + '"]').data('required')) === 1,
				$tips = $('[data-attributeId="' + attributeId + '"]').nextAll('.insure-tips').eq(0); //错误提示

			itemHtml.push('<ul class="country-select-box">');
			_this.info('国家顺序', _this.countryObj[attributeId]);

			if(this.calcCountrySize(attributeId)){
			$.each(_this.countryObj[attributeId], function(i, item) {
				itemHtml.push('<li>' + item.cName + '[' + item.eName + ']' + '<span class="del-country" title="点击删除" data-country="' + item.country + '" data-value="' + item.value + '" data-index="' + item.index + '" data-sort="' + item.sort + '"></span></li>');
			});
			itemHtml.push('</ul>');
			$('#countryItem').html('').html(itemHtml.join(''));
			$('.destination-wrap').find('.insure-country').each(function() {
				$(this).attr('checked', false);
			});
			$.each(this.countryObj[attributeId], function(i, item) {
				$('#acceptCountry').find('.insure-country[value="' + item['value'] + '"]').attr('checked', true);
				valArr.push(item.cName);
			});
			}
			if (require && !this.calcCountrySize(attributeId)) {
				$tips.insertAfter('#noAcceptCountry').addClass('insure-tips-error').html(_this.TEXT_TRAVEL_DESTINATION).addClass('hz-alert-error');
			} else {
				$tips.removeClass('insure-tips-error').html('').removeClass('hz-alert-error');
			}
			this.setSelectCountryStatus();
			$('input[type="hidden"][data-attributeid="' + attributeId + '"]').val(valArr.join('、')); //给当前隐藏域赋值

		},
		acceptCountryHtml: function() { //承保国家HTML
			var _this = this,
				html = [],
				titleStyle = '',
				alphabet = ['全部', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZ'],
				destinationType = _this.destinationData.destinationType || [];
			if (destinationType.length) {
				html.push('<div class="search-country"><div><input type="text" class="search-country-input" id="searchCountryInput"/><span class="search-country-btn tac"><i class="iconfont fcw f22">&#xe700;</i></span></div></div>');
				html.push('<div class="accept-country clearfix" id="acceptCountry">');
				html.push('<ul class="hz-tab-menu hz-tab-style02 country-title clearfix">');
				$.each(destinationType, function(i, item) {
					if (i === 0) {
						titleStyle = 'active';
					} else {
						titleStyle = '';
					}
					html.push('<li class="hz-tab-menu-item  title-item ' + titleStyle + '" data-type="country' + item.id + '" data-country="' + item.id + '"><a href="javascript:;">' + item.name + '</a></li>');
				});
				html.push('</ul>');
				$.each(destinationType, function(i, item) {
					html.push('<div class="country-content"  data-type="country' + item.id + '">');
					html.push('<dl class="country-alphabet clearfix">');
					html.push('<dt class="pr20">拼音首字母：</dt>');
					html.push('<dd>');
					$.each(alphabet, function(i, item) {
						html.push('<span class="alphabet-item ' + (i === 0 ? 'current' : '') + '" data-content="' + item + '">' + item + '</span>');
					});
					html.push('</dd>');
					html.push('</dl>');
					html.push('<div class="max-country">温馨提示：您最多可选择' + _this.countryMax + '个国家或地区！</div>');
					html.push('<div class="country-box">');

					html.push('<ul class="clearfix">');
					$.each(_this.destinationData.acceptCountry, function(i, aItem) {
						if (item.id === aItem.destinationTypeId) {
							$.each(aItem.countrys, function(a, cItem) {
								html.push(_this.reunderCountryItem(cItem));
							});
						}
					});
					html.push('</ul>');

					html.push('</div>');
					html.push('</div>');
				});
				html.push('<div id="searchCountryResult"></div>');
				html.push('<dl class="country-select-area clearfix" id="countrySelect"><dt>我选择的是： <div class="clear-country">清空所选</div></dt><dd class="clearfix" id="countryItem"></dd></dl>');
				html.push('</div>');
			} else {
				html.push('<div class="no-accept-country-data">暂无数据</div>');
			}
			return html.join('');
		},
		setSelectCountryStatus: function() {
			if ($('#countryItem').find('li').length === 0) {
				$('#countrySelect').hide();
			} else {
				$('#countrySelect').show();
			}
		},
		countryTempObj: {},
		reunderCountry: function(obj, attributeId) {
			var _this = this,
				countries = obj || _this.countryObj[attributeId],
				itemHtml = [],
				$selectCountries = $('div.select-countries[data-attributeId="' + attributeId + '"]');
			$selectCountries.html('');
			itemHtml.push('<ul class="country-select-box">');
			$.each(countries, function(i, item) {
				itemHtml.push('<li>' + item.cName + '[' + item.eName + ']' + '<span class="del-country" title="点击删除" data-country="' + item.country + '" data-value="' + item.value + '" data-index="' + item.index + '" data-sort="' + item.sort + '"></span></li>');
			});
			itemHtml.push('</ul>');
			$selectCountries.html(itemHtml.join(''));
		},
		acceptCountry: function(attributeId) { //承保国家
			var _this = this;
			_this.countryTempObj[attributeId] = {};
			$.extend(_this.countryTempObj[attributeId], _this.countryObj[attributeId]);
			layer.open({
				skin: 'huize-layer huize-countries',
				type: 1,
				title: '选择目的地',
				//skin: false, //样式类名//closeBtn: false, //不显示关闭按钮
				shift: 2,
				btn: ['取消','确定'],
				area: [_this.dialogBaseWidth * 1.5 + 'px', _this.dialogBaseHeight * 1.2 + 'px'],
				btn2: function(index) {
					layer.close(index);
					_this.reunderCountry(null, attributeId);
				},
				btn1: function(index) {
					layer.close(index);
					_this.countryTempObj[attributeId] = {};
					_this.reunderCountry(_this.countryTempObj[attributeId], attributeId);
					_this.countryObj[attributeId] = {};
					_this.resetCounty(attributeId); //TODO
					$.extend(_this.countryObj[attributeId], _this.countryTempObj[attributeId]);
				},
				shadeClose: true, //开启遮罩关闭
				content: '<div class="destination-wrap" id="">' + _this.acceptCountryHtml(attributeId) + '</div>'
			});
			$('#acceptCountry').find('.title-item').eq(0).click();
			_this.setCountry(null, attributeId);
			this.resetCounty(attributeId);
			$('#searchCountryInput').placeholder({
				blankCharacter: false, //输入空格是否消失,默认消失
				text: '请输入关键字',
				left: 0,
				top: 0,
				wrapTagName: false, //默认为span,是否创建包裹它的父元素；可以是任何合法标签,div,p,a等,如果为false，则不创建
				width: 200,
				color: '#ccc'
			});
		},
		noAcceptCountryHtml: function() { //不承保国家HTML
			var _this = this,
				html = [],
				noAcceptCountry = _this.destinationData.noAcceptCountry || [];
			html.push('<div class="no-accept-country clearfix">');
			$.each(noAcceptCountry, function(i, item) {
				var continentName = item.continentName;
				var countrys = item.countrys || [];
				html.push('<dl>');
				html.push('<dt>' + continentName + '</dt>');
				html.push('<dd>');
				html.push('<ul class="clearfix">');
				$.each(countrys, function(c, cItem) {
					var name = cItem.cName + '[' + cItem.eName + ']';
					html.push('<li title="' + name + '">' + name + '</li>');
				});
				html.push('</ul>');
				html.push('</dd>');
				html.push('</dl>');
			});
			html.push('</div>');
			if (!noAcceptCountry.length) {
				html = [];
				html.push('<div class="no-accept-country-data">暂无数据</div>');
			}
			return html.join('');
		},
		noAcceptCountry: function() { //不承保国家
			var _this = this;
			layer.open({
				skin: 'huize-layer huize-countries',
				type: 1,
				title: '不承保国家或地区',
				//skin: false, //样式类名//closeBtn: false, //不显示关闭按钮
				shift: 2,
				btn: ['我知道了'],
				area: [_this.dialogBaseWidth * 1.5 + 'px', _this.dialogBaseHeight * 1.2 + 'px'],
				yes: function(index) {
					layer.close(index);
				},
				shadeClose: true, //开启遮罩关闭
				content: '<div class="destination-wrap" id="">' + _this.noAcceptCountryHtml() + '</div>'
			});
			$('.destination-wrap').css({
				border: 'none'
			});
		},
		validateDestination:function  () {   //校验出现目的地
			var _this =this,
			attributeId=_this.ATTR_ID_TRIPDESTINATION.toString();
			if($('.insure-form[data-attributeid='+attributeId+'][type=hidden]').val()){
				return  true;
			}
			_this.resetCounty(attributeId);
			if(_this.toInt($('.insure-form[data-attributeid="' + attributeId + '"]').data('required')) === 1&&!_this.calcCountrySize(attributeId)){
				return false;
			}
			else{
				return  true;
			}
		}

	};
	return InsureDestination;
});