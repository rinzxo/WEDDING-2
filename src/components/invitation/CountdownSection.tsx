'use client';

import React, { useEffect, useState } from 'react';
import { CalendarPlus, Clock } from 'lucide-react';

interface CountdownSectionProps {
  targetDate: string;
  eventTitle?: string;
  venueName?: string;
}

export default function CountdownSection({
  targetDate,
  eventTitle = "The Wedding of Tika & Ridho",
  venueName = "Kediaman Mempelai Wanita, Bekasi",
}: CountdownSectionProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleAddToCalendar = () => {
    const startTime = "20261228T010000Z";
    const endTime = "20261228T070000Z";
    const details = encodeURIComponent("The Wedding of Tika & Ridho. Kami mengundang kehadiran dan doa restu Anda.");
    const location = encodeURIComponent(venueName);
    const title = encodeURIComponent(eventTitle);
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    window.open(gcalUrl, '_blank');
  };

  return (
    <section className="py-16 px-4 bg-[#2b3951] text-white text-center relative overflow-hidden">
      <div className="af slide-up max-w-sm mx-auto relative z-10">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5 text-[#d7ac64]" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#f3e5c8] font-medium">
            Save The Date
          </span>
        </div>

        <h2 className="font-serif text-2xl font-bold tracking-wide text-white mb-6">
          Hitung Mundur Acara
        </h2>

        {/* Countdown Grid (Jura font / clean boxes) */}
        <div className="grid grid-cols-4 gap-2 my-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 shadow-md">
            <span className="font-serif text-2xl font-bold text-[#f3e5c8] block">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-300 font-medium">
              Hari
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 shadow-md">
            <span className="font-serif text-2xl font-bold text-[#f3e5c8] block">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-300 font-medium">
              Jam
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 shadow-md">
            <span className="font-serif text-2xl font-bold text-[#f3e5c8] block">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-300 font-medium">
              Menit
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 shadow-md">
            <span className="font-serif text-2xl font-bold text-[#f3e5c8] block">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-300 font-medium">
              Detik
            </span>
          </div>
        </div>

        {/* Save to Calendar Button */}
        <button
          onClick={handleAddToCalendar}
          className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#d7ac64] hover:bg-[#c4964e] active:scale-95 text-slate-900 font-medium text-xs tracking-wider uppercase transition-all shadow-md"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>Simpan Ke Kalender</span>
        </button>
      </div>
    </section>
  );
}
