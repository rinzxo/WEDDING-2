'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, X, MessageCircle } from 'lucide-react';
import { Guest, Wish } from '@/lib/db';

interface RSVPSectionProps {
  guest: Guest | null;
  initialWishes: Wish[];
  rsvpConfirmed: boolean;
  onRsvpConfirmed: (confirmed: boolean, attendance: string, pax: number) => void;
  isGeneral?: boolean;
}

export default function RSVPSection({
  guest,
  initialWishes,
  rsvpConfirmed,
  onRsvpConfirmed,
  isGeneral = false,
}: RSVPSectionProps) {
  const [attendance, setAttendance] = useState<'attending' | 'declined'>('attending');
  const [customName, setCustomName] = useState(guest?.name || '');
  const [partySize, setPartySize] = useState<number>(guest?.pax || 1);
  const [wishes, setWishes] = useState<Wish[]>(initialWishes || []);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const guestDisplayName = customName.trim() || guest?.name || 'Tamu Undangan';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setFeedback('Mohon tuliskan ucapan doa restu.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const endpoint = isGeneral ? '/api/wishes' : '/api/rsvp';
      const payload = isGeneral
        ? {
            name: guestDisplayName,
            message: message.trim(),
          }
        : {
            name: guestDisplayName,
            attendance,
            pax: attendance === 'declined' ? 0 : partySize,
            message: message.trim(),
            guestId: guest?.id,
            guestCode: guest?.code,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (!isGeneral) {
          onRsvpConfirmed(true, attendance, partySize);
        }
        if (data.wish) {
          setWishes((prev) => [data.wish, ...prev]);
        }
        setMessage('');
        setFeedback('Terima kasih, ucapan kamu sudah terkirim!');

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D7AC64', '#4A5A74', '#93c5fd', '#ffffff'],
        });
      } else {
        setFeedback(data.message || 'Gagal menyimpan ucapan.');
      }
    } catch {
      setFeedback('Terjadi kesalahan jaringan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative w-full py-12 md:py-20 px-4 bg-[#4A5A74] text-slate-800 overflow-hidden">
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

      <div className="relative z-10 max-w-[360px] md:max-w-4xl lg:max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Mobile View: Single Unified Card matching Screenshot 10 */}
        <div className="w-full rounded-[28px] md:rounded-[36px] overflow-hidden bg-white shadow-[0_12px_36px_rgba(0,0,0,0.3)] relative p-6 sm:p-8 md:p-12 text-center flex flex-col items-center reveal">
          
          {/* Background misty landscape inside card matching Elementor Picture3-1-1-1.webp */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat pointer-events-none opacity-85"
            style={{
              backgroundImage: "url('/images/bg-mist.webp')",
            }}
          />

          <div className="relative z-10 w-full flex flex-col items-center">
            
            <h3 className="font-edensor text-2xl sm:text-[30px] md:text-[34px] font-medium text-[#D7AC64] tracking-wide drop-shadow-[1px_1px_1px_#FFFFFF]">
              Ucapkan Sesuatu
            </h3>

            <p className="font-bodebeck text-xs md:text-sm text-[#40506B] italic mt-1 mb-6">
              Berikan Ucapan &amp; Doa Restu
            </p>

            {feedback && (
              <div className="w-full max-w-md mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs md:text-sm font-medium text-[#4A5A74]">
                {feedback}
              </div>
            )}

            {/* Responsive Split on Desktop (Form on left, Wishes on right) */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-left items-start">
              
              {/* Form Side */}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                {/* Nama Kamu */}
                <div>
                  <label className="block text-[11px] md:text-xs font-semibold text-[#40506B] mb-1">
                    Nama Anda
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Nama Kamu"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white/95 px-4 py-2.5 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4A5A74] focus:ring-1 focus:ring-[#4A5A74]"
                  />
                </div>

                {/* Berikan Ucapan & Do'a */}
                <div>
                  <label className="block text-[11px] md:text-xs font-semibold text-[#40506B] mb-1">
                    Doa &amp; Ucapan
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Berikan Ucapan &amp; Do'a"
                    rows={4}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white/95 p-3.5 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4A5A74] focus:ring-1 focus:ring-[#4A5A74]"
                  />
                </div>

                {/* Konfirmasi Kehadiran ? (Only for personalized guest RSVP) */}
                {!isGeneral && (
                  <div>
                    <label className="block text-[11px] md:text-xs font-semibold text-[#40506B] mb-2">
                      Konfirmasi Kehadiran ?
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setAttendance('attending')}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs md:text-sm font-semibold transition active:scale-95 cursor-pointer ${
                          attendance === 'attending'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Hadir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAttendance('declined')}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs md:text-sm font-semibold transition active:scale-95 cursor-pointer ${
                          attendance === 'declined'
                            ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <X className="w-4 h-4 text-rose-600" />
                        <span>Tidak Hadir</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-[#4A5A74] hover:bg-[#D5AF6F] text-white font-bodebeck text-xs md:text-sm font-medium py-3 rounded-full transition-all duration-300 shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Ucapan'}
                </button>
              </form>

              {/* Wishes Feed Side */}
              <div className="w-full pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-8 border-slate-200/80">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-edensor text-base md:text-lg font-medium text-[#40506B]">
                    Doa &amp; Ucapan ({wishes.length})
                  </span>
                  <MessageCircle className="w-5 h-5 text-[#40506B]" />
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {wishes.length === 0 ? (
                    <div className="py-10 px-4 text-center rounded-2xl bg-white/70 border border-dashed border-slate-200">
                      <p className="font-edensor text-sm font-semibold text-[#40506B]">
                        Belum ada ucapan
                      </p>
                      <p className="font-bodebeck text-xs text-slate-500 mt-1">
                        Jadilah yang pertama menuliskan doa dan ucapan restu untuk Tika &amp; Ridho di atas!
                      </p>
                    </div>
                  ) : (
                    wishes.map((w) => (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-xl bg-white/85 border border-slate-200 shadow-sm text-xs md:text-[13px]"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[#4A5A74] truncate max-w-[200px]">
                            {w.name}
                          </span>
                          {!isGeneral && (
                            <span className={`text-[9px] md:text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              w.attendance === 'attending'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {w.attendance === 'attending' ? 'Hadir' : 'Tidak Hadir'}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 italic leading-relaxed">
                          &ldquo;{w.message}&rdquo;
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
