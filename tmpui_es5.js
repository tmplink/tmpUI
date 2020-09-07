"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * tmpUI.js
 * version: 2
 * 
 */
class tmpUI {
  constructor(url) {
    _defineProperty(this, "status", {});

    _defineProperty(this, "config", {});

    _defineProperty(this, "version", 0);

    _defineProperty(this, "index", '/');

    _defineProperty(this, "debug", true);

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

    _defineProperty(this, "onExitfunction", []);

    this.state = {
      displayTrophy: true
    };
    window.tmpui_helper = {
      loadQueue: 0,
      loadTotal: 0,
      readyQueue: 0,
      readyTotal: 0
    };
    this.loadConfig(url, config => {
      //初始化history
      history.replaceState(this.state, null, ''); //写入配置文件

      this.config = this.rebuildConfig(config);
      this.rebuildRunConfig(); //初始化当前页面的路由
      //this.route(window.location.pathname);

      this.route(); //当页面前进与后退的时候，popstate监听历史记录变化，触发对应页面的ajax请求。

      window.addEventListener('popstate', e => {
        var newPage = e.state.newPage; //this.route(newPage);

        this.route();
      });
    });
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
    }
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

    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        config = JSON.parse(this.responseText);
        cb(config);
      }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
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

            atag[i].addEventListener('click', e => {
              e.preventDefault();
              history.pushState({
                newPage: url
              }, null, url); //ajax('GET', url, 'page=' + url, this.loader, true);

              this.route();
            });
          }
        }
      }
    }

    let ctag = document.getElementsByTagName("code");

    if (ctag.length > 0) {
      for (let i in ctag) {
        if (typeof ctag[i] === 'object') {
          let ishtml = ctag[i].getAttribute("tmpui-html-code");
          console.log(ishtml);

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

  open(a_url) {
    let url = this.index + '?tmpui_page=' + a_url;
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

    params = this.getUrlVars(window.location.href); //默认文件

    if (params.tmpui_page !== undefined) {
      url = params.tmpui_page;
    } //未能找到页面时的页面
    // if (this.config.path[url] !== undefined && this.config.nofound !== undefined) {
    //     url = this.config.path[this.config.nofound];
    // }


    $('.tmpUIRes').remove(); //查找路由

    this.loadpage(true);

    if (this.config.path[url] !== undefined) {
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
  }

  draw(url) {
    for (let i in this.config.path[url].res) {
      if (this.config.path[url].res[i].type === 'js') {
        let content = this.config.path[url].res[i].dom;

        if (this.config.path[url].res[i].reload === false) {
          if (this.config.reload_table[i] === false) {
            this.config.reload_table[i] = true;
            window.tmpui_helper.readyTotal++;
            $('body').append("<script class=\"tmpUIRes_once\" type=\"text/javascript\" \">\n" + content + "\nwindow.tmpui_helper.readyQueue++;</script>\n");
          }
        } else {
          window.tmpui_helper.readyTotal++;
          $('body').append("<script class=\"tmpUIRes\" type=\"text/javascript\" \">\n" + content + "\nwindow.tmpui_helper.readyQueue++;</script>\n");
        }
      }

      if (this.config.path[url].res[i].type === 'css') {
        if (this.config.path[url].res[i].reload === false) {
          if (this.config.reload_table[i] === false) {
            this.config.reload_table[i] = true;
            $('head').append("<link class=\"tmpUIRes_once\" rel=\"stylesheet\" href=\"" + i + '?v=' + this.config.version + "\" >\n");
          }
        } else {
          $('head').append("<link class=\"tmpUIRes\" rel=\"stylesheet\" href=\"" + i + '?v=' + this.config.version + "\" >\n");
        }
      }

      if (this.config.path[url].res[i].type === 'tpl') {
        let content = this.config.path[url].res[i].dom;

        if (this.config.path[url].res[i].reload === false) {
          if (this.config.reload_table[i] === false) {
            this.config.reload_table[i] = true;
            $('body').append("<div class=\"tmpUIRes_once\" style=\"display:none\" \">\n" + content + "</div>\n");
          }
        } else {
          $('body').append("<div class=\"tmpUIRes\" style=\"display:none\" \">\n" + content + "</div>\n");
        }
      }

      if (this.config.path[url].res[i].type === 'html') {
        if (this.config.path[url].res[i].target.type === "append") {
          let content = this.config.path[url].res[i].dom;
          $('#tmpui_body').append(content);
        }

        if (this.config.path[url].res[i].target.type === "body") {
          let content = this.config.path[url].res[i].dom;
          $('#tmpui_body').html(content);
        }

        if (this.config.path[url].res[i].target.type === "id") {
          let id = this.config.path[url].res[i].target.val;
          let content = this.config.path[url].res[i].dom;
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

    if (this.config.path[target].res[i].reload === false && this.config.reload_table[i] === undefined) {
      this.config.reload_table[i] = false;
    }

    if (this.config.path[target].res[i].state === 1) {
      //如果这个URL已经加载了，直接返回。
      window.tmpui_helper.loadQueue++;
      this.loaderFinish();
    } else {
      //如果这个URL没有加载，加载后返回。
      let xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          window.tmpui_helper.loadQueue++;
          this.config.path[target].res[i].state = 1;
          this.config.path[target].res[i].dom = xhttp.responseText;
          this.loaderFinish();
        }
      };

      xhttp.open("GET", i + '?v=' + this.version, true);
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
    }

    console.log("Queue:" + window.tmpui_helper.loadTotal + "|Finish:" + window.tmpui_helper.loadQueue);
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
      console.log("Queue:" + window.tmpui_helper.loadTotal + "|Finish:" + window.tmpui_helper.loadQueue);

      if (typeof this.loadCallback === 'function') {
        this.loadCallback();
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

  language_build() {
    //init language
    var lang = localStorage.getItem('language');
    console.log("language setting...." + lang);

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
      $('#tmpui').append('<div id="tmpui_loading_bg"></div>');
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

  tpl(id, data) {
    let html = $('#' + id).html();
    let return_html = this.TemplateEngine(html, data);
    return return_html;
  }

  TemplateEngine(html, options) {
    if (html == '' || html == null) {
      console.error('TemplateEngine::Html can\'t be null.');
      return '';
    }

    var re = /<%(.+?)%>/g,
        reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
        code = 'with(obj) { var r=[];\n',
        cursor = 0,
        result,
        match;

    var add = function add(line, js) {
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
      console.log(msg);
    }
  }

}
