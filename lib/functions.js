
// function: evalKernel
// This calls all kernel functions used in the library in a standard form, which differs for 'Array's and
// non-'Array's, and for kernel function argument lengths, for convenience. The function is called with
// the kernel to evaluate, and the 'key', 'value', and parent 'obj' we are examining (whether 'key' is
// actually a string key from an object or the numeric index of an array). If 'kernel' is 'null', this
// just returns 'value', but otherwise returns the kernels evaluation. Can also accept extra prefix and
// postfix arguments.
// 
// Calling behavior:
//   For array 'obj's:
//     For arrays, kernels are always called as '(value, key, obj)', since most often the value is the
//     desideratum and an indexer is unnecessary, and possibly anti-pattern-ish.
// 
//   For object 'obj's:
//     For 1-argument 'kernel's:
//       Calls as '(value)' since this makes single-element kernels congruent with those of arrays, meaning
//       it is easy to write arithmetic methods that apply equally to objects as to arrays.
//     For 2+-argument 'kernel's:
//       Calls as '(key, value, obj)' since this more closely mirrors the 'for (var key in obj)' semantics
//       that are needed to iterate through an object, when the key is required to be captured.
// 
// parameters:
//   kernel - The kernel to run
//   key - The key or index of the element
//   value - The value of the element
//   obj - The container of the element 
//   extras - An object of extra parameters to use:
//     'pre': An array of arguments to apply before whatever they want
//     'post': An array of arguments to apply after whatever they want
function evalKernel(kernel, key, value, obj, extras) {
	if (kernel == null) {
		// That was easy
		return value;
	}
	if (!(obj instanceof Array)) {
		if (extras == null) {
			if (kernel.length == 1) {
				// Just send the value back
				return kernel(value);
			} else {
				return kernel(key, value, obj);
			}
		} else {
			var args,
				nPre = 0,
				nPost = extras.post != null ? extras.post.length : 0;
			if (extras.pre != null) {
				args = extras.pre;
				nPre = args.length;
			} else {
				args = [];
			}
			if ((kernel.length - nPre /*- nPost*/) == 1) {
				// They only want one element from the canonical chain, so give them the value rather than the key
				args = args.concat([value]);
			} else {
				args = args.concat([key, value, obj]);
			}
			if (extras.post != null) {
				args = args.concat(extras.post);
			}
			return kernel.apply(null, args);
		}
	} else {
		if (extras == null) {
			return kernel(value, key, obj);
		} else {
			var args;
			if (extras.pre != null) {
				args = extras.pre;
			} else {
				args = [];
			}
			args = args.concat([value, key, obj]);
			if (extras.post != null) {
				args = args.concat(extras.post);
			}
			return kernel.apply(null, args);
		}
	}
}

// function: each
// For objects:
// Runs a predicate over every key--value pair from the object, passing the arguments '(key, value)'. A return of
// 'true' will initiate a break, and the function will return the loop index at the time of breaking. Without
// breaking, the return will be the number of key--value pairs analyzed. If the kernel is 'null', the function will
// simply return the number of keys in the object.
// 
// For arrays:
// Runs a kernel function over every element of the array with '(item, index, this)' and
// returns the last index that was used in the traversal. A return of 'true' initiates a
// break.
// 
// parameters:
//   style - (Opt.) When 'reverse' runs the iteration in the reverse direction over
//      '[start, stop)'.
//   start - (Opt.) A start index that accepts negative numbers.
//   end - (Opt.) An exclusive stop index that accepts negative numbers.
//   kernel - The kernel that is applied to each element. A return of 'true' causes a
//      break. 
function each(obj, kernel) {
    if (!(obj instanceof Array)) {
        var count = 0;
        for (var key in obj) {
            // if (kernel != null && kernel(key, obj[key]) === true) {
			if (evalKernel(kernel, key, obj[key], obj) === true) {
                break;
            }
            ++count;
        }
        return count;
    } else {
        // style, start, end, kernel
        var style = null,
            start = 0,
            len = obj.length,
            end = len,
            kernel1,
            arg,
            i = 1;
        if (arguments.length > 1) {
            arg = arguments[i++];
            if (typeof arg == "string" || typeof arg == "object") {
                style = arg;
                arg = arguments[i++];
                if (style == "reverse") {
                    start = len - 1;
                    end = -1;
                }
            }
            if (typeof arg == "number") {
                start = arg;
                if (start < 0) {
                    start += len;
                }
                arg = arguments[i++];
            }
            if (typeof arg == "number") {
                end = arg;
                if (end < 0) {
                    end += len;
                }
                arg = arguments[i++];
            }
            if (typeof arg == "function") {
                kernel1 = arg;
            }
        }
        if (kernel1 == null) {
            throw "Exception: 'each' called without a kernel function";
        }
        if (style == "reverse") {
            for (i = start; i > end; --i) {
                // if (i in obj && kernel1(obj[i], i, obj) === true) {
				if (i in obj && evalKernel(kernel1, i, obj[i], obj) === true) {
                    break;
                }
            }
        } else if (style == null) {
            for (i = start; i < end; ++i) {
                // if (i in obj && kernel1(obj[i], i, obj) === true) {
				if (i in obj && evalKernel(kernel1, i, obj[i], obj) === true) {
                    break;
                }
            }
        } else {
            throw "Exception: 'each' called with un-understood style: " + style;
        }
        return i;
    }
}

