
var NdimIterator = require('./NdimIterator.js');

// An array indexer that accepts negative indices and vector indices. Works as Matlab, where a call of
// '([1, 2], [3, 4])' will select a sub-matrix of the rows '[1,2]' by the columns '[3, 4]'.
Array.prototype.ix = function() {
	var n = arguments.length,
		anyArray = false,
		i;
	// Check if we have any 'Array' arguments, which means we return an 'Array'
	for (i = 0; i < n; ++i) {
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
		for (i = 0; i < n; ++i) {
			var arg = arguments[i];
			bounds.push(arg instanceof Array ? arg.length : 1);
		}
		var ret = [],
			control = new NdimIterator(bounds);
		while (control.inBounds()) {
			// Add an element to the return by following the index chain
			var arr = ret, // To insert returns
				temp = this; // To get the value
			for (i = 0; i < n; ++i) {
				// Make sure this element of 'arr' exists, and get it
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
		var ret = this;
		for (i = 0; i < n; ++i) {
			var arg = arguments[i];
			ret = ret[arg < 0 ? ret.length + arg : arg];
		}
		return ret;
	}
}

// Applies a callback to each element of an array with the arguments '(item, index)' and returns an array
// of the return values. If the predicate returns 'undefined', the value is skipped and no element is pushed
// to the return array. The arguments are all optional.
//   'style' (opt): When 'reverse' specifies the iteration runs in the reverse order.
//   'start' (opt): An optional start index that supports negative values.
//   'length' (opt): An optional length that supports negative values.
//   'predicate' (opt): If undefined, all values are returned.
Array.prototype.select = function(/*style, start, length, predicate*/) {
	var thisLength = this.length,
		ret = [],
		i = 0,
		style = null,
		start = 0,
		length = thisLength,
		predicate = null,
		arg,
		end;
	if (arguments.length > 0) {
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
			predicate = arg;
		}
	}
	if (style == null) {
		// A regular traversal
		end = Math.min(thisLength, start + length);
		for (i = start; i < end; ++i) {
			if (i in this) {
				if (predicate == null) {
					ret.push(this[i]);
				} else if ((obj = predicate(this[i], i)) !== undefined) {
					ret.push(obj);
				}
			}
		}
	} else if (style == "reverse") {
		// A reverse iteration
		end = Math.max(-1, start - length);
		for (i = start; i > end; --i) {
			if (i in this) {
				if (predicate == null) {
					ret.push(this[i]);
				} else if ((obj = predicate(this[i], i)) !== undefined) {
					ret.push(obj);
				}
			}
		}
	} else {
		throw "Exception: 'select' called with un-understood style: " + style;
	}
	return ret;
}

// Returns the array of elements for which the predicate returned 'true' when called with '(item, index)'.
//   'style' (opt): When 'ixes' makes the return a convenience object of '{ items: {Array}, ixes: {Array} }',
//      where 'items' will hold the actual values that passed and 'ixes' will hold their positions in the
//      original array.
//   'predicate': The required predicate to return 'true' or not for all elements.
Array.prototype.where = function(/*style, predicate*/) {
	var length = this.length,
		ret,
		style = null,
		predicate,
		item,
		i = 0,
		arg;
	if (arguments.length > 0) {
		arg = arguments[i++];
		if (typeof arg == "string" || typeof arg == "object") {
			style = arg;
			arg = arguments[i++];
		}
		if (typeof arg == "function") {
			predicate = arg;
		}
	}
	if (style == "ixes") {
		ret = {
			items: [],
			ixes: []
		};
		for (i = 0; i < length; ++i) {
			if (i in this && predicate(item = this[i], i) === true) {
				ret.items.push(item);
				ret.ixes.push(i);
			}
		}
	} else if (style == null) {
		ret = [];
		for (i = 0; i < length; ++i) {
			if (i in this && predicate(item = this[i], i) === true) {
				ret.push(item);
			}
		}
	} else {
		throw "Exception: 'where' called with un-understood style: " + style;
	}
	return ret;
}

// Returns a convenience object that maps predicate return values (when called with '(item, index)') to
// arrays of the elements that returned those values from the original array. E.g., for a standard
// boolean-returning predicate, this will return an object of '{ true: {Array}, false: {Array} }',
// separating the elements into those which returned 'true' and 'false' under 'predicate', respectively.
//   'style' (opt): When 'ixes' turns the above-mentioned 'Array's into convenience objects of
//      '{ items: {Array}, ixes: {Array} }', where 'items' will hold the actual values that passed and
//      'ixes' will hold their positions in the original array.
Array.prototype.sift = function(/*style, predicate*/) {
	var length = this.length,
		style = null,
		predicate,
		ret = {},
		item,
		i = 0,
		key,
		arg;
	if (arguments.length > 0) {
		arg = arguments[i++];
		if (typeof arg == "string" || typeof arg == "object") {
			style = arg;
			arg = arguments[i++];
		}
		if (typeof arg == "function") {
			predicate = arg;
		}
	}
	if (predicate == null) {
		throw "Exception: 'sift' called without a predicate";
	}
	if (style == "ixes") {
		for (i = 0; i < length; ++i) {
			if (i in this) {
				key = predicate(item = this[i], i);
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
			if (i in this) {
				key = predicate(item = this[i], i);
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

// Runs a kernel function over every element of the array and returns the last index that was used
// in the traversal. A return of 'true' initiates a break.
//   'style' (opt): When 'reverse' runs the iteration in the reverse direction over '[start, stop)'.
//   'start' (opt): A start index that accepts negative numbers.
//   'end' (opt):  An exclusive stop index that accepts negative numbers.
//   'kernel': The kernel that is applied to each element. A return of 'true' causes a break. 
Array.prototype.each = function(/*style, start, end, kernel*/) {
	var style = null,
		start = 0,
		len = this.length,
		end = len,
		kernel,
		arg,
		i = 0;
	if (arguments.length > 0) {
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
			kernel = arg;
		}
	}
	if (kernel == null) {
		throw "Exception: 'each' called without a kernel function";
	}
	if (style == "reverse") {
		for (i = start; i > end; --i) {
			if (i in this && kernel(this[i], i) === true) {
				break;
			}
		}
	} else if (style == null) {
		for (i = start; i < end; ++i) {
			if (i in this && kernel(this[i], i) === true) {
				break;
			}
		}
	} else {
		throw "Exception: 'each' called with un-understood style: " + style;
	}
	return i;
}

// An iterator which calls a callback for every non-'Array' element in the multi-dimensional array. The callback
// is called with the parameters '(value, ix1, ix2, ..., ix{n}, arr1, arr2, ..., arr{n-1})' for however many
// indices deep the item was, and with every wrapping array returned. A return of 'true' from the callback
// executes a break from that element. The function returns the number of elements visited before termination.
Array.prototype.singletons = function(predicate) {
	var ret = 0,
		// 'value', 'index', 'arr'
		args = [null, null, this];
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
	recurse(this);
	return ret;
}

// Returns the sum of the elements in the array
Array.prototype.sum = function(predicate) {
	if (predicate != null) {
		return this.reduce(function(value, item, i) { return value + predicate(item, i); }, 0);
	} else {
		return this.reduce(function(value, item) { return value + item; }, 0);
	}
}
// Returns the product of the elements in the array
Array.prototype.prod = function(predicate) {
	if (predicate != null) {
		return this.reduce(function(value, item, i) { return value * predicate(item, i); }, 1);
	} else {
		return this.reduce(function(value, item) { return value * item; }, 1);
	}
}
// Return the early exit 'or' of all the elements in the array
Array.prototype.any = function(predicate) {
	var length = this.length;
	if (predicate != null) {
		for (var i = 0; i < length; ++i) {
			if (i in this && predicate(this[i], i)) {
				return true;
			}
		}
	} else {
		for (var i = 0; i < length; ++i) {
			if (i in this && this[i]) {
				return true;
			}
		}
	}
	return false;
}
// Return the early exit 'and' of all the elements in the array
Array.prototype.all = function(predicate) {
	var length = this.length;
	if (predicate != null) {
		for (var i = 0; i < length; ++i) {
			if (i in this && !predicate(this[i], i)) {
				return false;
			}
		}
	} else {
		for (var i = 0; i < length; ++i) {
			if (i in this && !this[i]) {
				return false;
			}
		}
	}
	return true;
}

// Replaces all elements in the array with the return values from the kernel function when called on the
// elements with '(item, index)'. Items that return 'undefined' are removed from the array, and the original
// array reference is returned.
//   'start' (opt): An optional inclusive start index that supports negative numbers.
//   'length' (opt): An optional length parameter that supports negative numbers.
//   'kernel': The kernel function.
Array.prototype.replace = function(/*start, length, kernel*/) {
	var start = 0,
		len = this.length,
		length = len,
		end,
		kernel,
		item,
		i = 0,
		arg;
	if (arguments.length > 0) {
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
			kernel = arg;
		}
	}
	end = Math.min(len, start + length);
	for (var i = start; i < end; ++i) {
		if (i in this) {
			if ((item = kernel(this[i], i)) !== undefined) {
				this[i] = item;
			} else {
				// Drop
				this.splice(i, 1);
				--i;
				--len;
			}
		}
	}
	return this;
}

// Uses the array as the bounds to fill out a matrix of 'value', e.g., '[3].makeArray(0)' creates a three-
// element array of zeros, '[3,4].makeArray(1)' creates a three-by-four matrix of ones, etc.. 'value' can
// be a function, in which case it will be called with the '(r)', '(r, c)', etc., indices of the element being
// constructed.
Array.prototype.makeArray = function(value) {
	var ret = [],
		isFunction = typeof value == "function",
		n = this.length;
	var control = new NdimIterator(this);
	while (control.inBounds()) {
		// Add this element to whichever array we need to
		var arr = ret;
		for (var i = 0; i < n - 1; ++i) {
			var ix = control.ixes[i];
			if (!(ix in arr)) {
				arr[ix] = [];
			}
			arr = arr[ix];
		}
		arr[control.ixes[n - 1]] = isFunction ? value.apply(null, control.ixes) : value;
		if (!control.increment()) {
			break;
		}
	}
	return ret;
}

// Adds a Matlab-style colon operator to arrays. For a two-element array, '[a, b]', returns an array
// composed of the elements in the range '[start, end]' (so Matlab 'a : b'). For a three-element array,
// '[a, b, c]', does Matlab 'a : b : c', and returns an array composed of the elements:
// 				'{ i : i >= a && i <= c && b | (i - a) }'
// (Note: 'b | (i - a)' is not read as a 'such that' but as '"b" divides the quantity "i" minus "a"')
// As a bonus, for a one-element array, '[a]', this returns the values in '[0, a)'. 
Array.prototype.colon = function() {
	var length = this.length,
		ret = [];
	switch (length) {
	case 1:
		var a = this[0];
		for (var i = 0; i < a; ++i) {
			ret.push(i);
		}
		break;
	case 2:
		var a = this[0], b = this[1];
		for (var i = a; i <= b; ++i) {
			ret.push(i);
		}
		break;
	case 3:
		var a = this[0], b = this[1], c = this[2];
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

// Split the array based on which items match the predicate. Elements matching the
// predicate are removed, and the return value is an array of sub-arrays holding the
// sets of contiguous elements. Empty arrays are not returned.
Array.prototype.split = function(predicate) {
	if (predicate == null) {
		throw "Exception: 'split' called without a predicate";
	}
	var ret = [],
		length = this.length,
		top = [];
	// Whether we have pushed an empty array to 'ret'
	var pushedEmpty = false;
	for (var i = 0; i < length; ++i) {
		if (i in this) {
			var item = this[i];
			if (predicate(item)) {
				if (/*removeEmptyEntries !== true ||*/ top.length > 0) {
					// if (pushedEmpty && top.length == 0) {
						// // We don't need another empty
					// } else {
						ret.push(top);
						top = [];
						// pushedEmpty = top.length == 0;
					// }
				}
			} else {
				top.push(item);
			}
		}
	}
	if (/*removeEmptyEntries !== true ||*/ top.length > 0) {
		ret.push(top);
	}
	return ret;
}

// Histograms all the data in the array and returns a map going from array elements to
// their counts. Alternatively can return an array of element--count tuples.
Array.prototype.histo = function(returnTuples) {
	var obj = {},
		length = this.length;
	for (var i = 0; i < length; ++i) {
		if (i in this) {
			var item = this[i];
			if (item in obj) {
				++obj[item];
			} else {
				obj[item] = 1;
			}
		}
	}
	if (returnTuples) {
		var ret = [];
		for (var key in obj) {
			ret.push([key, obj[key]]);
		}
		return ret;
	} else {
		return obj;
	}
}

// Computes statistics on array elements
Array.prototype.stats = function(options) {
	var length = this.length,
		// See whether we are dealing with flat numbers or nested ones
		first = undefined,
		i;
	for (i = 0; i < length; ++i) {
		if (i in this) {
			first = this[i];
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
			if (i in this) {
				var item = this[i];
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
		var stats = {
			mean: preStats.sum / preStats.n,
			sum: preStats.sum,
			count: preStats.n,
			min: preStats.min,
			max: preStats.max,
			stddev: Math.sqrt(preStats.sum2 / preStats.n - Math.pow(preStats.sum / preStats.n, 2))
		};
		if (options != null && typeof options == "string") {
			for (var key in stats) {
				if (options.indexOf(key) == -1) {
					delete stats[key];
				}
			}
		}
		return stats;
	} else if (typeof first == "object") {
		// We need to 'stats' each numerical component
		var stats = {};
		for (var key in first) {
			if (typeof first[key] == "number") {
				stats[key] = this.select(function(item) { return item[key]; }).stats(options);
			}
		}
		return stats;
	} else {
		throw "Exception: Cannot 'stats' this array";
	}
}


