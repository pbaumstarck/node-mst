
var $$ = require('./functions.js');

// class: Trie
// A string trie
function Trie() {
	var _this = this,
		_root = null;
	
	
	// class: Node
	// An internal node class for constructing the trie link by link
	function Node(parent) {
		// this.parent = parent || null;
		this.terminal = false;
		this.children = {};
	}
	// // function: toJson
	// // Returns a JSON representation of the node
	// Node.prototype.toJson = function() {
		// return {
			// terminal: this.terminal,
			// children: $$.select(this.children, function(key, value) {
				// // var obj = {};
				// // obj[key] = value.toJson();
				// // return obj;
				// return value.toJson();
			// })
		// };
	// }
	// function: follow
	// Chops successive characters off of a word and follows them down the trie. If 'canCreate' is true,
	// then we are allowed to add nodes to ensure we can follow the path. Otherwise, we return 'null'
	// once we can no longer follow the word.
	// 
	// parameters:
	//   canCreate - Whether we can create the new node
	Node.prototype.follow = function(word, canCreate) {
		if (word.length == 0) {
			return this;
		}
		var _char = word.charAt(0);
		if (!(_char in this.children)) {
			if (canCreate) {
				// Must insert it
				this.children[_char] = new Node(this);
			} else {
				return null;
			}
		}
		// Strip off the character just used and recurse
		return this.children[_char].follow(word.substr(1), canCreate);
	}
	// function: step
	// Follow the first character of the word to the next node
	Node.prototype.step = function(word) {
		if (word == null || word.length == 0) {
			return null;
		}
		var _char = word.charAt(0);
		return _char in this.children ? this.children[_char] : null;
	}
	
	
	function _ctor() {
		_root = new Node();
	}

	
	// function: addWord
	// Add a single word to the trie
	_this.addWord = function(word) {
		var node = _root.follow(word, true);
		node.terminal = true;
	}
	// function: addWords
	// Add all the arguments and expand any arrays and add those words to the trie
	_this.addWords = function() {
		function kernel(word) {
			var node = _root.follow(word, true);
			node.terminal = true;
		}
		for (var i = 0; i < arguments.length; ++i) {
			var arg = arguments[i];
			if (arg instanceof Array) {
				$$.each(arg, kernel);
			} else {
				kernel(arg);
			}
		}
	}
	
	
	// function: root
	// A public accessor for root that clones is so you can't do anything stupid
	_this.root = function() { return _root; }
	// function: hasWord
	// Whether the trie actually contains the word as a terminal
	_this.hasWord = function(word) {
		var node = _root.follow(word);
		return node != null && node.terminal;
	}
	
	
	_ctor();
}

if (typeof module != "undefined" && module != null) {
	module.exports = Trie;
}


