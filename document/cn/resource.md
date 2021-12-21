# 资源组

`body` 中使用 `资源组` 来组织要在其中放入什么。可以理解为 `include` 或者 `require`。 

以代码为例  

`"./tpl/index.html": { "type": "html", "target": { "type": "body" } }`  

其中，`"./tpl/index.html"` 作为资源的实际路径，其值为具体的属性描述
当资源文件是 `html` 时，需要在属性描述中，将 `type` 设置为 `html`，这样 `tmpUI` 引擎会
将这个资源作为 `html` 代码写入到页面中，具体要写入到哪里，则由 `target` 决定。  

需要注意的是，如果在 `html` 文件中写入了 `<script> ... </script>` 标签，不会生效，这是个例外。  
因此，所有 `Javascript` 代码都应该被封装到单独的文件中，然后通过 `资源组` 来添加到页面中。

| 组合 | 说明 |
|-----|-----|
|`"target":{"type":"body" }}`|此资源将写入到 `tmpui_body` 中|
|`"target":{"type":"id", "val":"dom"}}`|此资源将替换到指定 `id` 的 `DOM` ，`id` 由 `val` 指定。注意，这里是替换|

在本例中，我们通过 `target : body` 来设定整个页面的基本模板，然后通过 `target : id` 来给页面设定模板的头部和页底。  

如果要在每个路由中都这么配置，那会很累，所以，在下一个列子中，将介绍使用 "前置资源 组" 和 "后置资源组" 来批量完成这一任务。

## 前置与后置资源组

### 1，加载顺序

如果要在很多页面上嵌入很多的文件或资源，在 `PHP` 中，你可以在某个 `header` 文件中再 包含另外一份 `PHP` 文件。而在 `tmpUI` 中稍许不同，我们采用更快捷的方式：`前置`和`后置`资源组。  
`tmpUI` 加载资源文件时，是按这样的顺序加载的，这与一般的浏览器基本一致。 

`前置资源组(preload) -> 主体(body) -> 后置资源组(append)`


在上面的 `例子1` 中，由于我们没有配置前置资源组和后置资源组，因此只加载了 `body` 中设 置的资源组。现在，我们要稍微改变一下代码，加入 `bootstrap`。`bootstrap` 将被设置到 前置资源组。以下是变更后的代码 ( 代码可在 `example 2` 中获取 ):

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

### 2，资源组支持的其他类型文件
资源组目前支持 `html`，`css`，`js` 三种资源，如果是类型为 `css` 或 `js`，你还可以设置一个 额外的 `reload` 参数，它可以控制在页面刷新或跳转时，是否重复加载对应的资源。在某些情况下可以设置为 `false`，这样可以避免重复加载，提升性能。   

上述代码可以在 `example 2` 中找到，运行 `example 2` 的代码，你应该会得到类似如下的 界面截图:

<img src="./img/image8.png">