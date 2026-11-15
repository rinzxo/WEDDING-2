'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { User, Calendar, MapPin, Ticket, Download, Lock, CheckCircle2 } from 'lucide-react';
import { Guest } from '@/lib/db';

interface QRCodeTicketSectionProps {
  guest: Guest | null;
  groomName: string;
  brideName: string;
  eventDate: string;
  venueName?: string;
  rsvpConfirmed: boolean;
}

export default function QRCodeTicketSection({
  guest,
  groomName,
  brideName,
  eventDate,
  venueName = 'Kediaman Mempelai Wanita, Bekasi',
  rsvpConfirmed,
}: QRCodeTicketSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  const guestCode = guest?.code || 'WED-TR-2026';
  const guestName = guest?.name || 'Tamu Undangan';
  const guestCategory = guest?.category || 'VIP Tamu';
  const tableSession = guest?.tableOrSession || 'Sesi 1 (11.00 - 14.00 WIB)';

  // Render QR Code onto canvas when unlocked
  useEffect(() => {
    if (rsvpConfirmed && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        guestCode,
        {
          width: 220,
          margin: 1.5,
          color: {
            dark: '#1e3a8a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (!error) setQrGenerated(true);
        }
      );
    }
  }, [rsvpConfirmed, guestCode]);

  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res branded pass canvas for download
    const dlCanvas = document.createElement('canvas');
    const ctx = dlCanvas.getContext('2d');
    if (!ctx) return;

    dlCanvas.width = 720;
    dlCanvas.height = 920;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, dlCanvas.width, dlCanvas.height);

    // Decorative Soft Blue Frame
    ctx.strokeStyle = '#bae0fd';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, dlCanvas.width - 60, dlCanvas.height - 60);

    // Top Header
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WEDDING PASS INVITATION', dlCanvas.width / 2, 85);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText(`${brideName} & ${groomName}`, dlCanvas.width / 2, 135);

    // Draw QR Code
    ctx.drawImage(canvas, 185, 175, 350, 350);

    // Pass details
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('PASS ID / CHECK-IN CODE', dlCanvas.width / 2, 570);

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillText(guestCode, dlCanvas.width / 2, 615);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText(guestName, dlCanvas.width / 2, 675);

    ctx.fillStyle = '#64748b';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(`${guestCategory} • ${tableSession}`, dlCanvas.width / 2, 715);
    ctx.fillText(eventDate, dlCanvas.width / 2, 755);

    // Footer note
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 15px Arial, sans-serif';
    ctx.fillText('Tunjukkan QR pass ini kepada penerima tamu saat kedatangan.', dlCanvas.width / 2, 830);

    const url = dlCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR-Pass-${guestName.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  return (
    <div className="border-y border-blue-200/80 bg-white">
      <div className="reveal mx-auto grid max-w-5xl gap-8 px-5 py-16 sm:py-20 lg:grid-cols-[1fr_380px] lg:items-center">
        
        {/* Left: Cinematic Pass Panel with InfoPills */}
        <div className="cinematic-pass-panel rounded-2xl border border-blue-100 bg-[#f0f7ff] p-6 sm:p-8">
          <p className="eyebrow text-blue-600">Guest Pass</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-[#0f172a]">
            Tiket Kehadiran Digital
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Harap tunjukkan QR pass ini kepada panitia resepsionis di meja penerima tamu untuk konfirmasi kehadiran otomatis.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3.5 shadow-sm">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#1e40af] text-white">
                <User size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Nama Tamu</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{guestName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3.5 shadow-sm">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#1e40af] text-white">
                <Calendar size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tanggal Acara</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{eventDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3.5 shadow-sm">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#1e40af] text-white">
                <MapPin size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Lokasi</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{venueName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3.5 shadow-sm">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#1e40af] text-white">
                <Ticket size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Kategori &bull; Meja</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{guestCategory} &bull; {tableSession}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR Card (Locked vs Unlocked) */}
        <div className="cinematic-qr-card rounded-2xl border border-blue-100 bg-[#f0f7ff] p-6 sm:p-8 text-center">
          {rsvpConfirmed ? (
            <div className="flex flex-col items-center">
              <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm inline-block">
                <canvas ref={canvasRef} className="mx-auto block" />
              </div>

              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Pass ID / QR Code
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-[#1e40af] tracking-wider">
                {guestCode}
              </p>

              <button
                type="button"
                className="button-primary mt-6 w-full cursor-pointer flex items-center justify-center gap-2"
                onClick={downloadQr}
              >
                <Download size={17} />
                <span>Download QR Pass</span>
              </button>
            </div>
          ) : (
            <div className="qr-locked-state">
              <div className="qr-locked-mark">
                <Lock size={32} />
              </div>
              <p className="eyebrow mt-5 text-blue-600">QR Terkunci</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-[#0f172a] leading-tight">
                Konfirmasi RSVP Terlebih Dahulu
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-500 max-w-xs">
                Setelah Anda mengisi dan menekan tombol Konfirmasi RSVP di atas, QR pass pribadi akan otomatis terbuka di sini.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
