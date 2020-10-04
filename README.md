# 概览
tmpUI 是从 domloader 项目发展而来。  
tmpUI 通过设置好的各项规则，组织一个易于开发的单页应用，并在性能与耦合程度上取得平衡。  
tmpUI 的核心目标是在实现模块化的同时，最大程度避免各模块的耦合。  
基于 tmpUI 开发，你甚至不需要安装各种复杂的命令行工具，又或者是客户端。在调试时也不需要编译，总而言之，几乎什么都不需要。  
如果你在 vscode 中开发，可以借助 live server 这个扩展来轻松调试通过 tmpUI 开发的 App。  
  
目前已有这些网站是使用tmpUI进行构建的。  
https://tmp.link 一个好用的网盘。  
http://bs4.vx.link Bootstrap 4 中文文档。  

可以在这里浏览 tmpUI 的文档，这是我们的官方文档    
http://ui.tmp.link  

# 功能
tmpUI 目前已经实现的功能：

* 按需加载
* 后台状态
* 语言设定
* 模块化

# 依赖

tmpUI 依赖 jQuery 来实现一些 dom 操作。

# 入门
tmpUI 用到以下文件：
* index.html 单页应用入口，包含了 tmpUI app 所需的特定 dom 结构。
* tmpui_es5.js 实现功能所需的 js 代码，这是经过 babel 编译的 es5 版本，适配大多数现代浏览器。
* tmpui.css 一些动画效果需要这个 css 文件来支持。
* site.config 配置文件，描述如何构成 tmpUI app。

除此之外，一个 tmpUI app 还包含了其他的项目文件，一般我们都把他们组织存放到其他文件夹。

# 快速开始
仅需两步，即可快速启动一个 tmpUI app，需要准备 github desktop 客户端以及 vscode。

* 在你的 github desktop 客户端中克隆本项目，然后选择在 vscode 中打开此库。
* 在 vscode 中右下角点击 Go Live 来启动一个 web 服务器。（ Go live 需要你安装 vscode 的 live server 插件）。

# 详细文档
我们会继续完善这个项目，此项目中包含的所有文件将成为 tmpUI 文档的一部分，一共中文和英文两个版本。
