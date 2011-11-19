/**
 * Queue test suite
 */
module('Queue', {
	setup: function() {
		this.mock  = function(fn) {
			fn && fn();
		};
		this.queue = new Queue();
	}
});

// Constructor
test('Constructor', function() {
	equals(typeof this.queue, 'object', 'Constructor');
	equals(this.queue.length(), 0, 'Number of jobs')
});

// Add method
test('Add', function() {
	equals(typeof this.queue.add(this.mock), 'object', 'Return value');
	equals(this.queue.length(), 1, 'Added one element');

	this.queue.add(this.mock);
	equals(this.queue.length(), 2, 'Added another element');
});

// Flush method
asyncTest('Flush', 3, function() {
	// Flush empty queue
	this.queue.flush((function(context) {
		return function() {
			equals(context.queue.length(), 0, 'Flushed empty queue');
			start();
		};
	}(this)));
	QUnit.stop();
	
	// Flush one element
	this.queue.add(this.mock);
	this.queue.flush((function(context) {
		return function() {
			equals(context.queue.length(), 0, 'Flushed one element');
			start();
		};
	}(this)));
	QUnit.stop();

	// Try flushing more than one element
	this.queue.add(this.mock).add(this.mock);
	this.queue.flush((function(context) {
		return function() {
			equals(context.queue.length(), 0, 'Flushed two elements');
			start();
		};
	}(this)));
});