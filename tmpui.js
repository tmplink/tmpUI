/**
 * tmpUI.js
 * version: 36
 * Github : https://github.com/tmplink/tmpUI
 * Date :2023-02-23
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
    loadingText = 'Loading...'
    readyCallback = null
    progressEnable = true
    progressStatus = false
    currentRoute = '/'
    currentPage = '/'
    onExitfunction = []
    filesCache = []
    statusLastPage = ''

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

        //初始化当前页面的路由
        //this.route(window.location.pathname);

        //初始化CSS
        this.cssInit();

        //Checking
        window.onload = () => {
            this.route();
        }
        //当面前进与后退的时候，popstate监听历史记录变化，触发对应页面的ajax请求。
        window.addEventListener("popstate", (e) => {
            // 获取当前 URL 中的 tmpui_page 参数
            let tmpuiPage = new URL(window.location.href).searchParams.get("tmpui_page");
            let currentPath = window.location.pathname+window.location.search;
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

    cssInit() {
        this.htmlAppend('head', '<style>body::-webkit-scrollbar{width:0!important}#tmpui_loading_bg{position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:15000}#tmpui_loading_show{color:#000;z-index:15001;width:80%;height:200px;position:absolute;left:0;top:0;right:0;bottom:0;margin:auto;text-align:center}.tmpui_tpl{display:none}.tmpui_progress{width:180px;background:#ddd;margin-right:auto;margin-left:auto}.tmpui_curRate{width:0%;background:#f30}.tmpui_round_conner{height:8px;border-radius:15px}</div>');
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
        this.log('Send GoogleAnalytics : ' + document.title);
        gtag('event', 'page_view', {
            page_title: document.title,
            page_path: this.currentRoute,
            send_to: this.googleAnalytics
        });
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
            }, 500);
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
                                // console.log(url);
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
                                // console.log(url);
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

        //查找路由
        this.loadpage(true);

        //在设定了 Hash 的情况下，不进行路由
        if (hash !== false && !this.loadingPage) {
            return false;
        }

        //路由未载入
        if (this.config.path[url] === undefined) {
            //如果启用了动态配置
            if (this.dynamicRouter !== null) {
                //尝试找到这个配置
                let configure_url = this.resPath + this.dynamicRouter + url + '.json';
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
        //下载所需组件
        this.loaderStart(url, () => {
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
            let contentVersion = this.config.path[url].res[i].version===false?false:true;
            let contentReloadTarget = contentReload === false ? 'tmpUIRes_once' : 'tmpUIRes';
            let contentURL = '';
            
            if(contentVersion===true){
                contentURL = i + '?v=' + this.config.version;
            }else{
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
                this.htmlAppend('head', `<link class="${contentReloadTarget}" rel="stylesheet" href="${contentURL}">`);
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
                if (this.config.path[url].res[i].target.type === "append") {
                    this.htmlAppend('#tmpui_body', `<!--[${i}]-->`);
                    this.htmlAppend('#tmpui_body', content);
                }
                if (this.config.path[url].res[i].target.type === "body") {
                    this.htmlAppend('#tmpui_body', `<!--[${i}]-->`);
                    this.htmlRewrite('#tmpui_body', content);
                }
                if (this.config.path[url].res[i].target.type === "id") {
                    let id = this.config.path[url].res[i].target.val;
                    this.htmlAppend('#' + id, `<!--[${i}]-->`);
                    this.htmlReplaceWith('#' + id, content);
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
                xhttp.open("GET", this.resPath + i, true);
            }else{
                xhttp.open("GET", this.resPath + i + '?v=' + this.version, true);
            }
            xhttp.send();
        }
    }

    loaderFinish() {
        //checking progressEnable
        if (this.progressEnable && this.progressStatus === false) {
            //show progress bar
            this.progressStatus = true;
            this.htmlAppend('#tmpui_loading_show', '<div class="tmpui_progress tmpui_round_conner" id="tmpui_loading_progress"><div class="tmpui_curRate tmpui_round_conner"></div></div>');
        }

        //this.log("Queue:" + window.tmpuiHelper.loadTotal + "|Finish:" + window.tmpuiHelper.loadQueue);
        let percent = Math.ceil(window.tmpuiHelper.loadQueue / window.tmpuiHelper.loadTotal * 100);
        this.domSelect('.tmpui_curRate', (el) => {
            el.style.width = `${percent}%`;
            if (percent === 100) {
                document.body.style.overflow = "";
                document.getElementById('tmpui_loading_progress').style.display = "none";
                //document.getElementById('tmpui').style.display = "none";
            }
        });

        if (window.tmpuiHelper.loadQueue == window.tmpuiHelper.loadTotal) {
            this.log("Loading is complete.");
            if (typeof this.loadCallback === 'function') {
                this.log("Callback is running.");
                this.loadCallback();
            }
            this.loadCallback = null;
            this.progressStatus = true;
        }
    }


    title(title) {
        window.title = title;
    }

    languageSet(lang) {
        this.log("languageSet : " + lang);
        var old = localStorage.getItem('tmpUI_language');
        if (old === lang) {
            return false;
        } else {
            localStorage.setItem('tmpUI_language', lang);
            this.languageBuild();
        }
    }

    languageGet() {
        return localStorage.getItem('tmpUI_language');
    }

    async languageBuild() {
        var langs = navigator.language.toLowerCase();
        //设置 html lang 属性
        document.getElementsByTagName('html')[0].setAttribute('lang', langs);
        //init language
        var lang = localStorage.getItem('tmpUI_language');
        if (lang === null) {
            this.log("language auto detect : " + lang);
            switch (langs) {
                case 'zh-cn':
                    this.languageSetting = 'cn';
                    break;
                case 'zh-tw':
                    this.languageSetting = 'hk';
                    break;
                case 'zh-sg':
                    this.languageSetting = 'cn';
                    break;
                case 'zh-hk':
                    this.languageSetting = 'hk';
                    break;
                case 'ja-jp':
                    this.languageSetting = 'jp';
                    break;
                case 'ko-kr':
                    this.languageSetting = 'kr';
                    break;
                case 'ru-mi':
                    this.languageSetting = 'ru';
                    break;
                case 'ms':
                    this.languageSetting = 'ms';
                    break;
                case 'de':
                    this.languageSetting = 'de';
                    break;
                case 'fr':
                    this.languageSetting = 'fr';
                    break;
                case 'en-us':
                    this.languageSetting = 'en';
                    break;
                default:

                    this.languageSetting = this.languageDefault;
                    break;
            }
            localStorage.setItem('tmpUI_language', this.languageSetting);
        } else {
            this.languageSetting = lang;
        }

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
            if (dom.value != null && dom.value != "") {
                if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "value") {
                    dom.value = i18nLang[dom.getAttribute("i18n")];
                }
            }
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
        });
    }

    description(des) {
        $('meta[name=description]').attr('content', des);
    }

    loadpage(status) {

        if (!this.loadingPage) {
            this.log('Loading page exit.');
            return false;
        }

        if (!this.loadingPageInit) {

            this.htmlAppend('#tmpui', '<div id="tmpui_loading_bg" style="background-color: rgba(255, 255, 255);"></div>');
            this.htmlAppend('#tmpui_loading_bg', '<div id="tmpui_loading_show"></div>');
            this.htmlAppend('#tmpui_loading_show', '<div style="text-align:center;margin-bottom:30px;" id="tmpui_loading_content"></div>');

            if (this.loadingIcon !== false) {
                this.htmlAppend('#tmpui_loading_content', '<img src="' + this.loadingIcon + '" style="vertical-align: middle;border-style: none;width:129px;height:129px;margin-bottom: 10px;"/>');
            } 
            if (this.loadingText !== false) {
                this.htmlAppend('#tmpui_loading_content', '<div style="text-align:center;font-size: 38px;font-family: fa5-proxima-nova,"Helvetica Neue",Helvetica,Arial,sans-serif;">' + this.loadingText + '</div>');
            }

            this.loadingPageInit = true;
            this.log('Loading page created.');
        }

        if (status == true) {
            document.body.style.overflow = 'hidden';
            this.domShow('#tmpui');
            this.doExit();
            this.log('Loading page on');
        } else {
            document.body.style.overflow = '';
            this.domHide('#tmpui');
            this.log('Loading page off');
            if (this.progressEnable) {
                return true;
            }
        }
    }

    getFile(url) {
        return this.filesCache[url];
    }

    tpl(id, data) {
        let html = $('#' + id).html();
        let return_html = this.templateEngine(html, data);
        return return_html;
    }

    templateEngine(html, options) {
        if (html == '' || html == null) {
            console.error('templateEngine::Html can\'t be null.');
            return '';
        }
        var re = /<%(.+?)%>/g,
            reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
            code = 'with(obj) { var r=[];\n',
            cursor = 0,
            result,
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
        code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, ' ');
        try { result = new Function('obj', code).apply(options, [options]); }
        catch (err) { console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n"); }
        return result;
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
        if(this.errorOnloading){
            this.htmlAppend('#tmpui_loading_content', '<div style="text-align:center;font-family: fa5-proxima-nova,"Helvetica Neue",Helvetica,Arial,sans-serif;">' + msg + '</div>');
        }
        console.error("tmpUI::Error -> " + msg);
    }
}