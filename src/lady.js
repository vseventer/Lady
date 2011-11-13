function Lady() {

	/**
	 * Allow script in innerHTML flag
	 * NOTE affects IE < 9
	 * @access private
	 * @var boolean _allowScript
	 */
	this._allowScript = null;

	/**
	 * Native doucment.write
	 * @access private
	 * @var function _write
	 */
	this._write = document.write;

	/**
	 * Autocapture flag
	 * @access public
	 * @var boolean autoCapture
	 */
	this.autoCapture = true;

	/**
	 * Queue
	 * @access public
	 * @var Array queue
	 */
	this.queue = [];

	// Constructor
	this.init();
}

/**
 * Enqueues item
 * 
 * @access public
 * @param String id
 * @param String data (optional)
 * @returns String
 */
Lady.prototype.enqueue = function(id, data) {
	data = data || null;
	if(null === data) {//generate ID
		data = id;
		id   = this._id();
	}

	this.queue.push({id: id, data: data});
	return id;
};

/**
 * Initializes lady
 * 
 * @access public
 * @returns void
 */
Lady.prototype.init = function() {
	// Overwrite native document.write
	if(this.autoCapture) {
		document.write = (function(that) {
			return function(raw) {
				var id = that.enqueue(raw);
				that._write.call(this, '<span id="' + id + '"></span>');
			};
		}(this));
	}

	// Determine script support
	var el = document.createElement('div');
	el.innerHTML = '<script></script>';
	this._allowScript = 1 === el.childNodes.length;
};

/**
 * Renders queue
 * 
 * @access public
 * @returns integer (number of rendered items)
 */
Lady.prototype.render = function() {
	var item,
	    result = 0,
	    target;

	// Dequeue items
	while(0 < this.queue.length) {
		item   = this.queue.shift();
		target = document.getElementById(item.id) || null;
		if(null !== target) {//target found
			this._render(item.data, target);
			result += 1;
		}
	}
	return result;
};

/**
 * Shallow clones node
 * 
 * @access private
 * @param HTMLElement node
 * @returns HTMLElement
 */
Lady.prototype._clone = function(node) {
	if(document.importNode) {
		return node.cloneNode(false);
	}

	// Internet Explorer < 9 does not support cloning between documents
	if('#text' === node.nodeName.toLowerCase()) {//plaintext
		return document.createTextNode(node.nodeValue);
	}

	// Complex node
	var i,
	    newNode = document.createElement(node.nodeName);

	// Add attributes
	for(i = 0; i < node.attributes.length; i += 1) {
		if(node.attributes[i].specified) {//IE7 needs this
			newNode.setAttribute(
				node.attributes[i].name,
				node.attributes[i].value
			);
		}
	}
	return newNode;
};

/**
 * Evaluates string
 * 
 * @access private
 * @param String data
 * @returns void
 */
Lady.prototype._eval = function(data) {
	if('' === data) {//nothing to eval
		return;
	}

	// @link http://perfectionkills.com/global-eval-what-are-the-options
	// @link http://www.blog.highub.com/javascript/decoding-jquery-evaluates-a-script-in-a-global-context/
	(window.execScript || function(data) {
		window['eval'].call(window, data);
	})(data);
};

/**
 * Generates ID
 * 
 * @access private
 * @returns String
 */
Lady.prototype._id = function() {
	return '__' + new Date().getTime();
};

/**
 * Injects node into target
 * 
 * @param DOMElement node
 * @param DOMElement target
 * @returns void
 */
Lady.prototype._inject = function(node, target) {
	var capture = '',
	    i,
	    newNode;

	// Handle node
	if(this._isScript(node)) {
		// Capture calls to document.write
		document.write = (function() {
			return function(raw) {
				capture += raw;
			};
		}());
		this._eval(node.innerHTML);

		// Inject capture
		if('' !== capture) {
			this._render(capture, target);
		}
	}
	else {//inject
		newNode = this._clone(node);
		target.appendChild(newNode);

		// Inject children
		for(i = 0; i < node.childNodes.length; i += 1) {
			this._inject(node.childNodes[i], newNode);
		}
	}
};

/**
 * Returns whether node is body of script
 * 
 * @param HTMLElement node
 * @returns boolean
 */
Lady.prototype._isScript = function(node) {
	if(!this._allowScript) {//check for converted node
		return 'textarea' === node.nodeName.toLowerCase()
		    && 'script'   === node.getAttribute('data-node').toLowerCase();
	}
	return 'script' === node.nodeName.toLowerCase();
};

/**
 * Renders data into target
 * 
 * @param String data
 * @param HTMLElement target
 * @returns void
 */
Lady.prototype._render = function(data, target) {
	var doc = this._stringToDom(data),
	    i;

	// Evaluate nodes
	for(i = 0; i < doc.length; i += 1) {
		this._inject(doc[i], target);
	}
};

/**
 * Converts string to DOM
 * 
 * @access private
 * @param String str
 * @returns Array (list of nodes)
 */
Lady.prototype._stringToDom = function(str) {
	if(!this._allowScript) {//convert node to textarea so it won’t be parsed
		// Textareas escape less/greater then
		str = str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

		// Convert scripts to textarea
		// NOTE data-node value is not quoted, to avoid JS syntax errors
		str = str.replace(/<script([^>]*)>/g, '<textarea data-node=script$1>')
		         .replace(/<\/script>/g,      '</textarea>');
	}

	// NOTE innerHTML is not in DOM API, but works best here
	var el = document.createElement('div');
	el.innerHTML = str;
	return el.childNodes;
};