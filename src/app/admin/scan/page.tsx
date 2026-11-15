'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  VolumeX,
  Search,
  Users,
  Clock,
  Sparkles,
  RefreshCw,
  Power,
  SwitchCamera,
  UserCheck,
  Check,
} from 'lucide-react';
import { Guest } from '@/lib/db';

export default function QRScannerPage() {
  const [scannerActive, setScannerActive] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Result state
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'already' | 'error' | null;
    message: string;
    guest?: Guest;
    timestamp?: string;
  }>({ status: null, message: '' });

  const [recentScans, setRecentScans] = useState<Guest[]>([]);
  const [stats, setStats] = useState({ totalCheckedIn: 0, totalPax: 0 });

  const html5QrCodeRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Fetch initial checked-in guests
  useEffect(() => {
    fetch('/api/admin/guests?checkin=yes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.guests)) {
          setRecentScans(data.guests.slice(0, 10));
          const totalPax = data.guests.reduce((acc: number, g: Guest) => acc + (g.pax || 1), 0);
          setStats({ totalCheckedIn: data.guests.length, totalPax });
        }
      })
      .catch((err) => console.log('Error fetching checked-in guests:', err));
  }, []);

  // Sound chime synthesizer
  const playSound = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.log('Audio feedback not available');
    }
  };

  const handleProcessCode = async (rawCode: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rawCode }),
      });

      const data = await res.json();
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      if (data.success) {
        if (data.alreadyCheckedIn) {
          playSound('warning');
          setScanResult({
            status: 'already',
            message: data.message,
            guest: data.guest,
            timestamp: timeStr,
          });
        } else {
          playSound('success');
          setScanResult({
            status: 'success',
            message: data.message || 'Check-in berhasil tercatat!',
            guest: data.guest,
            timestamp: timeStr,
          });
          if (data.guest) {
            setRecentScans((prev) => [data.guest, ...prev.filter((g) => g.id !== data.guest.id).slice(0, 9)]);
            setStats((prev) => ({
              totalCheckedIn: prev.totalCheckedIn + 1,
              totalPax: prev.totalPax + (data.guest.pax || 1),
            }));
          }
        }
      } else {
        playSound('error');
        setScanResult({
          status: 'error',
          message: data.message || 'QR Code tidak terdaftar dalam database.',
          timestamp: timeStr,
        });
      }
    } catch (err) {
      playSound('error');
      setScanResult({
        status: 'error',
        message: 'Gagal menghubungi server database.',
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1400); // 1.4s debounce before next scan
    }
  };

  const startScanner = async (overrideCameraId?: string) => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {}
      }

      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      const qr = html5QrCodeRef.current;
      const deviceId =
        overrideCameraId ||
        selectedCameraId ||
        (cameras.length > 0 ? cameras[0].id : { facingMode: 'environment' });

      await qr.start(
        deviceId,
        {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.76);
            return { width: Math.max(200, qrboxSize), height: Math.max(200, qrboxSize) };
          },
        },
        (decodedText: string) => {
          handleProcessCode(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );

      setScannerActive(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera aktif pada browser.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scannerActive) {
      try {
        await html5QrCodeRef.current.stop();
        setScannerActive(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    setSelectedCameraId(nextCamera.id);
    if (scannerActive) {
      await stopScanner();
      setTimeout(() => {
        startScanner(nextCamera.id);
      }, 300);
    }
  };

  useEffect(() => {
    let isMounted = true;
    import('html5-qrcode')
      .then(({ Html5Qrcode }) => Html5Qrcode.getCameras())
      .then((devs) => {
        if (!isMounted) return;
        setCameras(devs);
        if (devs.length > 0) {
          const backCam = devs.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('belakang')
          );
          setSelectedCameraId(backCam ? backCam.id : devs[0].id);
        }
      })
      .catch((err) => console.log('Camera enumeration error:', err));

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleProcessCode(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Inject custom styles for html5-qrcode video cover and scan animation */}
      <style jsx global>{`
        #qr-reader {
          border: none !important;
          background: #0b1120 !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1.25rem !important;
        }
        #qr-reader__scan_region {
          border-radius: 1.25rem !important;
        }
        #qr-reader__scan_region img {
          display: none !important;
        }
        @keyframes scanLineAnimation {
          0% {
            top: 8%;
            opacity: 0.1;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            top: 92%;
            opacity: 0.1;
          }
        }
        .animate-scan-line {
          animation: scanLineAnimation 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* =========================================================
          TOP STATS & DEVICE HEADER
          ========================================================= */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title & Live Status */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#D7AC64]/15 border border-[#D7AC64]/30 flex items-center justify-center text-[#D7AC64] shrink-0 shadow-xs">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-serif font-bold text-[#2b3951]">
                Scanner QR Kehadiran
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  scannerActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    scannerActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {scannerActive ? 'Kamera Aktif' : 'Standby'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Scan barcode / QR undangan tamu atau masukkan kode untuk check-in instan.
            </p>
          </div>
        </div>

        {/* Quick Action Controls: Toggle Camera, Switch Camera, Mute Sound */}
        <div className="flex items-center flex-wrap gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          
          {/* Sound Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            type="button"
            title={soundEnabled ? 'Matikan Suara Chime' : 'Aktifkan Suara Chime'}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              soundEnabled
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Suara Aktif' : 'Mute'}</span>
          </button>

          {/* Switch Camera Button (Mobile & Multi-cam) */}
          {cameras.length > 1 && (
            <button
              onClick={handleSwitchCamera}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200/80 transition-all active:scale-95"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Ganti Kamera</span>
            </button>
          )}

          {/* Start / Stop Camera Button */}
          {scannerActive ? (
            <button
              onClick={stopScanner}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all active:scale-95"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Matikan Kamera</span>
            </button>
          ) : (
            <button
              onClick={() => startScanner()}
              type="button"
              className="inline-flex items-center gap-1.5 px-5 py-2 sm:py-2.5 rounded-xl bg-[#D7AC64] hover:bg-[#c99e56] text-[#1e293b] text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Nyalakan Kamera</span>
            </button>
          )}
        </div>

      </div>

      {/* =========================================================
          MAIN RESPONSIVE GRID: SCANNER VIEWPORT + FEEDBACK
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* =========================================================
            LEFT COLUMN (LG: 7 COLS): CAMERA SCANNER & MANUAL FORM
            ========================================================= */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          
          {/* Camera Card Container */}
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/90 relative overflow-hidden">
            
            {/* Camera Select Dropdown (For Desktop with multiple webcams) */}
            {cameras.length > 1 && (
              <div className="mb-3 hidden sm:flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  Sumber Kamera:
                </span>
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    if (scannerActive) {
                      stopScanner().then(() => startScanner(e.target.value));
                    }
                  }}
                  className="bg-transparent border-none text-xs font-semibold text-[#2b3951] outline-none cursor-pointer max-w-[220px] truncate"
                >
                  {cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Kamera ${cam.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* =====================================================
                RESPONSIVE CAMERA VIEWFINDER:
                Mobile: aspect-[4/5] (tall portrait view like scanner app)
                Desktop: aspect-[16/10] / aspect-video
                ===================================================== */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner aspect-[4/5] sm:aspect-square md:aspect-[16/10] max-h-[480px] w-full flex items-center justify-center">
              
              {/* HTML5 QR Code Mount Element */}
              <div id="qr-reader" className="w-full h-full" />

              {/* Viewfinder Overlays & Corner Brackets */}
              {scannerActive && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-6">
                  
                  {/* Central Reticle Box with Golden Corner Brackets */}
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 border border-white/20 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex items-center justify-center">
                    
                    {/* Top-Left Corner */}
                    <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-[#D7AC64] rounded-tl-lg" />
                    {/* Top-Right Corner */}
                    <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-[#D7AC64] rounded-tr-lg" />
                    {/* Bottom-Left Corner */}
                    <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-[#D7AC64] rounded-bl-lg" />
                    {/* Bottom-Right Corner */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-[#D7AC64] rounded-br-lg" />

                    {/* Smooth Animated Golden Laser Scan Line */}
                    <div className="absolute inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-[#FFF4D0] to-transparent shadow-[0_0_12px_#D7AC64] animate-scan-line" />

                    {/* Subtitle instruction inside frame */}
                    <p className="absolute bottom-3 text-[10px] sm:text-xs text-white/70 tracking-wide font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Posisikan QR di dalam bingkai
                    </p>
                  </div>

                </div>
              )}

              {/* Standby Placeholder when Camera is Off */}
              {!scannerActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white p-6 text-center z-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mb-4 text-[#D7AC64] shadow-lg">
                    <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                    Kamera Sedang Nonaktif
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xs mt-1.5 mb-6 leading-relaxed">
                    Klik tombol di bawah untuk mengaktifkan scanner kamera HP / laptop Anda.
                  </p>
                  <button
                    onClick={() => startScanner()}
                    type="button"
                    className="px-8 py-3 rounded-full bg-[#D7AC64] hover:bg-[#c99e56] text-[#1e293b] font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Mulai Scan QR Tamu
                  </button>
                </div>
              )}

              {/* Live Processing Indicator */}
              {scannerActive && isProcessing && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center text-white z-20 animate-in fade-in duration-200">
                  <div className="text-center p-4">
                    <RefreshCw className="w-10 h-10 animate-spin text-[#D7AC64] mx-auto mb-3" />
                    <span className="text-xs sm:text-sm font-bold tracking-widest uppercase block text-[#FFEBB0]">
                      Memvalidasi QR Tamu...
                    </span>
                    <span className="text-[11px] text-slate-300 mt-1 block">
                      Sinkronisasi dengan database kehadiran
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Manual Code / Search Bar Form */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Atau Masukkan Kode / Barcode Manual
              </label>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ketik Kode Tamu (cth: WED-RH-8419 atau nama tamu)"
                    className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#D7AC64] focus:ring-2 focus:ring-[#D7AC64]/20 outline-none transition bg-slate-50 focus:bg-white"
                  />
                  <Search className="absolute left-3 top-3 sm:top-3.5 w-4 h-4 text-slate-400" />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing || !manualCode.trim()}
                  className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-[#2b3951] text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#1e293b] active:scale-95 transition-all disabled:opacity-50 shrink-0 cursor-pointer shadow-sm"
                >
                  Check-In
                </button>
              </form>
            </div>

          </div>

        </div>

        {/* =========================================================
            RIGHT COLUMN (LG: 5 COLS): CHECK-IN FEEDBACK & STATS
            ========================================================= */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          
          {/* Attendance Quick Stats (Total Tamu & Total Pax) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Tamu Hadir
                </p>
                <p className="text-xl sm:text-2xl font-serif font-bold text-[#2b3951]">
                  {stats.totalCheckedIn}{' '}
                  <span className="text-xs font-normal text-slate-500 font-sans">Undangan</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Total Pax
                </p>
                <p className="text-xl sm:text-2xl font-serif font-bold text-[#2b3951]">
                  {stats.totalPax}{' '}
                  <span className="text-xs font-normal text-slate-500 font-sans">Orang</span>
                </p>
              </div>
            </div>
          </div>

          {/* Result Card: Dynamic Feedback Banner */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/90">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D7AC64]" />
              <span>Status Check-In Terakhir</span>
            </h2>

            {/* SUCCESS STATE */}
            {scanResult.status === 'success' && scanResult.guest && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0 shadow-inner">
                    <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-100 block">
                      CHECK-IN BERHASIL!
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white truncate drop-shadow-sm mt-0.5">
                      {scanResult.guest.name}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-white/25">
                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <span className="text-[10px] text-emerald-100 uppercase tracking-wider block">Kategori</span>
                    <span className="font-bold text-sm text-white">{scanResult.guest.category}</span>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <span className="text-[10px] text-emerald-100 uppercase tracking-wider block">Kapasitas</span>
                    <span className="font-bold text-sm text-white">{scanResult.guest.pax} Orang</span>
                  </div>
                  <div className="col-span-2 bg-white/10 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-100 uppercase tracking-wider block">Sesi / Meja</span>
                      <span className="font-bold text-xs text-white">{scanResult.guest.tableOrSession || 'Reguler'}</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-100 font-semibold">
                      {scanResult.timestamp}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setScanResult({ status: null, message: '' })}
                  type="button"
                  className="mt-4 w-full py-2.5 bg-white text-emerald-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-50 active:scale-95 transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Scan Tamu Selanjutnya</span>
                </button>
              </div>
            )}

            {/* ALREADY CHECKED IN WARNING */}
            {scanResult.status === 'already' && scanResult.guest && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0 shadow-inner">
                    <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-100 block">
                      PERINGATAN: SUDAH CHECK-IN!
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white truncate drop-shadow-sm mt-0.5">
                      {scanResult.guest.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-amber-100 leading-relaxed pt-2 border-t border-white/25">
                  {scanResult.message}
                </p>

                <button
                  onClick={() => setScanResult({ status: null, message: '' })}
                  type="button"
                  className="mt-4 w-full py-2.5 bg-white text-amber-900 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-50 active:scale-95 transition shadow cursor-pointer"
                >
                  Tutup &amp; Lanjut Scan
                </button>
              </div>
            )}

            {/* ERROR / NOT FOUND */}
            {scanResult.status === 'error' && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-rose-100 block">
                      CHECK-IN GAGAL
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-1">
                      {scanResult.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setScanResult({ status: null, message: '' })}
                  type="button"
                  className="mt-4 w-full py-2 bg-white text-rose-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-rose-50 active:scale-95 transition shadow cursor-pointer"
                >
                  Coba Scan Lagi
                </button>
              </div>
            )}

            {/* IDLE / EMPTY STATE */}
            {!scanResult.status && (
              <div className="p-8 sm:p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center text-slate-400">
                <QrCode className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  Belum ada QR dipindai
                </p>
                <p className="text-[11px] text-slate-400 max-w-[220px] mt-1">
                  Arahkan QR tiket tamu ke kamera untuk memvalidasi kehadiran secara otomatis.
                </p>
              </div>
            )}

          </div>

          {/* Recent Scans Feed */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/90">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D7AC64]" />
                <span>Riwayat Check-In Terakhir</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {recentScans.length} Tamu
              </span>
            </div>

            {recentScans.length > 0 ? (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {recentScans.map((g, idx) => (
                  <div
                    key={`${g.id}-${idx}`}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between text-xs transition"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-slate-800 truncate">{g.name}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-[#2b3951]">{g.category}</span>
                        <span>&bull;</span>
                        <span>{g.pax} Pax</span>
                        <span>&bull;</span>
                        <span className="truncate">{g.tableOrSession || 'Reguler'}</span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      Hadir
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                Belum ada tamu dipindai pada sesi ini.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
