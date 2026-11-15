import { NextRequest, NextResponse } from 'next/server';
import { updateGuestAsync, deleteGuestAsync, getAllGuestsAsync } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const guests = await getAllGuestsAsync();
    const guest = guests.find(g => g.id === params.id || g.slug === params.id || g.code === params.id);
    if (!guest) {
      return NextResponse.json({ success: false, message: "Tamu tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, guest });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await updateGuestAsync(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: "Tamu tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, guest: updated, message: "Data tamu berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating guest:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui tamu" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteGuestAsync(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Tamu tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Tamu berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus tamu" }, { status: 500 });
  }
}