// function: select
// For objects:
// Applies a callback to each key--value pair from the object and returns a new object which aggregates the 
// return values. Returning an object will merge its keys and values into the return, overwriting any values
// that were already present in the object being assembled. Returning a new value will simply add that to
// new object with the same key. Returning 'undefined' will skip the key.
//
// parameters:
//   predicate - (Opt.) If null, the straight values are used and the object is cloned.
// 
// For arrays:
// Applies a callback to each element of an array with the arguments '(item, index, this)'
// and returns an array of the return values. If the predicate returns 'undefined', the
// value is skipped and no element is pushed to the return array. The arguments are all
// optional.
// 
// parameters:
//   style - (Opt.) When 'reverse' specifies the iteration runs in the reverse order.
//   start - (Opt.) An optional start index that supports negative values.
//   length - (Opt.) An optional length that supports negative values.
//   predicate - (Opt.) If undefined, all values are returned.
function select(obj, predicate) {
    if (!(obj instanceof Array)) {
        var ret = {},
            item;
        for (var key in obj) {
			if ((item = evalKernel(predicate, key, obj[key], obj)) !== undefined) {
                if (item != null && typeof obj[key] != "object" && typeof item == "object") {
					// Copy over the key--value pairs individually
                    for (var key1 in item) {
                        ret[key1] = item[key1];
                    }
                } else{
                    ret[key] = item;
                }
            }
        }
        return ret;
    } else {
        // style, start, length, predicate
        var thisLength = obj.length,
            ret = [],
            // Begin parsing arguments at an offset
            i = 1,
            style = null,
            start = 0,
            length = thisLength,
            predicate1 = null,
            arg,
            end,
            item;
        if (arguments.length > 1) {
            arg = arguments[i++];
            if (typeof arg == "string" || typeof arg == "object") {
                style = arg;
                arg = arguments[i++];
                if (style == "reverse") {
                    start = length - 1;
                }
            }
            if (typeof arg == "number") {
                start = arg;
                if (start < 0) {
                    start += thisLength;
                }
                arg = arguments[i++];
                if (typeof arg == "number") {
                    length = arg;
                    if (length < 0) {
                        length += thisLength;
                    }
                    arg = arguments[i++];
                }
            }
            if (typeof arg == "function") {
                predicate1 = arg;
            }
        }
        if (style == null) {
            // A regular traversal
            end = Math.min(thisLength, start + length);
            for (i = start; i < end; ++i) {
                if (i in obj && (item = evalKernel(predicate1, i, obj[i], obj)) !== undefined) {
					ret.push(item);
				}
            }
        } else if (style == "reverse") {
            // A reverse iteration
            end = Math.max(-1, start - length);
            for (i = start; i > end; --i) {
                if (i in obj && (item = evalKernel(predicate1, i, obj[i], obj)) !== undefined) {
					ret.push(item);
                }
            }
        } else {
            throw "Exception: 'select' called with un-understood style: " + style;
        }
        return ret;
    }
}

// function: where
// For objects:
// Applies a callback to each key--value pair from the object and returns a new object with all the key--value
// pairs for which the predicate returned 'true'.
// 
// For arrays:
// Returns the array of elements for which the predicate returned 'true' when called with
// '(item, index, this)'.
// 
// parameters:
//   style - (Opt.) When 'ixes' makes the return a convenience object of
//      '{ items: {Array}, ixes: {Array} }', where 'items' will hold the actual values
//      that passed and 'ixes' will hold their positions in the original array.
//   predicate - The required predicate to return 'true' or not for all elements.
function where(obj, predicate) {
    if (!(obj instanceof Array)) {
        var ret = {},
            item;
        for (var key in obj) {
            // if (predicate(key, item = obj[key]) === true) {
			if (evalKernel(predicate, key, item = obj[key], obj) === true) {
                ret[key] = item;
            }
        }
        return ret;
    } else {
        var length = obj.length,
            ret,
            style = null,
            predicate1,
            item,
            i = 1,
            arg;
        if (arguments.length > 1) {
            arg = arguments[i++];
            if (typeof arg == "string" || typeof arg == "object") {
                style = arg;
                arg = arguments[i++];
            }
            if (typeof arg == "function") {
                predicate1 = arg;
            }
        }
        if (style == "ixes") {
            ret = {
                items: [],
                ixes: []
            };
            for (i = 0; i < length; ++i) {
                // if (i in obj && predicate1(item = obj[i], i, obj) === true) {
				if (i in obj && evalKernel(predicate1, i, item = obj[i], obj) === true) {
                    ret.items.push(item);
                    ret.ixes.push(i);
                }
            }
        } else if (style == null) {
            ret = [];
            for (i = 0; i < length; ++i) {
                // if (i in obj && predicate1(item = obj[i], i, obj) === true) {
				if (i in obj && evalKernel(predicate1, i, item = obj[i], obj) === true) {
                    ret.push(item);
                }
            }
        } else {
            throw "Exception: 'where' called with un-understood style: " + style;
        }
        return ret;
    }
}

// function: sift
// For objects:
// Returns a convenience object that maps predicate return values (when called with '(key, value)') to
// objects aggregating the key--value pairs that the predicate returned that value on. E.g., for a standard
// boolean-returning predicate, this will return an object of '{ true: {object}, false: {object} }',
// separating the key--value pairs into those which returned 'true' and 'false' under 'predicate', respectively.
// 
// For arrays:
// Returns a convenience object that maps predicate return values (when called with
// '(item, index, this)') to arrays of the elements that returned those values from the
// original array. E.g., for a standard boolean-returning predicate, this will return an
// object of '{ true: {Array}, false: {Array} }', separating the elements into those which
// returned 'true' and 'false' under 'predicate', respectively.
// 
// parameters:
//   style - (Opt.) When 'ixes' turns the above-mentioned 'Array's into convenience
//      objects of '{ items: {Array}, ixes: {Array} }', where 'items' will hold the actual
//      values that passed and 'ixes' will hold their positions in the original array.
function sift(obj, predicate) {
    if (!(obj instanceof Array)) {
        var ret = {},
            value,
            item,
            _new;
        for (var key in obj) {
            // item = predicate(key, value = obj[key]);
			item = evalKernel(predicate, key, value = obj[key], obj);
            if (item in ret) {
                _new = ret[item];
            } else {
                ret[item] = _new = {};
            }
            _new[key] = value;
        }
        return ret;
    } else {
        // style, predicate
        var length = obj.length,
            style = null,
            predicate1,
            ret = {},
            item,
            i = 1,
            key,
            arg;
        if (arguments.length > 1) {
            arg = arguments[i++];
            if (typeof arg == "string" || typeof arg == "object") {
                style = arg;
                arg = arguments[i++];
            }
            if (typeof arg == "function") {
                predicate1 = arg;
            }
        }
        if (predicate1 == null) {
            throw "Exception: 'sift' called without a predicate";
        }
        if (style == "ixes") {
            for (i = 0; i < length; ++i) {
                if (i in obj) {
                    // key = predicate1(item = obj[i], i, obj);
					key = evalKernel(predicate1, i, item = obj[i], obj);
                    if (key in ret) {
                        key = ret[key];
                        key.items.push(item);
                        key.ixes.push(i);
                    } else {
                        ret[key] = {
                            items: [item],
                            ixes: [i]
                        };
                    }
                }
            }
        } else {
            for (i = 0; i < length; ++i) {
                if (i in obj) {
                    // key = predicate1(item = obj[i], i, obj);
					key = evalKernel(predicate1, i, item = obj[i], obj);
                    if (key in ret) {
                        ret[key].push(item);
                    } else {
                        ret[key] = [item];
                    }
                }
            }
        }
        return ret;
    }
}

