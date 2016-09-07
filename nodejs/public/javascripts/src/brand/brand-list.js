define(['jquery', 'fixed-tool-float'], function ($, toolFloat) {
	'use strict';

	var brandList = {
		toolFloat: {},
		init: function () {
			this.initData();
			this.initEvents();
		},
		initData: function () {
			this.toolFloat = new toolFloat();
		},
		initEvents: function () {
			$('#btnShowAll').click(function () {
				$('.word-link').removeClass('selected');
				$(this).addClass('selected');
				$('.brand-item').show();
			});

            $('.brand-item').hover(
                function() {
                    $(this).addClass('brand-item-hover')
                },
                function() {
                    $(this).removeClass('brand-item-hover')
                }
            );


			$('.search-bar').delegate('a', 'click', function () {
				$('#btnShowAll').removeClass('selected');
				$('.word-link').removeClass('selected');
				$(this).addClass('selected');
				var char = $(this).text();
				$('.brand-item').each(function (index, value) {
					var companyChar = $(this).find('input[type=hidden]').val();
					if (char === companyChar) {
						$(this).show();
					} else {
						$(this).hide();
					}
				});
			});
		}
	};

	return brandList;
});