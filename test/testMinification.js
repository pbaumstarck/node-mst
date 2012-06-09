
var mst = require('../lib/mst.js'),
	fs = require('fs');

var lines = mst.readLines('../lib/strings.js');
// Remove '//'-commented lines and blank lines
lines = lines.where(function(line) { return line.match(/^\s*\/\//) == null && line.match(/^\s*$/) == null; });
// Remove '//' comments at the ends of lines
lines.each(function(line, i) { lines[i] = line.replace(/\/\/.*$/, ""); });
// Collapse everything into a single string and parse it
var str = lines.reduce(function(value, item) { return value + "\n" + item; }, "");

// Parse quoted values and '/*'--'*/' comments
var quote = { pre: "/*", post: "*/" },
	parsed = str.parse('"', "'", quote);
// Only keep the non-commented lines
parsed = parsed.where(function(item) { return item.delimiter != quote; });
// Get the total string size
var totalSize = parsed.reduce(function(value, item) { return value + item.value.length; }, 0);
console.log("Total size: " + totalSize);

// Tally the keyword usage in actual code
var keywords = {
	"true": 0,
	"false": 0,
	"null": 0,
	"undefined": 0,
	"var": 0
};
parsed.where(function(item) { return item.delimiter == null; })
	  .each(function(item) {
	for (var key in keywords) {
		var matches = item.value.match(new RegExp("\\b" + key + "\\b", ""));
		if (matches != null) {
			keywords[key] += key.length * matches.length;
		}
	}
});
var sum = 0, savings = 0;
for (var key in keywords) {
	var count = keywords[key];
	console.log("  " + key + ": " + count);
	sum += count;
	savings += (key.length - 1) * count;
}
console.log("Total keywords: " + sum);
console.log("Total possible savings: " + Math.round(1000 * savings / totalSize) / 10 + "%");

var value = parsed.reduce(function(value, item) { return value + item.value; }, "");
fs.writeFileSync("strings-min.js", value);

// var body = fs.readFileSync('../lib/strings.js', 'utf8');
// console.log(body);

