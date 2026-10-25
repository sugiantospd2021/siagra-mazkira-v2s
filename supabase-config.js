// ============================================================
//  SIAGRA v.2.s — Konfigurasi Supabase
//  File ini adalah PUSAT KONEKSI ke Supabase.
// ============================================================

// 1) URL proyek Supabase Anda
const SUPABASE_URL = "https://nkothmxdwpkptuvzunkb.supabase.co";

// 2) ANON PUBLIC KEY
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rb3RobXhkd3BrcHR1dnp1bmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTI2NDMsImV4cCI6MjEwNjQ2ODY0M30.h1_TsMUsoiG45RWrZ5t7gY3r-KgGV230czfj0yM-GAY";

// ============================================================
//  Membuat koneksi Supabase
// ============================================================
// Pastikan library Supabase (CDN) sudah dimuat sebelum file ini dipanggil
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Jadikan variabel global agar bisa diakses oleh script lain di HTML
window.sb = sb;

// ============================================================
//  FUNGSI BANTU
// ============================================================
async function cekKoneksi() {
  try {
    const { data, error } = await sb.from("guru").select("id").limit(1);
    if (error) { 
      console.error("❌ Koneksi gagal:", error.message); 
      return false; 
    }
    console.log("✅ Koneksi Supabase berhasil.");
    return true;
  } catch (err) {
    console.error("❌ Gagal terhubung ke Supabase:", err.message);
    return false;
  }
}

console.log("📦 supabase-config.js dimuat.");
// Catatan: Baris export dihapus karena file ini dimuat via <script> biasa, bukan module.