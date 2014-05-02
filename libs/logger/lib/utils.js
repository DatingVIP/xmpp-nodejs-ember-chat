/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function(html){
	return String(html)
		.replace(/&(?!\w+;)/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
};

/**
 * Dump object
 * Return values of all properties and get object's string representation (if possible)
 */
exports.varDump = function (variable) {
	var vDebug = new String();
	if (typeof variable.toString === 'function')
	{
		vDebug += "[" + variable.toString() + "]\n"; 
	}
	
	Object.getOwnPropertyNames(variable).forEach(function(val, idx, array) {
		// exception for 'stack' properties for better formatting in logs
		if (val === 'stack') 
		{
			var stack = variable[val].split("\n");
			for (var line in stack) { vDebug += "\t" + stack[line] + "\n"; }
		} 
		else 
		{
			vDebug += "\t" + val + ": [" + variable[val] + "]\n";
		}
	});
	
	return vDebug;
}