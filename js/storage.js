// Karena file supabase-config.js ada di luar folder 'js', kita mundur satu folder (../)
import { supabase } from '../supabase-config.js';

export async function uploadAvatar(file, folder, id) {
  // 1. Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format harus JPG, PNG, atau WEBP');
  }
  
  // 2. Validasi ukuran (maksimal 2 MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Ukuran maksimal 2 MB');
  }

  // 3. Buat nama file unik
  const ext = file.name.split('.').pop().toLowerCase();
  const fileName = `${folder}/${id}-${Date.now()}.${ext}`;

  // 4. Upload ke Supabase
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
  console.error("=== DETAIL ERROR SUPABASE ===", uploadError);
  throw uploadError;
}

  // 5. Ambil Public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// Fungsi opsional untuk menghapus foto lama jika ada update
export async function deleteAvatar(publicUrl) {
  if (!publicUrl || !publicUrl.includes('/avatars/')) return;
  const path = publicUrl.split('/avatars/')[1];
  await supabase.storage.from('avatars').remove([path]);
}