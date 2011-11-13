module('Nodes - Basic', {
	setup: function() {
		this.lady   = new Lady();
		this.target = document.getElementById('qunit-fixture');
	}
});

test('Text', function() {
	this.lady.enqueue(this.target.id, mock(''));
	this.lady.render();
	equal(this.target.innerHTML, '', '0');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo', '1');
});

test('Nodes', function() {
	this.lady.enqueue(this.target.id, mock('<p></p>'));
	this.lady.render();
	equal(this.target.innerHTML, '<p></p>', '0');
	/*
	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p>foo</p>'));
	this.lady.render();
	equal(this.target.innerHTML, '<p>foo</p>', '1');
});

test('Nodes with text (1: empty node)', function() {
	this.lady.enqueue(this.target.id, mock('<p></p>foo'));
	this.lady.render();
	equal(this.target.innerHTML, '<p></p>foo', '01');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p></p>'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p></p>', '10');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p></p>bar'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p></p>bar', '11');
});

test('Nodes with text (2: node with text])', function() {
	this.lady.enqueue(this.target.id, mock('<p>foo</p>bar'));
	this.lady.render();
	equal(this.target.innerHTML, '<p>foo</p>bar', '01');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p>bar</p>'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p>bar</p>', '10');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p>bar</p>baz'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p>bar</p>baz', '11');
});

test('Sibling nodes', function() {
	this.lady.enqueue(this.target.id, mock('<p></p><div></div>'));
	this.lady.render();
	equal(this.target.innerHTML, '<p></p><div></div>', '00');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p></p><div>foo</div>'));
	this.lady.render();
	equal(this.target.innerHTML, '<p></p><div>foo</div>', '01');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p>foo</p><div></div>'));
	this.lady.render();
	equal(this.target.innerHTML, '<p>foo</p><div></div>', '10');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p>foo</p><div>bar</div>'));
	this.lady.render();
	equal(this.target.innerHTML, '<p>foo</p><div>bar</div>', '11');
});

test('Sibling nodes with text (1: empty nodes)', function() {
	this.lady.enqueue(this.target.id, mock('<p></p><div></div>foo'));
	this.lady.render();
	equal(this.target.innerHTML, '<p></p><div></div>foo', '001');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p></p>foo<div></div>'));
	this.lady.render();
	equal(this.target.innerHTML, '<p></p>foo<div></div>', '010');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p></p>foo<div></div>bar'));
	this.lady.render();
	equal(this.target.innerHTML, '<p></p>foo<div></div>bar', '011');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p></p><div></div>'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p></p><div></div>', '100');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p></p><div></div>bar'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p></p><div></div>bar', '101');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p></p>bar<div></div>'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p></p>bar<div></div>', '110');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p></p>bar<div></div>baz'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p></p>bar<div></div>baz', '111');
});

test('Sibling nodes with text (2: last node with text)', function() {
	this.lady.enqueue(this.target.id, mock('<p></p><div>foo</div>bar'));
	this.lady.render();
	equal(this.target.innerHTML, '<p></p><div>foo</div>bar', '001');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p></p>foo<div>bar</div>'));
	this.lady.render();
	equal(this.target.innerHTML, '<p></p>foo<div>bar</div>', '010');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p></p>foo<div>bar</div>baz'));
	this.lady.render();
	equal(this.target.innerHTML, '<p></p>foo<div>bar</div>baz', '011');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p></p><div>bar</div>'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p></p><div>bar</div>', '100');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p></p><div>bar</div>baz'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p></p><div>bar</div>baz', '101');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p></p>bar<div>baz</div>'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p></p>bar<div>baz</div>', '110');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p></p>bar<div>baz</div>yux'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p></p>bar<div>baz</div>yux', '111');
});

test('Sibling nodes with text (3: first node with text)', function() {
	this.lady.enqueue(this.target.id, mock('<p>foo</p><div></div>bar'));
	this.lady.render();
	equal(this.target.innerHTML, '<p>foo</p><div></div>bar', '001');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p>foo</p>bar<div></div>'));
	this.lady.render();
	equal(this.target.innerHTML, '<p>foo</p>bar<div></div>', '010');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p>foo</p>bar<div></div>baz'));
	this.lady.render();
	equal(this.target.innerHTML, '<p>foo</p>bar<div></div>baz', '011');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p>bar</p><div></div>'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p>bar</p><div></div>', '100');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p>bar</p><div></div>baz'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p>bar</p><div></div>baz', '101');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p>bar</p>baz<div></div>'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p>bar</p>baz<div></div>', '110');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p>bar</p>baz<div></div>yux'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p>bar</p>baz<div></div>yux', '111');
});

test('Sibling nodes with text (4: both nodes with text)', function() {
	this.lady.enqueue(this.target.id, mock('<p>foo</p><div>bar</div>baz'));
	this.lady.render();
	equal(this.target.innerHTML, '<p>foo</p><div>bar</div>baz', '001');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p>foo</p>bar<div>baz</div>'));
	this.lady.render();
	equal(this.target.innerHTML, '<p>foo</p>bar<div>baz</div>', '010');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('<p>foo</p>bar<div>baz</div>yux'));
	this.lady.render();
	equal(this.target.innerHTML, '<p>foo</p>bar<div>baz</div>yux', '011');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p>bar</p><div>baz</div>'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p>bar</p><div>baz</div>', '100');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p>bar</p><div>baz</div>yux'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p>bar</p><div>baz</div>yux', '101');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p>bar</p>baz<div>yux</div>'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p>bar</p>baz<div>yux</div>', '110');

	QUnit.reset();//clear DOM

	this.lady.enqueue(this.target.id, mock('foo<p>bar</p>baz<div>yux</div>yuux'));
	this.lady.render();
	equal(this.target.innerHTML, 'foo<p>bar</p>baz<div>yux</div>yuux', '111');*/
});

module('Scripts');

/**
 * Mocks input
 * NOTE necessary since we can’t use document.write directly
 * 
 * @param String input
 * @return String
 */
function mock(input) {
	// @link http://phpjs.org/functions/addslashes:303
	return "<script>document.write('" + input.replace(/[\\']/g, '\\$&') + "');<\/script>";
}