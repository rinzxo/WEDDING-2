import { NextRequest, NextResponse } from 'next/server';
import { deleteWishAsync } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteWishAsync(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Ucapan tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Ucapan berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal menghapus ucapan" }, { status: 500 });
  }
}
