/**
 * tmpUI.js
 * 
 * 基于HTML5的一些特性。
 * #HistoryAPI
 * 
 */

class tmpUI {

    status = {}
    config = {}
    loadQueue = 0
    loadTotal = 0
    loadCallback = null

    constructor(url) {
        this.state = {
            displayTrophy: true
        };
        this.loadConfig(url, config => {
            console.log(config);
            //初始化history
            history.replaceState(this.state, null, '');
            //写入配置文件
            this.config = config;
            //初始化当前页面的路由
            this.route(window.location.pathname);
            //当页面前进与后退的时候，popstate监听历史记录变化，触发对应页面的ajax请求。
            window.addEventListener('popstate', e => {
                console.log(e);
                var newPage = e.state.newPage;
                console.log(newPage);
                this.route(newPage);
            })
        });
    }

    loadConfig(url,cb) {
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

    linkRebind() {
        let atag = document.getElementsByTagName("a");
        if (atag.length > 0) {
            for (let i in atag) {
                if (typeof (atag[i]) === 'object') {
                    atag[i].addEventListener('click', e => {
                        e.preventDefault();
                        console.log(e.target.pathname);
                        let url = e.target.pathname;
                        history.pushState({
                            newPage: url
                        }, null, url);
                        //ajax('GET', url, 'page=' + url, this.loader, true);
                        this.route(url);
                    });
                }
            }
        }
        return 'ok';
    }

    /**
     * 路由功能，根据配置进行选路
     * @param {*} config 
     */
    route(url) {
        //默认文件
        if(url==='/'){
            url = '/index.html';
        }
        console.log(url);
        //查找路由
        if (this.config[url] !== undefined) {
            //下载所需组件
            this.loaderStart(url, () => {
                //写入到页面,处理资源时需要根据对应的资源类型进行处理
                let html = '';
                let html_js = '';
                let html_css = '';
                for(let i in this.config[url].res){
                    if(this.config[url].res[i].type==='html'){
                        html += this.config[url].res[i].dom;
                    }
                    if(this.config[url].res[i].type==='js'){
                        html_js += '<script src="'+i+'"></script>';
                    }
                    if(this.config[url].res[i].type==='css'){
                        html_css += '<link rel="stylesheet" href="'+i+'">';
                    }
                }
                //调整网页标题
                document.title = this.config[url].title;
                document.getElementById('app').innerHTML = html_css+html_js+html;
                //绑定链接事件
                this.linkRebind();
            });
        }
    }

    loaderStart(url, cb) {
        this.loadCallback = cb;
        for (let i in this.config[url].res) {
            this.loadTotal++;
        }
        for (let i in this.config[url].res) {
            this.loaderUnit(url, i);
        }
    }

    loaderUnit(target, i) {
        //初始化属性
        if(this.config[target].res[i].state===undefined){
            this.config[target].res[i].state = 0;
            this.config[target].res[i].dom = 0;
        }
        if (this.config[target].res[i].state === 1) {
            //如果这个URL已经加载了，直接返回。
            this.loadQueue++;
            if (this.loadQueue == this.loadTotal) {
                this.loadCallback();
            }
        } else {
            //如果这个URL没有加载，加载后返回。
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange =  () => {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    this.loadQueue++;
                    this.config[target].res[i].state = 1;
                    if(this.config[target].res[i].type==='html'){
                        this.config[target].res[i].dom = xhttp.responseText;
                    }
                    console.log(this.loadQueue);
                    console.log(this.loadTotal);
                    if (this.loadQueue == this.loadTotal) {
                        this.loadCallback();
                    }
                }
            };
            xhttp.open("GET", i, true);
            console.log(i);
            xhttp.send();
        }
    }
}