/**
 * Queue test suite
 */
module('Queue', {
	setup: function() {
		this.mock  = function(fn) {
			fn && fn();
		};
		this.queue = new Queue(false);
	}
});

// Constructor
test('Constructor', function() {
	equals(typeof this.queue, 'object', 'Constructor');
	equals(this.queue.length(), 0, 'Number of jobs');
});

// Add method
test('Add', function() {
	deepEqual(this.queue.add(this.mock), this.queue, 'Return value');
	strictEqual(this.queue.length(), 1, 'Added one element');

	this.queue.add(this.mock);
	strictEqual(this.queue.length(), 2, 'Added another element');
});

// Flush method
asyncTest('Flush', 3, function() {
	var queue = this.queue;//make accessible in function scope

	// Flush empty queue
	this.queue.flush(function() {
		strictEqual(queue.length(), 0, 'Flushed empty queue');
		start();
	});
	QUnit.stop();

	// Flush one element
	this.queue.add(this.mock);
	this.queue.flush(function() {
		strictEqual(queue.length(), 0, 'Flushed one element');
		start();
	});
	QUnit.stop();

	// Try flushing more than one element
	this.queue.add(this.mock).add(this.mock);
	this.queue.flush(function() {
		strictEqual(queue.length(), 0, 'Flushed two elements');
		start();
	});
});

/**
 * Instant queue test suite
 */
module('Instant queue', {
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
	equals(this.queue.length(), 0, 'Number of jobs');
});

// Add method
test('Add', function() {
	deepEqual(this.queue.add(this.mock), this.queue, 'Return value');
	strictEqual(this.queue.length(), 0, 'Added one element, flushed instantly');

	this.queue.add(this.mock);
	strictEqual(this.queue.length(), 0, 'Added another element, flushed also');
});

// Flush method
asyncTest('Flush', 2, function() {
	var queue = this.queue;//make accessible in function scope

	// Flush empty queue
	this.queue.flush(function(fn) {
		strictEqual(queue.length(), 0, 'Flushed empty queue');
		fn && fn();//needed for next test
		start();
	});
	QUnit.stop();

	// Flush one element
	this.queue.add(this.mock);
	this.queue.flush(function(fn) {
		strictEqual(queue.length(), 0, 'Flushed one element');
		fn && fn();//needed for next test
		start();
	});
});