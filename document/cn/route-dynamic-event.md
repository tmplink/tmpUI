# 跟随路由的动态事件

这是 tmpUI 的最新特性！  

在 `tmp.link` 的桌面模块中，我们想要实现一个效果：在点击子文件夹时，去执行一些特定的代码，并且 `URL` 也能跟随改变到实际的 `URL` 中，但是实际的页面并不需要完整刷新，而是通过特定代码更新文件夹的内容。

要实现这个效果，需要做两个调整，首先是 `tmpUI` 本身要支持，针对特定的 `a` 标签，获取 `a` 标签中 `tmpui-action` 的值，这个值就是我们要执行的代码。 tmpUI 监听了设置了 `a` 标签的点击事件，在点击时，首先将 `a` 标签中的 `href` 属性的值设置到地址栏，完成第一个目标：改变实际的 URL。然后，执行 `tmpui-action` 属性中的 `javascript` 代码。实现第二个目标：执行特定的代码。

<video id="video" controls muted autoplay>
      <source id="mp4" src="./video/demo.mp4" type="video/mp4">
</videos>