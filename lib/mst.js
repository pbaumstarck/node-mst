
// An iterator over 'n' dimensions that accepts bounds and a forward or backward direction
//   'bounds': An array of bounds that we iterate over.
function NdimIterator(bounds, arr) {
	var _this = this;
	this.ixes = [];
	var n;
		// usingArr = false, arrs = [];
	if (bounds instanceof Array) {
		this.bounds = bounds;
		n = bounds.length;	
		for (var i = 0; i < n; ++i) {
			this.ixes.push(0);
		}
	// } else if (typeof bounds == "number") {
		// this.bounds = [];
		// n = bounds;
		// for (var i = 0; i < n; ++i) {
			// this.ixes.push(0);
			// this.bounds.push(-1);
			// arrs.push(null);
		// }
		// if (arr == null) {
			// throw "Exception: Cannot conduct a bound-less iteration without an array";
		// }
		// usingArr = true;
	} else {
		throw "Exception: Bad 'NdimIterator' initialization";
	}
	
	// // Gets the next item in the iteration
	// this.get = function() {
		// // Try to get the current item
		// var temp = arr;
		// arrs[0] = temp;
		// for (var i = 0; i < n; ++i) {
			// var ix = _this.ixes[i];
			// if (!(ix in temp)) {
				// // Couldn't get down there, so increment and try next
				// _this.increment();
				// return _this.get();
			// }
			// temp = temp[ix];
			// arrs[i] = temp;
		// }
		// return temp;
	// }
	
	// Return whether our indices are within bounds
	this.inBounds = function() {
		for (var i = 0; i < n; ++i) {
			if (_this.ixes[i] >= _this.bounds[i]) {
				return false;
			}
		}
		return true;
	}
	// Increments us and returns whether we are within bounds
	this.increment = function() {
		++_this.ixes[n - 1];
		// if (usingArr) {
			// for (var i = n - 1; i > 0; --i) {
				// if (_this.ixes[i] >= arrs[i].length) {
					// // Reset this and backtrack
					// _this.ixes[i] = 0;
					// ++_this.ixes[i - 1];
				// } else {
					// // In bounds break;
				// }
			// }
			// return i > 0 || _this.ixes[0] < arrs[0].length;
		// } else {
			for (var i = n - 1; i > 0; --i) {
				if (_this.ixes[i] >= _this.bounds[i]) {
					// Reset this and backtrack
					_this.ixes[i] = 0;
					++_this.ixes[i - 1];
				} else {
					// In bounds
					break;
				}
			}
			return i > 0 || _this.ixes[0] < _this.bounds[0];
		// }
	}
}

