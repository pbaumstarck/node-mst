
var $$ = require('../lib/mst.js'),
	diff = require('diff'),
    assert = require('assert'),
    fs = require('fs');
	log = [];
	base_consoleLog = console.log,
	// Isolate what mode we're using, whither 'view', to show output; 'test', to run against the
	// reference body; or 'overwrite', to overwrite the reference file.
	mode = process.argv.length < 3 ? "test" : process.argv[2];

console.log = function(str) {
	log.push(str);
	if (mode == "view" || mode == "overwrite") {
		base_consoleLog(str);
	}
}

var tests = {
	each: true,
	select: true,
	where: true,
	sift: true,
	replace: true,
	toArray: true,
	kernel: true,
	equal: true,
    clone: true,
	parse: true,
    ix: false,
	// where: true,
	// sift: true,
	// each: true,
	makeArray: true,
	singletons: true,
	// ix: false,
	colon: true,
	separate: true,
	histo: true,
	stats: true,
	aggregates: true,
	// replace: true,
	shuffle: true,
	subsets: true,
	countMat: true,
	ulam: true,
	interp: true,
	max: true,
	min: true,
	evalKernel: true,
	sort: true,
	sortIxes: true,
	trie: true,
	heap: true,
	cacher: true,
	pretty: true
};

var obj = {
	"one": 1,
	"two": 2,
	"three": 3,
	"four": 4
};
if (tests.where) {
	console.log("Testing 'where' ...");
	console.log(obj);
	console.log($$.where(obj, function(key, value) { return value > 2; }));
	console.log($$.where(obj, function(key, value) { return value < 2; }));
	console.log($$.where(obj, function(key, value) { return value <= 2; }));
	console.log(obj);
}

if (tests.select) {
	console.log("Testing 'select' ...");
	console.log(obj);
	console.log($$.select(obj));
	console.log($$.select(obj, function(key, value) { return value * value; }));
	console.log($$.select(obj, function(key, value) {
		var ret = {};
		ret[key] = value;
		ret[key + key] = value * Math.pow(10, Math.ceil(Math.log(value + 0.0000001) / Math.log(10))) + value;
		return ret;
	}));
	console.log($$.select(obj, function(key, value) {
		if (value <= 2) {
			return;
		}
		var ret = {};
		ret[key] = value;
		ret[key + key] = value * 13;
		return ret;
	}));
	console.log(obj);
}

if (tests.each) {
	console.log("Testing 'each' ...");
	console.log(obj);
	console.log($$.each(obj, function(key, value) {}));
	console.log($$.each(obj, function(key, value) { return value == 4; }));
	var str = "";
	console.log($$.each(obj, function(key, value) { str += ", " + value; }) + "> " + str);
	console.log(str);
	console.log($$.each(obj));
	console.log(obj);
}

if (tests.sift) {
	console.log("Testing 'sift' ...");
	console.log($$.sift(obj, function(key, value) { return value > 2; }));
	console.log($$.sift(obj, function(key, value) {
		switch (value) {
		case 1:
			return true;
		case 2:
			return null;
		case 3:
			return undefined;
		case 4:
			return false;
		}
	}));
}

if (tests.toArray) {
	console.log("Testing 'toArray' ...");
	console.log($$.toArray(obj));
	console.log($$.toArray(obj, function(key, value) { return key; }));
	console.log($$.toArray(obj, function(key, value) { return value <= 2 ? undefined : value; }));
	console.log(obj);
}

if (tests.replace) {
	console.log("Testing 'replace' ...");
	console.log(obj);
	console.log($$.replace(obj, function(key, value) { return value * value; }));
	console.log(obj);
	console.log($$.replace(obj, function(key, value) { return value >= 5 ? value : undefined; }));
	console.log(obj);
	console.log($$.replace(obj, function(key, value) { return value != 9 ? value : undefined; }));
	console.log(obj);
}

