jQuery.fn.emoticonspicker = function(icon_folder) {
    var icon_folder			= icon_folder || "1",
		emotes				= {"smile": ":-)",
								"sad": ":(",
								"wink": ";-)",
								"grin": ":D",
								"surprise": ":O",
								"devilish": "(6)",
								"angel": "(A)",
								"crying": ":'(",
								"plain": ":|",
								"glasses": "8)",
								"kiss": "(K)",
								"monkey": "(M)"
							},
		html				= '',
		emot_width			= 16,
		emot_height			= 16,
		emot_hor_amount		= 3, // horizontal emots amount
		emot_margin			= 3,
		emotes_amount		= 0,
		picker_width		= 0;

	for(var emoticon in emotes){
			html += "<img src=\""+main_url+"/images/empty.gif\" class=\"emoticonimg emots-"+icon_folder+" emot-face-"+emoticon+" emoticons-select-emot\" title=\""+emotes[emoticon]+"\" alt=\""+emotes[emoticon]+"\" />";
			emotes_amount++;
	}

	$(this).html('<div class="emots-'+icon_folder+' emot-face-smile emoticonimg emoticons-select-icon" title="emoticons" alt="emoticons"></div>'+
				'<div class="emoticons-select"><div class="emoticons-title"><span class="emoticons-closer"></span></div></div>');
	$(this).children('.emoticons-select').hide();
	$(html).appendTo($(this).children('.emoticons-select'));

	picker_width = (emot_width * emot_hor_amount) + (2 * emot_margin * emot_hor_amount);
	$(this).children('.emoticons-select').css({
		backgroundColor:	'#fff',
		position:			'relative',
		paddingTop:			emot_height,
		zIndex:				400,
		bottom:				emot_height + (Math.ceil(emotes_amount / emot_hor_amount) * emot_height + (emot_margin * Math.ceil(emotes_amount / emot_hor_amount)) + emot_height*2 + emot_margin),
		left:				0,
		width:				picker_width,
		border:				'1px solid #ccc',
		resize:				'none'
	});
	$(this).children('.emoticons-select').children('.emoticons-select-emot').css({
					margin:	emot_margin
	});
	$(this).children('.emoticons-select-icon').click(function(){
		$(this).parent('span').children('.emoticons-select').toggle(0);
	})
	$('.emoticons-select-emot').click(function(){
		$(this).parent('div').parent('span').parent('div').children('textarea').insertAtCaret($(this).attr('alt'));
		$(this).parent('div').parent('span').parent('div').children('textarea').trigger('change');
		$(this).parent('div').parent('span').children('.emoticons-select').toggle(0);
	});
	// close emoticons when clicked outside it
	$(document).mouseup(function (e) {
		var container = $(".emoticons-picker");
		var closer = $(".emoticons-closer");
		if ((!container.is(e.target) // if the target of the click isn't the container...
			&& container.has(e.target).length === 0) || closer.is(e.target)) // ... nor a descendant of the container
		{
			$('.emoticons-select').hide();
		}
	});
};