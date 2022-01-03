# Interface modularity and routing
Ok, now we can start the first tmpUI application. To make things easier, I've gone ahead and placed the source code for this project on the github repository.  
The project is very simple, `hello world`. Install the live server plugin in vscode, then you can start it directly and you should see an interface like this.  

<img src="./img/image4.png" />

## Static routing
In this example, open `/example/1/index.html` and you can see that the program is configured like this:

```javascript
var app = new tmpUI({
   "googleAnalytics": "G-4DGYKM9EHS",
   "loadingIcon": "/tpl/img/logo.png",
   "loadingPage": true,
   "loadingProgress": true,
   "path": {
       "/": {
           "title": "tmpUI App!",
           "body": {
               "./tpl/index.html": { "type": "html", "target": { "type": "body" } },
               "./tpl/header.html": { "type": "html", "target": { "type":"id","val":"tpl_header" } },
               "./tpl/footer.html": { "type": "html", "target": { "type":"id","val":"tpl_footer" } }
            }
        }
    }
});
```
The focus here is on the `path` parameter, which is used to configure static routes. Its structure is shown in the code.   
Where `"/" : {}` means configure the pages under `/` path. The following parameters

| Parameters | Description | Example |
|-----|-----|-----|
| title | page title | `tmpUI App!` |
| body | page content | `{ ". /tpl/index.html": { "type": "html", "target": { "type": "body" } } }` |
| append | Optional, the post-resource group to be placed, only the name of the post-resource group is required here | `["append_res"]` |
| preload | Optional. The preload resource group to be appended, only the name of the preload resource group is required here | `["preload_res"]` |

