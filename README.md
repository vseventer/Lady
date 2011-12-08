Lady
====

Ads bring us money. Slow loading pages cost us money. Unfortunately, many ad providers still rely on the horribly outdated `document.write`, causing browsers to lock while loading.

So, why not combine the best of both worlds? Fast and nonblocking loads, together with ads to make some money. Lady defers script execution, either explicitly or implicitly, rendering `document.writes` asynchronously after all other content has been loaded. `document.write` is no longer your enemy!

By walking the DOM node by node, Lady is able to insert scripts at the designated positions, but at a later time. Instead of staring at a blank screen waiting for a third party server to respond, you can now load all ads asynchronously. No more waiting, but serious money making with ads that work.

### Nesting
Nesting of `document.write` is supported. Since Lady uses DOM manipulation techniques, they will be rendered where they are supposed to be. To make sure all deferreds are rendered in order, Lady uses an asynchronous queue.

### Parallelization
When you have deferred multiple unrelated scripts, you want them to execute in parallel. Although this is not a feature of Lady, you can simply create multiple instances to simulate this behavior.

- - -

## Support
Lady supports `document.close`, `document.open`, `document.write` and `document.writeln`. Moreover, deferreds are rendered using speculative parsing. More about this can be read here: https://developer.mozilla.org/en/HTML/HTML5/HTML5_Parser#Performance_improvement_with_speculative_parsing

No external library is needed to run Lady. Also, no explicit `eval`-calls are made. Ad codes are evil enough by themselves, aren’t they? In principal, the code rendered by Lady should be a 1-to-1 copy of its deferred.

Lady is tested succesfully in all major browsers, including Internet Explorer 7 and 8. IE6 is not supported.

- - -

## Caveats
Although I think Lady is production ready, some ad providers will eventually screw up. During the development, I got surprised by the horrible code ad providers are putting us through. So, be warned.

When you come along a piece of JavaScript that is not supported, drop me a line and I will look into it.

- - -
## API

Include Lady in the `head`:

    <script src="lady.min.js"></script>
    <script>var lady = new Lady();</script>

Or, if you want to enable autocapture, use:

    <script>var lady = new Lady().capture();</script>


When using autocapture, `document.write` calls will automatically be deferred. A placeholder is injected in its place.

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

More examples can be found in the demos folder. Just play around with Lady yourself and you’ll see.

- - -
## License
Since Lady is still in beta, you should probably test all your ad code before pushing it live.

Lady is written by Markably, http://www.markably.com, and is available under the New BSD License.