
// Builds a file for plotting data
function PlotFileBuilder(config) {
	// Save the object-level 'this'
	var _this = this;
	var body = "";
	
	
	// Our constructor
	this._ctor = function() {
		body += '<html>'
			+ '\n  <head>'
			+ '\n    <script type="text/javascript" src="https://www.google.com/jsapi"></script>'
			+ '\n      <script type="text/javascript">'
			+ '\n        google.load("visualization", "1", {packages:["corechart"]});'
			+ '\n        google.setOnLoadCallback(drawChart);'
			+ '\n        function drawChart() {';
	}
	
	
	// Appends a string to our body
	this.append = function(str) {
		body += str;
	}
	// Opens the 'body' of the page and optionally appends a string
	this.openBody = function(str) {
		body += '\n      </script>'
			+ '\n    </head>'
			+ '\n  <body>';
		if (str != null) {
			body += str;
		}
	}
	// Closes the 'body' of the page and returns the whole body string
	this.closeBody = function() {
		body += '\n  </body>'
			+ '\n</html>';
		return body;
	}
	// Returns the body we have built
	this.toString = function() {
		return body;
	}
	
	
	this._ctor();
}

module.exports = PlotFileBuilder;


