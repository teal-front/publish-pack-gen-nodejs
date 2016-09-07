define(function() {
	'use strict';
	/*
	 * @constructor InsureArea
	 * @author  Hz1405863 
	 * @version 0.0.1
	 * @description 地区相关处理
	 */
	var InsureArea = function() {

	};
	InsureArea.prototype = {
		initArea: function() {

		},
		/*
		 * ==================== 地区相关处理  start ====================
		 */
		getAllArea: function(warp, onCallback) { //获取居住省市，银行卡地区
			var _this = this,
				$warp = warp || _this.el,
				callback = onCallback || function() {};
			var $living = $warp.find('[select="province"][data-attributeid="' + _this.ATTR_ID_AREA_LIVING + '"]');
			var $receiver = $warp.find('[select="province"][data-attributeid="' + _this.ATTR_ID_AREA_RECEIVER + '"]'); //收件地址省市
			if ($living.length > 0 || $receiver.length > 0) {
				this.getAreaData({
					url: _this.getAllAreaUrl,
					baseProductId: _this.baseProductId,
					isDependInsureArea: 1,
					areaCode: '',
					callback: function(data) {
						_this.allAreaOptions = data;
						//居住省份 //var $card = $('[select="province"][data-attributeid="' + _this.ATTR_ID_AREA_CARD + '"]'); //银行卡  //var $account = $('[select="province"][data-attributeid="' + _this.ATTR_ID_AREA_ACCOUNT + '"]'); //银行卡
						$living.data('data', true); // $card.data('data', true); // $account.data('data', true);
						$receiver.data('data', true);
						$.each($living, function(i, item) {
							if ($(this).find('.hz-select-option').length <= 1) {
								_this.resetSelect($(this), data); // _this.resetSelect($card, data); // _this.resetSelect($account, data);
							}
						});
						$.each($receiver, function(i, item) {
							if ($(this).find('.hz-select-option').length <= 1) {
								_this.resetSelect($(this), data); //_this.resetSelect($living, data);
							}
						});
						callback.call(this);
					}
				});
			}
			var $card = $warp.find('[select="province"][data-attributeid="' + _this.ATTR_ID_AREA_CARD + '"]'); //银行卡
			var $account = $warp.find('[select="province"][data-attributeid="' + _this.ATTR_ID_AREA_ACCOUNT + '"]'); //银行卡

			if ($card.length > 0 || $account.length > 0) {
				this.getAreaData({
					url: _this.getAllAreaUrl,
					baseProductId: _this.baseProductId,
					isDependInsureArea: 0,
					areaCode: '',
					callback: function(data) {
						_this.allAreaOptions = data; //var $living = $('[select="province"][data-attributeid="' + _this.ATTR_ID_AREA_LIVING + '"]'); //居住省份
						$card.data('data', true); //$living.data('data', true);
						$account.data('data', true);
						$.each($card, function(i, item) {
							if ($(this).find('.hz-select-option').length <= 1) {
								_this.resetSelect($(this), data); //_this.resetSelect($living, data);
							}
						});
						$.each($account, function(i, item) {
							if ($(this).find('.hz-select-option').length <= 1) {
								_this.resetSelect($(this), data); //_this.resetSelect($living, data);
							}
						});
						callback.call(this);
					}
				});
			}
		},
		getFirstInsureArea: function(warp, onCallback) { //获取投保地区第一级
			var _this = this,
				$warp = warp || _this.el,
				callback = onCallback || function() {};
			var $insure = $warp.find('[select="province"][data-attributeid="' + _this.ATTR_ID_AREA_INSURE + '"]');
			if ($insure.length > 0) {
				this.getAreaData({
					url: _this.getInsureAreaUrl,
					baseProductId: _this.baseProductId,
					areaCode: '',
					callback: function(data) {
						_this.insureAreaOptions = data;
						$insure.data('data', true);
						$.each($insure, function(i, item) {
							if ($(this).find('.hz-select-option').length <= 1) {
								_this.resetSelect($(this), data); //_this.resetSelect($living, data);
							}
						});
						callback.call(this);
					}
				});
			}
		},
		getAreaData: function(options) { //获取地区数据
			var _this = this;
			var ops = options || {};
			var obj = {};
			for (var key in ops) {
				if (key !== 'url' && key !== 'callback') {
					obj[key] = ops[key];
				}
			}
			this.jsonp(ops.url, obj, function(data) {
				var options = [];
				var result = data.result || [];
				$.each(result, function(i, item) {
					options.push('<li class="hz-select-option " value="' + item.code + '" text="' + item.text + '">' + item.text + '</li>');
				});
				if (ops.callback) {
					ops.callback(options, data);
				}
			});
		},
		changeArea: function(input, warp, onCallback) { //地区切换变动 
			var _this = this,
				$this = $(input),
				$parent = $this.parents('td'),
				moduleid = _this.toInt($this.data('moduleid')),
				attributeid = _this.toInt($this.data('attributeid')),
				name = $this.attr('name'),
				isDependInsureArea = 0,
				$warp = warp || $this.parents('.credentials-form'),
				val = $this.val(),
				type = ($this.attr('select') || '').toLowerCase(),
				$city = $this.nextAll('[select="city"]'),
				$area = $this.nextAll('[select="area"]'),
				text = $this.find('.hz-select-option.hz-select-option-selected').attr('text'),
				$hiddenText = $this.nextAll('input.address-text'),
				url = '',
				areaText = '',
				callback = onCallback || function() {},
				$text = $this.next('.area-text'),
				$textAll = $this.nextAll('.area-text'),
				$areas = $warp.find('.insure-form[data-moduleid="' + moduleid + '"][data-attributeid="20"],.insure-form[data-moduleid="' + moduleid + '"][data-attributeid="22"],.insure-form[data-moduleid="' + moduleid + '"][data-attributeid="24"]');
			_this.resetSelect($city);
			_this.resetSelect($area);
			$city.removeClass('insure-error').hide();
			$area.removeClass('insure-error').hide();
			$hiddenText.val('');
			_this.areaText = '';
			if (attributeid === _this.ATTR_ID_AREA_LIVING|| attributeid === _this.ATTR_ID_AREA_RECEIVER) {
				isDependInsureArea = 1; //居住省市过滤
			}
			if (attributeid === _this.ATTR_ID_AREA_INSURE) { //投保地区 	
				url = _this.getInsureAreaUrl;
			} else if (attributeid === _this.ATTR_ID_AREA_PROPERTY) { //财产所在地
				url = _this.getPropertyAreaUrl;
			} else if (attributeid === _this.ATTR_ID_AREA_LIVING || attributeid === _this.ATTR_ID_AREA_CARD || attributeid === _this.ATTR_ID_AREA_ACCOUNT || attributeid === _this.ATTR_ID_AREA_RECEIVER) {
				url = _this.getAllAreaUrl;
				$parent.find('option:selected').each(function(i, item) {
					if ($(this).val()) {
						_this.areaText += $(this).attr('text');
					}
				});
				$areas.each(function(i) {
					var val = $.trim($(this).val());
					if (!val) {
						$(this).val(_this.areaText);
					} else {
						if (val === _this.defaultAreaText) {
							$(this).val(_this.areaText);
						}
					}
					_this.validate(this);
				});
				_this.defaultAreaText = _this.areaText;
			}
			$textAll.val('');
			$text.val(text);
			if (!val || val === '请选择') {
				return;
			}
			if (type === 'province') { //省
				_this.getAreaData({
					url: url,
					baseProductId: _this.baseProductId,
					areaCode: val,
					isDependInsureArea: isDependInsureArea,
					callback: function(data) {
						_this.resetSelect($city, data);
						$city.show().data('required', 1);
						callback.call($this);
					}
				});
			} else if (type === 'city') { //市
				_this.getAreaData({
					url: url,
					baseProductId: _this.baseProductId,
					areaCode: val,
					isDependInsureArea: isDependInsureArea,
					callback: function(data) {
						if (data.length) {
							_this.resetSelect($area, data);
							$area.show().data('required', 1);
							callback.call($this);
						} else {
							_this.resetSelect($area);
							$area.hide();
							callback.call($this, false);
						}
					}
				});
				areaText = '';
				$this.parent('td.insure-tab-content').find('select:visible').find('option:selected').each(function() {
					areaText += $(this).attr('text');
				});
				$hiddenText.val(areaText);

			} else if (type === 'area') { //区
				areaText = '';
				$this.parent('td.insure-tab-content').find('select:visible').find('option:selected').each(function() {
					areaText += $(this).attr('text');
				});
				$hiddenText.val(areaText);
			}
		},
		setAreaData: function() { //设置地区数据，动态添加时，设置初始值
			var _this = this;
			//财产地区
			var $propetyArea = $('select[data-attributeid="' + _this.ATTR_ID_AREA_PROPERTY + '"][select="province"]');
			//投保地区
			var $insureArea = $('select[data-attributeid="' + _this.ATTR_ID_AREA_INSURE + '"][select="province"]');
			//职业
			var $job = $('select[data-attributeid="' + _this.ATTR_ID_JOB + '"][job="1"]');
			//居住省份
			var $livingArea = $('select[data-attributeid="' + _this.ATTR_ID_AREA_LIVING + '"][select="province"]');
			$propetyArea.each(function(i, item) {
				var $this = $(this);
				if ($this.find('option').length <= 1) {
					_this.resetSelect($this, _this.allAreaOptions);
				}
			});
			$livingArea.each(function(i, item) {
				var $this = $(this);
				if ($this.find('option').length <= 1) {
					_this.resetSelect($this, _this.allAreaOptions);
				}
			});
			$insureArea.each(function(i, item) {
				var $this = $(this);
				if ($this.find('option').length <= 1) {
					_this.resetSelect($this, _this.insureAreaOptions);
				}
			});

			$job.each(function(i, item) {
				var $this = $(this);

				if ($this.find('option').length <= 1) {
					_this.resetSelect($this, _this.jobDataOptions);
				}

			});
		},
		dynamicSettingArea: function(input, provCityId) { //动态设置地区-常用投保人
			var _this = this,
				$provice = $(input),
				$city = $(input).nextAll('.hz-dropdown').eq(0),
				$area = $(input).nextAll('.hz-dropdown').eq(1),
				$parent = $provice.parents('.credentials-form'),
				attributeid = $provice.data('attributeid'),
				_provCityId = provCityId || '',
				provCityIdArr = _provCityId.split('-');
			if (!provCityIdArr.length || !$provice.length) {
				return;
			}
			$provice.val('');
			$city.val('').hide();
			$area.val('').hide();
			if ($provice.find('.hz-select-option').length <= 1) { //如果没有一级没有加载完成，则延迟执行
				if (attributeid === _this.ATTR_ID_AREA_INSURE) {
					_this.getFirstInsureArea($parent, function() {
						_this.dynamicSettingArea(input, provCityId);
					});
				} else {
					_this.getAllArea($parent, function() {
						_this.dynamicSettingArea(input, provCityId);
					});
				}
				return;
			}

			if (!$provice.find('.hz-select-option[value="' + provCityIdArr[0] + '"]').length) {
				return;
			}
			_this.setDropdownSelectValue($provice, provCityIdArr[0]);
			// $provice.val(provCityIdArr[0]);
			_this.changeArea($provice.get(0), $parent, function() {
				if (!$city.find('.hz-select-option[value="' + provCityIdArr[1] + '"]').length) {
					return;
				}
				_this.setDropdownSelectValue($city, provCityIdArr[1]);
				//$city.val(provCityIdArr[1]);
				if (provCityIdArr <= 2) {
					$area.hide();
					return;
				}
				_this.changeArea($city.get(0), $parent, function() {
					if (!$area.find('.hz-select-option[value="' + provCityIdArr[2] + '"]').length) {
						return;
					}
					_this.setDropdownSelectValue($area, provCityIdArr[2]);
					_this.changeArea($area.get(0));
					//$area.val(provCityIdArr[2]);
					$area.change();
				});
			});
		},
	};
	return InsureArea;
});