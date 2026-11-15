import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "The Wedding of Tika & Ridho - Undangan Pernikahan Digital",
  description: "Undangan Pernikahan Digital Spesial Martika Larassati (Tika) & Ridho Khairuman. Dilengkapi QR Code Kehadiran, Konfirmasi RSVP, dan Buku Tamu Online.",
  openGraph: {
    title: "The Wedding of Tika & Ridho",
    description: "Undangan Pernikahan Digital Spesial Tika & Ridho. Kami mengundang kehadiran dan doa restu Anda.",
    url: "http://localhost:3000",
    siteName: "Wedding Invitation",
    images: [
      {
        url: "/images/couple-main.webp",
        width: 1076,
        height: 1080,
        alt: "The Wedding of Tika & Ridho",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}

