
// class: Heap
// A min heap with options for a selector element
// 
// parameters:
//   config - Possibly a function to use a selector for added elements to get the heaping value,
//     or a configuration object of:
//     'selector': The selector function for added elements to get the heaping value
// 
// source: Programming Pearls
function Heap(config) {
	var _this = this,
		// The items of our heap, with the root at the front
		_items = [],
		// The function we use to select comparable values out of heap objects. Nullable.
		_selector = null;
	
	
	// function: _ctor
	// Our constructor/entry point function
	function _ctor() {
		if (config != null) {
			if (typeof config == "function") {
				_selector = config;
			} else if (typeof config == "object") {
				if (config.selector != null) {
					_selector = config.selector;
				}
			}
		}
	}
	
	
	// function: size
	// Public accessor for the number of elements in the heap
	_this.size = function() { return _items.length; }
	
	
	// function: add
	// Adds a single item to the heap
	_this.add = function(item) {
		// A kernel for adding a single item
		function kernel(item1) {
			_items.push({
				value: _selector == null ? item1 : _selector(item1),
				item: item1
			});
			// Sift it up
			_siftUp(_items.length - 1);
		}
		for (var i = 0; i < arguments.length; ++i) {
			kernel(arguments[i]);
		}
	}
	
	// function: _siftUp
	// Sifts up the item at 'ix' to its proper place in the heap
	function _siftUp(ix) {
		var parent;
		while (ix > 0 && (parent = Math.floor((ix - 1) / 2)) >= 0) {
			// See if our value is less than the parent's
			if (_items[ix].value >= _items[parent].value) {
				// We're okay
				break;
			}
			var temp = _items[parent];
			_items[parent] = _items[ix];
			_items[ix] = temp;
			ix = parent;
		}
	}

	// function: _siftDown
	// Sifts down the item at 'ix' to its proper place in the heap
	function _siftDown(ix) {
		while (true) {
			var child1 = 2 * ix + 1,
				child2 = 2 * ix + 2;
			if (child1 >= _items.length) {
				// We're already at the end of the heap
				break;
			}
			// Check if there's another child that's lesser in value than that child
			if (child2 < _items.length && _items[child2].value < _items[child1].value) {
				child1 = child2;
			}
			if (_items[ix].value <= _items[child1].value) {
				// Our place is fine
				break;
			}
			// Our value is greater than our least child, so swap us and recurse
			var temp = _items[ix];
			_items[ix] = _items[child1];
			_items[child1] = temp;
			_siftDown(child1);
			// Examine 'child1' next
			ix = child1;
		}
	}


	// function: peek
	// Return the node at the top of the heap
	_this.peek = function() {
		return _items.length > 0 ? _items[0] : null;
	}


	// function: extract
	// Remove the node at the top of the heap, return it, and re-heap
	_this.extract = function() {
		if (_items.length == 0) {
			return null;
		}
		var ret = _items[0];
		// Put the least element at the top
		_items[0] = _items[_items.length - 1];
		// Chop off the reference
		_items.pop();
		// And sift the new top element down
		_siftDown(0);
		// And return the value they were interested in
		return ret.item;
	}


	_ctor();
}

if (typeof module != "undefined" && module != null) {
	module.exports = Heap;
}


