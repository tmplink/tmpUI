const CACHE_NAME = "static-cache";

self.addEventListener("install", (installEvent) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          // 清理旧的缓存
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
      // 确保新的 Service Worker 立即接管页面
      await self.clients.claim();
    })()
  );
});

// 监听消息事件
self.addEventListener('message', (event) => {
  // 支持手动清除缓存
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      (async () => {
        await caches.delete(CACHE_NAME);
        console.log('手动清除静态资源缓存');
        // 通知页面缓存已清除
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      })()
    );
  }

  // 支持主动检查更新 (由页面定时触发)
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    event.waitUntil(
      (async () => {
        const url = event.data.url;
        if (!url) return;
        
        const request = new Request(url);
        
        // 针对 index.html (根路径) 去除 query 参数，与导航请求的缓存 key 保持一致
        const requestUrl = new URL(url);
        const path = requestUrl.pathname;
        const isIndex = path === '/' || path.toLowerCase().endsWith('/index.html');
        let cacheKeyRequest = request;

        if (isIndex) {
            requestUrl.search = '';
            cacheKeyRequest = new Request(requestUrl.toString());
        }

        // 尝试匹配当前 URL 的缓存
        const cachedResponse = await caches.match(cacheKeyRequest);
        
        // 复用 fetchAndCache 逻辑，强制标记为 isNavigation=true 以启用内容比对和通知
        // 这样如果 index.html 变了，就会更新缓存并通知页面刷新
        await fetchAndCache(request, cachedResponse, true, cacheKeyRequest)
            .catch(err => console.log('[SW] 定时检查更新失败 (网络或其它原因)', err));
      })()
    );
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // 忽略本地请求 (比如 127.0.0.1 或 localhost)，直接回退到网络，不缓存
  if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
    return;
  }

  const path = url.pathname;

  // 1. 导航请求（Navigation）：如 index.html
  // 策略：Stale-While-Revalidate (SWR) + ETag
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // 针对 index.html (根路径) 去除 query 参数，确保共用同一个缓存 key
          const isIndex = path === '/' || path.toLowerCase().endsWith('/index.html');
          let cacheKeyRequest = event.request;
          
          if (isIndex) {
            const cleanUrl = new URL(event.request.url);
            cleanUrl.search = '';
            cacheKeyRequest = new Request(cleanUrl.toString());
          }

          const cachedResponse = await caches.match(cacheKeyRequest);
          
          // 后台网络请求：检查 ETag，有更新则下载并写入缓存
          // SWR 策略：如果有缓存，直接返回缓存，并在后台发起更新请求
          
          // 关键修复：传递 clone 给后台任务。
          // 因为 cachedResponse 会被下面的 return 语句返回给浏览器并被消耗（Body stream used）。
          // 如果 fetchAndCache 内部试图 clone 一个已经被消耗的 response，就会报错。
          const cachedResponseForUpdate = cachedResponse ? cachedResponse.clone() : null;

          const networkFetchPromise = fetchAndCache(event.request, cachedResponseForUpdate, true, cacheKeyRequest);

          if (cachedResponse) {
             // 有缓存，直接返回缓存，后台静默更新
             // 捕获可能的错误以防止未处理的 Promise 拒绝
             networkFetchPromise.catch(err => console.error("Background fetch failed", err));
             return cachedResponse;
          }

          // 无缓存，必须等待网络
          try {
            const response = await networkFetchPromise;
            return response;
          } catch (error) {
            // 网络失败且无缓存 -> 离线页面
            return new Response(getOfflineHTML(), {
               headers: { 'Content-Type': 'text/html' }
            });
          }
        } catch (error) {
             return new Response(getOfflineHTML(), {
                headers: { 'Content-Type': 'text/html' }
             });
        }
      })()
    );
    return;
  }
  
  // 2. 静态资源请求
  if (shouldCache(path)) {
    // 检查 URL 是否包含版本号参数
    const hasVersion = url.searchParams.has('v') || url.searchParams.has('version') || url.searchParams.has('tmpui_page');

    event.respondWith(
      (async () => {
        if (hasVersion) {
          // 策略 A: 带有版本号的资源 -> Cache First
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetchAndCache(event.request);
        } else {
          // 策略 B: 无版本号资源 -> SWR + ETag
          const cachedResponse = await caches.match(event.request);
          
          const networkFetchPromise = fetchAndCache(event.request, cachedResponse);
          
          if (cachedResponse) {
             // 有缓存，直接返回，后台更新
             networkFetchPromise.catch(err => console.log('Background fetch failed:', err));
             return cachedResponse;
          }
          
          // 无缓存，等待网络
          try {
              return await networkFetchPromise;
          } catch (e) {
              // 失败返回 undefined，由浏览器处理或者后续 failover
              console.log('Fetch failed', e);
          }
        }
      })()
    );
    return;
  }
});

// 辅助函数：从 HTML 内容中提取版本号
const getVersionFromHtml = (html) => {
  const match = html.match(/"version"\s*:\s*(\d+)/);
  return match ? match[1] : null;
};

