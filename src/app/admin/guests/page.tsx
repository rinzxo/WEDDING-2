'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Share2,
  QrCode,
  Edit,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Guest } from '@/lib/db';
import { generateWhatsAppMessage } from '@/lib/utils';

export default function GuestManagementPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCheckin, setSelectedCheckin] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'Reguler',
    tableOrSession: 'Sesi 1 (11.00 - 14.00 WIB)',
    pax: 2,
    rsvpStatus: 'pending' as Guest['rsvpStatus'],
    isCheckedIn: false,
  });

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedStatus) params.set('status', selectedStatus);
      if (selectedCheckin) params.set('checkin', selectedCheckin);

      const res = await fetch(`/api/admin/guests?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setGuests(data.guests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [search, selectedCategory, selectedStatus, selectedCheckin]);

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          phone: '',
          category: 'Reguler',
          tableOrSession: 'Sesi 1 (11.00 - 14.00 WIB)',
          pax: 2,
          rsvpStatus: 'pending',
          isCheckedIn: false,
        });
        fetchGuests();
      } else {
        alert(data.message || 'Gagal menambahkan tamu');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleUpdateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGuest) return;
    try {
      const res = await fetch(`/api/admin/guests/${activeGuest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setActiveGuest(null);
        fetchGuests();
      } else {
        alert(data.message || 'Gagal memperbarui tamu');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCheckIn = async (guest: Guest) => {
    const newStatus = !guest.isCheckedIn;
    try {
      const res = await fetch(`/api/admin/guests/${guest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isCheckedIn: newStatus,
          checkedInAt: newStatus ? new Date().toISOString() : null,
          checkedInBy: newStatus ? 'Admin Manual' : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guest.id
              ? {
                  ...g,
                  isCheckedIn: newStatus,
                  checkedInAt: newStatus ? new Date().toISOString() : undefined,
                  checkedInBy: newStatus ? 'Admin Manual' : undefined,
                }
              : g
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGuest = async (id: string, name: string) => {
    if (!confirm(`Hapus tamu "${name}" dari daftar undangan?`)) return;
    try {
      const res = await fetch(`/api/admin/guests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchGuests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openQrModal = async (guest: Guest) => {
    setActiveGuest(guest);
    try {
      const url = await QRCode.toDataURL(guest.code, {
        width: 320,
        margin: 2,
        color: { dark: '#2b3951', light: '#ffffff' },
      });
      setQrDataUrl(url);
      setIsQrModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const openWaModal = (guest: Guest) => {
    setActiveGuest(guest);
    setIsWaModalOpen(true);
  };

  const getGuestUrl = (guest: Guest) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/invitation/${guest.slug}`;
    }
    return `https://example.com/invitation/${guest.slug}`;
  };

  const openWhatsAppDirect = (guest: Guest) => {
    const url = getGuestUrl(guest);
    const msg = generateWhatsAppMessage(guest.name, url, "Tika & Ridho");
    let cleanPhone = guest.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2b3951] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#d7ac64]" />
            <span>Daftar Tamu Undangan</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Kelola tamu, buat pesan undangan WhatsApp personal, dan pantau status check-in QR.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              phone: '',
              category: 'Reguler',
              tableOrSession: 'Sesi 1 (11.00 - 14.00 WIB)',
              pax: 2,
              rsvpStatus: 'pending',
              isCheckedIn: false,
            });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gold-button text-xs font-semibold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Tamu Baru</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kode, HP..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#d7ac64]"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#d7ac64] bg-white cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            <option value="VIP">VIP</option>
            <option value="Keluarga">Keluarga</option>
            <option value="Sahabat">Sahabat</option>
            <option value="Rekan Kerja">Rekan Kerja</option>
            <option value="Reguler">Reguler</option>
          </select>
        </div>

        {/* Status RSVP Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#d7ac64] bg-white cursor-pointer"
          >
            <option value="">Semua Status RSVP</option>
            <option value="attending">Hadir</option>
            <option value="declined">Tidak Hadir</option>
            <option value="pending">Belum Konfirmasi (Pending)</option>
            <option value="tentative">Ragu-ragu</option>
          </select>
        </div>

        {/* Checkin Kehadiran Fisik Filter */}
        <div>
          <select
            value={selectedCheckin}
            onChange={(e) => setSelectedCheckin(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#d7ac64] bg-white cursor-pointer"
          >
            <option value="">Semua Kehadiran Fisik</option>
            <option value="yes">✓ Sudah Check-In (Di Lokasi)</option>
            <option value="no">⏳ Belum Check-In</option>
          </select>
        </div>
      </div>

      {/* MOBILE VIEW: Native Touch Cards (Visible only on mobile) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            Memuat data tamu...
          </div>
        ) : guests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            Tidak ada tamu yang sesuai pencarian.
          </div>
        ) : (
          guests.map((guest) => (
            <div
              key={guest.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
            >
              {/* Header row: Name, Category, Pax, QR Code pill */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 leading-tight">
                    {guest.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d7ac64]/20 text-[#b88a44]">
                      {guest.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {guest.pax} Pax
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openQrModal(guest)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2b3951] font-mono text-[11px] font-bold active:scale-95 transition shrink-0"
                  title="Lihat QR Code"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#d7ac64]" />
                  <span>{guest.code}</span>
                </button>
              </div>

              {/* Session info */}
              <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                <span>
                  Sesi: <strong className="text-slate-700">{guest.tableOrSession || 'Sesi 1'}</strong>
                </span>
                {guest.phone && <span>{guest.phone}</span>}
              </div>

              {/* Status Section: RSVP Status vs Kehadiran Fisik (Scan) */}
              <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {/* RSVP status */}
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
                    Status RSVP
                  </span>
                  {guest.rsvpStatus === 'attending' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hadir ({guest.rsvpPax || guest.pax} Pax)</span>
                    </span>
                  )}
                  {guest.rsvpStatus === 'declined' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <span>Tidak Hadir</span>
                    </span>
                  )}
                  {guest.rsvpStatus === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pending</span>
                    </span>
                  )}
                  {guest.rsvpStatus === 'tentative' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Ragu-ragu</span>
                    </span>
                  )}
                </div>

                {/* Physical Check-in Button / Badge */}
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
                    Kehadiran Fisik
                  </span>
                  <button
                    onClick={() => handleToggleCheckIn(guest)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition active:scale-95 ${
                      guest.isCheckedIn
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200'
                    }`}
                  >
                    {guest.isCheckedIn ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sudah Check-In</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Tap Check-In</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons: WhatsApp, Copy Link, Edit, Delete */}
              <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => openWaModal(guest)}
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-[11px] hover:bg-emerald-100 active:scale-95 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WA</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getGuestUrl(guest));
                    alert(`Link undangan untuk ${guest.name} berhasil disalin!`);
                  }}
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-[11px] hover:bg-slate-200 active:scale-95 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Link</span>
                </button>
                <button
                  onClick={() => {
                    setActiveGuest(guest);
                    setFormData({
                      name: guest.name,
                      phone: guest.phone,
                      category: guest.category,
                      tableOrSession: guest.tableOrSession,
                      pax: guest.pax,
                      rsvpStatus: guest.rsvpStatus,
                      isCheckedIn: guest.isCheckedIn,
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-[11px] hover:bg-blue-100 active:scale-95 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteGuest(guest.id, guest.name)}
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 text-red-600 font-semibold text-[11px] hover:bg-red-100 active:scale-95 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP VIEW: Full Data Table (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-4">Nama Tamu &amp; Kategori</th>
                <th className="py-3.5 px-4">Kode QR &amp; Sesi</th>
                <th className="py-3.5 px-4 text-center">Pax</th>
                <th className="py-3.5 px-4">Status RSVP</th>
                <th className="py-3.5 px-4">Kehadiran Fisik (Scan)</th>
                <th className="py-3.5 px-4 text-right">Aksi &amp; Undangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Memuat data tamu...
                  </td>
                </tr>
              ) : guests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data tamu yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Category */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 text-sm">
                        {guest.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d7ac64]/20 text-[#b88a44]">
                          {guest.category}
                        </span>
                        {guest.phone && (
                          <span className="text-slate-400 text-[11px]">
                            {guest.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Code & Session */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openQrModal(guest)}
                        className="font-mono text-xs font-bold text-[#404f6a] hover:underline flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#d7ac64]" />
                        <span>{guest.code}</span>
                      </button>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {guest.tableOrSession || 'Sesi 1'}
                      </p>
                    </td>

                    {/* Pax */}
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {guest.pax}
                    </td>

                    {/* RSVP Status */}
                    <td className="py-3.5 px-4">
                      {guest.rsvpStatus === 'attending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Hadir ({guest.rsvpPax || guest.pax} Pax)</span>
                        </span>
                      )}
                      {guest.rsvpStatus === 'declined' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span>Tidak Hadir</span>
                        </span>
                      )}
                      {guest.rsvpStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          <HelpCircle className="w-3 h-3 text-slate-400" />
                          <span>Pending</span>
                        </span>
                      )}
                      {guest.rsvpStatus === 'tentative' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                          <span>Ragu-ragu</span>
                        </span>
                      )}
                    </td>

                    {/* Checkin Status (Physical attendance) */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleCheckIn(guest)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition active:scale-95 ${
                          guest.isCheckedIn
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Klik untuk ubah status check-in"
                      >
                        {guest.isCheckedIn ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Sudah Check-In</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Belum Check-In</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Invite 1-Click */}
                        <button
                          onClick={() => openWaModal(guest)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="Invite via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* View QR Code */}
                        <button
                          onClick={() => openQrModal(guest)}
                          className="p-1.5 rounded-lg bg-amber-50 text-[#b88a44] hover:bg-amber-100 transition-colors"
                          title="Tampilkan QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Direct Link */}
                        <a
                          href={`/invitation/${guest.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="Buka Undangan Tamu"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Edit Guest */}
                        <button
                          onClick={() => {
                            setActiveGuest(guest);
                            setFormData({
                              name: guest.name,
                              phone: guest.phone,
                              category: guest.category,
                              tableOrSession: guest.tableOrSession,
                              pax: guest.pax,
                              rsvpStatus: guest.rsvpStatus,
                              isCheckedIn: guest.isCheckedIn,
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Edit Tamu"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Guest */}
                        <button
                          onClick={() => handleDeleteGuest(guest.id, guest.name)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Hapus Tamu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Tamu */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#2b3951] mb-1">
              Tambah Tamu Baru
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Sistem akan otomatis menghasilkan link khusus dan kode QR unik.
            </p>

            <form onSubmit={handleCreateGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Lengkap / Pasangan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Bambang & Istri"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nomor WhatsApp (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none bg-white cursor-pointer"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Sahabat">Sahabat</option>
                    <option value="Rekan Kerja">Rekan Kerja</option>
                    <option value="Reguler">Reguler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Kapasitas (Pax)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.pax}
                    onChange={(e) => setFormData({ ...formData, pax: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Sesi / Meja
                </label>
                <input
                  type="text"
                  placeholder="Sesi 1 (11.00 - 14.00 WIB) / Meja 02"
                  value={formData.tableOrSession}
                  onChange={(e) => setFormData({ ...formData, tableOrSession: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gold-button text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Simpan Tamu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Tamu */}
      {isEditModalOpen && activeGuest && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#2b3951] mb-1">
              Edit Data Tamu
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Kode QR: <span className="font-mono font-bold text-[#404f6a]">{activeGuest.code}</span>
            </p>

            <form onSubmit={handleUpdateGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Tamu
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none bg-white cursor-pointer"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Sahabat">Sahabat</option>
                    <option value="Rekan Kerja">Rekan Kerja</option>
                    <option value="Reguler">Reguler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Kapasitas (Pax)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.pax}
                    onChange={(e) => setFormData({ ...formData, pax: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Status RSVP
                  </label>
                  <select
                    value={formData.rsvpStatus}
                    onChange={(e) => setFormData({ ...formData, rsvpStatus: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none bg-white cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="attending">Hadir</option>
                    <option value="declined">Tidak Hadir</option>
                    <option value="tentative">Ragu-ragu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Kehadiran Fisik (Scan)
                  </label>
                  <select
                    value={formData.isCheckedIn ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, isCheckedIn: e.target.value === 'yes' })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none bg-white cursor-pointer"
                  >
                    <option value="no">Belum Check-In</option>
                    <option value="yes">Sudah Check-In</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2b3951] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1e293b] cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: QR Code */}
      {isQrModalOpen && activeGuest && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl text-center relative">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-[#2b3951]">
              QR Code Kehadiran
            </h3>
            <p className="text-xs text-[#d7ac64] font-semibold uppercase tracking-wider mb-4">
              {activeGuest.category} &bull; {activeGuest.name}
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block my-2">
              {qrDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
              )}
              <p className="font-mono text-xs font-bold text-slate-700 mt-2">
                {activeGuest.code}
              </p>
            </div>

            <p className="text-xs text-slate-500 mb-5">
              Tunjukkan QR Code ini pada scanner panitia saat memasuki venue resepsi.
            </p>

            <div className="flex gap-2">
              <a
                href={qrDataUrl}
                download={`QR_${activeGuest.slug}.png`}
                className="flex-1 py-2.5 rounded-xl gold-button text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh QR</span>
              </a>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: WhatsApp Share */}
      {isWaModalOpen && activeGuest && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsWaModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#2b3951] mb-1">
              Kirim Undangan WhatsApp
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pesan personal untuk <strong className="text-slate-700">{activeGuest.name}</strong>
            </p>

            {/* Generated Message Preview */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-56 overflow-y-auto mb-4">
              {generateWhatsAppMessage(activeGuest.name, getGuestUrl(activeGuest), "Tika & Ridho")}
            </div>

            {/* Link Copy Bar */}
            <div className="flex items-center gap-2 mb-5">
              <input
                type="text"
                readOnly
                value={getGuestUrl(activeGuest)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 font-mono outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getGuestUrl(activeGuest));
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#2b3951] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1e293b] active:scale-95 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => openWhatsAppDirect(activeGuest)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Buka di WhatsApp Web / App</span>
              </button>
              <button
                onClick={() => {
                  const msg = generateWhatsAppMessage(activeGuest.name, getGuestUrl(activeGuest), "Tika & Ridho");
                  navigator.clipboard.writeText(msg);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              >
                {copiedText ? 'Teks Tersalin!' : 'Salin Teks Lengkap'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
