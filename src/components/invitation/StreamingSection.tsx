'use client';

import React from 'react';
import { Video, Radio, Instagram } from 'lucide-react';
import { WeddingSettings } from '@/lib/db';

interface StreamingSectionProps {
  liveStream: WeddingSettings['liveStream'];
}

export default function StreamingSection({ liveStream }: StreamingSectionProps) {
  if (!liveStream?.enabled) return null;

  return (
    <section className="py-16 px-4 bg-[#f4f2ec] text-slate-800 text-center">
      <div className="max-w-xl mx-auto wedding-card p-8 border border-[#d7ac64]/40 shadow-lg relative overflow-hidden">
        
        {/* Pulsing Live indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 text-xs font-semibold mb-4 animate-pulse">
          <Radio className="w-3.5 h-3.5 text-red-600" />
          <span>LIVE STREAMING</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#404f6a] tracking-wide mb-3">
          {liveStream.title || "Siaran Virtual"}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light mb-6">
          Bagi keluarga dan sahabat yang tidak dapat hadir langsung di lokasi, kami mengundang Bapak/Ibu/Saudara/i untuk menyaksikan momen sakral pernikahan kami secara virtual:
        </p>

        <div className="bg-[#faf8f5] rounded-xl p-4 border border-slate-200/80 mb-6">
          <p className="text-xs font-semibold text-slate-700">
            {liveStream.time}
          </p>
          <p className="text-xs text-[#d7ac64] font-bold mt-1 tracking-wider">
            {liveStream.account}
          </p>
        </div>

        <a
          href={liveStream.url || "https://instagram.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full gold-button text-xs tracking-wider uppercase font-medium shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          <Instagram className="w-4 h-4" />
          <span>Tonton Live Streaming</span>
        </a>
      </div>
    </section>
  );
}