// 辅助函数：请求并缓存 (支持 ETag 和 Last-Modified 验证)
const fetchAndCache = async (request, cachedResponse = null, isNavigation = false, cacheKeyRequest = null) => {
  let finalRequest = request;

  // 构造条件请求头
  if (cachedResponse) {
      const headers = new Headers(request.headers);
      let conditionAdded = false;

      // 1. 优先使用 ETag
      if (cachedResponse.headers.has('ETag')) {
        headers.set('If-None-Match', cachedResponse.headers.get('ETag'));
        conditionAdded = true;
      }
      
      // 2. 如果没有 ETag，尝试使用 Last-Modified
      if (!conditionAdded && cachedResponse.headers.has('Last-Modified')) {
        headers.set('If-Modified-Since', cachedResponse.headers.get('Last-Modified'));
      }

      finalRequest = new Request(request, { headers });
  }

  try {
    const response = await fetch(finalRequest);

    // 处理 304 Not Modified
    if (response.status === 304) {
      return cachedResponse; // 返回缓存的版本
    }

    // 检查响应是否有效
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }
    
    // 如果是导航请求，在更新缓存前进行内容比对，防止无限刷新
    if (isNavigation && cachedResponse) {
      const cacheClone = cachedResponse.clone();
      const responseClone = response.clone();
      
      try {
        const [oldText, newText] = await Promise.all([
          cacheClone.text(), 
          responseClone.text()
        ]);
        
        // 1. 尝试比对版本号
        const oldVer = getVersionFromHtml(oldText);
        const newVer = getVersionFromHtml(newText);
        
        if (oldVer && newVer) {
            if (oldVer === newVer) {
                // 如果版本号一致，尽管 HTTP 200，我们也认为没更新
                // 但为了保险，还是更新一下缓存（虽然内容没变或变了无关紧要的东西），但不发通知
                const responseToCache = response.clone();
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, responseToCache);
                return response;
            }
            console.log(`[SW] 版本号变更 ${oldVer} -> ${newVer}`);
        } else {
            // 2. 无法提取版本号，回退到全文比对
            if (oldText === newText) {
                return response; // 内容完全一致，不再重复写缓存和发通知
            }
        }
      } catch (e) {
        console.error('[SW] 比对出错', e);
      }
    }
    
    // 服务器返回了新数据 (200)，更新缓存
    const responseToCache = response.clone();
    const cache = await caches.open(CACHE_NAME);
    await cache.put(cacheKeyRequest || request, responseToCache);

    // 如果是导航请求且之前有缓存（说明是一次更新），通知页面
    if (isNavigation && cachedResponse) {
      console.log('检测到新版本，发送通知');
      notifyClientsOfUpdate();
    }

    return response;
  } catch (error) {
    throw error;
  }
};

// 通知所有客户端有更新
const notifyClientsOfUpdate = async () => {
  // includeUncontrolled: true 确保即使页面尚未被当前 SW 完全控制（例如首次加载或刷新瞬间）也能收到消息
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  console.log(`[SW] 检测到新版本，向 ${clients.length} 个客户端发送通知`);
  clients.forEach(client => {
    client.postMessage({ type: 'UPDATE_AVAILABLE' });
  });
};

const shouldCache = (path) => {
  // 排除 index.html 和根路径
  if (path === '/' || path.toLowerCase().endsWith('/index.html')) {
    return false;
  }

  const cacheableExtensions = [
    // HTML
    '.html',
    // CSS & JS
    '.css', '.js',
    // Images
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
    // Fonts
    '.woff', '.woff2', '.ttf', '.otf', '.eot',
    // JSON 
    '.json',
  ];
  return cacheableExtensions.some(ext => path.toLowerCase().endsWith(ext));
};

const getOfflineHTML = () => {
  // 多语言内容
  const translations = {
    'zh': {
      lang: 'zh-CN',
      title: '当前已离线',
      offline: '离线',
      message: '请检查您的网络连接，然后重试。',
      retry: '重试'
    },
    'en': {
      lang: 'en',
      title: 'Offline',
      offline: 'Offline',
      message: 'Please check your network connection and try again.',
      retry: 'Retry'
    },
    'ja': {
      lang: 'ja',
      title: 'オフライン',
      offline: 'オフライン',
      message: 'ネットワーク接続を確認して、再試行してください。',
      retry: '再試行'
    },
    'es': {
      lang: 'es',
      title: 'Desconectado',
      offline: 'Desconectado',
      message: 'Por favor, compruebe su conexión de red y vuelva a intentarlo.',
      retry: 'Reintentar'
    },
    'fr': {
      lang: 'fr',
      title: 'Hors ligne',
      offline: 'Hors ligne',
      message: 'Veuillez vérifier votre connexion réseau et réessayer.',
      retry: 'Réessayer'
    }
  };

  // 获取浏览器语言
  let lang = 'en';
  if (typeof navigator !== 'undefined' && navigator.language) {
    lang = navigator.language.split('-')[0];
  } else if (self && self.navigator && self.navigator.language) {
    lang = self.navigator.language.split('-')[0];
  }
  let t = translations[lang] || translations['en'];

  return `
    <!DOCTYPE html>
    <html lang="${t.lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background-color: #f8f9fa;
          color: #3c4858;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          text-align: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .container {
          max-width: 400px;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        p {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .retry-btn {
          background-color: #506efa;
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
          -webkit-appearance: none;
        }
        .retry-btn:hover {
          background-color: #3759f9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${t.offline}</h1>
        <p>${t.message}</p>
        <button class="retry-btn" onclick="location.reload()">${t.retry}</button>
      </div>
    </body>
    </html>
  `;
};
