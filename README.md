# 概览   
tmpUI 的核心目标是实现网页前端界面文件的模块化。   
这可能与 vue 或者 react 类似，不同的是， tmpUI 不需要编译即可在浏览器里直接运行。   
此外，tmpUI 还内置了 ES6 转换至 ES5 的功能，这可以让您直接编写基于 ES6 的项目。
   
如果你在 vscode 中开发，可以借助 live server 这个扩展来轻松调试通过 tmpUI 开发的 App。  

可以在这里浏览 tmpUI 的文档，这是我们的官方文档。    
* tmpUI 目前已经抵达版本 6，不过这个文档是在版本 3 时编写，目前已添加多项功能，我们计划在近期完善文档。
http://ui.tmp.link  

# 理念  
现在的 Web 项目开发日益复杂，高度耦合。tmpUI 的理想是让 web 应用程序的开发重回简单。  

传统 web 程序是多页面的，在走向模块化的过程中，你无需改变思维模式，tmpUI 可以让你依照传统进行开发，模块化特性帮助项目迈向更高效率，更现代化的结构。  
因此你的项目仍然是多页面的，没有太多改变。也几乎不用学习什么新概念。

不过，如果你想要编写类似于 react 那样基于组件化概念构建的程序，也无妨。tmpUI 同样可以提供支持。tmpUI 只负责对项目文件进行模块化，其它方面您仍然可以自由发挥。

# 功能
tmpUI 目前已经实现的功能：

* 按需加载
* 后台状态
* 多语言
* 模块化
* ES6 实时转译 (依赖于Babel) 

# 入门
tmpUI 用到以下文件：
* index.html 单页应用入口，包含了 tmpUI app 所需的特定 dom 结构。
* tmpui.min.js 实现功能所需的 js 代码，这是经过 babel 编译的 es5 版本，并且已压缩。适配大多数现代浏览器。
* tmpui.css 一些动画效果需要这个 css 文件来支持。
* site.config 配置文件，描述如何构成 tmpUI app。

除此之外，一个 tmpUI app 还包含了其他的项目文件，一般我们都把他们组织存放到其他文件夹。

# 快速开始
仅需两步，即可快速启动一个 tmpUI app，需要准备 github desktop 客户端以及 vscode。

* 在你的 github desktop 客户端中克隆本项目，然后选择在 vscode 中打开此库。
* 在 vscode 中右下角点击 Go Live 来启动一个 web 服务器。（ Go live 需要你安装 vscode 的 live server 插件）。
* 如果您具备一定的代码阅读能力，可以直接从这个项目开始构建您自己的项目。

# 案例

目前已有这些网站是使用tmpUI进行构建的，如果你也使用了 tmpUI 构建了项目，欢迎提交 issue，我们会将它放在这里陈列。  
https://tmp.link 一个好用的网盘。  
http://bs4.vx.link Bootstrap 4 中文文档。  
https://www.vx.link 微林。  

# 版权

tmpUI 基于 GNU General Public License v3.0 发布  

其中，本项目还引用了其它开源项目的源代码，它们分别是：

jQuery：为 Dom 操作提供便利。   
https://github.com/jquery/jquery

Babel : 提供 ES6 转换至 ES5 的实时支持，以便适配绝大多数浏览器。   
https://github.com/babel/babel

Bootstrap4 ：在演示程序中提供 UI 支持。   
https://github.com/planetoftheweb/bootstrap4   

highlightjs : 在演示程序中为应用程序代码提供支持。   
https://github.com/highlightjs/highlight.js
