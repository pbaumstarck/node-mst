
var $$ = require('./functions.js');

// class: Interpolator
// A robust interpolator, currently supporting linear values
function Interpolator() {
	var _this = this,
		// The points we have been given, sorted by 'x' value
		_points = [];
	
	
	// function: _ctor
	// Our entry point function
	function _ctor() {
	}
	
	
	// function: getPoints
	// A public accessor to our points which lets us examine them
	_this.getPoints = function() { return _points.slice(); }
	
	
	// function: addPoints
	// Add all the points from the arguments, interpreted as convenience objects of:
	// {
	//   x: {number} - The 'x' value this stands for
	//   y: {number} - The 'y' value we should output there
	//   "y-": {number} - (Optional) The 'y' value to use when interpolating from the left
	//   "y+": {number} - (Optional) The 'y' value to use when interpolating from the right
	// }
	_this.addPoints = function() {
		// A kernel function for processing a point
		function kernel(point) {
			if (point.x == null || point.y == null) {
				throw new Error("Missing essential 'x' or 'y' parameters for point");
			}
			_points.push(point);
		}
		for (var i = 0; i < arguments.length; ++i) {
			var arg = arguments[i];
			if (arg instanceof Array) {
				$$.each(arg, kernel);
			} else {
				kernel(arg);
			}
		}
		// Always sort by 'x'
		_points.sort(function(a, b) {
			return a.x - b.x;
		});
		// Look for any 'x' collisions
		var redundantX;
		if ($$.any(_points, function(point, i) { return i > 0 && (redundantX = point.x) == _points[i - 1].x; })) {
			throw new Error("Redundant 'x' value detected: " + redundantX);
		}
	}
	
	
	// function: _getValue
	// Get a single interpolated value for a given 'x'
	function _getValue(x) {
		// console.log("get value: " + x);
		// console.log("points:");
		// console.log(_points);
		// Find the left and right boundary points for this 'x'
		var left = null,
			right = null,
			i;
		for (i = 0; i < _points.length; ++i) {
			if (x < _points[i].x) {
				// Too much
				break;
			} else {
				left = _points[i];
			}
		}
		if (left == null) {
			for (var i = _points.length - 1; i >= 0; --i) {
				if (x > _points[i].x) {
					// Too much
					break;
				} else {
					right = _points[i];
				}
			}
		} else {
			right = i < _points.length ? _points[i] : null;
		}
		// console.log("left: ");
		// console.log(left);
		// console.log("right: ");
		// console.log(right);
		if (left == null) {
			if (right == null) {
				return undefined;
			} else {
				// It's in the far left
				if (x == right.x) {
					return right.y;
				} else if (right["y-"] != null) {
					return right["y-"];
				} else {
					return right.y;
				}
			}
		} else {
			if (right == null) {
				// It's in the far right
				if (x == left.x) {
					return left.y;
				} else if (left["y+"] != null) {
					return left["y+"];
				} else {
					return left.y;
				}
			} else {
				if (x == left.x) {
					return left.y;
				} else if (x == right.x) {
					return right.y;
				} else {
					// Linearly interpolate
					var alpha = (x - left.x) / (right.x - left.x),
						leftValue = left["y+"] == null ? left.y : left["y+"],
						rightValue = right["y-"] == null ? right.y : right["y-"];
					// console.log("alpha: " + alpha + ", left value: " + leftValue + ", right value: " + rightValue);
					return leftValue * (1 - alpha) + rightValue * alpha;
				}
			}
		}
	}
	
	// function: getValue
	// An alias to 'getValues'
	_this.getValue = function() {
		return _this.getValues.apply(_this, arguments);
	}
	
	// function: getValues
	// For all the values in the arguments, returns the interpolated values. Multiple arguments mean an
	// array is returned; array arguments mean a nested array is returned, etc.
	_this.getValues = function() {
		// Clone the arguments, then kernel to get all the numbers and replace them with interpolated values
		var args = $$.clone(Array.prototype.slice.apply(arguments));
		$$.kernel(args, function(key, value, parent) {
			if (typeof value == "number") {
				parent[key] = _getValue(value);
			}
		});
		if (arguments.length == 1 && typeof arguments[0] == "number") {
			// Just return a singleton, not an array
			return args[0];
		} else {
			return args;
		}
	}
	
	
	// function: clear
	// Clears all the points in the interpolator
	_this.clear = function() {
		_points = [];
	}
	
	
	_ctor();
}

if (typeof module != "undefined" && module != null) {
	module.exports = Interpolator;
}

