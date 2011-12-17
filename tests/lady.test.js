/**
 * Lady test suite
 */
module('Lady (async)', {
	setup: function() {
		// Handle document.write to avoid breaking test suite
		this.old = document.write;
		document.write = function() { };

		// Test object
		this.lady   = new Lady();
		this.length = (function(context) {//shortcut for ladys queue
			return function() {
				return context.lady._queue.length();
			};
		}(this));
	}
});

// Constructor
test('Constructor', function() {
	equals(typeof this.lady, 'object', 'Constructor');

	deepEqual(this.lady.defer({
		target: document.getElementById('qunit-fixture'),
		data:   function() { }
	}), this.lady, 'Return value');
	strictEqual(this.length(), 1, 'Added one defer');

	this.lady.defer({
		target: document.getElementById('qunit-fixture'),
		data:   function() { }
	});
	strictEqual(this.length(), 2, 'Added another defer');
});

// Defer
test('Defer', function() {
	QUnit.stop(2);

	this.lady.defer({
		target: document.getElementById('qunit-fixture'),
		data:   'foo.js',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), 'bar', 'URL');
			start();
		}
	});

	this.lady.defer({
		target: document.getElementById('qunit-fixture'),
		data:   function() {
			window.foo = 'bar';
		},
		fn:     function() {
			strictEqual(window.foo, 'bar', 'Function (global var)');
			start();
		}
	});

	// Fire
	this.lady.render();
});

// Parse
test('Parse', function() {
	QUnit.stop(12);

	this.lady.parse('foo', function(el) {
		strictEqual(el.innerHTML.strip(), 'foo', 'Textnode');
		start();
	});

	this.lady.parse('<p></p>', function(el) {
		strictEqual(el.innerHTML.strip(), '<p></p>', 'Node');
		start();
	});

	this.lady.parse('<p>foo</p>', function(el) {
		strictEqual(el.innerHTML.strip(), '<p>foo</p>', 'Node with text');
		start();
	});

	this.lady.parse('foo<p></p>', function(el) {
		strictEqual(el.innerHTML.strip(), 'foo<p></p>', 'Sibling text- and node');
		start();
	});

	this.lady.parse('<div></div><p>bar</p>', function(el) {
		strictEqual(el.innerHTML.strip(), '<div></div><p>bar</p>', 'Sibling nodes');
		start();
	});

	this.lady.parse('<p><small></small></p>', function(el) {
		strictEqual(el.innerHTML.strip(), '<p><small></small></p>', 'Nested nodes');
		start();
	});

	this.lady.parse('<p>foo<small>bar</small>baz</p>', function(el) {
		strictEqual(el.innerHTML.strip(), '<p>foo<small>bar</small>baz</p>', 'Nested nodes with text');
		start();
	});

	this.lady.parse('<script>document.write("foo");</script>', function(el) {
		strictEqual(el.innerHTML.strip(), 'foo', 'Recursive');
		start();
	});

	this.lady.parse('<p><script>document.write("<small>foo</small>");</script></p>', function(el) {
		strictEqual(el.innerHTML.strip(), '<p><small>foo</small></p>', 'Nested recursive');
		start();
	});

	this.lady.parse('<script src="foo.js"></script>', function(el) {
		strictEqual(el.innerHTML.strip(), 'bar', 'Include as node');
		start();
	});

	this.lady.parse('<script src="foo.js"></script><script src="foo.js"></script>', function(el) {
		strictEqual(el.innerHTML.strip(), 'barbar', 'Sibling includes');
		start();
	});

	this.lady.parse('<script src="baz.js"></script>', function(el) {
		strictEqual(el.innerHTML.strip(), 'bar', 'Nested includes');
		start();
	});

	// Fire
	this.lady.render();
});

/**
 * Strips newlines from string
 * NOTE necessary since browsers each render HTML slightly different
 * 
 * @returns String
 */
String.prototype.strip = function() {
	return this.replace(/\r|\n/g, '')
	           .replace(/<script.*?<\/script>/gi, '')//remove script
	           .toLowerCase();
};