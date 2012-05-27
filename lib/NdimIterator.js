
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

module.exports = NdimIterator;


