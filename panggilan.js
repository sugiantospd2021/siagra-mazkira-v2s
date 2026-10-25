/* ============================================================
   SIAGRA v.2.s — MODUL BERSAMA
   File: panggilan.js
   ============================================================ */

(function(global){
  'use strict';

  const KAMUS_PANGGILAN = {
    'Sugianto'              : 'Pak Anto',
    'Anto'                  : 'Mas Anto',
    'Elma Noor Safitri'     : 'Ibu Elma',
    "Halimatus Sa'diah"     : 'Ibu Diah',
    'Nadila Ramadhan P.S.'  : 'Ibu Dila',
    'Nurul Fatimah'         : 'Ibu Imah',
    'Jamsiah'               : 'Ibu Yayah',
    'Puspa Erma Sari'       : 'Ibu Puspa'
  };

  function bersihkanNama(namaLengkap){
    if(!namaLengkap) return '';
    let nama = String(namaLengkap).split(',')[0].trim();
    nama = nama.replace(/\s+/g, ' ').trim();
    return nama;
  }

  function normalLower(s){
    return String(s).toLowerCase()
      .replace(/\./g, '')
      .replace(/[’‘`]/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function ambilNamaPanggilan(namaLengkap){
    if(!namaLengkap) return 'Pengguna';
    const namaBersih = bersihkanNama(namaLengkap);
    if(!namaBersih) return 'Pengguna';
    const namaLower = normalLower(namaBersih);

    for(const key in KAMUS_PANGGILAN){
      if(normalLower(key) === namaLower) return KAMUS_PANGGILAN[key];
    }
    for(const key in KAMUS_PANGGILAN){
      if(namaLower.includes(normalLower(key))) return KAMUS_PANGGILAN[key];
    }
    for(const key in KAMUS_PANGGILAN){
      if(normalLower(key).includes(namaLower)) return KAMUS_PANGGILAN[key];
    }

    const parts = namaBersih.split(' ');
    return parts[0] || 'Pengguna';
  }

  function ambilSapaanWaktu(){
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wita = new Date(utc + (8 * 3600000));
    const jam = wita.getHours();
    const menit = String(wita.getMinutes()).padStart(2, '0');

    let sapaan, emoji, sub, kelas;
    if(jam >= 5 && jam < 11){
      sapaan = 'Selamat Pagi'; emoji = '🌅';
      sub = 'Semangat memulai hari! Yuk siapkan kegiatan belajar hari ini.';
      kelas = 'w-pagi';
    } else if(jam >= 11 && jam < 15){
      sapaan = 'Selamat Siang'; emoji = '☀️';
      sub = 'Tetap fokus dan semangat menemani anak-anak belajar.';
      kelas = 'w-siang';
    } else if(jam >= 15 && jam < 18){
      sapaan = 'Selamat Sore'; emoji = '🌇';
      sub = 'Waktunya rekap kegiatan hari ini sebelum beristirahat.';
      kelas = 'w-sore';
    } else {
      sapaan = 'Selamat Malam'; emoji = '🌙';
      sub = 'Selamat beristirahat. Jangan lupa cek administrasi besok.';
      kelas = 'w-malam';
    }

    return {
      sapaan, emoji, sub, kelas,
      jam, menit,
      jamStr: String(jam).padStart(2, '0'),
      teks: String(jam).padStart(2, '0') + '.' + menit + ' WITA'
    };
  }

  function isJabatanTendik(jabatan){
    if(!jabatan) return false;
    const j = String(jabatan).toLowerCase();
    return j.includes('tenaga') || j.includes('tendik') ||
           j.includes('tata usaha') || j === 'tu' ||
           j.includes('bendahara') || j.includes('operator') ||
           j.includes('penjaga') || j.includes('pustakawan') ||
           j.includes('kependidikan');
  }

  function getJabatanClass(jabatan){
    if(!jabatan) return 'jabatan-wali';
    const j = String(jabatan).toLowerCase();
    if(j.includes('kepala')) return 'jabatan-kepsek';
    if(j.includes('admin')) return 'jabatan-admin';
    if(j.includes('pendamping')) return 'jabatan-pendamping';
    if(isJabatanTendik(jabatan)) return 'jabatan-tendik';
    return 'jabatan-wali';
  }

  function getRombelClass(rombel){
    if(!rombel) return 'rombel-A';
    const r = String(rombel).toUpperCase().trim();
    if(r === 'A' || r === 'A1' || r === 'A2') return 'rombel-A';
    if(r === 'B1' || r === 'B') return 'rombel-B1';
    if(r === 'B2') return 'rombel-B2';
    return 'rombel-A';
  }

  function labelRombel(rombel){
    if(!rombel) return '-';
    const r = String(rombel).toUpperCase().trim();
    if(r === 'A' || r === 'A1') return 'Rombel A';
    if(r === 'A2') return 'Rombel A2';
    if(r === 'B1' || r === 'B') return 'Rombel B1';
    if(r === 'B2') return 'Rombel B2';
    return 'Rombel ' + r;
  }

  function formatTanggalPanjang(iso){
    if(!iso) return '-';
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni',
                   'Juli','Agustus','September','Oktober','November','Desember'];
    const d = new Date(iso);
    if(isNaN(d)) return iso;
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  }

  function hitungLamaMengajar(tmt){
    if(!tmt) return { teks: '-', bulan: 0, tahun: 0 };
    const tglTmt = new Date(tmt);
    const hariIni = new Date();
    if(isNaN(tglTmt) || tglTmt > hariIni) return { teks: '-', bulan: 0, tahun: 0 };

    let tahun = hariIni.getFullYear() - tglTmt.getFullYear();
    let bulan = hariIni.getMonth() - tglTmt.getMonth();

    if(bulan < 0){ tahun--; bulan += 12; }
    if(hariIni.getDate() < tglTmt.getDate()){
      bulan--;
      if(bulan < 0){ tahun--; bulan += 12; }
    }

    const totalBulan = (tahun * 12) + bulan;
    const teks = tahun + ' tahun ' + bulan + ' bulan (' + totalBulan + ' bulan)';
    return { teks, bulan: totalBulan, tahun };
  }

  global.KAMUS_PANGGILAN      = KAMUS_PANGGILAN;
  global.ambilNamaPanggilan   = ambilNamaPanggilan;
  global.ambilSapaanWaktu     = ambilSapaanWaktu;
  global.isJabatanTendik      = isJabatanTendik;
  global.getJabatanClass      = getJabatanClass;
  global.getRombelClass       = getRombelClass;
  global.labelRombel          = labelRombel;
  global.formatTanggalPanjang = formatTanggalPanjang;
  global.hitungLamaMengajar   = hitungLamaMengajar;

})(window);