if (tests.kernel) {
	console.log("Testing 'kernel' ...");
	// A testing callback for the function
	function callback(ix, elem, obj, parents) {
		console.log("  " + ix + " => " + elem + " : " + (typeof obj == "undefined" ? "undefined"
			: (obj instanceof Array ? "Array" : "Object")) + " (" + parents.length + ")");
	}
	console.log($$.kernel(1, callback));
	console.log($$.kernel("66", callback));
	console.log($$.kernel([1,2,9,16,25], callback));
	console.log($$.kernel([1,2,[9,-9],16,[25,-25]], callback));
	var testObj = {
		"a": "foo",
		"b": [1,2,3],
		"c": {
			"dataset": "glarm",
			"Moose": [{
				"Fie!": "Upon't",
				6: "6!"
			}]
		}
	};
	console.log($$.kernel(testObj, callback));
	// Find the first instance of 'd' or 'dataset'
	var d = $$.kernel(testObj, function(key, value) {
		if (key == "d" || key == "dataset") {
			return value;
		}
	});
	console.log("(d|dataset): " + d);
	// Count the number of stub things
	var count = 0,
		// The number of literal values owned by objects
		nObjStubs = 0,
		// The number of literal values owned by arrays
		nArrayStubs = 0;
	$$.kernel(testObj, function(key, value, parent) {
		if (typeof value != "object") {
			++count;
			if (parent instanceof Array) {
				++nArrayStubs;
			} else {
				++nObjStubs;
			}
		}
	});
	console.log("There are " + count + " literal values interred (" + nObjStubs + " for objects, and "
		+ nArrayStubs + " for arrays)");
}

if (tests.equal) {
	console.log("Testing 'equal' ...");
	console.log("F: " + $$.equal(1,2));
	console.log("T: " + $$.equal(1,1));
	console.log("F: " + $$.equal(1,"1"));
	console.log("T: " + $$.equal(1,"1", false));
	console.log("T: " + $$.equal([1,2],[1,2]));
	console.log("F: " + $$.equal([1,2],[1,2,3]));
	console.log("F: " + $$.equal([1,2],[1,"2"]));
	console.log("T: " + $$.equal([1,2],[1,"2"], false));
	console.log("T: " + $$.equal({ a: 2 }, { a: 2 }));
	console.log("F: " + $$.equal({ a: 2 }, { a: "2" }));
	console.log("T: " + $$.equal({ a: 2 }, { a: "2" }, false));
	console.log("F: " + $$.equal({ a: 2, b: 3 }, { a: 2 }));
	console.log("F: " + $$.equal({ a: 2 }, { a: 2, b: 3 }));
}

if (tests.clone) {
	console.log("Testing 'clone' ...");
    console.log("1: " + $$.clone(1));
    console.log("foo: " + $$.clone("foo"));
    console.log("true: " + $$.clone(true));
    var obj1, obj2;
    console.log("[1,foo,true]: " + (obj2 = $$.clone(obj1 = [1,"foo", true])));
    obj1[0]++;
    console.log("  object1: " + obj1);
    console.log("  object2: " + obj2);
    console.log("{foo:1, bar:arr}: ");
    console.log(obj2 = $$.clone(obj1 = { foo: 1, bar: obj1 }));
    obj1.foo++;
    obj1.bar[0]--;
    console.log("  object1: ");
    console.log(obj1);
    console.log("  object2: ");
    console.log(obj2);
}


if (tests.parse) {
	var arr = [
		"as;ldfjka;sdlfja;sdfj asl;dkfja;skldfj;asd",
		"'as;ldfjka;sdlfja;sdfj asl;dkfja;skldfj;asd'",
		'"as;ldfjka;sdlfja;sdfj asl;dkfja;skldfj;asd"',
		"And then 'Big' jumped out and \"Small \\\" came over and \" kicked \' Little \\'Tim \\' Tim \' Jenkins in the shin",
		"'Single'\"Double\"''\"\""
	];
	for (var i = 0; i < arr.length; ++i) {
		var str = arr[i],
			parse = $$.parse(str);
		console.log(parse);
		console.log("Original: " + str);
		var reconst = parse.reduce(function(value, item) { return value + item.value; }, "");
		console.log("Reconst.: " + reconst);
		if (reconst != str) {
			throw "Bad parse of: " + str + "\n  ==> " + reconst;
		}
	}
	// Test custom delimiters
	arr = [
		"So i have /* which should be a comment */ if that works //   /* end end end ..."
	];
	for (var i = 0; i < arr.length; ++i) {
		var str = arr[i],
			parse = $$.parse(str, { pre: "/*", post: "*/" });
		console.log(parse);
		console.log("Original: " + str);
		var reconst = parse.reduce(function(value, item) { return value + item.value; }, "");
		console.log("Reconst.: " + reconst);
		if (reconst != str) {
			throw "Bad parse of: " + str;
		}
	}
	// Test flattening of delimiters
	console.log($$.parse("so \"Double 'quote'\" and 'single \"quote\"'", ['"', "'"]));
}

