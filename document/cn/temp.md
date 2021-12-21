# 进阶：嵌入式模板

## 使用嵌入代码标签

有时候，我们需要在页面中执行一些捎带逻辑的操作，比如生成列表。这种情况下，直接使用使用原生 `JS` 代码当然是最香的，`tmpUI` 的自带的模板引擎可以完成这个要求。  

`tmpUI` 通过 `<% ...your code %>` 来嵌入 `JavaScript` 代码，这种代码与 `PHP` 的风格 几乎一致，如果你此前使用过 `PHP` 那么接下来的事情应该很简单。  

模板解析函数位于 `tmpUI.tpl(DOM-id,Params)` 第一个参数是模板文件的 `DOM-id` ，第二个参数是可选的，可以给模板传入一个变量，模板内使用变量 `obj` 来进行访问。这个函数 会将解析好的 `html` 代码返回，然后你就可以插入到页面中的任何地方。

## 生成一份列表
首先，我们需要准备模板代码，这次我们准备两种写法，带参数和不带参数。模板代码一般直 接放置到页面中，当然，你也可以另外单独放置到一份页面中，记得加载到 `body` 中即可。

```html
<script type="text/template" id="tpl_no_array">
    <ul class="list-unstyled">
       <% for(let i = 0;i<=10;i++){ %>
            <li><% randomString(6) %></li>
        <% } %>
    </ul>
</script>
<script type="text/template" id="tpl_with_object">
    <ul class="list-unstyled">
        <% for(let i in obj){ %>
            <li><% obj[i] %></li>
        <% } %>
    </ul>
</script>
```

然后，我们需要准备准备一份 `JavaScript` 文件，用于在页面加载完成时执行模板解析的操作。这份文件的代码如下。

```javascript
app.ready(()=>{
   //without params
   let html1 = app.tpl('tpl_no_array');
   document.querySelector('#no_array').innerHTML = html1;
   //with params
   let params = [];
   for(let i =0;i <= 10;i++){
       params.push(randomString(8));
   }
   let html2 = app.tpl('tpl_with_object', params);
   document.querySelector('#with_object').innerHTML = html2;
});
```

上述代码可以在 `example 3` 中找到，运行 `example 3` 的代码，你应该会得到类似如下的 界面截图:

<img src="./img/image1.png"/>

