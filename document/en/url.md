# Handle resource paths and links

Since `tmpUI` is essentially a single-page application, we need to handle links within the page separately.

By adding `tmpui-app="true"` to the `<a>` tag, on page initialization, `tmpUI` will look for the `a` tag with this attribute set and convert the link to the appropriate in-app route.
For example, `<a tmpui-app="true" href="/login">` is automatically converted to `<a href="?tmpui_page=/login">` after the page is initialized.   

Why do we do this? For better compatibility. 
Although it is possible to intercept all `URLs` and process their routes directly in the internal routing system using `#`, if the visitor comes from an external link, it will not be recorded in the server-side logs. We therefore use query notation to treat these requests as `GET` parameters.  

And in some programs, links with `#` may not process `#` and its subsequent content when rendering (or when copying the link).  
In addition, this form of linking does not require any server-side configuration (e.g., `Nginx` rewrite configuration).

# Static resource path handling in subdirectories 
For resources such as images, additional path rewriting rules can be applied by setting `tmpui-root="true"` with the tag. This is usually a companion setting when the `siteRoot` parameter is set. 

For example, when `siteRoot` is set to `/subdir/`, `<img src="a.jpg" tmpui-root="true">` will be expanded to `<img src="/subdir/a.jpg" />`  

Note that the path configured by `siteRoot` must be followed by `/`. If `/` is included in the address configured in the resource group, `siteRoot` will not be applied because `tmpUI` will assume that you want to configure an absolute path, which is essentially the same as the path rules for `URL`.