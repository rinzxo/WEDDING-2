'use client';

import React, { useEffect, useRef } from 'react';

interface FlockOfBirdsProps {
  className?: string;
  speed?: number;
  opacity?: number;
}

export default function FlockOfBirds({
  className = '',
  speed = 0.95,
  opacity = 0.9,
}: FlockOfBirdsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: any = null;
    let isCancelled = false;

    // Load lottie-web dynamically on client only for distant ambient birds
    import('lottie-web').then((lottieModule) => {
      if (isCancelled || !containerRef.current) return;

      const lottie = lottieModule.default || lottieModule;
      if (typeof lottie.loadAnimation !== 'function') return;

      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/lottie/birds.json',
        rendererSettings: {
          preserveAspectRatio: 'xMidYMin meet',
          progressiveLoad: true,
          hideOnTransparent: true,
        },
      });

      anim.setSpeed(speed);
    }).catch((err) => {
      console.warn('Lottie failed to load birds animation:', err);
    });

    return () => {
      isCancelled = true;
      if (anim && typeof anim.destroy === 'function') {
        anim.destroy();
      }
    };
  }, [speed]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none relative w-full h-full overflow-hidden ${className}`}
    >
      {/* Ambient background city birds from original lottie */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: opacity * 0.7 }}
      />

      {/* =========================================================
          KEYFRAME STYLES FOR THE FLYING BIRD FLOCKS
          Pure CSS GPU-accelerated 60fps animations
          ========================================================= */}
      <style jsx>{`
        @keyframes fly-flock-primary {
          0% {
            transform: translate3d(-240px, 10px, 0);
            opacity: 0;
          }
          5% {
            opacity: 0.95;
          }
          88% {
            opacity: 0.95;
          }
          100% {
            transform: translate3d(calc(100vw + 240px), -12px, 0);
            opacity: 0;
          }
        }

        @keyframes fly-flock-distant {
          0% {
            transform: translate3d(-180px, 6px, 0) scale(0.65);
            opacity: 0;
          }
          6% {
            opacity: 0.75;
          }
          88% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(calc(100vw + 180px), -8px, 0) scale(0.65);
            opacity: 0;
          }
        }

        @keyframes bird-flap-1 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.42) translateY(-1px); }
        }

        @keyframes bird-flap-2 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4) translateY(-1px); }
        }

        @keyframes bird-flap-3 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.45) translateY(-1px); }
        }

        .flock-cluster-primary {
          position: absolute;
          top: 14px;
          left: 0;
          width: 190px;
          height: 50px;
          animation: fly-flock-primary 14s cubic-bezier(0.25, 1, 0.45, 1) infinite;
        }

        @media (min-width: 768px) {
          .flock-cluster-primary {
            top: 36px;
          }
        }

        .flock-cluster-distant {
          position: absolute;
          top: 4px;
          left: 0;
          width: 140px;
          height: 38px;
          animation: fly-flock-distant 16s cubic-bezier(0.25, 1, 0.45, 1) 7s infinite;
        }

        @media (min-width: 768px) {
          .flock-cluster-distant {
            top: 16px;
          }
        }

        .bird-node {
          position: absolute;
          transform-origin: center center;
          filter: drop-shadow(0 1.5px 2px rgba(46, 63, 84, 0.22));
        }

        .flap-1 { animation: bird-flap-1 0.58s ease-in-out infinite; }
        .flap-2 { animation: bird-flap-2 0.65s ease-in-out infinite 0.12s; }
        .flap-3 { animation: bird-flap-3 0.62s ease-in-out infinite 0.22s; }
        .flap-4 { animation: bird-flap-1 0.55s ease-in-out infinite 0.35s; }
        .flap-5 { animation: bird-flap-2 0.64s ease-in-out infinite 0.18s; }
      `}</style>

      {/* =========================================================
          FLOCK 1: Primary flock of 5 birds in natural V-echelon
          ========================================================= */}
      <div className="flock-cluster-primary pointer-events-none">
        {/* Bird 1: Lead Bird */}
        <div className="bird-node flap-1" style={{ left: 130, top: 10, width: 44, height: 24 }}>
          <svg viewBox="0 0 36 20" className="w-full h-full fill-[#203144]">
            <path d="M 1,14 C 7,10 12,2 18,7 C 24,2 29,10 35,14 C 29,11 23,12 18,17 C 13,12 7,11 1,14 Z" />
          </svg>
        </div>

        {/* Bird 2: Upper Follower */}
        <div className="bird-node flap-2" style={{ left: 85, top: 0, width: 38, height: 20 }}>
          <svg viewBox="0 0 36 20" className="w-full h-full fill-[#2A3D52]">
            <path d="M 1,14 C 7,10 12,2 18,7 C 24,2 29,10 35,14 C 29,11 23,12 18,17 C 13,12 7,11 1,14 Z" />
          </svg>
        </div>

        {/* Bird 3: Lower Follower */}
        <div className="bird-node flap-3" style={{ left: 80, top: 22, width: 36, height: 19 }}>
          <svg viewBox="0 0 36 20" className="w-full h-full fill-[#2A3D52]">
            <path d="M 1,14 C 7,10 12,2 18,7 C 24,2 29,10 35,14 C 29,11 23,12 18,17 C 13,12 7,11 1,14 Z" />
          </svg>
        </div>

        {/* Bird 4: Trail Upper */}
        <div className="bird-node flap-4" style={{ left: 35, top: 6, width: 30, height: 16 }}>
          <svg viewBox="0 0 36 20" className="w-full h-full fill-[#384C62]">
            <path d="M 1,14 C 7,10 12,2 18,7 C 24,2 29,10 35,14 C 29,11 23,12 18,17 C 13,12 7,11 1,14 Z" />
          </svg>
        </div>

        {/* Bird 5: Trail Lower */}
        <div className="bird-node flap-5" style={{ left: 0, top: 20, width: 26, height: 14 }}>
          <svg viewBox="0 0 36 20" className="w-full h-full fill-[#384C62]">
            <path d="M 1,14 C 7,10 12,2 18,7 C 24,2 29,10 35,14 C 29,11 23,12 18,17 C 13,12 7,11 1,14 Z" />
          </svg>
        </div>
      </div>

      {/* =========================================================
          FLOCK 2: Distant flock of 3 birds in higher sky
          ========================================================= */}
      <div className="flock-cluster-distant pointer-events-none">
        {/* Distant Bird 1 */}
        <div className="bird-node flap-3" style={{ left: 90, top: 8, width: 26, height: 14 }}>
          <svg viewBox="0 0 36 20" className="w-full h-full fill-[#384C62]">
            <path d="M 1,14 C 7,10 12,2 18,7 C 24,2 29,10 35,14 C 29,11 23,12 18,17 C 13,12 7,11 1,14 Z" />
          </svg>
        </div>

        {/* Distant Bird 2 */}
        <div className="bird-node flap-1" style={{ left: 52, top: 0, width: 22, height: 12 }}>
          <svg viewBox="0 0 36 20" className="w-full h-full fill-[#4A5E76]">
            <path d="M 1,14 C 7,10 12,2 18,7 C 24,2 29,10 35,14 C 29,11 23,12 18,17 C 13,12 7,11 1,14 Z" />
          </svg>
        </div>

        {/* Distant Bird 3 */}
        <div className="bird-node flap-5" style={{ left: 16, top: 16, width: 20, height: 11 }}>
          <svg viewBox="0 0 36 20" className="w-full h-full fill-[#4A5E76]">
            <path d="M 1,14 C 7,10 12,2 18,7 C 24,2 29,10 35,14 C 29,11 23,12 18,17 C 13,12 7,11 1,14 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
