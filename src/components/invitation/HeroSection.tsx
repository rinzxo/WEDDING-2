'use client';

import React, { useState, useEffect } from 'react';
import { WeddingSettings, Guest } from '@/lib/db';
import FlockOfBirds from './FlockOfBirds';

interface HeroSectionProps {
  settings: WeddingSettings;
  guest: Guest | null;
  guestName?: string;
  isOpeningCover?: boolean;
  isCoverOpened?: boolean;
}

export default function HeroSection({
  settings,
  guest,
  guestName,
  isOpeningCover = false,
  isCoverOpened = false,
}: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number>(0);

  // Countdown timer tick & hydration mounting
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate countdown
  const targetTime = new Date(settings.countdownTarget || '2026-12-12T08:00:00+07:00').getTime();
  const diff = mounted && now > 0 ? Math.max(0, targetTime - now) : 0;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const countdownItems = [
    { label: 'Hari', value: mounted ? String(days).padStart(2, '0') : '00' },
    { label: 'Jam', value: mounted ? String(hours).padStart(2, '0') : '00' },
    { label: 'Menit', value: mounted ? String(minutes).padStart(2, '0') : '00' },
    { label: 'Detik', value: mounted ? String(seconds).padStart(2, '0') : '00' },
  ];

  const groomName = settings.groom.nickname || 'Ridho';
  const brideName = settings.bride.nickname || 'Tika';

  return (
    <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-center py-12 md:py-20 px-4 overflow-hidden bg-[#D5D5D5]">
      {/* Background sketch matching original Elementor BL-01-1.webp with Ken Burns Breathing */}
      <div
        className="absolute inset-0 w-full h-full bg-bottom bg-cover bg-no-repeat pointer-events-none opacity-90 animate-kenburns-subtle"
        style={{
          backgroundImage: "url('/images/bg-city-light.webp')",
        }}
      />
      <div className="absolute inset-0 bg-[#D5D5D5]/20 pointer-events-none" />

      {/* Elegant flock of birds animation in the sky */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[5] overflow-hidden">
        <FlockOfBirds className="w-full h-full" speed={0.9} opacity={0.85} />
      </div>

      {/* Cinematic Camera Push-In Wrapper: Smooth 1.8s zoom glide upon opening */}
      <div
        className={`relative z-10 w-full flex flex-col items-center justify-center transition-all duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          !isOpeningCover && !isCoverOpened
            ? 'scale-[1.06] blur-[2px] opacity-90'
            : 'scale-100 blur-0 opacity-100'
        }`}
      >
        {/* Soft diffused glow & blur aura behind card to isolate text from background sketch */}
        <div className="absolute inset-0 max-w-[380px] sm:max-w-[460px] mx-auto rounded-full bg-white/50 blur-2xl pointer-events-none -z-10" />

        {/* Main Arch Frame matching Screenshot 1 - Responsive for Mobile & Desktop */}
        <div className="relative w-full max-w-[320px] sm:max-w-[360px] md:max-w-[430px] rounded-t-full rounded-b-[40px] md:rounded-b-[50px] bg-white/90 sm:bg-white/92 p-2.5 sm:p-3 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.08)] border border-white/95 backdrop-blur-xl flex flex-col items-center text-center my-auto transition-all reveal">
        
        {/* Photo Container with Arch top & bottom fade */}
        <div className="group relative w-full aspect-[4/5] rounded-t-full overflow-hidden shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/prewedding/hero-traditional.jpg"
            alt={`${brideName} & ${groomName}`}
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          {/* Gradient overlay matching Elementor .elementor-element-3674c9e4 */}
          <div
            className="absolute inset-0 pointer-events-none rounded-t-full"
            style={{
              background: 'linear-gradient(to bottom, rgba(68, 84, 110, 0) 36%, #44546E 100%)',
            }}
          />
        </div>

        {/* Text Content */}
        <div className="w-full pt-5 md:pt-7 pb-3 px-3 md:px-5 flex flex-col items-center">
          <p className="font-serif text-[12px] sm:text-[13px] md:text-[14px] tracking-[0.25em] uppercase text-[#2E3F54] font-medium reveal delay-100">
            The Wedding of
          </p>

          <h1 className="font-edensor text-[32px] sm:text-[38px] md:text-[44px] font-medium text-[#D7AC64] leading-tight my-1 drop-shadow-[1px_1px_1px_#FFFFFF] reveal delay-200">
            {brideName} &amp; {groomName}
          </h1>

          <p className="font-bodebeck text-[13px] sm:text-[14px] md:text-[15px] font-semibold text-[#40506B] mb-3.5 reveal delay-300">
            {settings.eventDate || 'Sabtu, 12 Desember 2026'}
          </p>

          <a
            href="#date"
            className="inline-flex items-center justify-center bg-[#4A5A74] hover:bg-[#D5AF6F] text-white font-bodebeck text-xs md:text-sm font-medium px-6 md:px-8 py-2 md:py-2.5 rounded-full transition-all duration-300 shadow-sm active:scale-95 reveal delay-400 cursor-pointer"
          >
            Save The Date
          </a>

          {/* Recipient badge */}
          {(guest || guestName) && (
            <div className="mt-4 pt-3 border-t border-slate-300/60 w-full reveal delay-500">
              <p className="text-[10px] md:text-[11px] font-bodebeck uppercase tracking-wider text-slate-500">
                Kepada Yth:
              </p>
              <p className="font-edensor text-base md:text-lg font-medium text-[#2E3F54]">
                {guest?.name || guestName}
              </p>
              {guest?.category && (
                <span className="inline-block mt-1 text-[9px] md:text-[10px] font-bodebeck uppercase tracking-wider text-[#40506B] bg-white/95 px-2.5 py-0.5 rounded-full border border-blue-100/80 shadow-xs">
                  {guest.category} &bull; {guest.tableOrSession || 'Regular'}
                </span>
              )}
            </div>
          )}

          {/* Mini countdown ticker */}
          <div className="mt-4 w-full grid grid-cols-4 gap-1.5 md:gap-2 pt-3 border-t border-slate-300/60 reveal delay-600">
            {countdownItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg md:rounded-xl bg-white/90 backdrop-blur-sm py-1.5 md:py-2 px-1 shadow-sm border border-white hover:scale-105 transition-transform"
              >
                <p
                  suppressHydrationWarning
                  className="font-edensor text-base md:text-xl font-semibold text-[#4A5A74] leading-none"
                >
                  {item.value}
                </p>
                <p className="text-[8px] md:text-[9px] font-bodebeck uppercase tracking-wider text-slate-500 mt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  </section>
  );
}
