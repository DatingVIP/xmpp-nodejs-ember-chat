/* doLinks script */

function mklinks(inputText, options) {
	this.options = {linkClass: 'url', targetBlank: true};

	this.options = $.extend(this.options, options);

	inputText = inputText.replace(/\u200B/g, "");

	var url = 'http://' + document.domain + '/?c=chat&a=redir&url=';
	//URLs starting with http://, https://, or ftp://
	var replacePattern1 = /(src="|href="|">|\s>)?(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;i]*[-A-Z0-9+&@#\/%=~_|i]/gim;
	var replacedText = inputText.replace(replacePattern1, function($0,$1){ return $1?$0:'<a class="'+ this.options.linkClass + '" href="' + url + $0 + '"' + (this.options.targetBlank?'target="_blank"':'') + '>'+ $0+ '</a>';});

	//URLS starting with www and not the above
	var replacePattern2 = /(src="|href="|">|\s>|https?:\/\/|ftp:\/\/)?www\.[-A-Z0-9+&@#\/%?=~_|!:,.;i]*[-A-Z0-9+&@#\/%=~_|i]/gim;
	var replacedText = replacedText.replace(replacePattern2, function($0,$1){ return $1?$0:'<a class="'+ this.options.linkClass + '" href="' + url + 'http://'+ $0 + '"' + (this.options.targetBlank?'target="_blank"':'') + '>'+ $0+ '</a>';});

	//Change email addresses to mailto:: links
	var replacePattern3 = /([\.\w]+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
	var replacedText = replacedText.replace(replacePattern3, '<a class="' + this.options.linkClass + '" href="mailto:$1">$1</a>');

	// change /profile:$username to proper link
	var replacePattern4 = /\/profile:([-_\.+0-9a-zA-Z]+)/gim;
	var replacedText = replacedText.replace(replacePattern4, '<a class="'+ this.options.linkClass + '" href="http://' + document.domain + '/profile/$1"' + (this.options.targetBlank?'target="_blank"':'') + '>$1</a>');

	return replacedText;
}

$.fn.mklinks = function(){
	return this.each(function(){
		$(this).html(mklinks($(this).html()));
	});
}