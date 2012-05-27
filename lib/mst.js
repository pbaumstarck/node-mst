
// Returns whether two objects are identical in the values they contain and types they carry
function equal(obj1, obj2) {
	if (obj1 == null) {
		return obj1 === obj2;// == null;
	}
	var type = typeof obj1;
	if (type != typeof obj2) {
		return false;
	}
	if (obj1 instanceof Array) {
		var len1 = obj1.length;
		if (len1 != obj2.length) {
			return false;
		}
		var _in;
		for (var i = 0; i < len1; ++i) {
			if ((_in = i in obj1) ^ i in obj2) {
				return false;
			} else if (_in) {
				if (!equal(obj1[i], obj2[i])) {
					return false;
				}
			}
		}
		return true;
	} else if (type == "object") {
		var keys = {};
		for (var key in obj1) {
			keys[key] = true;
			if (!(key in obj2) || !equal(obj1[key], obj2[key])) {
				return false;
			}
		}
		for (var key in obj2) {
			if (!(key in keys) && (!(key in obj1) || !equal(obj1[key], obj2[key]))) {
				return false;
			}
		}
		return true;
	} else {
		return obj1 == obj2;
	}
}


// Add the 'Array.prototype' extensions
require('./arrays.js');
// Add direct things
module.exports = {
	NdimIterator: require('./NdimIterator.js'),
	plot: require('./plot.js'),
	equal: equal
};
// Incorporate modules that use their own nested 'module.exports'
['./mementos.js', './strings.js'].each(function(file) {
	var subModule = require(file);
	for (var key in subModule) {
		module.exports[key] = subModule[key];
	}
});


