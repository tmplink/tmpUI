# 跟随路由的动态事件

这是 tmpUI 的最新特性！  

在 `tmp.link` 的桌面模块中，我们想要实现一个效果：在点击子文件夹时，去执行一些特定的代码，并且 `URL` 也能跟随改变到实际的 `URL` 中，但是实际的页面并不需要完整刷新，而是通过特定代码更新文件夹的内容。

要实现这个效果，需要做两个调整，首先是 `tmpUI` 本身要支持，针对特定的 `a` 标签，获取 `a` 标签中 `tmpui-action` 的值，这个值就是我们要执行的代码。 tmpUI 监听了设置了 `a` 标签的点击事件，在点击时，首先将 `a` 标签中的 `href` 属性的值设置到地址栏，完成第一个目标：改变实际的 URL。然后，执行 `tmpui-action` 属性中的 `javascript` 代码。实现第二个目标：执行特定的代码。

[演示效果](./video/demo.mp4)

有了上述解说，我想你应该能理解它适用于何种场景，并且对如何使用有一个大概的了解。  
当然，我们也准备了代码 `/examples/6` ，跟随代码来实现吧。

<img src="./img/image9.png">

在 html 代码中，为 a 标签添加 tmpui-action 即可，在其值中设定要执行的代码：

```html
<a class="btn btn-success btn-lg" i18n="index_btn_goto_page1" tmpui-action="gotoPage1()" href="/page1.html">.</a>
<a class="btn btn-success btn-lg" i18n="index_btn_goto_page2" tmpui-action="gotoPage2()" href="/page2.html">.</a>
```

在这个例子中， `gotoPage1()` 和 `gotoPage2()` 是跳转到其它页面的启动函数。 `URL` 调整由 `tmpUI` 完成，而载入其它页面（以实现局部刷新），则可以通过上述两个函数来实现。   

在实际应用中，这两个函数可以被设计用于读取 `URL` 中的某些特定参数，然后根据这些参数调整要显示的内容。