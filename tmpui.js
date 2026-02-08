/**
 * tmpUI.js
 * version: 58
 * Github : https://github.com/tmplink/tmpUI
 * Date :2026-01-31
 */

class tmpUI {

    status = {}
    config = {}
    version = 0
    index = '/'
    siteRoot = ''
    debug = true
    reloadTable = {}
    resPath = ''
    pageReady = false
    pageHistoryCounter = 0

    googleAnalytics = false
    googleAnalyticsQueue = []

    customRouter = []
    errorOnloading = true
    dynamicRouter = null
    languageDefault = 'en'
    languageConfig = false
    languageData = false
    languageSetting = 'en'
    loadDelay = 500
    loadCallback = []
    readyFunction = []
    loadingPageInit = false
    loadingPage = false
    loadingIcon = false
    loadingText = false
    readyCallback = null
    progressEnable = true
    progressStatus = false
    currentRoute = '/'
    currentPage = '/'
    onExitfunction = []
    filesCache = []
    statusLastPage = ''
    extendStaticHost = ''
    bg_color = '#fff'
    bg_color_dark = '#000'
    bg_color_light = '#fff'

    constructor(config) {
        this.state = {
            displayTrophy: true
        };

        window.tmpuiHelper = {
            loadQueue: 0,
            loadTotal: 0,
            readyQueue: 0,
            readyTotal: 0,
        };

        //初始化history
        history.replaceState(this.state, null, '');

        //写入配置文件
        this.config = this.rebuildConfig(config);
        this.rebuildRunConfig(config);

        //检查是否是深色模式，如果是的话，背景颜色设定为黑色
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.bg_color = this.bg_color_dark;
        } else {
            this.bg_color = this.bg_color_light;
        }

        //初始化CSS
        this.cssInit();

