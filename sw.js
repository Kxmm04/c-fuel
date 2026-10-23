// Service worker: เปิดแอปได้แม้ออฟไลน์ (หลังเปิดครั้งแรกด้วยอินเทอร์เน็ต)
// เปลี่ยนเลขเวอร์ชันด้านล่างทุกครั้งที่อัปเดตไฟล์ เพื่อให้เครื่องผู้ใช้โหลดของใหม่
const CACHE = 'xmax-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const host = new URL(req.url).hostname;
  // ซิงก์และแผนที่ต้องสดเสมอ ไม่เก็บแคช
  if (host === 'script.google.com' || host.endsWith('googleusercontent.com') || host.endsWith('google.com')) return;

  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || net;
    })
  );
});
