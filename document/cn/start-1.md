# 应用程序入口
通常，index.html 是应用程序入口，不过如果另有打算，也可以采用 app.html 或者 application.html 这样的名称。  
每个入口都可以单独配置为一个程序，也可以与其它入口共享配置。   
以下是一段常规的应用程序入口的示例代码:   

```html
<!DOCTYPE HTML>
<html>
<head>
   <title>tmpUI</title>
   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1,shrink-to-fit=no">
   <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1" />
   <meta name="renderer" content="webkit" />
   <script type="text/javascript" src="./tmpui.checker.js"></script>
   <script type="text/javascript" src="./tmpui.js"></script>
   <script type="text/javascript">
       var app = new tmpUI({});
   </script>
</head>
<body>
   <div id="tmpui"></div>
   <div id="tmpui_body" class="d-flex flex-column"></div>
</body>
</html>
```

在上面这段代码中，其实与普通的主页没有太大差异。通过 script 标签引入两个文件:  

* tmpui.checker.js
* tmpui.js

第一个文件用来检查浏览器是否支持 tmpui.js 所用到的 ES6 特性，如果不支持的话则显示一段提示。  
第二个文件是 tmpUI 的主体文件。

接下来，通过这段代码，初始化 tmpUI 实例。

```html
<script type="text/javascript">
   var app = new tmpUI({});
</script>
```

目前在花括号中是空的，这里会放置一些 tmpUI 的配置参数，这是接下来我们要介绍的内容。
