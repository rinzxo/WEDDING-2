'use client';

import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  QrCode,
  Clock,
  UserCheck,
  Quote,
} from 'lucide-react';
import { Wish, Guest } from '@/lib/db';

export default function WishesModerationPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterAttendance, setFilterAttendance] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wishesRes, guestsRes] = await Promise.all([
        fetch('/api/wishes'),
        fetch('/api/admin/guests'),
      ]);

      const wishesData = await wishesRes.json();
      const guestsData = await guestsRes.json();

      if (wishesData.success) {
        setWishes(wishesData.wishes || []);
      }
      if (guestsData.success) {
        setGuests(guestsData.guests || []);
      }
    } catch (err) {
      console.error('Error fetching wishes or guests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus ucapan ini dari daftar publik?')) return;
    try {
      const res = await fetch(`/api/admin/wishes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setWishes((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to match a wish to a guest
  const findMatchingGuest = (w: Wish): Guest | undefined => {
    if (w.guestId) {
      const found = guests.find((g) => g.id === w.guestId);
      if (found) return found;
    }
    const cleanWishName = w.name.trim().toLowerCase();
    return guests.find((g) => g.name.trim().toLowerCase() === cleanWishName);
  };

  // Quick manual check-in from wishes page
  const handleQuickCheckIn = async (guest: Guest) => {
    try {
      setCheckingInId(guest.id);
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: guest.code,
          checkedInBy: 'Admin Meja Ucapan',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guest.id
              ? {
                  ...g,
                  isCheckedIn: true,
                  checkedInAt: new Date().toISOString(),
                  checkedInBy: 'Admin Meja Ucapan',
                }
              : g
          )
        );
      } else {
        alert(data.message || 'Gagal memproses check-in.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setCheckingInId(null);
    }
  };

  // Filter logic
  const filtered = wishes.filter((w) => {
    const matchSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.message.toLowerCase().includes(search.toLowerCase());

    const guest = findMatchingGuest(w);
    const isCheckedIn = Boolean(guest?.isCheckedIn);

    let matchAttendance = true;
    if (filterAttendance === 'checked_in') {
      matchAttendance = isCheckedIn && w.attendance !== 'declined';
    } else if (filterAttendance === 'rsvp_pending_checkin') {
      matchAttendance = !isCheckedIn && w.attendance === 'attending';
    } else if (filterAttendance === 'declined') {
      matchAttendance = w.attendance === 'declined';
    }

    return matchSearch && matchAttendance;
  });

  // Calculate live stats
  const totalCount = wishes.length;
  const declinedCount = wishes.filter((w) => w.attendance === 'declined').length;
  const checkedInCount = wishes.filter((w) => {
    if (w.attendance === 'declined') return false;
    const g = findMatchingGuest(w);
    return Boolean(g?.isCheckedIn);
  }).length;
  const pendingCheckInCount = wishes.filter((w) => {
    if (w.attendance === 'declined') return false;
    const g = findMatchingGuest(w);
    return !g?.isCheckedIn && w.attendance === 'attending';
  }).length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#d7ac64]/20 text-[#b88a44] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2b3951]">
                Buku Tamu &amp; Moderasi Ucapan
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Kehadiran fisik di bawah ini divalidasi otomatis setelah scan QR atau check-in resepsionis.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Status Badges / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Ucapan
          </span>
          <span className="text-2xl font-serif font-bold text-[#2b3951] mt-1">
            {totalCount}
          </span>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
              Sudah Hadir
            </span>
            <QrCode className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-serif font-bold text-emerald-700 mt-1">
            {checkedInCount}
          </span>
          <span className="text-[10px] text-emerald-600/90 font-medium">
            Telah Scan / Check-In
          </span>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              RSVP Hadir
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-serif font-bold text-amber-800 mt-1">
            {pendingCheckInCount}
          </span>
          <span className="text-[10px] text-amber-700/90 font-medium">
            Belum Check-In Fisik
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Tidak Hadir
            </span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl font-serif font-bold text-slate-600 mt-1">
            {declinedCount}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Konfirmasi Berhalangan
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pengirim atau teks ucapan..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        </div>

        <div>
          <select
            value={filterAttendance}
            onChange={(e) => setFilterAttendance(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none bg-white cursor-pointer"
          >
            <option value="">Semua Status Kehadiran</option>
            <option value="checked_in">✓ Sudah Hadir (Scan / Check-In Fisik)</option>
            <option value="rsvp_pending_checkin">⏳ RSVP Hadir (Belum Check-In Fisik)</option>
            <option value="declined">✕ Tidak Hadir</option>
          </select>
        </div>
      </div>

      {/* MOBILE VIEW: Native Touch Cards (Visible only on mobile) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin text-[#d7ac64]" />
            <span>Memuat data ucapan &amp; status scan check-in...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 p-6 space-y-1">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600 text-sm">Belum ada ucapan</p>
            <p className="text-slate-400 text-[11px]">
              Doa dan ucapan yang dikirimkan oleh para tamu undangan akan tampil di sini.
            </p>
          </div>
        ) : (
          filtered.map((w) => {
            const guest = findMatchingGuest(w);
            const isCheckedIn = Boolean(guest?.isCheckedIn);
            const checkInTime = guest?.checkedInAt;

            return (
              <div
                key={w.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
              >
                {/* Header: Avatar, Name, Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2b3951] to-[#40506b] text-[#d7ac64] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      {w.name[0]?.toUpperCase() || 'T'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-slate-800 truncate">
                        {w.name}
                      </h3>
                      {guest?.category && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 mt-0.5">
                          {guest.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Kehadiran Badge */}
                  <div className="shrink-0">
                    {w.attendance === 'declined' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200">
                        <XCircle className="w-3 h-3 text-red-600" />
                        <span>Tidak Hadir</span>
                      </span>
                    ) : isCheckedIn ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Sudah Hadir</span>
                      </span>
                    ) : w.attendance === 'attending' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/90">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>RSVP Hadir</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                        <span>Ragu-ragu</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Bubble */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-700 leading-relaxed font-normal italic break-words">
                    &ldquo;{w.message}&rdquo;
                  </p>
                </div>

                {/* Footer: Date & Actions */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                  <div>
                    <span>
                      {new Date(w.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      WIB
                    </span>
                    {isCheckedIn && checkInTime && (
                      <span className="block text-emerald-700 font-medium text-[10px]">
                        • Hadir: {new Date(checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {guest && !isCheckedIn && w.attendance !== 'declined' && (
                      <button
                        onClick={() => handleQuickCheckIn(guest)}
                        disabled={checkingInId === guest.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition active:scale-95"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Check-In</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition active:scale-95"
                      title="Hapus Ucapan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW: Full Data Table (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-4 w-56">Pengirim &amp; Kategori</th>
                <th className="py-3.5 px-4 w-48">Status Kehadiran</th>
                <th className="py-3.5 px-4">Isi Doa &amp; Ucapan</th>
                <th className="py-3.5 px-4 w-44">Waktu Kirim</th>
                <th className="py-3.5 px-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#d7ac64] mx-auto mb-2" />
                    <span>Memuat data ucapan &amp; status scan check-in...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">Belum ada ucapan</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Doa dan ucapan yang dikirimkan oleh para tamu undangan akan tampil di tabel ini.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const guest = findMatchingGuest(w);
                  const isCheckedIn = Boolean(guest?.isCheckedIn);
                  const checkInTime = guest?.checkedInAt;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Pengirim & Kategori */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2b3951] to-[#40506b] text-[#d7ac64] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {w.name[0]?.toUpperCase() || 'T'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm">
                              {w.name}
                            </div>
                            {guest?.category && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 mt-0.5">
                                {guest.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Kehadiran: Real Scan Check-in vs RSVP */}
                      <td className="py-3.5 px-4">
                        {w.attendance === 'declined' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Tidak Hadir</span>
                          </span>
                        ) : isCheckedIn ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sudah Hadir (Check-In)</span>
                            </span>
                            {checkInTime && (
                              <p className="text-[10px] text-emerald-700 font-medium mt-1">
                                Jam {new Date(checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                              </p>
                            )}
                          </div>
                        ) : w.attendance === 'attending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/90">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>RSVP Hadir (Belum Check-In)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Ragu-ragu</span>
                          </span>
                        )}
                      </td>

                      {/* Isi Doa & Ucapan */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="text-slate-700 leading-relaxed text-xs">
                          &ldquo;{w.message}&rdquo;
                        </div>
                      </td>

                      {/* Waktu Kirim */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div>
                          {new Date(w.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-slate-400">
                          {new Date(w.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          WIB
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {guest && !isCheckedIn && w.attendance !== 'declined' && (
                            <button
                              onClick={() => handleQuickCheckIn(guest)}
                              disabled={checkingInId === guest.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition active:scale-95 cursor-pointer"
                              title="Check-in tamu ini sekarang"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{checkingInId === guest.id ? '...' : 'Check-In'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(w.id)}
                            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition active:scale-95 cursor-pointer"
                            title="Hapus Ucapan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
