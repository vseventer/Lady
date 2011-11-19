module('Nodes - Basic', {
	setup: function() {
		this.lady   = new Lady();
		this.target = document.getElementById('qunit-fixture');
	}
});

asyncTest('Text', 2, function() {
	this.lady.defer({ id: this.target.id, data: '' });
	this.lady.render((function(context) {
		return function() {
			equal(context.target.innerHTML.strip(), '', '0');
			start();
		};
	}(this)));

	QUnit.reset();//clear DOM
	stop();

	this.lady.defer({ id: this.target.id, data: 'foo' });
	this.lady.render((function(context) {
		return function() {
			equal(context.target.innerHTML.strip(), 'foo', '1');
			start();
		};
	}(this)));
});
/*
asyncTest('Nodes', 2, function() {
	this.lady.defer({ id: this.target.id, data: '<p></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>', '0');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo</p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>', '1');
});

asyncTest('Nodes with text (1: empty node)', 3, function() {
	this.lady.defer({ id: this.target.id, data: '<p></p>foo' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>foo', '01');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>', '10');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p></p>bar' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>bar', '11');
});

asyncTest('Nodes with text (2: node with text])', function() {
	this.lady.defer({ id: this.target.id, data: '<p>foo</p>bar' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>bar', '01');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p>bar</p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>', '10');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p>bar</p>baz' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>baz', '11');
});

asyncTest('Sibling nodes', function() {
	this.lady.defer({ id: this.target.id, data: '<p></p><div></div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div></div>', '00');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p></p><div>foo</div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div>foo</div>', '01');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo</p><div></div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p><div></div>', '10');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo</p><div>bar</div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p><div>bar</div>', '11');
});

asyncTest('Sibling nodes with text (1: empty nodes)', function() {
	this.lady.defer({ id: this.target.id, data: '<p></p><div></div>foo' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div></div>foo', '001');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p></p>foo<div></div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>foo<div></div>', '010');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p></p>foo<div></div>bar' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>foo<div></div>bar', '011');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p></p><div></div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p><div></div>', '100');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p></p><div></div>bar' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p><div></div>bar', '101');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p></p>bar<div></div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>bar<div></div>', '110');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p></p>bar<div></div>baz' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>bar<div></div>baz', '111');
});

asyncTest('Sibling nodes with text (2: last node with text)', function() {
	this.lady.defer({ id: this.target.id, data: '<p></p><div>foo</div>bar' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div>foo</div>bar', '001');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p></p>foo<div>bar</div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>foo<div>bar</div>', '010');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p></p>foo<div>bar</div>baz' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>foo<div>bar</div>baz', '011');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p></p><div>bar</div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p><div>bar</div>', '100');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p></p><div>bar</div>baz' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p><div>bar</div>baz', '101');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p></p>bar<div>baz</div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>bar<div>baz</div>', '110');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p></p>bar<div>baz</div>yux' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>bar<div>baz</div>yux', '111');
});

asyncTest('Sibling nodes with text (3: first node with text)', function() {
	this.lady.defer({ id: this.target.id, data: '<p>foo</p><div></div>bar' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p><div></div>bar', '001');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo</p>bar<div></div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>bar<div></div>', '010');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo</p>bar<div></div>baz' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>bar<div></div>baz', '011');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p>bar</p><div></div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p><div></div>', '100');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p>bar</p><div></div>baz' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p><div></div>baz', '101');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p>bar</p>baz<div></div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>baz<div></div>', '110');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p>bar</p>baz<div></div>yux' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>baz<div></div>yux', '111');
});

asyncTest('Sibling nodes with text (4: both nodes with text)', function() {
	this.lady.defer({ id: this.target.id, data: '<p>foo</p><div>bar</div>baz' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p><div>bar</div>baz', '001');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo</p>bar<div>baz</div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>bar<div>baz</div>', '010');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo</p>bar<div>baz</div>yux' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>bar<div>baz</div>yux', '011');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p>bar</p><div>baz</div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p><div>baz</div>', '100');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p>bar</p><div>baz</div>yux' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p><div>baz</div>yux', '101');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p>bar</p>baz<div>yux</div>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>baz<div>yux</div>', '110');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'foo<p>bar</p>baz<div>yux</div>yuux' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>baz<div>yux</div>yuux', '111');
});


module('Nodes - Nested', {
	setup: function() {
		this.lady   = new Lady();
		this.target = document.getElementById('qunit-fixture');
	}
});

asyncTest('Nodes', function() {
	this.lady.defer({ id: this.target.id, data: '<p><small></small></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p><small></small></p>', '000');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p><small></small>foo</p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p><small></small>foo</p>', '001');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p><small>foo</small></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p><small>foo</small></p>', '010');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p><small>foo</small>bar</p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p><small>foo</small>bar</p>', '011');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo<small></small></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo<small></small></p>', '100');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo<small></small>bar</p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo<small></small>bar</p>', '101');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo<small>bar</small></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo<small>bar</small></p>', '110');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p>foo<small>bar</small>baz</p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo<small>bar</small>baz</p>', '111');
});


module('Scripts - Recursive', {
	setup: function() {
		this.lady   = new Lady();
		this.target = document.getElementById('qunit-fixture');
	}
});

asyncTest('Text', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '', '0');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<script>document.write("foo");<\/script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo', '1');
});

asyncTest('Nodes', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<p></p>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>', '1');
});

asyncTest('Sibling nodes', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<p></p><div></div>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div></div>', '1');
});

asyncTest('Nested', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<p><small></small></p>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p><small></small></p>', '1');
});

asyncTest('Nested siblings', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<p><small></small><span></span></p>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p><small></small><span></span></p>', '1');
});


module('Scripts - Double recursive', {
	setup: function() {
		this.lady   = new Lady();
		this.target = document.getElementById('qunit-fixture');
	}
});

asyncTest('Text', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '', '0');

	QUnit.reset();//clear DOM
	
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"foo\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo', '1');
});

asyncTest('Nodes', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"<p></p>\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>', '1');
});

asyncTest('Sibling nodes', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"<p></p><div></div>\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div></div>', '1');
});

asyncTest('Nested', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"<p><small></small></p>\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p><small></small></p>', '1');
});

asyncTest('Nested siblings', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"<p><small></small><span></span></p>\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p><small></small><span></span></p>', '1');
});


module('Scripts - Recursive siblings', {
	setup: function() {
		this.lady   = new Lady();
		this.target = document.getElementById('qunit-fixture');
	}
});

asyncTest('Text', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"\\\");document.write(\\\"\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '', '0');

	QUnit.reset();//clear DOM
	
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"\\\");document.write(\\\"foo\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo', '1');

	QUnit.reset();//clear DOM
	
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"foo\\\");document.write(\\\"\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo', '0');

	QUnit.reset();//clear DOM
	
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"foo\\\");document.write(\\\"bar\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foobar', '1');
});

asyncTest('Nodes', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"<p>\\\");document.write(\\\"</p>\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>', '1');
});

asyncTest('Sibling nodes', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"<p></p>\\\");document.write(\\\"<div></div>\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div></div>', '1');
});

asyncTest('Nested', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"<p><small>\\\");document.write(\\\"</small></p>\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p><small></small></p>', '1');
});

asyncTest('Nested siblings', function() {
	this.lady.defer({ id: this.target.id, data: '<script>document.write("<script>document.write(\\\"<p><small></small>\\\");document.write(\\\"<span></span></p>\\\");</" + "script>");</script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p><small></small><span></span></p>', '1');
});


module('Scripts - Includes', {
	setup: function() {
		this.lady   = new Lady();
		this.target = document.getElementById('qunit-fixture');
	}
});

asyncTest('Text', function() {
	this.lady.defer({ id: this.target.id, data: '<script src="foo.js"></script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'bar', '00');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<script src="foo.js"></script>baz' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'barbaz', '01');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'baz<script src="foo.js"></script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'bazbar', '10');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'baz<script src="foo.js"></script>yux' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'bazbaryux', '11');
});

asyncTest('Nodes', function() {
	this.lady.defer({ id: this.target.id, data: '<p><script src="foo.js"></script></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>bar</p>', '1');
});

asyncTest('Siblings', function() {
	this.lady.defer({ id: this.target.id, data: '<script src="foo.js"></script><script src="foo.js"></script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'barbar', '1');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p><script src="foo.js"></script><script src="foo.js"></script></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>barbar</p>', '1');
});

asyncTest('Nested', function() {
	this.lady.defer({ id: this.target.id, data: '<p><script src="foo.js"></script><small><script src="foo.js"></script></small></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>bar<small>bar</small></p>', '1');
});


module('Scripts - Recursive includes', {
	setup: function() {
		this.lady   = new Lady();
		this.target = document.getElementById('qunit-fixture');
	}
});

asyncTest('Text', function() {
	this.lady.defer({ id: this.target.id, data: '<script src="baz.js"></script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'bar', '00');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<script src="baz.js"></script>yux' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'baryux', '01');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'yux<script src="baz.js"></script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'yuxbar', '10');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: 'yux<script src="baz.js"></script>yuux' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'yuxbaryuux', '11');
});

asyncTest('Nodes', function() {
	this.lady.defer({ id: this.target.id, data: '<p><script src="baz.js"></script></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>bar</p>', '1');
});

asyncTest('Siblings', function() {
	this.lady.defer({ id: this.target.id, data: '<script src="baz.js"></script><script src="baz.js"></script>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'barbar', '1');

	QUnit.reset();//clear DOM

	this.lady.defer({ id: this.target.id, data: '<p><script src="baz.js"></script><script src="baz.js"></script></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>barbar</p>', '1');
});

asyncTest('Nested', function() {
	this.lady.defer({ id: this.target.id, data: '<p><script src="baz.js"></script><small><script src="baz.js"></script></small></p>' });
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>bar<small>bar</small></p>', '1');
});

/**
 * Strips newlines from string
 * NOTE necessary since browsers each render HTML slightly different
 * 
 * @returns String
 */
String.prototype.strip = function() {
	return this.replace(/\r|\n/g, '').toLowerCase();
};