if (tests.ix) {
	console.log("Testing 'ix' ...");

	arr = [1, 2, 3, 4];
	for (var i = -5; i < 5; ++i) {
		try {
			console.log(i + ": " + $$.ix(arr, i));
		} catch (error) {
			console.log("ERROR - " + i);
		}
	}
	console.log($$.ix(arr, [1, 2]));
	console.log($$.ix(arr, [-1, -3]));

	arr = [3,4].makeArray(function(i,j) { return 4 * i + j; });
	console.log(arr);
	console.log($$.ix(arr, 1, 2));
	console.log($$.ix(arr, [1, 2], 2));
	console.log($$.ix(arr, [1, 2], [2, 3]));
}

var arr = [1,2,3,4];
if (tests.where) {
	console.log("Testing 'where' ...");
	console.log(arr);
	console.log($$.where(arr, function(item) { return item > 2; }));
	console.log($$.where(arr, function(item) { return item < 2; }));
	console.log($$.where(arr, function(item) { return item <= 2; }));
	console.log($$.where(arr, "ixes", function(item) { return item > 2; }));
}

if (tests.select) {
	console.log("Testing 'select' ...");
	console.log(arr);
	console.log($$.select(arr));
	console.log($$.select(arr, function(item) { return item * item; }));
	console.log($$.select(arr, "reverse", function(item) { return item * item; }));
	console.log($$.select(arr, 2, function(item) { return item * item; }));
	console.log($$.select(arr, 1, 2, function(item) { return item * item; }));
	console.log($$.select(arr, "reverse", 2, function(item) { return item * item; }));
	console.log($$.select(arr, "reverse", 2, 2, function(item) { return item * item; }));
	console.log($$.select(arr, "reverse", -2, function(item) { return item * item; }));
	console.log($$.select(arr, 0, -1, function(item) { return item * item; }));
}

if (tests.sift) {
	console.log("Testing 'sift' ...");
	console.log($$.sift(arr, function(item) { return item > 2; }));
	console.log($$.sift(arr, "ixes", function(item) { return item > 2; }));
	arr = arr.concat(arr);
	console.log($$.sift(arr, function(item) {
		switch (item) {
		case 1:
			return true;
		case 2:
			return null;
		case 3:
			return undefined;
		case 4:
			return false;
		}
	}));
	console.log($$.sift(arr, "ixes", function(item) {
		switch (item) {
		case 1:
			return true;
		case 2:
			return null;
		case 3:
			return undefined;
		case 4:
			return false;
		}
	}));
}

if (tests.each) {
	console.log("Testing 'each' ...");
	console.log(arr);
	console.log($$.each(arr, function(item) {}));
	console.log($$.each(arr, function(item) { return item == 4; }));
	var str = "";
	console.log($$.each(arr, "reverse", function(item) { str += ", " + item; }) + "> " + str);
	str = "";
	console.log($$.each(arr, 3, function(item) { str += ", " + item; }) + "> " + str);
	str = "";
	console.log($$.each(arr, 3, 6, function(item) { str += ", " + item; }) + "> " + str);
	str = "";
	console.log($$.each(arr, "reverse", 6, 3, function(item) { str += ", " + item; }) + "> " + str);
}

if (tests.makeArray) {
	console.log($$.makeArray([3], 0));
	console.log($$.makeArray([3], function(i) { return i; }));
	console.log($$.makeArray([3,3], 0));
	console.log($$.makeArray([3,3], function(i, j) { return i * j; }));
	console.log($$.makeArray([3,3,3], 0));
	var arr = $$.makeArray([3,3,3], function(i, j, k) { return i + ":" + j + ":" + k; });
	console.log(arr);
}