// function: replace
// For objects:
// Replaces the values in the object with the return values from the kernel function when called on the
// key--value pair entries from the object. Items that return 'undefined' are removed from the object, and the
// original object is returned.
// 
// For arrays:
// Replaces all elements in the array with the return values from the kernel function when
// called on the elements with '(item, index, this)'. Items that return 'undefined' are
// removed from the array, and the original array reference is returned.
// 
// parameters:
//   start - An optional inclusive start index that supports negative numbers.
//   length - An optional length parameter that supports negative numbers.
//   kernel - The kernel function.
function replace(obj, kernel) {
    if (!(obj instanceof Array)) {
        var item;
        for (var key in obj) {
            // if ((item = kernel(key, obj[key])) === undefined) {
			if ((item = evalKernel(kernel, key, obj[key], obj)) === undefined) {
                delete obj[key];
            } else {
                obj[key] = item;
            }
        }
        return obj;
    } else {
        // start, length, kernel
        var start = 0,
            len = obj.length,
            length = len,
            end,
            kernel1,
            item,
            i = 1,
            arg;
        if (arguments.length > 1) {
            arg = arguments[i++];
            if (typeof arg == "number") {
                start = arg;
                if (start < 0) {
                    start += len;
                }
                arg = arguments[i++];
                if (typeof arg == "number") {
                    length = arg;
                    arg = arguments[i++];
                }
            }
            if (typeof arg == "function") {
                kernel1 = arg;
            }
        }
        end = Math.min(len, start + length);
        for (var i = start; i < end; ++i) {
            if (i in obj) {
                // if ((item = kernel1(obj[i], i, obj)) !== undefined) {
				if ((item = evalKernel(kernel1, i, obj[i], obj)) !== undefined) {
                    obj[i] = item;
                } else {
                    // Drop
                    obj.splice(i, 1);
                    --i;
                    --len;
                }
            }
        }
        return obj;
    }
}

// function: toArray
// Converts an object to an array, where the values are composed of the returns from the kernel, which
// is called with '(key, value)'. If no kernel is specified, the values are aggregated. Returns of
// 'undefined' are not added to the array.
function toArray(obj, kernel) {
	var ret = [],
		item;
	for (var key in obj) {
		// if ((item = kernel == null ? obj[key] : kernel(key, obj[key])) !== undefined) {
		if ((item = evalKernel(kernel, key, obj[key], obj)) !== undefined) {
			ret.push(item);
		}
	}
	return ret;
}

// function: kernel
// Runs a kernel function over every component of the object, examining all array entries
// and key--value pairs. Calls the kernel function with '(index, item, parent, parents)'
// for array elements, and with '(key, value, parent, parents)' for object elements, where
// 'parent' is the most recent container, and 'parents' is a stack of all nested
// containers so far, with 'parent' at the top. In the first case, 'index' will have
// 'typeof "number"' to allow disambiguation without capturing the third argument and
// doing an 'instanceof' check.
// 
// parameters:
//   obj - The object to recursively examine
//   kernel1 - The kernel function to apply in the manner described above
//   parents - An optional stack of explicit parents to start with, not including 'obj'
// 
// returns:
//   The kernel function return is multi-faceted. A return of 'false' prevents the
//   function from recursing into the object last examined if, in fact, it was of 'typeof
//   "object"', but does not break any other loops. 'undefined' returns are ignored, but
//   all other returns cause an early exit, with the value being returned verbatim.
function kernel(obj, kernel1, parents) {
	if (parents == null || !(parents instanceof Array)) {
		parents = [];
	}
	var elem, ret;
	if (typeof obj == "object") {
		parents.push(obj);
		if (obj instanceof Array) {
			for (var i = 0; i < obj.length; ++i) {
				// Check the element
				if ((ret = kernel1(i, elem = obj[i], obj, parents)) === false) {
					// No recursion for you
					continue;
				} else if (
					// Check early exit
					ret !== undefined
					// Check recursion
					|| typeof elem == "object" && (ret = kernel(elem, kernel1, parents)) !== undefined) {
					return ret;
				}
			}
		} else {
			for (var key in obj) {
				// Check the element
				if ((ret = kernel1(key, elem = obj[key], obj, parents)) === false) {
					// No recursion for you
					continue;
				} else if (
					// Check early exit
					ret !== undefined
					// Check recursion
					|| typeof elem == "object" && (ret = kernel(elem, kernel1, parents)) !== undefined) {
					return ret;
				}
			}
		}
		parents.pop(obj);
	} else {
		return kernel1(undefined, obj, undefined, parents);
	}
}

