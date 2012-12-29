
// class: Cacher
// Provides cached calculations on an object, tracking its version number and updating cached property values as needed
function Cacher(obj) {
	var _this = this,
		// What version number we're at
		_version = 0,
		// The properties we have set up, indexed by name, with values that are convenience objects of:
		// {
		//   kernel: {function} // The kernel function to run when caching
		//   version: {number} // The version number we were last cached at
		//   value: {*} // The last value that was cached
		// }
		_properties = {};
		
	
	// function: _ctor
	// Our constructor/entry point function
	function _ctor() {
	}
	
	
	// function: addProperty
	// Adds a named property to the cached object, which is automatically updated on dirtying operations
	// 
	// parameters:
	//   name - The name to recall the property by
	//   kernel - The kernel function to calculate the value of the property, taking the latest version of
	//     the object in as '(obj)'.
	_this.addProperty = function(name, kernel) {
		_properties[name] = {
			kernel: kernel,
			version: -1,
			value: undefined
		};
	}
	
	// function: getProperty
	// Gets the latest cached version of a property
	_this.getProperty = function(name) {
		var prop = _properties[name];
		if (prop == null) {
			throw new Error("Property '" + name + "' is undefined");
		}
		if (prop.version < _version) {
			prop.version = _version;
			// Must re-cache the value
			prop.value = prop.kernel(obj);
		}
		return prop.value;
	}

	// function: get
	// Gets the wrapped object with a boolean for whether this has a modifying or non-modifying intent
	_this.get = function(modifying) {
		if (modifying === true) {
			++_version;
		}
		return obj;
	}

	// function: set
	// Sets the value of the wrapped object explicitly
	_this.set = function(value) {
		obj = value;
		++_version;
	}
	
	
	_ctor();
}

if (typeof module != "undefined" && module != null) {
	module.exports = Cacher;
}


