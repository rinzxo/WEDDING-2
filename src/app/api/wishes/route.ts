import { NextRequest, NextResponse } from 'next/server';
import { getAllWishesAsync, addWishAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const wishes = await getAllWishesAsync();
    return NextResponse.json({ success: true, wishes });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal memuat ucapan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, attendance, message } = body;

    if (!name || !name.trim() || !message || !message.trim()) {
      return NextResponse.json({ success: false, message: "Nama dan ucapan wajib diisi" }, { status: 400 });
    }

    const wish = await addWishAsync({
      name: name.trim(),
      attendance: attendance || 'attending',
      message: message.trim()
    });

    return NextResponse.json({ success: true, wish, message: "Ucapan berhasil dikirim" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal mengirim ucapan" }, { status: 500 });
  }
}
