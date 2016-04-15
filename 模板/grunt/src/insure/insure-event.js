define(['jquery', 'my-calendar'], function($, MyCalendar) {
	/*
	 * @constructor InsureEvent
	 * @author 
	 * @version 0.0.1
	 * @description Event
	 */
	var InsureEvent = function() {

	};
	InsureEvent.prototype = {
		event: function() {
			this.eventCalendar();
		},
		eventCalendar: function() { //日期

			this.el.find('.Wdate').each(function() {
				new MyCalendar({
					el: this,
					maxDate: function() {
						return '2016-06-06';
					},
					minDate: function() {
						return '2016-01-08';
					}
				});
			});
		}

	};
	return InsureEvent;
});