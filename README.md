# 概览   
tmpUI 的核心目标是实现网页前端界面文件的模块化。   
这可能与 vue 或者 react 类似，不同的是， tmpUI 不需要编译即可在浏览器里直接运行。 
   
如果你在 vscode 中开发，可以借助 live server 这个扩展来轻松调试通过 tmpUI 开发的 App。  

可以在这里浏览 tmpUI 的文档，这是我们的官方文档。    
* tmpUI 目前已经抵达版本 15，不过这个文档是在版本 3 时编写，目前已添加多项功能，我们计划在近期完善文档。
http://ui.tmp.link  

# 理念  
现在的 Web 项目开发日益复杂，高度耦合。tmpUI 的理想是让 web 应用程序的开发重回简单。  

传统 web 程序是多页面的，在走向模块化的过程中，你无需改变思维模式，tmpUI 可以让你依照传统进行开发，模块化特性帮助项目迈向更高效率，更现代化的结构。  
因此你的项目仍然是多页面的，没有太多改变。也几乎不用学习什么新概念。

不过，如果你想要编写类似于 react 那样基于组件化概念构建的程序，也无妨。tmpUI 同样可以提供支持。tmpUI 只负责对项目文件进行模块化，其它方面您仍然可以自由发挥。

# 版本 15 的重大更新
在版本 15 中，我们重构了一部分代码，作出了重大改变！这些改变不向前兼容，因此，你需要做一些小小的修改以适配新的 tmpUI。

* 移除了ES5 的支持。在不支持 ES6 的浏览器上无法运行基于 tmpUI 构建的应用程序。
* 采用驼峰法命名。因此部分配置的名称可能发生变更，请您检查。
* 移除了 config 的机制。在此前，应用程序配置被单独作为一个文件，在加载时通过网络请求，现在它将直接配置在程序入口文件中。
* 移除了 jQuery 和 Babel 。这两个库会略微影响到加载速度，因此我们决定移除它！在移除了 jQuery 之后，如果您的项目中应用到了 jQuery ，则需要单独加载。而针对 Babel ，在此前版本中支持的 ES6 实时转译至 ES5 也将不再支持。
* 移除了外部 CSS 的引用。现在， tmpUI 的 CSS 将被内置到主程序中，并在程序启动时自动加载。

所有的改变都面向未来，为了更快的速度。

# 功能
tmpUI 目前已经实现的功能：

* 按需加载
* 后台状态
* 多语言
* 模块化

# 入门
tmpUI 用到以下文件：
* index.html 单页应用入口，包含了 tmpUI app 所需的特定 dom 结构。
* tmpui.min.js 实现功能所需的 js 代码,。

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

Bootstrap4 ：在演示程序中提供 UI 支持。   
https://github.com/planetoftheweb/bootstrap4   

highlightjs : 在演示程序中为应用程序代码提供支持。   
https://github.com/highlightjs/highlight.js
