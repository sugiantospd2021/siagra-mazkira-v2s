/* ============================================================
   SIAGRA v.2.s — SERVICE WORKER (Network-First + Auto-Update)
   ------------------------------------------------------------
   Versi   : v2s-stable
   Strategi:
     - HTML/CSS/JS → Network-First (selalu ambil terbaru)
     - Gambar/Font → Cache-First (biar cepat)
     - Offline     → fallback ke cache
   ============================================================ */

const CACHE_VERSION = 'siagra-v2s-stable-v1';  // ← Naikkan manual setiap deploy
const CACHE_STATIS  = 'siagra-static-' + CACHE_VERSION;
const CACHE_IMG     = 'siagra-img-'    + CACHE_VERSION;

/* URL penting yang langsung di-cache saat instal */
const URL_PENTING = [
  './',
  './index.html',
  './cover.html'
];

/* ============================================================
   INSTALL — Cache file penting + aktifkan langsung
   ============================================================ */
self.addEventListener('install', (event) => {
  console.log('🔧 SW install:', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_STATIS).then(cache => {
      return Promise.all(
        URL_PENTING.map(url =>
          cache.add(url).catch(err => {
            console.warn('⚠️ Gagal cache:', url, err.message);
          })
        )
      );
    })
  );

  // Langsung aktif tanpa menunggu tab lama ditutup
  self.skipWaiting();
});

/* ============================================================
   ACTIVATE — Hapus cache lama, klaim semua tab
   ============================================================ */
self.addEventListener('activate', (event) => {
  console.log('✅ SW activate:', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.map(key => {
            // Hapus SEMUA cache yang bukan versi saat ini
            if (key !== CACHE_STATIS && key !== CACHE_IMG) {
              console.log('🗑️ Hapus cache lama:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

/* ============================================================
   FETCH — Strategi per jenis file
   ============================================================ */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  /* ---------- Skip request non-GET ---------- */
  if (req.method !== 'GET') return;

  /* ---------- Skip request ke origin lain (Supabase, CDN, dll) ---------- */
  if (url.origin !== self.location.origin) return;

  /* ---------- Deteksi jenis file ---------- */
  const ext = url.pathname.split('.').pop().toLowerCase();
  const isGambar = ['png','jpg','jpeg','gif','svg','webp','ico','bmp'].includes(ext);
  const isFont   = ['woff','woff2','ttf','otf','eot'].includes(ext);
  const isStatis = ['css','js','html','json','webmanifest'].includes(ext) || ext === '';

  /* ============================================================
     GAMBAR & FONT → CACHE-FIRST
     ============================================================ */
  if (isGambar || isFont) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;

        return fetch(req).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_IMG).then(cache => cache.put(req, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  /* ============================================================
     HTML / CSS / JS → NETWORK-FIRST (SELALU AMBIL TERBARU)
     ============================================================ */
  if (isStatis) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })   // ← paksa network, jangan pakai cache HTTP
        .then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_STATIS).then(cache => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => {
          // Kalau offline → pakai cache
          return caches.match(req).then(cached => {
            if (cached) return cached;
            if (req.mode === 'navigate') return caches.match('./index.html');
          });
        })
    );
    return;
  }

  /* ============================================================
     SISANYA → Network dulu, fallback cache
     ============================================================ */
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

/* ============================================================
   MESSAGE — Komunikasi dari halaman web
   ============================================================ */
self.addEventListener('message', (event) => {
  const data = event.data;

  if (data === 'SKIP_WAITING') {
    console.log('⚡ SW: SKIP_WAITING diterima');
    self.skipWaiting();
    return;
  }

  if (data === 'CLEAR_CACHE') {
    console.log('🧹 SW: Membersihkan semua cache...');
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => console.log('✅ Semua cache dibersihkan'));
    return;
  }

  if (data === 'GET_VERSION') {
    event.source.postMessage({
      type: 'VERSION',
      value: CACHE_VERSION,
      statis: CACHE_STATIS,
      img: CACHE_IMG
    });
    return;
  }
});

/* ============================================================
   PUSH NOTIFICATION (opsional, untuk future)
   ============================================================ */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Notifikasi dari SIAGRA',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'SIAGRA',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

/* ============================================================
   LOG KONFIRMASI
   ============================================================ */
console.log('✅ Service Worker SIAGRA v.2.s siap —', CACHE_VERSION);