const version = '20230814133255';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/algorithm/2022/12/13/%EB%B0%B1%EC%A4%80-17609%EB%B2%88/","/javascript/2022/12/13/localStorage%EC%99%80-json.parse%EC%9D%98-%ED%83%80%EC%9E%85/","/algorithm/2022/12/05/%EB%B0%B1%EC%A4%80-22871%EB%B2%88/","/algorithm/2022/12/05/%EB%B0%B1%EC%A4%80-1654%EB%B2%88/","/algorithm/2022/12/04/%EB%B0%B1%EC%A4%80-2470%EB%B2%88/","/algorithm/2022/12/04/BINARY-HEAP-PRIORITY-QUEUE/","/react/2022/12/01/%ED%8E%98%EC%9D%B4%EC%A7%80-%EB%82%B4-%EC%9D%BC%EB%B6%80%EB%A7%8C-%EC%B5%9C%EC%8B%A0-%EC%83%81%ED%83%9C%EB%A1%9C-%EB%B3%80%EA%B2%BD%ED%95%98%EA%B8%B0-copy/","/algorithm/2022/11/26/5430/","/algorithm/2022/11/24/2504/","/algorithm/2022/11/24/18115/","/categories/","/blog/","/","/manifest.json","/offline/","/assets/search.json","/search/","/assets/styles.css","/thanks/","/redirects.json","/sitemap.xml","/robots.txt","/blog/page2/","/blog/page3/","/blog/page4/","/blog/page5/","/blog/page6/","/blog/page7/","/blog/page8/","/blog/page9/","/blog/page10/","/blog/page11/","/blog/page12/","/feed.xml","/assets/styles.css.map","/assets/logos/logo.svg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
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
