const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data dir
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate random guest code: e.g. "GUEST-7A9B"
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GUEST-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const DEFAULT_DB = {
  settings: {
    couple: {
      groom: "Habib Yulianto",
      groomNickname: "Habib",
      groomParents: "Putra Kedua dari Bapak M. Dawam & (Almh) Ibu Dewi Sudarwati",
      groomInstagram: "habib_yulianto",
      groomPhoto: "/assets/groom.jpg",
      bride: "Adiba Putri Syakila",
      brideNickname: "Adiba",
      brideParents: "Putri Pertama dari Bapak Anas Rifai & Ibu Kholifah",
      brideInstagram: "adiba_syakila",
      bridePhoto: "/assets/bride.jpg",
      heroPhoto: "/assets/couple-hero.jpg"
    },
    event: {
      date: "2026-12-28T08:00:00",
      dateFormatted: "Senin, 28 Desember 2026",
      akadTime: "08.00 WIB",
      resepsiTime: "10.00 WIB",
      venue: "KEDIAMAN MEMPELAI WANITA",
      address: "Ds Pagu, Wates, Kediri, Jawa Timur",
      mapsUrl: "https://maps.google.com/?q=Pagu+Wates+Kediri",
      liveStreamingTime: "08.00 WIB",
      liveStreamingUrl: "https://instagram.com/Habib"
    },
    story: [
      {
        year: "Awal Pertemuan",
        title: "Awal Cerita",
        desc: "Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Tanpa disadari, kebersamaan itu tumbuh menjadi rasa nyaman yang semakin kuat dari hari ke hari."
      },
      {
        year: "Menuju Serius",
        title: "Lamaran",
        desc: "Dengan niat yang tulus dan restu keluarga, kami memutuskan untuk melangkah ke tahap yang lebih serius. Momen lamaran menjadi awal dari perjalanan baru yang penuh harapan dan doa baik."
      },
      {
        year: "Hari Bahagia",
        title: "Pernikahan",
        desc: "Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh cinta, kebahagiaan, dan keberkahan."
      }
    ],
    gallery: [
      "/assets/couple-hero.jpg",
      "/assets/gallery-1.jpg",
      "/assets/gallery-2.jpg",
      "/assets/gallery-3.jpg",
      "/assets/groom.jpg",
      "/assets/bride.jpg"
    ],
    bankAccounts: [
      {
        bank: "BCA",
        accountNumber: "12345678",
        accountName: "Habib Yulianto",
        logo: "/assets/bca.webp"
      },
      {
        bank: "Mandiri",
        accountNumber: "87654321",
        accountName: "Adiba Putri Syakila",
        logo: ""
      }
    ],
    giftAddress: {
      recipient: "Habib Yulianto",
      phone: "081234567890",
      address: "Ds Pagu Kec.Wates Kab. Kediri, Jawa Timur"
    },
    musicUrl: "/assets/music.mp3",
    adminPassword: "admin123"
  },
  guests: [
    {
      id: "gst-1",
      code: "GUEST-8A1B",
      slug: "bapak-ahmad-fauzi",
      name: "Bapak Ahmad Fauzi & Keluarga",
      category: "VIP",
      pax: 2,
      phone: "081234567801",
      rsvp: "hadir",
      paxActual: 2,
      checkedIn: false,
      checkedInAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "gst-2",
      code: "GUEST-9C2D",
      slug: "ibu-siti-rahma",
      name: "Ibu Siti Rahma",
      category: "Keluarga",
      pax: 1,
      phone: "081234567802",
      rsvp: "hadir",
      paxActual: 1,
      checkedIn: true,
      checkedInAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: "gst-3",
      code: "GUEST-3E4F",
      slug: "dr-hendra-wijaya",
      name: "Dr. Hendra Wijaya",
      category: "VIP",
      pax: 2,
      phone: "081234567803",
      rsvp: "pending",
      paxActual: null,
      checkedIn: false,
      checkedInAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "gst-4",
      code: "GUEST-5G6H",
      slug: "rekan-kantor-habib",
      name: "Rekan Kerja Habib (Divisi IT)",
      category: "Teman",
      pax: 4,
      phone: "081234567804",
      rsvp: "hadir",
      paxActual: 4,
      checkedIn: false,
      checkedInAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "gst-5",
      code: "GUEST-7J8K",
      slug: "keluarga-besar-kediri",
      name: "Keluarga Besar Kediri",
      category: "Keluarga",
      pax: 3,
      phone: "081234567805",
      rsvp: "tidak_hadir",
      paxActual: null,
      checkedIn: false,
      checkedInAt: null,
      createdAt: new Date().toISOString()
    }
  ],
  wishes: [
    {
      id: "wsh-1",
      name: "Bapak Ahmad Fauzi",
      attendance: "hadir",
      pax: 2,
      message: "Selamat berbahagia untuk Habib dan Adiba! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin ya rabbal alamin.",
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: "wsh-2",
      name: "Ibu Siti Rahma",
      attendance: "hadir",
      pax: 1,
      message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khoir. Selamat menempuh hidup baru, semoga langgeng sampai maut memisahkan.",
      createdAt: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: "wsh-3",
      name: "Keluarga Besar Kediri",
      attendance: "tidak_hadir",
      pax: 0,
      message: "Mohon maaf belum bisa hadir langsung karena dinas luar kota. Doa terbaik selalu menyertai kedua mempelai!",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  sessions: []
};

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
      this.save();
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        // Merge missing fields if any
        if (!this.data.settings) this.data.settings = DEFAULT_DB.settings;
        if (!this.data.guests) this.data.guests = DEFAULT_DB.guests;
        if (!this.data.wishes) this.data.wishes = DEFAULT_DB.wishes;
        if (!this.data.sessions) this.data.sessions = [];
      } catch (e) {
        console.error('Failed to parse DB, recovering from backup or default:', e);
        this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
        this.save();
      }
    }
  }

  save() {
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf8');
    fs.renameSync(tmp, DB_FILE);
  }

  // Settings
  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  // Guests
  getGuests() {
    return this.data.guests;
  }

  findGuest(query) {
    if (!query) return null;
    const q = query.trim().toLowerCase();
    return this.data.guests.find(g => 
      g.code.toLowerCase() === q || 
      g.slug.toLowerCase() === q ||
      g.id.toLowerCase() === q ||
      g.name.toLowerCase() === q
    );
  }

  addGuest({ name, category = 'Umum', pax = 1, phone = '', notes = '' }) {
    let code = generateCode();
    // Ensure unique code
    while (this.data.guests.some(g => g.code === code)) {
      code = generateCode();
    }
    
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (this.data.guests.some(g => g.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newGuest = {
      id: 'gst-' + crypto.randomUUID().slice(0, 8),
      code,
      slug,
      name: name.trim(),
      category: category || 'Umum',
      pax: parseInt(pax) || 1,
      phone: (phone || '').trim(),
      notes: notes || '',
      rsvp: 'pending',
      paxActual: null,
      checkedIn: false,
      checkedInAt: null,
      createdAt: new Date().toISOString()
    };

    this.data.guests.unshift(newGuest);
    this.save();
    return newGuest;
  }

  bulkAddGuests(guestList) {
    const results = [];
    for (const item of guestList) {
      if (!item.name || !item.name.trim()) continue;
      results.push(this.addGuest(item));
    }
    return results;
  }

  updateGuest(idOrCode, updateData) {
    const guest = this.findGuest(idOrCode);
    if (!guest) return null;

    if (updateData.name !== undefined) {
      guest.name = updateData.name.trim();
    }
    if (updateData.category !== undefined) guest.category = updateData.category;
    if (updateData.pax !== undefined) guest.pax = parseInt(updateData.pax) || 1;
    if (updateData.phone !== undefined) guest.phone = updateData.phone.trim();
    if (updateData.notes !== undefined) guest.notes = updateData.notes;
    if (updateData.rsvp !== undefined) guest.rsvp = updateData.rsvp;
    if (updateData.paxActual !== undefined) guest.paxActual = updateData.paxActual;

    this.save();
    return guest;
  }

  deleteGuest(idOrCode) {
    const idx = this.data.guests.findIndex(g => g.id === idOrCode || g.code === idOrCode);
    if (idx === -1) return false;
    this.data.guests.splice(idx, 1);
    this.save();
    return true;
  }

  // Check-in
  checkInGuest(codeOrSlug, pax = null) {
    const guest = this.findGuest(codeOrSlug);
    if (!guest) {
      return { success: false, error: 'Tamu tidak ditemukan dalam sistem.' };
    }

    if (guest.checkedIn) {
      return {
        success: false,
        alreadyCheckedIn: true,
        message: 'Tamu sudah melakukan check-in sebelumnya.',
        guest,
        checkedInAt: guest.checkedInAt
      };
    }

    guest.checkedIn = true;
    guest.checkedInAt = new Date().toISOString();
    guest.paxActual = pax ? parseInt(pax) : guest.pax;
    guest.rsvp = 'hadir'; // if checked in, they definitely attended!

    this.save();
    return {
      success: true,
      message: 'Check-in berhasil! Selamat datang.',
      guest
    };
  }

  undoCheckIn(idOrCode) {
    const guest = this.findGuest(idOrCode);
    if (!guest) return false;
    guest.checkedIn = false;
    guest.checkedInAt = null;
    this.save();
    return true;
  }

  // RSVP & Wishes
  addRsvp({ name, attendance, pax = 1, message = '', guestCode = '' }) {
    // If associated with existing guest
    let guest = this.findGuest(guestCode);
    if (!guest && name) {
      guest = this.findGuest(name);
    }

    if (guest) {
      guest.rsvp = attendance === 'hadir' ? 'hadir' : 'tidak_hadir';
      if (attendance === 'hadir') {
        guest.paxActual = parseInt(pax) || 1;
      }
    }

    let wish = null;
    if (message && message.trim()) {
      wish = {
        id: 'wsh-' + crypto.randomUUID().slice(0, 8),
        name: name.trim(),
        attendance: attendance === 'hadir' ? 'hadir' : 'tidak_hadir',
        pax: parseInt(pax) || 1,
        message: message.trim(),
        createdAt: new Date().toISOString()
      };
      this.data.wishes.unshift(wish);
    }

    this.save();
    return { guest, wish };
  }

  getWishes() {
    return this.data.wishes;
  }

  deleteWish(id) {
    const idx = this.data.wishes.findIndex(w => w.id === id);
    if (idx === -1) return false;
    this.data.wishes.splice(idx, 1);
    this.save();
    return true;
  }

  // Stats
  getStats() {
    const totalGuests = this.data.guests.length;
    let totalInvitedPax = 0;
    let rsvpHadir = 0;
    let rsvpHadirPax = 0;
    let rsvpTidakHadir = 0;
    let rsvpPending = 0;
    let checkedInCount = 0;
    let checkedInPax = 0;

    for (const g of this.data.guests) {
      totalInvitedPax += g.pax || 1;
      if (g.rsvp === 'hadir') {
        rsvpHadir++;
        rsvpHadirPax += (g.paxActual || g.pax || 1);
      } else if (g.rsvp === 'tidak_hadir') {
        rsvpTidakHadir++;
      } else {
        rsvpPending++;
      }

      if (g.checkedIn) {
        checkedInCount++;
        checkedInPax += (g.paxActual || g.pax || 1);
      }
    }

    const recentCheckIns = this.data.guests
      .filter(g => g.checkedIn)
      .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
      .slice(0, 10);

    return {
      totalGuests,
      totalInvitedPax,
      rsvpHadir,
      rsvpHadirPax,
      rsvpTidakHadir,
      rsvpPending,
      checkedInCount,
      checkedInPax,
      totalWishes: this.data.wishes.length,
      recentCheckIns
    };
  }

  // Admin Sessions
  createSession() {
    const token = crypto.randomBytes(32).toString('hex');
    this.data.sessions.push({
      token,
      createdAt: Date.now()
    });
    // clean older than 7 days
    const oneWeekAgo = Date.now() - 7 * 86400000;
    this.data.sessions = this.data.sessions.filter(s => s.createdAt > oneWeekAgo);
    this.save();
    return token;
  }

  validateSession(token) {
    if (!token) return false;
    return this.data.sessions.some(s => s.token === token);
  }

  revokeSession(token) {
    const idx = this.data.sessions.findIndex(s => s.token === token);
    if (idx !== -1) {
      this.data.sessions.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }
}

module.exports = new Database();
