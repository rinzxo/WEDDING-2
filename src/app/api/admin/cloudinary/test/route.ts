import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryCredentials } from '@/lib/cloudinary';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const creds = getCloudinaryCredentials();
    if (!creds) {
      return NextResponse.json({
        configured: false,
        message: 'Kredensial Cloudinary belum diatur',
      });
    }

    return NextResponse.json({
      configured: true,
      cloudName: creds.cloudName,
      folder: creds.folder || 'UNDANGAN',
      hasApiKey: !!creds.apiKey,
      hasApiSecret: !!creds.apiSecret,
      hasPreset: !!creds.uploadPreset,
    });
  } catch (err: any) {
    return NextResponse.json({ configured: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const cloudName = body.cloudName || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = body.apiKey || process.env.CLOUDINARY_API_KEY;
    const apiSecret = body.apiSecret || process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = body.uploadPreset || process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) {
      return NextResponse.json(
        { success: false, message: 'Cloud Name wajib diisi' },
        { status: 400 }
      );
    }

    // Attempt a lightweight ping to Cloudinary API
    // If api_key and api_secret exist, ping usage or ping endpoint
    if (apiKey && apiSecret) {
      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
      const testRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/ping`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      if (!testRes.ok) {
        const errorJson = await testRes.json().catch(() => ({}));
        return NextResponse.json({
          success: false,
          message: errorJson.error?.message || `Koneksi gagal dengan status HTTP ${testRes.status}. Cek kembali Cloud Name, API Key, dan API Secret Anda.`,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Koneksi ke Cloudinary "${cloudName}" berhasil! Siap menyimpan ke folder "UNDANGAN".`,
      });
    }

    if (uploadPreset) {
      return NextResponse.json({
        success: true,
        message: `Cloud Name "${cloudName}" dan Upload Preset "${uploadPreset}" siap digunakan (Folder: "UNDANGAN").`,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Masukkan API Key & Secret (disarankan) atau Upload Preset untuk menguji koneksi.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghubungi server Cloudinary' },
      { status: 500 }
    );
  }
}

