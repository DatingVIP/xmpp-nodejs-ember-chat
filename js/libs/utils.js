(function(exports){
	exports.getNodeFromJid = function (jid)
	{
		var node_jid = null;
		if (typeof jid === 'undefined' || jid.indexOf("@") < 0) { return null; }
		return jid.split("@")[0];
	};
})(typeof exports === 'undefined'? window : exports);

(function(exports){
	exports.getDomainFromJid = function (jid)
	{
		if (typeof jid === 'undefined' || jid.indexOf("@") < 0) { return null; }
		var bare = getBareJidFromJid(jid);
		if (bare.indexOf("@") < 0) {
			return bare;
		} else {
			var parts = bare.split("@");
			parts.splice(0, 1);
			return parts.join('@');
		}
	};
})(typeof exports === 'undefined'? window : exports);

(function(exports){
	exports.getResourceFromJid = function (jid)
	{
		if (typeof jid === 'undefined') { return null; }
		var s = jid.split("/");
		if (s.length < 2) { return null; }
		s.splice(0, 1);
		return s.join('/');
	};
})(typeof exports === 'undefined'? window : exports);

(function(exports){
	exports.getBareJidFromJid = function (jid)
	{
		return jid ? jid.split("/")[0] : null;
	};
})(typeof exports === 'undefined'? window : exports);

(function(exports){
	exports.getQueryVariable = function (variable) {
		var query = window.location.search.substring(1);
		var vars = query.split('&');
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			if (decodeURIComponent(pair[0]) == variable) {
				return decodeURIComponent(pair[1]);
			}
		}
	};
})(typeof exports === 'undefined'? window : exports);

(function(exports){
	exports.strip_tags = function (input, allowed) {
		var allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
		var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
			commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi,
			tag = '';
		return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
			tag = $0.indexOf('</') > -1 ? '</'+$1+'>' : '<'+$1+'>';
			return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? tag : '';
		});
	};
})(typeof exports === 'undefined'? window : exports);

$build = function(xname, attrib){
	return new element(xname, attrib);
}

//packet builder helper function for message stanza
$msg = function(attrib){
	return new Element("message", attrib);
}

//packet builder helper function for iq stanza
$iq = function(attrib){
	return new Element("iq", attrib);
}

//packet builder helper function for iq stanza
$pres = function(attrib){
	return new Element("presence", attrib);
}

/*function $msg(attrs) {
	var mes = "<message from='%%FROM%%' to='%%TO%%'><body>%%BODY%%</body></message>";
	return mes.replace('%%FROM%%',escapeXml(attrs.from))
		.replace('%%TO%%',escapeXml(attrs.to))
		.replace('%%BODY%%',escapeXml(attrs.body));
}

function $iq(attrs) { return new Element("iq", attrs); }

function $pres(attrs) {
	var mes = '<presence from="%%FROM%%" type="unavailable"><priority>10</priority><status>%%STATUS%%</status></presence>';
	return mes.replace('%%FROM%%',escapeXml(attrs.from))
		.replace('%%STATUS%%',escapeXml(attrs.status));
}

function escapeXml(s) {
    return s.
        replace(/\&/g, '&amp;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;').
        replace(/"/g, '&quot;').
        replace(/'/g, '&apos;');
}

function escapeXmlText(s) {
    return s.
        replace(/\&/g, '&amp;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;');
}*/
