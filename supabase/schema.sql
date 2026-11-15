-- ==========================================================
-- SUPABASE SCHEMA & SEED FOR WEDDING INVITATION (TIKA & RIDHO)
-- ==========================================================
-- Jalankan skrip ini di Supabase:
-- Dashboard -> Pilih Project -> SQL Editor -> New Query -> Tempel (Paste) -> Run
-- ==========================================================

-- 1. Table Settings
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table Guests
CREATE TABLE IF NOT EXISTS public.guests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  category TEXT DEFAULT 'Reguler',
  table_or_session TEXT DEFAULT 'Sesi 1 (08.00 - 10.00 WIB)',
  pax INTEGER DEFAULT 1,
  rsvp_status TEXT DEFAULT 'pending',
  rsvp_pax INTEGER DEFAULT 0,
  rsvp_message TEXT,
  rsvp_at TIMESTAMPTZ,
  is_checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table Wishes
CREATE TABLE IF NOT EXISTS public.wishes (
  id TEXT PRIMARY KEY,
  guest_id TEXT,
  name TEXT NOT NULL,
  attendance TEXT NOT NULL DEFAULT 'attending',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
DROP POLICY IF EXISTS "Public update settings" ON public.settings;
DROP POLICY IF EXISTS "Public read guests" ON public.guests;
DROP POLICY IF EXISTS "Public insert guests" ON public.guests;
DROP POLICY IF EXISTS "Public update guests" ON public.guests;
DROP POLICY IF EXISTS "Public delete guests" ON public.guests;
DROP POLICY IF EXISTS "Public read wishes" ON public.wishes;
DROP POLICY IF EXISTS "Public insert wishes" ON public.wishes;
DROP POLICY IF EXISTS "Public delete wishes" ON public.wishes;

-- Create Open Policies (Full functionality for wedding guests & admin)
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public update settings" ON public.settings FOR ALL USING (true);

CREATE POLICY "Public read guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Public insert guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update guests" ON public.guests FOR UPDATE USING (true);
CREATE POLICY "Public delete guests" ON public.guests FOR DELETE USING (true);

CREATE POLICY "Public read wishes" ON public.wishes FOR SELECT USING (true);
CREATE POLICY "Public insert wishes" ON public.wishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete wishes" ON public.wishes FOR DELETE USING (true);

-- ----------------------------------------------------------
-- SEED INITIAL DATA FROM LOCAL DATABASE
-- ----------------------------------------------------------

-- Seed Settings
INSERT INTO public.settings (id, data)
VALUES ('main', '{"groom":{"fullName":"Ridho Khairuman","nickname":"Ridho","fatherName":"Bapak Dadang Mulyana","motherName":"Ibu Zainab","childOrder":"Putra Pertama","instagram":"https://instagram.com/ridho","photoUrl":"/images/prewedding/groom-ridho.jpg"},"bride":{"fullName":"Martika Larassati., S.M.","nickname":"Tika","fatherName":"Bapak Sutikno","motherName":"Ibu Tumisih","childOrder":"Putri Pertama","instagram":"https://instagram.com/tika","photoUrl":"/images/prewedding/bride-tika.jpg"},"eventDate":"Sabtu, 12 Desember 2026","countdownTarget":"2026-12-12T08:00:00+07:00","quranVerse":{"surah":"QS. Ar-Rum : 21","translation":"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir."},"music":{"title":"Denny Caknan Feat Bella Bonita - SINARENGAN","url":"/audio/sinarengan.mp3","autoPlay":true},"events":{"akad":{"title":"Akad Nikah","date":"Sabtu, 12 Desember 2026","time":"Pukul : 08.00 WIB","venue":"Kediaman Mempelai Wanita","address":"Villa Gading Harapan Blok WA1 No.12A, Rt.002/Rw.021, Jl.Kurmatama, Kebalen, Babelan, Kab.Bekasi, Jawa Barat","mapsUrl":"https://maps.app.goo.gl/eoDsvfuK7e22VWY3A"},"resepsi":{"title":"Resepsi Pernikahan","date":"Sabtu, 12 Desember 2026","time":"Pukul : 11.00 - 19.00 WIB","venue":"Kediaman Mempelai Wanita","address":"Villa Gading Harapan Blok WA1 No.12A, Rt.002/Rw.021, Jl.Kurmatama, Kebalen, Babelan, Kab.Bekasi, Jawa Barat","mapsUrl":"https://maps.app.goo.gl/eoDsvfuK7e22VWY3A"}},"liveStream":{"enabled":true,"title":"Live Streaming Pernikahan","time":"Sabtu, 12 Desember 2026 | Pukul 08.00 WIB","account":"@tika_ridho","url":"https://instagram.com"},"loveStory":[{"id":"ls-1","title":"Awal Cerita","year":"2022","description":"Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Tanpa disadari, kebersamaan itu tumbuh menjadi rasa nyaman yang semakin kuat dari hari ke hari."},{"id":"ls-2","title":"Lamaran","year":"2025","description":"Dengan niat yang tulus dan restu keluarga, kami memutuskan untuk melangkah ke tahap yang lebih serius. Momen lamaran menjadi awal dari perjalanan baru yang penuh harapan dan doa baik."},{"id":"ls-3","title":"Pernikahan","year":"2026","description":"Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh cinta, kebahagiaan, dan keberkahan."}],"digitalGifts":{"bankAccounts":[{"id":"bank-1","bankName":"Bank BNI","accountNumber":"1785798133","accountHolder":"Ridho Khairuman"},{"id":"bank-2","bankName":"Bank Central Asia (BCA)","accountNumber":"7635241349","accountHolder":"Martika Larassati"}],"physicalGift":{"recipientName":"Tika & Ridho","phone":"","address":"Villa Gading Harapan Blok WA1 No.12A, Rt.002/Rw.021, Jl.Kurmatama, Kebalen, Babelan, Kab.Bekasi, Jawa Barat"}},"gallery":["/images/prewedding/gallery-blue-stairs-wide.jpg","/images/prewedding/gallery-blue-arch.jpg","/images/prewedding/gallery-blue-stairs-hands.jpg","/images/prewedding/gallery-casual-stand.jpg","/images/prewedding/gallery-lamaran.jpg","/images/prewedding/gallery-casual-flowers.jpg","/images/prewedding/gallery-traditional-kneel.jpg","/images/prewedding/gallery-traditional-chair.jpg","/images/prewedding/story-college.jpg","/images/prewedding/cover.jpg"]}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Seed Guests
INSERT INTO public.guests (id, name, slug, code, phone, category, table_or_session, pax, rsvp_status, rsvp_pax, rsvp_message, rsvp_at, is_checked_in, checked_in_at, checked_in_by, created_at)
VALUES ('gst-001', 'Bpk. Rahmat Hidayat & Partner', 'rahmat-hidayat', 'WED-RH-8419', '', 'VIP', 'Sesi 1 (11.00 - 14.00 WIB)', 2, 'attending', 2, 'Selamat menempuh hidup baru Tika & Ridho! Sakinah mawaddah warahmah.', '2026-11-11T11:55:04.065Z', TRUE, '2026-11-11T11:45:58.471Z', 'Petugas Meja Resepsionis', '2026-11-11T11:43:12.824Z')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  phone = EXCLUDED.phone,
  category = EXCLUDED.category,
  table_or_session = EXCLUDED.table_or_session,
  pax = EXCLUDED.pax,
  rsvp_status = EXCLUDED.rsvp_status,
  rsvp_pax = EXCLUDED.rsvp_pax,
  rsvp_message = EXCLUDED.rsvp_message,
  rsvp_at = EXCLUDED.rsvp_at,
  is_checked_in = EXCLUDED.is_checked_in,
  checked_in_at = EXCLUDED.checked_in_at,
  checked_in_by = EXCLUDED.checked_in_by;
INSERT INTO public.guests (id, name, slug, code, phone, category, table_or_session, pax, rsvp_status, rsvp_pax, rsvp_message, rsvp_at, is_checked_in, checked_in_at, checked_in_by, created_at)
VALUES ('gst-002', 'Keluarga Besar Bpk. Sutikno', 'keluarga-besar-sutikno', 'WED-KB-2041', '', 'Keluarga', 'Meja Keluarga Inti', 4, 'attending', 4, 'Alhamdulillah, selamat untuk anak tersayang Tika & Ridho. Lancar dan berkah selalu.', '2026-11-11T06:43:12.824Z', TRUE, NULL, NULL, '2026-11-11T11:43:12.824Z')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  phone = EXCLUDED.phone,
  category = EXCLUDED.category,
  table_or_session = EXCLUDED.table_or_session,
  pax = EXCLUDED.pax,
  rsvp_status = EXCLUDED.rsvp_status,
  rsvp_pax = EXCLUDED.rsvp_pax,
  rsvp_message = EXCLUDED.rsvp_message,
  rsvp_at = EXCLUDED.rsvp_at,
  is_checked_in = EXCLUDED.is_checked_in,
  checked_in_at = EXCLUDED.checked_in_at,
  checked_in_by = EXCLUDED.checked_in_by;
INSERT INTO public.guests (id, name, slug, code, phone, category, table_or_session, pax, rsvp_status, rsvp_pax, rsvp_message, rsvp_at, is_checked_in, checked_in_at, checked_in_by, created_at)
VALUES ('gst-003', 'Dimas Anggara, S.Kom', 'dimas-anggara', 'WED-DA-5532', '', 'Sahabat', 'Sesi 2 (14.00 - 17.00 WIB)', 1, 'attending', 1, NULL, NULL, TRUE, '2026-11-11T11:55:21.933Z', 'Petugas Meja Resepsionis', '2026-11-11T11:43:12.824Z')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  phone = EXCLUDED.phone,
  category = EXCLUDED.category,
  table_or_session = EXCLUDED.table_or_session,
  pax = EXCLUDED.pax,
  rsvp_status = EXCLUDED.rsvp_status,
  rsvp_pax = EXCLUDED.rsvp_pax,
  rsvp_message = EXCLUDED.rsvp_message,
  rsvp_at = EXCLUDED.rsvp_at,
  is_checked_in = EXCLUDED.is_checked_in,
  checked_in_at = EXCLUDED.checked_in_at,
  checked_in_by = EXCLUDED.checked_in_by;
INSERT INTO public.guests (id, name, slug, code, phone, category, table_or_session, pax, rsvp_status, rsvp_pax, rsvp_message, rsvp_at, is_checked_in, checked_in_at, checked_in_by, created_at)
VALUES ('gst-004', 'Rekan Kantor IT Solutions', 'rekan-kantor-it', 'WED-RK-9104', '', 'Rekan Kerja', 'Sesi 2 (14.00 - 17.00 WIB)', 3, 'attending', 3, 'Happy Wedding Tika & Ridho! Samawa ya selalu!', '2026-11-11T03:43:12.824Z', TRUE, '2026-11-11T13:17:31.482Z', 'Petugas Meja Resepsionis', '2026-11-11T11:43:12.824Z')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  phone = EXCLUDED.phone,
  category = EXCLUDED.category,
  table_or_session = EXCLUDED.table_or_session,
  pax = EXCLUDED.pax,
  rsvp_status = EXCLUDED.rsvp_status,
  rsvp_pax = EXCLUDED.rsvp_pax,
  rsvp_message = EXCLUDED.rsvp_message,
  rsvp_at = EXCLUDED.rsvp_at,
  is_checked_in = EXCLUDED.is_checked_in,
  checked_in_at = EXCLUDED.checked_in_at,
  checked_in_by = EXCLUDED.checked_in_by;
INSERT INTO public.guests (id, name, slug, code, phone, category, table_or_session, pax, rsvp_status, rsvp_pax, rsvp_message, rsvp_at, is_checked_in, checked_in_at, checked_in_by, created_at)
VALUES ('gst-005', 'Ibu Hj. Siti Nurhaliza', 'siti-nurhaliza', 'WED-SN-7721', '', 'VIP', 'Sesi 1 (11.00 - 14.00 WIB)', 2, 'declined', 0, 'Mohon maaf ananda Tika & Ridho, kami sedang ada tugas dinas luar kota. Doa terbaik menyertai kalian berdua.', '2026-11-10T23:43:12.824Z', FALSE, NULL, NULL, '2026-11-11T11:43:12.824Z')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  phone = EXCLUDED.phone,
  category = EXCLUDED.category,
  table_or_session = EXCLUDED.table_or_session,
  pax = EXCLUDED.pax,
  rsvp_status = EXCLUDED.rsvp_status,
  rsvp_pax = EXCLUDED.rsvp_pax,
  rsvp_message = EXCLUDED.rsvp_message,
  rsvp_at = EXCLUDED.rsvp_at,
  is_checked_in = EXCLUDED.is_checked_in,
  checked_in_at = EXCLUDED.checked_in_at,
  checked_in_by = EXCLUDED.checked_in_by;

-- Wishes table starts clean for real guest submissions