if (tests.singletons) {
	var arr = $$.makeArray([3,3,3], function(i, j, k) { return i + ":" + j + ":" + k; });
	console.log($$.singletons(arr, function(value) {
		console.log(value);
	}));

	arr = [
		1,
		[2, 3, 4],
		[
			[5, 6, 7]
		],
		8,
		null,
		[
			[9, 10, 11],
			[12, 13, 14],
			[15, 16, 17,
				[18, 19, 20]
			]
		],
		[21, 22,
			[23, 24]
		]
	];
	console.log($$.singletons(arr, function(value) {
		var str = value,
			n = (arguments.length - 1) / 2,
			ixes = [];
		var check = arr;
		for (var i = 1; i < arguments.length; ++i) {
			var arg = arguments[i];
			if (ixes.length < n) {
				ixes.push(arg);
				check = check[arg];
			}
			if (arg instanceof Array) {
				str += ", Array";
			} else {
				str += ", " + arguments[i];
			}
		}
		console.log(str + "   " + ixes);
		assert.equal(value, check, "Failed a value check for " + str + " by " + ixes + "(" + value + ", " + check + ")");
	}));
}

if (tests.colon) {
	console.log("Testing 'colon' ...");
	console.log($$.colon([4]));
	console.log($$.colon([1, 5]));
	console.log($$.colon([1, 3, 16]));
	console.log($$.colon([1, -3, 16]));
	console.log($$.colon([1, -3, -16]));
}

if (tests.separate) {
	console.log("Testing 'separate' ...");
	arr = [1,2,3,4,5];
	console.log($$.separate(arr, function(item) { return item == 2; }));
	console.log($$.separate(arr, function(item) { return item > 2; }));
	console.log($$.separate(arr, function(item) { return item >= 2 && item <= 4; }));
	console.log($$.separate(arr, function(item) { return true; }));
	console.log($$.separate(arr, function(item, i) { return i == 2; }));
}

if (tests.histo) {
	console.log("Testing 'histo' ...");
	console.log($$.histo(arr));
	console.log($$.histo(arr, true));
	arr = arr.concat(arr.slice(2));
	console.log($$.histo(arr));
	var str = console.log($$.histo(arr, true));
}

if (tests.stats) {
	console.log("Testing 'stats' ...");
	var arr = [1,2,3,4,5,6,7,8,9,10];
	console.log($$.stats(arr));
	console.log($$.stats(arr, "mean,stddev,count"));
	arr = [1,1,1,1,1,1,2];
	console.log($$.stats(arr));
	arr = $$.select([1,2,3,4,5,6,7,8,9,10], function(item) { return { x: item, y: -item }; });
	console.log(arr);
	console.log($$.stats(arr));
}

if (tests.aggregates) {
	console.log("Testing the aggregates ('sum', 'prod', 'any', etc.) ...");
	var arr = [0,1,2,3,4,5,6,7,8,9,10];
	console.log($$.sum(arr));
	console.log($$.prod(arr));
	console.log($$.prod(arr.slice(1)));
	console.log($$.any(arr));
	console.log($$.any(arr, function(item) { return false; }));
	console.log($$.all(arr));
	console.log($$.all(arr, function(item) { return true; }));
}

if (tests.replace) {
	console.log("Testing 'replace' ...");
	arr = [1,2,3,4,5,6,7,8,9,10];
	console.log(arr);
	console.log($$.replace(arr, function(item) { return item * item; }));
	console.log(arr);
	console.log($$.replace(arr, function(item) { return item >= 30 ? item : undefined; }));
	console.log(arr);
	console.log($$.replace(arr, function(item) { return item != 64 ? item : undefined; }));
	console.log(arr);
	arr = arr.concat(arr);
	console.log($$.replace(arr, 4, function(item) { return -item; }));
	console.log($$.replace(arr, 5, 2, function(item) { return -item; }));
	console.log($$.replace(arr, -5, function(item) { return -item; }));
}

