(function($) {
	$(document).on('ready', function() {
		var timey = $('.timey');

		timey.timey({
			minHr: '06',
			minHrMin: '50',
			maxHr: '21',
			maxHrMin: '20'
		});
	});
})(jQuery);
