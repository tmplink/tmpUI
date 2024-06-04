# 配置参数
这些参数是应用程序配置参数。

| 参数名 | 默认值 | 说明 |
| :--- | :--- | :--- |
| version | 0 | 版本号。版本号会在请求资源时使用 |
| siteRoot | / | 应用程序根目录。如果部署在站点子目录，你可以配置这个参数 |
| loadingIcon | null | 载入时的载入页图标。如果设置为null，则不显示图标 |
| loadingPage | null | 载入时的页面。如果设置为null，则不显示载入页面 |
| loadingProgress | true | 是否显示载入进度（真实进度） |
| googleAnalytics | null | 设置Google Analytics的ID。如果设置为null，则不使用Google Analytics |
| pageNotFound | null | 定制一个 404 的处理页面，这里需要填入的是已配置好的路由。当发生 404 时，重定向到这个 404 的路由。当没有配置此参数时，发生 404 时重定向到 / |
| dynamicRouter | false | 是否启用动态路由 ｜
| index | null | 应用程序入口，默认为 index.html | 
| path | null | 静态路由配置参数 |
| lang | null | 语言文件配置，只有配置了此参数时，语言相关的功能才能生效 |
| bg_color_light | null | 白天背景颜色 |
| bg_color_dark | null | 夜晚背景颜色 |
| preload | null | 前置资源组 | 
| append | null | 后置资源组 |
| extendStaticHost | null | 额外静态资源主机，此配置用于指定额外的资源组加载主机，比如设置为 static.abc.com ，站点域名是 www.abc.com 时，会先从 www.abc.com 加载 index.html，然后 index.html 中配置的 extendStaticHost 会使得之后所有的资源都通过 static.abc.com 来加载。可以指定协议，比如设置为 http://static.abc.com，但是由于安全限制，你不能在 https 站点中，引用 http 资源 |