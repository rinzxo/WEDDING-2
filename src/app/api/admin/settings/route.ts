import { NextRequest, NextResponse } from 'next/server';
import { getSettingsAsync, updateSettingsAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getSettingsAsync();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal memuat pengaturan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateSettingsAsync(body);
    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Pengaturan undangan berhasil disimpan"
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
