
// Parses a string into character-delimited components, while respecting escape characters. The return will be
// an array of convience objects of '{ value: {string}, delimiter: {string} }' identifying the sequences and
// their delimiters. The 'value' member will not contain the bracketing delimiter characters, and non-quoted
// strings will have a delimiter of 'null'.
function parseString(str) {
	var chars = [];
	for (var i = 1; i < arguments.length; ++i) {
		chars.push(arguments[i]);
	}
	if (chars.length == 0) {
		// Always use '"' and "'" by default
		chars.push('"');
		chars.push("'");
	}
	var ret = [], // Our return array
		quote = null, // Our quoting character
		escaped = false, // Whether we have read a backslash character as an escape
		last = 0, // The last position we ticked off
		ix;
	for (var i = 0; i < str.length; ++i) {
		var _char = str.charAt(i);
		if (escaped) {
			// We've consumed an escape character
			escaped = false;
		} else if (_char == "\\") {
			escaped = true;
		} else if (quote != null) {
			if (quote == _char) {
				// We're closing a quoted section
				ret.push({
					value: str.substr(last + 1, i - last - 1),
					delimiter: quote
				});
				quote = null;
				last = i + 1;
			}
		} else if ((ix = chars.indexOf(_char)) != -1) {
			// We're opening a quoted section, so close what we had last
			if (i > last) {
				ret.push({
					value: str.substr(last, i - last),
					delimiter: quote
				});
			}
			quote = chars[ix];
			last = i;
		}
	}
	if (i > last) {
		ret.push({
			value: str.substr(last += (quote != null ? 1 : 0), i - last),
			delimiter: quote
		});
	}
	return ret;
}

module.exports = {
	parseString: parseString
};


