const version = '20221119211053';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/algorithm/2022/11/19/10994/","/algorithm/2022/11/15/React-%EA%B0%9C%EB%B0%9C-%EC%8B%9C-https-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0/","/algorithm/2022/11/10/5547/","/algorithm/2022/11/09/7576/","/algorithm/2022/11/09/2667/","/algorithm/2022/11/09/14940/","/algorithm/2022/11/08/16918/","/algorithm/2022/11/08/1325/","/algorithm/2022/11/07/BFS/","/http/2022/10/27/HTTP-%EB%A9%94%EC%8B%9C%EC%A7%80/","/categories/","/blog/","/","/manifest.json","/offline/","/assets/search.json","/search/","/assets/styles.css","/thanks/","/redirects.json","/sitemap.xml","/robots.txt","/blog/page2/","/blog/page3/","/blog/page4/","/blog/page5/","/blog/page6/","/blog/page7/","/blog/page8/","/feed.xml","/assets/styles.css.map","/assets/logos/logo.svg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
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
