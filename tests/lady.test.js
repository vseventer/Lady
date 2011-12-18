/**
 * Lady test suite
 */
module('Lady (async)', {
	setup: function() {
		// Handle document.write to avoid breaking test suite
		document.write = function() { };

		// Test object
		this.lady   = new Lady();
		this.length = (function(context) {//shortcut for ladys queue
			return function() {
				return context.lady._stack[0].length();
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

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   'foo',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), 'foo', 'Textnode');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   '<p></p>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), '<p></p>', 'Node');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   '<p>foo</p>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), '<p>foo</p>', 'Node with text');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   'foo<p></p>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), 'foo<p></p>', 'Sibling text- and node');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   '<div></div><p>bar</p>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), '<div></div><p>bar</p>', 'Sibling nodes');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   '<p><small></small></p>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), '<p><small></small></p>', 'Nested nodes');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   '<p>foo<small>bar</small>baz</p>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), '<p>foo<small>bar</small>baz</p>', 'Nested nodes with text');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   '<script>document.write("foo");</script>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), 'foo', 'Recursive');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   '<p><script>document.write("<small>foo</small>");</script></p>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), '<p><small>foo</small></p>', 'Nested recursive');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   '<script src="foo.js"></script>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), 'bar', 'Include as node');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   '<script src="foo.js"></script><script src="foo.js"></script>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), 'barbar', 'Sibling includes');
			el.innerHTML = '';//reset
			start();
		}
	});

	this.lady.parse({
		target: document.getElementById('qunit-fixture'),
		html:   '<script src="baz.js"></script>',
		fn:     function(el) {
			strictEqual(el.innerHTML.strip(), 'bar', 'Nested includes');
			el.innerHTML = '';//reset
			start();
		}
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