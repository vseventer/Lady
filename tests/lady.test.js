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
});

//Defer
test('Defer', function() {
	deepEqual(this.lady.defer({ data: 'foo' }), this.lady, 'Return value');
	strictEqual(this.length(), 1, 'Added one defer');

	this.lady.defer({ data: 'bar' });
	strictEqual(this.length(), 2, 'Added another defer');
});

// Capture
test('Capture', function() {
	var old = document.write;

	// Test state
	deepEqual(this.lady.capture(), this.lady, 'Return value');
	deepEqual(this.lady._document.write, old, '_: Document.write original');
	notDeepEqual(document.write, old, 'Document.write overrided');

	// Test capture
	document.write('foo');
	strictEqual(this.length(), 1, 'Captured one element');

	document.write('bar');
	strictEqual(this.length(), 2, 'Captured another element');
});

// Render
// NOTE we don’t use qunit-fixture, since clearing doesn’t work async
test('Render', function() {
	QUnit.stop(14);

	this.lady.defer({ data: 'foo', fn: function(el) {
		strictEqual(el.innerHTML.strip(), 'foo', 'Textnode');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	} });

	this.lady.defer({ data: function() {
		document.write('foo');
	}, fn: function(el) {
		strictEqual(el.innerHTML.strip(), 'foo', 'Textnode as function');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	}});

	this.lady.defer({ data: '<p></p>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), '<p></p>', 'Node');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	} });

	this.lady.defer({ data: '<p>foo</p>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), '<p>foo</p>', 'Node with text');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	} });

	this.lady.defer({ data: 'foo<p></p>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), 'foo<p></p>', 'Sibling text- and node');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	} });

	this.lady.defer({ data: '<div></div><p>bar</p>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), '<div></div><p>bar</p>', 'Sibling nodes');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	} });

	this.lady.defer({ data: '<p><small></small></p>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), '<p><small></small></p>', 'Nested nodes');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	} });

	this.lady.defer({ data: '<p>foo<small>bar</small>baz</p>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), '<p>foo<small>bar</small>baz</p>', 'Nested nodes with text');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	} });

	this.lady.defer({ data: '<script>document.write("foo");</script>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), 'foo', 'Recursive');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	} });

	this.lady.defer({ data: '<p><script>document.write("<small>foo</small>");</script></p>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), '<p><small>foo</small></p>', 'Nested recursive');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	} });

	this.lady.defer({ url: 'foo.js', fn: function(el) {
		strictEqual(el.innerHTML.strip(), 'bar', 'Include as URL');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	} });

	this.lady.defer({ data: '<script src="foo.js"></script>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), 'bar', 'Include as node');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	}});

	this.lady.defer({ data: '<script src="foo.js"></script><script src="foo.js"></script>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), 'barbar', 'Sibling includes');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	}});

	this.lady.defer({ data: '<script src="baz.js"></script>', fn: function(el) {
		strictEqual(el.innerHTML.strip(), 'bar', 'Nested includes');
		el.parentNode && el.parentNode.removeChild(el);
		start();
	}});

	// Run
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