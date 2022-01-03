# Configuration Parameters
These parameters are application configuration parameters.

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| version | 0 | The version number. The version number will be used when requesting resources |
| siteRoot | / | The application root directory. If deployed in a site subdirectory, you can configure this parameter |
| loadingIcon | null | The loading page icon when loading. If set to null, the icon will not be displayed |
| loadingPage | null | The page when loading. If set to null, the loading page will not be shown |
| loadingProgress | true | Whether to show loading progress (real progress) |
| googleAnalytics | null | Set the ID of Google Analytics. if set to null, Google Analytics will not be used |
| pageNotFound | null | Customize a 404 handling page, where you need to fill in the configured route. When a 404 occurs, it redirects to this 404 route. When this parameter is not configured, the 404 redirects to the / | dynamicRouter | false
| dynamicRouter | false | Whether dynamic routing is enabled or not.
| index | null | Application entry, default is index.html | 
| path | null | StaticRouter configuration parameter |
| lang | null | Language file configuration, only when this parameter is configured, the language related functions will take effect |
| preload | null | preload resource group | 
| append | null | post-groups |
