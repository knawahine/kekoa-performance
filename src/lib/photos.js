import { supabase } from './supabase';

/**
 * Compress an image file to max dimension and JPEG quality
 */
export function compressImage(file, maxDimension = 1200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/jpeg',
        0.85
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Image load failed'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert a base64 data URL to a Blob (for migration)
 */
export function base64ToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

/**
 * Upload a photo blob to Supabase Storage and record in photos table
 */
export async function uploadPhoto(userId, weekNum, angle, blob) {
  const path = `${userId}/${weekNum}/${angle}.jpg`;

  const { error: uploadErr } = await supabase.storage
    .from('photos')
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from('photos').getPublicUrl(path);
  const url = data.publicUrl;

  // Upsert metadata row
  const { error: dbErr } = await supabase.from('photos').upsert(
    {
      user_id: userId,
      week_num: weekNum,
      angle,
      storage_path: path,
      url,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,week_num,angle' }
  );
  if (dbErr) throw dbErr;

  return url;
}
