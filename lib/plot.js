
var fs = require('fs'),
	mst = require('./mst.js'),
	PlotFileBuilder = require('./PlotFileBuilder.js');

// Reversible Errors
// Plot a function
function plot(obj) {
	// Save the pair 'x' and 'y' series, the chart options, the title, and the legend for each series
	var xs = [],
		ys = [],
		options = {
			seriesType: 'line',
			series: {}
		},
		title = "",
		legend = ["x"],
		size = [900, 500],
		type = "ComboChart";
	for (var i = 1; i < arguments.length; ++i) {
		var arg = arguments[i];
		if (arg instanceof Array) {
			xs.push(arg);
			ys.push(arguments[++i]);
			legend.push("Series " + legend.length);
		} else if (typeof arg == "string") {
			if (arg == "label") {
				// This is a label for the current series
				legend[legend.length - 1] = arguments[++i];
			} else if (arg == "title") {
				// This is the plot's title
				title = arguments[++i];
			} else if (arg == "xlabel") {
				if ('hAxis' in options) {
					options.hAxis.title = arguments[++i];
				} else {
					options.hAxis = {
						title: arguments[++i]
					};
				}
			} else if (arg == "ylabel") {
				if ('vAxis' in options) {
					options.vAxis.title = arguments[++i];
				} else {
					options.vAxis = {
						title: arguments[++i]
					};
				}
			} else if (arg == "size") {
				// Sets the plot size as '[width, height]'
				size = arguments[++i];
			} else if (arg == "type" || arg == "color" || arg == "targetAxisIndex" || arg == "pointSize" || arg == "lineWidth"
				|| arg == "areaOpacity" || arg == "curveType" || arg == "visibleInLegend") {
				var j = xs.length - 1, obj1;
				if (j in options.series) {
					obj1 = options.series[j];
				} else {
					options.series[j] = obj1 = {};
				}
				obj1[arg] = arguments[++i];
			} else if (arg == "chartType") {
				// Sets the chart type
				type = arguments[++i];
				if (type.length > 0) {
					type = type.charAt(0).toUpperCase() + type.substr(1);
				}
				if (!type.match(/Chart$/)) {
					type += "Chart";
				}
				if (type.indexOf("Column") != -1 || type.indexOf("Bar") != -1) {
					// options.seriesType = "bar";
					delete options.seriesType;
				} else if (type.indexOf("Area") != -1) {
					options.seriesType = "area";
					// delete options.seriesType;
				} else if (type.indexOf("Scatter") != -1) {
					delete options.seriesType;
				}
			}
		}
	}
	// Cache whether we are doing a column or bar chart, which means we need string 'x's
	var isColumn = type.indexOf("Column") != -1 || type.indexOf("Bar") != -1;
	// Use a map to bin the unique 'x' values, and collect every point used on them
	var xmap = {};
	xs.each(function(xx, i) {
		var arr, key = "y" + i;
		xx.each(function(x, j) {
			// Push the 'y' value onto the list of values
			if (x in xmap) {
				arr = xmap[x];
			} else {
				xmap[x] = arr = [];
			}
			// Try to push a 'key' into an object of 'obj'
			var k = 0;
			for (; k < arr.length; ++k) {
				var obj = arr[k];
				if (!(key in obj)) {
					obj[key] = ys[i][j];
					break;
				}
			}
			if (k >= arr.length) {
				// Need to push a novel entry
				var obj = {
					x: isColumn ? "" + x : x
				};
				obj[key] = ys[i][j];
				arr.push(obj);
			}
		});
	});
	// Create the data matrix for Google
	var matrix = [];
	for (var key in xmap) {
		var arr = xmap[key];
		arr.each(function(obj, i) {
			var row = [obj.x];
			for (var i = 0; i < ys.length; ++i) {
				var key1 = "y" + i;
				if (key1 in obj) {
					row.push(obj[key1]);
				} else {
					row.push(null);
				}
			}
			matrix.push(row);
		});
	}
	// Sort by the 'x' values if they're numeric
	if (matrix.length > 0) {
		var x = matrix[0][0];
		if (typeof x == "number") {
			matrix.sort(function(a, b) {
				return a[0] - b[0];
			});
		}
	}
	// console.log(matrix);
	// Add the legend
	matrix.unshift(legend);
	if (obj instanceof PlotFileBuilder) {
		// We're adding to a special object
	} else if (typeof obj == "string") {
		// We're writing this out to a file
		var str = '<html>'
			+ '\n  <head>'
			+ '\n    <script type="text/javascript" src="https://www.google.com/jsapi"></script>'
			+ '\n    <script type="text/javascript">'
			+ '\n      google.load("visualization", "1", {packages:["corechart"]});'
			+ '\n      google.setOnLoadCallback(drawChart);'
			+ '\n      function drawChart() {'
			+ '\n        var data = google.visualization.arrayToDataTable(' + JSON.stringify(matrix) + ');'
			+ '\n        var chart = new google.visualization.' + type + '(document.getElementById(\'chart_div\'));'
			+ '\n        chart.draw(data, ' + JSON.stringify(options) + ');'
			+ '\n      }'
			+ '\n    </script>'
			+ '\n  </head>'
			+ '\n  <body>'
			+ '\n    <div id="chart_div" style="width: ' + size[0] + 'px; height: ' + size[1] + 'px;"></div>'
			+ '\n  </body>'
			+ '</html>';
		fs.writeFileSync(obj, str);
	} else {
		throw "Exception: Bad control object in 'plot' command: " + obj;
	}
}

module.exports = plot;


