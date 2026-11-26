import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase';

export interface Guest {
  id: string;
  name: string;
  slug: string;
  code: string; // Unique Check-in code for QR e.g. WED-HB-1001
  phone: string;
  category: string; // VIP, Keluarga, Sahabat, Rekan Kerja, Reguler
  tableOrSession: string; // e.g. Sesi 1 (08.00 - 10.00 WIB) / Meja VIP 1
  pax: number;
  rsvpStatus: 'pending' | 'attending' | 'declined' | 'tentative';
  rsvpPax: number;
  rsvpMessage?: string;
  rsvpAt?: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
}

export interface Wish {
  id: string;
  guestId?: string;
  name: string;
  attendance: 'attending' | 'declined' | 'tentative';
  message: string;
  createdAt: string;
}

export interface LoveStoryItem {
  id: string;
  title: string;
  year?: string;
  description: string;
  image?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  aspect?: 'square' | 'portrait' | 'landscape' | 'wide' | 'auto';
  span?: 'single' | 'wide' | 'full';
}

export interface GalleryConfig {
  layout: 'masonry' | 'grid' | 'editorial';
  columnsDesktop: 2 | 3 | 4;
  columnsMobile: 1 | 2;
  gap: 'sm' | 'md' | 'lg';
  aspectRatio: 'original' | 'portrait' | 'square' | 'landscape';
  maxPhotos?: number; // 0 atau undefined = tampilkan semua foto
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey?: string;
  apiSecret?: string;
  uploadPreset?: string;
  folder?: string;
}

export interface WeddingSettings {
  groom: {
    fullName: string;
    nickname: string;
    fatherName: string;
    motherName: string;
    childOrder: string;
    instagram: string;
    photoUrl: string;
  };
  bride: {
    fullName: string;
    nickname: string;
    fatherName: string;
    motherName: string;
    childOrder: string;
    instagram: string;
    photoUrl: string;
  };
  eventDate: string;
  countdownTarget: string;
  quranVerse: {
    surah: string;
    arabic?: string;
    translation: string;
  };
  music: {
    title: string;
    url: string;
    autoPlay: boolean;
    startTime?: number;
  };
  events: {
    akad: {
      title: string;
      date: string;
      time: string;
      venue: string;
      address: string;
      mapsUrl: string;
    };
    resepsi: {
      title: string;
      date: string;
      time: string;
      venue: string;
      address: string;
      mapsUrl: string;
    };
  };
  liveStream: {
    enabled: boolean;
    title: string;
    time: string;
    account: string;
    url: string;
  };
  loveStory: LoveStoryItem[];
  digitalGifts: {
    enabled?: boolean;
    bankAccounts: BankAccount[];
    physicalGift: {
      enabled?: boolean;
      recipientName: string;
      phone: string;
      address: string;
    };
  };
  gallery: string[];
  galleryItems?: GalleryItem[];
  galleryConfig?: GalleryConfig;
  cloudinary?: CloudinaryConfig;
}

