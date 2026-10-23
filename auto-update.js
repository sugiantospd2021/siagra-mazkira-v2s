/* ============================================================
   SIAGRA v.2.s — AUTO-UPDATE CHECKER (External)
   ============================================================
   CARA PAKAI:
   Tambahkan 1 baris ini di <head> atau sebelum </body>
   setiap file yang ingin auto-update:

     <script src="../auto-update.js"></script>   ← untuk subfolder
     <script src="auto-update.js"></script>      ← untuk root

   FUNGSI:
   - Register Service Worker (Network-First)
   - Deteksi SW baru → aktifkan langsung + reload
   - Cek versi file via ETag/Last-Modified tiap 60 detik
   - Cek saat tab kembali aktif (visibilitychange)
   - Auto-reload saat file di server berubah
   ============================================================ */

(function autoUpdateChecker(){
  'use strict';

  /* ============================================================
     KONFIGURASI
     ============================================================ */
  const VERSI_KEY      = 'siagra_versi_terakhir';
  const CEK_INTERVAL   = 60 * 1000;   // 60 detik
  const CEK_AWAL_DELAY = 3000;        // cek pertama setelah 3 detik
  const RELOAD_DELAY   = 500;         // delay sebelum reload (ms)
  const DEBUG          = false;       // ← set true kalau mau log detail

  /* ============================================================
     LOGGER (matikan kalau DEBUG = false)
     ============================================================ */
  function log(...args){
    if(DEBUG) console.log('🔄 [Auto-Update]', ...args);
  }
  function logWarn(...args){
    if(DEBUG) console.warn('⚠️ [Auto-Update]', ...args);
  }

  /* ============================================================
     DETEKSI PATH SERVICE WORKER
     Otomatis naik 1 level kalau file di subfolder
     ============================================================ */
  function getSWPath(){
    const path = location.pathname;
    const segment = path.split('/').filter(Boolean);

    // Kalau file ada di root (mis. /index.html) → 1 segmen
    // Kalau file di subfolder (mis. /menu-guru/absensi.html) → 2+ segmen
    const isSubfolder = segment.length > 1 &&
                        !segment[segment.length - 1].includes('.');

    // Cek juga: kalau URL berakhir "/" berarti folder, bukan file
    const isFolder = path.endsWith('/');

    if(isSubfolder || isFolder || segment.length > 1){
      return '../service-worker.js';
    }
    return 'service-worker.js';
  }

  /* ============================================================
     1. REGISTER SERVICE WORKER
     ============================================================ */
  function registerSW(){
    if (!('serviceWorker' in navigator)) {
      logWarn('Service Worker tidak didukung browser ini');
      return;
    }

    const swPath = getSWPath();
    log('Register SW:', swPath);

    navigator.serviceWorker.register(swPath)
      .then(reg => {
        log('✅ SW terdaftar');

        // Paksa cek update tiap load
        reg.update().catch(err => logWarn('Gagal update SW:', err));

        // Kalau ada SW baru → aktifkan langsung + reload
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          if (!newSW) return;

          log('🆕 SW baru terdeteksi, menunggu install...');

          newSW.addEventListener('statechange', () => {
            log('  State:', newSW.state);

            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              log('🔄 SW baru terinstall — aktifkan + reload...');

              // Kirim pesan ke SW baru untuk skip waiting
              newSW.postMessage('SKIP_WAITING');

              // Tunggu sebentar biar SW baru ambil alih, lalu reload
              setTimeout(() => {
                log('♻️ Reload halaman...');
                location.reload();
              }, RELOAD_DELAY);
            }
          });
        });

        // Kalau sudah ada SW baru yang menunggu (dari sesi sebelumnya)
        if (reg.waiting && navigator.serviceWorker.controller) {
          log('⏳ Ada SW menunggu — aktifkan...');
          reg.waiting.postMessage('SKIP_WAITING');
          setTimeout(() => location.reload(), RELOAD_DELAY);
        }
      })
      .catch(err => {
        logWarn('Gagal register SW:', err.message);
      });
  }

  /* ============================================================
     2. CEK VERSI FILE VIA HEAD REQUEST (ETag/Last-Modified)
     ============================================================ */
  let sedangCek = false; // hindari cek paralel

  async function cekVersi(){
    if (sedangCek) return;
    sedangCek = true;

    try {
      const urlFile = location.pathname;
      const cacheKey = VERSI_KEY + ':' + urlFile;

      // Request HEAD (hanya header, bukan isi file — hemat bandwidth)
      const res = await fetch(urlFile + '?v=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'X-Auto-Update-Check': '1' }
      });

      if (!res.ok) {
        logWarn('HEAD request gagal:', res.status);
        return;
      }

      // Ambil ETag atau Last-Modified
      const etag = res.headers.get('ETag') ||
                   res.headers.get('Last-Modified') ||
                   res.headers.get('X-Version') ||
                   '';

      if (!etag) {
        log('Tidak ada ETag — skip cek versi');
        return;
      }

      const versiLama = localStorage.getItem(cacheKey);

      // Skenario A: pertama kali cek → simpan versi
      if (!versiLama) {
        log('📝 Versi pertama kali disimpan:', etag);
        localStorage.setItem(cacheKey, etag);
        return;
      }

      // Skenario B: versi berubah → file baru di server → reload!
      if (etag !== versiLama) {
        log('🆕 Versi berubah!');
        log('   Lama:', versiLama);
        log('   Baru:', etag);

        // Simpan versi baru dulu (biar tidak reload berkali-kali)
        localStorage.setItem(cacheKey, etag);

        // Reload halaman
        log('♻️ Reload halaman...');
        location.reload();
        return;
      }

      // Skenario C: versi sama → tidak ada perubahan
      log('✅ Versi masih sama');

    } catch(e){
      logWarn('Gagal cek versi:', e.message);
    } finally {
      sedangCek = false;
    }
  }

  /* ============================================================
     3. CEK SAAT TAB KEMBALI AKTIF
     ============================================================ */
  function pasangVisibilityListener(){
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        log('👁️ Tab kembali aktif — cek versi...');
        cekVersi();
      }
    });

    // Bonus: cek saat window focus (fallback untuk browser lama)
    window.addEventListener('focus', () => {
      log('🎯 Window focus — cek versi...');
      cekVersi();
    });
  }

  /* ============================================================
     4. CEK BERKALA + CEK PERTAMA
     ============================================================ */
  function pasangCekBerkala(){
    // Cek berkala tiap 60 detik
    setInterval(() => {
      log('⏰ Cek berkala (60 detik)...');
      cekVersi();
    }, CEK_INTERVAL);

    // Cek pertama kali setelah halaman load 3 detik
    setTimeout(() => {
      log('🚀 Cek pertama kali...');
      cekVersi();
    }, CEK_AWAL_DELAY);
  }

  /* ============================================================
     5. DETEKSI KALAU USER ONLINE LAGI (offline → online)
     ============================================================ */
  function pasangOnlineListener(){
    window.addEventListener('online', () => {
      log('🌐 Online lagi — cek versi...');
      cekVersi();
    });
  }

  /* ============================================================
     6. EKSPOS FUNGSI MANUAL (opsional, bisa dipanggil dari console)
     ============================================================ */
  window.siagraAutoUpdate = {
    cekVersi: cekVersi,
    clearVersiCache: function(){
      const keys = Object.keys(localStorage).filter(k => k.startsWith(VERSI_KEY));
      keys.forEach(k => localStorage.removeItem(k));
      console.log('✅ Versi cache dibersihkan:', keys.length, 'keys');
    },
    clearServiceWorker: function(){
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(r => r.unregister());
          console.log('✅ Service Worker dibersihkan:', regs.length);
        });
      }
      caches.keys().then(keys => {
        keys.forEach(k => caches.delete(k));
        console.log('✅ Cache dibersihkan:', keys.length);
      });
    },
    status: function(){
      console.log('📊 Status Auto-Update:');
      console.log('  Path SW     :', getSWPath());
      console.log('  Interval    :', CEK_INTERVAL / 1000 + ' detik');
      console.log('  SW aktif    :', 'serviceWorker' in navigator && !!navigator.serviceWorker.controller);
      const keys = Object.keys(localStorage).filter(k => k.startsWith(VERSI_KEY));
      console.log('  Cache versi :', keys.length, 'file');
      keys.forEach(k => console.log('    -', k.replace(VERSI_KEY + ':', ''), '=', localStorage.getItem(k)));
    }
  };

  /* ============================================================
     INIT — Jalankan semua
     ============================================================ */
  function init(){
    log('🚀 Inisialisasi auto-update checker...');
    log('   URL:', location.href);
    log('   SW path:', getSWPath());

    registerSW();
    pasangVisibilityListener();
    pasangCekBerkala();
    pasangOnlineListener();

    log('✅ Auto-update checker aktif');
  }

  // Jalankan setelah DOM ready (biar tidak blocking)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();