const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let sql = `-- ==========================================================
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
VALUES ('main', '${JSON.stringify(db.settings).replace(/'/g, "''")}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Seed Guests
`;

for (const g of db.guests) {
  const rsvpAt = g.rsvpAt ? `'${g.rsvpAt}'` : 'NULL';
  const checkedInAt = g.checkedInAt ? `'${g.checkedInAt}'` : 'NULL';
  const checkedInBy = g.checkedInBy ? `'${g.checkedInBy.replace(/'/g, "''")}'` : 'NULL';
  const rsvpMsg = g.rsvpMessage ? `'${g.rsvpMessage.replace(/'/g, "''")}'` : 'NULL';

  sql += `INSERT INTO public.guests (id, name, slug, code, phone, category, table_or_session, pax, rsvp_status, rsvp_pax, rsvp_message, rsvp_at, is_checked_in, checked_in_at, checked_in_by, created_at)
VALUES ('${g.id}', '${g.name.replace(/'/g, "''")}', '${g.slug}', '${g.code}', '${g.phone || ''}', '${g.category}', '${g.tableOrSession}', ${g.pax}, '${g.rsvpStatus}', ${g.rsvpPax || 0}, ${rsvpMsg}, ${rsvpAt}, ${g.isCheckedIn ? 'TRUE' : 'FALSE'}, ${checkedInAt}, ${checkedInBy}, '${g.createdAt}')
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
`;
}

sql += '\n-- Seed Wishes\n';
for (const w of db.wishes) {
  const guestId = w.guestId ? `'${w.guestId}'` : 'NULL';
  sql += `INSERT INTO public.wishes (id, guest_id, name, attendance, message, created_at)
VALUES ('${w.id}', ${guestId}, '${w.name.replace(/'/g, "''")}', '${w.attendance}', '${w.message.replace(/'/g, "''")}', '${w.createdAt}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  attendance = EXCLUDED.attendance,
  message = EXCLUDED.message;
`;
}

const outDir = path.join(__dirname, '..', 'supabase');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'schema.sql'), sql, 'utf8');
console.log('Successfully generated supabase/schema.sql');

