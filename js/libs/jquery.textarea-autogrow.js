(function($) {

	/*
	* Auto-growing textareas; technique ripped from Facebook
	*/
	$.fn.autogrow = function(options) {
		this.filter('textarea').each(function() {
			var $this       = $(this),
				minHeight   = $this.height(),
				lineHeight  = $this.css('lineHeight');

			var shadow = $('<div></div>').css({
				position:   'absolute',
				top:        -10000,
				left:       -10000,
				width:      $(this).width(),
				fontSize:   $this.css('fontSize'),
				fontStyle:  $this.css('fontStyle'),
				fontWeight: $this.css('fontWeight'),
				fontFamily: $this.css('fontFamily'),
				lineHeight: $this.css('lineHeight'),
				wordWrap:   $this.css('wordWrap'),
				resize:     'none'
			}).appendTo(document.body);

			var update = function() {

				var val = this.value.replace(/</g, '&lt;')
									.replace(/>/g, '&gt;')
									.replace(/&/g, '&amp;')
									.replace(/\n/g, '<br/>');
				if(getQueryVariable('main_user'))	{shadow.css('width', $(this).width())}
				shadow.html(val + '...');
				var currH = getQueryVariable('main_user') ? $(window).height()-80 : parseInt(shadow.height(), 10),
					maxH = parseInt($this.css('max-height'), 10),
					minH = parseInt($this.css('min-height'), 10),
					fontH = parseInt($this.css('fontSize'), 10)
					multipl = 1,
					el_position = 0;

				currH = parseInt(shadow.height(), 10) + parseInt($this.css('padding-top'), 10) + 3;
				if(currH <= minH)		{ multipl = 0;}
				$(this).css('height', currH);

				// calculate how to move textarea
				var excess = 0;
				if(currH > maxH)	{ excess = currH-maxH; }
				el_position = (((currH / fontH) - (minH / fontH)) * fontH * multipl) - excess + ((minH / fontH)*multipl);
				el_position = el_position>0?el_position-3:0;
				$(this).css({
					position:	'relative',
					bottom:		el_position,
					left:		0,
				});

				var container = $(this).parent('div').parent('div').children('.chat-flyout-body').children('.message-list');

				var winH = 330 - el_position,
					winBottom = 0;
				if (getQueryVariable('main_user')){
					winH = $(window).height()-85;
					winBottom = el_position;
				}
				container.css({
					height:			winH,
					bottom:		winBottom
				});

				container.prop('scrollTop', container.prop('scrollHeight'));
			};

			$(this).change(update).keyup(update).keydown(update);

			update.apply(this);
			$(window).resize(function(){
				$this.trigger('change');
			});
		});

		return this;

	};

})(jQuery);
