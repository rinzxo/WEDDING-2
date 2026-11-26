'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryConfig, GalleryItem } from '@/lib/db';

interface GallerySectionProps {
  photos?: string[];
  items?: GalleryItem[];
  config?: GalleryConfig;
}

export default function GallerySection({
  photos = [],
  items,
  config,
}: GallerySectionProps) {
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

  // Resolve active gallery list & apply admin maxPhotos limit if set
  const allPhotos: string[] =
    photos && photos.length > 0
      ? photos
      : items && items.length > 0
      ? items.map((it) => it.url)
      : defaultPhotos;

  const maxLimit = config?.maxPhotos && config.maxPhotos > 0 ? config.maxPhotos : allPhotos.length;
  const activePhotos = allPhotos.slice(0, maxLimit);

  // Active configuration defaults
  const activeLayout = config?.layout || 'editorial';
  const colsDesktop = config?.columnsDesktop || 3;
  const colsMobile = config?.columnsMobile || 2;
  const gapSize = config?.gap || 'md';
  const aspectRatio = config?.aspectRatio || 'original';

  const gapClass =
    gapSize === 'sm'
      ? 'gap-3 sm:gap-3.5'
      : gapSize === 'lg'
      ? 'gap-6 sm:gap-8'
      : 'gap-4 sm:gap-5';

  const spaceYClass =
    gapSize === 'sm'
      ? 'space-y-3 sm:space-y-3.5'
      : gapSize === 'lg'
      ? 'space-y-6 sm:space-y-8'
      : 'space-y-4 sm:space-y-5';

  const getAspectClass = (itemSpan?: string) => {
    if (aspectRatio === 'square') return 'aspect-square';
    if (aspectRatio === 'portrait') return 'aspect-[3/4]';
    if (aspectRatio === 'landscape') return 'aspect-[4/3]';
    return itemSpan === 'wide' ? 'aspect-[16/10]' : 'aspect-auto';
  };

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! + 1) % activePhotos.length);
  }, [selectedIndex, activePhotos.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! - 1 + activePhotos.length) % activePhotos.length);
  }, [selectedIndex, activePhotos.length]);

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
      {/* Background misty mountain landscape matching original design */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-bottom bg-no-repeat pointer-events-none opacity-60"
        style={{
          backgroundImage: "url('/images/bg-mist.webp')",
        }}
      />

      <div className="relative z-10 max-w-[450px] md:max-w-5xl mx-auto flex flex-col items-center">
        {/* Title */}
        <h2 className="font-edensor text-2xl sm:text-3xl md:text-4xl font-medium text-[#D7AC64] tracking-wide text-center mb-8 md:mb-12 drop-shadow-[1px_1px_1px_#FFFFFF] reveal">
          Galeri Foto
        </h2>

        {/* =========================================================
            1. MASONRY LAYOUT
            ========================================================= */}
        {activeLayout === 'masonry' && (
          <div className="w-full">
            <div
              className={`w-full ${
                colsMobile === 1 ? 'columns-1' : 'columns-2'
              } ${
                colsDesktop === 2
                  ? 'md:columns-2'
                  : colsDesktop === 4
                  ? 'md:columns-4'
                  : 'md:columns-3'
              } ${gapClass} ${spaceYClass}`}
            >
              {activePhotos.map((src, i) => {
                const item = items?.[i];
                return (
                  <div
                    key={`${src}-${i}`}
                    onClick={() => setSelectedIndex(i)}
                    className="break-inside-avoid w-full rounded-[20px] overflow-hidden shadow-md hover:shadow-xl border-2 border-white bg-slate-100 cursor-pointer group transition-all duration-300 hover:scale-[1.015] reveal"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={item?.caption || `Galeri Tika & Ridho ${i + 1}`}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            2. UNIFORM / GEOMETRIC GRID LAYOUT
            ========================================================= */}
        {activeLayout === 'grid' && (
          <div className="w-full">
            <div
              className={`grid w-full ${
                colsMobile === 1 ? 'grid-cols-1' : 'grid-cols-2'
              } ${
                colsDesktop === 2
                  ? 'md:grid-cols-2'
                  : colsDesktop === 4
                  ? 'md:grid-cols-4'
                  : 'md:grid-cols-3'
              } ${gapClass}`}
            >
              {activePhotos.map((src, i) => {
                const item = items?.[i];
                const isWide = item?.span === 'wide';
                return (
                  <div
                    key={`${src}-${i}`}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full rounded-[20px] overflow-hidden shadow-md hover:shadow-xl border-2 border-white bg-slate-100 cursor-pointer group transition-all duration-300 hover:scale-[1.02] ${
                      isWide ? 'col-span-2' : ''
                    } ${getAspectClass(item?.span)} reveal`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={item?.caption || `Galeri Tika & Ridho ${i + 1}`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            3. EDITORIAL MAGAZINE LAYOUT (DEFAULT)
            Dynamic rhythmic collage: Hero banner, pairs, triplets
            ========================================================= */}
        {activeLayout === 'editorial' && (
          <div className="w-full">
            {/* Mobile View (< md) */}
            <div className="w-full flex flex-col gap-3.5 md:hidden">
              {activePhotos.map((src, i) => {
                const item = items?.[i];
                const isEvenRow = i % 3 === 0;

                // Alternate between full-width banner and 2-column paired photos
                if (isEvenRow || i === 0) {
                  return (
                    <div
                      key={`${src}-${i}`}
                      onClick={() => setSelectedIndex(i)}
                      className="w-full aspect-[16/10] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={item?.caption || `Galeri Tika & Ridho ${i + 1}`}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    </div>
                  );
                }

                // If next item also exists in pair, render together in grid-cols-2
                if (i % 3 === 1) {
                  const nextSrc = activePhotos[i + 1];
                  const nextItem = items?.[i + 1];
                  return (
                    <div key={`pair-${i}`} className="grid grid-cols-2 gap-3.5 w-full">
                      <div
                        onClick={() => setSelectedIndex(i)}
                        className="w-full aspect-[3/4] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={item?.caption || `Galeri Tika & Ridho ${i + 1}`}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      </div>
                      {nextSrc && (
                        <div
                          onClick={() => setSelectedIndex(i + 1)}
                          className="w-full aspect-[3/4] rounded-[18px] overflow-hidden shadow-md border-2 border-white bg-slate-100 cursor-pointer group reveal"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={nextSrc}
                            alt={nextItem?.caption || `Galeri Tika & Ridho ${i + 2}`}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Desktop Masonry Columns View (>= md) */}
            <div className="hidden md:block w-full">
              <div
                className={`columns-2 lg:columns-3 ${gapClass} ${spaceYClass}`}
              >
                {activePhotos.map((src, i) => {
                  const item = items?.[i];
                  return (
                    <div
                      key={`${src}-${i}`}
                      onClick={() => setSelectedIndex(i)}
                      className="break-inside-avoid w-full rounded-[22px] overflow-hidden shadow-lg border-2 border-white bg-slate-100 cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl reveal"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={item?.caption || `Galeri Tika & Ridho ${i + 1}`}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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
              {selectedIndex + 1} / {activePhotos.length}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
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
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
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
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
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
              src={activePhotos[selectedIndex]}
              alt={`Galeri Tika & Ridho ${selectedIndex + 1}`}
              className="w-full h-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