if (!Array.prototype.ix) {
	// An array indexer that accepts negative indices and vector indices. Works as Matlab, where a call of
	// '([1, 2], [3, 4])' will select a sub-matrix of the rows '[1,2]' by the columns '[3, 4]'.
	Array.prototype.ix = function() {
		var n = arguments.length,
			anyArray = false;
		// Check if we have any 'Array' arguments, which means we return an 'Array'
		for (var i = 0; i < n; ++i) {
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
			for (var i = 0; i < n; ++i) {
				var arg = arguments[i];
				bounds.push(arg instanceof Array ? arg.length : 1);
			}
			var ret = [],
				control = new NdimIterator(bounds);
			while (control.inBounds()) {
				// Add an element to the return by following the index chain
				var arr = ret, // To insert returns
					temp = this; // To get the value
				for (var i = 0; i < n; ++i) {
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
			for (var i = 0; i < n; ++i) {
				var arg = arguments[i];
				ret = ret[arg < 0 ? ret.length + arg : arg];
			}
			return ret;
		}
	}
}

if (!Array.prototype.select) {
	// Applies a callback to each element of an array with the arguments '(item, index)' and returns an array
	// of the return values. If the predicate returns 'undefined', the value is skipped.
	Array.prototype.select = function(predicate) {
		if (predicate == null) {
			throw "Missing predicate in 'select' method";
		}
		var length = this.length, ret = [], obj;
		for (var i = 0; i < length; ++i) {
			if (i in this && (obj = predicate(this[i], i)) !== undefined) {
				ret.push(obj);
			}
		}
		return ret;
	}
}

if (!Array.prototype.where) {
	// Returns a sub-array for which the predicate function returns 'true' when called with '(item, index)'.
	Array.prototype.where = function(predicate) {
		var length = this.length, ret = [];
		for (var i = 0; i < length; ++i) {
			var item;
			if (i in this && predicate(item = this[i], i) === true) {
				ret.push(item);
			}
		}
		return ret;
	}
}

if (!Array.prototype.each) {
	// Runs a callback over every element of the array and returns the last index that was used in the traversal.
	// Optionally accepts a start index (inclusive), a stop index (exclusive), and a 'reverse' argument to do a
	// backwards traversal. Example calls:
	//   '(callback)': Accepts a callback function which is called with '(item, index)' arguments.
	//   '(startIx, callback)': Accepts a start index (that accepts negatives, e.g., '-1' means to
	//      start from the last element.
	//   '(startIx, endIx, callback)': Runs from '[start, stop)'
	//   '("reverse", callback)': Runs in the reverse direction, but still from '[start, stop)'.
	Array.prototype.each = function() {
		if (arguments.length == 0) {
			return undefined;
		}
	    var args = [];
		Array.prototype.push.apply(args, arguments);
		var reverse = false,
			start = 0,
			length = this.length,
			stop = length,
			arg = args.shift();
		if (typeof arg == "string") {
			if (arg == "reverse") {
				reverse = true;
			} else {
				throw "Bad string argument '" + arg + "'";
			}
			arg = args.shift();
		}
		if (typeof arg == "number") {
			start = arg;
			while (start < 0) {
				start += length;
			}
			arg = args.shift();
		}
		if (typeof arg == "number") {
			stop = arg;
			while (stop < 0) {
				stop += length;
			}
			arg = args.shift();
		}
		if (typeof arg != "function") {
			throw "Missing kernel in 'each' call";
		}
		var predicate = arg,
			i = -1;
		if (reverse) {
			for (i = stop - 1; i >= start; --i) {
				if (i in this && predicate(this[i], i) === true) {
					break;
				}
			}
		} else {
			for (i = start; i < stop; ++i) {
				if (i in this && predicate(this[i], i) === true) {
					break;
				}
			}
		}
		return i;
	}
}

if (!Array.prototype.singleton) {
	// An iterator which calls a callback for every non-'Array' element in the multi-dimensional array. The callback
	// is called with the parameters '(value, ix1, ix2, ..., ix{n}, arr1, arr2, ..., arr{n-1})' for however many
	// indices deep the item was, and with every wrapping array returned. A return of 'true' executes a break. The
	// function returns the number of elements visited.
	Array.prototype.singleton = function(predicate) {
		var control = {
			arrs: [this],
			ixes: [0],
			bounds: [this.length],
			// Get the current or next item
			get: function() {
				var i = this.arrs.length - 1;
				if (i < 0) {
					return undefined;
				}
				var temp = this.arrs[i];
				var ix = this.ixes[i];
				if (ix >= this.bounds[i]) {
					return this.increment();
				}
				while ((temp = temp[ix]) != null && temp instanceof Array) {
					if (temp.length == 0) {
						return this.increment();
					}
					this.ixes.push(ix = 0);
					this.bounds.push(temp.length);
					this.arrs.push(temp);
				}
				// 'temp' was not an array, so return it as a value
				return temp;
			},
			// Increment our indices and get the next item
			increment: function() {
				var i = this.arrs.length - 1, ix;
				if (i < 0) {
					return undefined;
				}
				if ((ix = ++this.ixes[i]) >= this.bounds[i]) {
					this.ixes.pop();
					this.bounds.pop();
					this.arrs.pop();
					return this.increment();
				}
				return this.arrs[i][ix];
			}
			// toString: function() {
				// var str = "(ixes: " + this.ixes.join() + "; bounds: " + this.bounds.join() + "; value: " + this.get() + ")";
				// return str;
			// }
		};
		var item, total = 0;
		while ((item = control.get()) !== undefined) {
			// console.log(control.toString());
			var subArgs = [item].concat(control.ixes, control.arrs);
			++total;
			if (predicate != null && predicate.apply(null, subArgs) === true) {
				break;
			}
			control.increment();
		}
		return total;
	}
}

if (!Array.prototype.makeArray) {
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
}

if (!Array.prototype.colon) {
	// Adds a Matlab-style colon operator to arrays. For a two-element array, '[a, b]', returns an array
	// composed of the elements in the range '[start, end]' (so Matlab 'a : b'). For a three-element array,
	// '[a, b, c]', does Matlab 'a : b : c', and returns an array composed of the elements:
	// 				'{ i : i >= a && i <= c && b | (i - a) }'
	// (Note: 'b | (i - a)' is not read as a 'such that' but as '"b" divides the quantity "i" minus "a"')
	// As a bonus, for a one-element array, '[a]', returns the values in '[0, a)'. 
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
}

module.exports = {
	NdimIterator: NdimIterator,
	plot: require('./plot.js')
};


