Lady
====

Ads bring us money. Slow loading pages cost us money. Unfortunately, many ad providers still rely on the horribly outdated `document.write`, causing browsers to lock while loading.

So, why not combine the best of both worlds? Fast and nonblocking loads, together with ads to make some money. Lady defers script execution, either explicitly or implicitly, rendering `document.writes` asynchronously after all other content has been loaded. `document.write` is no longer your enemy!

By walking the DOM node by node, Lady is able to insert scripts at the designated positions, but at a later time. Instead of staring at a blank screen waiting for a third party server to respond, you can now load all ads asynchronously. No more waiting, but serious money making with ads that work.

### Nesting
Nesting of `document.write` is supported. Since Lady uses DOM manipulation techniques, they will be rendered where they are supposed to be. To make sure all deferreds are rendered in order, Lady uses an asynchronous queue.

Deferreds can be nested. The asynchronous queue Lady uses is part of a level stack, which takes care of the nesting. 

## Support
Lady supports `document.close`, `document.open`, `document.write` and `document.writeln`. Moreover, deferreds are rendered using speculative parsing. More about this can be read [here] (https://developer.mozilla.org/en/HTML/HTML5/HTML5_Parser#Performance_improvement_with_speculative_parsing).

No external library is needed to run Lady. Also, no explicit `eval`-calls are made (except to circumvent a Firefox bug). Ad codes are evil enough by themselves, aren’t they? In principal, the code rendered by Lady should be a 1-to-1 copy of its deferred.

Lady is tested succesfully in:

* Chrome 15 and up,
* Firefox 3 and up,
* Internet Explorer 7 and up (not IE6),
* Opera 11 and up,
* Safari 5 and up.


## Caveats
Although I think Lady is almost production ready, some ad providers will eventually screw up. During the development, I got surprised by the horrible code ad providers are putting us through. So, be warned.

When you come along a piece of JavaScript that is not supported, drop me a line and I will look into it.


## API

Include Lady in the `head`:

```html
<script src="lady.min.js"></script>
<script>var lady = new Lady();</script>
```

In order for Lady to defer `document.write`, you should use the API. Existing code will not magically be converted. Using `document.write` in the body directly is deprecated anyway.

Defers can be created as follows:

```javascript
lady.defer(data, fn);
lady.defer({ options });

/*
Arguments and options:
data:   URL or function to be executed asynchronously,
fn:     oncomplete function, target element is passed as argument,
html:   snippet of HTML to be parsed (deprecated),
target: target element, either a live HTMLElement, or id string,
*/
```

`html` and `data` are mutually exclusive. Both `target` and `fn` are optional. If no `target` is specified, a placeholder will be inserted.

For parsing HTML snippets, the following shortcut is available:

```javascript
lady.parse(html, fn);
lady.parse({ options });

/* Arguments and options:
fn:     oncomplete function, target element is passed as argument,
html:   snippet of HTML to be parsed
target: target element, either a live HTMLElement, or id string,
*/
```

Both `target` and `fn` are optional. Lady will automatically clean all scripts in target, to avoid multiple execution when doing further manipulation.

When the document is loaded, you want Lady to render all deferred items. This can be done by calling:

```javascript
lady.render([fn]);

/*
Arguments:
fn: oncomplete function, no arguments. 
*/
```

Target elements need to be present in the DOM when calling `render()`, otherwise a mock container is created. When inserting deferreds after onload, Lady will append placeholders to the `body`. 


## Examples

### Example 1: Deferring an external JavaScript file
```javascript
lady.defer('http://www.example.com/js.js');

// or

lady.defer({
	target: 'id',
	data:   'http://www.example.com/js.js'
});
```

### Example 2: Deferring a function
```javascript
lady.defer(function() {
	myExpensiveFunction();
}, function(el) {
	console.log('myExpensiveFunction() result: ', el.innerHTML);
});

// or

lady.defer({
    id:   'id',//target
    data: function() {//code to execute asynchronously
        // Executed in window context
        myExpensiveFunction();
    },
    fn:   function(el) {//oncomplete callback
        console.log('myExpensiveFunction() result: ', el.innerHTML);
    }
});
```

### Example 3: Rendering deferreds
 ```javascript
// Doesn't work in IE<9
document.addEventListener('DOMContentLoaded', function() {
    lady.render();
}, false);
```

### Example 4: parsing AJAX responses
```javascript
// Assume response resides in request.responseText
lady.defer({
    html:  request.responseText,
    fn:    function(el) {
        document.getElementById('target').appendChild(el);
    },
    clean: true//don't evaluate again when appending 
}).render();
```

### Example 5: Placeholders
#### Example 5a: existent target
```html
<!-- Assume target is div#target -->
<div class="<target-classes> lady" id="target"></div>
```

#### Example 5b: non-existent target specified
```html
<!-- Assume target id is target -->
<span class="lady-mock lady" id="target"></span>
```

#### Example 5c: no target specified
```html
<span class="lady-mock lady"></span>
```

More examples can be found in the demos folder. Just play around with Lady yourself and you’ll see.


## License
Since Lady is still in development, you should probably test all your ad code before pushing it live.

Lady is written by [Markably] (http://www.markably.com), and is available under the New BSD License.