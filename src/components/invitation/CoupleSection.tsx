'use client';

import React from 'react';
import { Instagram } from 'lucide-react';
import { WeddingSettings } from '@/lib/db';

interface CoupleSectionProps {
  groom: WeddingSettings['groom'];
  bride: WeddingSettings['bride'];
}

export default function CoupleSection({ groom, bride }: CoupleSectionProps) {
  return (
    <section className="relative w-full py-16 sm:py-24 md:py-32 px-4 overflow-hidden bg-white text-slate-800">
      
      {/* Background: Soft, subtle watercolor watermark (predominantly pure white) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-bottom bg-no-repeat pointer-events-none opacity-15 filter brightness-125 contrast-75"
        style={{
          backgroundImage: "url('/images/bg-mist.webp')",
        }}
      />

      {/* Heavy white gradient overlays ensuring text is 100% readable on pure white */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-white/90 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-[450px] md:max-w-4xl mx-auto text-center flex flex-col items-center">
        
        {/* Salam & Introduction - On pure white background for maximum contrast */}
        <div className="mb-10 md:mb-16 px-4 max-w-xl mx-auto reveal">
          <h2 className="font-edensor text-2xl sm:text-[30px] md:text-[36px] font-medium text-[#C28B36] tracking-wide mb-3 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
            Assalamu&apos;alaikum Wr. Wb
          </h2>
          <p className="font-bodebeck text-xs sm:text-[14px] md:text-base font-medium text-[#2E3F54] leading-relaxed max-w-md mx-auto">
            Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i serta kerabat sekalian untuk menghadiri acara pernikahan kami.
          </p>
        </div>

        {/* Couple Profiles - Responsive: Stacked on Mobile, Side-by-Side on Desktop */}
        <div className="w-full flex flex-col md:flex-row md:items-start md:justify-center md:gap-10 lg:gap-16">
          
          {/* Groom Profile matching Screenshot 2 */}
          <div className="flex flex-col items-center flex-1 w-full reveal delay-150">
            {/* Photo Frame matching .profil1 img with subtle Ken Burns drift on hover */}
            <div className="group relative w-[170px] h-[260px] md:w-[200px] md:h-[300px] rounded-[20px] overflow-hidden border-4 border-white shadow-[0_8px_30px_rgba(46,63,84,0.15)] bg-white transition-all duration-500 hover:shadow-[0_12px_36px_rgba(46,63,84,0.22)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={groom.photoUrl || "/images/groom.jpg"}
                alt={groom.fullName}
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <h3 className="font-edensor text-[26px] sm:text-[30px] md:text-[34px] font-medium text-[#1E293B] tracking-wide mt-4 md:mt-5">
              {groom.fullName}
            </h3>

            <p className="font-bodebeck text-xs sm:text-[13px] md:text-[14px] font-medium text-[#475569] mt-1 leading-relaxed">
              {groom.childOrder} dari {groom.fatherName}
              <br />
              &amp; {groom.motherName}
            </p>

            {groom.instagram && (
              <a
                href={groom.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Groom"
                className="mt-3.5 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#D5AF6F] hover:bg-[#2B3951] text-white shadow transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Separator "&" - Responsive */}
          <div className="my-8 md:my-0 md:self-center flex flex-col items-center justify-center reveal delay-250">
            <span className="font-edensor text-3xl md:text-5xl font-medium text-[#C28B36] select-none">
              &amp;
            </span>
          </div>

          {/* Bride Profile matching Screenshot 3 */}
          <div className="flex flex-col items-center flex-1 w-full reveal delay-350">
            {/* Photo Frame matching .profil1 img with subtle Ken Burns drift on hover */}
            <div className="group relative w-[170px] h-[260px] md:w-[200px] md:h-[300px] rounded-[20px] overflow-hidden border-4 border-white shadow-[0_8px_30px_rgba(46,63,84,0.15)] bg-white transition-all duration-500 hover:shadow-[0_12px_36px_rgba(46,63,84,0.22)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bride.photoUrl || "/images/bride.jpg"}
                alt={bride.fullName}
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <h3 className="font-edensor text-[26px] sm:text-[30px] md:text-[34px] font-medium text-[#1E293B] tracking-wide mt-4 md:mt-5">
              {bride.fullName}
            </h3>

            <p className="font-bodebeck text-xs sm:text-[13px] md:text-[14px] font-medium text-[#475569] mt-1 leading-relaxed">
              {bride.childOrder} dari {bride.fatherName}
              <br />
              &amp; {bride.motherName}
            </p>

            {bride.instagram && (
              <a
                href={bride.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Bride"
                className="mt-3.5 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#D5AF6F] hover:bg-[#2B3951] text-white shadow transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
