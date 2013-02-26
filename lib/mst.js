
var functions = require('./functions.js');

module.exports = {
	Interpolator: require('./Interpolator.js'),
	RgbInterpolator: require('./RgbInterpolator.js'),
	Trie: require('./Trie.js'),
	Heap: require('./Heap.js'),
	Cacher: require('./Cacher.js'),
  Limiter: require('./Limiter.js')
};
// Add the contents of 'functions' to the exports
for (var key in functions) {
	module.exports[key] = functions[key];
}


