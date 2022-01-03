# Resource groups

The `body` uses `resource groups` to organize what to put in it. This can be interpreted as `include` or `require`. 

Take the code as an example  

`"./tpl/index.html": { "type": "html", "target": { "type": "body" } }`  

where `". /tpl/index.html"` is the actual path of the resource, and its value is the specific attribute description
When the resource file is `html`, you need to set `type` to `html` in the property description, so that the `tmpUI` engine will
will write the resource to the page as `html` code, and it is up to `target` to decide where to write it. 

Note that if you write `<script> ... </script>` tags in the `html` file, this will not take effect, which is an exception.  
Therefore, all `Javascript` code should be wrapped in a separate file and then added to the page via the `resource group`.

| Combination | Description |
|-----|-----|
|`"target":{"type": "body" }}`|This resource will be written to `tmpui_body`|
|`"target":{"type": "id", "val": "dom"}}`|This resource will be replaced with the `DOM` of the specified `id`, which is specified by `val`. Note that this is a replacement for|

In this example, we set the basic template for the whole page with `target : body`, and then set the template header and footer for the page with `target : id`.    

It would be tedious to configure this in every route, so in the next column, we will introduce the use of "Pre-Resource Groups" and "Post-Resource Groups" to accomplish this task in bulk.

## Pre- and post-resource groups

### 1, loading order

If you want to embed a lot of files or resources on a lot of pages, in `PHP` you can include another `PHP` file in one of the `header` files. In `tmpUI` it's a little different, we use a faster way: `front` and `back` resource groups.  
When `tmpUI` loads the resource files, they are loaded in this order, which is basically the same as in a normal browser. 

`Front-end Resource Group(preload) -> Main Body(body) -> Post Resource Group(append)`


In `Example 1` above, we only loaded the resource group set in `body` because we didn't configure the front and back resource groups. Now, we are going to change the code a little to include `bootstrap`. The `bootstrap` will be set to the front resource group. Here is the changed code (the code is available in `example 2`):

```javascript
var app = new tmpUI({
   "googleAnalytics": "G-4DGYKM9EHS",
   "loadingIcon": "/tpl/img/logo.png",
   "loadingPage": true,
   "loadingProgress": true,
   "preload": {
       "bootstrap": {
           "/tpl/plugin/bootstrap4/jquery.min.js": { "type": "js", "reload": false },
           "/tpl/plugin/bootstrap4/bootstrap.bundle.min.js": { "type": "js", "reload":false },false },
       }
       "/tpl/plugin/bootstrap4/bootstrap.min.css": { "type": "css", "reload":
       "/tpl/css/reset.css": { "type": "css", "reload": false },
    }, "path": {
       "/": {
           "title": "tmpUI App!",
           "preload":["bootstrap"],
           "body": {
               "./tpl/index.html": { "type": "html", "target": { "type": "body" } },
               "./tpl/header.html": { "type": "html", "target": { "type": "id", "val":"tpl_header" } },
               "./tpl/footer.html": { "type": "html", "target": { "type": "id", "val":"tpl_footer" } } 
            }
        } 
    }
);
```

### 2, other types of files supported by the resource group
The resource group currently supports `html`, `css` and `js`. If it is of type `css` or `js`, you can also set an additional `reload` parameter, which controls whether the corresponding resource is repeatedly loaded when the page is refreshed or jumped. This can be set to `false` in some cases to avoid repeated loading and improve performance.   

The above code can be found in `example 2`, run the code in `example 2` and you should get a screenshot of the interface like this:

<img src="./img/image8.png">

# Launcher
To prevent unexpected execution sequences, `html` resources in resource groups that contain `<script>` tags are not executed. However, the `javascript` code in the `js` resource is executed. So, to make the program execute after all resources are finished, we can set a `ready` callback function in the `tmpUI` instance.

The specific usage is.

```javascript
var app = new tmpUI({...});
app.ready(()=>{
    // Execute your code here
});
```
You can call the `ready` function multiple times and they will all execute when all resources are loaded.  
The code used to run when the page is `ready` can be written to a separate `js` file and added to the resources with that page.