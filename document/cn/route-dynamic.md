# 动态路由
有些时候，我们需要处理添加大量不同样式的页面（甚至这些页面可以是后端服务器动态生成的），如果要为每个页面都编写路由和资源组，那么 index.html 中关于路由配置(`path`)的部分可能会很大，因此我们需要一种更为灵活的方案，动态路由就是为此而生。   

动态路由的配置名是 `DynamicRouter`，比如你可以设置 `"DynamicRouter":"/route"` ，这样，`tmpUI` 就会将项目目录下的 `/route` 目录作为动态路由配置文件的存放目录。  

在访问一个未在 `path` 中配置的路由时，比如 `/test.html` ，如果启用了动态路由配置，`tmpUI` 会尝试到 `route` 目录中寻找 `/route/test.html.json` 这个文件，如果能找到它，就读取其中的资源组配置，并加载资源组构建页面。

<img src="./img/image7.png">

相关的示例代码，你可以到 `/exampl/5/` 中浏览。   
在这个例子中，你可以看到 `index.html` 中的配置参数是这样的：

```javascript
var app = new tmpUI({
   "googleAnalytics": "G-4DGYKM9EHS",
   "siteRoot": "/example/5/",
   "loadingIcon": "/tpl/img/logo.png",
   "loadingPage": true,
   "dynamicRouter": "route",
   "loadingProgress": true,
   "languageDefault": "en",
   "language": {
       "en": "./lang/en.json",
       "cn": "./lang/cn.json",
   },
   "preload": {
       "bootstrap": {
           "/tpl/plugin/bootstrap4/jquery.min.js": { "type": "js", "reload": false },
           "/tpl/plugin/bootstrap4/bootstrap.bundle.min.js": { "type": "js", "reload": false },
           "/tpl/plugin/bootstrap4/bootstrap.min.css": { "type": "css", "reload": false },
           "/tpl/css/reset.css": { "type": "css", "reload": false },
       }
   },
   "path": {
       "/": {
           "title": "tmpUI App!",
           "preload": ["bootstrap"],
           "body": {
               "./tpl/index.html": { "type": "html", "target": { "type": "body" } },
               "./tpl/header.html": { "type": "html", "target": { "type": "id", "val": "tpl_header" } },
               "./tpl/footer.html": { "type": "html", "target": { "type": "id", "val": "tpl_footer" } }
           }
       }
   }
});

```