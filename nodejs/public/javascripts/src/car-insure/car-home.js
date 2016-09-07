define(['jquery', 'helper'], function($, helper) {
	'use strict';
	/*
	 * @constructor carInsure
	 * @author CC-Huangys
	 * @version 0.0.1
	 * @description 车险封面
	 */
	var carHome = {
		init: function() {
			var _this = this;

            $('.js-view-price').on('click', function() {

                helper.state.checkLogin(function(result) {
                 if (result.result) {
                     ga('send', 'event', 'denglu', 'PChuoqubaojia', 'chexian', 1);
                     window.location.href = '/carinsure';
                 } else {
                     requirejs(["sign-float"], function (signFloat) {
                         var sign = new signFloat({returnUrl: location.href, showRegister: false,callback:function(data){//登录成功回调
                             ga('send', 'event', 'denglu', 'PChuoqubaojia', 'chexian', 1);
                             window.location.href = '/carinsure';
                         }});
                     });
                 }
                 });
            });


            var lipeiTpl = [
                '<div  style="padding:0 20px;line-height: 2;">',
                '<p style="font-size:16px;font-weight:bold;">您可以通过以下方式向慧择报案获取理赔协助</p>',
                '<p>1、电话报案：<strong style="color:#F00;font-weight:bold;">4006-366-366</strong></p>',
                '<p>2、邮件报案：出险情况通过邮件的形式发送至<strong style="color:#F00;font-weight:bold;">claim@huize.com</strong></p>',
                '<p>3、即时通讯工具报案：<a href="http://kefu.hzins.com/chat/chatting?referrer=http://www.huize.com/&title=%E8%BD%A6%E9%99%A9-%E6%B1%BD%E8%BD%A6%E4%BF%9D%E9%99%A9%E3%80%90%E4%BA%A7%E5%93%81%20%E8%B4%AD%E4%B9%B0%20%E6%AF%94%E8%BE%83%20%E6%8A%95%E4%BF%9D%20%E7%90%86%E8%B5%94%E3%80%91%20-%20%E6%85%A7%E6%8B%A9%E4%BF%9D%E9%99%A9%E7%BD%91&msrc=HZ&domain=hzins&businessType=Xm4FWr0dncw&mid=&language=zh" target="_blank" style="color:#09d">在线客服</a></p>',
                '<p>4、<a href="http://www.huize.com/claims/zaixianbaoan" target="_blank" style="color:#09d">在线报案</a></p>',
                '</div>'
            ].join('');

			$('#js-target-report').on('click', function() {
                layer.open({
                    type: 1,
                    title: '报案方式',
                    area: ['474px','219px'],

                    content: lipeiTpl
                })
            })
		}

	};
	return carHome;
});
