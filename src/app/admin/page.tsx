'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  QrCode,
  CheckCircle2,
  Clock,
  MessageSquare,
  UserPlus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Guest } from '@/lib/db';

interface StatsData {
  totalGuests: number;
  totalPax: number;
  attendingCount: number;
  totalAttendingPax: number;
  declinedCount: number;
  tentativeCount: number;
  pendingCount: number;
  checkedInCount: number;
  checkedInPax: number;
  checkInRate: number;
  rsvpRate: number;
  totalWishes: number;
  categoryStats: Record<string, { total: number; checkedIn: number }>;
  recentCheckIns: Guest[];
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto refresh every 20 seconds
    const interval = setInterval(fetchStats, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2b3951] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d7ac64]" />
            <span>Dashboard Overview</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Pantau kehadiran tamu nyata via QR Scanner, konfirmasi RSVP, dan buku ucapan secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/scan"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-semibold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all text-center"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR</span>
          </Link>
          <Link
            href="/admin/guests"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2b3951] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1e293b] active:scale-95 transition-all text-center"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tamu</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards: Responsive 2-col on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Total Tamu */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold">
              Total Diundang
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2b3951]">
              {stats?.totalGuests || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              Estimasi: <span className="font-semibold text-slate-700">{stats?.totalPax || 0} Orang</span>
            </p>
          </div>
        </div>

        {/* Card 2: Konfirmasi RSVP */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold">
              Konfirmasi RSVP
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-700">
              {stats?.attendingCount || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              {stats?.totalAttendingPax || 0} Pax &bull; {stats?.declinedCount || 0} Menolak
            </p>
          </div>
        </div>

        {/* Card 3: Kehadiran Fisik (Check-in via Scan) - HIGHLIGHT */}
        <div className="bg-gradient-to-br from-emerald-50/90 to-white p-4 sm:p-6 rounded-2xl shadow-sm border border-emerald-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-emerald-800 font-bold">
              Sudah Hadir (Scan)
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
              {stats?.checkedInCount || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-700 font-medium mt-1">
              {stats?.checkInRate || 0}% Kehadiran di Lokasi
            </p>
          </div>
        </div>

        {/* Card 4: Total Ucapan */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold">
              Buku Tamu
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-700">
              {stats?.totalWishes || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              Doa &amp; Restu Masuk
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Stats + Recent Check-in Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Left: Category Breakdown */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-sm sm:text-base font-serif font-bold text-[#2b3951] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#d7ac64]" />
            <span>Kategori Tamu &amp; Kehadiran</span>
          </h2>

          <div className="space-y-4">
            {stats?.categoryStats && Object.entries(stats.categoryStats).map(([cat, val]) => {
              const pct = val.total > 0 ? Math.round((val.checkedIn / val.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span className="text-slate-500 font-medium">
                      {val.checkedIn}/{val.total} Hadir ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#d7ac64] to-[#f4d48f] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Tingkat RSVP Respon</span>
            <span className="font-bold text-[#2b3951]">{stats?.rsvpRate || 0}%</span>
          </div>
        </div>

        {/* Right: Recent Check-in Logs (2 cols) */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#2b3951] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Aktivitas Check-In Terbaru (Scan QR)</span>
            </h2>
            <Link
              href="/admin/guests?checkin=yes"
              className="text-xs text-[#d7ac64] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Semua Tamu Hadir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recentCheckIns && stats.recentCheckIns.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentCheckIns.map((g) => (
                <div key={g.id} className="py-3 sm:py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {g.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                        {g.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {g.category} &bull; {g.pax} Pax &bull; {g.tableOrSession}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ✓ Hadir
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        {g.checkedInAt
                          ? new Date(g.checkedInAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }) + ' WIB'
                          : '-'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada tamu yang melakukan scan check-in di lokasi.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