if (tests.shuffle) {
	console.log("Testing 'shuffle' ...");
	// Does a simple, inefficient out shuffle for reference purposes
	function outShuffle(arr) {
		var temp = [],
			length = arr.length;
		for (var i = 0; i < length; i += 2) {
			temp.push(arr[i]);
		}
		for (var i = 1; i < length; i += 2) {
			temp.push(arr[i]);
		}
		arr.splice.apply(arr, [0, length].concat(temp));
		return arr;
	}

	// Does a simple, inefficient in shuffle for reference purposes
	function inShuffle(arr) {
		var temp = [],
			length = arr.length;
		for (var i = 1; i < length; i += 2) {
			temp.push(arr[i]);
		}
		for (var i = 0; i < length; i += 2) {
			temp.push(arr[i]);
		}
		arr.splice.apply(arr, [0, length].concat(temp));
		return arr;
	}

	var tests1 = [
		$$.colon([0,2]),
        $$.colon([0,3]),
		$$.colon([0,9]),
		$$.colon([0,10]),
		$$.colon([0,4000]),
		$$.colon([0,4001])
	],
		// Whether all the tests have passed
		all = true;
	function test(arr) {
		var ref = inShuffle(arr.slice(0)),
			test = $$.shuffle(arr.slice(0), "in");
		if (ref.length != test.length || !$$.all($$.select(ref, function(value, i) { return value == test[i]; }))) {
			console.log("Failed in-shuffle for: " + arr.length);
			all = false;
		}

		ref = outShuffle(arr.slice(0));
		test = $$.shuffle(arr.slice(0), "out");
		if (ref.length != test.length || !$$.all($$.select(ref, function(value, i) { return value == test[i]; }))) {
			console.log("Failed out-shuffle for: " + arr.length);
			all = false;
		}
	}
	$$.each(tests1, function(arr) { test(arr); });
	$$.each($$.colon([2000]), function(i) {
		test($$.colon([0,i]));
		if (i % 100 == 0) {
			console.log("Did " + i + " ...");
		}
	});
	if (!all) {
		console.log("*** Some shuffle tests failed ***");
	} else {
		console.log("All shuffle tests passed.");
	}
}

if (tests.subsets) {
	console.log("Testing 'subsets' ...");
	var arr = ["h1", "h2", "h3", "h4"];
	console.log("All:");
	console.log($$.subsets(arr));
	console.log("1:");
	console.log($$.subsets(arr, [1]));
	console.log("2-3:");
	console.log($$.subsets(arr, [2, 3]));
	console.log("kernel:");
	console.log($$.subsets(arr, function(arr) { return arr.join(","); }));
}

if (tests.countMat) {
	console.log("Testing 'countMat' ...");
	console.log($$.countMat([]));
	console.log($$.countMat([1]));
	console.log($$.countMat([2]));
	console.log($$.countMat([2, 2]));
	console.log($$.countMat([2, 3, 4]));
	console.log($$.countMat([2, 0.33333, 4]));

	var start = Date.now(),
		res1 = $$.countMat($$.makeArray([14], 2)),
		elapsed1 = Date.now() - start;
// 	console.log("Elapsed: " + (Math.round(elapsed1 / 100.0) / 10) + " s");
	start = Date.now();
	var res2 = [],
		fake2 = $$.countMat($$.makeArray([14], 2), function(perms) { res2.push(perms); }),
		elapsed2 = Date.now() - start;
	console.log("# perms: " + fake2);
// 	console.log("Generator: " + (Math.round(elapsed2 / 100.0) / 10) + " s");
// 	console.log(elapsed1 + ", " + elapsed2 + ", " + (Math.max(elapsed1, elapsed2)
// 		/ Math.min(elapsed1, elapsed2)));
	console.log("Within a factor of ten in time?: " + ((Math.max(elapsed1, elapsed2)
		/ Math.min(elapsed1, elapsed2)) <= 10.0 ? "true" : "false"));
	console.log("Equal?: " + $$.equal(res1, res2));
}

if (tests.ulam) {
	console.log("Testing 'ulam' ...");
	// function: plotUlam
	// For a list of 'x,y' positions, plot them visually
	function plotUlam(poses) {
		// Determine the bounds
		var bounds = {
			x: {
				min: 0,
				max: 0
			},
			y: {
				min: 0,
				max: 0
			}
		};
		$$.each(poses, function(pos) {
			if (pos.x < bounds.x.min) {
				bounds.x.min = pos.x;
			}
			if (pos.x > bounds.x.max) {
				bounds.x.max = pos.x;
			}
			if (pos.y < bounds.y.min) {
				bounds.y.min = pos.y;
			}
			if (pos.y > bounds.y.max) {
				bounds.y.max = pos.y;
			}
		});
		var matrix = $$.makeArray([bounds.y.max - bounds.y.min + 1, bounds.x.max - bounds.x.min + 1], " ");
		$$.each(poses, function(pos) {
			var x = pos.x - bounds.x.min,
				y = pos.y - bounds.y.min,
				str = "" + pos.ix;
			if (matrix[y][x] != " ") {
				throw new Error("Over-writing something!");
			}
			matrix[y][x] = str.substr(str.length - 1);
		});
		$$.each(matrix, "reverse", function(line) {
			console.log("    " + line.join(""));
		});
	}

	var poses = [];
	for (var i = 0; i < 100; ++i) {
		var pos = $$.ulam(i);
		pos.ix = i;
		poses.push(pos);
		console.log("  Ulam after position " + i + ":");
		// console.log($$.ulam(i));
		plotUlam(poses);
	}
}

