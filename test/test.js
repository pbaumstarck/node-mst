
var $$ = require('../lib/mst.js'),
	diff = require('diff');

var fs = require('fs');
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

// Just test that things are visible
console.log("Arrays?: " + typeof Array.prototype.countMat);
console.log("Strings?: " + typeof String.prototype.parse);
console.log("Objects?:");
for (var key in $$) {
	console.log("  " + key + " => " + typeof $$[key]);
}

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


