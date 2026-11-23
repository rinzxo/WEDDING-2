import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, getCloudinaryCredentials } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow sufficient time for media upload

export async function POST(req: NextRequest) {
  try {
    const creds = getCloudinaryCredentials();
    if (!creds) {
      return NextResponse.json(
        {
          success: false,
          code: 'NOT_CONFIGURED',
          message: 'Kredensial Cloudinary belum diatur. Silakan atur Cloud Name, API Key, dan API Secret di tab Galeri/Cloudinary atau di file .env.local.',
        },
        { status: 400 }
      );
    }

    const contentType = req.headers.get('content-type') || '';

    // 1. Multipart Form Data (File Upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const customFolder = (formData.get('folder') as string) || 'UNDANGAN';

      if (!file) {
        return NextResponse.json(
          { success: false, message: 'File foto tidak ditemukan dalam request' },
          { status: 400 }
        );
      }

      // Check max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'Ukuran foto maksimal adalah 10MB' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, file.name, customFolder);

      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.error || 'Gagal mengupload ke Cloudinary' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
        message: 'Foto berhasil diupload ke Cloudinary (Folder: ' + customFolder + ')',
      });
    }

    // 2. JSON Body (Base64 or URL)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { base64, fileName = 'wedding-photo.jpg', folder = 'UNDANGAN' } = body;

      if (!base64) {
        return NextResponse.json(
          { success: false, message: 'Data base64 foto tidak ditemukan' },
          { status: 400 }
        );
      }

      // Extract raw base64 data
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const buffer = matches
        ? Buffer.from(matches[2], 'base64')
        : Buffer.from(base64, 'base64');

      const result = await uploadToCloudinary(buffer, fileName, folder);

      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.error || 'Gagal mengupload ke Cloudinary' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
        message: 'Foto berhasil diupload ke Cloudinary (Folder: ' + folder + ')',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Content-Type tidak didukung. Gunakan multipart/form-data atau JSON' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan server saat upload' },
      { status: 500 }
    );
  }
}

