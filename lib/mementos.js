
// Converts an object to a memento
//   'memType': The class name to attach to the memento as the 'memType' field
function toMemento(obj, memType) {
	if (obj == null) {
		return obj;
	} else if (obj instanceof Array) {
		var ret = [],
			length = obj.length;
		for (var i = 0; i < length; ++i) {
			if (i in obj) {
				var item = obj[i];
				if (item != null && typeof item == "function") {
					// Ignore
				} else {
					ret.push(toMemento(item));
				}
			}
		}
		return ret;
	} else if (typeof obj == "object") {
		if (memType == null && 'toMemento' in obj && typeof obj.toMemento == "function") {
			// We don't have an identity for the object, and it has its own 'toMemento', so call that
			return obj.toMemento();
		} else {
			var ret = {};
			if (memType != null) {
				ret.memType = memType;
			}
			for (var key in obj) {
				var item = obj[key];
				if (item != null && typeof item == "function") {
					// Ignore
				} else {
					ret[key] = toMemento(item);
				}
			}
			return ret;
		}
	} else if (typeof obj == "function") {
		// Ignore it
		return undefined;
	} else {
		// It must be a literal value
		return obj;
	}
}

// Whether something is a memento of the given 'memType'. If it is a memento of a different type, an exception is thrown.
function isMemento(memento, memType) {
	if (memento != null && typeof memento == "object" && 'memType' in memento) {
		if (memento.memType != memType) {
			throw "Exception: Bad '" + memType + "' memento";
		}
		return true;
	} else {
		return false;
	}
}

// Return an object instantiated from a memento
//   'ctorMap': An explicit constructor to call with the memento. If null, 'eval' will be used with 'memType' to
//      instantiate an object. Can also be a map from 'memType's to functions.
function fromMemento(obj, ctorMap) {
	if (obj == null) {
		return obj;
	} else if (obj instanceof Array) {
		var ret = [],
			length = obj.length;
		for (var i = 0; i < length; ++i) {
			if (i in obj) {
				ret.push(fromMemento(obj[i], ctorMap));
			}
		}
		return ret;
	} else if (typeof obj == "object") {
		if (ctorMap != null) {
			if (typeof ctorMap == "function") {
				// Call this with the memento
				return ctorMap(obj);
			} else if (typeof ctorMap == "object" && obj.memType in ctorMap) {
				return ctorMap[obj.memType](obj);
			}
		}
		if ('memType' in obj) {
			// It's a memento, but we didn't get a constructor, so check the global registry
			console.log(mementosMap);
			console.log("memType: " + obj.memType);
			if (obj.memType in mementosMap) {
				return mementosMap[obj.memType](obj);
			} else {
				// We're completely in the dark, so just 'eval' on the 'new' operator
				return eval("new " + obj.memType + "(obj)");
			}
		} else {
			// It's just a map, so map it
			var ret = {};
			for (var key in obj) {
				ret[key] = fromMemento(obj[key], ctorMap);
			}
			return ret;
		}
	} else if (typeof obj == "function") {
		return undefined;
	} else {
		// It must be a literal value
		return obj;
	}
}

// A map going from memento 'memType's to constructor callbacks
var mementosMap = {};
// Register a callback with a memento type. Collisions produce overwrites.
function registerMemento(memType, callback) {
	mementosMap[memType] = callback;
	console.log(mementosMap);
}

// Fill an instantiated object with all the members from the memento, de-memento-ized. Returns the object.
function siphonMemento(obj, memento) {
	for (var key in memento) {
		console.log("Siphoning: " + key);
		obj[key] = fromMemento(memento[key]);
	}
	return obj;
}

module.exports = {
	toMemento: toMemento,
	isMemento: isMemento,
	fromMemento: fromMemento,
	siphonMemento: siphonMemento,
	registerMemento: registerMemento
};


