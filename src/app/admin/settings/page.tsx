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
  Images,
  LayoutGrid,
  Columns,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Maximize2,
  X,
} from 'lucide-react';
import CloudinaryUploader from '@/components/admin/CloudinaryUploader';
import { WeddingSettings, GalleryConfig, GalleryItem, CloudinaryConfig } from '@/lib/db';

export default function WeddingSettingsPage() {
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'couple' | 'events' | 'music' | 'gifts' | 'story' | 'gallery'>('couple');

  // Cloudinary connection status & testing
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{
    configured: boolean;
    cloudName?: string;
    folder?: string;
  } | null>(null);
  const [testingCloudinary, setTestingCloudinary] = useState(false);
  const [cloudinaryTestResult, setCloudinaryTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showCloudinarySettings, setShowCloudinarySettings] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [manualPhotoUrl, setManualPhotoUrl] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const fetchCloudinaryStatus = () => {
    fetch('/api/admin/cloudinary/test')
      .then((res) => res.json())
      .then((data) => {
        setCloudinaryStatus({
          configured: !!data.configured,
          cloudName: data.cloudName,
          folder: data.folder || 'UNDANGAN',
        });
      })
      .catch(() => {});
  };

  const handleTestCloudinary = async () => {
    if (!settings) return;
    setTestingCloudinary(true);
    setCloudinaryTestResult(null);
    try {
      const res = await fetch('/api/admin/cloudinary/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudName: settings.cloudinary?.cloudName,
          apiKey: settings.cloudinary?.apiKey,
          apiSecret: settings.cloudinary?.apiSecret,
          uploadPreset: settings.cloudinary?.uploadPreset,
        }),
      });
      const data = await res.json();
      setCloudinaryTestResult({
        success: !!data.success,
        message: data.message || (data.success ? 'Koneksi berhasil!' : 'Koneksi gagal'),
      });
      if (data.success) {
        setCloudinaryStatus({
          configured: true,
          cloudName: settings.cloudinary?.cloudName,
          folder: settings.cloudinary?.folder || 'UNDANGAN',
        });
      }
    } catch (err: any) {
      setCloudinaryTestResult({
        success: false,
        message: err.message || 'Gagal menghubungi server',
      });
    } finally {
      setTestingCloudinary(false);
    }
  };

  const handlePhotosUploaded = (urls: string[]) => {
    if (!settings) return;
    const currentUrls = settings.gallery || [];
    const currentItems = settings.galleryItems || currentUrls.map((u, i) => ({ id: `img-${i}`, url: u }));
    const newItems = urls.map((u, i) => ({
      id: `img-${Date.now()}-${i}`,
      url: u,
      span: 'single' as const,
    }));
    setSettings({
      ...settings,
      gallery: [...currentUrls, ...urls],
      galleryItems: [...currentItems, ...newItems],
    });
  };

  const handleAddManualPhoto = () => {
    if (!settings || !manualPhotoUrl.trim()) return;
    const url = manualPhotoUrl.trim();
    const currentUrls = settings.gallery || [];
    const currentItems = settings.galleryItems || currentUrls.map((u, i) => ({ id: `img-${i}`, url: u }));
    setSettings({
      ...settings,
      gallery: [...currentUrls, url],
      galleryItems: [...currentItems, { id: `img-${Date.now()}`, url, span: 'single' as const }],
    });
    setManualPhotoUrl('');
  };

  const movePhoto = (fromIdx: number, toIdx: number) => {
    if (!settings || toIdx < 0) return;
    const list = [...(settings.gallery || [])];
    if (toIdx >= list.length) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);

    const itemsList = settings.galleryItems ? [...settings.galleryItems] : [];
    if (itemsList.length === list.length) {
      const [movedItem] = itemsList.splice(fromIdx, 1);
      itemsList.splice(toIdx, 0, movedItem);
    }

    setSettings({
      ...settings,
      gallery: list,
      galleryItems: itemsList.length > 0 ? itemsList : undefined,
    });
  };

  const deletePhoto = (index: number) => {
    if (!settings) return;
    if (!confirm('Hapus foto ini dari galeri?')) return;
    const updated = settings.gallery.filter((_, i) => i !== index);
    const updatedItems = settings.galleryItems ? settings.galleryItems.filter((_, i) => i !== index) : undefined;
    setSettings({
      ...settings,
      gallery: updated,
      galleryItems: updatedItems,
    });
  };

  const togglePhotoSpan = (index: number) => {
    if (!settings) return;
    const currentItems =
      settings.galleryItems && settings.galleryItems.length === settings.gallery.length
        ? [...settings.galleryItems]
        : settings.gallery.map((u, i) => ({ id: `img-${i}`, url: u, span: 'single' as const }));

    const currentSpan = currentItems[index]?.span || 'single';
    currentItems[index] = {
      ...currentItems[index],
      span: currentSpan === 'wide' ? 'single' : 'wide',
    };

    setSettings({
      ...settings,
      galleryItems: currentItems,
    });
  };

  const updateGalleryConfig = (key: keyof GalleryConfig, value: any) => {
    if (!settings) return;
    const currentConfig: GalleryConfig = settings.galleryConfig || {
      layout: 'editorial',
      columnsDesktop: 3,
      columnsMobile: 2,
      gap: 'md',
      aspectRatio: 'original',
    };
    setSettings({
      ...settings,
      galleryConfig: {
        ...currentConfig,
        [key]: value,
      },
    });
  };

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
    fetchCloudinaryStatus();
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

        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'gallery'
              ? 'border-[#d7ac64] text-[#2b3951]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Images className="w-4 h-4" />
          <span>Galeri &amp; Grid</span>
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <label className="block font-semibold text-slate-700 uppercase">URL Foto Mempelai Pria</label>
                    <CloudinaryUploader
                      compact
                      folder="UNDANGAN"
                      label="Upload ke Cloudinary"
                      onUploaded={(urls) => {
                        if (urls[0]) {
                          setSettings({ ...settings, groom: { ...settings.groom, photoUrl: urls[0] } });
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {settings.groom.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={settings.groom.photoUrl}
                        alt="Foto Groom"
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                      />
                    )}
                    <input
                      type="text"
                      value={settings.groom.photoUrl}
                      onChange={(e) => setSettings({ ...settings, groom: { ...settings.groom, photoUrl: e.target.value } })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                    />
                  </div>
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <label className="block font-semibold text-slate-700 uppercase">URL Foto Mempelai Wanita</label>
                    <CloudinaryUploader
                      compact
                      folder="UNDANGAN"
                      label="Upload ke Cloudinary"
                      onUploaded={(urls) => {
                        if (urls[0]) {
                          setSettings({ ...settings, bride: { ...settings.bride, photoUrl: urls[0] } });
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {settings.bride.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={settings.bride.photoUrl}
                        alt="Foto Bride"
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                      />
                    )}
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
                Gunakan link langsung ke file audio format .mp3 atau .ogg (default: /audio/sinarengan.mp3).
              </p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Offset Waktu Mulai Lagu (Detik)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.music.startTime || 0}
                onChange={(e) => setSettings({ ...settings, music: { ...settings.music, startTime: Number(e.target.value) || 0 } })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                placeholder="0"
              />
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                ✨ File lagu bawaan sudah otomatis dipotong langsung ke bagian tengah (Reff/Chorus) dengan intro instan. Nilai 0 berarti lagu langsung mulai dari bagian reff tersebut.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Rekening & Kado */}
        {activeTab === 'gifts' && (
          <div className="space-y-8">
            {/* Master Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Tampilkan Bagian Amplop Digital</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jika dinonaktifkan atau semua rekening dihapus/dimatikan, seluruh kartu amplop digital &amp; kado fisik akan otomatis hilang dari undangan tamu.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={settings.digitalGifts.enabled !== false}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      digitalGifts: {
                        ...settings.digitalGifts,
                        enabled: e.target.checked,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

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
                        bankAccounts: [...(settings.digitalGifts.bankAccounts || []), newBank],
                      },
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Rekening</span>
                </button>
              </div>

              {(!settings.digitalGifts.bankAccounts || settings.digitalGifts.bankAccounts.length === 0) ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center bg-slate-50/50">
                  <p className="text-xs text-slate-500">Belum ada rekening yang ditambahkan.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Klik tombol &quot;Tambah Rekening&quot; di atas untuk menambahkan rekening bank atau e-wallet baru.</p>
                </div>
              ) : (
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
              )}
            </div>

            {/* Physical Gift Address */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#404f6a]">
                    Alamat Kirim Kado Fisik
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aktifkan jika ingin menyediakan opsi pengiriman kado fisik ke alamat Anda.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={settings.digitalGifts.physicalGift?.enabled !== false}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        digitalGifts: {
                          ...settings.digitalGifts,
                          physicalGift: {
                            ...settings.digitalGifts.physicalGift,
                            enabled: e.target.checked,
                          },
                        },
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
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
        {/* Tab 6: Galeri Foto & Grid Layout */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            {/* Header & Cloudinary Status Bar */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2b3951] flex items-center gap-2">
                    <Images className="w-5 h-5 text-[#d7ac64]" />
                    <span>Galeri Foto &amp; Cloudinary</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload foto langsung ke folder Cloudinary <strong className="text-slate-800 font-semibold">UNDANGAN</strong> dan atur tata letak grid responsif.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      cloudinaryStatus?.configured
                        ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100/90 text-amber-800 border border-amber-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cloudinaryStatus?.configured ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <span>
                      {cloudinaryStatus?.configured
                        ? `Cloudinary Aktif (${cloudinaryStatus.cloudName || 'Terkoneksi'})`
                        : 'Cloudinary Belum Diatur'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCloudinarySettings(!showCloudinarySettings)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>{showCloudinarySettings ? 'Tutup Pengaturan' : 'Atur Akun'}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Cloudinary Settings Form */}
              {showCloudinarySettings && (
                <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <UploadCloud className="w-4 h-4 text-[#d7ac64]" />
                      <span>Kredensial Akun Cloudinary</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Bisa juga diatur via file <code className="bg-slate-100 px-1 py-0.5 rounded">.env.local</code>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">
                        Cloud Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="contoh: dxyz123ab"
                        value={settings.cloudinary?.cloudName || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            cloudinary: {
                              ...settings.cloudinary,
                              cloudName: e.target.value.trim(),
                              folder: settings.cloudinary?.folder || 'UNDANGAN',
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">API Key</label>
                      <input
                        type="text"
                        placeholder="contoh: 123456789012345"
                        value={settings.cloudinary?.apiKey || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            cloudinary: {
                              ...settings.cloudinary,
                              cloudName: settings.cloudinary?.cloudName || '',
                              apiKey: e.target.value.trim(),
                              folder: settings.cloudinary?.folder || 'UNDANGAN',
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">API Secret</label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          placeholder="Masukkan API Secret"
                          value={settings.cloudinary?.apiSecret || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              cloudinary: {
                                ...settings.cloudinary,
                                cloudName: settings.cloudinary?.cloudName || '',
                                apiSecret: e.target.value.trim(),
                                folder: settings.cloudinary?.folder || 'UNDANGAN',
                              },
                            })
                          }
                          className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">
                        Upload Preset (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="contoh: ml_default"
                        value={settings.cloudinary?.uploadPreset || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            cloudinary: {
                              ...settings.cloudinary,
                              cloudName: settings.cloudinary?.cloudName || '',
                              uploadPreset: e.target.value.trim(),
                              folder: settings.cloudinary?.folder || 'UNDANGAN',
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase mb-1">
                        Folder Penyimpanan
                      </label>
                      <input
                        type="text"
                        value={settings.cloudinary?.folder || 'UNDANGAN'}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            cloudinary: {
                              ...settings.cloudinary,
                              cloudName: settings.cloudinary?.cloudName || '',
                              folder: e.target.value.trim() || 'UNDANGAN',
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#d7ac64] outline-none bg-slate-50 font-medium"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Default otomatis: &quot;UNDANGAN&quot;</p>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        disabled={testingCloudinary}
                        onClick={handleTestCloudinary}
                        className="w-full px-4 py-2 rounded-xl bg-slate-800 hover:bg-[#d7ac64] text-white font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        {testingCloudinary ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Menguji...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tes Koneksi</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {cloudinaryTestResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                        cloudinaryTestResult.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-red-50 border-red-200 text-red-900'
                      }`}
                    >
                      {cloudinaryTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )}
                      <span>{cloudinaryTestResult.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 2: Pilihan Tata Letak Grid (Layout Controls) */}
            <div className="space-y-6">
              <div>
                <h4 className="font-serif text-base font-bold text-[#404f6a] mb-1">
                  Pengaturan Tata Letak Grid (Layout Style)
                </h4>
                <p className="text-xs text-slate-500">
                  Pilih gaya tampilan galeri foto dan konfigurasikan jumlah kolom di HP maupun layar komputer.
                </p>
              </div>

              {/* 3 Layout Mode Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Editorial Magazine */}
                <div
                  onClick={() => updateGalleryConfig('layout', 'editorial')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                    (settings.galleryConfig?.layout || 'editorial') === 'editorial'
                      ? 'border-[#d7ac64] bg-[#d7ac64]/5 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
                        <Layers className="w-4 h-4 text-[#d7ac64]" />
                        <span>Editorial Magazine</span>
                      </div>
                      {(settings.galleryConfig?.layout || 'editorial') === 'editorial' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d7ac64]" />
                      )}
                    </div>

                    {/* Mini Visual Diagram */}
                    <div className="h-20 w-full bg-slate-100 rounded-xl p-2 flex flex-col gap-1.5 mb-3">
                      <div className="h-6 w-full bg-[#d7ac64]/40 rounded" />
                      <div className="flex-1 grid grid-cols-2 gap-1.5">
                        <div className="h-full bg-slate-300/80 rounded" />
                        <div className="h-full bg-slate-300/80 rounded" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Pola majalah modern dengan variasi foto sorotan lebar di awal dan foto-foto berdampingan yang berirama harmonis.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#d7ac64] uppercase tracking-wider mt-3 block">
                    {(settings.galleryConfig?.layout || 'editorial') === 'editorial' ? '✓ Aktif Digunakan' : 'Pilih Mode Ini'}
                  </span>
                </div>

                {/* 2. Masonry Estetik */}
                <div
                  onClick={() => updateGalleryConfig('layout', 'masonry')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                    settings.galleryConfig?.layout === 'masonry'
                      ? 'border-[#d7ac64] bg-[#d7ac64]/5 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
                        <Columns className="w-4 h-4 text-[#d7ac64]" />
                        <span>Masonry Estetik</span>
                      </div>
                      {settings.galleryConfig?.layout === 'masonry' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d7ac64]" />
                      )}
                    </div>

                    {/* Mini Visual Diagram */}
                    <div className="h-20 w-full bg-slate-100 rounded-xl p-2 grid grid-cols-3 gap-1.5 mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="h-7 bg-[#d7ac64]/40 rounded" />
                        <div className="h-8 bg-slate-300/80 rounded" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="h-10 bg-slate-300/80 rounded" />
                        <div className="h-5 bg-[#d7ac64]/40 rounded" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="h-6 bg-slate-300/80 rounded" />
                        <div className="h-9 bg-slate-300/80 rounded" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Mengalir alami bertumpuk vertikal seperti Pinterest. Setiap foto tampil utuh tanpa terpotong crop (portrait &amp; landscape serasi).
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#d7ac64] uppercase tracking-wider mt-3 block">
                    {settings.galleryConfig?.layout === 'masonry' ? '✓ Aktif Digunakan' : 'Pilih Mode Ini'}
                  </span>
                </div>

                {/* 3. Grid Simetris */}
                <div
                  onClick={() => updateGalleryConfig('layout', 'grid')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                    settings.galleryConfig?.layout === 'grid'
                      ? 'border-[#d7ac64] bg-[#d7ac64]/5 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
                        <LayoutGrid className="w-4 h-4 text-[#d7ac64]" />
                        <span>Grid Simetris</span>
                      </div>
                      {settings.galleryConfig?.layout === 'grid' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d7ac64]" />
                      )}
                    </div>

                    {/* Mini Visual Diagram */}
                    <div className="h-20 w-full bg-slate-100 rounded-xl p-2 grid grid-cols-3 gap-1.5 mb-3">
                      <div className="h-7 bg-[#d7ac64]/40 rounded" />
                      <div className="h-7 bg-slate-300/80 rounded" />
                      <div className="h-7 bg-slate-300/80 rounded" />
                      <div className="h-7 bg-slate-300/80 rounded" />
                      <div className="h-7 bg-slate-300/80 rounded" />
                      <div className="h-7 bg-[#d7ac64]/40 rounded" />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Barisan kotak simetris rapi dengan ukuran rasio seragam. Foto dapat dipilih untuk dijadikan sorotan lebar (span 2 kolom).
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#d7ac64] uppercase tracking-wider mt-3 block">
                    {settings.galleryConfig?.layout === 'grid' ? '✓ Aktif Digunakan' : 'Pilih Mode Ini'}
                  </span>
                </div>
              </div>

              {/* Fine-Tuning Controls: Columns, Gap, Aspect Ratio */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Kolom Desktop */}
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-2">
                    Kolom Desktop (Komputer)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                    {[2, 3, 4].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => updateGalleryConfig('columnsDesktop', col)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          (settings.galleryConfig?.columnsDesktop || 3) === col
                            ? 'bg-[#2b3951] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {col} Kolom
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kolom Mobile */}
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-2">
                    Kolom Mobile (HP)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                    {[1, 2].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => updateGalleryConfig('columnsMobile', col)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          (settings.galleryConfig?.columnsMobile || 2) === col
                            ? 'bg-[#2b3951] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {col === 1 ? '1 Kolom' : '2 Kolom'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jarak / Gap */}
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-2">
                    Jarak Antar Foto (Gap)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                    {[
                      { val: 'sm', label: 'Rapat' },
                      { val: 'md', label: 'Sedang' },
                      { val: 'lg', label: 'Luas' },
                    ].map((g) => (
                      <button
                        key={g.val}
                        type="button"
                        onClick={() => updateGalleryConfig('gap', g.val)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          (settings.galleryConfig?.gap || 'md') === g.val
                            ? 'bg-[#2b3951] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rasio Foto (khusus Grid) */}
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-2">
                    Rasio Foto (Mode Grid)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                    {[
                      { val: 'original', label: 'Alami' },
                      { val: 'square', label: 'Kotak (1:1)' },
                      { val: 'portrait', label: 'Portrait (3:4)' },
                      { val: 'landscape', label: 'Landscape' },
                    ].map((asp) => (
                      <button
                        key={asp.val}
                        type="button"
                        onClick={() => updateGalleryConfig('aspectRatio', asp.val)}
                        className={`py-1 rounded-lg text-[11px] font-bold transition-all ${
                          (settings.galleryConfig?.aspectRatio || 'original') === asp.val
                            ? 'bg-[#2b3951] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {asp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Upload Foto Baru ke Cloudinary */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#404f6a]">
                    Upload Foto ke Cloudinary
                  </h4>
                  <p className="text-xs text-slate-500">
                    Foto yang diupload otomatis disimpan ke folder <strong className="text-slate-800 font-semibold">UNDANGAN</strong> di Cloudinary Anda.
                  </p>
                </div>
              </div>

              {/* Full Drag & Drop Zone */}
              <CloudinaryUploader
                multiple
                folder={settings.cloudinary?.folder || 'UNDANGAN'}
                label="Pilih Foto Galeri"
                onUploaded={handlePhotosUploaded}
              />

              {/* Opsi Tambah Manual URL */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Atau tempel URL gambar eksternal (https://...)"
                  value={manualPhotoUrl}
                  onChange={(e) => setManualPhotoUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#d7ac64] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddManualPhoto}
                  disabled={!manualPhotoUrl.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-[#d7ac64] text-white text-xs font-semibold transition-all disabled:opacity-50 active:scale-95 cursor-pointer shadow-sm"
                >
                  Tambah URL
                </button>
              </div>
            </div>

            {/* Section 4: Kelola Daftar Foto Galeri (Reorder, Span, Hapus) */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#404f6a] flex items-center gap-2">
                    <span>Daftar Foto Galeri</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-bold">
                      {settings.gallery?.length || 0} Foto
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gunakan tombol panah untuk mengatur urutan foto, atau aktifkan mode &quot;Sorotan&quot; untuk memperbesar foto pada mode grid.
                  </p>
                </div>
              </div>

              {(!settings.gallery || settings.gallery.length === 0) ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-400 text-xs">
                  Belum ada foto di galeri. Silakan upload foto menggunakan kotak upload di atas.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {settings.gallery.map((url, idx) => {
                    const item = settings.galleryItems?.[idx];
                    const isWide = item?.span === 'wide';
                    const isCloudinary = url.includes('cloudinary.com');

                    return (
                      <div
                        key={`${url}-${idx}`}
                        className={`group relative rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col ${
                          isWide ? 'border-[#d7ac64] ring-2 ring-[#d7ac64]/20' : 'border-slate-200'
                        }`}
                      >
                        {/* Photo Thumbnail Container */}
                        <div
                          onClick={() => setPreviewModalUrl(url)}
                          className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Galeri ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />

                          {/* Order Number Badge */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
                            #{idx + 1}
                          </div>

                          {/* Cloudinary Indicator Badge */}
                          {isCloudinary && (
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-blue-600/90 text-white text-[9px] font-semibold tracking-wide">
                              Cloud
                            </div>
                          )}

                          {/* Lightbox Hover Icon */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5 drop-shadow" />
                          </div>
                        </div>

                        {/* Card Controls */}
                        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                          {/* Col-Span Toggle (Normal vs Wide) */}
                          <button
                            type="button"
                            onClick={() => togglePhotoSpan(idx)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isWide
                                ? 'bg-[#d7ac64] text-[#2b3951]'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                            title="Atur ukuran foto (1 Kolom / 2 Kolom Lebar)"
                          >
                            {isWide ? 'Lebar 2x' : '1 Kol'}
                          </button>

                          {/* Action Buttons: Move Up, Move Down, Delete */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => movePhoto(idx, idx - 1)}
                              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Geser ke kiri / urutan sebelumnya"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={idx === settings.gallery.length - 1}
                              onClick={() => movePhoto(idx, idx + 1)}
                              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Geser ke kanan / urutan berikutnya"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => deletePhoto(idx)}
                              className="p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                              title="Hapus foto dari galeri"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lightbox Preview Modal in Admin */}
        {previewModalUrl && (
          <div
            onClick={() => setPreviewModalUrl(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10"
            >
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalUrl}
                alt="Preview Galeri"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            </div>
          </div>
        )}

      </div>
    </form>
  );
}

