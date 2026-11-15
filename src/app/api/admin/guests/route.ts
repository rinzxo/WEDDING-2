import { NextRequest, NextResponse } from 'next/server';
import { getAllGuestsAsync, createGuestAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const checkin = searchParams.get('checkin') || '';

    let guests = await getAllGuestsAsync();

    if (query) {
      guests = guests.filter(g => 
        g.name.toLowerCase().includes(query) ||
        g.code.toLowerCase().includes(query) ||
        g.phone.includes(query)
      );
    }

    if (category) {
      guests = guests.filter(g => g.category.toLowerCase() === category.toLowerCase());
    }

    if (status) {
      guests = guests.filter(g => g.rsvpStatus === status);
    }

    if (checkin === 'yes') {
      guests = guests.filter(g => g.isCheckedIn);
    } else if (checkin === 'no') {
      guests = guests.filter(g => !g.isCheckedIn);
    }

    return NextResponse.json({ success: true, guests });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat daftar tamu" }, { status: 500 });
  }
}

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
        return NextResponse.json({ success: false, message: "Format data tidak valid" }, { status: 400 });
      }
    }

    if (!body?.name || !body.name.trim()) {
      return NextResponse.json({ success: false, message: "Nama tamu wajib diisi" }, { status: 400 });
    }

    const guest = await createGuestAsync({
      name: body.name.trim(),
      phone: body.phone?.trim() || '',
      category: body.category || 'Reguler',
      tableOrSession: body.tableOrSession || 'Sesi 1 (08.00 - 10.00 WIB)',
      pax: Number(body.pax) || 1
    });

    return NextResponse.json({ success: true, guest, message: "Tamu berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("Error creating guest:", error);
    return NextResponse.json({ success: false, message: "Gagal menambahkan tamu" }, { status: 500 });
  }
}
