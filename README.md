# 💍 Undangan Pernikahan Digital (Full-Stack) - Habib & Adiba

Aplikasi undangan digital pernikahan modern & mewah berbasis **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Persistent JSON Database**, didesain mengacu pada tema referensi [inv.punakawandigital.id/spesial-03](http://inv.punakawandigital.id/spesial-03).

---

## 🌟 Fitur Utama

### 📱 1. Frontend Undangan Tamu (Guest Experience)
- **Cover Reveal Interaktif**: Amplop pembuka dengan monogram pasangan, nama tamu personal, dan tombol *"Buka Undangan"*.
- **Background Music Player**: Pemutar musik otomatis/manual dengan efek piringan hitam (*vinyl disc*) yang berputar elegan saat musik diputar.
- **Hero & Mempelai**: Profil lengkap mempelai pria (*Habib Yulianto*) & wanita (*Adiba Putri Syakila*), foto berbingkai kubah (*arch luxury*), nama orang tua, dan tautan Instagram.
- **Ayat Suci**: Kutipan QS. Ar-Rum: 21 dengan tipografi kaligrafi & editorial.
- **Hitung Mundur (Countdown Timer)**: Hitung mundur hari, jam, menit, detik dan tombol 1-klik *"Simpan ke Kalender"* (Google Calendar).
- **Rangkaian Acara**: Kartu detail Akad Nikah & Resepsi lengkap dengan waktu, tempat, dan tombol langsung ke Google Maps.
- **Live Streaming**: Kartu pengumuman siaran langsung pernikahan virtual (Instagram Live).
- **Love Story Timeline**: Linimasa kisah cinta (*Awal Cerita*, *Lamaran*, *Pernikahan*).
- **Galeri Foto & Lightbox**: Galeri foto pre-wedding dengan pop-up tampilan layar penuh.
- **Amplop Digital & Kado Fisik**: Rekening bank BCA & Mandiri dengan tombol *"Salin No. Rekening"* instan serta alamat pengiriman kado fisik.
- 🎟️ **QR Code Kehadiran (Tiket Digital Unik)**:
  - Tiap tamu memiliki QR Code dan kode unik tersendiri (contoh: `WED-RH-8419`).
  - Menampilkan nama tamu, kategori (VIP, Keluarga, dll), kuota kehadiran (pax), dan status kehadiran (*Belum Check-In* / *Sudah Check-In*).
  - Dilengkapi tombol *"Download / Simpan Tiket QR"* untuk akses offline.
- **Buku Tamu & RSVP Online**: Form konfirmasi kehadiran (Hadir, Tidak Hadir, Ragu-ragu), jumlah pax, doa restu, efek selebrasi *confetti*, dan daftar ucapan publik secara realtime.

---

### 🛡️ 2. Dashboard Admin & Scanner Kehadiran (`/admin`)
- **Dashboard Overview (`/admin`)**:
  - Statistik realtime: Total Tamu Diundang, Jumlah Pax, Konfirmasi Hadir/Tidak, Total Check-In di Lokasi, dan Total Ucapan.
  - Grafik persentase kehadiran per kategori (VIP, Keluarga, Sahabat, dll).
  - Log aktivitas check-in tamu terbaru secara langsung.
- **Manajemen Tamu & WhatsApp Invite (`/admin/guests`)**:
  - Tambah, edit, dan hapus tamu undangan.
  - Pencarian cepat & filter berdasarkan kategori, status RSVP, dan kehadiran fisik.
  - **1-Click WhatsApp Invite Generator**: Membuat draf pesan undangan personal resmi lengkap dengan link khusus tamu (`/invitation/{slug}`) yang dapat langsung dikirim via WhatsApp Web/App hanya dengan 1 klik!
  - Pop-up preview QR Code tamu dan tombol unduh.
- 📷 **Scanner QR Kehadiran Realtime (`/admin/scan`)**:
  - Pemindai kamera langsung (mendukung kamera laptop/webcam dan kamera belakang HP).
  - Umpan balik suara (*audio chime synthesizer*) saat scan berhasil.
  - Pencegahan *duplicate check-in*: sistem memberikan peringatan jika tamu sudah pernah scan sebelumnya.
  - Opsi pencarian/input kode manual untuk petugas resepsionis.
- **Pengaturan Undangan (`/admin/settings`)**:
  - Ubah data mempelai pria & wanita (nama lengkap, panggilan, orang tua, foto, instagram).
  - Ubah waktu & tempat acara Akad & Resepsi, target countdown, serta Google Maps.
  - Ubah lagu & audio URL background music.
  - Kelola daftar rekening bank, e-wallet, dan alamat kirim kado.
  - Tambah & sunting kisah cinta (*Love Story*).
- **Moderasi Buku Tamu (`/admin/wishes`)**:
  - Pantau dan hapus ucapan spam atau tidak pantas.

---

## 🚀 Cara Menjalankan Aplikasi

1. **Jalankan Aplikasi (Production Mode)**:
   ```bash
   npm run build
   npm start
   ```
   Aplikasi akan aktif di `http://localhost:3000`.

2. **Jalankan Mode Pengembangan (Dev Mode)**:
   ```bash
   npm run dev
   ```

---

## 🔗 Akses Halaman & Rute

| Halaman | URL | Keterangan |
|---|---|---|
| **Undangan Publik** | `http://localhost:3000/` | Undangan default dengan pratinjau umum |
| **Undangan Tamu Tertentu** | `http://localhost:3000/invitation/rahmat-hidayat` | Halaman personal khusus tamu dengan nama & QR unik |
| **Dashboard Admin** | `http://localhost:3000/admin` | Ringkasan statistik & metrik kehadiran |
| **Kelola Tamu & WA** | `http://localhost:3000/admin/guests` | Daftar tamu, tambah tamu, kirim WA, lihat QR |
| **Scanner QR Kehadiran** | `http://localhost:3000/admin/scan` | Kamera scanner untuk resepsionis acara |
| **Pengaturan Undangan** | `http://localhost:3000/admin/settings` | Pengaturan lengkap mempelai, acara, kado |
| **Moderasi Ucapan** | `http://localhost:3000/admin/wishes` | Kelola pesan buku tamu |

