'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { WeddingSettings } from '@/lib/db';

interface EventsSectionProps {
  events: WeddingSettings['events'];
  eventDate?: string;
}

function RollingDateNumber({ target = 12 }: { target?: number }) {
  const [val, setVal] = useState<number | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          let current = 0;
          const step = () => {
            current += 1;
            setVal(current);
            if (current < target) {
              setTimeout(step, 50);
            }
          };
          step();
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums" suppressHydrationWarning>
      {val !== null ? String(val).padStart(2, '0') : String(target).padStart(2, '0')}
    </span>
  );
}

export default function EventsSection({ events, eventDate = 'Sabtu, 12 Desember 2026' }: EventsSectionProps) {
  const cards = [
    {
      title: events.akad.title || 'Akad Nikah',
      day: 'SABTU',
      dateNumber: 12,
      monthYear: 'DESEMBER 2026',
      time: events.akad.time || 'Pukul : 08.00 WIB',
      venue: events.akad.venue || 'KEDIAMAN MEMPELAI WANITA',
      address: events.akad.address || 'Villa Gading Harapan Blok WA1 No.12A, Rt.002/Rw.021, Jl.Kurmatama, Kebalen, Babelan, Kab.Bekasi, Jawa Barat',
      mapsUrl: events.akad.mapsUrl || 'https://maps.app.goo.gl/eoDsvfuK7e22VWY3A',
    },
    {
      title: events.resepsi.title || 'Resepsi',
      day: 'SABTU',
      dateNumber: 12,
      monthYear: 'DESEMBER 2026',
      time: events.resepsi.time || 'Pukul : 11.00 - 19.00 WIB',
      venue: events.resepsi.venue || 'KEDIAMAN MEMPELAI WANITA',
      address: events.resepsi.address || 'Villa Gading Harapan Blok WA1 No.12A, Rt.002/Rw.021, Jl.Kurmatama, Kebalen, Babelan, Kab.Bekasi, Jawa Barat',
      mapsUrl: events.resepsi.mapsUrl || 'https://maps.app.goo.gl/eoDsvfuK7e22VWY3A',
    },
  ];

  return (
    <section id="date" className="relative w-full py-16 sm:py-24 px-4 bg-[#4A5A74] text-slate-800 overflow-hidden">
      {/* Background sketch matching original Elementor BL-02-scaled-1-1.jpg */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-bottom bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/images/bg-verse.jpg')",
          backgroundColor: "#4A5A74",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#4A5A74]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#4A5A74]/80 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-[360px] md:max-w-4xl mx-auto flex flex-col md:grid md:grid-cols-2 md:gap-8 items-center md:items-stretch">
        
        {cards.map((card, idx) => (
          <div
            key={card.title}
            className={`w-full rounded-[28px] overflow-hidden bg-white shadow-[0_12px_32px_rgba(0,0,0,0.3)] relative p-6 sm:p-8 text-center flex flex-col items-center justify-between transition-all hover:scale-[1.01] duration-300 reveal ${
              idx === 0 ? 'delay-100' : 'mt-8 md:mt-0 delay-300'
            }`}
          >
            {/* Background misty landscape inside card matching Elementor Picture3-1-1-1.webp */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat pointer-events-none opacity-85"
              style={{
                backgroundImage: "url('/images/bg-mist.webp')",
              }}
            />

            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Event Title matching Screenshot 4 & 5 */}
              <h3 className="font-edensor text-[28px] sm:text-[32px] font-medium text-[#D7AC64] tracking-wide drop-shadow-[1px_1px_1px_#FFFFFF]">
                {card.title}
              </h3>

              {/* Day */}
              <p className="font-bodebeck text-[13px] font-semibold tracking-widest uppercase text-[#40506B] mt-2">
                {card.day}
              </p>

              {/* Date Number with Rolling Counter */}
              <p className="font-edensor text-5xl sm:text-6xl font-medium text-[#D7AC64] my-1 leading-none drop-shadow-[1px_1px_1px_#FFFFFF]">
                <RollingDateNumber target={card.dateNumber} />
              </p>

              {/* Month & Year */}
              <p className="font-bodebeck text-[13px] font-semibold tracking-widest uppercase text-[#40506B]">
                {card.monthYear}
              </p>

              {/* Time */}
              <p className="font-bodebeck text-xs sm:text-[13px] font-medium italic text-[#40506B] mt-1.5">
                {card.time}
              </p>

              {/* Divider with Pin Icon (Center-out expand + bouncing pin) */}
              <div className="w-full max-w-[240px] flex items-center justify-center my-4">
                <div className="h-px bg-[#40506B]/30 flex-1 line-expand" />
                <div className="mx-3 text-[#40506B] animate-pin-bounce">
                  <MapPin className="w-4 h-4 fill-[#40506B] text-[#40506B]" />
                </div>
                <div className="h-px bg-[#40506B]/30 flex-1 line-expand" />
              </div>

              {/* Venue */}
              <p className="font-bodebeck text-[11px] sm:text-[12px] font-bold tracking-wider uppercase text-[#40506B]">
                Tempat : {card.venue}
              </p>

              {/* Address */}
              <p className="font-bodebeck text-xs text-slate-600 mt-1 max-w-[260px] leading-relaxed">
                {card.address}
              </p>

              {/* Lihat Lokasi Button */}
              <a
                href={card.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 bg-[#4A5A74] hover:bg-[#D5AF6F] text-white font-bodebeck text-xs font-medium px-6 py-2.5 rounded-full transition-all duration-300 shadow-md active:scale-95 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Lihat Lokasi</span>
              </a>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
