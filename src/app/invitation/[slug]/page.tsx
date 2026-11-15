import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSettingsAsync, getGuestBySlugAsync, getAllWishesAsync } from '@/lib/db';
import InvitationView from '@/components/invitation/InvitationView';

export const revalidate = 0; // dynamic

interface PageProps {
  params: { slug: string };
  searchParams?: { to?: string };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const guest = await getGuestBySlugAsync(params.slug);
  const name = guest?.name || searchParams?.to || "Tamu Undangan";
  const settings = await getSettingsAsync();

  const brideName = settings.bride.nickname || "Tika";
  const groomName = settings.groom.nickname || "Ridho";

  return {
    title: `The Wedding of ${brideName} & ${groomName} - Khusus Kepada Yth. ${name}`,
    description: `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i ${name} untuk menghadiri pernikahan kami. Klik untuk membuka undangan & QR kehadiran.`,
    openGraph: {
      title: `The Wedding of ${brideName} & ${groomName}`,
      description: `Undangan Spesial untuk ${name}`,
      images: [
        {
          url: settings.gallery[0] || "/images/prewedding/cover.jpg",
          width: 1076,
          height: 1080,
          alt: `${groomName} & ${brideName}`,
        },
      ],
    },
  };
}

export default async function GuestInvitationPage({ params, searchParams }: PageProps) {
  const settings = await getSettingsAsync();
  const wishes = await getAllWishesAsync();
  let guest = await getGuestBySlugAsync(params.slug);

  if (!guest && searchParams?.to) {
    guest = {
      id: `virtual-${Date.now()}`,
      name: searchParams.to,
      slug: params.slug,
      code: `WED-VIP-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: '',
      category: 'Tamu Kehormatan',
      tableOrSession: 'Sesi 1 (11.00 - 14.00 WIB)',
      pax: 2,
      rsvpStatus: 'pending',
      rsvpPax: 0,
      isCheckedIn: false,
      createdAt: new Date().toISOString(),
    };
  }

  return (
    <InvitationView
      settings={settings}
      guest={guest || null}
      wishes={wishes}
    />
  );
}
