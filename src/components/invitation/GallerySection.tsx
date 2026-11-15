'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GallerySectionProps {
  photos?: string[];
}

export default function GallerySection({ photos = [] }: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const defaultPhotos = [
    '/images/prewedding/gallery-blue-stairs-wide.jpg',
    '/images/prewedding/gallery-blue-arch.jpg',
    '/images/prewedding/gallery-blue-stairs-hands.jpg',
    '/images/prewedding/gallery-casual-stand.jpg',
    '/images/prewedding/gallery-lamaran.jpg',
    '/images/prewedding/gallery-casual-flowers.jpg',
    '/images/prewedding/gallery-traditional-kneel.jpg',
    '/images/prewedding/gallery-traditional-chair.jpg',
    '/images/prewedding/story-college.jpg',
    '/images/prewedding/cover.jpg',
  ];

  const galleryList = photos.length > 0 ? photos : defaultPhotos;

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! + 1) % galleryList.length);
  }, [selectedIndex, galleryList.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! - 1 + galleryList.length) % galleryList.length);
  }, [selectedIndex, galleryList.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleClose, handleNext, handlePrev]);

  return (
    <section className="relative w-full py-16 sm:py-24 md:py-32 px-4 bg-white text-slate-800 overflow-hidden">
      {/* Background misty mountain landscape matching original Elementor Picture3-1-1-1.webp */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-bottom bg-no-repeat pointer-events-none opacity-60"
        style={{
          backgroundImage: "url('/images/bg-mist.webp')",
        }}
      />

      <div className="relative z-10 max-w-[450px] md:max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Title matching Screenshot 8 */}
        <h2 className="font-edensor text-2xl sm:text-3xl md:text-4xl font-medium text-[#D7AC64] tracking-wide text-center mb-8 md:mb-12 drop-shadow-[1px_1px_1px_#FFFFFF] reveal">
          Galeri Foto
        </h2>

        {/* =========================================================
            MOBILE GALLERY GRID (< md)
            Structured rhythm showcasing all 10 authentic prewedding photos
            ========================================================= */}
        <div className="w-full flex flex-col gap-3.5 md:hidden">
          
          {/* Row 1: Large Wide Photo (Stairs Wide) */}
          {galleryList[0] && (
            <div
              onClick={() => setSelectedIndex(0)}
              className="w-full aspect-[16/10] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal delay-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryList[0]}
                alt="Galeri Tika & Ridho 1"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </div>
          )}

          {/* Row 2: Two Vertical Photos Side-by-Side (Blue Arch & Hands) */}
          {(galleryList[1] || galleryList[2]) && (
            <div className="grid grid-cols-2 gap-3.5 w-full">
              {galleryList[1] && (
                <div
                  onClick={() => setSelectedIndex(1)}
                  className="w-full aspect-[3/4] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal delay-150"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryList[1]}
                    alt="Galeri Tika & Ridho 2"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
              )}
              {galleryList[2] && (
                <div
                  onClick={() => setSelectedIndex(2)}
                  className="w-full aspect-[3/4] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal delay-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryList[2]}
                    alt="Galeri Tika & Ridho 3"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}

          {/* Row 3: Medium Wide Photo (Casual Stand) */}
          {galleryList[3] && (
            <div
              onClick={() => setSelectedIndex(3)}
              className="w-full aspect-[16/10] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal delay-250"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryList[3]}
                alt="Galeri Tika & Ridho 4"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </div>
          )}

          {/* Row 4: Two Photos Side-by-Side (Lamaran & Casual Flowers) */}
          {(galleryList[4] || galleryList[5]) && (
            <div className="grid grid-cols-2 gap-3.5 w-full">
              {galleryList[4] && (
                <div
                  onClick={() => setSelectedIndex(4)}
                  className="w-full aspect-[3/4] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal delay-300"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryList[4]}
                    alt="Galeri Tika & Ridho 5"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
              )}
              {galleryList[5] && (
                <div
                  onClick={() => setSelectedIndex(5)}
                  className="w-full aspect-[3/4] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal delay-350"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryList[5]}
                    alt="Galeri Tika & Ridho 6"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}

          {/* Row 5: Two Photos Side-by-Side (Traditional Kneel & Chair) */}
          {(galleryList[6] || galleryList[7]) && (
            <div className="grid grid-cols-2 gap-3.5 w-full">
              {galleryList[6] && (
                <div
                  onClick={() => setSelectedIndex(6)}
                  className="w-full aspect-[3/4] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal delay-400"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryList[6]}
                    alt="Galeri Tika & Ridho 7"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
              )}
              {galleryList[7] && (
                <div
                  onClick={() => setSelectedIndex(7)}
                  className="w-full aspect-[3/4] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal delay-450"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryList[7]}
                    alt="Galeri Tika & Ridho 8"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}

          {/* Row 6: Two Photos Side-by-Side (College / Story & Cover Casual) */}
          {(galleryList[8] || galleryList[9]) && (
            <div className="grid grid-cols-2 gap-3.5 w-full">
              {galleryList[8] && (
                <div
                  onClick={() => setSelectedIndex(8)}
                  className="w-full aspect-[3/4] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal delay-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryList[8]}
                    alt="Galeri Tika & Ridho 9"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
              )}
              {galleryList[9] && (
                <div
                  onClick={() => setSelectedIndex(9)}
                  className="w-full aspect-[3/4] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal delay-550"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryList[9]}
                    alt="Galeri Tika & Ridho 10"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* =========================================================
            DESKTOP MASONRY GALLERY (>= md)
            Displays ALL 10 photos naturally without cropping or limits
            ========================================================= */}
        <div className="hidden md:block w-full">
          <div className="columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryList.map((src, i) => (
              <div
                key={`${src}-${i}`}
                onClick={() => setSelectedIndex(i)}
                className="break-inside-avoid w-full rounded-[22px] overflow-hidden shadow-lg border-2 border-white bg-slate-100 cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl reveal"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Galeri Tika & Ridho ${i + 1}`}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* =========================================================
          LIGHTBOX MODAL WITH FULL NAVIGATION CONTROLS
          ========================================================= */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300 select-none"
          onClick={handleClose}
        >
          {/* Top Control Bar */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 max-w-4xl mx-auto text-white">
            <span className="font-bodebeck text-xs sm:text-sm tracking-wider text-slate-300">
              {selectedIndex + 1} / {galleryList.length}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
              aria-label="Tutup foto"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Left / Prev Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Right / Next Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
            aria-label="Foto berikutnya"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Image Container */}
          <div
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryList[selectedIndex]}
              alt={`Galeri Tika & Ridho ${selectedIndex + 1}`}
              className="w-full h-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
