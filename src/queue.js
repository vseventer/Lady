/*!
 * Queue
 * 
 * Asynchronous job chain
 * 
 * @version v1.0b3
 * @author Markably
 * @link http://www.markably.com
 * @copyright (c) Markably
 */

/*jslint browser: true, nomen: true, white: true*/
;(function(window) {
	'use strict';

	/**
	 * Queue
	 * 
	 * @access public
	 * @param boolean instant (optional, defaults to true)
	 */
	function Queue(instant) {
		/**
		 * Instant
		 * @access private
		 * @var boolean _instant
		 */
		this._instant = 'undefined' === typeof instant || instant || false;

		/**
		 * Jobs
		 * @access private
		 * @var Array _jobs
		 */
		this._jobs = [];

		/**
		 * Pending jobs (instant mode)
		 * @access private
		 * @var integer _pending
		 */
		this._pending = 0;
	}

	/**
	 * Adds job to queue
	 * 
	 * @access public
	 * @param function fn
	 * @returns Queue (fluent interface)
	 */
	Queue.prototype.add = function(fn) {
		this._jobs.push(fn);

		// Instant queue
		if(this._instant) {
			this._pending += 1;
			if(1 === this._pending) {
				var shift = (function(context) {
				    return function() {
						context._pending -= 1;
						if(0 < context._pending) {
							context._jobs.shift()(shift);
						}
				    };
				}(this));
				this._jobs.shift()(shift);
			}
		}
		return this;
	};

	/**
	 * Flushes queue
	 * 
	 * @param function fn (optional, oncomplete)
	 * @returns void
	 */
	Queue.prototype.flush = function(fn) {
		// Instant queues are already being processed
		if(this._instant) {
			fn && this.add(function(sfn) {
				sfn && sfn();//shift fn
				fn  && fn();//queue fn
			});
			return;
		}

		// Waiting queue
		if(0 === this._jobs.length) {
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
	 * Returns number of jobs
	 * 
	 * @access public
	 * @returns integer
	 */
	Queue.prototype.length = function() {
		return this._jobs.length;
	};

	// Expose
	window.Queue = Queue;
}(window));