'use client';

import React from 'react';
import { WeddingSettings } from '@/lib/db';

interface LoveStorySectionProps {
  stories?: WeddingSettings['loveStory'];
}

export default function LoveStorySection({ stories }: LoveStorySectionProps) {
  const defaultStories = [
    {
      title: 'Awal Cerita',
      description:
        'Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Tanpa disadari, kebersamaan itu tumbuh menjadi rasa nyaman yang semakin kuat dari hari ke hari.',
    },
    {
      title: 'Lamaran',
      description:
        'Dengan niat yang tulus dan restu keluarga, kami memutuskan untuk melangkah ke tahap yang lebih serius. Momen lamaran menjadi awal dari perjalanan baru yang penuh harapan dan doa baik.',
    },
    {
      title: 'Pernikahan',
      description:
        'Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh cinta, kebahagiaan, dan keberkahan.',
    },
  ];

  const storyItems = stories && stories.length > 0 ? stories : defaultStories;

  return (
    <section className="relative w-full py-16 sm:py-24 md:py-32 px-4 bg-[#4A5A74] text-slate-800 overflow-hidden">
      {/* Background sketch matching original Elementor BL-02-scaled-1-1.jpg */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-bottom bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/images/bg-verse.jpg')",
          backgroundColor: "#4A5A74",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-16 md:h-24 bg-gradient-to-b from-[#4A5A74]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 md:h-24 bg-gradient-to-t from-[#4A5A74]/80 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-[360px] md:max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Main Love Story Card matching Screenshots 6 & 7 - Responsive */}
        <div className="w-full rounded-[28px] md:rounded-[36px] overflow-hidden bg-white shadow-[0_12px_36px_rgba(0,0,0,0.3)] relative p-6 sm:p-8 md:p-12 text-center flex flex-col items-center reveal">
          
          {/* Background misty landscape inside card matching Elementor Picture3-1-1-1.webp */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat pointer-events-none opacity-85"
            style={{
              backgroundImage: "url('/images/bg-mist.webp')",
            }}
          />

          <div className="relative z-10 w-full flex flex-col items-center">
            
            {/* Title: LOVE Story */}
            <div className="flex flex-col items-center mb-6 md:mb-10 reveal delay-100">
              <h3 className="font-edensor text-[26px] sm:text-[30px] md:text-[34px] font-medium tracking-[0.25em] text-[#D7AC64] uppercase drop-shadow-[1px_1px_1px_#FFFFFF]">
                LOVE
              </h3>
              <span className="font-script text-4xl sm:text-5xl md:text-6xl text-[#40506B] -mt-3.5 select-none">
                Story
              </span>
            </div>

            {/* Responsive Content: Stacked on Mobile, Side-by-Side on Desktop */}
            <div className="w-full flex flex-col md:grid md:grid-cols-2 md:gap-10 md:items-center">
              
              {/* Couple Prewedding Photo in rounded frame with soft hover zoom */}
              <div className="group w-full max-w-[280px] md:max-w-none aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white shadow-md mx-auto mb-6 md:mb-0 bg-slate-100 reveal delay-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/prewedding/gallery-casual-flowers.jpg"
                  alt="Love Story Tika & Ridho"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Sequential Stories matching Screenshot 7 */}
              <div className="w-full space-y-6 md:space-y-8 text-center md:text-left px-1">
                {storyItems.map((story, storyIdx) => (
                  <div
                    key={story.title}
                    className={`flex flex-col items-center md:items-start reveal ${
                      storyIdx === 0 ? 'delay-200' : storyIdx === 1 ? 'delay-300' : 'delay-400'
                    }`}
                  >
                    <h4 className="font-edensor text-base sm:text-lg md:text-xl font-medium text-[#D7AC64] drop-shadow-[1px_1px_1px_#FFFFFF] mb-1">
                      {story.title}
                    </h4>
                    <p className="font-bodebeck text-xs md:text-sm leading-relaxed text-[#40506B] italic max-w-[320px] md:max-w-none">
                      {story.description}
                    </p>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
