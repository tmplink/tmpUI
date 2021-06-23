/**
 * tmpUI.js
 * version: 13
 * Github : https://github.com/tmplink/tmpUI
 * Date : 2021-6-23
 */
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class tmpUI {
    constructor(url, dynamic) {
        _defineProperty(this, "status", {});

        _defineProperty(this, "config", {});

        _defineProperty(this, "config_dynamic", true);

        _defineProperty(this, "version", 0);

        _defineProperty(this, "index", '/');

        _defineProperty(this, "debug", true);

        _defineProperty(this, "reload_table", {});

        _defineProperty(this, "resPath", '');

        _defineProperty(this, "Babel", false);

        _defineProperty(this, "jQuery", false);

        _defineProperty(this, "GoogleAnalytics", false);

        _defineProperty(this, "googleAnalyticsQueue", []);

        _defineProperty(this, "dynamicRouter", null);

        _defineProperty(this, "language_config", false);

        _defineProperty(this, "language_data", false);

        _defineProperty(this, "language_setting", 'en');

        _defineProperty(this, "loadDelay", 500);

        _defineProperty(this, "loadCallback", []);

        _defineProperty(this, "readyFunction", []);

        _defineProperty(this, "loadingPageInit", false);

        _defineProperty(this, "loadingPage", false);

        _defineProperty(this, "loadingIcon", false);

        _defineProperty(this, "loadingText", 'Loading...');

        _defineProperty(this, "readyCallback", null);

        _defineProperty(this, "progress_enable", true);

        _defineProperty(this, "progress_status", false);

        _defineProperty(this, "animation_time", 500);

        _defineProperty(this, "animation_stime", 0);

        _defineProperty(this, "currentRoute", '/');

        _defineProperty(this, "onExitfunction", []);

        _defineProperty(this, "filesCache", []);

        this.state = {
            displayTrophy: true
        };
        window.tmpui_helper = {
            loadQueue: 0,
            loadTotal: 0,
            readyQueue: 0,
            readyTotal: 0
        };

        if (dynamic === true || dynamic === undefined) {
            this.config_dynamic = true;
        } else {
            this.config_dynamic = false;
        }

        this.loadConfig(url, config => {
            //初始化history
            history.replaceState(this.state, null, ''); //写入配置文件

            this.config = this.rebuildConfig(config);
            this.rebuildRunConfig(); //初始化当前页面的路由
            //this.route(window.location.pathname);
            //Checking

            this.CheckAddonLib(() => {
                this.route(); //当页面前进与后退的时候，popstate监听历史记录变化，触发对应页面的ajax请求。

                window.addEventListener('popstate', e => {
                    //var newPage = e.state.newPage;
                    this.route();
                });
            });
        });
    }

    CheckAddonLib(cb) {
        if (this.loadBabel === true) {
            if (typeof Babel === 'undefined') {
                this.log('waitting for Babel');
                setTimeout(() => {
                    this.CheckAddonLib(cb);
                }, 200);
                return false;
            }
        }

        if (this.loadJquery === true) {
            if (typeof jQuery === 'undefined') {
                this.log('waitting for jQuery');
                setTimeout(() => {
                    this.CheckAddonLib(cb);
                }, 200);
                return false;
            }
        }

        cb();
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
        this.readyFunction.push(cb);
    }

    readyExec() {
        if (this.readyFunction.length !== 0) {
            for (let x in this.readyFunction) {
                this.readyFunction[x]();
            }

            this.readyFunction = [];
        } //add GoogleAnalytics


        this.log('Send GoogleAnalytics : ' + document.title);
        gtag('event', 'page_view', {
            page_title: document.title,
            page_path: this.currentRoute,
            send_to: this.GoogleAnalytics
        });
    }

    readyEvent() {
        if (window.tmpui_helper.readyQueue == window.tmpui_helper.readyTotal) {
            this.readyExec();
            this.log("Ready");
        } else {
            setTimeout(() => {
                this.readyEvent();
            }, 1000);
        }
    }

    loadConfig(url, cb) {
        let xhttp = new XMLHttpRequest();
        let config = {};
        let config_url = url;

        if (this.config_dynamic) {
            config_url = config_url + '?' + Date.parse(new Date());
        }

        xhttp.onloadend = e => {
            if (xhttp.status == 200) {
                config = JSON.parse(xhttp.responseText);
                cb(config);
            } else {
                this.logError("Load config fail.");
            }
        };

        xhttp.open("GET", config_url, true);
        xhttp.send();
    }

    loadAddonLib(src) {
        var s = document.createElement('script');
        s.src = src;
        s.type = "text/javascript";
        s.async = false;
        document.head.appendChild(s);
    }

    loadGtag(id) {
        var s1 = document.createElement('script');
        s1.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
        s1.type = "text/javascript";
        s1.async = false;
        document.head.appendChild(s1);
        var s2 = document.createElement('script');
        s2.innerHTML = 'window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag(\'js\', new Date());gtag("config", "' + this.GoogleAnalytics + '");';
        s2.type = "text/javascript";
        s2.async = false;
        document.head.appendChild(s2);
    }

    rebuildRunConfig(config) {
        //覆盖由配置文件设定的值
        if (this.config.loadingPage !== undefined) {
            this.loadingPage = this.config.loadingPage;
        }

        if (this.config.loadingText !== undefined) {
            this.loadingText = this.config.loadingText;
        }

        if (this.config.loadingIcon !== undefined) {
            this.loadingIcon = this.config.loadingIcon;
        }

        if (this.config.version !== undefined) {
            this.version = this.config.version;
        }

        if (this.config.language !== undefined) {
            this.language_config = this.config.language;
        }

        if (this.config.loadingProgress !== undefined) {
            this.progress_enable = this.config.loadingProgress;
        }

        if (this.config.loadingAnimationTime !== undefined) {
            this.animation_time = this.config.loadingAnimationTime;
        }

        if (this.config.dynamicRouter !== undefined) {
            this.dynamicRouter = this.config.dynamicRouter;
        }

        if (this.config.resPath !== undefined) {
            this.resPath = this.config.resPath;
        } //todo:custom error page


        if (this.config.pageNotFound !== undefined) {
            this.pageNotFound = this.config.pageNotFound;
        } //if need build in jquery and babel


        if (this.config.jQuery !== false) {
            this.loadAddonLib(this.config.jQuery);
            this.log("Load jQuery:" + this.config.jQuery);
            this.loadJquery = true;
        }

        if (this.config.Babel !== false) {
            this.loadAddonLib(this.config.Babel);
            this.log("Load Babel:" + this.config.Babel);
            this.loadBabel = true;
        } //Add GoogleAnalytics


        if (this.config.GoogleAnalytics !== false) {
            this.loadGtag(this.config.GoogleAnalytics);
            this.log("Load GoogleAnalytics:" + this.config.GoogleAnalytics);
            this.loadGoogleAnalytics = this.config.GoogleAnalytics;
            this.GoogleAnalytics = this.config.GoogleAnalytics;
        }
    }

    rebuildConfig(config) {
        //处理cofnig文件中的预处理关系
        if (config.path !== undefined) {
            for (let url in config.path) {
                config.path[url].res = {}; //检查该项是否存在预加载的内容

                if (config.path[url].preload !== undefined) {
                    for (let purl in config.path[url].preload) {
                        //处理预加载的内容
                        let pkey = config.path[url].preload[purl];

                        for (let preload in config.preload[pkey]) {
                            config.path[url].res[preload] = {};
                            config.path[url].res[preload] = config.preload[pkey][preload];
                        }
                    }
                } //处理正文


                if (config.path[url].body !== undefined) {
                    for (let purl in config.path[url].body) {
                        config.path[url].res[purl] = config.path[url].body[purl];
                    }
                } //处理需要最后加载的内容


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

        config.reload_table = {};
        return config;
    }

    linkRebind() {
        let atag = document.getElementsByTagName("a");

        if (atag.length > 0) {
            for (let i in atag) {
                if (typeof atag[i] === 'object') {
                    //不处理上级节点是pre或者code的情况
                    if (atag[i].parentNode.nodeName === 'PRE' || atag[i].parentNode.nodeName === 'CODE') {
                        continue;
                    }

                    if (atag[i].getAttribute("tmpui-app") == 'true' && atag[i].getAttribute("tmpui-app-rebind") != 'true') {
                        //获取绝对链接地址
                        let newpage = atag[i].getAttribute("target") == '_blank' ? true : false;
                        let url = '';
                        let a_url = atag[i].getAttribute("href");
                        let urlp = a_url.split("?"); //

                        if (urlp.length === 1) {
                            url = this.index + '?tmpui_page=' + urlp[0];
                        } else {
                            url = this.index + '?tmpui_page=' + urlp[0] + '&' + urlp[1];
                        } //生成App内链接地址
                        //let url = this.index + '?tmpui_page=' + t_url + u;
                        //写入到专用标签


                        atag[i].setAttribute("tmpui-app-rebind", 'true'); //修改原有标签到新地址

                        atag[i].setAttribute("href", url); //修改事件行为

                        if (!newpage) {
                            atag[i].addEventListener('click', e => {
                                e.preventDefault();
                                console.log(url);
                                history.pushState({
                                    newPage: url
                                }, null, url); //ajax('GET', url, 'page=' + url, this.loader, true);

                                this.route();
                            });
                        }
                    }
                }
            }
        }

        let ctag = document.getElementsByTagName("code");

        if (ctag.length > 0) {
            for (let i in ctag) {
                if (typeof ctag[i] === 'object') {
                    let ishtml = ctag[i].getAttribute("tmpui-html-code");

                    if (ishtml == 'true') {
                        let text = ctag[i].innerHTML;
                        ctag[i].innerHTML = text.toString().replace(/[<>&"]/g, c => {
                            return {
                                '<': '&lt;',
                                '>': '&gt;',
                                '&': '&amp;',
                                '"': '&quot;'
                            }[c];
                        });
                        ctag[i].setAttribute("tmpui-html-code", "loaded");
                    }
                }
            }
        }

        return 'ok';
    }

    autofix() {
        if (this.config.siteroot !== '') {
            var siteroot = this.config.siteroot;
            $('[tmpui-root]').each(function () {
                var autofixer = $(this).attr("tmpui-root");
                var src = $(this).attr("src");
                var href = $(this).attr("href");

                if (autofixer === 'true' && src !== undefined && src !== null) {
                    $(this).attr("src", siteroot + src);
                    $(this).attr("tmpui-root", 'false');
                }

                if (autofixer === 'true' && href !== undefined && href !== null) {
                    $(this).attr("href", siteroot + href);
                    $(this).attr("tmpui-root", 'false');
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
            newPage: url
        }, null, url);
        this.route();
    }
    /**
     * 路由功能，根据配置进行选路
     * @param {*} config 
     */


    route() {
        let url = "/";
        let params = null; //获取参数

        let href = window.location.href;

        if (window.location.hash !== '') {
            href = window.location.href.substr(0, window.location.href.indexOf(window.location.hash));
        } //add GoogleAnalytics


        let ga_path = window.location.href.replace(window.location.origin, '');
        this.log('Send GoogleAnalytics : ' + ga_path);
        this.currentRoute = ga_path;
        params = this.getUrlVars(href); //默认文件

        if (params.tmpui_page !== undefined) {
            url = params.tmpui_page;
        }

        $('.tmpUIRes').remove(); //查找路由

        this.loadpage(true); //路由未载入

        if (this.config.path[url] === undefined) {
            //if dynamicRouter has been configured.
            if (this.dynamicRouter !== null) {
                //find and load
                let configure_url = this.resPath + this.dynamicRouter + url + '.json';
                let xhttp = new XMLHttpRequest();

                xhttp.onloadend = () => {
                    if (xhttp.status == 200 || xhttp.status == 304) {
                        this.config.path[url] = JSON.parse(xhttp.responseText);
                        this.rebuildConfig(this.config);
                        this.route_core(url);
                    } else {
                        this.route_unfound(url);
                    }
                };

                xhttp.open("GET", configure_url + '?v=' + this.version, true);
                xhttp.send();
                return true;
            } else {
                //unfound page
                this.route_unfound(url);
                return false;
            }
        }

        this.route_core(url);
    }

    route_core(url) {
        //下载所需组件
        this.loaderStart(url, () => {
            //调整网页标题
            document.title = this.config.path[url].title; //写入到页面,处理资源时需要根据对应的资源类型进行处理

            this.draw(url); //处理链接关系

            this.autofix(); //绑定链接事件

            this.linkRebind(); //关闭载入动画

            setTimeout(() => {
                this.loadpage(false);
            }, this.loadDelay);
        });
    }

    route_unfound(url) {
        //todo:custom error page
        if (this.pageNotFound !== null) {
            console.log(this.pageNotFound);
            this.route_core(this.pageNotFound);
        }

        this.log('Page not found : ' + url);
        return false;
    }

    draw(url) {
        for (let i in this.config.path[url].res) {
            let content_type = this.config.path[url].res[i].type;
            let content = this.config.path[url].res[i].dom;
            let content_reload = this.config.path[url].res[i].reload;

            if (content_type === 'js' || content_type === 'js-es6') {
                if (content_type === 'js-es6') {
                    content = Babel.transform(content, {
                        presets: ['es2015', 'stage-3']
                    }).code;
                }

                if (content_reload === false) {
                    if (this.reload_table[i] === false) {
                        this.reload_table[i] = true;
                        window.tmpui_helper.readyTotal++;
                        $('body').append("<script class=\"tmpUIRes_once\" type=\"text/javascript\" \">\n" + content + ";\nwindow.tmpui_helper.readyQueue++;</script>\n");
                    }
                } else {
                    window.tmpui_helper.readyTotal++;
                    $('body').append("<script class=\"tmpUIRes\" type=\"text/javascript\" \">\n" + content + ";\nwindow.tmpui_helper.readyQueue++;</script>\n");
                }
            }

            if (content_type === 'css') {
                if (content_reload === false) {
                    if (this.reload_table[i] === false) {
                        this.reload_table[i] = true;
                        $('head').append("<link class=\"tmpUIRes_once\" rel=\"stylesheet\" href=\"" + i + '?v=' + this.config.version + "\" >\n");
                    }
                } else {
                    $('head').append("<link class=\"tmpUIRes\" rel=\"stylesheet\" href=\"" + i + '?v=' + this.config.version + "\" >\n");
                }
            }

            if (content_type === 'tpl') {
                if (content_reload === false) {
                    if (this.reload_table[i] === false) {
                        this.reload_table[i] = true;
                        $('body').append("<div class=\"tmpUIRes_once\" style=\"display:none\" \">\n" + content + "</div>\n");
                    }
                } else {
                    $('body').append("<div class=\"tmpUIRes\" style=\"display:none\" \">\n" + content + "</div>\n");
                }
            }

            if (content_type === 'file') {
                this.filesCache[i] = content;

                if (this.reload_table[i] === false) {
                    this.reload_table[i] = true;
                }
            }

            if (content_type === 'html') {
                if (this.config.path[url].res[i].target.type === "append") {
                    $('#tmpui_body').append(content);
                }

                if (this.config.path[url].res[i].target.type === "body") {
                    $('#tmpui_body').html(content);
                }

                if (this.config.path[url].res[i].target.type === "id") {
                    let id = this.config.path[url].res[i].target.val;
                    $('#' + id).replaceWith(content);
                }
            }

            this.log(i);
        }

        if (this.language_config !== false) {
            this.language_build();
        }

        this.readyEvent();
    }

    loaderStart(url, cb) {
        this.loadCallback = cb; //常规加载顺序

        for (let i in this.config.path[url].res) {
            window.tmpui_helper.loadTotal++;
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

        if (this.config.path[target].res[i].reload === false && this.reload_table[i] === undefined) {
            this.reload_table[i] = false;
        }

        if (this.config.path[target].res[i].state === 1) {
            //如果这个URL已经加载了，直接返回。
            window.tmpui_helper.loadQueue++;
            this.loaderFinish();
        } else {
            //如果这个URL没有加载，加载后返回。
            let xhttp = new XMLHttpRequest();

            xhttp.onloadend = () => {
                if (xhttp.status != '200' && xhttp.status != '302') {
                    this.logError("can't load [http code " + xhttp.status + ']' + i);
                }

                window.tmpui_helper.loadQueue++;
                this.config.path[target].res[i].state = 1;
                this.config.path[target].res[i].dom = xhttp.responseText;
                this.loaderFinish();
            };

            xhttp.ontimeout = () => {
                this.logError("can't load [timeout]" + i);
            };

            xhttp.onerror = () => {
                this.logError("can't load [error]" + i);
            };

            xhttp.onabort = () => {
                this.logError("can't load [abort]" + i);
            };

            xhttp.open("GET", this.resPath + i + '?v=' + this.version, true);
            xhttp.send();
        }
    }

    loaderFinish() {
        //checking progress_enable
        if (this.progress_enable && this.progress_status === false) {
            //show progress bar
            this.progress_status = true;
            this.animation_slice();
            $('#tmpui_loading_show').append('<div class="tmpui_progress tmpui_round_conner" id="tmpui_loading_progress"><div class="tmpui_curRate tmpui_round_conner"></div></div>');
        } //this.log("Queue:" + window.tmpui_helper.loadTotal + "|Finish:" + window.tmpui_helper.loadQueue);


        let percent = Math.ceil(window.tmpui_helper.loadQueue / window.tmpui_helper.loadTotal * 100);
        $('.tmpui_curRate').animate({
            'width': percent + '%'
        }, this.animation_stime, () => {
            if (percent === 100) {
                $('#tmpui_loading_progress').fadeOut();
                $('body').css('overflow', '');
                $('#tmpui').fadeOut();
            }
        });

        if (window.tmpui_helper.loadQueue == window.tmpui_helper.loadTotal) {
            this.log("Loading is complete.");

            if (typeof this.loadCallback === 'function') {
                this.log("Callback is running.");

                try {
                    this.loadCallback();
                } catch (e) {
                    this.logError("The callback contains errors, please check.");
                }
            }

            this.loadCallback = null;
            this.progress_status = true;
        }
    }

    animation_slice() {
        if (window.tmpui_helper.loadTotal > 1) {
            this.animation_stime = Math.ceil(this.animation_time / window.tmpui_helper.loadTotal);
        } else {
            this.animation_stime = this.animation_time;
        }

        this.log('Animation slice time: ' + this.animation_stime + ' ,total: ' + this.animation_time);
    }

    title(title) {
        $('title').html(title);
    }

    language_set(lang) {
        var old = localStorage.getItem('language');

        if (old === lang) {
            return false;
        } else {
            localStorage.setItem('language', lang);
            this.language_build();
        }
    }

    language_get() {
        return localStorage.getItem('language');
    }

    language_build() {
        //init language
        var lang = localStorage.getItem('language');
        this.log("language setting...." + lang);

        if (lang === null) {
            var langs = navigator.language;
            this.language_setting = 'en';

            if (langs === 'zh-CN' || langs === 'zh-SG' || langs === 'zh') {
                this.language_setting = 'cn';
            }

            if (langs === 'zh-TW' || langs === 'zh-HK') {
                this.language_setting = 'hk';
            }

            if (langs === 'ja' || langs === 'ja-JP') {
                this.language_setting = 'jp';
            }

            if (langs === 'ru' || langs === 'ru-MI') {
                this.language_setting = 'ru';
            }

            if (langs === 'ko') {
                this.language_setting = 'kr';
            }

            if (langs === 'ms') {
                this.language_setting = 'my';
            }

            localStorage.setItem('language', this.language_setting);
        } else {
            this.language_setting = lang;
        }

        window.tmpui_helper.readyTotal++;
        $.get(this.language_config[this.language_setting] + "?v=" + this.version, rsp => {
            window.tmpui_helper.readyQueue++;
            this.language_data = rsp;
            var i18nLang = {};

            if (rsp != null) {
                i18nLang = rsp;
            }

            $('[i18n]').each(function (i) {
                var i18nOnly = $(this).attr("i18n-only");

                if ($(this).val() != null && $(this).val() != "") {
                    if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "value") {
                        $(this).val(i18nLang[$(this).attr("i18n")]);
                    }
                }

                if ($(this).html() != null && $(this).html() != "") {
                    if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "html") {
                        $(this).html(i18nLang[$(this).attr("i18n")]);
                    }
                }

                if ($(this).attr('placeholder') != null && $(this).attr('placeholder') != "") {
                    if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "placeholder") {
                        $(this).attr('placeholder', i18nLang[$(this).attr("i18n")]);
                    }
                }

                if ($(this).attr('content') != null && $(this).attr('content') != "") {
                    if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "content") {
                        $(this).attr('content', i18nLang[$(this).attr("i18n")]);
                    }
                }

                if ($(this).attr('title') != null && $(this).attr('title') != "") {
                    if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "title") {
                        $(this).attr('title', i18nLang[$(this).attr("i18n")]);
                    }
                }
            });
        }, 'json');
    }

    description(des) {
        $('meta[name=description]').attr('content', des);
    }

    loadpage(status) {
        if (!this.loadingPage) {
            this.log('Loading page exit.');
            this.ready_exec();
            return false;
        }

        if (!this.loadingPageInit) {
            $('#tmpui').append('<div id="tmpui_loading_bg" style="background-color: rgba(255, 255, 255, 0.8);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter: saturate(180%) blur(20px);"></div>');
            $('#tmpui_loading_bg').append('<div id="tmpui_loading_show"></div>');
            $('#tmpui_loading_show').append('<div style="text-align:center;margin-bottom:20px;" id="tmpui_loading_content"></div>');

            if (this.loadingIcon !== false) {
                $('#tmpui_loading_content').append('<img src="' + this.loadingIcon + '" style="vertical-align: middle;border-style: none;width:129px;height:129px;"/>');
            } else {
                $('#tmpui_loading_content').append('<div style="text-align:center;font-family: fa5-proxima-nova,"Helvetica Neue",Helvetica,Arial,sans-serif;">' + this.loadingText + '</div>');
            }

            this.loadingPageInit = true;
            this.log('Loading page created.');
        }

        if (status) {
            $('body').css('overflow', 'hidden');
            $('#tmpui').show();
            this.doExit();
            this.log('Loading page on');
        } else {
            this.log('Loading page off');

            if (this.progress_enable) {
                return true;
            }

            $('body').css('overflow', '');
            $('#tmpui').fadeOut();
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
            js ? code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n' : code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '';
            return add;
        };

        while (match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }

        add(html.substr(cursor, html.length - cursor));
        code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, ' ');

        try {
            result = new Function('obj', code).apply(options, [options]);
        } catch (err) {
            console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
        }

        return result;
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
        console.error("tmpUI::Error -> " + msg);
    }

}