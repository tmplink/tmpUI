# Application Portal
Normally, index.html is the application portal, but it can also be named app.html or application.html if intended otherwise.  
Each portal can be configured as an application on its own, or can share its configuration with other portals.   
Here is a sample code for a regular application portal:    

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

In the above code, there is actually not much difference from the normal homepage. Two files are introduced through the script tag:  

* tmpui.checker.js
* tmpui.js

The first file is used to check if the browser supports the ES6 features used by tmpui.js, and to display a prompt if it does not.  
The second file is the main tmpUI file.

Next, the tmpUI instance is initialized by this code.
```html
<script type="text/javascript">
   var app = new tmpUI({});
</script>
```

Currently there are empty brackets where some tmpUI configuration parameters will be placed, which is what we'll cover next.