if (tests.interp) {
	console.log("Testing 'Interpolator' ...");
	var interp = new $$.Interpolator();
	interp.addPoints({ x: -2, y: 0 }, { x: 0, y: 0, "y-": -1, "y+": 1 }, { x: 2, y: 0 });
	for (var i = -2.5; i <= 2.5; i += 0.5) {
		if (i == 0) {
			console.log("-0.00001: " + interp.getValue(-0.00001));
		}
		console.log(i + ": " + interp.getValue(i));
		if (i == 0) {
			console.log("0.00001: " + interp.getValue(0.00001));
		}
	}

	var rgb = new $$.RgbInterpolator();
	rgb.addPoints({
		x: -2,
		y: "#ff0000"
	},{
		x: 0,
		"y-": "#550000",
		y: "#555555",
		"y+": "#000055"
	},{
		x: 2,
		y: "#0000ff"
	});
	for (var i = -2.5; i <= 2.5; i += 0.5) {
		if (i == 0) {
			console.log("-0.00001: " + rgb.getColor(-0.00001));
		}
		console.log(i + ": "+ rgb.getColor(i));
		if (i == 0) {
			console.log("0.00001: " + rgb.getColor(0.00001));
		}
	}
}

if (tests.max) {
	console.log("Testing 'max' ...");
	console.log($$.max(null));
	console.log($$.max([]));
	console.log($$.max({}));
	console.log($$.max([1, 2, 3, -1]));
	console.log($$.max([22, 47, -16, -43]));
	console.log($$.max([22, 47, -16, -43], function(elem) { return -elem; }));
	var testObj = {
		foo: 7,
		bar: 19,
		moo: -22
	};
	console.log($$.max(testObj));
	console.log($$.max(testObj, function(elem) { return -elem; }));
}

if (tests.min) {
	console.log("Testing 'min' ...");
	console.log($$.min([1, 2, 3, -1]));
	console.log($$.min([22, 47, -16, -43]));
	console.log($$.min([22, 47, -16, -43], function(elem) { return -elem; }));
	var testObj = {
		foo: 7,
		bar: 19,
		moo: -22
	};
	console.log($$.min(testObj));
	console.log($$.min(testObj, function(elem) { return -elem; }));
}

if (tests.evalKernel) {
	console.log("Testing 'evalKernel' ...");
	var kernel,
		innerKernel = function(args) {
		var str = kernel.length + ": ";
		for (var i = 0; i < args.length; ++i) {
			str += (i > 0 ? ", " : "") + args[i];
		}
		console.log(str);
	}
	for (var i = 0; i < 4; ++i) {
		if (i == 0) {
			kernel = function() { innerKernel(arguments); };
		} else if (i == 1) {
			kernel = function(a) { innerKernel(arguments); };
		} else if (i == 2) {
			kernel = function(a,b) { innerKernel(arguments); };
		} else if (i == 3) {
			kernel = function(a,b,c) { innerKernel(arguments); };
		} else {
			kernel = function(a,b,c,d) { innerKernel(arguments); };
		}
		$$.evalKernel(kernel, "key", "value", {});
		$$.evalKernel(kernel, 0, "value", []);
		$$.evalKernel(kernel, "key", "pre-value", {}, { pre: [-1] });
		$$.evalKernel(kernel, 0, "pre-value", [], { pre: [-1] });
		$$.evalKernel(kernel, "key", "post-value", {}, { post: [100] });
		$$.evalKernel(kernel, 0, "post-value", [], { post: [100] });
		$$.evalKernel(kernel, "key", "pre-post-value", {}, { pre: [-1], post: [100] });
		$$.evalKernel(kernel, 0, "pre-post-value", [], { pre: [-1],post: [100] });
	}
}

if (tests.sort) {
	console.log("Testing 'sort' ...");
	var arr = ["asdf", "jkl;", "aaaa", "qwerty", "b", "a", "c", "e", "d"];
	console.log($$.sort(arr.slice()));
	console.log($$.sort(arr.slice(), function(a, b) { return a.length - b.length; }));
	console.log($$.sort(arr.slice(),
		function(a, b) { return a.length - b.length; },
		function(a, b) { return -(a < b ? -1 : (a > b ? 1 : 0)); }));
}

