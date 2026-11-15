import { getSettingsAsync, getAllWishesAsync } from '@/lib/db';
import InvitationView from '@/components/invitation/InvitationView';

export const revalidate = 0; // dynamic

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { to?: string; code?: string };
}) {
  const settings = await getSettingsAsync();
  const wishes = await getAllWishesAsync();

  const guestName = searchParams?.to || "Tamu Undangan";
  const guestCode = searchParams?.code || "WED-VIP-2026";

  const guest = {
    id: "guest-default",
    name: guestName,
    slug: "tamu",
    code: guestCode,
    phone: "",
    category: "VIP",
    tableOrSession: "Sesi 1 (11.00 - 14.00 WIB)",
    pax: 2,
    rsvpStatus: "pending" as const,
    rsvpPax: 0,
    isCheckedIn: false,
    createdAt: new Date().toISOString(),
  };

  return (
    <InvitationView
      settings={settings}
      guest={guest}
      wishes={wishes}
    />
  );
}