        //Checking
        window.onload = () => {
            this.loadPageInit();
            this.route();
        }
        //当面前进与后退的时候，popstate监听历史记录变化，触发对应页面的ajax请求。
        window.addEventListener("popstate", (e) => {
            // 获取当前 URL 中的 tmpui_page 参数
            let tmpuiPage = new URL(window.location.href).searchParams.get("tmpui_page");
            let currentPath = window.location.pathname + window.location.search;
            // 如果 tmpuiPage 值与现在的 tmpuiPage 值相同
            if (tmpuiPage === this.currentPage) {
                if (typeof this.customRouter[tmpuiPage] === "function") {
                    // 如果是函数，则执行自定义路由
                    this.customRouter[tmpuiPage]();
                } else {
                    // 否则执行 this.route() 方法
                    this.route();
                }
            } else {
                // 执行 this.route() 方法
                this.route();
            }
        });

    }

    /**
     * TODO: 增加自定义路由选项
     * @param {*} page 
     * @param {*} router 
     */
    setCoustomRouter(page, router) {
        this.customRouter[page] = router;
    }

    /**
     * 清理外部元素
     * 在页面跳转时，移除 body 下所有非 tmpUI 框架管理的元素
     * 这包括第三方库动态添加的遮罩层、弹窗容器等
     */
    cleanupExternalElements() {
        // tmpUI 框架保留的元素 ID 列表
        const preserveIds = ['tmpui', 'tmpui_body', 'tmpui_loading_bg', 'tmpui_loading_show'];
        
        // 遍历 body 的直接子元素
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(el => {
            // 保留 script 和 style 标签
            if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT') {
                return;
            }
            // 保留带有 tmpui 相关 ID 的元素
            if (el.id && preserveIds.includes(el.id)) {
                return;
            }
            // 保留带有 tmpUIRes 或 tmpUIRes_once class 的元素（tmpUI 资源）
            if (el.classList.contains('tmpUIRes') || el.classList.contains('tmpUIRes_once')) {
                return;
            }
            // 移除其他非框架元素
            el.remove();
        });
        
        // 清理 body 上可能被第三方库添加的 class 和内联样式
        // 保留 tmpUI 可能使用的 class
        const bodyClasses = Array.from(document.body.classList);
        bodyClasses.forEach(cls => {
            // 移除非 tmpui 相关的 class
            if (!cls.startsWith('tmpui')) {
                document.body.classList.remove(cls);
            }
        });
        
        // 清理 body 的内联样式
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
    }

    cssInit() {
        this.htmlAppend('head', `<style>body::-webkit-scrollbar{width:0!important}#tmpui{display:none}#tmpui_loading_bg{position:fixed;top:0;left:0;width:100%;height:100%;background:${this.bg_color};z-index:15000}#tmpui_loading_show{color:#000;z-index:15001;width:80%;height:200px;position:absolute;left:0;top:0;right:0;bottom:0;margin:auto;text-align:center}.tmpui_tpl{display:none}.tmpui_progress{width:180px;background:#ddd;margin-right:auto;margin-left:auto}.tmpui_curRate{width:0%;background:#f30}.tmpui_round_conner{height:8px;border-radius:15px}</style>`);
    }

    onExit(cb) {
        this.onExitfunction.push(cb);
    }

    doExit() {
        if (this.onExitfunction.length !== 0) {
            for (let x in this.onExitfunction) {
                this.onExitfunction[x]();
            }
            this.onExitfunction = [];
        }
    }

    ready(cb) {
        if (this.pageReady) {
            cb();
        } else {
            this.readyFunction.push(cb);
        }

    }

    readyExec() {
        if (this.readyFunction.length !== 0) {
            for (let x in this.readyFunction) {
                this.readyFunction[x]();
            }
            this.readyFunction = [];
        }
        //add GoogleAnalytics
        if (this.googleAnalytics !== false) {
            this.log('Send GoogleAnalytics : ' + document.title);
            gtag('event', 'page_view', {
                page_title: document.title,
                page_path: this.currentRoute,
                send_to: this.googleAnalytics
            });
        }
    }

    readyEvent() {
        if (window.tmpuiHelper.readyQueue == window.tmpuiHelper.readyTotal) {
            this.readyExec();
            this.loadpage(false);
            this.log("Ready");
            this.pageReady = true;
        } else {
            setTimeout(() => {
                this.readyEvent();
            }, 50);
        }
    }

    loadGtag(id) {
        var s1 = document.createElement('script');
        s1.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
        s1.type = "text/javascript";
        s1.async = true;
        document.head.appendChild(s1);

        var s2 = document.createElement('script');
        s2.innerHTML = 'window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag(\'js\', new Date());gtag("config", "' + this.googleAnalytics + '");';
        s2.type = "text/javascript";
        s2.async = true;
        document.head.appendChild(s2);
    }

    rebuildRunConfig(config) {

        //覆盖由配置文件设定的值
        if (config.loadingPage !== undefined) {
            this.loadingPage = config.loadingPage;
        }
        if (config.loadingText !== undefined) {
            this.loadingText = config.loadingText;
        }
        if (config.loadingIcon !== undefined) {
            this.loadingIcon = config.loadingIcon;
        }
        if (config.version !== undefined) {
            this.version = config.version;
        }
        if (config.language !== undefined) {
            this.languageConfig = config.language;
        }
        if (config.loadingProgress !== undefined) {
            this.progressEnable = config.loadingProgress;
        }
        if (config.dynamicRouter !== undefined) {
            this.dynamicRouter = config.dynamicRouter;
        }
        if (config.resPath !== undefined) {
            this.resPath = config.resPath;
        }
        if (config.pageNotFound !== undefined) {
            this.pageNotFound = config.pageNotFound;
        }
        if (config.languageDefault !== undefined) {
            this.languageDefault = config.languageDefault;
        }
        if (config.siteRoot !== undefined) {
            this.siteRoot = config.siteRoot;
        }
        if (config.index !== undefined) {
            this.index = config.index;
        }
        if (config.errorOnloading !== undefined) {
            this.errorOnloading = config.errorOnloading;
        }
        if (config.extendStaticHost !== undefined) {
            this.extendStaticHost = config.extendStaticHost;
        }

        if (config.bg_color !== undefined) {
            this.bg_color = config.bg_color;
        }
        if (config.bg_color_dark !== undefined) {
            this.bg_color_dark = config.bg_color_dark;
        }

        //Add GoogleAnalytics
        if (config.googleAnalytics !== false) {
            this.loadGtag(config.googleAnalytics);
            this.log("Load GoogleAnalytics : " + config.googleAnalytics);
            this.loadgoogleAnalytics = config.googleAnalytics;
            this.googleAnalytics = this.config.googleAnalytics;
        }
    }

    rebuildConfig(config) {
        //处理cofnig文件中的预处理关系
        if (config.path !== undefined) {
            for (let url in config.path) {
                config.path[url].res = {};
                //检查该项是否存在预加载的内容
                if (config.path[url].preload !== undefined) {
                    for (let purl in config.path[url].preload) {
                        //处理预加载的内容
                        let pkey = config.path[url].preload[purl];
                        for (let preload in config.preload[pkey]) {
                            config.path[url].res[preload] = {};
                            config.path[url].res[preload] = config.preload[pkey][preload];
                        }
                    }
                }
                //处理正文
                if (config.path[url].body !== undefined) {
                    for (let purl in config.path[url].body) {
                        config.path[url].res[purl] = config.path[url].body[purl];
                    }
                }
                //处理需要最后加载的内容
                if (config.path[url].append !== undefined) {
                    for (let purl in config.path[url].append) {
                        //处理预加载的内容
                        let pkey = config.path[url].append[purl];
                        for (let append in config.append[pkey]) {
                            config.path[url].res[append] = {};
                            config.path[url].res[append] = config.append[pkey][append];
                        }
                    }
                }
            }
        }
        config.reloadTable = {};
        return config;
    }

    linkRebind() {
        let atag = document.getElementsByTagName("a");
        this.linkRebindForAPP(atag);
        let ctag = document.getElementsByTagName("code");
        this.linkRebindForCode(ctag);
    }

    linkRebindWith(tagName, type) {
        let atag = document.getElementsByTagName(tagName);
        if (type == 'code') {
            this.linkRebindForCode(atag);
        } else {
            this.linkRebindForAPP(atag);
        }
    }

    linkRebindForAPP(atag) {
        if (atag.length > 0) {
            for (let i in atag) {

                if (typeof (atag[i]) === 'object') {
                    //不处理上级节点是pre或者code的情况
                    if (atag[i].parentNode.nodeName === 'PRE' || atag[i].parentNode.nodeName === 'CODE') {
                        continue;
                    }
                    if (atag[i].getAttribute("tmpui-app") == 'true' && atag[i].getAttribute("tmpui-app-rebind") != 'true') {
                        //获取绝对链接地址
                        let newpage = atag[i].getAttribute("target") == '_blank' ? true : false;
                        let url = '';
                        let a_url = atag[i].getAttribute("href");
                        let urlp = a_url.split("?");
                        //
                        if (urlp.length === 1) {
                            url = this.index + '?tmpui_page=' + urlp[0];
                        } else {
                            url = this.index + '?tmpui_page=' + urlp[0] + '&' + urlp[1];
                        }

                        //生成App内链接地址
                        //let url = this.index + '?tmpui_page=' + t_url + u;
                        //写入到专用标签
                        atag[i].setAttribute("tmpui-app-rebind", 'true');
                        //修改原有标签到新地址
                        atag[i].setAttribute("href", url);
                        //修改事件行为
                        if (!newpage) {
                            atag[i].addEventListener('click', e => {
                                e.preventDefault();
                                history.pushState({
                                    Page: 1
                                }, window.title, url);
                                //ajax('GET', url, 'page=' + url, this.loader, true);
                                this.route();
                            });
                        }
                    }

                    if (atag[i].getAttribute("tmpui-action") !== null && atag[i].getAttribute("tmpui-app-rebind") != 'true') {
                        //获取绝对链接地址
                        let newpage = atag[i].getAttribute("target") == '_blank' ? true : false;
                        let url = '';
                        let a_url = atag[i].getAttribute("href");
                        let urlp = a_url.split("?");
                        //
                        if (urlp.length === 1) {
                            url = this.index + '?tmpui_page=' + urlp[0];
                        } else {
                            url = this.index + '?tmpui_page=' + urlp[0] + '&' + urlp[1];
                        }

                        //生成App内链接地址
                        //let url = this.index + '?tmpui_page=' + t_url + u;
                        //写入到专用标签
                        atag[i].setAttribute("tmpui-app-rebind", 'true');
                        //修改原有标签到新地址
                        atag[i].setAttribute("href", url);
                        //修改事件行为
                        if (!newpage) {
                            atag[i].addEventListener('click', e => {
                                e.preventDefault();
                                history.pushState({
                                    Page: 1
                                }, window.title, url);
                                //获取 action
                                let action = atag[i].getAttribute("tmpui-action");
                                //执行
                                eval(action);
                                //ajax('GET', url, 'page=' + url, this.loader, true);
                                //this.route();
                            });
                        }
                    }
                }
            }
        }
    }

    linkRebindForCode(ctag) {
        if (ctag.length > 0) {
            for (let i in ctag) {
                if (typeof (ctag[i]) === 'object') {
                    let ishtml = ctag[i].getAttribute("tmpui-html-code");
                    if (ishtml == 'true') {
                        let text = ctag[i].innerHTML;
                        ctag[i].innerHTML = text.toString().replace(/[<>&"]/g, (c) => {
                            return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
                        });
                        ctag[i].setAttribute("tmpui-html-code", "loaded");
                    }
                }
            }
        }
    }

    autofix() {
        if (this.siteRoot !== '') {
            var siteroot = this.siteRoot;
            this.domSelect('[tmpui-root]', (dom) => {
                let autofixer = dom.getAttribute("tmpui-root");
                let src = dom.getAttribute("src");
                let href = dom.getAttribute("href");
                if (autofixer === 'true' && src !== undefined && src !== null) {
                    dom.setAttribute("src", siteroot + src);
                    dom.setAttribute("tmpui-root", 'false');
                }
                if (autofixer === 'true' && href !== undefined && href !== null) {
                    dom.setAttribute("href", siteroot + href);
                    dom.setAttribute("tmpui-root", 'false');
                }
            });
        }
    }

    open(a_url, newpage) {
        let url = this.index + '?tmpui_page=' + a_url;
        if (newpage === true) {
            window.open(url);
            return false;
        }
        history.pushState({
            Page: 1
        }, window.title, url);
        this.route();
    }

    dynOpen(a_url) {
        let url = this.index + '?tmpui_page=' + a_url;
        let previousState = history.state;
        if (url !== previousState.url) {
            history.pushState({
                Page: 1
            }, window.title, url);
        }
    }

    /**
     * 路由功能，根据配置进行选路
     * @param {*} config 
     */
    route() {
        let url = "/";
        let params = null;
        let hash = false;

        //
        this.pageReady = false;

        // 清理外部元素：移除非框架添加的 DOM 结构
        this.cleanupExternalElements();

        //获取参数
        let href = window.location.href;
        if (window.location.hash !== '') {
            href = window.location.href.substr(0, window.location.href.indexOf(window.location.hash));
            hash = window.location.hash;
        }

        //add googleAnalytics
        let ga_path = window.location.href.replace(window.location.origin, '');
        this.log('Send googleAnalytics : ' + ga_path);
        this.currentRoute = ga_path;
        params = this.getUrlVars(href);

        //默认文件
        if (params.tmpui_page !== undefined) {
            url = params.tmpui_page;
            this.statusLastPage = url;
        }

        //移除一次性资源
        document.querySelectorAll(".tmpUIRes").forEach(e => e.parentNode.removeChild(e));

        // 检查资源缓存状态 - 针对静态配置的路由，如果资源已加载，则延迟显示 Loading
        let isCached = false;
        if (this.config.path[url] && this.config.path[url].res) {
            isCached = true;
            for (let i in this.config.path[url].res) {
                if (this.config.path[url].res[i].state !== 1) {
                    isCached = false;
                    break;
                }
            }
        }

        //查找路由
        this.loadpage(true, isCached);

        //在设定了 Hash 的情况下，不进行路由
        if (hash !== false && !this.loadingPage) {
            return false;
        }

        //路由未载入
        if (this.config.path[url] === undefined) {
            //如果启用了动态配置
            if (this.dynamicRouter !== null) {
                //尝试找到这个配置
                let configure_url = this.extendStaticHost + this.resPath + this.dynamicRouter + url + '.json';
                let xhttp = new XMLHttpRequest();
                xhttp.onloadend = () => {
                    if (xhttp.status == 200 || xhttp.status == 304) {
                        this.config.path[url] = JSON.parse(xhttp.responseText);
                        this.rebuildConfig(this.config);
                        this.route200(url);
                    } else {
                        this.route404(url);
                    }
                };
                xhttp.open("GET", configure_url + '?v=' + this.version, true);
                xhttp.send();
                return true;
            }

            //无法找到配置
            this.route404(url);
        } else {
            this.route200(url);
        }
    }

    route200(url) {
        // 判断是否所有资源都已加载
        this.currentLoadIsCached = true;
        if (this.config.path[url] && this.config.path[url].res) {
            for (let i in this.config.path[url].res) {
                if (this.config.path[url].res[i].state !== 1) {
                    this.currentLoadIsCached = false;
                    break;
                }
            }
        } else {
            this.currentLoadIsCached = false;
        }

        //下载所需组件
        this.loaderStart(url, () => {
            
            // 为了防止 FOUC (无样式内容闪烁)，在内容更新前将主体隐藏
            // 等到所有资源(包括CSS)加载完毕(readyEvent触发loadpage(false))后再显示
            let tb = document.getElementById('tmpui_body');
            if (tb) {
                tb.style.transition = ''; // 移除过渡，立即隐藏
                tb.style.opacity = '0';
            }

            //调整网页标题
            document.title = this.config.path[url].title;
            //写入到页面,处理资源时需要根据对应的资源类型进行处理
            this.draw(url);
            //处理链接关系
            this.autofix();
            //绑定链接事件
            this.linkRebind();
        });
    }

    route404(url) {
        this.log('Page not found : ' + url);
        if (this.pageNotFound !== undefined) {
            //在配置了 404 页面的情况下
            this.route200(this.pageNotFound);
        } else {
            //在没有配置 404 页面的情况下
            this.route200('/');
        }
        this.log('Page not found : ' + url);
        return false;
    }

    draw(url) {

        this.drwaTo(url, 'css');
        this.drwaTo(url, 'html');
        this.drwaTo(url, 'tpl');
        this.drwaTo(url, 'file');
        this.drwaTo(url, 'js');

        if (this.languageConfig !== false) {
            this.languageBuild();
        }
        this.readyEvent();
    }

    drwaTo(url, type) {
        for (let i in this.config.path[url].res) {

            let contentType = this.config.path[url].res[i].type;
            let content = this.config.path[url].res[i].dom;
            let contentReload = this.config.path[url].res[i].reload;
            let contentVersion = this.config.path[url].res[i].version === false ? false : true;
            let contentReloadTarget = contentReload === false ? 'tmpUIRes_once' : 'tmpUIRes';
            let contentURL = '';

            if (contentVersion === true) {
                contentURL = i + '?v=' + this.config.version;
            } else {
                contentURL = i;
            }

            if (contentType === 'css' && contentType === type) {
                if (contentReload === false) {
                    if (this.reloadTable[i] === false) {
                        this.reloadTable[i] = true;
                    } else {
                        continue;
                    }
                }
                
                this.htmlAppend('head', `<!--[${i}]-->`);

                // 使用 createElement 创建 link 标签，并监听 onload 事件
                // 这样可以将 CSS 加载纳入 readyQueue 队列，确保样式加载完成后再显示页面
                window.tmpuiHelper.readyTotal++;
                let link = document.createElement('link');
                link.className = contentReloadTarget;
                link.rel = 'stylesheet';
                link.href = contentURL;
                link.onload = () => {
                    window.tmpuiHelper.readyQueue++;
                };
                link.onerror = () => {
                    window.tmpuiHelper.readyQueue++;
                    this.logError('Failed to load CSS: ' + contentURL);
                }
                document.head.appendChild(link);
            }

            if (contentType === 'js' && contentType === type) {
                if (contentReload === false) {
                    if (this.reloadTable[i] === false) {
                        this.reloadTable[i] = true;
                    } else {
                        continue;
                    }
                }
                this.htmlAppend('body', `<!--[${i}]-->`);
                let script = document.createElement("script");
                script.type = "text/javascript";
                script.text = `${content}`;
                script.className = contentReloadTarget;
                document.body.appendChild(script);
            }

            if (contentType === 'tpl' && contentType === type) {
                if (contentReload === false) {
                    if (this.reloadTable[i] === false) {
                        this.reloadTable[i] = true;
                    } else {
                        continue;
                    }
                }
                this.htmlAppend('body', `<!--[${i}]-->`);
                this.htmlAppend('body', `<div class="${contentReloadTarget}" style="display:none">${content}</div>\n`);
            }

            if (contentType === 'file' && contentType === type) {
                this.filesCache[i] = content;
                if (this.reloadTable[i] === false) {
                    this.reloadTable[i] = true;
                } else {
                    continue;
                }
            }

            if (contentType === 'html' && contentType === type) {
                // 在注入 HTML 之前先进行语言翻译
                let translatedContent = content;
                if (this.languageData) {
                    translatedContent = this.languageTranslateHtml(content);
                }
                
                if (this.config.path[url].res[i].target.type === "append") {
                    this.htmlAppend('#tmpui_body', `<!--[${i}]-->`);
                    this.htmlAppend('#tmpui_body', translatedContent);
                }
                if (this.config.path[url].res[i].target.type === "body") {
                    this.htmlAppend('#tmpui_body', `<!--[${i}]-->`);
                    this.htmlRewrite('#tmpui_body', translatedContent);
                }
                if (this.config.path[url].res[i].target.type === "id") {
                    let id = this.config.path[url].res[i].target.val;
                    this.htmlAppend('#' + id, `<!--[${i}]-->`);
                    this.htmlReplaceWith('#' + id, translatedContent);
                }
            }
        }
    }

    loaderStart(url, cb) {
        this.loadCallback = cb;
        //常规加载顺序
        for (let i in this.config.path[url].res) {
            window.tmpuiHelper.loadTotal++;
        }
        for (let i in this.config.path[url].res) {
            this.loaderUnit(url, i);
        }
    }

    loaderUnit(target, i) {
        //初始化属性
        if (this.config.path[target].res[i].state === undefined) {
            this.config.path[target].res[i].state = 0;
            this.config.path[target].res[i].dom = 0;
        }

        if (this.config.path[target].res[i].reload === false && this.reloadTable[i] === undefined) {
            this.reloadTable[i] = false;
        }

        if (this.config.path[target].res[i].state === 1) {
            //如果这个URL已经加载了，直接返回。
            window.tmpuiHelper.loadQueue++;
            this.loaderFinish();
        } else {
            //如果这个URL没有加载，加载后返回。
            let xhttp = new XMLHttpRequest();
            xhttp.onloadend = () => {
                if (xhttp.status != '200' && xhttp.status != '302') {
                    this.logError("[code " + xhttp.status + '] ' + i);
                }
                window.tmpuiHelper.loadQueue++;
                this.config.path[target].res[i].state = 1;
                this.config.path[target].res[i].dom = xhttp.responseText;
                this.loaderFinish();
            };
            xhttp.ontimeout = () => {
                this.logError("[timeout] " + i);
                //重试
                setTimeout(() => {
                    this.loaderUnit(target, i);
                }, 1000);
            }
            xhttp.onerror = () => {
                this.logError("[error] " + i);
                //重试
                setTimeout(() => {
                    this.loaderUnit(target, i);
                }, 1000);
            }
            xhttp.onabort = () => {
                this.logError("[abort] " + i);
                //重试
                setTimeout(() => {
                    this.loaderUnit(target, i);
                }, 1000);
            }
            //如果配置了 version:false，就不加版本号
            if (this.config.path[target].res[i].version === false) {
                xhttp.open("GET", this.extendStaticHost + this.resPath + i, true);
            } else {
                xhttp.open("GET", this.extendStaticHost + this.resPath + i + '?v=' + this.version, true);
            }
            xhttp.send();
        }
    }

    loaderFinish() {
        if (this.currentLoadIsCached) {
            if (window.tmpuiHelper.loadQueue == window.tmpuiHelper.loadTotal) {
                this.log("Loading is complete (cached).");
                document.body.style.overflow = "";

                if (typeof this.loadCallback === 'function') {
                    this.log("Callback is running.");
                    this.loadCallback();
                }
                this.loadCallback = null;
            }
            return;
        }

        // 检查是否启用进度条
        if (this.progressEnable && this.progressStatus === false) {
            // 如果加载时间小于设定的延迟显示时间，则不需要显示进度条，直接结束
            if (this._loadingStartTime && (Date.now() - this._loadingStartTime < this._loadingDelay)) {
                if (window.tmpuiHelper.loadQueue == window.tmpuiHelper.loadTotal) {
                    this.log("Loading is complete (fast load).");
                    document.body.style.overflow = "";

                    if (typeof this.loadCallback === 'function') {
                        this.log("Callback is running.");
                        this.loadCallback();
                    }
                    this.loadCallback = null;
                }
                return;
            }

            // 显示进度条
            this.progressStatus = true;
            this.htmlAppend('#tmpui_loading_show', '<div class="tmpui_progress tmpui_round_conner" id="tmpui_loading_progress"><div class="tmpui_curRate tmpui_round_conner"></div></div>');
            // 添加 CSS
            this.htmlAppend('head', '<style>.tmpui_curRate{transition:width 0.5s;}</style>');
        }

        let percent = Math.ceil(window.tmpuiHelper.loadQueue / window.tmpuiHelper.loadTotal * 100);

        if (percent !== 100) {
            document.getElementById('tmpui_loading_progress').style.opacity = "1";
        }

        // 更新进度条宽度
        this.domSelect('.tmpui_curRate', (el) => {
            el.style.width = `${percent}%`;
        });

        // 所有资源加载完成
        if (window.tmpuiHelper.loadQueue == window.tmpuiHelper.loadTotal) {
            this.log("Loading is complete.");

            // 等待进度条动画完成后再隐藏加载界面
            setTimeout(() => {
                // 设置进度条透明
                document.getElementById('tmpui_loading_progress').style.opacity = "0";

                // 等待透明度过渡完成后再恢复页面滚动和执行回调
                setTimeout(() => {
                    document.body.style.overflow = "";

                    if (typeof this.loadCallback === 'function') {
                        this.log("Callback is running.");
                        this.loadCallback();
                    }
                    this.loadCallback = null;
                    this.progressStatus = true;
                }, 300); // 给予足够的时间完成透明度过渡

            }, 600); // 确保进度条动画完全完成（width transition 是 0.5s）
        }
    }


    title(title) {
        window.title = title;
    }

    languageSet(lang) {
        this.log("languageSet : " + lang);
        var old = localStorage.getItem('tmpUI_language');
        if (old === lang) {
            return Promise.resolve(false);
        } else {
            localStorage.setItem('tmpUI_language', lang);
            return this.languageBuild();
        }
    }

    languageGet() {
        return localStorage.getItem('tmpUI_language');
    }

    async languageBuild() {
        var langs = navigator.language.toLowerCase();
        //init language
        var lang = localStorage.getItem('tmpUI_language');
        if (lang === null) {
            this.log("language auto detect : " + lang);
            const langMap = {
                'zh-cn': 'cn',
                'zh-tw': 'hk',
                'zh-sg': 'cn',
                'zh-hk': 'hk',
                'ja-jp': 'jp',
                'jp': 'jp',
                'ja': 'jp',
                'ko-kr': 'kr',
                'ru-mi': 'ru',
                'ms': 'ms',
                'de': 'de',
                'fr': 'fr',
                'en-us': 'en',
                'en': 'en'
            };
            this.languageSetting = langMap[langs] || this.languageDefault;
            localStorage.setItem('tmpUI_language', this.languageSetting);
        } else {
            this.languageSetting = lang;
        }

        //根据选定的语言设置网页的语言
        this.languageSetHead(this.languageSetting);

        //如果设定的语言不存在与配置文件中，则给定一个默认的语言配置
        if (this.languageConfig[this.languageSetting] === undefined) {
            this.languageSetting = this.languageDefault;
        }

        window.tmpuiHelper.readyTotal++;

        let netrsp = await fetch(this.languageConfig[this.languageSetting] + "?v=" + this.version);
        let rsp = await netrsp.json();

        window.tmpuiHelper.readyQueue++;
        this.languageData = rsp;
        let i18nLang = {};
        if (rsp != null) {
            i18nLang = rsp;
        }

        this.domSelect('[i18n]', (dom) => {
            let i18nOnly = dom.getAttribute("i18n-only");
            if (dom.innerHTML != null && dom.innerHTML != "") {
                if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "html") {
                    dom.innerHTML = i18nLang[dom.getAttribute("i18n")];
                }
            }
            if (dom.getAttribute('placeholder') != null && dom.getAttribute('placeholder') != "") {
                if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "placeholder") {
                    dom.setAttribute('placeholder', i18nLang[dom.getAttribute("i18n")]);
                }
            }
            if (dom.getAttribute('content') != null && dom.getAttribute('content') != "") {
                if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "content") {
                    dom.setAttribute('content', i18nLang[dom.getAttribute("i18n")]);
                }
            }
            if (dom.getAttribute('title') != null && dom.getAttribute('title') != "") {
                if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "title") {
                    dom.setAttribute('title', i18nLang[dom.getAttribute("i18n")]);
                }
            }
            if (dom.value != null && dom.value != "") {
                if (i18nOnly == "value") {
                    dom.value = i18nLang[dom.getAttribute("i18n")];
                }
            }
        });

        // 处理 [data-tpl] 属性 (VXUI 使用的翻译属性)
        this.domSelect('[data-tpl]', (dom) => {
            const key = dom.getAttribute('data-tpl');
            if (!key || i18nLang[key] === undefined) return;
            const val = i18nLang[key];
            const tag = (dom.tagName || '').toUpperCase();

            // title 属性
            if (dom.getAttribute('title') != null && dom.getAttribute('title') !== '') {
                dom.setAttribute('title', val);
            }

            // inputs: prefer placeholder
            if (tag === 'INPUT' || tag === 'TEXTAREA') {
                if (dom.getAttribute('placeholder') != null) {
                    dom.setAttribute('placeholder', val);
                } else if (dom.value != null) {
                    dom.value = val;
                }
                return;
            }

            // 只翻译叶子节点，避免破坏 icon+text 布局
            if (dom.children && dom.children.length > 0) return;
            dom.textContent = val;
        });

        // 处理 [data-tpl-placeholder] 属性 - 仅翻译 placeholder
        this.domSelect('[data-tpl-placeholder]', (dom) => {
            const key = dom.getAttribute('data-tpl-placeholder');
            if (!key || i18nLang[key] === undefined) return;
            dom.setAttribute('placeholder', i18nLang[key]);
        });

        // 处理 [data-tpl-title] 属性 - 仅翻译 title
        this.domSelect('[data-tpl-title]', (dom) => {
            const key = dom.getAttribute('data-tpl-title');
            if (!key || i18nLang[key] === undefined) return;
            dom.setAttribute('title', i18nLang[key]);
        });
    }

    /**
     * 在返回模板内容前进行即时语言替换，避免先出现原始中文再闪烁为目标语言。
     * 对带有 i18n 或 data-tpl 属性的元素按与 languageBuild / TL.tpl_lang 相同规则替换，不修改缓存原文。
     * @param {string} html 原始模板 HTML
     * @returns {string} 翻译后的 HTML
     */
    languageTranslateHtml(html) {
        if (!html || !this.languageData) return html;
        try {
            // 使用 DOMParser 包装一层，避免影响顶级多个节点结构
            const parser = new DOMParser();
            const doc = parser.parseFromString(`<div id="__tmp_lang_wrap">${html}</div>`, 'text/html');
            const wrap = doc.getElementById('__tmp_lang_wrap');
            const i18nLang = this.languageData;

            // 处理 [i18n] 属性
            wrap.querySelectorAll('[i18n]').forEach(dom => {
                const key = dom.getAttribute('i18n');
                if (!key || i18nLang[key] === undefined) return; // 未找到键保持原样
                const i18nOnly = dom.getAttribute('i18n-only');
                // innerHTML
                if (dom.innerHTML != null && dom.innerHTML !== '' && (!i18nOnly || i18nOnly === 'html')) {
                    dom.innerHTML = i18nLang[key];
                }
                // placeholder
                if (dom.getAttribute('placeholder') && (!i18nOnly || i18nOnly === 'placeholder')) {
                    dom.setAttribute('placeholder', i18nLang[key]);
                }
                // content
                if (dom.getAttribute('content') && (!i18nOnly || i18nOnly === 'content')) {
                    dom.setAttribute('content', i18nLang[key]);
                }
                // title
                if (dom.getAttribute('title') && (!i18nOnly || i18nOnly === 'title')) {
                    dom.setAttribute('title', i18nLang[key]);
                }
                // value (仅在明确指定 i18n-only="value" 时才翻译)
                if (dom.value != null && dom.value !== '' && i18nOnly === 'value') {
                    dom.value = i18nLang[key];
                }
            });

            // 处理 [data-tpl] 属性 (VXUI 使用的翻译属性)
            wrap.querySelectorAll('[data-tpl]').forEach(dom => {
                const key = dom.getAttribute('data-tpl');
                if (!key || i18nLang[key] === undefined) return;
                const val = i18nLang[key];
                const tag = (dom.tagName || '').toUpperCase();

                // title 属性
                if (dom.getAttribute('title') != null && dom.getAttribute('title') !== '') {
                    dom.setAttribute('title', val);
                }

                // inputs: prefer placeholder
                if (tag === 'INPUT' || tag === 'TEXTAREA') {
                    if (dom.getAttribute('placeholder') != null) {
                        dom.setAttribute('placeholder', val);
                    } else if (dom.value != null) {
                        dom.value = val;
                    }
                    return;
                }

                // 只翻译叶子节点，避免破坏 icon+text 布局
                if (dom.children && dom.children.length > 0) return;
                dom.textContent = val;
            });

            // 处理 [data-tpl-placeholder] 属性 - 仅翻译 placeholder
            wrap.querySelectorAll('[data-tpl-placeholder]').forEach(dom => {
                const key = dom.getAttribute('data-tpl-placeholder');
                if (!key || i18nLang[key] === undefined) return;
                dom.setAttribute('placeholder', i18nLang[key]);
            });

            // 处理 [data-tpl-title] 属性 - 仅翻译 title
            wrap.querySelectorAll('[data-tpl-title]').forEach(dom => {
                const key = dom.getAttribute('data-tpl-title');
                if (!key || i18nLang[key] === undefined) return;
                dom.setAttribute('title', i18nLang[key]);
            });

            return wrap.innerHTML;
        } catch (e) {
            console.warn('languageTranslateHtml error', e);
            return html; // 失败则返回原始内容
        }
    }

    languageSetHead(langs) {
        const langMap = {
            'zh-cn': 'zh-cn',
            'zh-tw': 'zh-hk',
            'zh-sg': 'zh-cn',
            'zh-hk': 'zh-hk',
            'ja-jp': 'ja',
            'jp': 'ja',
            'ja': 'ja',
            'ko-kr': 'ko',
            'ru-mi': 'ru',
            'ms': 'ms',
            'de': 'de',
            'fr': 'fr',
            'en-us': 'en',
            'en': 'en'
        };
        const lang = langMap[langs] || 'en';
        document.getElementsByTagName('html')[0].setAttribute('lang', lang);
    }

    description(des) {
        $('meta[name=description]').attr('content', des);
    }

    loadPageInit() {
        //预置的SVG加载图标
        let preloadingIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; display: block;" width="129" height="129" viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet">
        <rect x="17.5" y="30" width="15" height="40" fill="#93dbe9">
          <animate attributeName="y" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="18;30;30" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.2s"></animate>
          <animate attributeName="height" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="64;40;40" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.2s"></animate>
        </rect>
        <rect x="42.5" y="30" width="15" height="40" fill="#689cc5">
          <animate attributeName="y" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="20.999999999999996;30;30" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.1s"></animate>
          <animate attributeName="height" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="58.00000000000001;40;40" keySplines="0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.1s"></animate>
        </rect>
        <rect x="67.5" y="30" width="15" height="40" fill="#5e6fa3">
          <animate attributeName="y" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="20.999999999999996;30;30" keySplines="0 0.5 0.5 1;0 0.5 0.5 1"></animate>
          <animate attributeName="height" repeatCount="indefinite" dur="1s" calcMode="spline" keyTimes="0;0.5;1" values="58.00000000000001;40;40" keySplines="0 0.5 0.5 1;0 0.5 0.5 1"></animate>
        </rect>
        </svg>
        `;

        if (!this.loadingPageInit) {

            this.htmlAppend('#tmpui', `<div id="tmpui_loading_bg" style="background-color: ${this.bg_color};"></div>`);
            this.htmlAppend('#tmpui_loading_bg', '<div id="tmpui_loading_show"></div>');
            this.htmlAppend('#tmpui_loading_show', '<div style="text-align:center;margin-bottom:10px;" id="tmpui_loading_content"></div>');
            this.htmlAppend('#tmpui_loading_content', '<div id="tmpui_loading_icon"></div>');

            if (this.loadingIcon !== false) {
                document.querySelector('#tmpui_loading_icon').innerHTML = preloadingIcon;
                let xhr = new XMLHttpRequest();
                xhr.open('GET', this.extendStaticHost + this.loadingIcon, true);
                xhr.responseType = 'blob';
                xhr.addEventListener('load', (e) => {
                    if (xhr.status === 200) {
                        const contentType = xhr.getResponseHeader('Content-Type');
                        let reader = new FileReader();
                        reader.onloadend = () => {
                            const base64data = reader.result.split(',')[1]; // 将 base64 头部信息去掉
                            document.querySelector('#tmpui_loading_icon').innerHTML = '<img src="data:' + contentType + ';base64,' + base64data + '" style="vertical-align: middle;border-style: none;width:129px;height:129px;"/>';
                            console.log('Loading ICON::ok');
                        };
                        reader.readAsDataURL(xhr.response);
                    } else {
                        console.error('Failed to load ICON.');
                    }
                });
                xhr.send();

            }

            if (this.loadingText !== false) {
                this.htmlAppend('#tmpui_loading_content', '<div style="text-align:center;font-size: 38px;line-height: 1.5;font-family: Arial,sans-serif !important;">' + this.loadingText + '</div>');
            }

            this.loadingPageInit = true;
            this.log('Loading page created.');
        }
    }

    loadpage(status, isCached = false) {

        // 无论是否启用 loadingPage，都需要处理 FOUC 问题
        // 如果 status 为 false (加载完成)，强制显示内容区域
        if (status === false) {
             // 页面加载完成（CSS已就绪），显示主体内容
             let tb = document.getElementById('tmpui_body');
             if (tb) {
                 // 强制重绘以确保 transition 生效
                 // requestAnimationFrame(() => {
                     tb.style.transition = 'opacity 0.3s ease';
                     tb.style.opacity = '1';
                 // });
             }
        }

        if (!this.loadingPage) {
            this.log('Loading page exit.');
            return false;
        }

        if (status == true) {
            // 延迟 500ms (缓存时 2000ms) 显示加载动画，实现无闪烁加载
            if (this._loadingTimer) clearTimeout(this._loadingTimer);
            this._loadingActive = true;
            this.doExit();

            let delay = isCached ? 2000 : 500;
            this._loadingDelay = delay;
            this._loadingStartTime = Date.now();

            this._loadingTimer = setTimeout(() => {
                if (this._loadingActive) {
                    document.body.style.overflow = 'hidden';
                    this.domShow('#tmpui');
                    this.log('Loading page on');
                }
            }, delay);
        } else {
            this._loadingActive = false;
            if (this._loadingTimer) clearTimeout(this._loadingTimer);

            document.body.style.overflow = '';
            this.domHide('#tmpui');
            this.log('Loading page off');
            if (this.progressEnable) {
                return true;
            }
        }
    }

    getFile(url) {
        const raw = this.filesCache[url];
        // 如果已有语言数据，实时翻译（不修改缓存原文，便于语言切换后重新翻译）
        return this.languageTranslateHtml(raw);
    }

    tpl(id, data) {
        const element = document.getElementById(id);
        if (!element) {
            console.error('templateEngine::Element not found with id: ' + id);
            return '';
        }

        const html = element.innerHTML;
        if (!html) {
            console.error('templateEngine::Template content is empty');
            return '';
        }

        try {
            var re = /<%(.+?)%>/g,
                reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
                code = 'try { with(obj) { var r=[];\n',
                cursor = 0,
                match;

            var add = function (line, js) {
                js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                    (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
                return add;
            }

            while (match = re.exec(html)) {
                add(html.slice(cursor, match.index))(match[1], true);
                cursor = match.index + match[0].length;
            }
            add(html.substr(cursor, html.length - cursor));

            code = (code + 'return r.join(""); }} catch(e) { throw e; }').replace(/[\r\t\n]/g, '');

            let result = new Function('obj', code).apply(data, [data]);
            return result;

        } catch (e) {
            let errorMessage = `
                <div class="template-error" style="
                    color: #721c24;
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    border-radius: 4px;
                    padding: 15px;
                    margin: 10px 0;
                    font-family: monospace;">
                    <h3 style="margin-top: 0;">🚫 tmpUI Error</h3>
                    <div style="margin: 10px 0;">
                        <strong>ID:</strong> #${id}<br>
                        <strong>Type:</strong> ${e.name}<br>
                        <strong>Message:</strong> ${e.message}<br>
                    </div>
                </div>`;

            console.error('Template Error in element #' + id + ':\n', e);
            return errorMessage;
        }
    }

    domSelect(query, fn) {
        document.querySelectorAll(query).forEach(fn);
        return this;
    }

    htmlAppend(dom, html) {
        this.domSelect(dom, (x) => {
            x.insertAdjacentHTML('beforeEnd', html);
        });
    }

    htmlRewrite(dom, html) {
        this.domSelect(dom, (x) => {
            x.innerHTML = html;
        });
    }

    htmlReplaceWith(dom, html) {
        this.domSelect(dom, (x) => {
            x.outerHTML = html;
        });
    }

    domShow(dom) {
        this.domSelect(dom, (x) => {
            x.style.display = 'block';
        });
    }

    domHide(dom) {
        this.domSelect(dom, (x) => {
            x.style.display = 'none';
        });
    }

    getUrlVars(href) {
        var vars = {};
        var parts = href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    }

    log(msg) {
        if (this.debug) {
            console.log("tmpUI::Log -> " + msg);
        }
    }

    logError(msg) {
        if (this.errorOnloading) {
            this.htmlAppend('#tmpui_loading_content', '<div style="text-align:center;font-family: Helvetica,Arial,sans-serif !important;">' + msg + '</div>');
        }
        console.error("tmpUI::Error -> " + msg);
    }
}
