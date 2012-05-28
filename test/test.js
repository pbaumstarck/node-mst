
var mst = require('../lib/mst.js'),
	assert = require('assert'),
	diff = require('diff'),
	fs = require('fs');

var tests = {
	where: true,
	select: true,
	makeArray: true,
	singleton: true,
	ix: true,
	colon: true,
	split: true,
	histo: true,
	equal: true,
	stats: true,
	parseString: true
};

var arr = [1,2,3,4];
if (tests.where || tests.select) {
	console.log("Testing 'where' and 'select' ...");
	console.log(arr);
	console.log(arr.where(function(item) { return item > 2; }));
	console.log(arr.select(function(item) { return item * item; }));
}

if (tests.makeArray) {
	console.log([3].makeArray(0));
	console.log([3].makeArray(function(i) { return i; }));
	console.log([3,3].makeArray(0));
	console.log([3,3].makeArray(function(i, j) { return i * j; }));
	console.log([3,3,3].makeArray(0));
	var arr = [3,3,3].makeArray(function(i, j, k) { return i + ":" + j + ":" + k; });
	console.log(arr);
}

if (tests.singleton) {
	var arr = [3,3,3].makeArray(function(i, j, k) { return i + ":" + j + ":" + k; });
	console.log(arr.singleton(function(value) {
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
	console.log(arr.singleton(function(value) {
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

if (tests.ix) {
	console.log("Testing 'ix' ...");

	arr = [1, 2, 3, 4];
	for (var i = -5; i < 5; ++i) {
		try {
			console.log(i + ": " + arr.ix(i));
		} catch (error) {
			console.log("ERROR - " + i);
		}
	}
	console.log(arr.ix([1, 2]));
	console.log(arr.ix([-1, -3]));

	arr = [3,4].makeArray(function(i,j) { return 4 * i + j; });
	console.log(arr);
	console.log(arr.ix(1, 2));
	console.log(arr.ix([1, 2], 2));
	console.log(arr.ix([1, 2], [2, 3]));
}

if (tests.colon) {
	console.log("Testing 'colon' ...");
	console.log([4].colon());
	console.log([1, 5].colon());
	console.log([1, 3, 16].colon());
	console.log([1, -3, 16].colon());
	console.log([1, -3, -16].colon());
}

if (tests.split) {
	console.log("Testing 'split' ...");
	arr = [1,2,3,4,5];
	console.log(arr.split(function(item) { return item == 2; }));
	console.log(arr.split(function(item) { return item > 2; }));
	console.log(arr.split(function(item) { return item >= 2 && item <= 4; }));
}

if (tests.histo) {
	console.log("Testing 'histo' ...");
	console.log(arr.histo());
	console.log(arr.histo(true));
	arr = arr.concat(arr.slice(2));
	console.log(arr.histo());
	var str = console.log(arr.histo(true));
}

if (tests.equal) {
	console.log("Testing 'equal' ...");
	console.log(mst.equal(6,6) + ", " + mst.equal(6,7) + ", " + mst.equal(6,"6"));
	console.log(mst.equal(null, null) + ", " + mst.equal(undefined,undefined) + ", " + mst.equal(null, undefined) + ", " + mst.equal(undefined, null));
	console.log(mst.equal([1],[1]) + ", " + mst.equal([5].colon(),[5].colon()) + ", " + mst.equal([5].colon(),[6].colon()));
	console.log(mst.equal({"foo":true},{"bar":true}) + ", " + mst.equal({"foo":true},{"foo":true}) + ", " + mst.equal({"foo":true},{"foo":true,"bar":true}));
	console.log(mst.equal({"foo":false},{"foo":true}) + ", " + mst.equal({"foo":true,"bar":true},{"foo":true}));
}

if (tests.stats) {
	console.log("Testing 'stats' ...");
	var arr = [1,2,3,4,5,6,7,8,9,10];
	console.log(arr.stats());
	console.log(arr.stats("mean,stddev,count"));
	arr = [1,1,1,1,1,1,2];
	console.log(arr.stats());
	arr = [1,2,3,4,5,6,7,8,9,10].select(function(item) { return { x: item, y: -item }; });
	console.log(arr);
	console.log(arr.stats());
}

if (tests.parseString) {
	[
		"as;ldfjka;sdlfja;sdfj asl;dkfja;skldfj;asd",
		"'as;ldfjka;sdlfja;sdfj asl;dkfja;skldfj;asd'",
		'"as;ldfjka;sdlfja;sdfj asl;dkfja;skldfj;asd"',
		"And then 'Big' jumped out and \"Small \\\" came over and \" kicked \' Little \\'Tim \\' Tim \' Jenkins in the shin",
		"'Single'\"Double\"''\"\""
	].each(function(str) {
		var parse = mst.parseString(str);
		console.log(parse);
		console.log("Original: " + str);
		var reconst = parse.reduce(function(value, item) { return value + item.value; }, "");
		console.log("Reconst.: " + reconst);
		if (reconst != str) {
			throw "Bad parse of: " + str;
		}
	});
	// Test custom delimiters
	[
		"So i have /* which should be a comment */ if that works //   /* end end end ..."
	].each(function(str) {
		var parse = mst.parseString(str, { pre: "/*", post: "*/" });
		console.log(parse);
		console.log("Original: " + str);
		var reconst = parse.reduce(function(value, item) { return value + item.value; }, "");
		console.log("Reconst.: " + reconst);
		if (reconst != str) {
			throw "Bad parse of: " + str;
		}
	});
}