// function: equal
// Test whether two objects are equal in all their literal contents. Recurses through all
// array items and object key--value pairs.
// 
// parameters:
//   strict - Whether to do strict '===' equality between literal values instead of '=='.
//      Defaults to 'true'.
function equal(obj1, obj2, strict) {
	var isObject, isArray;
	if ((isObject = typeof obj1 == "object") ^ typeof obj2 == "object") {
		// Types don't agree
		return false;
	} else if (isObject) {
		if ((isArray = obj1 instanceof Array) ^ obj2 instanceof Array) {
			// Array types don't agree
			return false;
		} else if (isArray) {
			// Compare two arrays
			var length;
			if ((length = obj1.length) != obj2.length) {
				return false;
			}
			for (var i = 0; i < length; ++i) {
				if (!equal(obj1[i], obj2[i], strict)) {
					return false;
				}
			}
			return true;
		} else {
			// Compare two objects
			for (var key in obj1) {
				if (!(key in obj2) || !equal(obj1[key], obj2[key], strict)) {
					return false;
				}
			}
			for (var key in obj2) {
				if (!(key in obj1)) {
					return false;
				}
			}
			return true;
		}
	} else {
		// We're comparing two literal values
		return strict !== false ? obj1 === obj2 : obj1 == obj2;
	}
}

// function: clone
// Does a deep clone of the object.
function clone(obj) {
    if (obj == null) {
        return null;
    } else if (typeof obj == "object") {
        var ret;
        if (obj instanceof Array) {
            ret = [];
            for (var i = 0; i < obj.length; ++i) {
                ret.push(clone(obj[i]));
            }
        } else {
            ret = {};
            for (var key in obj) {
                ret[key] = clone(obj[key]);
            }
        }
        return ret;
    } else {
        return obj;
    }
}

