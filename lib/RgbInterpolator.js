
var $$ = require('./functions.js'),
	Interpolator = require('./Interpolator.js');

// class: RgbInterpolator
// A class that does interpolation between RGB colors
function RgbInterpolator() {
	// Capture the object-level this
	var _this = this,
		// The red, green, and blue interpolators
		_interps = null;
	
	
	// function: _ctor
	// Our constructor/entry point function
	function _ctor() {
		_interps = [new Interpolator(), new Interpolator(), new Interpolator()]
	}
	
	
	// function: _parseColor
	// Parse a color from a string and return its RGB as a three-element vector
	function _parseColor(color) {
		if (color.charAt(0) == "#") {
			color = color.substr(1);
		}
		if (color.length == 3) {
			// 3-character hex
			return [parseInt(color.substr(0, 1), 16),
				parseInt(color.substr(1, 1), 16),
				parseInt(color.substr(2, 1), 16)];
		} else {
			// Assume 6-character hex
			return [parseInt(color.substr(0, 2), 16),
				parseInt(color.substr(2, 2), 16),
				parseInt(color.substr(4, 2), 16)];
		}
	}
	
	// function: addPoints
	// Add convenience objects of '{ x: {number}, y: {string}, ["y-": {string}, ["y+": {string}]] }' to us as interpolation points
	_this.addPoints = function() {
		// A kernel function for processing a point
		function kernel(point) {
			if (point.x == null || point.y == null) {
				throw new Error("Missing essential 'x' or 'y' parameters for point");
			}
			var y = _parseColor(point.y),
				red = {
				x: point.x,
				y: y[0]
			},
				green = {
				x: point.x,
				y: y[1]
			},
				blue = {
				x: point.x,
				y: y[2]
			};
			// console.log(y);
			if (point["y-"] != null) {
				y = _parseColor(point["y-"]);
				// console.log(y);
				red["y-"] = y[0];
				green["y-"] = y[1];
				blue["y-"] = y[2];
			}
			if (point["y+"] != null) {
				y = _parseColor(point["y+"]);
				// console.log(y);
				red["y+"] = y[0];
				green["y+"] = y[1];
				blue["y+"] = y[2];
			}
			_interps[0].addPoints(red);
			_interps[1].addPoints(green);
			_interps[2].addPoints(blue);
		}
		for (var i = 0; i < arguments.length; ++i) {
			var arg = arguments[i];
			if (arg instanceof Array) {
				$$.each(arg, kernel);
			} else {
				kernel(arg);
			}
		}
	}
	
	
	// function: getColor
	// Get the color for the given value
	_this.getColor = function(x) {
		// console.log("red:");
		// console.log(_interps[0].getPoints());
		var rgb = $$.select(_interps, function(interp) { return interp.getValue(x); }),
			temp;
		return "#" + ((temp = Math.round(rgb[0])) < 16 ? "0" : "") + temp.toString(16)
			+ ((temp = Math.round(rgb[1])) < 16 ? "0" : "") + temp.toString(16)
			+ ((temp = Math.round(rgb[2])) < 16 ? "0" : "") + temp.toString(16);
	}
	
	
	_ctor();
}

module.exports = RgbInterpolator;


