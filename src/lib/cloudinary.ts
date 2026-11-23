import crypto from 'crypto';
import { getSettings } from './db';

export interface CloudinaryCredentials {
  cloudName: string;
  apiKey?: string;
  apiSecret?: string;
  uploadPreset?: string;
  folder: string;
}

/**
 * Resolves Cloudinary credentials from environment variables or stored settings
 */
export function getCloudinaryCredentials(): CloudinaryCredentials | null {
  const settings = getSettings();

  // 1. Check process.env.CLOUDINARY_URL e.g. cloudinary://apiKey:apiSecret@cloudName
  if (process.env.CLOUDINARY_URL) {
    try {
      const parsed = new URL(process.env.CLOUDINARY_URL);
      const cloudName = parsed.hostname;
      const apiKey = decodeURIComponent(parsed.username);
      const apiSecret = decodeURIComponent(parsed.password);
      if (cloudName && apiKey && apiSecret) {
        return {
          cloudName,
          apiKey,
          apiSecret,
          folder: process.env.CLOUDINARY_FOLDER || settings.cloudinary?.folder || 'UNDANGAN',
        };
      }
    } catch {
      // Invalid URL format, fallback to standard vars
    }
  }

  // 2. Check individual process.env variables
  const envCloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const envApiKey = process.env.CLOUDINARY_API_KEY;
  const envApiSecret = process.env.CLOUDINARY_API_SECRET;
  const envPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // 3. Check settings stored in database
  const cloudName = envCloudName || settings.cloudinary?.cloudName;
  const apiKey = envApiKey || settings.cloudinary?.apiKey;
  const apiSecret = envApiSecret || settings.cloudinary?.apiSecret;
  const uploadPreset = envPreset || settings.cloudinary?.uploadPreset;
  const folder = process.env.CLOUDINARY_FOLDER || settings.cloudinary?.folder || 'UNDANGAN';

  if (!cloudName) {
    return null;
  }

  return {
    cloudName,
    apiKey: apiKey || undefined,
    apiSecret: apiSecret || undefined,
    uploadPreset: uploadPreset || undefined,
    folder: folder || 'UNDANGAN',
  };
}

/**
 * Uploads a file buffer or Blob to Cloudinary into folder 'UNDANGAN' (or custom folder)
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | Blob | Uint8Array,
  fileName: string = 'wedding-photo.jpg',
  customFolder?: string
): Promise<{
  success: boolean;
  url?: string;
  publicId?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  error?: string;
}> {
  const creds = getCloudinaryCredentials();
  if (!creds) {
    return {
      success: false,
      error: 'Kredensial Cloudinary belum diatur. Masukkan Cloud Name, API Key, dan API Secret di menu pengaturan atau file .env.local.'
    };
  }

  const folder = customFolder || creds.folder || 'UNDANGAN';
  const timestamp = Math.round(Date.now() / 1000);

  const formData = new FormData();
  const blob = fileBuffer instanceof Blob ? fileBuffer : new Blob([fileBuffer as any]);
  formData.append('file', blob, fileName);
  formData.append('folder', folder);

  if (creds.apiKey && creds.apiSecret) {
    // Signed upload:
    // Parameters to sign in alphabetical order: folder=...&timestamp=...
    const strToSign = `folder=${folder}&timestamp=${timestamp}${creds.apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    formData.append('api_key', creds.apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
  } else if (creds.uploadPreset) {
    // Unsigned upload preset
    formData.append('upload_preset', creds.uploadPreset);
  } else {
    return {
      success: false,
      error: 'Diperlukan API Key & Secret (untuk signed upload) atau Upload Preset (untuk unsigned upload).'
    };
  }

  try {
    const endpoint = `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`;
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const resJson = await res.json();
    if (!res.ok || resJson.error) {
      return {
        success: false,
        error: resJson.error?.message || `Upload gagal dengan status HTTP ${res.status}`
      };
    }

    return {
      success: true,
      url: resJson.secure_url || resJson.url,
      publicId: resJson.public_id,
      width: resJson.width,
      height: resJson.height,
      bytes: resJson.bytes,
      format: resJson.format,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Gagal menghubungi server Cloudinary.'
    };
  }
}
