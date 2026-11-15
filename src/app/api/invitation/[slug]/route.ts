import { NextRequest, NextResponse } from 'next/server';
import { getSettingsAsync, getGuestBySlugAsync, getAllWishesAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const toParam = searchParams.get('to');
    const settings = await getSettingsAsync();
    const wishes = await getAllWishesAsync();

    let guest = await getGuestBySlugAsync(params.slug);

    // If guest not found by slug, but user provided query param or default demo
    if (!guest && toParam) {
      guest = {
        id: `virtual-${Date.now()}`,
        name: toParam,
        slug: params.slug,
        code: `WED-VIP-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: '',
        category: 'Tamu Kehormatan',
        tableOrSession: 'Sesi 1 (11.00 - 14.00 WIB)',
        pax: 2,
        rsvpStatus: 'pending',
        rsvpPax: 0,
        isCheckedIn: false,
        createdAt: new Date().toISOString()
      };
    }

    return NextResponse.json({
      success: true,
      settings,
      guest: guest || null,
      wishes: wishes.slice(0, 50)
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat undangan" }, { status: 500 });
  }
}
