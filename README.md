node-mst
========

A general-purpose JavaScript library inspired by LINQ and Matlab, and named after MST3K.

Non-`prototype` Array and Object Traversal
------------------------------------------

The library provides in-order traversal functions like `each`, `select`, and `where` that work on both `Array`s and `Object`s, without altering their `prototype`s:

For arrays, the kernel function accepts arguments of `(element, index, array)`, since having an index is often un-necessary:

```javascript
	var $$ = require('mst');
	
	$$.each([1, 2, 3], function(elem) {
		console.log(elem);
	});
	// 1
	// 2
	// 3
	$$.each([-1, -2, -3], function(elem, ix) {
		console.log(ix + ": " + elem);
	});
	// 0: -1
	// 1: -2
	// 2: -3
```

### `each`

`each` will visit all items in order, will break on a `return true;`, and return the last value of the iterator variable. It works for objects, too, and the kernel function is optional, so a fast way to find out the number of key&ndash;value pairs in an object is this:

```javascript
	var $$ = require('mst');
	
	var obj = {
		foo: 1,
		bar: 4,
		moo: 9
	};
	console.log($$.each(obj));
	// 3
	console.log($$.each(obj, function(key, value) {
		return key == "bar";
	}));
	// 1
```

### `select`

`select` will visit each element in the array/object and return a new array/object composed of the return values from the kernel. `undefined` returns are ignored:

```javascript
	var $$ = require('mst');
	
	var arr = [1, 2, 3, 4];
	console.log($$.select(arr, function(value) { return -value * value; }));
	// [-1, -4, -9, -16];
	
	var obj = {
		one: 1,
		two: 2,
		three: 3,
		four: 4
	};
	console.log($$.select(obj, function(key, value) {
		var ret = {};
		ret["-" + key + "*" + key] = -value * value;
		return ret;
	}));
	// { '-one*one': -1,
  	//   '-two*two': -4,
  	//   '-three*three': -9,
  	//   '-four*four': -16 }
```

### `where`

`where` will return a new array/object where only the elements that returned `true` from the kernel will be retained:

```javascript
	var $$ = require('mst');
	
	var arr = [1, -1, 2, -2, 3, -3];
	console.log($$.where(arr, function(value) { return value < 0; }));
	// [-1, -2, -3]
```


Easy Utility Functions
----------------------

Test whether any two objects are deeply equal with `equal`:

```javascript
	var $$ = require('mst');
	
	var obj1 = {
		foo: {
			bar: 1,
			moo: [1, 2, 3]
		},
		zoo: 16
	},
		obj2 = {
		zoo: 16,
		foo: {
			bar: 1,
			moo: [1, 2, 3]
		}
	};
	console.log($$.equal(obj1, obj2));
	// true
```

Perform a deep copy of any object using `clone`:

```javascript
	var $$ = require('mst');
	
	var obj = {
		foo: {
			bar: 1,
			moo: [1, 2, 3]
		},
		zoo: 16
	};
	var clone = $$.clone(obj);
	console.log(clone);
	// { foo: { bar: 1, moo: [ 1, 2, 3 ] }, zoo: 16 }
	console.log(clone == obj);
	// false
	console.log($$.equal(clone, obj));
	// true
	console.log(clone.foo.moo == obj.foo.moo);
	// false
	console.log($$.equal(clone.foo.moo, obj.foo.moo));
	// true
```

Recursively examine any object, with any components, using the `kernel` function:

```javascript
	var $$ = require('mst');
	
	var obj = {
		foo: {
			bar: 1,
			moo: [1, 2, 3]
		},
		zoo: 16
	};
	$$.kernel(obj, function(key, value, parent, parents) {
		var str = "";
		for (var i = 1; i < parents.length; ++i) {
			str += "  ";
		}
		str += key + ": " + value;
		console.log(str);
	});
	// foo: [object Object]
  	//   bar: 1
  	//   moo: 1,2,3
    	//     0: 1
    	//     1: 2
    	//     2: 3
	//   zoo: 16
	
	// Find any '3's in any value position, anywhere
	var anyThrees = false;
	$$.kernel(obj, function(key, value) { anyThrees |= value == 3; });
	console.log(anyThrees ? "true" : "false");
	// true
```
