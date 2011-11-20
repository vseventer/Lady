/*!
 * Queue
 * 
 * Asynchronous job queue.
 * 
 * @version 1.0beta
 * @author Markably
 * @link http://www.markably.com
 * @copyright (c) Markably
 */

/*jslint browser: true, nomen: true, white: true*/
;(function() {
	'use strict';

	/**
	 * Queue: queue for asynchronous callbacks
	 * 
	 * @access public 
	 */
	function Queue() {
		/**
		 * List of jobs
		 * @access private
		 * @var Array _jobs
		 */
		this._jobs = [];
	}

	/**
	 * Adds element to queue
	 * 
	 * @access public
	 * @param function fn (oncomplete)
	 * @returns Queue (fluent interface)
	 */
	Queue.prototype.add = function(fn) {
		this._jobs.push(fn);
		return this;
	};

	/**
	 * Removes element from queue
	 * NOTE passed to element as callback, effectively flushing whole queue
	 * 
	 * @access public
	 * @param function fn (oncomplete, optional)
	 * @returns void
	 */
	Queue.prototype.flush = function(fn) {
		if(0 === this.length()) {//complete
			fn && fn();
		}
		else {
			this._jobs.shift()((function(context) {
				return function() {
					context.flush(fn);
				};
			}(this)));
		}
	};

	/**
	 * Returns queue length
	 * 
	 * @access public
	 * @returns integer
	 */
	Queue.prototype.length = function() {
		return this._jobs.length;
	};

	// Expose
	window.Queue = Queue;
}());