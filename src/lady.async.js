/*jslint browser: true, evil: true, nomen: true, white: true*/

;(function(window, document, undefined) {
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
	 * @param callback fn (oncomplete)
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
	 * @param callback fn (oncomplete, optional)
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


	/**
	 * Lady: lazy ad loader
	 * 
	 * @access public
	 */
	function Lady() {
		/**
		 * Native document.write
		 * @access private
		 * @var callback _write
		 */
		this._write = document.write;

		/**
		 * Snippet queue
		 * @access private
		 * @var Queue _queue
		 */
		this._queue = new Queue();
	}

	/**
	 * Enables document.write capturing
	 * 
	 * @access public
	 * @returns Lady (fluent interface)
	 */
	Lady.prototype.capture = function() {
		document.write = (function(context) {
			return function(raw) {
				var id = context._id();
				context.defer({
					id:   id,
					data: raw
				})._write.call(//write placeholder
					this,
					'<span class="lady-capture" id="' + id + '"></span>'
				);
			};
		}(this));
		return this;
	};

	/**
	 * Defers snippet
	 * 
	 * @param object options (id, data, url, fn)
	 * @returns Lady (fluent interface)
	 */
	Lady.prototype.defer = function(options) {
		// Juggle parameters
		var id  = options.id || this._id(),
		    data,
		    dfn;

		// Set data
		if(options.url) {
			data = '<script src="' + options.url + '"></script>';
			dfn  = function(el) {
				el.parentNode.removeChild(el);//remove node
				options.fn && options.fn(el);
			};
		}
		else {//data
			data = 'function' === typeof options.data
			     ? '<script>(' + options.data + ').call(window);</script>'
			     : options.data;
			dfn  = options.fn || function() { };
		}

		// Add to queue
		this._queue.add((function(context) {
			return function(fn) {
				var target = document.getElementById(id) || null;
				if(null !== target) {//add class
					target.className += (target.className ? ' ' : '') + 'lady';
				}
				else {//add mock element
					target = document.createElement('span');
					target.className = 'lady lady-mock';
					target.id        = id;
					(document.body || document.getElementsByTagName('body')[0]).appendChild(target);
				}

				context._render(data, target, function() {
					dfn && dfn(target);//item fn
					fn  && fn();//queue fn
				});
			};
		}(this)));
		return this;
	};

	/**
	 * Renders snippets
	 * 
	 * @access public
	 * @param callback fn (oncomplete, optional)
	 * @returns void
	 */
	Lady.prototype.render = function(fn) {
		this._queue.flush(fn);
	};

	/**
	 * Evaluates string
	 * 
	 * @access private
	 * @param String data
	 * @returns void
	 */
	Lady.prototype._eval = function(data) {
		(window.execScript || function(data) {
			window['eval'].call(window, data);
		})(data);
	};

	/**
	 * Returns unique id
	 * 
	 * @access private
	 * @returns String
	 */
	Lady.prototype._id = (function() {
		var i = 0;//static
		return function() {
			return '__' + (i += 1) + '_' + new Date().getTime();
		};
	}());

	/**
	 * Injects node into target 
	 * 
	 * @access private
	 * @param HTMLElement node
	 * @param HTMLElement target
	 * @param callback fn (oncomplete, optional)
	 * @returns void
	 */
	Lady.prototype._inject = function(node, target, fn) {
		var i,
		    newNode,
		    queue = new Queue(),

		    // Called in loop below to keep context 
		    enqueue = function(context, node, target) {
				queue.add(function(fn) {
					context._inject(node, target, fn);
				});
			};

		// Scripts need special attention
		if('script' === node.nodeName.toLowerCase()) {
			queue.add((function(context) {
				return function(fn) {
					context._injectScript(node, target, fn);
				};
			}(this)));
		}
		else {//normal node
			newNode = node.cloneNode(false);
			target.appendChild(newNode);

			// Inject children
			for(i = 0; i < node.childNodes.length; i += 1) {
				enqueue(this, node.childNodes[i], newNode);
			}
		}

		queue.flush(fn);
	};

	/**
	 * Injects script node into target
	 * 
	 * @access private
	 * @param HTMLElement node
	 * @param HTMLElement target
	 * @param callback fn (oncomplete, optional)
	 * @returs void
	 */
	Lady.prototype._injectScript = function(node, target, fn) {
		var queue = new Queue();

		// Local capturing
		document.write = document.writeln = (function(context) {
			return function(raw) {
				queue.add(function(fn) {
					context._render(raw, target, fn);
				});
			};
		}(this));

		// Handle nodetype
		if((node.hasAttribute && node.hasAttribute('src')) || node.src) {
			this._load(node.getAttribute('src'), function() {
				queue.flush(fn);
			});
		}
		else {//inline
			this._eval(node.textContent || node.innerHTML);
			queue.flush(fn);
		}
	};

	/**
	 * Loads external script
	 * 
	 * @access private
	 * @param String url
	 * @param callback fn (oncomplete, optional)
	 * @returns void
	 */
	Lady.prototype._load = function(url, fn) {
		var head   = document.head || document.getElementsByTagName('head')[0],
		    script = document.createElement('script');
		script.setAttribute('src',   url);
		script.setAttribute('async', 'async');

		// Attach callbacks
		script.onreadystatechange = function() {//IE
			var state = this.readyState.toLowerCase();
			if('complete' === state || 'loaded' === state) {
				this.onload();

				// Fix IE memory leak
				// @link http://www.ilinsky.com/articles/XMLHttpRequest/#bugs-ie-leak
				this.onerror = this.onload = this.onreadystatechange = null;
			}
		};
		script.onerror = script.onload = function() {
			head.removeChild(this);//remove node
			fn && fn();
		};
		head.appendChild(script);
	};

	/**
	 * Renders data into target
	 * 
	 * @access private
	 * @param String data
	 * @param HTMLElement target
	 * @param callback fn (oncomplete, optional)
	 * @returns void
	 */
	Lady.prototype._render = function(data, target, fn) {
		var nodelist = this._stringToDOM(data),
		    i,
		    queue    = new Queue(),

		    // Called in loop below to keep context 
		    enqueue = function(context, node) {
				queue.add(function(fn) {
					context._inject(node, target, fn);
				});
			};

		// Inject node after node
		for(i = 0; i < nodelist.length; i += 1) {
			enqueue(this, nodelist[i]);
		}
		queue.flush(fn);
	};

	/**
	 * Converts string to nodelist
	 * 
	 * @access private
	 * @param String str
	 * @returns Array (list of nodes)
	 */
	Lady.prototype._stringToDOM = function(str) {
		// Add scoped element (only required by IE<9)
		// @link http://msdn.microsoft.com/en-us/library/ms533897(v=vs.85).aspx#1
		str = '<input type="hidden" />' + str;

		// NOTE innerHTML is not in DOM API, but works best here
		var el = document.createElement('div');
		el.innerHTML = str;
		el.removeChild(el.childNodes[0]);//IE<9: remove scoped element
		return el.childNodes;
	};


	// Expose
	window.Lady = Lady;
}(window, document));