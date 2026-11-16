'use client';

import React, { useState } from 'react';
import { Copy, Check, Gift, MapPin, CreditCard } from 'lucide-react';
import { WeddingSettings } from '@/lib/db';

interface DigitalGiftSectionProps {
  gifts?: WeddingSettings['digitalGifts'];
}

export default function DigitalGiftSection({ gifts }: DigitalGiftSectionProps) {
  const [showAccounts, setShowAccounts] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const getBankLogo = (bankName: string) => {
    const normalized = (bankName || '').toLowerCase();
    if (normalized.includes('bca')) return '/images/bca-logo.svg';
    if (normalized.includes('bni')) return '/images/bni-logo.svg';
    if (normalized.includes('mandiri')) return '/images/mandiri-logo.svg';
    if (normalized.includes('bri')) return '/images/bri-logo.svg';
    return null;
  };

  // Master switch from admin settings
  const isMasterEnabled = gifts?.enabled !== false;

  // Filter accounts: ONLY accounts that are explicitly enabled in admin panel
  // NO hardcoded defaultBankAccounts fallback!
  const rawAccounts = gifts?.bankAccounts || [];
  const activeAccounts = rawAccounts.filter((b) => b.isActive !== false && b.accountNumber?.trim());

  const isPhysicalGiftActive =
    gifts?.physicalGift?.enabled !== false &&
    Boolean(gifts?.physicalGift?.address && gifts.physicalGift.address.trim().length > 0);

  // If master is disabled OR neither bank accounts nor physical gift is available, HIDE SECTION COMPLETELY
  if (!isMasterEnabled || (activeAccounts.length === 0 && !isPhysicalGiftActive)) {
    return null;
  }

  const bankList = activeAccounts.map((b, idx) => ({
    id: b.id || `bank-${idx}`,
    bankName: b.bankName,
    logo: getBankLogo(b.bankName),
    accountNumber: b.accountNumber,
    formattedNumber: b.accountNumber.replace(/(\d{4})(?=\d)/g, '$1 '),
    accountHolder: b.accountHolder,
    theme: idx % 2 === 0
      ? 'from-[#0F2A38] via-[#1A3E54] to-[#0C1F2B]'
      : 'from-[#0E2448] via-[#193B6F] to-[#0A1A33]',
    accentColor: idx % 2 === 0 ? '#00D1B2' : '#3B82F6',
    borderGlow: idx % 2 === 0
      ? 'border-cyan-500/30 shadow-[0_8px_30px_rgba(15,42,56,0.35)]'
      : 'border-blue-500/30 shadow-[0_8px_30px_rgba(14,36,72,0.35)]',
  }));

  const physicalGift = gifts?.physicalGift;

  return (
    <section className="relative w-full py-16 sm:py-24 px-4 bg-[#4A5A74] text-slate-800 overflow-hidden">
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

      <div className="relative z-10 max-w-[420px] md:max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Amplop Digital Main Card */}
        <div className="w-full rounded-[28px] md:rounded-[36px] overflow-hidden bg-white shadow-[0_16px_40px_rgba(0,0,0,0.28)] relative p-6 sm:p-8 md:p-12 text-center flex flex-col items-center reveal">
          
          {/* Background misty landscape inside card */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat pointer-events-none opacity-85"
            style={{
              backgroundImage: "url('/images/bg-mist.webp')",
            }}
          />

          <div className="relative z-10 w-full flex flex-col items-center">
            
            {/* Gift Icon Badge */}
            <div className="w-12 h-12 rounded-full bg-[#D7AC64]/15 border border-[#D7AC64]/30 flex items-center justify-center text-[#D7AC64] mb-3 shadow-sm">
              <Gift className="w-6 h-6" />
            </div>

            <h3 className="font-edensor text-2xl sm:text-[30px] md:text-[34px] font-medium text-[#D7AC64] tracking-wide drop-shadow-[1px_1px_1px_#FFFFFF]">
              {bankList.length > 0 ? 'Amplop Digital' : 'Kirim Hadiah & Kado'}
            </h3>

            <p className="font-bodebeck text-xs md:text-sm text-[#40506B] leading-relaxed my-3 md:my-4 max-w-[340px] md:max-w-lg">
              {bankList.length > 0
                ? 'Doa restu Anda merupakan karunia yang sangat berarti bagi kami, dan jika memberi adalah ungkapan tanda kasih, Anda dapat memberi kado secara cashless.'
                : 'Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Bagi keluarga dan sahabat yang ingin mengirimkan tanda kasih, dapat mengirimkan ke alamat berikut:'}
            </p>

            {bankList.length > 0 && (
              <button
                onClick={() => setShowAccounts(!showAccounts)}
                type="button"
                className="mt-2 inline-flex items-center gap-2 bg-[#40506B] hover:bg-[#D7AC64] text-white font-bodebeck text-xs md:text-sm font-semibold px-7 md:px-9 py-2.5 md:py-3 rounded-full transition-all duration-300 shadow-md active:scale-95 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>{showAccounts ? 'Tutup Rekening' : 'Kirim Hadiah / Angpao'}</span>
                <span className="font-bold">&rarr;</span>
              </button>
            )}

            {/* =========================================================
                BANK ATM CARDS (ONLY IF ACTIVE IN ADMIN)
                ========================================================= */}
            {bankList.length > 0 && showAccounts && (
              <div className="w-full mt-8 flex flex-col gap-5 pt-6 border-t border-slate-200/80 animate-in fade-in zoom-in-95 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                  {bankList.map((bank) => (
                    <div
                      key={bank.id}
                      className={`relative w-full rounded-[22px] overflow-hidden p-6 text-left flex flex-col justify-between min-h-[200px] sm:min-h-[220px] transition-all duration-300 hover:scale-[1.02] border bg-gradient-to-br ${bank.theme} ${bank.borderGlow}`}
                    >
                      {/* Atmospheric background waves & specular light reflections */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-white/[0.04] pointer-events-none blur-xl" />

                      {/* Top Row: Bank Brand Logo & ATM Chip */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {bank.logo ? (
                            <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-md flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={bank.logo}
                                alt={bank.bankName}
                                className="h-5 sm:h-6 w-auto max-w-[85px] sm:max-w-[105px] object-contain"
                              />
                            </div>
                          ) : (
                            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white drop-shadow-md">
                              {bank.bankName}
                            </span>
                          )}
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/chip-atm.png"
                          alt="ATM Chip"
                          className="w-11 h-9 object-contain drop-shadow"
                        />
                      </div>

                      {/* Middle: Number Section */}
                      <div className="relative z-10 my-4 py-1">
                        <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#D7AC64] mb-1.5 drop-shadow-sm">
                          Nomor Rekening
                        </p>
                        <p className="font-mono text-2xl sm:text-[26px] md:text-2xl lg:text-[28px] tracking-[0.16em] font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] select-all leading-none">
                          {bank.formattedNumber}
                        </p>
                      </div>

                      {/* Bottom Row: Account Holder & Copy Button */}
                      <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-slate-300 uppercase tracking-wider font-light">
                            Atas Nama
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate mt-0.5">
                            {bank.accountHolder}
                          </p>
                        </div>

                        <button
                          onClick={() => handleCopy(bank.accountNumber, bank.id)}
                          type="button"
                          className="inline-flex items-center gap-1.5 bg-[#D7AC64] hover:bg-[#c99e56] text-[#0f172a] font-bodebeck text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                        >
                          {copiedId === bank.id ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Nomor</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Physical Gift Address (if enabled and address exists) */}
            {isPhysicalGiftActive && physicalGift?.address && (
              <div className="w-full mt-6 rounded-[20px] bg-slate-50/90 border border-slate-200 p-5 text-left shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#40506B]/10 text-[#40506B] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-edensor text-base font-semibold text-[#1e293b]">
                      Kirim Kado Fisik
                    </h4>
                    <p className="font-bodebeck text-xs text-slate-600 leading-relaxed mt-1">
                      {physicalGift.recipientName}
                      {physicalGift.phone ? ` (${physicalGift.phone})` : ''}
                      <br />
                      {physicalGift.address}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(physicalGift.address, 'physical-gift')}
                  type="button"
                  className="inline-flex items-center gap-1.5 bg-[#40506B] hover:bg-[#2b3951] text-white font-bodebeck text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition active:scale-95 cursor-pointer shrink-0"
                >
                  {copiedId === 'physical-gift' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Alamat Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Alamat</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
