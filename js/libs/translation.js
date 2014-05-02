define('translation', ['i18n'], function () {
	window['current_lang'] = null;

	if (window.translation == undefined) { 
		window.translation = new Object();
	}
	
	window['translate'] = function (_key, _options) {
		var translated_text = new String(window['translation'][current_lang][_key]);
		var matches = translated_text.match(/##(\w+)##/g);
		if (matches != null && matches.length && _options != null) {
			for(var i=0; i<matches.length; i++) {
				var tag = matches[i].match(/##(\w+)##/);
				if (_options[tag[1]] != null) {
					translated_text = translated_text.replace(matches[i],_options[tag[1]]); 
				}
			}
		}
		return translated_text;
	}
	
});