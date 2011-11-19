/*jslint regexp: true, evil: true, white: true, nomen: true, maxerr: 50, indent: 4 */
/*globals document, XMLHttpRequest, window*/

;(function(window, document, undefined) {
	'use strict';

/**
 * Object definition
 * 
 * @access public
 * @param boolean autoCapture (optional)
 */
function Lady(autoCapture) {

	/**
	 * Native doucment.write
	 * @access private
	 * @var function _write
	 */
	this._write = document.write;

	/**
	 * Proxy
	 * @access public
	 * @var function proxy
	 */
	this.proxy = function(url) {
		return url;
	};
	
	/**
	 * Queue
	 * @access public
	 * @var Array queue
	 */
	this.queue = [];

	// Constructor
	this.init(false !== autoCapture);
}

/**
 * Enqueues item
 * 
 * @access public
 * @param String id
 * @param function|String data (optional)
 * @returns String
 */
Lady.prototype.enqueue = function(id, data, external) {
	data = data || null;
	if(null === data) {//generate ID
		data = id;
		id   = this._id();
	}

	// Type juggling
	if('function' === typeof data) {//call with window as context
		data = '<script>(' + data + '(this));</script>';
	}
	else if('object' === typeof data) {//src
		data = '<script src="' + (data.url || '') + '"></script>';
	}

	// Add to queue
	this.queue.push({id: id, data: data});
	return id;
};

/**
 * Initializes lady
 * 
 * @access public
 * @param boolean autoCapture
 * @returns void
 */
Lady.prototype.init = function(autoCapture) {
	// Overwrite native document.write
	if(autoCapture) {
		document.write = (function(that) {
			return function(raw) {
				var id = that.enqueue(raw);
				that._write.call(this, '<span class="lady-capture" id="' + id + '"></span>');
			};
		}(this));
	}
};

/**
 * Renders queue
 * 
 * @access public
 * @returns Array (rendered nodes)
 */
Lady.prototype.render = function() {
	var item,
	    result = [],
	    target;

	// Dequeue items
	while(0 < this.queue.length) {
		item   = this.queue.shift();
		target = document.getElementById(item.id) || null;
		if(null !== target) {
			target.setAttribute(//add class
				'class',
				'lady ' + (target.getAttribute('class') || target.className || '')
			);
		}
		else {//mock node at body end
			target = document.createElement('span');
			target.setAttribute('class', 'lady lady-mock');
			target.setAttribute('id',    item.id);
			document.getElementsByTagName('body')[0].appendChild(target);
		}

		this._render(item.data, target);
		result.push(target);
	}
	document.write = this._write;//restore

	return result;
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
 * Generates id
 * 
 * @access private
 * @returns String
 */
Lady.prototype._id = function() {
	return '__' + this.queue.length + '_' + new Date().getTime();
};

/**
 * Injects node into target
 * 
 * @param DOMElement node
 * @param DOMElement target
 * @returns void
 */
Lady.prototype._inject = function(node, target) {
	// Handle node
	if('script' === node.nodeName.toLowerCase()) {
		// Capture calls to document.write
		document.write = (function(that) {
			return function(raw) {
				that._render(raw, target);
			};
		}(this));

		// Eval node contents
		if((node.hasAttribute && node.hasAttribute('src')) || node.src) {//external
			this._eval(this._load(node.getAttribute('src')));
		}
		else {//inline
			this._eval(node.textContent || node.innerHTML);
		}
	}
	else {//inject
		var i,
		    newNode = node.cloneNode(false);//shallow
		target.appendChild(newNode);

		// Inject children
		for(i = 0; i < node.childNodes.length; i += 1) {
			this._inject(node.childNodes[i], newNode);
		}
	}
};

/**
 * Loads URL
 * NOTE synchronously, since sibling nodes may depend on content
 * 
 * @param String url
 * @returns String (response)
 */
Lady.prototype._load = function(url) {
	var request = new XMLHttpRequest();
	request.open('GET', this.proxy(url), false);
	request.send(null);
	if(2 === parseInt(request.status / 100, 10)) {//successful
		return request.responseText;
	}
	return '';//failed, no data
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
	//Add scoped element (only required by IE<9)
	// @link http://msdn.microsoft.com/en-us/library/ms533897(v=vs.85).aspx#1
	str = '<input type="hidden" />' + str;

	// NOTE innerHTML is not in DOM API, but works best here
	var el = document.createElement('div');
	el.innerHTML = str;
	el.removeChild(el.childNodes[0]);//IE<9: remove scoped element
	return el.childNodes;
};

window.Lady = Lady;//expose
}(window, document));