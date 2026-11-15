'use client';

import React from 'react';

interface FooterSectionProps {
  groomName: string;
  brideName: string;
}

export default function FooterSection({ groomName, brideName }: FooterSectionProps) {
  return (
    <footer className="relative w-full overflow-hidden bg-white text-slate-800 pt-6 sm:pt-10 pb-16 sm:pb-24">
      
      {/* =========================================================
          COUPLE PREWEDDING PHOTO
          Seamless radial & multi-directional feathering melting 100% into white
          ========================================================= */}
      <div className="relative w-full max-w-[440px] md:max-w-3xl mx-auto overflow-hidden px-2 sm:px-4 reveal">
        
        {/* Photo Container with CSS Mask for 360-degree soft dissolving into white */}
        <div
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/8] overflow-hidden"
          style={{
            WebkitMaskImage: 'radial-gradient(ellipse 72% 62% at 50% 40%, rgba(0,0,0,1) 32%, rgba(0,0,0,0) 78%)',
            maskImage: 'radial-gradient(ellipse 72% 62% at 50% 40%, rgba(0,0,0,1) 32%, rgba(0,0,0,0) 78%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/prewedding/gallery-casual-stand.jpg"
            alt={`${brideName} & ${groomName}`}
            className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out hover:scale-105"
            loading="lazy"
          />

          {/* Directional Gradient Overlays to guarantee zero visible edges */}
          {/* Top smooth fade */}
          <div
            className="absolute inset-x-0 top-0 h-16 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
            }}
          />

          {/* Bottom smooth fade melting into text */}
          <div
            className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, #FFFFFF 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0) 100%)',
            }}
          />

          {/* Left smooth fade */}
          <div
            className="absolute inset-y-0 left-0 w-16 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
            }}
          />

          {/* Right smooth fade */}
          <div
            className="absolute inset-y-0 right-0 w-16 pointer-events-none"
            style={{
              background: 'linear-gradient(to left, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
            }}
          />
        </div>

      </div>

      {/* =========================================================
          CONTENT CONTAINER
          Flows seamlessly from the photo to pure clean white
          ========================================================= */}
      <div className="relative z-10 max-w-[450px] md:max-w-3xl mx-auto px-4 -mt-4 sm:-mt-6 text-center flex flex-col items-center">
        
        {/* "Terimakasih" in cursive script matching Screenshot 11 */}
        <h2 className="font-script text-4xl sm:text-5xl md:text-6xl text-[#D7AC64] select-none my-3 md:my-5 drop-shadow-sm reveal delay-100">
          Terimakasih
        </h2>

        {/* Paragraph */}
        <p className="font-bodebeck text-xs sm:text-[14px] md:text-base text-[#40506B] leading-relaxed max-w-xs md:max-w-lg mx-auto my-3 md:my-4 reveal delay-200">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.
        </p>

        {/* "Wassalamu'alaikum Wr. Wb." */}
        <p className="font-edensor text-lg sm:text-xl md:text-2xl font-medium text-[#D7AC64] tracking-wide mt-2 md:mt-3 drop-shadow-[1px_1px_1px_#FFFFFF] reveal delay-300">
          Wassalamu&apos;alaikum Wr. Wb.
        </p>

        {/* "Tika & Ridho" */}
        <h3 className="font-edensor text-3xl sm:text-[36px] md:text-[42px] font-medium text-[#4A5A74] tracking-wide mt-2 md:mt-3 mb-2 reveal delay-400">
          {brideName} &amp; {groomName}
        </h3>

      </div>

    </footer>
  );
}
