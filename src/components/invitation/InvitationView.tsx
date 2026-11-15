'use client';

import React, { useRef, useState } from 'react';
import CinematicEdgeFrame from '@/components/invitation/CinematicEdgeFrame';
import CoverModal from '@/components/invitation/CoverModal';
import MusicPlayer, { MusicPlayerHandle } from '@/components/invitation/MusicPlayer';
import HeroSection from '@/components/invitation/HeroSection';
import QuranVerse from '@/components/invitation/QuranVerse';
import CoupleSection from '@/components/invitation/CoupleSection';
import EventsSection from '@/components/invitation/EventsSection';
import LoveStorySection from '@/components/invitation/LoveStorySection';
import GallerySection from '@/components/invitation/GallerySection';
import DigitalGiftSection from '@/components/invitation/DigitalGiftSection';
import RSVPSection from '@/components/invitation/RSVPSection';
import QRCodeTicketSection from '@/components/invitation/QRCodeTicketSection';
import FooterSection from '@/components/invitation/FooterSection';
import ScrollRevealObserver from '@/components/invitation/ScrollRevealObserver';
import { WeddingSettings, Guest, Wish } from '@/lib/db';

interface InvitationViewProps {
  settings: WeddingSettings;
  guest: Guest | null;
  wishes: Wish[];
}

export default function InvitationView({ settings, guest, wishes }: InvitationViewProps) {
  const musicRef = useRef<MusicPlayerHandle | null>(null);

  // Cover opening states for cinematic camera push-in
  const [isOpeningCover, setIsOpeningCover] = useState(false);
  const [isCoverOpened, setIsCoverOpened] = useState(false);

  // RSVP confirmed state: unlocks the QR code ticket pass!
  const [rsvpConfirmed, setRsvpConfirmed] = useState<boolean>(
    guest?.rsvpStatus === 'attending' || Boolean(guest?.rsvpAt)
  );

  const handleOpeningCover = () => {
    setIsOpeningCover(true);
    try {
      musicRef.current?.play()?.catch(() => {
        // Safe catch for browser autoplay policies
      });
    } catch (e) {
      console.warn("Music play blocked:", e);
    }
  };

  const handleOpenCover = () => {
    setIsCoverOpened(true);
  };

  const handleRsvpConfirmed = (confirmed: boolean) => {
    setRsvpConfirmed(confirmed);
  };

  const groomName = settings.groom.nickname || 'Ridho';
  const brideName = settings.bride.nickname || 'Tika';
  const guestDisplayName = guest?.name || 'Tamu Undangan';

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a] relative selection:bg-blue-200 selection:text-blue-900 flex justify-center">

      {/* Scroll Reveal Observer for .reveal and .af */}
      <ScrollRevealObserver />

      {/* Welcome Cover Modal (matching Screenshot 1 & special-03) */}
      <CoverModal
        groomName={groomName}
        brideName={brideName}
        guestName={guestDisplayName}
        onOpening={handleOpeningCover}
        onOpen={handleOpenCover}
      />

      {/* Background Music Player (floating pill with spinning disc) */}
      <MusicPlayer
        ref={musicRef}
        url={settings.music.url || '/audio/wedding-song.mp3'}
        title={settings.music.title}
        autoPlay={false}
      />

      {/* Main Full-Width Responsive Container */}
      <main className="w-full relative overflow-x-hidden flex flex-col bg-white">

        {/* 1. Hero Section (3-photo rotating strip, display typography, countdown, recipient banner) */}
        <HeroSection
          settings={settings}
          guest={guest}
          isOpeningCover={isOpeningCover}
          isCoverOpened={isCoverOpened}
        />

        {/* 2. Monogram & Quran Verse (Ar-Rum : 21 with floral monogram) */}
        <QuranVerse
          surah={settings.quranVerse.surah}
          translation={settings.quranVerse.translation}
          groomInitial={groomName.charAt(0) || 'R'}
          brideInitial={brideName.charAt(0) || 'T'}
        />

        {/* 3. Couple Profile (Assalamu'alaikum Wr. Wb, Groom & Bride profiles matching Screenshots 2 & 3) */}
        <CoupleSection groom={settings.groom} bride={settings.bride} />

        {/* 4. Rangkaian Acara (Akad Nikah & Resepsi cards matching Screenshots 4 & 5) */}
        <EventsSection events={settings.events} eventDate={settings.eventDate} />

        {/* 3. Love Story (interactive chapters 01, 02, 03 with photo preview & description) */}
        <LoveStorySection stories={settings.loveStory} />

        {/* 4. The Story / Our Moments Gallery (3x3 Parallax photo frames with rotating active color) */}
        <GallerySection photos={settings.gallery} />

        {/* 5. Wedding Gift (Amplop Digital & Kado Fisik modal with copyable bank accounts) */}
        <DigitalGiftSection gifts={settings.digitalGifts} />

        {/* 6. RSVP Kehadiran & Live Wishes Feed (Attending / Declined, Stepper, Doa & Ucapan) */}
        <RSVPSection
          guest={guest}
          initialWishes={wishes}
          rsvpConfirmed={rsvpConfirmed}
          onRsvpConfirmed={handleRsvpConfirmed}
        />

        {/* 7. Dynamic QR Code Ticket Pass (Locked until RSVP is confirmed, Download Pass button) */}
        <QRCodeTicketSection
          guest={guest}
          groomName={groomName}
          brideName={brideName}
          eventDate={settings.eventDate}
          venueName={settings.events.akad.venue}
          rsvpConfirmed={rsvpConfirmed}
        />

        {/* 8. Footer (Thank you note, monogram, credit, admin link) */}
        <FooterSection groomName={groomName} brideName={brideName} />

      </main>
    </div>
  );
}
