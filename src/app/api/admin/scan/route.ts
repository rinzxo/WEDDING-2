import { NextRequest, NextResponse } from 'next/server';
import { checkInGuestAsync } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = { code: text };
      }
    }

    let rawCode = body?.code || '';
    const checkedInBy = body?.checkedInBy || 'Petugas Meja Resepsionis';

    if (!rawCode || !String(rawCode).trim()) {
      return NextResponse.json({ success: false, message: "Kode QR tidak boleh kosong!" }, { status: 400 });
    }

    rawCode = String(rawCode).trim();

    // If the QR contains a full URL e.g. "http://localhost:3000/invitation/rahmat-hidayat?code=WED-RH-8419"
    let extractedCode = rawCode;
    try {
      if (rawCode.includes('http://') || rawCode.includes('https://')) {
        const parsedUrl = new URL(rawCode);
        const codeParam = parsedUrl.searchParams.get('code');
        if (codeParam) {
          extractedCode = codeParam;
        } else {
          const parts = parsedUrl.pathname.split('/').filter(Boolean);
          if (parts.length > 0) {
            extractedCode = parts[parts.length - 1];
          }
        }
      } else if (rawCode.startsWith('{') && rawCode.endsWith('}')) {
        const obj = JSON.parse(rawCode);
        if (obj.code) extractedCode = obj.code;
        else if (obj.id) extractedCode = obj.id;
      }
    } catch {
      extractedCode = rawCode;
    }

    const result = await checkInGuestAsync(extractedCode, checkedInBy);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message || "Tamu tidak ditemukan dalam database!"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: result.alreadyCheckedIn,
      message: result.message,
      guest: result.guest
    });
  } catch (error: any) {
    console.error("Error processing scan check-in:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan sistem saat memproses check-in: " + (error?.message || '')
    }, { status: 500 });
  }
}
