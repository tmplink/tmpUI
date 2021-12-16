# 快速开始
我相信它的容易程度会超出你的想象。

## 项目结构
tmpUI 可以帮助你实现 PHP （或者类似其它后端语言）中模板模式中的 include 和 require。  
运用我们曾经的常用的项目结构即可。比如这样的结构：

* ./tmpui.js
* ./tmpui.checker.js
* ./index.html
* ./favicon.ico

* ./tpl/*.html
* ./lang/*.json

* ./assets/*.css
* ./assets/*.js

* ./plugin/*/*.js
* ./plugin/*/*.css
* ./plugin/*/*.html

## 总结

足够简单，不是么？一切都井井有条，还是那个熟悉的味道。  
tmpUI.js 作为 tmpUI 的引擎，index.html 是应用程序入口文件。  
tpl 一般用于存放页面模板，assets 存放项目中用到的 css 和 js，lang 存放语言文件，plugin 存放第三方插件。  
当然，你也可以按照你喜欢的方式组织你的项目。

## 从例子入手
本文档附带有 5 个实例代码相关的项目，你可以在本地运行它们，阅读相关代码，获取灵感
，甚至可以直接应用到实际的项目中
