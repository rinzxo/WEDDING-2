import { NextRequest, NextResponse } from 'next/server';
import { addWishAsync, getGuestByCodeAsync, updateGuestAsync, getAllGuestsAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const { name, attendance, message, guestId, guestCode, pax } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Nama wajib diisi" }, { status: 400 });
    }

    if (!attendance || !['attending', 'declined', 'tentative'].includes(attendance)) {
      return NextResponse.json({ success: false, message: "Pilih status kehadiran" }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: "Tuliskan ucapan & doa restu" }, { status: 400 });
    }

    let resolvedGuestId = guestId;
    if (!resolvedGuestId && guestCode) {
      const g = await getGuestByCodeAsync(guestCode);
      if (g) resolvedGuestId = g.id;
    }

    // Try finding by name if still not resolved
    if (!resolvedGuestId) {
      const allGuests = await getAllGuestsAsync();
      const match = allGuests.find(g => g.name.toLowerCase().trim() === name.toLowerCase().trim());
      if (match) resolvedGuestId = match.id;
    }

    // Update guest record if found
    if (resolvedGuestId) {
      await updateGuestAsync(resolvedGuestId, {
        rsvpStatus: attendance as any,
        rsvpPax: attendance === 'declined' ? 0 : (Number(pax) || 1),
        rsvpMessage: message.trim(),
        rsvpAt: new Date().toISOString()
      });
    }

    const newWish = await addWishAsync({
      name: name.trim(),
      attendance,
      message: message.trim(),
      guestId: resolvedGuestId,
      pax: Number(pax) || 1
    });

    return NextResponse.json({
      success: true,
      wish: newWish,
      message: "Terima kasih atas konfirmasi dan doa restunya!"
    });
  } catch (error: any) {
    console.error("Error submitting RSVP:", error);
    return NextResponse.json({ success: false, message: "Gagal mengirim konfirmasi: " + (error?.message || '') }, { status: 500 });
  }
}
