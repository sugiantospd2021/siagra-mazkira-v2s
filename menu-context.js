/* ============================================================
   menu-context.js — SIAGRA Fase 4 (FIX v2)
   Modul Klik Kanan untuk:
     - .menu-card      (semua halaman)
     - .hero           (guru.html, tendik.html)
     - .rpp-alert      (guru.html)
   ============================================================ */

(function(){
  'use strict';

  /* ============================================================
     PETA HALAMAN & PANEL
     ============================================================ */
  const PAGE_MAP = {
    /* === admin.html === */
    'anak':   { title: 'Data Siswa',      page: 'admin.html', panel: 'anak'   },
    'guru':   { title: 'Data GTK',        page: 'admin.html', panel: 'guru'   },
    'kelas':  { title: 'Data Rombel',     page: 'admin.html', panel: 'kelas'  },
    'alumni': { title: 'Alumni',          page: 'admin.html', panel: 'alumni' },
    'backup': { title: 'Backup & Sistem', page: 'admin.html', panel: 'backup' },

    /* === guru.html === */
    'rpp':       { title: 'Riwayat RPPH/RPPM', page: 'menu-guru/rpp.html',     panel: '' },
    'anekdot':   { title: 'Catatan Anekdot',   page: 'menu-guru/anekdot.html', panel: '' },
    'observasi': { title: 'Observasi Harian',  page: 'guru.html', panel: 'observasi' },
    'penilaian': { title: 'Penilaian',         page: 'guru.html', panel: 'penilaian' },

    /* === guru.html — banner & hero RPPH/RPPM === */
    'rpp-baru':  { title: 'Buat RPPH/RPPM Baru',  page: 'menu-guru/rpp.html', panel: '' },
    'rpp-alert': { title: 'Notifikasi RPPH/RPPM', page: 'menu-guru/rpp.html', panel: '' },

    /* === kepsek.html === */
    'monitoring': { title: 'Monitoring',        page: 'kepsek.html', panel: 'monitoring' },
    'supervisi':  { title: 'Supervisi Guru',    page: 'kepsek.html', panel: 'supervisi'  },
    'validasi':   { title: 'Validasi RPP',      page: 'kepsek.html', panel: 'validasi'   },
    'statistik':  { title: 'Statistik Sekolah', page: 'kepsek.html', panel: 'statistik'  },
    'keuangan':   { title: 'Keuangan',          page: 'kepsek.html', panel: 'keuangan'   },

    /* === tendik.html === */
    'surat-masuk':  { title: 'Surat Masuk',   page: 'tendik.html', panel: 'surat-masuk'  },
    'surat-keluar': { title: 'Surat Keluar',  page: 'tendik.html', panel: 'surat-keluar' },
    'inventaris':   { title: 'Inventaris',    page: 'tendik.html', panel: 'inventaris'   },
    'pembayaran':   { title: 'Pembayaran',    page: 'tendik.html', panel: 'pembayaran'   },
    'laporan':      { title: 'Laporan',       page: 'tendik.html', panel: 'laporan'      },
    'arsip':        { title: 'Arsip Digital', page: 'tendik.html', panel: 'arsip'        },

    /* === menu-kepsek/todo.html === */
    'todo': { title: 'To Do Kepsek', page: 'menu-kepsek/todo.html', panel: '' }
  };

  /* ============================================================
     STATE
     ============================================================ */
  let ctxMenu   = null;
  let ctxTarget = null;
  let ctxInfo   = null;

  /* ============================================================
     BUAT ELEMEN CONTEXT MENU
     ============================================================ */
  function buatContextMenu(){
    if(ctxMenu) return ctxMenu;

    ctxMenu = document.createElement('div');
    ctxMenu.className = 'siagra-ctx-menu';
    ctxMenu.setAttribute('role', 'menu');
    ctxMenu.innerHTML = '' +
      '<div class="siagra-ctx-header">' +
        '<div class="ctx-title">📌 Menu Pintasan</div>' +
        '<div class="ctx-sub" id="siagraCtxTitle">-</div>' +
      '</div>' +
      '<div class="siagra-ctx-item" data-action="new-tab">' +
        '<span class="ctx-icon">🔗</span>' +
        '<span class="ctx-label">Buka di Tab Baru</span>' +
        '<span class="ctx-hint">Ctrl+Klik</span>' +
      '</div>' +
      '<div class="siagra-ctx-item" data-action="new-window">' +
        '<span class="ctx-icon">🪟</span>' +
        '<span class="ctx-label">Buka di Jendela Baru</span>' +
        '<span class="ctx-hint">Shift+Klik</span>' +
      '</div>' +
      '<div class="siagra-ctx-item" data-action="new-window-size">' +
        '<span class="ctx-icon">⛶</span>' +
        '<span class="ctx-label">Buka Jendela Berukuran</span>' +
      '</div>' +
      '<div class="siagra-ctx-sep"></div>' +
      '<div class="siagra-ctx-item" data-action="copy-link">' +
        '<span class="ctx-icon">📋</span>' +
        '<span class="ctx-label">Salin Tautan</span>' +
      '</div>' +
      '<div class="siagra-ctx-item" data-action="open-same">' +
        '<span class="ctx-icon">↪️</span>' +
        '<span class="ctx-label">Buka di Halaman Ini</span>' +
      '</div>';

    document.body.appendChild(ctxMenu);

    ctxMenu.addEventListener('click', function(e){
      const item = e.target.closest('.siagra-ctx-item');
      if(!item) return;
      jalankanAksi(item.dataset.action);
      sembunyikanMenu();
    });

    return ctxMenu;
  }

  /* ============================================================
     TAMPILKAN MENU
     ============================================================ */
  function tampilkanMenu(x, y, target){
    const menu = buatContextMenu();
    ctxTarget = target;

    const panelName = target.dataset.ctxPanel || '';
    const info = PAGE_MAP[panelName] || null;
    ctxInfo = info;

    const titleEl = document.getElementById('siagraCtxTitle');
    if(titleEl){
      const judulCard = target.querySelector('h3');
      titleEl.textContent = info
        ? info.title
        : (judulCard ? judulCard.textContent : 'Menu');
    }

    menu.style.left = x + 'px';
    menu.style.top  = y + 'px';
    menu.classList.add('show');

    requestAnimationFrame(function(){
      const rect = menu.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let nx = x, ny = y;
      if(rect.right  > vw - 8) nx = vw - rect.width  - 8;
      if(rect.bottom > vh - 8) ny = vh - rect.height - 8;
      if(nx < 8) nx = 8;
      if(ny < 8) ny = 8;
      menu.style.left = nx + 'px';
      menu.style.top  = ny + 'px';
    });
  }

  /* ============================================================
     SEMBUNYIKAN MENU
     ============================================================ */
  function sembunyikanMenu(){
    if(ctxMenu) ctxMenu.classList.remove('show');
    ctxTarget = null;
  }

  /* ============================================================
     BANGUN URL
     ============================================================ */
  function bangunUrl(info){
    if(!info) return window.location.href;
    try{
      const url = new URL(info.page, window.location.href);
      if(info.panel){
        url.searchParams.set('panel', info.panel);
      }
      return url.toString();
    }catch(e){
      return info.page;
    }
  }

  /* ============================================================
     JALANKAN AKSI
     ============================================================ */
  function jalankanAksi(action){
    if(!ctxTarget) return;
    const info = ctxInfo;
    const url  = bangunUrl(info);

    switch(action){
      case 'new-tab':
        window.open(url, '_blank', 'noopener,noreferrer');
        tampilkanToast('🔗 Dibuka di tab baru');
        break;

      case 'new-window':
        window.open(url, '_blank', 'noopener,noreferrer,width=1280,height=800');
        tampilkanToast('🪟 Dibuka di jendela baru');
        break;

      case 'new-window-size': {
        const w = Math.min(1400, Math.floor(window.screen.availWidth  * 0.85));
        const h = Math.min(900,  Math.floor(window.screen.availHeight * 0.85));
        const left = Math.floor((window.screen.availWidth  - w) / 2);
        const top  = Math.floor((window.screen.availHeight - h) / 2);
        window.open(
          url, '_blank',
          'noopener,noreferrer,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes'
        );
        tampilkanToast('⛶ Dibuka di jendela berukuran');
        break;
      }

      case 'copy-link':
        salinKeClipboard(url);
        break;

      case 'open-same': {
        const panelName = ctxTarget.dataset.ctxPanel || '';

        if(panelName){
          if(panelName === 'statistik' && typeof window.openStatistik === 'function'){
            window.openStatistik();
            return;
          }
          if(panelName === 'keuangan' && typeof window.openKeuangan === 'function'){
            window.openKeuangan();
            return;
          }
          if(panelName === 'pembayaran' && typeof window.openPembayaran === 'function'){
            window.openPembayaran();
            return;
          }
          if(panelName === 'rpp-baru' && typeof window.buatRPP === 'function'){
            window.buatRPP();
            return;
          }
          if(panelName === 'rpp-alert' && typeof window.buatRPP === 'function'){
            window.buatRPP();
            return;
          }
          if(panelName === 'anekdot' && typeof window.bukaAnekdot === 'function'){
            window.bukaAnekdot();
            return;
          }
          if(typeof window.openPanel === 'function'){
            window.openPanel(panelName);
            return;
          }
        }

        window.location.href = url;
        break;
      }
    }
  }

  /* ============================================================
     SALIN KE CLIPBOARD
     ============================================================ */
  function salinKeClipboard(text){
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(text)
        .then(function(){ tampilkanToast('📋 Tautan disalin'); })
        .catch(function(){ fallbackSalin(text); });
    } else {
      fallbackSalin(text);
    }
  }

  function fallbackSalin(text){
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try{
      document.execCommand('copy');
      tampilkanToast('📋 Tautan disalin');
    }catch(e){
      tampilkanToast('❌ Gagal menyalin');
    }
    document.body.removeChild(ta);
  }

  /* ============================================================
     TOAST KECIL
     ============================================================ */
  let toastTimer = null;
  function tampilkanToast(msg){
    let el = document.querySelector('.siagra-ctx-toast');
    if(!el){
      el = document.createElement('div');
      el.className = 'siagra-ctx-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ el.classList.remove('show'); }, 2200);
  }

  /* ============================================================
     DETEKSI NAMA PANEL DARI onclick / h3
     ============================================================ */
  function deteksiPanel(card){
    if(card.dataset.ctxPanel) return card.dataset.ctxPanel;

    const oc = card.getAttribute('onclick') || '';

    let m = oc.match(/openPanel\(\s*['"]([^'"]+)['"]\s*\)/);
    if(m) return m[1];

    if(/openStatistik\s*\(\s*\)/.test(oc)) return 'statistik';
    if(/openKeuangan\s*\(\s*\)/.test(oc))  return 'keuangan';
    if(/openPembayaran\s*\(\s*\)/.test(oc))return 'pembayaran';

    if(/buatRPP\s*\(\s*\)/.test(oc))     return 'rpp-baru';
    if(/bukaAnekdot\s*\(\s*\)/.test(oc)) return 'anekdot';

    m = oc.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
    if(m){
      const file = m[1].toLowerCase();
      if(file.indexOf('rpp')      >= 0) return 'rpp';
      if(file.indexOf('anekdot')  >= 0) return 'anekdot';
      if(file.indexOf('observasi')>= 0) return 'observasi';
      if(file.indexOf('penilaian')>= 0) return 'penilaian';
    }

    const h3 = card.querySelector('h3');
    if(h3){
      const t = h3.textContent.toLowerCase();
      if(t.indexOf('surat masuk')  >= 0) return 'surat-masuk';
      if(t.indexOf('surat keluar') >= 0) return 'surat-keluar';
      if(t.indexOf('inventaris')   >= 0) return 'inventaris';
      if(t.indexOf('pembayaran')   >= 0) return 'pembayaran';
      if(t.indexOf('laporan')      >= 0) return 'laporan';
      if(t.indexOf('arsip')        >= 0) return 'arsip';
      if(t.indexOf('monitoring')   >= 0) return 'monitoring';
      if(t.indexOf('supervisi')    >= 0) return 'supervisi';
      if(t.indexOf('validasi')     >= 0) return 'validasi';
      if(t.indexOf('statistik')    >= 0) return 'statistik';
      if(t.indexOf('keuangan')     >= 0) return 'keuangan';
      if(t.indexOf('anekdot')      >= 0) return 'anekdot';
      if(t.indexOf('observasi')    >= 0) return 'observasi';
      if(t.indexOf('penilaian')    >= 0) return 'penilaian';
      if(t.indexOf('rpph')         >= 0) return 'rpp';
      if(t.indexOf('rppm')         >= 0) return 'rpp';
    }

    return '';
  }

  /* ============================================================
     PASANG KE SEMUA .menu-card
     ============================================================ */
  function pasangKeSemuaCard(){
    const cards = document.querySelectorAll('.menu-card');
    let count = 0;

    cards.forEach(function(card){
      if(card.dataset.ctxEnabled === 'true') return;

      const panelName = deteksiPanel(card);
      if(panelName){
        card.dataset.ctxPanel = panelName;
      }
      card.dataset.ctxEnabled = 'true';
      count++;

      card.addEventListener('contextmenu', function(e){
        e.preventDefault();
        e.stopPropagation();
        tampilkanMenu(e.clientX, e.clientY, card);
      });

      card.addEventListener('click', function(e){
        const pn = card.dataset.ctxPanel || '';
        const info = PAGE_MAP[pn];

        if(e.ctrlKey || e.metaKey){
          e.preventDefault();
          e.stopPropagation();
          if(info){
            window.open(bangunUrl(info), '_blank', 'noopener,noreferrer');
            tampilkanToast('🔗 Dibuka di tab baru');
          }
          return;
        }
        if(e.shiftKey){
          e.preventDefault();
          e.stopPropagation();
          if(info){
            window.open(bangunUrl(info), '_blank', 'noopener,noreferrer,width=1280,height=800');
            tampilkanToast('🪟 Dibuka di jendela baru');
          }
          return;
        }
      }, true);
    });

    if(count > 0){
      console.log('✅ menu-context.js: ' + count + ' menu card terpasang klik kanan');
    }
  }

  /* ============================================================
     PASANG KE .hero DAN .rpp-alert
     ============================================================ */
  function pasangKeHeroDanAlert(){
    let countHero = 0;
    let countAlert = 0;

    const heroEls = document.querySelectorAll('.hero');
    heroEls.forEach(function(hero){
      if(hero.dataset.ctxEnabled === 'true') return;
      hero.dataset.ctxEnabled = 'true';
      hero.dataset.ctxPanel = 'rpp-baru';
      countHero++;

      hero.addEventListener('contextmenu', function(e){
        e.preventDefault();
        e.stopPropagation();
        tampilkanMenu(e.clientX, e.clientY, hero);
      });

      hero.addEventListener('click', function(e){
        if(e.ctrlKey || e.metaKey){
          e.preventDefault();
          e.stopPropagation();
          window.open(bangunUrl(PAGE_MAP['rpp-baru']), '_blank', 'noopener,noreferrer');
          tampilkanToast('🔗 Dibuka di tab baru');
          return;
        }
        if(e.shiftKey){
          e.preventDefault();
          e.stopPropagation();
          window.open(bangunUrl(PAGE_MAP['rpp-baru']), '_blank', 'noopener,noreferrer,width=1280,height=800');
          tampilkanToast('🪟 Dibuka di jendela baru');
          return;
        }
      }, true);
    });

    const alertEl = document.querySelector('.rpp-alert');
    if(alertEl && alertEl.dataset.ctxEnabled !== 'true'){
      alertEl.dataset.ctxEnabled = 'true';
      alertEl.dataset.ctxPanel = 'rpp-alert';
      countAlert++;

      alertEl.addEventListener('contextmenu', function(e){
        if(e.target.closest('.alert-btn')) return;
        e.preventDefault();
        e.stopPropagation();
        tampilkanMenu(e.clientX, e.clientY, alertEl);
      });

      alertEl.addEventListener('click', function(e){
        if(e.target.closest('.alert-btn')) return;

        if(e.ctrlKey || e.metaKey){
          e.preventDefault();
          e.stopPropagation();
          window.open(bangunUrl(PAGE_MAP['rpp-alert']), '_blank', 'noopener,noreferrer');
          tampilkanToast('🔗 Dibuka di tab baru');
          return;
        }
        if(e.shiftKey){
          e.preventDefault();
          e.stopPropagation();
          window.open(bangunUrl(PAGE_MAP['rpp-alert']), '_blank', 'noopener,noreferrer,width=1280,height=800');
          tampilkanToast('🪟 Dibuka di jendela baru');
          return;
        }
      }, true);
    }

    const alertBtns = document.querySelectorAll('.alert-btn');
    alertBtns.forEach(function(btn){
      if(btn.dataset.ctxEnabled === 'true') return;
      btn.dataset.ctxEnabled = 'true';

      btn.addEventListener('contextmenu', function(e){
        e.preventDefault();
        e.stopPropagation();
        tampilkanMenu(e.clientX, e.clientY, btn);
      });
    });

    if(countHero > 0){
      console.log('✅ menu-context.js: ' + countHero + ' hero terpasang klik kanan');
    }
    if(countAlert > 0){
      console.log('✅ menu-context.js: banner RPPH/RPPM terpasang klik kanan');
    }
  }

  /* ============================================================
     TUTUP MENU
     ============================================================ */
  document.addEventListener('click', function(e){
    if(ctxMenu && ctxMenu.classList.contains('show')){
      if(!ctxMenu.contains(e.target)) sembunyikanMenu();
    }
  });

  document.addEventListener('contextmenu', function(e){
    if(ctxMenu && ctxMenu.classList.contains('show')){
      if(!e.target.closest('.menu-card') &&
         !e.target.closest('.hero') &&
         !e.target.closest('.rpp-alert') &&
         !e.target.closest('.alert-btn')){
        sembunyikanMenu();
      }
    }
  });

  window.addEventListener('scroll', sembunyikanMenu, { passive:true });
  window.addEventListener('resize', sembunyikanMenu);

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') sembunyikanMenu();
  });

  /* ============================================================
     BUKA PANEL DARI URL (?panel=...)
     ============================================================ */
  function bukaPanelDariUrl(){
    const params = new URLSearchParams(window.location.search);
    const panel = params.get('panel');
    if(!panel) return;

    let tries = 0;
    const t = setInterval(function(){
      tries++;
      let done = false;

      if(panel === 'statistik' && typeof window.openStatistik === 'function'){
        try{ window.openStatistik(); done = true; }catch(e){}
      }
      if(!done && panel === 'keuangan' && typeof window.openKeuangan === 'function'){
        try{ window.openKeuangan(); done = true; }catch(e){}
      }
      if(!done && panel === 'pembayaran' && typeof window.openPembayaran === 'function'){
        try{ window.openPembayaran(); done = true; }catch(e){}
      }
      if(!done && typeof window.openPanel === 'function'){
        try{ window.openPanel(panel); done = true; }catch(e){}
      }

      if(done || tries > 40) clearInterval(t);
    }, 100);
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init(){
    pasangKeSemuaCard();
    pasangKeHeroDanAlert();
    bukaPanelDariUrl();

    const mo = new MutationObserver(function(){
      pasangKeSemuaCard();
      pasangKeHeroDanAlert();
    });
    mo.observe(document.body, { childList:true, subtree:true });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ============================================================
     EKSPOS API DEBUG
     ============================================================ */
  window.SIAGRA_CTX = {
    refresh: function(){
      pasangKeSemuaCard();
      pasangKeHeroDanAlert();
    },
    map: PAGE_MAP
  };

})();