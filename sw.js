// 오프라인에서도 앱이 열리도록 화면 파일을 보관한다. 온라인이면 항상 최신 파일을 먼저 쓴다.
const CACHE = 'dial-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 글꼴(jsDelivr의 Galmuri)도 한 번 받은 뒤에는 오프라인에서 쓸 수 있게 함께 보관한다
self.addEventListener('fetch', e => {
  const host = new URL(e.request.url).hostname;
  const ok = host === location.hostname || host === 'cdn.jsdelivr.net';
  if (e.request.method !== 'GET' || !ok) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: host === location.hostname }))
  );
});
