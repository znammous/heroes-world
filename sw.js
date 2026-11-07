// يحفظ صفحة عالم الأبطال على الجهاز لتفتح بسرعة وبدون إنترنت
// غيّر رقم الإصدار عند تعديل أي ملف حتى يحدَّث الكاش
const CACHE = 'heroes-world-v1';
const FILES = [
  './',
  'index.html',
  'fonts/baloo-bhaijaan-2-arabic.woff2',
  'fonts/baloo-bhaijaan-2-latin.woff2',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-apple.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// الصفحة نفسها: من الشبكة أولاً ليظهر أي تحديث فوراً، ومن الجهاز إن لم يتوفر الإنترنت
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const scope = self.registration.scope;
  if (!e.request.url.startsWith(scope)) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('index.html')))
  );
});
