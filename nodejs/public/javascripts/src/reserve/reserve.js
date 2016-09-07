define(['jquery', 'helper', 'fixed-tool-float', 'layer'], function($, helper, toolFloat, layer) {
	'use strict';
	/*
	 * @constructor reserver
	 * @author CC-Cai
	 * @version 0.0.1
	 * @description 预约相关
	 */
	var reserve = {
		toolFloat: {},
		oppName: '',
		planId: 0,
		notifyAnswerId: 0,
		insureNum: '',
		init: function() {
			var _this = this;
			_this.oppName = helper.url.getUrlVar('oppName') || '预约频道商机';
			_this.planId = helper.url.getUrlVar('planId') || helper.url.getUrlVar('planid') || 0;
			_this.notifyAnswerId = helper.url.getUrlVar('notifyAnswerId') || 0;
			_this.insureNum = helper.url.getUrlVar('insureNum') || 0;
			_this.getYuyueCount(false);
			_this.toolFloat = new toolFloat();
			$('.hz-dropdown').dropDown({
				type: 1,
				time: 50,
				event: function(ev) {
					if ($(ev.target).hasClass('iconfont') || $(ev.target).hasClass('more-tag')) {
						return false;
					} else {
						return true;
					}
				},
				select: function(ev) {
					return _this.dropdownSelect(this, ev);
				}
			});
			$('.booking-tab li').click(function() {
				$(this).addClass('active').siblings('').removeClass('active');
				var index = $(this).index();
				$('.booking-tab-con li').eq(index).show().siblings('').hide();
			});
			$('.booking-input').bind('blur', function() {
				_this.validateItem(this);
			});
			$('#btnReserve').bind('click', function() {
				_this.submitData();
			});
		},
		dropdownSelect: function(dropDown, ev) {
			var _this = this,
				target = ev.target,
				$target = $(target),
				text = '',
				$dropdown = $target.parents('.hz-dropdown');

			if (!$target.hasClass('hz-select-option')) {
				return false;
			}
			text = $target.text();
			$dropdown.find('.input-select-text').html(text);
			$dropdown.find('.hz-select-option-selected').removeClass('hz-select-option-selected');
			$target.addClass('hz-select-option-selected');
			$("#errorMsg").text("");
			$dropdown.removeClass("input-text-error");
			return true;
		},
		validateItem: function(input) {
			var errorClass = 'input-text-error',
				_this = this,
				$input = $(input),
				val = $.trim($input.val()),
				status = true,
				errorText = '',
				$errorMsg = $('#errorMsg');
			if ($input.hasClass('hz-dropdown')) {
				if ($input.find('.hz-select-option-selected').length > 0) {
					status = true;
				} else {
					status = false;
					errorText = '请选择联系您的时间！';
				}
			} else {
				$input.val(val);
				if ($input.attr('id') === 'tel') {
					if (!val) {
						status = false;
						errorText = '请输入您的手机号码！';
					} else if (!helper.CheckMobile(val)) {
						status = false;
						errorText = '请输入正确的手机号！';
					} else {
						status = true;
					}
				} else {
					if (!val) {
						status = false;
						errorText = '请输入您姓名！';
					} else if (!_this.checkName(val)) {
						status = false;
						errorText = '您输入的姓名格式不正确,请输入正确的姓名！';
					} else {
						status = true;
					}
				}
			}
			if (status) {
				$input.removeClass('input-text-error');
				$errorMsg.html('');
			} else {
				$input.addClass('input-text-error');
				$errorMsg.html(errorText);
			}
			return status;
		},
		lodding: false,
		submitData: function() {
			if (!this.lodding) {
				var _this = this,
					$name = $('#name'),
					$tel = $('#tel'),
					$contact = $('#contact'),
					status = true;
				status = _this.validateItem($name[0]);
				if (status) {
					status = _this.validateItem($tel[0]);
				}
				if (status) {
					status = _this.validateItem($contact[0]);
				}
				if (!status) {
					return false;
				}
				var params = {
					userName: $name.val(),
					mobile: $tel.val(),
					source: 1,
					oppName: _this.oppName,
					planId: _this.planId,
					notifyAnswerId: _this.notifyAnswerId,
					insureNum: _this.insureNum,
					contactTime: $contact.find('.hz-select-option-selected').text(),
					url: document.referrer,
					yuyueType :2,
					yuyueChildType:4
				};
				_this.lodding = true;
				helper.request.getCrossJson({
					url: '//www.huize.com/yuyueactivity/AddYuyueByMobile',
					data: params,
				}, function(data) {
					if (data.IsSuccess) {
						layer.open({
							type: 1,
							skin: 'layui-layer-demo', //样式类名
							closeBtn: 1, //不显示关闭按钮
							shift: 2,
							title: false,
							area: ['230px'],
							btn: ['确认'],
							shadeClose: true, //开启遮罩关闭
							content: '<div class="pt45 pb45 tac">预约成功</div>',
							btn1: function() {
								layer.closeAll();
								window.location.href = window.location.href;
							}
						});
						$(".layui-layer-btn0").removeClass("layui-layer-btn0").addClass("layui-layer-btn1");
						_this.getYuyueCount(true);
						_this.clearData();
					} else {
						layer.open({
							type: 1,
							skin: 'layui-layer-demo', //样式类名
							closeBtn: 1, //不显示关闭按钮
							shift: 2,
							title: false,
							area: ['230px'],
							btn: ['确认'],
							shadeClose: true, //开启遮罩关闭
							content: '<div class="pt45 pb45 tac">预约失败</div>',
							btn1: function() {
								layer.closeAll();
							}
						});
					}
					_this.lodding = false;
				});
				ga('send', 'event', 'maibaoxian', 'dignzhi', 'baoxianfanganyuyue', 1);
			} else {
				return false;
			}
		},
		getYuyueCount: function(isAdd) {
			var _this = this,
				params = {},
				dateTiem = new Date().valueOf();
			params = {
				isAdd: isAdd,
				dateTiem: dateTiem
			};
			helper.request.getCrossJson({
				url: '//lf.huize.com/PlanAppointment/AddPlanAppointment/',
				data: params,
			}, function(data) {
				$('#reserveCount').html(data);
			});
		},
		checkName: function(str) {
			return new RegExp("^[\\sA-Za-z_\\u4e00-\\u9fa5]{2,50}$").test(str);
		},
		clearData: function() {
			var $name = $('#name'),
				$tel = $('#tel'),
				$contact = $('#contact');
			$name.val('');
			$tel.val('');
			$contact.find('.input-select-text').html('联系时段');
			$contact.find('.hz-select-option-selected').removeClass('.hz-select-option-selected');
		},
	};
	return reserve;
});