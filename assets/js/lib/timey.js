;(function() {
	'use strict';

	var version = '0.2.0',
		name = 'Timey';

	$.fn.timey = function(settings, params) {
		var results = [],
			ins;

		for(var i = 0; i < this.length; i++) {
			var self = $(this[i]);

			if(!self.data('ins')) {
				if(typeof settings === 'string' && console) {
					console.error('['+ name +' '+ version +'] - not running, try firing methods after initialisation');
					continue;
				}

				ins = new TimeyCore(self, settings);
				ins.init();

				self.data('ins', ins);
			} else {
				ins = self.data('ins');

				if(ins.publicF[settings]) {
					if(this.length > 1) {
						results.push(ins.publicF[settings](params));
					} else {
						return ins.publicF[settings](params);
                    }
				} else {
					if(console) {
					   console.error('['+ name +' '+ version +'] - "'+ settings +'" is not a public method here\'s a nice list:');
						return ins.publicF;
					}
				}
			}
		}

		if(results.length >= 1) {
			return results;
		}
	};

	var TimeyCore = function(self, settings) {
		var ins = this,
			mod = {},
            options = $.extend(defaults, settings), container, header, nav, table, cells,
			defaults = {
                minHr: '00',
				minHrMin: '00',
                maxHr: '24',
				maxHrMin: '50'
            };

		var setUp = {
			init: function() {
				setUp.defineModules();

				if(!setUp.checks()) {
					return;
				}

				mod.elements.construct();
				setUp.bindings();
			},

			bindings: function() {
				self.on('click', mod.dates.show);
                $(document).on('click', '.timey__table__cell--hr', mod.dates.set_hour);
                $(document).on('click', '.timey__table__cell--min', mod.dates.set_min);
			},

			defineModules: function() {
				var modules = ['misc', 'dates', 'elements'];

				for(var module in modules) {
					if(modules.hasOwnProperty(module)) {
						mod[modules[module]] = new ins[modules[module]]();
					}
				}
			},

			checks: function() {
				if(!self.is('input[type="text"]')) {
					mod.misc.report('warn', 'Please fire the plugin on an input[type="text"] element! - Shutting down... :(');
					return false;
				}

				return true;
			}
		};

		ins.publicF = {
			updateTimes: function(times) {
				$(container).find('table').remove();
				self.val('Please select');
				options.minHr = times.minHr[0];
				options.minHrMin = times.minHr[1];
				options.maxHr = times.maxHr[0];
				options.maxHrMin = times.maxHr[1];

				mod.elements.createTable();
			}
		};

		ins.misc = function() {
			this.report = function(type, message) {
				if(console) {
					console[type]('['+ name +' '+ version +'] - ' + message);
				}
			};
		};

		ins.dates = function() {
			this.show = function() {
				if(!container.hasClass('active')){
					container.addClass('active');
				} else{
					container.removeClass('active');
				}
			};

			this.parseDouble = function(value) {
                if(value[0] === 0 || value.length > 1) {
                    return value;
                }

				if(value < 10) {
					return '0' + value;
                } else {
				    return value;
				}
			};

            this.set_hour = function() {
                var time = self.val().split(':'),
                    hr = $(this).text();

                if(hr != time[0]) {
                    time[1] = '00';
                }

                $('.timey__table__row--min').hide();
                $('.timey__table__cell--hr').removeClass('active');
                $(this).addClass('active');
                $(this).parent().parent().parent().parent().parent().parent().find('.timey__table__row--min').show();

                self.val($(this).text());
            }

            this.set_min = function() {
                var time = self.val().split(':');

                $('.timey__table__cell--min').removeClass('active');
                $(this).addClass('active');

                container.removeClass('active');

                self.val(time[0] + $(this).text());
            }
		};

		ins.elements = function() {
			this.construct = function() {
				self.attr('readonly', true);
				mod.elements.createContainer().createTable();
			};

			this.createContainer = function() {
				container = $('<div />', {
					'class' : 'timey__container'
				}).appendTo(self.parent());

				return mod.elements;
			};

			this.createTable = function() {
				table = $('<table />', {
					'class' : 'timey__table'
				}).appendTo(container);

                for(var i = options.minHr; i < (parseInt(options.maxHr) + 1); i++) {
					mod.elements.createHrs(i);
				}

				return mod.elements;
			};

			this.createHrs = function(rowIndex) {
				var row = $('<tr />').appendTo(table),
                    inner = $('<td />', {'class': 'timey__table__row__inner'}).appendTo(row),
                    innerTable = $('<table />', {'class': 'timey__table'}).appendTo(inner),
                    hrRow = $('<tr />').appendTo(innerTable),
                    hrRowInner = $('<td />').appendTo(hrRow),
                    hrRowInnerTable = $('<table />', {'class': 'timey__table'}).appendTo(hrRowInner),
                    hrRowInnerRow = $('<tr />', {'class': 'timey__table__row--hr'}).appendTo(hrRowInnerTable),
                    hrRowInnerHr = $('<td />', {'class': 'timey__table__cell  timey__table__cell--hr'}).text(mod.dates.parseDouble(rowIndex) + ':00').appendTo(hrRowInnerRow),
                    minRow = $('<tr />', {'class': 'timey__table__row--min'}).appendTo(innerTable),
                    minRowInner = $('<td />').appendTo(minRow),
                    minRowInnerTable = $('<table />', {'class': 'timey__table'}).appendTo(minRowInner),
                    minRowInnerRow = $('<tr />').appendTo(minRowInnerTable);

				var mins = 6,
					i = 0,
					m = 0;

				if(rowIndex == options.minHr) {
					if(typeof options.minHrMin == 'string') {
						i = options.minHrMin.charAt(0);
					}
				}

				if(rowIndex == options.maxHr) {
					if(typeof options.minHrMin == 'string') {
						mins = parseInt(options.maxHrMin.charAt(0)) + 1;
					}
				}

                for(i; i < mins; i++) {
                    var min = $('<td />', {
                        'class' : 'timey__table__cell  timey__table__cell--min'
                    }).text(':' + (m<10?'0'+m:Math.round(m))).appendTo(minRowInnerRow);
					m+=60/mins;
                }
			};
		};

		ins.init = function() {
			setUp.init();
		};
	};
})();
