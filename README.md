Lady
====

Ads bring us money. However, synchronously loading ads through endless `document.writes` cost us money. So, why not load our ads asynchronously? Lady defers script execution, either explicitly or implicitly, rendering their output after all other content is loaded. `document.write` is no longer your enemy!

By walking the DOM node by node, Lady is able to insert scripts at the designated position, but at a later time. Instead of staring at a blank screen waiting for a third party server to respond, you can now load all ads asynchronously. No more waiting, just making money with ads that work.

### Nesting
Nesting of `document.write(ln)`s is supported. Since Lady uses DOM manipulation techniques, they will be rendered where they are supposed to be. To make sure all deferreds are rendered in order, Lady uses an asynchronous queue.

### Parallelization
When you have deferred multiple unrelated scripts, you want them to execute in parallel. Although this is not a feature of Lady, you can simply create multiple instances to simulate this behavior.

- - -
## Support
Lady is tested succesfully in all major browsers, including Internet Explorer 7 and 8. IE6 is not supported.

- - -
## API

Include Lady in the `head`:

    <script src="lady.min.js"></script>
    <script>var lady = new Lady();</script>

Or, if you want to enable autocapture, use:

    <script>var lady = new Lady().capture();</script>


When using autocapture, `document.write(ln)` calls will automatically be deferred. Instead, a placeholder is put into place.

For more advanced users, explicit defers can be used as follows:

    lady.defer({options});

Available `options` :

    id:   target element, specified by id,
    data: String or function to be executed asynchronously,
    url:  JavaScript file to be executed asynchronously,
    fn:   oncomplete function, target element is passed as argument.

`data` and `url` are mutually exclusive. Both `id` and `fn` are optional. If no `id` specified, the placeholder will be appended to `body`.

When the document is loaded, you want Lady to render all deferred items. This can be done by calling:

     lady.render();

Target elements need to be present in the DOM when calling `render()`, otherwise a mock container is created. 

- - -
## Examples

### Example 1: Using `document.write`
    <script>document.write(myExpensiveFunction());</script>

### Example 2: Deferring an external JavaScript file
    lady.defer({
        url: 'http://www.example.com/js.js',//external script
        fn:  function(el) {//oncomplete callback
            el.parentNode.removeChild(el);//remove target from DOM
        }
    });

### Example 3: Deferring a function
    lady.defer({
        id:   'function-result-dom-element',//target
        data: function() {//code to execute asynchronously
            // Executed in window context
            myExpensiveFunction();
        },
        fn:   function(el) {//oncomplete callback
            console.log('myExpensiveFunction() result: ', el.innerHTML);
        }
     });

### Example 4: Deferring DOM nodes
    lady.defer({
        id:   'function-result-dom-element',//target
        data: '<script>myExpensiveFunction();</script>'//nodes to insert
    });

### Example 5: Rendering deferreds
    // Doesn't work in IE<9
    document.addEventListener('DOMContentLoaded, function() {
        lady.render();
    }, false);

### Example 6: parsing AJAX responses
     // Assume response resides in request.responseText
     lady.defer({
         id:   'ajax-result-dom-element',//target
         data: request.responseText
     }).render();

### Example 7: Placeholders
#### Example 7a: captured `document.write(ln)`
    <span class="lady lady-capture" id="lady-<i>-<time>"></span>

#### Example 7b: `defer()` with `id` unknown or unspecified
    <span class="lady lady-mock" id="lady-<i>-<time>"></span>

#### Example 7c: `defer()` with `id` specified
    <span class="<your-classes> lady" id="<your-id>"></span>

- - -
## License
Since Lady is still in beta, you are not allowed to use this product yet. However, if you would like to test things out, drop me a line and we´ll discuss.

Lady is written by Markably, http://www.markably.com.