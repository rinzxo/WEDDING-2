'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  Check,
  User,
  Calendar,
  Music,
  CreditCard,
  Heart,
  Video,
  Plus,
  Trash2,
} from 'lucide-react';
import { WeddingSettings } from '@/lib/db';

export default function WeddingSettingsPage() {
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'couple' | 'events' | 'music' | 'gifts' | 'story'>('couple');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.message || 'Gagal menyimpan pengaturan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-400 text-sm">
        Memuat pengaturan undangan...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2b3951] flex items-center gap-2">
            <Settings className="w-5 sm:w-6 h-5 sm:h-6 text-[#d7ac64]" />
            <span>Pengaturan Undangan</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Ubah nama mempelai, waktu acara, musik pengiring, amplop digital, dan cerita cinta.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl gold-button text-xs font-semibold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 w-full sm:w-auto"
        >
          {saving ? (
            <span>Menyimpan...</span>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-green-200" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-3 sm:px-6 rounded-t-2xl shadow-sm gap-2 sm:gap-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('couple')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'couple'
              ? 'border-[#d7ac64] text-[#2b3951]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Mempelai</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'events'
              ? 'border-[#d7ac64] text-[#2b3951]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Waktu &amp; Lokasi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('music')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'music'
              ? 'border-[#d7ac64] text-[#2b3951]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Musik &amp; Audio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gifts')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'gifts'
              ? 'border-[#d7ac64] text-[#2b3951]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Rekening &amp; Kado</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('story')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'story'
              ? 'border-[#d7ac64] text-[#2b3951]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Kisah Cinta</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 sm:p-8 rounded-b-2xl shadow-sm border border-slate-200">
        
        {/* Tab 1: Mempelai */}
        {activeTab === 'couple' && (
          <div className="space-y-8">
            {/* Mempelai Pria */}
            <div>
              <h3 className="font-serif text-lg font-bold text-[#404f6a] mb-4 pb-2 border-b border-slate-100">
                Data Mempelai Pria (Groom)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={settings.groom.fullName}
                    onChange={(e) => setSettings({ ...settings, groom: { ...settings.groom, fullName: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Panggilan</label>
                  <input
                    type="text"
                    value={settings.groom.nickname}
                    onChange={(e) => setSettings({ ...settings, groom: { ...settings.groom, nickname: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Urutan Anak</label>
                  <input
                    type="text"
                    value={settings.groom.childOrder}
                    onChange={(e) => setSettings({ ...settings, groom: { ...settings.groom, childOrder: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    value={settings.groom.fatherName}
                    onChange={(e) => setSettings({ ...settings, groom: { ...settings.groom, fatherName: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Ibu</label>
                  <input
                    type="text"
                    value={settings.groom.motherName}
                    onChange={(e) => setSettings({ ...settings, groom: { ...settings.groom, motherName: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Akun Instagram</label>
                  <input
                    type="text"
                    value={settings.groom.instagram}
                    onChange={(e) => setSettings({ ...settings, groom: { ...settings.groom, instagram: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase mb-1">URL Foto Mempelai Pria</label>
                  <input
                    type="text"
                    value={settings.groom.photoUrl}
                    onChange={(e) => setSettings({ ...settings, groom: { ...settings.groom, photoUrl: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mempelai Wanita */}
            <div>
              <h3 className="font-serif text-lg font-bold text-[#404f6a] mb-4 pb-2 border-b border-slate-100">
                Data Mempelai Wanita (Bride)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={settings.bride.fullName}
                    onChange={(e) => setSettings({ ...settings, bride: { ...settings.bride, fullName: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Panggilan</label>
                  <input
                    type="text"
                    value={settings.bride.nickname}
                    onChange={(e) => setSettings({ ...settings, bride: { ...settings.bride, nickname: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Urutan Anak</label>
                  <input
                    type="text"
                    value={settings.bride.childOrder}
                    onChange={(e) => setSettings({ ...settings, bride: { ...settings.bride, childOrder: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    value={settings.bride.fatherName}
                    onChange={(e) => setSettings({ ...settings, bride: { ...settings.bride, fatherName: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Ibu</label>
                  <input
                    type="text"
                    value={settings.bride.motherName}
                    onChange={(e) => setSettings({ ...settings, bride: { ...settings.bride, motherName: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Akun Instagram</label>
                  <input
                    type="text"
                    value={settings.bride.instagram}
                    onChange={(e) => setSettings({ ...settings, bride: { ...settings.bride, instagram: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase mb-1">URL Foto Mempelai Wanita</label>
                  <input
                    type="text"
                    value={settings.bride.photoUrl}
                    onChange={(e) => setSettings({ ...settings, bride: { ...settings.bride, photoUrl: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Waktu & Lokasi */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#404f6a] mb-4 pb-2 border-b border-slate-100">
                Pengaturan Tanggal Utama &amp; Countdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Teks Tanggal Utama</label>
                  <input
                    type="text"
                    value={settings.eventDate}
                    onChange={(e) => setSettings({ ...settings, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Target Countdown (ISO / Date)</label>
                  <input
                    type="text"
                    value={settings.countdownTarget}
                    onChange={(e) => setSettings({ ...settings, countdownTarget: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Akad Nikah */}
            <div>
              <h3 className="font-serif text-lg font-bold text-[#404f6a] mb-4 pb-2 border-b border-slate-100">
                Detail Akad Nikah
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Judul Acara</label>
                  <input
                    type="text"
                    value={settings.events.akad.title}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, akad: { ...settings.events.akad, title: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Tanggal</label>
                  <input
                    type="text"
                    value={settings.events.akad.date}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, akad: { ...settings.events.akad, date: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Waktu / Jam</label>
                  <input
                    type="text"
                    value={settings.events.akad.time}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, akad: { ...settings.events.akad, time: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Tempat / Venue</label>
                  <input
                    type="text"
                    value={settings.events.akad.venue}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, akad: { ...settings.events.akad, venue: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={settings.events.akad.address}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, akad: { ...settings.events.akad, address: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Link Google Maps</label>
                  <input
                    type="text"
                    value={settings.events.akad.mapsUrl}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, akad: { ...settings.events.akad, mapsUrl: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Resepsi */}
            <div>
              <h3 className="font-serif text-lg font-bold text-[#404f6a] mb-4 pb-2 border-b border-slate-100">
                Detail Resepsi Pernikahan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Judul Acara</label>
                  <input
                    type="text"
                    value={settings.events.resepsi.title}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, resepsi: { ...settings.events.resepsi, title: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Tanggal</label>
                  <input
                    type="text"
                    value={settings.events.resepsi.date}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, resepsi: { ...settings.events.resepsi, date: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Waktu / Jam</label>
                  <input
                    type="text"
                    value={settings.events.resepsi.time}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, resepsi: { ...settings.events.resepsi, time: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Tempat / Venue</label>
                  <input
                    type="text"
                    value={settings.events.resepsi.venue}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, resepsi: { ...settings.events.resepsi, venue: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={settings.events.resepsi.address}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, resepsi: { ...settings.events.resepsi, address: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Link Google Maps</label>
                  <input
                    type="text"
                    value={settings.events.resepsi.mapsUrl}
                    onChange={(e) => setSettings({ ...settings, events: { ...settings.events, resepsi: { ...settings.events.resepsi, mapsUrl: e.target.value } } })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Musik & Audio */}
        {activeTab === 'music' && (
          <div className="space-y-6 text-xs">
            <h3 className="font-serif text-lg font-bold text-[#404f6a] mb-4 pb-2 border-b border-slate-100">
              Pengaturan Background Music
            </h3>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Judul Lagu</label>
              <input
                type="text"
                value={settings.music.title}
                onChange={(e) => setSettings({ ...settings, music: { ...settings.music, title: e.target.value } })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">URL Audio / File MP3</label>
              <input
                type="text"
                value={settings.music.url}
                onChange={(e) => setSettings({ ...settings, music: { ...settings.music, url: e.target.value } })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan link langsung ke file audio format .mp3 atau .ogg.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Rekening & Kado */}
        {activeTab === 'gifts' && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#404f6a]">
                    Daftar Rekening Bank &amp; E-Wallet
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aktifkan atau nonaktifkan rekening mana saja yang ingin dimunculkan pada undangan tamu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newBank = {
                      id: `bank-${Date.now()}`,
                      bankName: 'Bank BCA',
                      accountNumber: '',
                      accountHolder: settings.groom.fullName,
                      isActive: true,
                    };
                    setSettings({
                      ...settings,
                      digitalGifts: {
                        ...settings.digitalGifts,
                        bankAccounts: [...settings.digitalGifts.bankAccounts, newBank],
                      },
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Rekening</span>
                </button>
              </div>

              <div className="space-y-4">
                {settings.digitalGifts.bankAccounts.map((bank, idx) => {
                  const isEnabled = bank.isActive !== false;
                  return (
                    <div
                      key={bank.id}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        isEnabled
                          ? 'bg-slate-50/90 border-slate-200 shadow-sm'
                          : 'bg-slate-100/60 border-slate-200/60 opacity-80'
                      }`}
                    >
                      {/* Top Bar inside card: Status Badge & Toggle Switch */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              isEnabled
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`}
                            />
                            {isEnabled ? 'Muncul di Undangan' : 'Disembunyikan'}
                          </span>
                        </div>

                        {/* Interactive Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => {
                              const updated = [...settings.digitalGifts.bankAccounts];
                              updated[idx] = { ...updated[idx], isActive: e.target.checked };
                              setSettings({
                                ...settings,
                                digitalGifts: { ...settings.digitalGifts, bankAccounts: updated },
                              });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          <span className="ml-2 text-xs font-semibold text-slate-700">
                            {isEnabled ? 'Tampilkan' : 'Sembunyikan'}
                          </span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
                        <div>
                          <label className="block font-semibold text-slate-700 uppercase mb-1">
                            Nama Bank / E-Wallet
                          </label>
                          <input
                            type="text"
                            value={bank.bankName}
                            onChange={(e) => {
                              const updated = [...settings.digitalGifts.bankAccounts];
                              updated[idx] = { ...updated[idx], bankName: e.target.value };
                              setSettings({
                                ...settings,
                                digitalGifts: { ...settings.digitalGifts, bankAccounts: updated },
                              });
                            }}
                            placeholder="Contoh: Bank BCA, BNI, Mandiri"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 uppercase mb-1">
                            Nomor Rekening
                          </label>
                          <input
                            type="text"
                            value={bank.accountNumber}
                            onChange={(e) => {
                              const updated = [...settings.digitalGifts.bankAccounts];
                              updated[idx] = { ...updated[idx], accountNumber: e.target.value };
                              setSettings({
                                ...settings,
                                digitalGifts: { ...settings.digitalGifts, bankAccounts: updated },
                              });
                            }}
                            placeholder="Contoh: 1234567890"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block font-semibold text-slate-700 uppercase mb-1">
                              Atas Nama
                            </label>
                            <input
                              type="text"
                              value={bank.accountHolder}
                              onChange={(e) => {
                                const updated = [...settings.digitalGifts.bankAccounts];
                                updated[idx] = { ...updated[idx], accountHolder: e.target.value };
                                setSettings({
                                  ...settings,
                                  digitalGifts: { ...settings.digitalGifts, bankAccounts: updated },
                                });
                              }}
                              placeholder="Nama Pemilik Rekening"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = settings.digitalGifts.bankAccounts.filter(
                                (_, i) => i !== idx
                              );
                              setSettings({
                                ...settings,
                                digitalGifts: { ...settings.digitalGifts, bankAccounts: updated },
                              });
                            }}
                            title="Hapus Rekening"
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors h-[38px] flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Physical Gift Address */}
            <div>
              <h3 className="font-serif text-lg font-bold text-[#404f6a] mb-4 pb-2 border-b border-slate-100">
                Alamat Kirim Kado Fisik
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    value={settings.digitalGifts.physicalGift.recipientName}
                    onChange={(e) => setSettings({
                      ...settings,
                      digitalGifts: {
                        ...settings.digitalGifts,
                        physicalGift: { ...settings.digitalGifts.physicalGift, recipientName: e.target.value }
                      }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Nomor HP</label>
                  <input
                    type="text"
                    value={settings.digitalGifts.physicalGift.phone}
                    onChange={(e) => setSettings({
                      ...settings,
                      digitalGifts: {
                        ...settings.digitalGifts,
                        physicalGift: { ...settings.digitalGifts.physicalGift, phone: e.target.value }
                      }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Alamat Pengiriman</label>
                  <textarea
                    rows={2}
                    value={settings.digitalGifts.physicalGift.address}
                    onChange={(e) => setSettings({
                      ...settings,
                      digitalGifts: {
                        ...settings.digitalGifts,
                        physicalGift: { ...settings.digitalGifts.physicalGift, address: e.target.value }
                      }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Love Story */}
        {activeTab === 'story' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-[#404f6a]">
                Cerita Cinta (Love Story Milestones)
              </h3>
              <button
                type="button"
                onClick={() => {
                  const newStory = {
                    id: `story-${Date.now()}`,
                    title: 'Babak Baru',
                    year: '2026',
                    description: 'Tuliskan momen indah di sini...',
                  };
                  setSettings({
                    ...settings,
                    loveStory: [...settings.loveStory, newStory],
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Cerita</span>
              </button>
            </div>

            <div className="space-y-4">
              {settings.loveStory.map((story, idx) => (
                <div key={story.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 uppercase mb-1">Judul Fase</label>
                        <input
                          type="text"
                          value={story.title}
                          onChange={(e) => {
                            const updated = [...settings.loveStory];
                            updated[idx].title = e.target.value;
                            setSettings({ ...settings, loveStory: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 uppercase mb-1">Tahun / Periode</label>
                        <input
                          type="text"
                          value={story.year || ''}
                          onChange={(e) => {
                            const updated = [...settings.loveStory];
                            updated[idx].year = e.target.value;
                            setSettings({ ...settings, loveStory: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = settings.loveStory.filter((_, i) => i !== idx);
                        setSettings({ ...settings, loveStory: updated });
                      }}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">Cerita / Deskripsi</label>
                    <textarea
                      rows={2}
                      value={story.description}
                      onChange={(e) => {
                        const updated = [...settings.loveStory];
                        updated[idx].description = e.target.value;
                        setSettings({ ...settings, loveStory: updated });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </form>
  );
}

