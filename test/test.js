
// Added 'sift' method and 'withIxes' option to that and 'where'

var mst = require('../lib/mst.js'),
	assert = require('assert'),
	diff = require('diff'),
	fs = require('fs');

var tests = {
	where: true,
	select: true,
	sift: true,
	each: true,
	makeArray: true,
	singletons: true,
	ix: true,
	colon: true,
	split: true,
	histo: true,
	equal: true,
	stats: true,
	aggregates: true,
	replace: true,
	parse: true
};

var arr = [1,2,3,4];
if (tests.where) {
	console.log("Testing 'where' ...");
	console.log(arr);	
	console.log(arr.where(function(item) { return item > 2; }));
	console.log(arr.where(function(item) { return item < 2; }));
	console.log(arr.where(function(item) { return item <= 2; }));
	console.log(arr.where("ixes", function(item) { return item > 2; }));
}

if (tests.select) {
	console.log("Testing 'select' ...");
	console.log(arr);
	console.log(arr.select());
	console.log(arr.select(function(item) { return item * item; }));
	console.log(arr.select("reverse", function(item) { return item * item; }));
	console.log(arr.select(2, function(item) { return item * item; }));
	console.log(arr.select(1, 2, function(item) { return item * item; }));
	console.log(arr.select("reverse", 2, function(item) { return item * item; }));
	console.log(arr.select("reverse", 2, 2, function(item) { return item * item; }));
	console.log(arr.select("reverse", -2, function(item) { return item * item; }));
	console.log(arr.select(0, -1, function(item) { return item * item; }));
}

if (tests.sift) {
	console.log("Testing 'sift' ...");
	console.log(arr.sift(function(item) { return item > 2; }));
	console.log(arr.sift("ixes", function(item) { return item > 2; }));
	arr = arr.concat(arr);
	console.log(arr.sift(function(item) {
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
	console.log(arr.sift("ixes", function(item) {
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
	console.log(arr.each(function(item) {}));
	console.log(arr.each(function(item) { return item == 4; }));
	var str = "";
	console.log(arr.each("reverse", function(item) { str += ", " + item; }) + "> " + str);
	str = "";
	console.log(arr.each(3, function(item) { str += ", " + item; }) + "> " + str);
	str = "";
	console.log(arr.each(3, 6, function(item) { str += ", " + item; }) + "> " + str);
	str = "";
	console.log(arr.each("reverse", 6, 3, function(item) { str += ", " + item; }) + "> " + str);
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

if (tests.singletons) {
	var arr = [3,3,3].makeArray(function(i, j, k) { return i + ":" + j + ":" + k; });
	console.log(arr.singletons(function(value) {
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
	console.log(arr.singletons(function(value) {
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
	console.log(arr.split(function(item) { return true; }));
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

if (tests.aggregates) {
	console.log("Testing aggregates ...");
	var arr = [0,1,2,3,4,5,6,7,8,9,10];
	console.log(arr.sum());
	console.log(arr.prod());
	console.log(arr.slice(1).prod());
	console.log(arr.any());
	console.log(arr.any(function(item) { return false; }));
	console.log(arr.all());
	console.log(arr.all(function(item) { return true; }));
}

if (tests.replace) {
	arr = [1,2,3,4,5,6,7,8,9,10];
	console.log(arr);
	console.log(arr.replace(function(item) { return item * item; }));
	console.log(arr);
	console.log(arr.replace(function(item) { return item >= 30 ? item : undefined; }));
	console.log(arr);
	console.log(arr.replace(function(item) { return item != 64 ? item : undefined; }));
	console.log(arr);
	arr = arr.concat(arr);
	console.log(arr.replace(4, function(item) { return -item; }));
	console.log(arr.replace(5, 2, function(item) { return -item; }));
	console.log(arr.replace(-5, function(item) { return -item; }));
}

if (tests.parse) {
	[
		"as;ldfjka;sdlfja;sdfj asl;dkfja;skldfj;asd",
		"'as;ldfjka;sdlfja;sdfj asl;dkfja;skldfj;asd'",
		'"as;ldfjka;sdlfja;sdfj asl;dkfja;skldfj;asd"',
		"And then 'Big' jumped out and \"Small \\\" came over and \" kicked \' Little \\'Tim \\' Tim \' Jenkins in the shin",
		"'Single'\"Double\"''\"\""
	].each(function(str) {
		var parse = str.parse();
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
		var parse = str.parse({ pre: "/*", post: "*/" });
		console.log(parse);
		console.log("Original: " + str);
		var reconst = parse.reduce(function(value, item) { return value + item.value; }, "");
		console.log("Reconst.: " + reconst);
		if (reconst != str) {
			throw "Bad parse of: " + str;
		}
	});
	// Test flattening of delimiters
	console.log("so \"Double 'quote'\" and 'single \"quote\"'".parse(['"', "'"]));
}


