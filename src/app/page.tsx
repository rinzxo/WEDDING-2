import { getSettingsAsync, getAllWishesAsync } from '@/lib/db';
import InvitationView from '@/components/invitation/InvitationView';

export const revalidate = 0; // dynamic

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { to?: string };
}) {
  const settings = await getSettingsAsync();
  const wishes = await getAllWishesAsync();

  const guestName = searchParams?.to || "Tamu Undangan";

  return (
    <InvitationView
      settings={settings}
      guest={null}
      guestName={guestName}
      isGeneral={true}
      wishes={wishes}
    />
  );
}
