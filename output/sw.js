const version = '20221109181218';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/algorithm/2022/11/09/2667/","/algorithm/2022/11/09/14940/","/algorithm/2022/11/08/16918/","/algorithm/2022/11/08/1325/","/algorithm/2022/11/07/BFS/","/react/2022/10/26/textarea-%EC%A4%84%EB%B0%94%EA%BF%88-%EC%8B%9C-%EC%9E%90%EB%8F%99-%EC%8A%A4%ED%81%AC%EB%A1%A4/","/react/2022/10/26/textarea-%EB%86%92%EC%9D%B4-%EC%A1%B0%EC%A0%88%ED%95%98%EA%B8%B0/","/http/2022/10/26/HTTP%EC%9D%98-%ED%8A%B9%EC%A7%95/","/javascript/2022/10/25/%EC%8A%A4%ED%81%AC%EB%A1%A4-%EC%8B%9C-header%EC%97%90-%EA%B7%B8%EB%A6%BC%EC%9E%90-%EB%B3%B4%EC%97%AC%EC%A3%BC%EA%B8%B0/","/react/2022/10/25/textarea-%EC%97%94%ED%84%B0-%EC%B2%98%EB%A6%AC-%EB%AC%B8%EC%A0%9C/","/categories/","/blog/","/","/manifest.json","/offline/","/assets/search.json","/search/","/assets/styles.css","/thanks/","/redirects.json","/sitemap.xml","/robots.txt","/blog/page2/","/blog/page3/","/blog/page4/","/blog/page5/","/blog/page6/","/blog/page7/","/feed.xml","/assets/styles.css.map","/assets/logos/logo.svg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
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