// function: parse
// Parses a string into character-delimited components, while respecting escape characters. The return will be
// an array of convenience objects of '{ value: {string}, trimmed: {string}, delimiter: {string} }' identifying
// the sequences and their delimiters. The 'value' member will contain the bracketing delimiter characters,
// while 'trimmed' will not. Non-quoted strings will have a delimiter of 'null'. Delimiters can be multi-
// character, and they can also have different pre- and post-delimiter characters, which can be specified by
// passing delimiters as a convenience object '{ pre: {string}, post: {string} }'.
function parse(str) {
	var chars = [],
		charLengths = {},
		ret = [], // Our return array
		length = str.length,
		quote = null, // Our quoting character or object
		postQuote = null, // The closing sequence we have to match for the current 'quote'
		preQuoteLength = null, // The length of the pre-delimiter sequence we opened
		postQuoteLength = null, // The length of the post-delimiter sequence we are following
		escaped = false, // Whether we have read a backslash character as an escape
		last = 0, // The last position we ticked off
		ix,
		arg,
		item;
	for (var i = 1; i < arguments.length; ++i) {
		if ((arg = arguments[i]) instanceof Array) {
			for (var j = 0; j < arg.length; ++j) {
				chars.push(arg[j]);
			}
		} else {
			chars.push(arg);
		}
	}
	if (chars.length == 0) {
		// Always use '"' and "'" by default
		chars.push('"');
		chars.push("'");
	}
	console.log(chars);
	// Cache the lengths of the pre-delimiter characters
	for (var i = 0; i < chars.length; ++i) {
		item = chars[i];
		charLengths[item.length] = typeof item == "object" ? item.pre.length : item.length;
	}
	
	for (var i = 0; i < length; ++i) {
		if (escaped) {
			// We've consumed an escape character
			escaped = false;
		} else if (str.charAt(i) == "\\") {
			escaped = true;
		} else if (quote != null) {
			// See if we are closing 'quote'
			if (i + postQuoteLength - 1 < length && str.substr(i, postQuoteLength) == postQuote) {
				var value = str.substr(last, i + postQuoteLength - last),
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
			// var lookaheads = getLookaheads(str, i);
			var lookaheads = {},
				ix;
			for (var key in charLengths) {
				var len = charLengths[key];
				lookaheads[key] = i + len <= length ? str.substr(i, charLengths[key]) : "";
			}
			for (ix = 0; ix < chars.length; ++ix) {
				item = chars[ix];
				if ((typeof item == "object" ? item.pre : item) == lookaheads[item.length]) {
					break;
				}
			}
			if (ix < chars.length) {
				// We're opening a quoted section, so close what we had last
				if (i > last) {
					var value = str.substr(last, i - last);
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
		var value = str.substr(last, i - last);
		ret.push({
			value: value,
			trimmed: value,
			delimiter: quote
		});
	}
	return ret;
}

// function: ix
// An array indexer that accepts negative indices and vector indices. Works as Matlab,
// where a call of '([1, 2], [3, 4])' will select a sub-matrix of the rows '[1,2]' by the
// columns '[3, 4]'.
function ix(arr) {
	var n = arguments.length,
		anyArray = false,
		i;
	// Check if we have any 'Array' arguments, which means we return an 'Array'
	for (i = 1; i < n; ++i) {
		var arg = arguments[i];
		if (arg != null && arg instanceof Array) {
			anyArray = true;
			break;
		}
	}
	if (anyArray) {
		// We're returning a sub-array, so assemble it
		// Figure out the bounds of the iteration so that we can use an 'NdimIterator'
		var bounds = [];
		for (i = 1; i < n; ++i) {
			var arg = arguments[i];
			bounds.push(arg instanceof Array ? arg.length : 1);
		}
		var ret = [],
			control = new NdimIterator(bounds);
		while (control.inBounds()) {
			// Add an element to the return by following the index chain
			var arr = ret, // To insert returns
				temp = arr; // To get the value
			for (i = 1; i < n; ++i) {
				// Make sure arr element of 'arr' exists, and get it
				var ix = control.ixes[i];
				var arg = arguments[i];
				if (i < n - 1) {
					// Make sure we have an array in 'arr'
					if (!(ix in arr)) {
						arr[ix] = [];
					}
					arr = arr[ix];
					// Follow the right element in 'temp'
					if (arg instanceof Array) {
						ix = arg[ix];
						temp = temp[ix < 0 ? temp.length + ix : ix];
					} else {
						temp = temp[arg < 0 ? temp.length + arg : arg];
					}
				} else {
					// We're at the end, so insert the right 'arr' into 'temp'
					if (arg instanceof Array) {
						var ix2 = arg[ix];
						arr[ix] = temp[ix2 < 0 ? temp.length + ix2 : ix2];
					} else {
						arr[ix] = temp[arg < 0 ? temp.length + arg : arg];
					}
				}
			}
			if (!control.increment()) {
				break;
			}
		}
		return ret;
	} else {
		// We're returning a singleton, so simply apply the indices
		var ret = arr;
		for (i = 1; i < n; ++i) {
			var arg = arguments[i];
			ret = ret[arg < 0 ? ret.length + arg : arg];
		}
		return ret;
	}
}

// function: singletons
// An iterator which calls a callback for every non-'Array' element in the multi-
// dimensional array. The callback is called with the parameters '(value, ix1, ix2, ...,
// ix{n}, arr1, arr2, ..., arr{n-1})' for however many indices deep the item was, and with
// every wrapping array returned. A return of 'true' from the callback executes a break
// from that element. The function returns the number of elements visited before
// termination.
function singletons(obj, predicate) {
	var ret = 0,
		// 'value', 'index', 'arr'
		args = [null, null, obj];
	function recurse(arr) {
		var length = arr.length,
			n = Math.floor(args.length / 2);
		for (var i = 0; i < length; ++i) {
			if (i in arr) {
				var item = arr[i];
				args[n] = i;
				if (item != null && item instanceof Array) {
					// An array, so make room for another index and slot it
					args = args.slice(0, n + 1).concat([0], args.slice(n + 1), [item]);
					recurse(item);
					// Drop the extra elements from 'args'
					args = args.slice(0, n + 1).concat(args.slice(n + 2, -1));
				} else {
					// A singleton, so call the predicate on it
					args[0] = item;
					predicate.apply(null, args);
					++ret;
				}
			}
		}
	}
	recurse(obj);
	return ret;
}

// function: sum
// Returns the sum of the elements in the array
function sum(obj, predicate) {
	if (predicate != null) {
		return obj.reduce(function(value, item, i) { return value + predicate(item, i); }, 0);
	} else {
		return obj.reduce(function(value, item) { return value + item; }, 0);
	}
}
// function: prod
// Returns the product of the elements in the array
function prod(obj, predicate) {
	if (predicate != null) {
		return obj.reduce(function(value, item, i) { return value * predicate(item, i); }, 1);
	} else {
		return obj.reduce(function(value, item) { return value * item; }, 1);
	}
}
// function: any
// Return the early exit 'or' of all the elements in the array
function any(obj, predicate) {
	var length = obj.length;
	// if (predicate != null) {
		for (var i = 0; i < length; ++i) {
			// if (i in obj && predicate(obj[i], i)) {
			if (i in obj && evalKernel(predicate, i, obj[i], obj)) {
				return true;
			}
		}
	// } else {
		// for (var i = 0; i < length; ++i) {
			// if (i in obj && obj[i]) {
				// return true;
			// }
		// }
	// }
	return false;
}
// function: all
// Return the early exit 'and' of all the elements in the array
function all(obj, predicate) {
	var length = obj.length;
	// if (predicate != null) {
		for (var i = 0; i < length; ++i) {
			// if (i in obj && !predicate(obj[i], i)) {
			if (i in obj && !evalKernel(predicate, i, obj[i], obj)) {
				return false;
			}
		}
	// } else {
		// for (var i = 0; i < length; ++i) {
			// if (i in obj && !obj[i]) {
				// return false;
			// }
		// }
	// }
	return true;
}

// function: makeArray
// Uses the array as the bounds to fill out a matrix of 'value', e.g., 'makeArray([3], 0)'
// creates a three-element array of zeros, 'makeArray([3,4], 1)' creates a three-by-four
// matrix of ones, etc. 'value' can be a function, in which case it will be called with
// the '(r)', '(r, c)', etc., indices of the element being constructed.
function makeArray(obj, value) {
	if (value === undefined) {
		value = 0;
	}
	var isFunction = typeof value == "function",
		n = obj.length,
		ixes = [];
	function iter(i) {
		var ret = [],
			length = obj[i];
		for (var j = 0; j < length; ++j) {
			ixes[i] = j;
			if (i >= n - 1) {
				ret.push(isFunction ? value.apply(null, ixes) : value);
			} else {
				ret.push(iter(i + 1));
			}
		}
		return ret;
	}
	return iter(0);
}

// function: colon
// Adds a Matlab-style colon operator to arrays. For a two-element array, '[a, b]', it
// returns an array composed of the elements in the range '[start, end]' (so Matlab
// 'a : b'). For a three-element array, '[a, b, c]', does Matlab 'a : b : c', and returns
// an array composed of the elements:
// 				'{ i : i >= a && i <= c && b | (i - a) }'
// (Note: 'b | (i - a)' is not read as a 'such that' but as '"b" divides the quantity "i"
// minus "a"') As a bonus, for a one-element array, '[a]', this returns the values in
// '[0, a)'. 
function colon(obj) {
	var length = obj.length,
		ret = [];
	switch (length) {
	case 1:
		var a = obj[0];
		for (var i = 0; i < a; ++i) {
			ret.push(i);
		}
		break;
	case 2:
		var a = obj[0], b = obj[1];
		for (var i = a; i <= b; ++i) {
			ret.push(i);
		}
		break;
	case 3:
		var a = obj[0], b = obj[1], c = obj[2];
		if (b < 0) {
			for (var i = a; i >= c; i += b) {
				ret.push(i);
			}
		} else {
			for (var i = a; i <= c; i += b) {
				ret.push(i);
			}
		}
		break;
	default:
		throw "Exception: Bad number of elements in for colon-izing a vector";
	}
	return ret;
}

// function: separate
// Separate the array based on which items match the predicate when called with
// '(item, index, this)'. Elements matching the predicate are removed, and the return
// value is an array of sub-arrays holding the sets of contiguous elements. Empty arrays
// are not returned.
function separate(obj, predicate) {
	if (predicate == null) {
		throw "Exception: 'separate' called without a predicate";
	}
	var ret = [],
		length = obj.length,
		top = [];
	for (var i = 0; i < length; ++i) {
		if (i in obj) {
			var item = obj[i];
			// if (predicate(item, i, obj)) {
			if (evalKernel(predicate, i, obj[i], obj)) {
				if (top.length > 0) {
					ret.push(top);
					top = [];
				}
			} else {
				top.push(item);
			}
		}
	}
	if (top.length > 0) {
		ret.push(top);
	}
	return ret;
}

// function: histo
// Histograms all the data in the array and returns a map going from array elements to
// their counts. Alternatively can return an array of element--count tuples.
function histo(obj, returnTuples) {
	var obj1 = {},
		length = obj.length;
	for (var i = 0; i < length; ++i) {
		if (i in obj) {
			var item = obj[i];
			if (item in obj1) {
				++obj1[item];
			} else {
				obj1[item] = 1;
			}
		}
	}
	if (returnTuples) {
		var ret = [];
		for (var key in obj1) {
			ret.push([key, obj1[key]]);
		}
		return ret;
	} else {
		return obj1;
	}
}

// function: stats
// Computes statistics on array elements
function stats(obj, options) {
	var length = obj.length,
		// See whether we are dealing with flat numbers or nested ones
		first = undefined,
		i;
	for (i = 0; i < length; ++i) {
		if (i in obj) {
			first = obj[i];
			break;
		}
	}
	if (first === undefined) {
		return null;
	}
	if (typeof first == "number") {
		// We're doing flat statistics
		var preStats = {
			sum: 0,
			sum2: 0,
			min: undefined,
			max: undefined,
			n: 0
		};
		for (i = 0; i < length; ++i) {
			if (i in obj) {
				var item = obj[i];
				++preStats.n;
				preStats.sum += item;
				preStats.sum2 += item * item;
				if (preStats.min === undefined || item < preStats.min) {
					preStats.min = item;
				}
				if (preStats.max === undefined || item > preStats.max) {
					preStats.max = item;
				}
			}
		}
		// Now compute actual things
		var stats1 = {
			mean: preStats.sum / preStats.n,
			sum: preStats.sum,
			count: preStats.n,
			min: preStats.min,
			max: preStats.max,
			stddev: Math.sqrt(preStats.sum2 / preStats.n - Math.pow(preStats.sum / preStats.n, 2))
		};
		if (options != null && typeof options == "string") {
			for (var key in stats1) {
				if (options.indexOf(key) == -1) {
					delete stats1[key];
				}
			}
		}
		return stats1;
	} else if (typeof first == "object") {
		// We need to 'stats' each numerical component
		var stats1 = {};
		for (var key in first) {
			if (typeof first[key] == "number") {
				stats1[key] = stats(select(obj, function(item) { return item[key]; }), options);
			}
		}
		return stats1;
	} else {
		throw "Exception: Cannot 'stats' obj array";
	}
}

// function: shuffle
// Shuffles the elements of the array, with an optional style argument. Returns 'this'.
// 
// parameters:
//   style - (Opt.) A string argument that can be one of the following:
//      'random' - (Default) For each position in the array, performs a swap with a random
//         position.
//      'in' - Performs an 'in shuffle', achieving the order '[0,2,4,...,1,3,5,...]'.
//      'out' - Performs an 'out shuffle', achieving the order '[1,3,5,...,0,2,4,...]'.
function shuffle(obj, style) {
	var length = obj.length,
		j,
		temp,
		outShuffle;
	if (style == null || style == "random") {
		for (var i = 0; i < length; ++i) {
			if ((j = Math.floor(Math.random() * length)) != i) {
				temp = obj[i];
				obj[i] = obj[j];
				obj[j] = temp;
			}
		}
	} else if ((outShuffle = style == "out") || style == "in") {
		// Does an in-place in- or out-shuffle
		// 'len2' is the index where the source parity of output elements changes
		var len2 = outShuffle ? Math.floor((length + 1) / 2) : Math.floor(length / 2),
			// For out-shuffle we start at 1 since the '0 <=> 0' correspondence is already
			// correct by construction.
			i = outShuffle ? 1 : 0,
			repl = undefined,
			correct = makeArray([length], false);
		if (outShuffle) {
			correct[0] = true;
		}
		while (i < length) {
			if (correct[i]) {
				++i;
				repl = undefined;
			} else {
				// Fill 'i' with its correct element, and save its refugee
				temp = obj[i];
				if (repl === undefined) {
					// Must calculate the position 'j' of the replacement value for 'i'
					j = outShuffle
						? (i < len2 ? i * 2 : 1 + (i - len2) * 2)
						: (i < len2 ? 1 + i * 2 : (i - len2) * 2);
					obj[i] = obj[j];
				} else {
					// We were given a replacement value to use in the last loop, so we
					// don't have to calculate the 'j' where it came from; just use it.
					obj[i] = repl;
				}
				correct[i] = true;
				// Now we have to put 'i'`s refugee element where it belongs
				j = outShuffle
					? (i % 2 == 0 ? i / 2 : len2 + (i - 1) / 2)
					: (i % 2 == 0 ? len2 + i / 2 : (i - 1) / 2);
				repl = temp;
				i = j;
			}
		}
	} else {
		throw "Exception: Un-understood style: '" + style + "'";
	}
	return obj;
}

// function: flatten
// Returns a flat array with all of the non-'Array' elements of the original array 
// condensed into a single linear vector.
function flatten(obj) {
	var ret = [];
	// function: kernel
	// A kernel function which loops over a single vector
	function kernel(vec) {
		for (var i = 0; i < vec.length; ++i) {
			var item = vec[i];
			if (item instanceof Array) {
				kernel(item);
			} else {
				ret.push(item);
			}
		}
	}
	kernel(obj);
	return ret;
}

// function: countMat
// Generate a hierarchical counting matrix using the radices of the vector. The first
// elements are the highest-order indices, and the counts go up to the 'i'th value minus
// one. An example is '[2, 2].countMat()', which returns a four-element vector with two-
// element sub-vectors: '[[0,0], [0,1], [1,0], [1,1]]'. If a radix is fractional and less
// than one, the iteration will instead run over those fractional values up to one
// (inclusive), e.g., '0.3333 => [0.0 0.33333 0.66667 1.0]'.
// 
// parameters:
//   kernel - An optional kernel method to feed with permutation vectors and iteration
//      indices (called as '(perms, ix)') as each is constructed instead of building the
//      entire return array. A return of 'true' from the kernel terminates execution. Also
//      in this mode, the method returns the total number of permutations visited.
function countMat(obj, kernel) {
	var len = obj.length;
	return ({
		// The permutation index number
		ix: 0,
		// All the results that we're building
		ret: [],
		// The temporary result we're building
		temp: [],
		// Runs the iteration on the 'i'th thing
		iter: function(i) {
			if (i < len) {
				// Isolate what bound and increment to use
				var radix = obj[i],
					bound = radix >= 1.0 ? radix - 1e-10 : 1.0,
					inc = radix >= 1.0 ? 1.0 : radix,
					res,
					subRet;
				for (var value = 0; value <= bound; value += inc) {
					this.temp[i] = value;
					if (i >= len - 1) {
						res = this.temp.slice(0);
						if (kernel != null) {
							if (kernel(res, this.ix) === true) {
								// Use a return of 'undefined' to mean early exit
								return;
							}
						} else {
							this.ret.push(res);
						}
						++this.ix;
					} else {
						subRet = this.iter(i + 1);
						if (kernel != null && subRet === undefined) {
							// Propagate this early return
							return;
						}
					}
					
				}
			}
			// Return either the temp array or the index based on 'kernel'
			return kernel == null ? this.ret : this.ix;
		}
	}).iter(0);
}

// function: subsets
// Returns all unordered subsets of elements of a certain size from the list. Optionally
// accepts a kernel function to apply to the subset arrays which will use the return of
// that function to collect results instead.
// 
// parameters:
//   ms - If a number, returns all subsets of that size. If an array, returns all subsets
//      for the sizes specified in that array. By default uses all subsets '[1,n]'.
//   kernel - An optional kernel function to apply to intermediate returns
function subsets(obj /*ms, kernel*/) {
	var length = obj.length,
		results = [],
		// The subset sizes to calculate
		ms = null,
		kernel = null;
		// Count of the number of nodes we had to execute for this
	// class: Helper
	// An internal helper class that handles all subsets of a single size 'm'
	function Helper(m) {
		// The intermediate result we're working on
		var _current = [];
		// function: run
		// Does the handling for an index into the list, 'i'
		this.run = function(i) {
			if (i >= length) {
				return;
			}
			// Explore using 'i'
			{
				_current.push(obj[i]);
				if (_current.length == m) {
					var temp = _current.slice(0);
					if (kernel == null || (temp = kernel(temp)) !== undefined) {
						results.push(temp);
					}
				} else {
					// Recurse
					this.run(i + 1);
				}
				_current.pop();
			}
			// Explore not using 'i'
			{
				if (_current.length + (length - (i + 1)) < m) {
					// We couldn't satify 'm' even if we took all the remaining elements,
					// so die.
					return;
				}
				this.run(i + 1);
			}
		}
	}
	var i = 1,
		arg = arguments.length > 1 ? arguments[i] : null;
	if (arg != null && typeof arg != "function") {
		ms = arg;
		arg = arguments[++i];
	} else {
		// Use the default 'ms'
		ms = colon([1,length]);
	}
	if (arg != null && typeof arg == "function") {
		kernel = arg;
	}
	if (typeof ms == "number") {
		new Helper(ms).run(0);
	} else if (ms instanceof Array) {
		for (var i = 0; i < ms.length; ++i) {
			new Helper(ms[i]).run(0);
		}
	} else {
		throw new Error("Bad argument for 'ms': " + ms);
	}
	return results;
}

// function: top
// Return the top element in the array. Throw an exception on out of bounds.
function top(obj) {
	return obj[obj.length - 1];
}

// function: ulam
// Gives what offset from zero the 0-based position 'ix' would be in an Ulam spiral, which starts as:
//   4 <- 3 <- 2    .
//   |         /\   .
//   \/        |    .
//   5    0 -> 1    10
//   |              /\
//   \/             |
//   6 -> 7 -> 8 -> 9
//
// returns: A convenience object of '{ x: {number}, y: {number} }', where 'x' increases to the right,
// and 'y' increases going up (as for plain graphs, not for computer graphics).
function ulam(ix) {
	// Handle the zero case specially
	if (ix == 0) {
		return {
			x: 0,
			y: 0
		};
	}
	// Find which ring it's in, with 'base' being the size of the square where the point lies on
	// the outer perimeter.
	// var base = 3;
	// for (; ix >= base * base; base += 2) ;
	var base = Math.floor((Math.sqrt(ix) - 1) / 2) * 2 + 3,
		// Find the position of the first element, which follows a simple formula
		pos = {
		// Over one for each ring
		x: Math.floor(base / 2),
		// Down one for each ring, with an offset
		y: 1 - Math.floor(base / 2)
	};
	// Make the position relative to the ring, which starts at '(base - 2) ^2'
	ix -= (base - 2) * (base - 2);
	if (ix == 0) {
		// We are at the starting position
		return pos;
	}
	// Go up by at most 'base - 2'
	var step;
	pos.y += (step = Math.min(base - 2, ix));
	if ((ix -= step) == 0) {
		return pos;
	}
	// Go left by at most 'base - 1'
	pos.x -= (step = Math.min(base - 1, ix));
	if ((ix -= step) == 0) {
		return pos;
	}
	// Go down by at most 'base - 1'
	pos.y -= (step = Math.min(base - 1, ix));
	if ((ix -= step) == 0) {
		return pos;
	}
	// And go right by at most 'base'
	pos.x += (step = Math.min(base, ix));
	return pos;
}

// function: find
// Finds the element in an array or the key--value pair in an object that satisfies a predicate that is
// run in a reduction fashion, keeping only one element of the array in memory at a time. 'kernel' is
// called as '(saved, item...)', with 'saved' being the kept array element, and 'item...' representing
// the canonical element arguments of the current element under consideration. The kernel must return
// whether to switch recognition to 'item' (with 'true') or keep 'saved' (with 'false').
// 
// returns:
// {
//   value: {object},		// The retained object value
//   key: {object}			// The key/index we found it at
//   [, ix: {number}]		// The index we found it at (for arrays only)
// }
function find(obj, kernel) {
	var ret = {
		value: undefined
	};
	if (!(obj instanceof Array)) {
		ret.key = undefined;
		for (var key in obj) {
			if (ret.value === undefined || evalKernel(kernel, key, obj[key], obj, { pre: [ret.value] })) {
				ret.value = obj[key];
				ret.key = key;
			}
		}
	} else {
		ret.key = -1;
		ret.ix = -1;
		for (var i = 0; i < obj.length; ++i) {
			if (ret.value === undefined || evalKernel(kernel, i, obj[i], obj, { pre: [ret.value] })) {
				ret.value = obj[i];
				ret.key = i;
				ret.ix = i;
			}
		}
	}
	return ret;
}

// function: max
// Computes the maximum element in 'obj' and its position. When a 'kernel' function is provided, we run
// a preliminary 'select' over the 'obj' to derive comparison values.
//
// returns: 
// Computes the first position of the maximally valued element:
// {
//   value: {object},		// The actual maximum value, possibly derived by the kernel
//   key: {object}			// The index we found it at
//   [, ix: {number}]		// The index we found it at, for arrays only
// }
function max(obj, kernel) {
	return find(kernel != null ? select(obj, kernel) : obj, function(max, item) {
		return item > max;
	});
}

// function: min
// The inverse of 'max'; see its documentation.
function min(obj, kernel) {
	return find(kernel != null ? select(obj, kernel) : obj, function(min, item) {
		return item < min;
	});
}

// function: sort
// Sorts an array with all of the kernels, with backoff performed to do tiebreaking
// 
// returns:
// The sorted array
function sort(obj) {
	var args = arguments;
	if (args.length == 1) {
		// Do the default sort
		obj.sort();
	} else {
		obj.sort(function(a, b) {
			for (var i = 1; i < args.length; ++i) {
				var temp = args[i](a, b);
				if (temp != 0) {
					return temp;
				}
			}
			return 0;
		});
	}
	return obj;
}

// function: sortIxes
// Sorts an array with all of the kernels, with backoff performed to do tiebreaking, and while keeping
// track of the permutation indices.
// 
// returns:
// A convenience object of '{ array: {Array}, ixes: {Array} }', where 'array' contains the sorted array,
// and 'ixes' contains the permutation indices to go from the old, unsorted array to the new one.
function sortIxes(obj) {
	var args = arguments,
		// Build a temporary array wrapping the values so that we can track the permutation indices
		tempArr = select(obj, function(value, ix) {
			return {
				value: value,
				ix: ix
			};
		});
	if (args.length == 1) {
		// Do the default sort
		tempArr.sort(function(a, b) {
			return a.value < b.value ? -1 : (a.value > b.value ? 1 : 0);
		});
	} else {
		tempArr.sort(function(a, b) {
			for (var i = 1; i < args.length; ++i) {
				var temp = args[i](a.value, b.value);
				if (temp != 0) {
					return temp;
				}
			}
			return 0;
		});
	}
	// Split out the sorted values from the permutation indices
	return {
		array: select(tempArr, function(item) { return item.value; }),
		ixes: select(tempArr, function(item) { return item.ix; })
	};
}

// function: pretty
// Return a pretty-printed value, which for numbers means comma separation
function pretty(config) {
    var configObj,
        value = (configObj = typeof config == "object") ? config.value : config;
    if (typeof value == "number") {
        var // The separator for integral values
            integerSep = ",",
            // The separator for decimal values
            decimalSep = " ",
            // The size of our groups
            group = 3;
        if (configObj) {
            // Search for extra options
            integerSep = config.integerSep || config.separator || integerSep;
            decimalSep = config.decimalSep || integerSep;
            group = config.group || group;
        }
        // Stringify it to get started and look for the numbers
        var neg = value < 0;
        value = value.toString();
        var ints = value.match(/^-?(\d+)/),
            decs = value.match(/\.(\d+)$/);
        if (ints != null) {
            var str = ints[1],
                vals = [];
            for (var i = str.length - group; i >= 0; i -= group) {
                vals.push(str.substr(i, group));
            }
            if (i > -group) {
                vals.push(str.substr(0, i + group));
            }
            vals.reverse();
            ints = vals.join(integerSep);
        }
        if (decs != null) {
            var str = decs[1],
                vals = [];
            for (var i = 0; i < str.length; i += group) {
                vals.push(str.substring(i, Math.min(i + group, str.length)));
            }
            decs = vals.join(decimalSep);
        }
        return (neg ? "-" : "") + (ints || "0") + (decs != null ? "." + decs : "");
    } else {
        throw new Error("Don't know how to prettify: " + config);
    }
}

module.exports = {
	evalKernel: evalKernel,
	each: each,
	select: select,
	where: where,
	sift: sift,
	replace: replace,
	toArray: toArray,
	kernel: kernel,
	equal: equal,
    clone: clone,
    parse: parse,
    ix: ix,
    singletons: singletons,
    sum: sum,
    prod: prod,
    any: any,
    all: all,
    makeArray: makeArray,
    colon: colon,
    separate: separate,
    histo: histo,
    stats: stats,
    shuffle: shuffle,
    flatten: flatten,
    countMat: countMat,
    subsets: subsets,
    top: top,
	ulam: ulam,
	find: find,
	max: max,
	min: min,
	sort: sort,
	sortIxes: sortIxes,
	pretty: pretty
};


