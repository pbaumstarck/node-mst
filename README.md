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

`each` will visit all items in order, will break on a `return true;`, and return the last value of the iterator variable. It works for objects, too, and the kernel function is optional, so a fast way to find out the number of key&dash;value pairs in an object is this:

```javascript
	var $$ = require('mst');
	
	var obj = {
		foo: 1,
		bar: 4,
		moo: 9
	};
	console.log($$.each(obj));
	// 3
```
