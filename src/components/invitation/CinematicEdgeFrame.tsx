'use client';

import React from 'react';

export default function CinematicEdgeFrame() {
  const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <div className="cinematic-edge-frame pointer-events-none" aria-hidden="true">
      <div className="cinematic-edge-rail cinematic-edge-rail-left">
        <span className="cinematic-edge-sweep" />
      </div>
      <div className="cinematic-edge-rail cinematic-edge-rail-right">
        <span className="cinematic-edge-sweep" />
      </div>
      {corners.map((corner) => (
        <span key={corner} className={`cinematic-edge-corner cinematic-edge-corner-${corner}`}>
          <span className="cinematic-edge-culinary-line" />
          <span className="cinematic-edge-ledger-line" />
          <span className="cinematic-edge-accent" />
        </span>
      ))}
    </div>
  );
}

