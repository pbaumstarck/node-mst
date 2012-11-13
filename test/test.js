
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
	countMat: true
};
// $$.each(tests, function(key) {
// 	if (key != "equal") {
// 		tests[key] = false;
// 	}
// });

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
	console.log("Within a factor of three in time?: " + ((Math.max(elapsed1, elapsed2)
		/ Math.min(elapsed1, elapsed2)) <= 3.0 ? "true" : "false"));
	console.log("Equal?: " + $$.equal(res1, res2));
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


