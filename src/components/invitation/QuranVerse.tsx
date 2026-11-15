'use client';

import React from 'react';

interface QuranVerseProps {
  surah?: string;
  translation?: string;
  groomInitial?: string;
  brideInitial?: string;
}

export default function QuranVerse({
  surah = "(Qs. Ar-Rum : 21)",
  translation = "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.",
  groomInitial = "R",
  brideInitial = "T",
}: QuranVerseProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[#4A5A74] text-white py-16 sm:py-24 md:py-32 px-5 sm:px-8 border-y border-blue-200/30">
      {/* Background sketch matching original Elementor BL-02-scaled-1-1.jpg with Ken Burns Breathing */}
      <div
        className="absolute inset-0 w-full h-full bg-bottom bg-cover bg-no-repeat pointer-events-none animate-kenburns-subtle"
        style={{
          backgroundImage: "url('/images/bg-verse.jpg')",
          backgroundColor: "#4A5A74",
        }}
      />

      {/* Subtle soft vignette gradients at top and bottom */}
      <div className="absolute inset-x-0 top-0 h-16 md:h-24 bg-gradient-to-b from-[#4A5A74]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 md:h-24 bg-gradient-to-t from-[#4A5A74]/80 to-transparent pointer-events-none" />

      {/* Content Container - Responsive */}
      <div className="relative z-10 mx-auto w-full max-w-[450px] md:max-w-2xl lg:max-w-3xl flex flex-col items-center text-center">
        
        {/* Monogram Wrapper with Blooming Flower Ornament */}
        <div className="relative w-[220px] sm:w-[260px] md:w-[320px] h-[130px] sm:h-[150px] md:h-[180px] flex items-center justify-center my-2 reveal-scale">
          {/* Flower Illustration (BB-1.webp) anchored dead center (left: 50%, translate-x: -50%) */}
          <div className="absolute -top-10 sm:-top-14 md:-top-16 left-1/2 -translate-x-1/2 w-28 sm:w-36 md:w-44 pointer-events-none z-0 flex items-center justify-center">
            {/* Inner animated floating element */}
            <div className="w-full h-auto animate-float-gentle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/flower-monogram.webp"
                alt="Floral monogram ornament"
                className="w-full h-auto object-contain select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform duration-700"
                loading="lazy"
              />
            </div>
          </div>

          {/* Monogram Text in authentic Edensor typography */}
          <h2 className="relative z-10 font-edensor text-[52px] sm:text-[65px] md:text-[80px] font-medium leading-none text-white tracking-wider select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] flex items-center justify-center">
            <span className="inline-block transition-transform duration-500 hover:scale-105">{brideInitial}</span>
            <span className="mx-2.5 sm:mx-3 md:mx-4 text-[0.85em] font-normal text-white/95">&amp;</span>
            <span className="inline-block transition-transform duration-500 hover:scale-105">{groomInitial}</span>
          </h2>
        </div>

        {/* Quran Verse Translation in authentic Bodebeck typography */}
        <div className="mt-6 sm:mt-8 md:mt-10 px-2 sm:px-6 reveal delay-200">
          <blockquote className="font-bodebeck text-sm sm:text-[15px] md:text-base italic font-normal leading-relaxed sm:leading-[1.85] md:leading-[2.1] text-white/95 select-none drop-shadow-sm tracking-wide">
            &#8220;{translation}&#8221;
          </blockquote>

          {/* Surah Reference */}
          <p className="mt-4 sm:mt-5 md:mt-6 font-bodebeck text-sm sm:text-[15px] md:text-base italic font-normal text-white/90 tracking-wide select-none reveal delay-300">
            {surah.startsWith('(') ? surah : `(${surah})`}
          </p>
        </div>

      </div>
    </section>
  );
}
