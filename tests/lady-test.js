module('Nodes - Basic', {
	setup: function() {
		this.lady   = new Lady();
		this.target = document.getElementById('qunit-fixture');
	}
});

test('Text', function() {
	this.lady.enqueue(this.target.id, ''.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '', '0');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo', '1');
});

test('Nodes', function() {
	this.lady.enqueue(this.target.id, '<p></p>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>', '0');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p>foo</p>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>', '1');
});

test('Nodes with text (1: empty node)', function() {
	this.lady.enqueue(this.target.id, '<p></p>foo'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>foo', '01');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p></p>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>', '10');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p></p>bar'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>bar', '11');
});

test('Nodes with text (2: node with text])', function() {
	this.lady.enqueue(this.target.id, '<p>foo</p>bar'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>bar', '01');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p>bar</p>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>', '10');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p>bar</p>baz'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>baz', '11');
});

test('Sibling nodes', function() {
	this.lady.enqueue(this.target.id, '<p></p><div></div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div></div>', '00');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p></p><div>foo</div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div>foo</div>', '01');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p>foo</p><div></div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p><div></div>', '10');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p>foo</p><div>bar</div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p><div>bar</div>', '11');
});

test('Sibling nodes with text (1: empty nodes)', function() {
	this.lady.enqueue(this.target.id, '<p></p><div></div>foo'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div></div>foo', '001');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p></p>foo<div></div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>foo<div></div>', '010');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p></p>foo<div></div>bar'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>foo<div></div>bar', '011');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p></p><div></div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p><div></div>', '100');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p></p><div></div>bar'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p><div></div>bar', '101');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p></p>bar<div></div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>bar<div></div>', '110');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p></p>bar<div></div>baz'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>bar<div></div>baz', '111');
});

test('Sibling nodes with text (2: last node with text)', function() {
	this.lady.enqueue(this.target.id, '<p></p><div>foo</div>bar'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p><div>foo</div>bar', '001');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p></p>foo<div>bar</div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>foo<div>bar</div>', '010');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p></p>foo<div>bar</div>baz'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p></p>foo<div>bar</div>baz', '011');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p></p><div>bar</div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p><div>bar</div>', '100');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p></p><div>bar</div>baz'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p><div>bar</div>baz', '101');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p></p>bar<div>baz</div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>bar<div>baz</div>', '110');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p></p>bar<div>baz</div>yux'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p></p>bar<div>baz</div>yux', '111');
});

test('Sibling nodes with text (3: first node with text)', function() {
	this.lady.enqueue(this.target.id, '<p>foo</p><div></div>bar'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p><div></div>bar', '001');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p>foo</p>bar<div></div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>bar<div></div>', '010');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p>foo</p>bar<div></div>baz'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>bar<div></div>baz', '011');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p>bar</p><div></div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p><div></div>', '100');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p>bar</p><div></div>baz'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p><div></div>baz', '101');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p>bar</p>baz<div></div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>baz<div></div>', '110');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p>bar</p>baz<div></div>yux'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>baz<div></div>yux', '111');
});

test('Sibling nodes with text (4: both nodes with text)', function() {
	this.lady.enqueue(this.target.id, '<p>foo</p><div>bar</div>baz'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p><div>bar</div>baz', '001');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p>foo</p>bar<div>baz</div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>bar<div>baz</div>', '010');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, '<p>foo</p>bar<div>baz</div>yux'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), '<p>foo</p>bar<div>baz</div>yux', '011');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p>bar</p><div>baz</div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p><div>baz</div>', '100');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p>bar</p><div>baz</div>yux'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p><div>baz</div>yux', '101');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p>bar</p>baz<div>yux</div>'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>baz<div>yux</div>', '110');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, 'foo<p>bar</p>baz<div>yux</div>yuux'.mock());
	this.lady.render();
	equal(this.target.innerHTML.strip(), 'foo<p>bar</p>baz<div>yux</div>yuux', '111');
});

module('Scripts');

/**
 * Mocks input
 * NOTE necessary since we can’t use document.write directly
 * 
 * @returns String
 */
String.prototype.mock = function() {
	// @link http://phpjs.org/functions/addslashes:303
	return "<script>document.write('" + this.replace(/[\\']/g, '\\$&') + "');<\/script>";
};

/**
 * Strips newlines from string
 * NOTE necessary since browsers each render HTML slightly different
 * 
 * @returns String
 */
String.prototype.strip = function() {
	return this.replace(/\r|\n/g, '').toLowerCase();
};