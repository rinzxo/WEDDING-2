import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateIndonesian(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTimeIndonesian(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d) + ' WIB';
  } catch {
    return dateString;
  }
}

export function generateWhatsAppMessage(guestName: string, invitationUrl: string, groomBride: string = "Tika & Ridho"): string {
  return encodeURIComponent(
`Kepada Yth.
*Bapak/Ibu/Saudara/i ${guestName}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i serta kerabat sekalian untuk menghadiri acara pernikahan kami:

*${groomBride}*

Untuk detail informasi acara, waktu, lokasi, dan QR Code kehadiran, dapat diakses melalui link undangan berikut:
${invitationUrl}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Terima kasih.
Hormat kami,
*${groomBride}*`
  );
}

