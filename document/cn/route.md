# 界面模块化与路由
好了，现在我们可以开始第一份 tmpUI 程序了。为了方便行事，我已经提前把这个项目的源代码放置到了 github 仓库。  
这个项目很简单， `hello world`。 在 vscode 中安装 live server 插件，然后可以直接启动它，你应该会看到这样的界面。  

<img src="./img/image4.png" />

## 静态路由
在这个例子中，打开 `/example/1/index.html` ，可以看到程序的配置是这样的:

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
这里重点要讲解的是 `path` 参数，`path` 参数用于配置静态路由。其结构如代码中所示。   
其中 `"/" : {}` 表示配置 `/` 路径下的页面。如下参数

| 参数 | 说明 | 例子 |
|-----|-----|-----|
| title | 页面标题 | `tmpUI App!` |
| body | 页面内容 | `{ "./tpl/index.html": { "type": "html", "target": { "type": "body" } } }` |
| append | 可选项，置入的后置资源组，这里仅需要填入后置资源组名称 | `["append_res"]` |
| preload | 可选项。 置入的前置资源组，这里仅需要填入前置资源组的名称 | `["preload_res"]` |