if (tests.sortIxes) {
	console.log("Testing 'sortIxes' ...");
	var arr1 = [1, 4, 8, 3, 7, 6, 2, 9, 5],
		ret = $$.sortIxes(arr1.slice());
	console.log(arr1);
	console.log(ret.array);
	console.log(ret.ixes);
	console.log($$.select(ret.ixes, function(ix) { return arr1[ix]; }));
}

if (tests.trie) {
	console.log("Testing 'Trie' ...");
	var trie = new $$.Trie();
	trie.addWords("fish");
	console.log(JSON.stringify(trie.root(), null, 2));
	console.log("fi: " + trie.hasWord("fi"));
	console.log("fish: " + trie.hasWord("fish"));
	console.log("fishes: " + trie.hasWord("fishes"));
	console.log("boot: " + trie.hasWord("boot"));

	trie.addWords("fishes", "fiesty", "beer");
	console.log(JSON.stringify(trie.root(), null, 2));
	console.log("fi: " + trie.hasWord("fi"));
	console.log("fish: " + trie.hasWord("fish"));
	console.log("fishes: " + trie.hasWord("fishes"));
	console.log("boot: " + trie.hasWord("boot"));
	console.log("fiesta: " + trie.hasWord("fiesta"));
	console.log("fiesty: " + trie.hasWord("fiesty"));
}

if (tests.heap) {
	console.log("Testing 'Heap' ...");
	console.log("min mode:");
	var heap = new $$.Heap(),
		i;
	heap.add(1, 2, 3, 4, 1, 2, 3, 4, 5, 6, 10, 1, 2);
	heap.add(-1, -2, -3, -4, -1, -2, -3, -4, -5, -6, -10, -1, -2);
	while (heap.size() > 0) {
		var min = heap.extract();
		console.log(min);
	}

	// Now try a max heap
	console.log("max mode:");
	heap = new $$.Heap(function(val) { return -val; });
	heap.add(1, 2, 3, 4, 1, 2, 3, 4, 5, 6, 10, 1, 2);
	heap.add(-1, -2, -3, -4, -1, -2, -3, -4, -5, -6, -10, -1, -2);
	i = 0;
	while (heap.size() > 0) {
		var min = heap.extract();
		console.log(min);
		if (++i % 3 == 0) {
			// Add back its unary inverse
			heap.add(-100 - min);
			console.log(" Added back: " + (-100 - min));
		}
	}

	// Now try a max heap on a struct
	console.log("max-on-struct mode:");
	var vals = [1, 2, 3, 4, 1, 2, 3, 4, 5, 6, 10, 1, 2, -1, -2, -3, -4, -1, -2, -3, -4, -5, -6, -10, -1, -2],
	heap = new $$.Heap(function(val) { return -val.value; });
	for (var i = 0; i < vals.length; ++i) {
		heap.add({
			value: vals[i],
			flavor: "Foo: " + i
		});
	}
	i = 0;
	while (heap.size() > 0) {
		var min = heap.extract();
		console.log(min);
		if (++i % 3 == 0) {
			// Add back its unary inverse
			min.value = -100 - min.value;
			heap.add(min);
		}
	}
}

if (tests.cacher) {
	console.log("Testing 'Cacher' ...");
	var arr = new $$.Cacher([]);
	arr.addProperty("mean", function(arr) {
		return arr.reduce(function(value, item) { return value + item; }, 0) / (arr.length == 0 ? 1 : arr.length);
	});
	console.log(arr.getProperty("mean"));
	var leArr = arr.get(true);
	for (var i = 0; i < 37; ++i) {
		leArr.push(i);
	}
	console.log(arr.getProperty("mean"));
	for (var i = 37; i < 74; ++i) {
		leArr.push(i);
	}
	console.log(arr.getProperty("mean"));
	arr.get(true);
	console.log(arr.getProperty("mean"));
}

