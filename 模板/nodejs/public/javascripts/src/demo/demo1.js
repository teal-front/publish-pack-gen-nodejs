define(['jquery'], function($) {
	$(function() {
		var $test = $('#test');
		var index = 0;
		setTimeout(function() {
			index++;
			$test.text(index);
		}, 100);
	});
});