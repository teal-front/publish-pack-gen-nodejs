define(['jquery', 'jq-slide', 'fixed-tool-float'], function ($, jqSlide, toolFloat) {
	'use strict';

	var subjectList = {
		toolFloat: {},
		init: function () {
			this.initData();
			this.initView();
		},
		initData: function () {
			this.toolFloat = new toolFloat();
		},
		initView: function () {
			$('.jq-slide').slide({
				width: '100%',
				height: 308,
				autoPlay: 5000,
				prevBtn: $('.pre-arrow'),
				nextBtn: $('.next-arrow'),
				callback: function(index, length) {
					 $('.slider-page .num').html('<span class="f36">'+index+'</span>/'+length);
				}
			});
		}
	};

	return subjectList;
});