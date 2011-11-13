function Lady() {

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

	// IE < 9
	// NOTE importNode not available, so copy alien node in document
	if('#text' === node.nodeName.toLowerCase()) {//simple node
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
	    doc,
	    i,
	    newNode = this._clone(node),
	    tmp;

	// Capture document.writes from node
	document.write = (function() {
		return function(raw) {
			capture += raw;
		};
	}());

	// Handle node
	if(this._isScript(node)) {
		// Disconnect obsolete parent
		if(document.importNode) {
			this._eval(node.nodeValue);

			tmp = target.parentNode;
			tmp.removeChild(target);
			target = tmp;
		}
		else {//IE
			this._eval(node.innerHTML);
		}
	}
	else {//inject
		target.appendChild(newNode);
	}

	// Inject capture
	if('' !== capture) {
		this._render(capture, target);
	}

	// Inject children
	for(i = 0; i < node.childNodes.length; i += 1) {
		this._inject(node.childNodes[i], newNode);
	}
};

/**
 * Returns whether node is body of script
 * 
 * @param HTMLElement node
 * @returns boolean
 */
Lady.prototype._isScript = function(node) {
	if(!document.importNode) {//IE<9
		// Check for converted script tags
		return 'object' === node.nodeName.toLowerCase()
		    && 'script' === node.getAttribute('data-node').toLowerCase();
	}
	return '#text' === node.nodeName.toLowerCase()
	 && 'script' === node.parentNode.nodeName.toLowerCase();
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
	if(!document.importNode) {//IE<9
		// Avoid IE rendering script directly, so convert node to object
		str = str.replace(/<script([^>]*)>/g, '<object data-node="script"$1>')
                 .replace(/<\/script>/g,      '</object>');
	}
	var el = document.createElement('div');
	el.innerHTML = str;
	return el.childNodes;
};