export interface DatabaseSchema {
  settings: WeddingSettings;
  guests: Guest[];
  wishes: Wish[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

// Mappers between PostgreSQL rows & TypeScript models
function rowToGuest(row: any): Guest {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    code: row.code,
    phone: row.phone || '',
    category: row.category || 'Reguler',
    tableOrSession: row.table_or_session || 'Sesi 1 (11.00 - 14.00 WIB)',
    pax: Number(row.pax) || 1,
    rsvpStatus: row.rsvp_status || 'pending',
    rsvpPax: Number(row.rsvp_pax) || 0,
    rsvpMessage: row.rsvp_message || undefined,
    rsvpAt: row.rsvp_at || undefined,
    isCheckedIn: Boolean(row.is_checked_in),
    checkedInAt: row.checked_in_at || undefined,
    checkedInBy: row.checked_in_by || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function guestToRow(g: Partial<Guest>): any {
  const row: any = {};
  if (g.id !== undefined) row.id = g.id;
  if (g.name !== undefined) row.name = g.name;
  if (g.slug !== undefined) row.slug = g.slug;
  if (g.code !== undefined) row.code = g.code;
  if (g.phone !== undefined) row.phone = g.phone;
  if (g.category !== undefined) row.category = g.category;
  if (g.tableOrSession !== undefined) row.table_or_session = g.tableOrSession;
  if (g.pax !== undefined) row.pax = g.pax;
  if (g.rsvpStatus !== undefined) row.rsvp_status = g.rsvpStatus;
  if (g.rsvpPax !== undefined) row.rsvp_pax = g.rsvpPax;
  if (g.rsvpMessage !== undefined) row.rsvp_message = g.rsvpMessage;
  if (g.rsvpAt !== undefined) row.rsvp_at = g.rsvpAt;
  if (g.isCheckedIn !== undefined) row.is_checked_in = g.isCheckedIn;
  if (g.checkedInAt !== undefined) row.checked_in_at = g.checkedInAt;
  if (g.checkedInBy !== undefined) row.checked_in_by = g.checkedInBy;
  if (g.createdAt !== undefined) row.created_at = g.createdAt;
  return row;
}

function rowToWish(row: any): Wish {
  return {
    id: row.id,
    guestId: row.guest_id || undefined,
    name: row.name,
    attendance: row.attendance || 'attending',
    message: row.message,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function wishToRow(w: Partial<Wish>): any {
  const row: any = {};
  if (w.id !== undefined) row.id = w.id;
  if (w.guestId !== undefined) row.guest_id = w.guestId;
  if (w.name !== undefined) row.name = w.name;
  if (w.attendance !== undefined) row.attendance = w.attendance;
  if (w.message !== undefined) row.message = w.message;
  if (w.createdAt !== undefined) row.created_at = w.createdAt;
  return row;
}

function ensureDir(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// ==========================================================
// LOCAL FILE DATABASE ENGINE (Instant cache & fallback)
// ==========================================================
export function readDatabase(): DatabaseSchema {
  try {
    ensureDir(DB_PATH);
    if (!fs.existsSync(DB_PATH)) {
      throw new Error("database.json not found");
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("Error reading database:", err);
    throw err;
  }
}

export function writeDatabase(data: DatabaseSchema): boolean {
  try {
    ensureDir(DB_PATH);
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_PATH);
    return true;
  } catch (err) {
    // Gracefully handle read-only environments on serverless hosts (Netlify / Vercel / AWS Lambda)
    return false;
  }
}

// ==========================================================
// SUPABASE ASYNC QUERIES (Primary with resilient fallback)
// ==========================================================

export async function getSettingsAsync(): Promise<WeddingSettings> {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('data')
      .eq('id', 'main')
      .single();

    if (!error && data?.data) {
      return data.data as WeddingSettings;
    }
  } catch (err) {
    console.warn("Supabase getSettingsAsync failed, fallback to local:", err);
  }
  return getSettings();
}

export async function updateSettingsAsync(newSettings: Partial<WeddingSettings>): Promise<WeddingSettings> {
  const current = getSettings();
  const merged = { ...current, ...newSettings };

  // Write local first
  updateSettings(newSettings);

  // Sync to Supabase
  try {
    await supabaseAdmin
      .from('settings')
      .upsert({ id: 'main', data: merged, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn("Supabase updateSettingsAsync sync failed:", err);
  }

  return merged;
}

export async function getAllGuestsAsync(): Promise<Guest[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map(rowToGuest);
    }
  } catch (err) {
    console.warn("Supabase getAllGuestsAsync failed, fallback to local:", err);
  }
  return getAllGuests();
}

export async function getGuestBySlugAsync(slug: string): Promise<Guest | undefined> {
  const clean = slug.trim().toLowerCase();
  try {
    const { data, error } = await supabaseAdmin
      .from('guests')
      .select('*')
      .or(`slug.ilike.${clean},code.ilike.${clean},id.eq.${slug}`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return rowToGuest(data);
    }
  } catch (err) {
    console.warn("Supabase getGuestBySlugAsync failed, fallback to local:", err);
  }
  return getGuestBySlug(slug);
}

export async function getGuestByCodeAsync(code: string): Promise<Guest | undefined> {
  const clean = code.trim().toLowerCase();
  try {
    const { data, error } = await supabaseAdmin
      .from('guests')
      .select('*')
      .ilike('code', clean)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return rowToGuest(data);
    }
  } catch (err) {
    console.warn("Supabase getGuestByCodeAsync failed, fallback to local:", err);
  }
  return getGuestByCode(code);
}

export async function createGuestAsync(data: {
  name: string;
  phone?: string;
  category?: string;
  tableOrSession?: string;
  pax?: number;
}): Promise<Guest> {
  const newGuest = createGuest(data);

  // Sync to Supabase
  try {
    await supabaseAdmin
      .from('guests')
      .insert(guestToRow(newGuest));
  } catch (err) {
    console.warn("Supabase createGuestAsync sync failed:", err);
  }

  return newGuest;
}

export async function updateGuestAsync(id: string, updates: Partial<Guest>): Promise<Guest | null> {
  const updated = updateGuest(id, updates);

  // Sync to Supabase
  try {
    await supabaseAdmin
      .from('guests')
      .update(guestToRow(updates))
      .eq('id', id);
  } catch (err) {
    console.warn("Supabase updateGuestAsync sync failed:", err);
  }

  return updated;
}

export async function deleteGuestAsync(id: string): Promise<boolean> {
  const ok = deleteGuest(id);

  // Sync to Supabase
  try {
    await supabaseAdmin
      .from('guests')
      .delete()
      .eq('id', id);
  } catch (err) {
    console.warn("Supabase deleteGuestAsync sync failed:", err);
  }

  return ok;
}

export async function checkInGuestAsync(codeOrId: string, checkedInBy: string = 'Petugas Resepsionis') {
  const clean = codeOrId.trim().toLowerCase();

  // 1. Try checking in directly against Supabase Cloud (Primary source of truth)
  try {
    const { data: row, error } = await supabaseAdmin
      .from('guests')
      .select('*')
      .or(`code.ilike.${clean},id.eq.${codeOrId},slug.ilike.${clean}`)
      .limit(1)
      .maybeSingle();

    if (!error && row) {
      const guest = rowToGuest(row);
      if (guest.isCheckedIn) {
        return {
          success: true,
          alreadyCheckedIn: true,
          message: `Tamu "${guest.name}" SUDAH check-in sebelumnya pada ${guest.checkedInAt ? new Date(guest.checkedInAt).toLocaleTimeString('id-ID') : '-'} WIB!`,
          guest,
        };
      }

      const now = new Date().toISOString();
      await supabaseAdmin
        .from('guests')
        .update({
          is_checked_in: true,
          checked_in_at: now,
          checked_in_by: checkedInBy,
        })
        .eq('id', guest.id);

      guest.isCheckedIn = true;
      guest.checkedInAt = now;
      guest.checkedInBy = checkedInBy;

      // Best effort update local
      try { checkInGuest(codeOrId, checkedInBy); } catch {}

      return {
        success: true,
        alreadyCheckedIn: false,
        message: `Berhasil Check-In! Selamat datang, ${guest.name}. (${guest.category} - ${guest.pax} Orang)`,
        guest,
      };
    }
  } catch (err) {
    console.warn("Supabase checkInGuestAsync failed, trying local fallback:", err);
  }

  // 2. Fallback to local database
  return checkInGuest(codeOrId, checkedInBy);
}

export async function getAllWishesAsync(): Promise<Wish[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map(rowToWish);
    }
  } catch (err) {
    console.warn("Supabase getAllWishesAsync failed, fallback to local:", err);
  }
  return getAllWishes();
}

export async function addWishAsync(wishData: {
  name: string;
  attendance: 'attending' | 'declined' | 'tentative';
  message: string;
  guestId?: string;
  pax?: number;
}): Promise<Wish> {
  const newWish = addWish(wishData);

  // Sync wish to Supabase
  try {
    await supabaseAdmin
      .from('wishes')
      .insert(wishToRow(newWish));

    // Also update guest in Supabase if linked
    if (wishData.guestId) {
      await supabaseAdmin
        .from('guests')
        .update({
          rsvp_status: wishData.attendance,
          rsvp_pax: wishData.attendance === 'attending' ? (wishData.pax || 1) : 0,
          rsvp_message: wishData.message,
          rsvp_at: new Date().toISOString(),
        })
        .eq('id', wishData.guestId);
    }
  } catch (err) {
    console.warn("Supabase addWishAsync sync failed:", err);
  }

  return newWish;
}

export async function deleteWishAsync(id: string): Promise<boolean> {
  const ok = deleteWish(id);

  try {
    await supabaseAdmin
      .from('wishes')
      .delete()
      .eq('id', id);
  } catch (err) {
    console.warn("Supabase deleteWishAsync sync failed:", err);
  }

  return ok;
}

// ==========================================================
// SYNCHRONOUS COMPATIBILITY FUNCTIONS
// ==========================================================
function bgSync(promiseLike: PromiseLike<any>, desc: string) {
  Promise.resolve(promiseLike).catch((err) => {
    console.warn(`Background Supabase ${desc} error:`, err);
  });
}

export function getSettings(): WeddingSettings {
  return readDatabase().settings;
}

export function updateSettings(newSettings: Partial<WeddingSettings>): WeddingSettings {
  const db = readDatabase();
  db.settings = { ...db.settings, ...newSettings };
  writeDatabase(db);

  // Background sync to Supabase
  bgSync(
    supabaseAdmin
      .from('settings')
      .upsert({ id: 'main', data: db.settings, updated_at: new Date().toISOString() }),
    'updateSettings'
  );

  return db.settings;
}

export function getAllGuests(): Guest[] {
  return readDatabase().guests;
}

export function getGuestBySlug(slug: string): Guest | undefined {
  const guests = getAllGuests();
  const lower = slug.toLowerCase();
  return guests.find(g => g.slug.toLowerCase() === lower || g.code.toLowerCase() === lower || g.id === slug);
}

export function getGuestByCode(code: string): Guest | undefined {
  const guests = getAllGuests();
  const clean = code.trim().toLowerCase();
  return guests.find(g => g.code.toLowerCase() === clean);
}

export function createGuest(data: {
  name: string;
  phone?: string;
  category?: string;
  tableOrSession?: string;
  pax?: number;
}): Guest {
  const db = readDatabase();

  const baseSlug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let slug = baseSlug || 'tamu';
  let counter = 1;
  while (db.guests.some(g => g.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const randNum = Math.floor(1000 + Math.random() * 9000);
  const initials = data.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase() || 'GST';
  const code = `WED-${initials}-${randNum}`;

  const newGuest: Guest = {
    id: `gst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: data.name,
    slug,
    code,
    phone: data.phone || '',
    category: data.category || 'Reguler',
    tableOrSession: data.tableOrSession || 'Sesi 1 (08.00 - 10.00 WIB)',
    pax: Number(data.pax) || 1,
    rsvpStatus: 'pending',
    rsvpPax: 0,
    isCheckedIn: false,
    createdAt: new Date().toISOString()
  };

  db.guests.unshift(newGuest);
  writeDatabase(db);

  // Background sync
  bgSync(
    supabaseAdmin
      .from('guests')
      .insert(guestToRow(newGuest)),
    'createGuest'
  );

  return newGuest;
}

export function updateGuest(id: string, updates: Partial<Guest>): Guest | null {
  const db = readDatabase();
  const idx = db.guests.findIndex(g => g.id === id);
  if (idx === -1) return null;

  db.guests[idx] = { ...db.guests[idx], ...updates };
  writeDatabase(db);

  // Background sync
  bgSync(
    supabaseAdmin
      .from('guests')
      .update(guestToRow(updates))
      .eq('id', id),
    'updateGuest'
  );

  return db.guests[idx];
}

export function deleteGuest(id: string): boolean {
  const db = readDatabase();
  const initLen = db.guests.length;
  db.guests = db.guests.filter(g => g.id !== id);
  if (db.guests.length !== initLen) {
    writeDatabase(db);

    // Background sync
    bgSync(
      supabaseAdmin
        .from('guests')
        .delete()
        .eq('id', id),
      'deleteGuest'
    );

    return true;
  }
  return false;
}

export function checkInGuest(codeOrId: string, checkedInBy: string = 'Petugas Resepsionis'): {
  success: boolean;
  message: string;
  alreadyCheckedIn?: boolean;
  guest?: Guest;
} {
  const db = readDatabase();
  const clean = codeOrId.trim().toLowerCase();
  const idx = db.guests.findIndex(g =>
    g.code.toLowerCase() === clean ||
    g.id.toLowerCase() === clean ||
    g.slug.toLowerCase() === clean
  );

  if (idx === -1) {
    return { success: false, message: "QR Code atau Kode Tamu tidak ditemukan dalam sistem!" };
  }

  const guest = db.guests[idx];
  if (guest.isCheckedIn) {
    return {
      success: true,
      alreadyCheckedIn: true,
      message: `Tamu "${guest.name}" SUDAH check-in sebelumnya pada ${guest.checkedInAt ? new Date(guest.checkedInAt).toLocaleTimeString('id-ID') : '-'} WIB!`,
      guest
    };
  }

  guest.isCheckedIn = true;
  guest.checkedInAt = new Date().toISOString();
  guest.checkedInBy = checkedInBy;

  db.guests[idx] = guest;
  writeDatabase(db);

  // Background sync
  bgSync(
    supabaseAdmin
      .from('guests')
      .update({
        is_checked_in: true,
        checked_in_at: guest.checkedInAt,
        checked_in_by: checkedInBy,
      })
      .eq('id', guest.id),
    'checkInGuest'
  );

  return {
    success: true,
    alreadyCheckedIn: false,
    message: `Berhasil Check-In! Selamat datang, ${guest.name}. (${guest.category} - ${guest.pax} Orang)`,
    guest
  };
}

export function getAllWishes(): Wish[] {
  return readDatabase().wishes;
}

export function addWish(wishData: {
  name: string;
  attendance: 'attending' | 'declined' | 'tentative';
  message: string;
  guestId?: string;
  pax?: number;
}): Wish {
  const db = readDatabase();
  const newWish: Wish = {
    id: `wish-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    guestId: wishData.guestId,
    name: wishData.name,
    attendance: wishData.attendance,
    message: wishData.message,
    createdAt: new Date().toISOString()
  };

  db.wishes.unshift(newWish);

  if (wishData.guestId) {
    const gIdx = db.guests.findIndex(g => g.id === wishData.guestId);
    if (gIdx !== -1) {
      db.guests[gIdx].rsvpStatus = wishData.attendance;
      db.guests[gIdx].rsvpPax = wishData.attendance === 'attending' ? (wishData.pax || db.guests[gIdx].pax) : 0;
      db.guests[gIdx].rsvpMessage = wishData.message;
      db.guests[gIdx].rsvpAt = new Date().toISOString();
    }
  }

  writeDatabase(db);

  // Background sync wish & guest RSVP
  bgSync(
    supabaseAdmin
      .from('wishes')
      .insert(wishToRow(newWish)),
    'addWish'
  );

  if (wishData.guestId) {
    bgSync(
      supabaseAdmin
        .from('guests')
        .update({
          rsvp_status: wishData.attendance,
          rsvp_pax: wishData.attendance === 'attending' ? (wishData.pax || 1) : 0,
          rsvp_message: wishData.message,
          rsvp_at: new Date().toISOString(),
        })
        .eq('id', wishData.guestId),
      'addWishGuestRsvp'
    );
  }

  return newWish;
}

export function deleteWish(id: string): boolean {
  const db = readDatabase();
  const initLen = db.wishes.length;
  db.wishes = db.wishes.filter(w => w.id !== id);
  if (db.wishes.length !== initLen) {
    writeDatabase(db);

    bgSync(
      supabaseAdmin
        .from('wishes')
        .delete()
        .eq('id', id),
      'deleteWish'
    );

    return true;
  }
  return false;
}
