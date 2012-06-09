
require('./arrays.js');

// Parses a string into character-delimited components, while respecting escape characters. The return will be
// an array of convience objects of '{ value: {string}, trimmed: {string}, delimiter: {string} }' identifying
// the sequences and their delimiters. The 'value' member will contain the bracketing delimiter characters,
// while 'trimmed' will not. Non-quoted strings will have a delimiter of 'null'. Delimiters can be multi-
// character, and they can also have different pre- and post-delimiter characters, which can be specified by
// passing delimiters as a convenience object '{ pre: {string}, post: {string} }'.
String.prototype.parse = function() {
	var chars = [],
		charLengths = {},
		ret = [], // Our return array
		length = this.length,
		quote = null, // Our quoting character or object
		postQuote = null, // The closing sequence we have to match for the current 'quote'
		preQuoteLength = null, // The length of the pre-delimiter sequence we opened
		postQuoteLength = null, // The length of the post-delimiter sequence we are following
		escaped = false, // Whether we have read a backslash character as an escape
		last = 0, // The last position we ticked off
		ix,
		arg;
	for (var i = 1; i < arguments.length; ++i) {
		if ((arg = arguments[i]) instanceof Array) {
			arg.singletons(function(item) { chars.push(item); });
		} else {
			chars.push(arg);
		}
	}
	if (chars.length == 0) {
		// Always use '"' and "'" by default
		chars.push('"');
		chars.push("'");
	}
	// Cache the lengths of the pre-delimiter characters
	chars.each(function(item) {
		charLengths[item.length] = typeof item == "object" ? item.pre.length : item.length;
	});
	
	// // Function to cache the multi-character lookaheads from a place in 'this'
	// function getLookaheads(str, i) {
		// var ret = {};
		// for (var key in charLengths) {
			// var len = charLengths[key];
			// ret[key] = i + len <= length ? str.substr(i, charLengths[key]) : "";
		// }
		// return ret;
	// }
	for (var i = 0; i < length; ++i) {
		if (escaped) {
			// We've consumed an escape character
			escaped = false;
		} else if (this.charAt(i) == "\\") {
			escaped = true;
		} else if (quote != null) {
			// See if we are closing 'quote'
			if (i + postQuoteLength - 1 < length && this.substr(i, postQuoteLength) == postQuote) {
				var value = this.substr(last, i + postQuoteLength - last),
					trimmed = value.substr(preQuoteLength, value.length - preQuoteLength - postQuoteLength);
				ret.push({
					value: value,
					trimmed: trimmed,
					delimiter: quote
				});
				quote = null;
				postQuote = null;
				preQuoteLength = null;
				last = i + postQuoteLength;
				postQuoteLength = null;
			}
		} else {
			// Check if we're opening a quoted section
			// var lookaheads = getLookaheads(this, i);
			var lookaheads = {},
				ix;
			for (var key in charLengths) {
				var len = charLengths[key];
				lookaheads[key] = i + len <= length ? this.substr(i, charLengths[key]) : "";
			}
			ix = chars.each(function(item) {
				return (typeof item == "object" ? item.pre : item) == lookaheads[item.length];
			});
			if (ix < chars.length) {
				// We're opening a quoted section, so close what we had last
				if (i > last) {
					var value = this.substr(last, i - last);
					ret.push({
						value: value,
						trimmed: value,
						delimiter: quote
					});
				}
				quote = chars[ix];
				preQuoteLength = typeof quote == "object" ? quote.pre.length : quote.length;
				postQuote = typeof quote == "object" ? quote.post : quote;
				postQuoteLength = postQuote.length;
				last = i;
			}
		}
	}
	if (i > last) {
		var value = this.substr(last, i - last);
		ret.push({
			value: value,
			trimmed: value,
			delimiter: quote
		});
	}
	return ret;
}


