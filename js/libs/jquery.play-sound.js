(function($){

$.extend({
	playSound: function(){
		if($("#chat-new-msg").length == 0)
		{
			var sources = '<source src="' + main_url + arguments[0] + '.ogg" type="audio/ogg; codecs=vorbis">'
						+ '<source src="' + main_url + arguments[0] + '.mp3"  type="audio/mpeg">';
			$('<audio controls hidden="true" id="chat-new-msg" autoplay="autoplay">' + sources + '</audio>').appendTo('body');
		}
		return document.getElementById('chat-new-msg').play();
	}
});

})(jQuery);