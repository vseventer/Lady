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
 * @version v1.0dev
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
	 * @access public
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
		 * Document state
		 * @access private
		 * @var boolean _loaded
		 */
		this._loaded = false;

		/**
		 * Deferred queue stack
		 * @access private
		 * @var Array _stack
		 */
		this._stack = [
			new Queue(false)
		];

		/**
		 * Mock target
		 * @access private
		 * @var Array _target
		 */
		this._target = [];

		// Constructor
		var listener = (function(context) {
			return function() {
				context._loaded = true;
			};
		}(this));
		if(document.addEventListener) {
			document.addEventListener('DOMContentLoaded', listener, false);
		}
		else {//mostly IE9
			document.onreadystatechange = function() {
				// Interactive equals DOMContentLoaded, but doesn't always fire
				if(this.readyState.match(/interactive|complete/)) {
					this.onreadystatechange = null;//unbind
					listener();
				}
			};
		}
	}

	/**
	 * Defers snippet
	 * 
	 * @access public
	 * @param function|object|string options
	 * @param function fn (optional, oncomplete)
	 * @returns Lady (fluent interface)
	 */
	Lady.prototype.defer = function(options, fn) {
		// Juggle parameters
		if('object' !== typeof options) {//plain
			options = {	data: options, fn: fn };
		}
		options.data   = options.html || ('string' === typeof options.data
                       ? '<script src="' + options.data + '"></script>'//URL
	                   : '<script>(' + options.data + ').call(window);</script>');//function
		options.target = options.target || this._mock();                   

		// Enqueue
		this._stack[0].add((function(context) {
			return function(fn) {
				context._stack.unshift(new Queue(false));//add nesting level

				// Target
				if('object' !== typeof options.target) {//append to body
					options.target = document.getElementById(options.target);
					if(!options.target) {//still non-existent, mock
						options.target = document.createElement('span');
						options.target.className = 'lady-mock';
						document.body.appendChild(options.target);
					}
				}

				// Add class
				if(options.target.classList) {//HTML5 API
					options.target.classList.add('lady');
				}
				else if(!options.target.className.match(/(?:^|\s)lady(?:\s|$)/)) {
					options.target.className +=
					 ('' !== options.target.className ? ' ' : '') + 'lady';
				}

				// Render
				context._render(options.data, options.target, function() {
					context._stack.shift().flush(function() {//render nested
						options.fn && options.fn(options.target);//defer fn
						fn         && fn();//queue fn						
					});
				});
			};
		}(this)));
		return this;
	};

	/**
	 * Parses HTML snippet
	 * 
	 * @access public
	 * @param object|string options
	 * @param function fn (optional, oncomplete)
	 * @returns Lady (fluent interface)
	 */
	Lady.prototype.parse = function(options, fn) {
		// Juggle parameters
		if('object' !== typeof options) {//plain
			options = {	html: options, fn: fn };
		}

		// Called in loop below to keep context
		var clean = function(node) {
			if((node.hasAttribute && node.hasAttribute('src')) || node.src) {
				node.setAttribute('data-lady-src', node.getAttribute('src'));
				node.removeAttribute('src');//reset
			}
			else {
				node.setAttribute('data-lady-text', node.text);
				node.text = '';//reset
			}
		};

		// Enqueue
		return this.defer({
			fn:     function(el) {
				// Clean scripts to avoid double execution
				var i,
				    script = el.getElementsByTagName('script');
				for(i = 0; i < script.length; i += 1) {
					clean(script[i]);
				}
				options.fn && options.fn(el);//parse fn
			},
			html:   options.html,
			target: options.target
		});
	};

	/**
	 * Renders deferreds
	 * 
	 * @access public
	 * @param function fn (optional, oncomplete)
	 * @returns void
	 */
	Lady.prototype.render = function(fn) {
		this._stack[0].flush(fn);
	};

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
		else if((document.ELEMENT_NODE || 1) === node.nodeType
		 && !node.getElementsByTagName('script').length) {//no scripts inside
			target.appendChild(this._import(node));
		}
		else {//scripts somewhere
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
				context._target.shift();
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
		document.write   = function() {
			buffer += [].slice.call(arguments, 0).join('');//join argv
			if(0 === stream && context._validate(buffer)) {
				(function(buffer) {
					queue.add(function(fn) {
						context._render(buffer, target, fn);
					});							
				}(buffer));
				buffer = '';//reset
			}
		};
		document.writeln = function() {//forward call to document.write
			document.write([].slice.call(arguments, 0).join("\n") + "\n");//join argv
		};
		this._target.unshift(target);//set mock target

		// Resource
		if((script.hasAttribute && script.hasAttribute('src')) || script.src) {//external
			if('undefined' === typeof script.onload) {//IE<9
				script.onreadystatechange = function() {
					var state = this.readyState.toLowerCase();
					if('complete' === state || 'loaded' === state) {
						this.onload();

						// Deattach callback
						this.onreadystatechange = null;
					}
				};
			}
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
			// NOTE Firefox<4 executes inline scripts asynchronously
			// @link http://www.softwareishard.com/blog/firebug/script-execution-analysis-in-firefox-4/
			if(false === script.async) {//execute synchronously
				window['eval'].call(window, script.text);
				script.text = '';//reset to avoid double execution
			}

			// Insert and evaluate node
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
	 * Mocks deferred
	 * 
	 * @access private
	 * @returns HTMLElement
	 */
	Lady.prototype._mock = function() {
		// Nested call, use parent target
		if(this._target[0]) {
			return this._target[0];
		}

		// Create mock
		var target;
		if(this._loaded) {//use DOM
			target = document.createElement('span');
			document.body.appendChild(target);//insert
		}
		else if(!document.body) {//can't write yet, use head
			return document.head || document.getElementsByTagName('head')[0];
		}
		else {//body available, use document.write
			this._document.write.call(
				document,
				'<span id="__lady"></span>'
			);

			// Extract HTMLElement
			target = document.getElementById('__lady');
			target.removeAttribute('id');
		}

		// Add class
		target.className = 'lady-mock lady';
		return target;
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
		mock.removeChild(mock.firstChild);//remove scoped element
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