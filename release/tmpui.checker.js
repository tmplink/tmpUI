/**
 * tmpUI.checker.js
 * version: 1
 * Github : https://github.com/tmplink/tmpUI
 * Date : 2021-7-19
 */

'use strict';

try {
    var f = new Function("class tmpUITest{a=0}");
} catch (e) {
    document.write("<p>此应用程序无法运行在比较老的浏览器上，请更新到最新版本的浏览器。通常建议使用 Edge 或者 Firefox 浏览器。</p>");
    document.write("<p>This App is not available on this browser, please update to the latest version of your browser.</p>");
}