
// An iterator over 'n' dimensions that accepts bounds and a forward or backward direction
//   'bounds': If an array, we take this as an array of bounds. If a number, we take it as 'n',
//      and require an accessor to tell us how many elements are in each array.
function NdimIterator(bounds, arr) {
	var _this = this;
	this.ixes = [];
	var n, usingArr = false, arrs = [];
	if (bounds instanceof Array) {
		this.bounds = bounds;
		n = bounds.length;	
		for (var i = 0; i < n; ++i) {
			this.ixes.push(0);
		}
	} else if (typeof bounds == "number") {
		this.bounds = [];
		n = bounds;
		for (var i = 0; i < n; ++i) {
			this.ixes.push(0);
			this.bounds.push(-1);
			arrs.push(null);
		}
		if (arr == null) {
			throw "Exception: Cannot conduct a bound-less iteration without an array";
		}
		usingArr = true;
	} else {
		throw "Exception: Bad 'NdimIterator' initialization";
	}
	
	// Gets the next item in the iteration
	this.get = function() {
		// Try to get the current item
		var temp = arr;
		arrs[0] = temp;
		for (var i = 0; i < n; ++i) {
			var ix = _this.ixes[i];
			if (!(ix in temp)) {
				// Couldn't get down there, so increment and try next
				_this.increment();
				return _this.get();
			}
			temp = temp[ix];
			arrs[i] = temp;
		}
		return temp;
	}
	
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
		if (usingArr) {
			for (var i = n - 1; i > 0; --i) {
				if (_this.ixes[i] >= arrs[i].length) {
					// Reset this and backtrack
					_this.ixes[i] = 0;
					++_this.ixes[i - 1];
				} else {
					// In bounds break;
				}
			}
			return i > 0 || _this.ixes[0] < arrs[0].length;
		} else {
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
		}
	}
}

if (!Array.prototype.ix) {
	// 
	Array.prototype.ix = function() {
	
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
	// reverse traversal. Calls:
	//   '(callback)': Accepts a callback function which is called with '(item, index)' arguments.
	//   '(startIx, callback)': Accepts a start index (that accepts negatives, e.g., '-1' means to
	//      start from the last element.
	//   '(startIx, endIx, callback)': Runs from '[start, stop)'
	//   '("reverse", callback)': Runs in the reverse direction, but still from '[start, stop)'.
	Array.prototype.each = function() {
		if (arguments.length == 0) {
			return undefined;
		}
		var reverse = false,
			start = 0,
			length = this.length,
			stop = length,
			arg = arguments.shift();
		if (typeof arg == "string") {
			if (arg == "reverse") {
				reverse = true;
			} else {
				throw "Bad string argument '" + arg + "'";
			}
			arg = arguments.shift();
		}
		if (typeof arg == "number") {
			start = arg;
			while (start < 0) {
				start += length;
			}
			arg = arguments.shift();
		}
		if (typeof arg == "number") {
			stop = arg;
			while (stop < 0) {
				stop += length;
			}
			arg = arguments.shift();
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
	// element array of zeros, '[3,4].makeArray(1)' creates a three-by-four matrix of ones. 'value' can be a
	// function, in which case it will be called with the '(r)', '(r, c)', etc., indices of the element being
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

module.exports = {
	NdimIterator: NdimIterator
};


