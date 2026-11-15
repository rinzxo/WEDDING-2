# 💍 The Wedding of Martika & Ridho

Aplikasi undangan pernikahan digital eksklusif modern berbasis **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Supabase Cloud Database (PostgreSQL)** untuk pasangan **Martika Larassati (Tika)** & **Ridho Khairuman (Ridho)**.

---

## 🌟 Fitur Utama

### 📱 1. Undangan Tamu Digital (`/` & `/invitation/[slug]`)
- **Cover Interaktif & Musik Autoplay**: Monogram floral mewah, nama tamu personal, tombol *Buka Undangan*, dan pemutar musik piringan hitam interaktif.
- **Hero & Profil Mempelai**: Profil lengkap Martika Larassati, S.H. & Ridho Khairuman, S.T. dengan nuansa editorial modern berlatar biru keperakan.
- **Hitung Mundur (Countdown Timer)**: Realtime countdown menuju 12 Desember 2026 dan integrasi *Simpan ke Google Calendar*.
- **Rangkaian Acara**: Akad Nikah & Resepsi lengkap dengan waktu, lokasi, dan integrasi Google Maps.
- **Love Story Timeline**: Kisah perjalanan cinta dari bangku kuliah, masa LDR, hingga lamaran & pernikahan.
- **Galeri Foto Prewedding**: Galeri potret bertema arsitektur klasik Eropa dan busana tradisional Jawa.
- **Amplop Digital (Bank Transfer & QRIS)**: Rekening BNI & BCA resmi dengan tombol *Salin Nomor Rekening* serta QRIS dan alamat kado fisik.
- **Tiket Digital & QR Code Tamu**: Tiap tamu memiliki kode unik (contoh: `WED-TK-1001`) dan QR Code kehadiran instan.
- **Buku Tamu & RSVP Realtime**: Form konfirmasi kehadiran dan ucapan doa restu yang langsung terhubung ke database Supabase Cloud.

---

### 🛡️ 2. Panel Admin & Scanner Resepsionis (`/admin`)
- **Mobile-First Native Bottom Bar**: Navigasi bawah ala aplikasi native (Overview, Tamu, Scan QR, Ucapan, Setting).
- **Scanner QR Kehadiran (`/admin/scan`)**: Pemindai kamera responsif (kamera laptop & HP) dengan deteksi instan dan input manual.
- **Daftar Tamu (`/admin/guests`)**: Tabel data untuk desktop dan touch cards untuk mobile, dilengkapi tombol cepat WhatsApp Invite generator.
- **Buku Tamu & Moderasi (`/admin/wishes`)**: Tampilan tabel responsif di desktop dan kartu di mobile dengan indikator kehadiran fisik (Sudah Check-In vs Belum Check-In).
