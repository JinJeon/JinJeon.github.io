const version = '20221012221219';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/react/2022/10/11/react_datepicker/","/algorithm/2022/10/10/%EA%B9%8A%EC%9D%B4_%EC%9A%B0%EC%84%A0_%EA%B7%B8%EB%9E%98%ED%94%84_%EC%88%9C%ED%9A%8C-copy/","/react/2022/09/25/CallBackRef-copy/","/dev/2022/01/10/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0/","/dev/2022/01/10/%EC%97%B0%EA%B2%B0%EB%A6%AC%EC%8A%A4%ED%8A%B8/","/dev/2022/01/09/%EC%89%98/","/dev/2022/01/06/%EB%A6%AC%EB%88%85%EC%8A%A4/","/dev/2022/01/03/%EB%94%94%EC%A7%80%ED%84%B8_%EB%85%BC%EB%A6%AC%ED%9A%8C%EB%A1%9C/","/dev/2021/12/11/%ED%95%B4%EC%8B%9C_%ED%95%B4%EC%8B%9C%EB%A7%B5/","/dev/2021/12/01/%EB%8F%99%EA%B8%B0_%EB%B9%84%EB%8F%99%EA%B8%B0/","/categories/","/blog/","/","/manifest.json","/offline/","/assets/search.json","/search/","/assets/styles.css","/thanks/","/redirects.json","/sitemap.xml","/robots.txt","/blog/page2/","/blog/page3/","/feed.xml","/assets/styles.css.map","/assets/logos/logo.svg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
