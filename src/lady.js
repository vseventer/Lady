/*!
 * Lady
 * 
 * Lady is an asynchronous document.write deferrer. It can be used to defer
 * loading of otherwise blocking ads or render document.writes in AJAX responses.
 * Lady uses DOM manipulation techniques to provide support for complex
 * scenarios, such as recursively nested scripts and speculative parsing.
 * No external library is required, and no eval is used. The resulting code
 * is exactly the same as before, only all is done asynchronously.
 * 
 * @version v1.0b3
 * @author Markably
 * @link http://www.markably.com
 * @copyright (c) Markably
 */
/*jslint browser: true, evil: true, nomen: true, white: true*/
;(function(window, document) {
	'use strict';

	/**
	 * Queue: asynchronous job chain
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


	/**
	 * Lady
	 * 
	 * @access public
	 */
	function Lady() {
		/**
		 * Native document
		 * @access private
		 * @var object _document
		 */
		this._document = {
			close:   document.close,
			open:    document.open,
			write:   document.write,
			writeln: document.writeln
		};

		/**
		 * Deferred queue
		 * @access private
		 * @var Queue _queue
		 */
		this._queue = new Queue(false);
	}

	/**
	 * Enables autocapturing
	 * 
	 * @access public
	 * @returns Lady (fluent interface)
	 */
	Lady.prototype.capture = function() {
		var buffer = '',
		    stream = 0,//level
		    target,

		    // Generic write overwrite
		    write = function(context, sep) {
				return function() {
					buffer += [].concat.apply([], arguments).join(sep) + sep;//join argv
					if(0 === stream) {
						var id = context._id();
						context.defer({ id: id, data: buffer })
						       ._document.write.call(
							this,
							'<span class="lady-capture" id="' + id + '"></span>'
						);
						buffer = '';//reset
					}
				};
			};

		// Overwrite native implementations
		document.close   = (function(context) {
			return function() {
				stream -= 1;
				if(0 === stream) {//end stream
					context._defer({ id: target, data: buffer });
					buffer = '';//reset
				}
			};
		}(this));
		document.open    = (function(context) {
			return function() {
				stream += 1;
				if(1 === stream) {//start stream
					target = context._id();
					context._document.write.call(//placeholder
						this,
						'<span class="lady-capture" id="' + target + '"></span>'
					);
				}
			};
		}(this));
		document.write   = write(this, '');
		document.writeln = write(this, "\n");
		return this;
	};

	/**
	 * Defers snippet
	 * 
	 * @access public
	 * @param object options
	 * @returns Lady (fluent interface)
	 */
	Lady.prototype.defer = function(options) {
		// Juggle parameters
		var id  = options.id || this._id(),
		    data,
		    dfn = options.fn || function() { };

		// Data
		if(options.url) {//URL
			data = '<script src="' + options.url + '"></script>';
		}
		else {//inline
			data = 'function' === typeof options.data
			     ? '<script>(' + options.data + ').call(window);</script>'
			     : options.data;
		}

		// Enqueue
		this._queue.add((function(context) {
			return function(fn) {
				var target = document.getElementById(id) || null;
				if(null === target) {//mock target
					target           = document.createElement('div');
					target.className = 'lady-mock';
					target.id        = id;
					document.body.appendChild(target);
				}

				// Add class
				if(target.classList) {
					target.classList.add('lady');
				}
				else {
					target.className += ' lady';
				}

				// Render
				context._render(data, target, function() {
					fn  && fn();//queue fn
					dfn && dfn(target);//defer fn
				});
			};
		}(this)));
		return this;
	};

	/**
	 * Renders deferreds
	 * 
	 * @access public
	 * @param function fn (optional, oncomplete)
	 * @returns void
	 */
	Lady.prototype.render = function(fn) {
		this._queue.flush(fn);
	};

	/**
	 * Restores native document.*
	 * 
	 * @access public
	 * @returns Lady (fluent interface)
	 */
	Lady.prototype.restore = function() {
		document.close   = this._document.close;
		document.open    = this._document.open;
		document.write   = this._document.write;
		document.writeln = this._document.writeln;
		return this;
	};

	/**
	 * Returns unique id
	 * 
	 * @access private
	 * @returns string
	 */
	Lady.prototype._id = (function() {
		var i = 0;//static
		return function() {
			return '_lady-' + (i += 1) + '-' + new Date().getTime();
		};
	}());

	/**
	 * Imports node
	 * 
	 * @access private
	 * @param HTMLElement node
	 * @param boolean deep (optional, defaults to true)
	 * @returns HTMLElement
	 */
	Lady.prototype._import = function(node, deep) {
		deep = 'undefined' === typeof deep || deep || false;
		if(document.implementation.createHTMLDocument && document.createRange
	     && document.createRange().createContextualFragment) {
			return document.importNode(node, deep);
		}

		// IE: import manually
		// @link http://www.alistapart.com/articles/crossbrowserscripting/
		switch(node.nodeType) {
			// Element
			case document.ELEMENT_NODE || 1:
				var i,
				    newNode = node.cloneNode(false);

				// Revert attributes
				if((newNode.hasAttribute && newNode.hasAttribute('_src'))
				 || newNode._src) {//IE7
					newNode.setAttribute('src', newNode.getAttribute('_src'));
					newNode.removeAttribute('_src');
				}
				if((newNode.hasAttribute && newNode.hasAttribute('_value'))
				 || newNode._value) {//IE7
					newNode.setAttribute('value', newNode.getAttribute('_value'));
					newNode.removeAttribute('_value');
				}

				// IE<9: scripts use property instead of text node
				if('script' === node.nodeName.toLowerCase()) {
					newNode.text = node.text && node.text.replace(/_(src|value)=/g, '$1=');
				}
				else if(deep) {//children
					for(i = 0; i < node.childNodes.length; i += 1) {
						newNode.appendChild(
							this._import(node.childNodes.item(i), deep)
						);
					}
				}
				return newNode;

			// Text
			case document.TEXT_NODE          || 3:
				return document.createTextNode(
					node.nodeValue.replace(/_(src|value)=/g, '$1=')
				);
			case document.CDATA_SECTION_NODE || 4:
				return document.createCDATASection(
					node.nodeValue.replace(/_(src|value)=/g, '$1=')
				);
			case document.COMMENT_NODE       || 8:
				return document.createComment(
					node.nodeValue.replace(/_(src|value)=/g, '$1=')
				);

			// Unsupported node, return mock
			default:
				return document.createTextNode(''); 
		}
	};

	/**
	 * Renders node into target
	 * 
	 * @access private
	 * @param HTMLElement node
	 * @param HTMLElement target
	 * @param function fn
	 * @returns void
	 */
	Lady.prototype._inject = function(node, target, fn) {
		var context = this,
		    i,
		    newNode,
		    queue   = new Queue(),

		    // Called in loop below to keep context
		    enqueue = function(context, node, target) { 
				queue.add(function(fn) {
					context._inject(node, target, fn);
				});
			};

		// Script node 
		if('script' === node.nodeName.toLowerCase()) {
			queue.add(function(fn) {
				context._injectScript(node, target, fn);
			});
		}
		else {//boring node
			newNode = this._import(node, false);//shallow
			target.appendChild(newNode);

			// Inject each child
			for(i = 0; i < node.childNodes.length; i += 1) {
				enqueue(this, node.childNodes.item(i), newNode);
			}
		}
		queue.flush(fn);//go
	};

	/**
	 * Injects script node into target
	 * 
	 * @param HTMLScriptElement node
	 * @param HTMLElement target
	 * @param function fn (optional, oncomplete)
	 * @returns void
	 */
	Lady.prototype._injectScript = function(node, target, fn) {
		var context   = this,
		    script    = this._import(node, true),//deep
		    queue     = new Queue(),

		    // Control flow
		    buffer    = '',
		    stream    = 0,//level

		    // Local document.* overwrites
		    _document = {
				open:    document.open,
				close:   document.close,
				write:   document.write,
				writeln: document.writeln
			},
		    restore   = function() {//restores previous document.*
				document.close   = _document.close;
				document.open    = _document.open;
				document.write   = _document.write;
				document.writeln = _document.writeln;
			},
		    write     = function(sep) {
				return function() {
					buffer += [].concat.apply([], arguments).join(sep) + sep;//join argv
					if(0 === stream && context._validate(buffer)) {
						(function(buffer) {
							queue.add(function(fn) {
								context._render(buffer, target, fn);
							});							
						}(buffer));
						buffer = '';//reset
					}
				};
			};

		// Overwrite native implementations
		document.close   = function() {
			stream -= 1;
			if(0 === stream) {//end stream
				(function(buffer) {
					queue.add(function(fn) {
						context._render(buffer, target, fn);
					});
				}(buffer));
				buffer = '';
			}
		};
		document.open    = function() {
			stream += 1;
		};
		document.write   = write('');
		document.writeln = write("\n");

		// Resource
		if((script.hasAttribute && script.hasAttribute('src')) || script.src) {//external
			script.onreadystatechange = function() {//IE<9
				var state = this.readyState.toLowerCase();
				if('complete' === state || 'loaded' === state) {
					this.onload();

					// IE9 fires both onreadystatechange and onload, so deattach
					this.onerror = this.onload = this.onreadystatechange = null;
				}
			};
			script.onerror = script.onload = function() {
				if('' !== buffer) {//remaining buffer
					queue.add(function(fn) {
						context._render(buffer, target, fn);
					});
				}
				queue.flush(function() {//go
					restore && restore();
					fn      && fn();
				});
			};
			target.appendChild(script);
		}
		else {//internal
			target.appendChild(script);
			if('' !== buffer) {//remaining buffer
				queue.add(function(fn) {
					context._render(buffer, target, fn);
				});
			}
			queue.flush(function() {//go
				restore && restore();
				fn      && fn();
			});
		}
	};

	/**
	 * Renders string into target
	 * 
	 * @access private
	 * @param string str
	 * @param HTMLElement target
	 * @param function fn (optional, oncomplete)
	 * @returns void
	 */
	Lady.prototype._render = function(str, target, fn) {
		var nodelist = this._tokenize(str),
		    i,
		    queue    = new Queue(),

		    // Called in loop below to keep context
		    enqueue  = function(context, node) {
				queue.add(function(fn) {
					context._inject(node, target, fn);
				});
			};

		// Inject each node
		for(i = 0; i < nodelist.length; i += 1) {
			enqueue(this, nodelist.item(i));
		}
		queue.flush(fn);//go
	};

	/**
	 * Tokenizes string
	 * 
	 * @access private
	 * @param string str
	 * @returns NodeList
	 */
	Lady.prototype._tokenize = function(str) {
		var doc,
		    mock,
		    range;

		// Fragmentize
		if(document.implementation.createHTMLDocument && document.createRange
	     && document.createRange().createContextualFragment) {
			doc   = document.implementation.createHTMLDocument('tokenizer');
			mock  = doc.createElement('div');
			range = doc.createRange();
			doc.body.appendChild(mock);
			range.selectNode(mock);
			return range.createContextualFragment(str).childNodes;
		}

		// IE: use innerHTML
		// @link http://msdn.microsoft.com/en-us/library/ms533897(v=vs.85).aspx#1
		mock = document.createElement('div');
		mock.innerHTML = '<input type="hidden" />'//add scoped element
			           + str.replace(/ (src|value)=/g, ' _$1=');//avoid resource preloading
		mock.removeChild(mock.childNodes.item(0));//remove scoped element
		return mock.childNodes;
	};

	/**
	 * Validates HTML string
	 * 
	 * @access private
	 * @param string str
	 * @returns boolean
	 */
	Lady.prototype._validate = function(str) {
		// @link http://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx
		// NOTE self-closing tags do not matter
		var open  = str.match(/<\w+(?:(?:\s+\w+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^'">\s]+))?)+\s*|\s*)>/, str),
		    close = str.match(/<\/\w+\s*>/, str);
		return open === close || (open && close && open.length === close.length);
	};

	// Expose
	window.Lady = Lady;
}(window, document));