'use client';

import React, { useState } from 'react';

interface CoverModalProps {
  groomName: string;
  brideName: string;
  guestName?: string;
  onOpen: () => void;
  onOpening?: () => void;
}

export default function CoverModal({
  groomName = "Ridho",
  brideName = "Tika",
  guestName = "Nama Tamu",
  onOpen,
  onOpening,
}: CoverModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenInvitation = () => {
    if (isOpening || isOpen) return;
    setIsOpening(true);
    try {
      if (onOpening) onOpening();
    } catch (err) {
      console.warn('onOpening error:', err);
    }
    try {
      if (onOpen) onOpen();
    } catch (err) {
      console.warn('onOpen error:', err);
    }
    setTimeout(() => {
      setIsOpen(true);
    }, 1200); // 1.2s matching smooth glide transition
  };

  if (isOpen) return null;

  return (
    <div
      id="cover-fullscreen-overlay"
      className={`fixed inset-0 z-50 w-full h-[100svh] overflow-hidden p-0 m-0 select-none ${
        isOpening ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Full-bleed edge-to-edge container: Zero gap on all devices */}
      <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden bg-[#2E3F54]">

        {/* =========================================================
            BAGIAN KIRI (DESKTOP) / ATAS (MOBILE): FOTO MEMPELAI
            Responsive height & width, zero gap, smooth glide
            ========================================================= */}
        <div
          className={`w-full md:w-1/2 h-[45%] sm:h-[48%] md:h-full relative overflow-hidden bg-slate-900 border-b md:border-b-0 md:border-r border-[#D7AC64]/40 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpening
              ? '-translate-y-full md:translate-y-0 md:-translate-x-full opacity-0'
              : 'translate-y-0 md:translate-x-0 opacity-100'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/prewedding/cover.jpg"
            alt={`${brideName} & ${groomName}`}
            className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-105"
          />

          {/* Gentle vignette to blend cleanly with text panel */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-[#2E3F54]/60 pointer-events-none" />
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />

          {/* Golden edge seam highlight on desktop border */}
          <div className="hidden md:block absolute top-0 right-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#D7AC64]/80 to-transparent shadow-[0_0_8px_#D7AC64]" />
        </div>

        {/* =========================================================
            BAGIAN KANAN (DESKTOP) / BAWAH (MOBILE): NAMA & UNDANGAN
            Responsive padding & font size: NEVER cut off on mobile
            ========================================================= */}
        <div
          className={`w-full md:w-1/2 h-[55%] sm:h-[52%] md:h-full relative flex flex-col justify-center items-center text-center px-4 py-4 sm:p-8 md:p-14 lg:p-20 bg-[#2E3F54] text-white border-t md:border-t-0 md:border-l border-[#D7AC64]/40 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${
            isOpening
              ? 'translate-y-full md:translate-y-0 md:translate-x-full opacity-0'
              : 'translate-y-0 md:translate-x-0 opacity-100'
          }`}
        >
          {/* Subtle misty texture in background */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none opacity-20"
            style={{
              backgroundImage: "url('/images/bg-mist.webp')",
            }}
          />

          {/* Golden edge seam highlight on desktop border */}
          <div className="hidden md:block absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#D7AC64]/80 to-transparent shadow-[0_0_8px_#D7AC64]" />

          {/* Content Wrapper centered perfectly */}
          <div className="relative z-10 w-full max-w-sm md:max-w-md my-auto flex flex-col items-center">
            
            {/* Top Eyebrow */}
            <p className="font-serif text-[10px] sm:text-xs md:text-sm tracking-[0.3em] uppercase text-[#D7AC64] font-medium drop-shadow-sm mb-1 sm:mb-2">
              The Wedding of
            </p>

            {/* Couple Names */}
            <h1 className="font-edensor text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-wide leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] my-0.5 sm:my-1">
              {brideName}
              <span className="block font-serif text-xl sm:text-2xl md:text-3xl text-[#D7AC64] my-0.5 sm:my-1 font-normal">&amp;</span>
              {groomName}
            </h1>

            {/* Divider & Date */}
            <div className="w-16 sm:w-20 md:w-24 h-px bg-[#D7AC64]/60 my-2 sm:my-3" />
            <p className="font-bodebeck text-[11px] sm:text-xs md:text-sm text-slate-300 tracking-wider mb-2 sm:mb-4">
              Sabtu, 12 Desember 2026
            </p>

            {/* Recipient */}
            <p className="font-bodebeck text-[10px] sm:text-xs text-slate-300 font-light mb-0.5">
              Kepada Yth. Bapak/Ibu/Saudara/i:
            </p>
            <h2 className="font-edensor text-lg sm:text-xl md:text-2xl font-medium text-white tracking-wide mb-3 sm:mb-5 drop-shadow-sm">
              {guestName}
            </h2>

            {/* Buka Undangan Button - Perfectly sized, never overflowing */}
            <button
              onClick={handleOpenInvitation}
              type="button"
              className="group inline-flex items-center justify-center gap-2 px-7 py-2.5 sm:px-8 sm:py-3 rounded-full bg-[#D7AC64] hover:bg-[#c99e56] text-[#1e293b] font-bodebeck text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(215,172,100,0.4)] hover:shadow-[0_6px_25px_rgba(215,172,100,0.55)] hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <span>Buka Undangan</span>
              <span className="text-xs sm:text-sm font-bold transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </button>
          </div>

        </div>

        {/* =========================================================
            CINEMATIC GOLDEN LIGHT LEAK & ANAMORPHIC FLARE
            Ignites brilliantly across the seam when doors part
            ========================================================= */}
        {isOpening && (
          <>
            {/* Desktop Vertical Golden Beam & Lens Flare */}
            <div className="hidden md:block absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {/* Vertical core laser seam */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-b from-transparent via-[#FFF8DE] to-transparent shadow-[0_0_20px_#FFE296,0_0_40px_#D7AC64] animate-pulse" />
              {/* Horizontal anamorphic lens flare beam */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[3px] bg-gradient-to-r from-transparent via-[#FFF8DE] to-transparent blur-[1px] shadow-[0_0_30px_#D7AC64] animate-flare-burst" />
              {/* Center radiant sunburst glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-r from-[#FFF3D1]/80 via-[#D7AC64]/30 to-transparent blur-xl animate-flare-burst" />
            </div>

            {/* Mobile Horizontal Golden Seam & Lens Flare */}
            <div className="md:hidden absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {/* Horizontal core laser seam */}
              <div className="absolute left-0 right-0 top-[45%] -translate-y-1/2 h-[3px] w-full bg-gradient-to-r from-transparent via-[#FFF8DE] to-transparent shadow-[0_0_20px_#FFE296,0_0_40px_#D7AC64] animate-pulse" />
              {/* Vertical lens flare beam */}
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[3px] bg-gradient-to-b from-transparent via-[#FFF8DE] to-transparent blur-[1px] shadow-[0_0_30px_#D7AC64] animate-flare-burst" />
              {/* Center radiant sunburst glow */}
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-gradient-to-r from-[#FFF3D1]/80 via-[#D7AC64]/30 to-transparent blur-lg animate-flare-burst" />
            </div>
          </>
        )}

      </div>
    </div>
  );
}
