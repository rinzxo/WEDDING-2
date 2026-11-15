'use client';

import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Disc3 } from 'lucide-react';

export interface MusicPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void;
  isPlaying: boolean;
}

interface MusicPlayerProps {
  url?: string;
  autoPlay?: boolean;
  title?: string;
  startTime?: number;
}

const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(function MusicPlayer(
  {
    url = '/audio/sinarengan.mp3',
    autoPlay = false,
    startTime = 0,
  },
  ref
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const playMusic = async () => {
    if (!audioRef.current) return;
    try {
      if (startTime > 0 && audioRef.current.currentTime < 1) {
        audioRef.current.currentTime = startTime;
      }
      audioRef.current.volume = 0.75;
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const pauseMusic = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  useImperativeHandle(ref, () => ({
    play: playMusic,
    pause: pauseMusic,
    toggle: toggleMusic,
    isPlaying,
  }));

  useEffect(() => {
    if (autoPlay) {
      playMusic();
    }
  }, [autoPlay]);

  return (
    <>
      <audio
        ref={audioRef}
        src={url}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Circular Music Disc Icon Only (matching reference site spesial-03) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={toggleMusic}
          type="button"
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
          className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-slate-300/80 bg-white/95 text-[#4A5A74] hover:text-[#D7AC64] shadow-[0_4px_16px_rgba(0,0,0,0.18)] backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span
            className={`transition-transform duration-300 flex items-center justify-center ${
              isPlaying ? 'animate-spin-slow text-[#4A5A74]' : 'opacity-65 text-slate-500'
            }`}
          >
            <Disc3 size={24} className="stroke-[1.75]" />
          </span>
        </button>
      </div>
    </>
  );
});

export default MusicPlayer;
