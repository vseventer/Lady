module('Nodes', {
	setup: function() {
		this.lady   = new Lady();
		this.target = document.getElementById('qunit-fixture');
	}
});

test('Basic - Text', function() {
	this.lady.enqueue(this.target.id, mock(''));
	this.lady.render();
	equal('', this.target.innerHTML, 'Empty textnode');

	this.lady.enqueue(this.target.id, mock('foo'));
	this.lady.render();
	equal('foo', this.target.innerHTML, 'Textnode');
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