import { NextResponse } from 'next/server';
import { getAllGuestsAsync, getAllWishesAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const guests = await getAllGuestsAsync();
    const wishes = await getAllWishesAsync();

    const totalGuests = guests.length;
    const totalPax = guests.reduce((acc, g) => acc + (g.pax || 1), 0);

    const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending');
    const totalAttendingPax = attendingGuests.reduce((acc, g) => acc + (g.rsvpPax || g.pax || 1), 0);

    const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined');
    const tentativeGuests = guests.filter(g => g.rsvpStatus === 'tentative');
    const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending');

    const checkedInGuests = guests.filter(g => g.isCheckedIn);
    const checkedInPax = checkedInGuests.reduce((acc, g) => acc + (g.pax || 1), 0);

    const checkInRate = totalGuests > 0 ? Math.round((checkedInGuests.length / totalGuests) * 100) : 0;
    const rsvpRate = totalGuests > 0 ? Math.round(((totalGuests - pendingGuests.length) / totalGuests) * 100) : 0;

    // Categories breakdown
    const categoryStats: Record<string, { total: number; checkedIn: number }> = {};
    for (const g of guests) {
      const cat = g.category || 'Reguler';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, checkedIn: 0 };
      }
      categoryStats[cat].total += 1;
      if (g.isCheckedIn) {
        categoryStats[cat].checkedIn += 1;
      }
    }

    // Recent checkins
    const recentCheckIns = guests
      .filter(g => g.isCheckedIn && g.checkedInAt)
      .sort((a, b) => new Date(b.checkedInAt!).getTime() - new Date(a.checkedInAt!).getTime())
      .slice(0, 8);

    return NextResponse.json({
      success: true,
      stats: {
        totalGuests,
        totalPax,
        attendingCount: attendingGuests.length,
        totalAttendingPax,
        declinedCount: declinedGuests.length,
        tentativeCount: tentativeGuests.length,
        pendingCount: pendingGuests.length,
        checkedInCount: checkedInGuests.length,
        checkedInPax,
        checkInRate,
        rsvpRate,
        wishesCount: wishes.length,
        categoryStats,
        recentCheckIns
      }
    });
  } catch (error) {
    console.error("Error computing stats:", error);
    return NextResponse.json({ success: false, message: "Gagal menghitung statistik" }, { status: 500 });
  }
}
