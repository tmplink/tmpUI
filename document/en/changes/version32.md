# Resource loading optimization
Now, after tmpUI has finished preparing all resource files under the current route, it will load these resources into the DOM in the following order:

* CSS
* HTML/TPL/FILE
* JavaScript

This can improve rendering speed in certain browsers.

# Optimization of page loading
After the initial resource loading is complete, subsequent page resource loading will not display the loading page animation.