if (tests.pretty) {
    console.log("Testing 'pretty' ...");
    $$.each([
        1,
        -1,
        11,
        -11,
        111,
        -111,
        1111,
        -1111,
        11111,
        -11111,
        111111,
        -111111,
        1111111,
        -1111111,
        11111111,
        -11111111,
        .1,
        -.1,
        .11,
        -.11,
        .111,
        -.111,
        .1111,
        -.1111,
        .11111,
        -.11111,
        .111111,
        -.111111,
        .1111111,
        -.1111111,
        .11111111,
        -.11111111,
        1.1,
        -1.1,
        11.11,
        -11.11,
        111.111,
        -111.111,
        1111.1111,
        -11111111,
        11111.11111,
        -11111.11111,
        111111.111111,
        -111111.111111,
        1111111.1111111,
        -1111111.1111111,
        11111111.11111111,
        -11111111.11111111,
        { value: 11111111.1111111111, separator: ";" },
        { value: -11111111.1111111111, separator: ";" },
        { value: 11111111.1111111111, integerSep: ";", decimalSep: "#" },
        { value: -11111111.1111111111, integerSep: ";", decimalSep: "#" },
        { value: 11111111.1111111111, separator: ";", group: 4 },
        { value: -11111111.1111111111, separator: ";", group: 4 },
        { value: 11111111.1111111111, integerSep: ";", decimalSep: "#", group: 4 },
        { value: -11111111.1111111111, integerSep: ";", decimalSep: "#", group: 4 },
        { value: 11111111.1111111111, group: 4 },
        { value: -11111111.1111111111, group: 4 }
    ], function(val) {
        console.log(val + " => " + $$.pretty(val));
    });
}

if (tests.limiter) {
	console.log("Testing 'Limiter' ...");
	var window1 = 1000,
		limit1 = 3,
		limiter = new $$.Limiter(),
		start = +Date.now(),
		// Document the start and end time of every thread
		times = [],
		cont = {
			// The count of things in flight
			count: 20,
			// A function to mark star
			up: function() {
				++this.count;
			},
			// A function to mark completion
			down: function() {
				if (--this.count == 0) {
					var good = true;
					// Tally up the stuff
					for (var i = 0; i < times.length - 1; ++i) {
						// Count forward until we're over the time limit or reach the
						// process limit.
						var j = i + 1;
						for (; j < times.length; ++j) {
							if (times[j].end - times[i].start <= window1
								&& j - i + 1 > limit1) {
								// We had more than the limited number of processes inside a
								// single window.
								console.log("Max process violation: " + (j - i + 1)
									+ " inside " + (times[j].end - times[i].start) + " ms");
								good = false;
							}
						}
					}
					if (!good) {
						console.log("*** Failed 'Limiter' test! ***");
					} else {
						console.log("'Limiter' passed.");
					}
				}
			}
		};
	for (var i = 0; i < 10; ++i) {
		(function(i) {
			//cont.up();
			limiter.attach(function() {
				var myEnd = +Date.now();
				times.push({
					start: myEnd,
					end: myEnd
				});
				//console.log(((myEnd - start) / 1000) + " - ran " + i);
				cont.down();
			});
		})(i);
	}
	for (var i = 10; i < 20; ++i) {
		(function(i) {
			//cont.up();
			limiter.attach(function(signal) {
				var myStart = +Date.now();
				//console.log(((myStart - start) / 1000) + " - starting " + i + " ...");
				setTimeout(function() {
					var myEnd = +Date.now();
					//console.log(((myEnd - start) / 1000) + " - stopped " + i);
					times.push({
						start: myStart,
						end: myEnd
					});
					signal();
					cont.down();
				}, 500);
			});
		})(i);
	}
}

// // Just test that things are visible
// console.log("Arrays?: " + typeof Array.prototype.countMat);
// console.log("Strings?: " + typeof String.prototype.parse);
// console.log("Objects?:");
// for (var key in $$) {
	// console.log("  " + key + " => " + typeof $$[key]);
// }

if (mode == "test") {
	var reference = fs.readFileSync("reference.json", "utf-8").replace(/\r/g, ""),
		actual = JSON.stringify(log, null, '\t').replace(/\r/g, ""),
		success = actual == reference;
	if (success) {
		base_consoleLog("Tests passed");
	} else {
		base_consoleLog("*** TESTS FAILED ***");
		var leDiff = diff.diffLines(reference, actual);
		for (var i = 0; i < leDiff.length; ++i) {
			var line = leDiff[i];
			if (line.added) {
				base_consoleLog(" >" + line.value.replace(/\n/g, "\n >"));
			} else if (line.removed) {
				base_consoleLog("< " + line.value.replace(/\n/g, "\n< "));
			}
		}
	}
} else if (mode == "overwrite") {
	fs.writeFileSync("reference.json", JSON.stringify(log, null, '\t'));
}


