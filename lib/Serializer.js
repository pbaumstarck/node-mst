
// class: Serializer
// Serializes multi-threaded access to common, callback-based resources, with a thread pool size.
// Also has methods for tracking individual groups of threads and calling one-time callbacks on their completion.
function Serializer(config) {
	var _this = this,
		// The size of our thread pool
		_n = 1,
		// The list of in-flight threads. These are convenience objects of:
		//   {
		//     signal: {object},
		//     callback: {function},
		//     [group: {string}]
		//   }
		_inFlights = [],
		// The list of deferred threads, in the same format as '_inFlights'
		_deferreds = [],
		// The map from group keys to convenience objects of:
		//   {
		//     inFlights: {array}, // The callbacks in flight for this group
		//     finished: {array}, // The callbacks that have completed in the latest run
		//     finish: {function} // The global finishing function to use when resources from this group finish
		//   }
		_groupsMap = {};
	
	
	// function: _ctor
	// Our constructor/entry point function
	function _ctor() {
		if (config != null) {
			if (typeof config == "number") {
				_n = config;
			} else if (typeof config == "object") {
				if (config.n != null) {
					_n = config.n;
				}
			}
		}
		if (_n < 1) {
			throw new Error("Cannot have a thread pool of size less than one");
		}
	}
	
	
	// function: _launch
	// Launches a single thread by calling its callback with a return signal, and adding it to the
	// list of threads in flight. Also handles launching for thread groups.
	function _launch(obj) {
		// Add it to the in-flight callbacks and tell it to proceed, sending it its return 'signal'
		// But first look for a group
		_inFlights.push(obj);
		if (obj.group != null && obj.group in _groupsMap) {
			obj.group.inFlights.push(obj);
		}
		obj.callback(obj.signal);
		return obj.signal;
	}
	
	// funciton: _return
	// Handles a return signal from a thread, removing it from the in-flight list, handling its group
	// and finishing function there, and notifying the next available resource.
	function _return(signal) {
		// First find it in '_inFlights'
		var ix = 0;
		for (; ix < _inFlights.length; ++ix) {
			if (_inFlights[ix].signal == signal) {
				break;
			}
		}
		if (ix >= _inFlights.length) {
			throw new Error("Signal function not found");
		}
		// Remove it
		var obj = _inFlights[ix];
		_inFlights.splice(ix, 1);
		if (obj.group != null && obj.group in _groupsMap) {
			// Next remove it from its group
			var ix1 = 0,
				groupFlights = _groupsMap[obj.group].inFlights;
			for (; ix1 < groupFlights.length; ++ix1) {
				if (groupFlights[ix1] == obj) {
					break;
				}
			}
			if (ix1 < groupFlights.length) {
				// Remove it
				groupFlights.splice(ix1, 1);
				// Save 'obj' as having finished
				var finished = _groupsMap[obj.group].finished;
				finished.push(obj);
				if (groupFlights.length == 0) {
					// Call the 'finish' function with 'finished' and clear that array in the group
					_groupsMap[obj.group].finished = [];
					_groupsMap[obj.group].finish(finished);
				}
			}
		}
		// A resource returned, so try to notify
		_notify();
	}

	// function: _notify
	// Handle when a thread has returned and we need to launch a deferred resource
	function _notify() {
		if (_deferreds.length > 0 && _inFlights.length < _n) {
			_launch(_deferreds.shift());
			// Recurse in case we have multiple free resources
			_notify();
		}
	}
	
	// function: createGroup
	// Creates a unique group key and associates it with a finishing function. Whenever all concurrently
	// scheduled threads from that group finish, the 'finish' function will be called with a list of their
	// objects to perform upkeep.
	_this.createGroup = function(finish) {
		if (finish == null) {
			throw new Error("Cannot create a group without a finishing function");
		}
		var key;
		while ((key = "" + Math.random()) in _groupsMap) ;
		_groupsMap[key] = {
			inFlights: [],
			finished: [],
			finish: finish
		};
	}
	
	// function: attach
	// Attaches a thread to the pool to run over the shared resource. Returns a signal function to use after
	// this thread's occupany is finished, to be called as 'signal'. This function is also sent as the first
	// argument in the provided callback.
	// 
	// parameters:
	//   obj - Can either be a callback, which is called as '(signal)' when a resource is free, or a convenience
	//      object of '{ group: {string}, callback: {function} }', where it is run in a thread group.
	
	_this.attach = function(obj) {
		var signal = function() {
			_return(signal);
		};
		if (typeof obj == "function") {
			obj = {
				callback: obj
			};
		}
		obj.signal = signal;
		if (_deferreds.length == 0 && _inFlights.length < _n) {
			_launch(obj);
		} else {
			_deferreds.push(obj);
		}
		return signal;
	}
	
	
	_ctor();
}

module.exports = Serializer;


