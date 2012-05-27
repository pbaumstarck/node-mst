
var mst = require('../lib/mst.js'),
	fs = require('fs');

// A 'Foo' object
function Foo(config) {
	var _this = this;
	this.a = "string"
	this.b = 42;
	this.c = [1, 2, "foo", "bar"];
	this.d = new Bar();
	this.e = {
		"foo": "bar",
		"moo": 7,
		bbb: new Bar()
	};
	
	this.toMemento = function() {
		return mst.toMemento(_this, "Foo");
	}
	function _ctor() {
		if (mst.isMemento(config, "Foo")) {
			mst.siphonMemento(_this, config);
		}
	}
	
	// Perturb our data from its initialization conditions
	this.perturb = function() {
		_this.a = "string+string";
		_this.b = 4242;
		_this.c.push("neateeeeeatatetata!");
		_this.d.perturb();
		this.e.foo += "MOOO";
		this.e.moo *= 100000;
		this.e.bbb.perturb();
	}
	
	
	_ctor();
}
mst.registerMemento("Foo", function(memento) { return new Foo(memento); })

// A 'Bar' object
function Bar(config) {
	var _this = this;
	this.a = "string";
	this.b = 42;
	this.c = [19];
	
	this.toMemento = function() {
		return mst.toMemento(_this, "Bar");
	}
	function _ctor() {
		if (mst.isMemento(config, "Bar")) {
			mst.siphonMemento(_this, config);
		}
	}
	
	// Perturb our data from its initialization conditions
	this.perturb = function() {
		this.a = "string---Wooo!";
		this.b = -42424242;
		this.c.push(6666666);
	}
	
	
	_ctor();
}
mst.registerMemento("Bar", function(memento) { return new Bar(memento); })


var foo = new Foo();
console.log(">" + (foo.d instanceof Bar) + ", " + (foo.e.bbb instanceof Bar));
foo.perturb();
var mFoo = mst.toMemento(foo);
console.log(mFoo);
fs.writeFileSync("foo.json", JSON.stringify(foo, null, '\t'));
fs.writeFileSync("memento.json", JSON.stringify(mFoo, null, '\t'));

var foo1 = mst.fromMemento(mFoo, function(memento) { return new Foo(memento); });
console.log(foo1);
console.log(">" + (foo1.d instanceof Bar) + ", " + (foo1.e.bbb instanceof Bar));
fs.writeFileSync("foo1.json", JSON.stringify(foo1, null, '\t'));


