// ===================================================================
// ADMIN.JS - WEDDING DASHBOARD & QR CHECK-IN DESK
// ===================================================================

let authToken = localStorage.getItem('wedding_admin_token') || '';
let allGuests = [];
let allWishes = [];
let html5QrCode = null;
let isScannerRunning = false;
let previewTargetGuest = null;

// Audio Beep Chime Synthesizer via Web Audio API (Zero external audio file needed!)
function playBeep(type = 'success') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Pleasant high double chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'warning') {
      // Warning double buzzy tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.setValueAtTime(250, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.warn('Audio synthesis not supported or muted');
  }
}

// 1. Icons
function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 2. Auth headers helper
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
}

// 3. Tab Switching
function switchTab(tabId) {
  document.querySelectorAll('.admin-tab').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.menu-link').forEach(el => el.classList.remove('active'));

  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) targetTab.style.display = 'block';

  const menuLinks = document.querySelectorAll('.sidebar-menu .menu-link');
  const titles = {
    overview: 'Ringkasan Acara',
    guests: 'Buku Tamu Undangan',
    scanner: 'QR Scanner Presensi',
    wishes: 'Manajemen Ucapan & Doa',
    settings: 'Pengaturan Undangan'
  };

  document.getElementById('pageTitle').textContent = titles[tabId] || 'Admin Dashboard';

  if (tabId === 'overview') {
    menuLinks[0]?.classList.add('active');
    loadStats();
  } else if (tabId === 'guests') {
    menuLinks[1]?.classList.add('active');
    loadGuests();
  } else if (tabId === 'scanner') {
    menuLinks[2]?.classList.add('active');
  } else if (tabId === 'wishes') {
    menuLinks[3]?.classList.add('active');
    loadWishesAdmin();
  } else if (tabId === 'settings') {
    menuLinks[4]?.classList.add('active');
    loadSettingsForm();
  }

  refreshIcons();
}

// 4. Auth Verification & Login
async function initAuth() {
  if (authToken) {
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.valid) {
        showDashboard();
        return;
      }
    } catch (e) {
      console.warn('Auth check error:', e);
    }
  }
  showLogin();
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminLayout').style.display = 'none';
  refreshIcons();
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminLayout').style.display = 'flex';
  switchTab('overview');
  refreshIcons();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('adminPasswordInput').value;
  const btn = document.getElementById('btnLoginSubmit');
  btn.disabled = true;
  btn.innerText = 'Memverifikasi...';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      authToken = data.token;
      localStorage.setItem('wedding_admin_token', authToken);
      showDashboard();
    } else {
      alert(data.error || 'Password salah!');
    }
  } catch (err) {
    alert('Koneksi server bermasalah, silakan coba lagi');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="log-in" style="width: 16px; height: 16px;"></i><span>Masuk ke Dashboard</span>';
    refreshIcons();
  }
});

async function logoutAdmin() {
  if (confirm('Apakah Anda yakin ingin keluar dari dashboard admin?')) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: authHeaders()
      });
    } catch (e) {}
    authToken = '';
    localStorage.removeItem('wedding_admin_token');
    showLogin();
  }
}

// 5. Load Stats & Recent Check-ins
async function loadStats() {
  try {
    const res = await fetch('/api/stats', { headers: authHeaders() });
    if (!res.ok) {
      if (res.status === 401) return showLogin();
      return;
    }
    const stats = await res.json();

    document.getElementById('statTotalGuests').textContent = stats.totalGuests;
    document.getElementById('statTotalPax').textContent = `Estimasi kuota: ${stats.totalInvitedPax} Pax`;
    document.getElementById('statRsvpHadir').textContent = stats.rsvpHadir;
    document.getElementById('statRsvpHadirPax').textContent = `${stats.rsvpHadirPax} Pax terkonfirmasi`;
    document.getElementById('statRsvpTidak').textContent = stats.rsvpTidakHadir;
    document.getElementById('statCheckedIn').textContent = stats.checkedInCount;
    document.getElementById('statCheckedInPax').textContent = `${stats.checkedInPax} Pax hadir di lokasi`;

    // Scanner badge
    const scannerBadge = document.getElementById('scannerCountBadge');
    if (scannerBadge) {
      scannerBadge.textContent = `${stats.checkedInCount} Tamu Hadir`;
    }

    // Render Recent Check-ins Table
    const tbody = document.getElementById('recentCheckinsTable');
    if (tbody) {
      if (!stats.recentCheckIns || stats.recentCheckIns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">Belum ada tamu yang check-in hari ini.</td></tr>`;
      } else {
        tbody.innerHTML = stats.recentCheckIns.map(g => {
          const time = new Date(g.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          return `
            <tr>
              <td><span class="badge badge-hadir">${time} WIB</span></td>
              <td><strong>${escapeHtml(g.name)}</strong></td>
              <td><span class="badge badge-${(g.category || 'umum').toLowerCase()}">${g.category || 'Umum'}</span></td>
              <td>${g.paxActual || g.pax || 1} Pax</td>
              <td>
                <button class="btn-danger" onclick="undoCheckIn('${g.code}')" title="Batalkan Check-in">Batal</button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Also populate scanner logs table
    const scannerTbody = document.getElementById('scannerLogTable');
    if (scannerTbody) {
      if (!stats.recentCheckIns || stats.recentCheckIns.length === 0) {
        scannerTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">Belum ada data scan.</td></tr>`;
      } else {
        scannerTbody.innerHTML = stats.recentCheckIns.map(g => {
          const time = new Date(g.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          return `
            <tr>
              <td><span class="badge badge-hadir">${time}</span></td>
              <td><strong>${escapeHtml(g.name)}</strong></td>
              <td>${g.paxActual || g.pax || 1} Pax</td>
              <td><span class="badge badge-checkedin">Hadir</span></td>
            </tr>
          `;
        }).join('');
      }
    }

    refreshIcons();
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// 6. Guests Management
async function loadGuests() {
  try {
    const res = await fetch('/api/guests', { headers: authHeaders() });
    if (!res.ok) {
      if (res.status === 401) return showLogin();
      return;
    }
    allGuests = await res.json();
    renderGuestsTable(allGuests);
  } catch (e) {
    console.error('Error loading guests:', e);
  }
}

function filterGuests() {
  const query = document.getElementById('guestSearchInput').value.toLowerCase().trim();
  const cat = document.getElementById('filterCategory').value;
  const rsvp = document.getElementById('filterRsvp').value;
  const checkin = document.getElementById('filterCheckin').value;

  const filtered = allGuests.filter(g => {
    const matchQuery = !query || g.name.toLowerCase().includes(query) || g.code.toLowerCase().includes(query);
    const matchCat = !cat || g.category === cat;
    const matchRsvp = !rsvp || g.rsvp === rsvp;
    const matchCheckin = !checkin || (checkin === 'checked' ? g.checkedIn : !g.checkedIn);
    return matchQuery && matchCat && matchRsvp && matchCheckin;
  });

  renderGuestsTable(filtered);
}

function renderGuestsTable(guests) {
  const tbody = document.getElementById('guestsTableBody');
  if (!guests || guests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 30px;">Tidak ada tamu ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = guests.map((g, idx) => {
    // RSVP badge
    let rsvpBadge = '<span class="badge badge-pending">Belum</span>';
    if (g.rsvp === 'hadir') rsvpBadge = '<span class="badge badge-hadir">Hadir</span>';
    else if (g.rsvp === 'tidak_hadir') rsvpBadge = '<span class="badge badge-tidak">Tidak</span>';

    // Check-in status
    let checkinBadge = g.checkedIn 
      ? `<span class="badge badge-checkedin">Sudah Presensi (${new Date(g.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})</span>`
      : `<span class="badge badge-notchecked">Belum Presensi</span>`;

    const inviteLink = `${window.location.origin}/undangan/${g.code}`;
    const waText = encodeURIComponent(
      `Kepada Yth. Bapak/Ibu/Saudara/i ${g.name}\n\n` +
      `Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di acara pernikahan kami:\n\n` +
      `*Habib & Adiba*\n` +
      `Senin, 28 Desember 2026\n\n` +
      `Silakan buka tautan undangan resmi & QR presensi Anda di bawah ini:\n` +
      `${inviteLink}\n\n` +
      `Merupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran dan doa restu Anda.\n` +
      `Terima kasih.`
    );
    const waPhone = formatPhone(g.phone);
    const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${waText}` : `https://wa.me/?text=${waText}`;

    return `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <strong>${escapeHtml(g.name)}</strong>
          ${g.phone ? `<div style="font-size: 0.75rem; color: #94a3b8;">${escapeHtml(g.phone)}</div>` : ''}
        </td>
        <td><span class="badge badge-${(g.category || 'umum').toLowerCase()}">${g.category || 'Umum'}</span></td>
        <td>${g.pax || 1} Pax</td>
        <td>${rsvpBadge}</td>
        <td>${checkinBadge}</td>
        <td><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 6px; font-weight: 700; color: #1e293b;">${g.code}</code></td>
        <td style="text-align: right;">
          <div class="action-btn-group" style="justify-content: flex-end;">
            <a href="${waUrl}" target="_blank" class="icon-btn whatsapp" title="Kirim Undangan WhatsApp">
              <i data-lucide="message-circle" style="width: 15px; height: 15px;"></i>
            </a>
            <button class="icon-btn" onclick="copyGuestLink('${g.code}')" title="Salin Link Undangan">
              <i data-lucide="copy" style="width: 15px; height: 15px;"></i>
            </button>
            <button class="icon-btn" onclick="openQrPreview('${g.code}')" title="Lihat Kartu QR">
              <i data-lucide="qr-code" style="width: 15px; height: 15px;"></i>
            </button>
            ${g.checkedIn 
              ? `<button class="icon-btn" onclick="undoCheckIn('${g.code}')" title="Batalkan Presensi" style="color: #dc2626;"><i data-lucide="user-x" style="width: 15px; height: 15px;"></i></button>`
              : `<button class="icon-btn" onclick="fastCheckIn('${g.code}')" title="Presensi Langsung (Check-in)" style="color: #16a34a;"><i data-lucide="user-check" style="width: 15px; height: 15px;"></i></button>`
            }
            <button class="icon-btn" onclick="deleteGuest('${g.id}', '${escapeHtml(g.name)}')" title="Hapus Tamu" style="color: #dc2626;">
              <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  refreshIcons();
}

function formatPhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[^\d]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.substring(1);
  }
  return clean;
}

function copyGuestLink(code) {
  const url = `${window.location.origin}/undangan/${code}`;
  navigator.clipboard.writeText(url).then(() => {
    alert(`Link undangan berhasil disalin!\n${url}`);
  });
}

// 7. Add Guest Modals
function openAddGuestModal() {
  document.getElementById('modalAddGuest').classList.add('active');
  document.getElementById('addGuestName').focus();
}

function openBulkModal() {
  document.getElementById('modalBulkGuest').classList.add('active');
  document.getElementById('bulkNamesText').focus();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

async function submitAddGuest() {
  const name = document.getElementById('addGuestName').value.trim();
  const category = document.getElementById('addGuestCategory').value;
  const pax = document.getElementById('addGuestPax').value;
  const phone = document.getElementById('addGuestPhone').value.trim();
  const notes = document.getElementById('addGuestNotes').value.trim();

  try {
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, category, pax, phone, notes })
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modalAddGuest');
      document.getElementById('formAddGuest').reset();
      loadGuests();
      loadStats();
    } else {
      alert(data.error || 'Gagal menambahkan tamu');
    }
  } catch (e) {
    alert('Koneksi server bermasalah');
  }
}

async function submitBulkGuests() {
  const rawText = document.getElementById('bulkNamesText').value;
  const category = document.getElementById('bulkCategory').value;
  const pax = parseInt(document.getElementById('bulkPax').value) || 2;

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) {
    alert('Silakan masukkan minimal 1 nama tamu');
    return;
  }

  const guests = lines.map(name => ({
    name,
    category,
    pax
  }));

  try {
    const res = await fetch('/api/guests/bulk', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ guests })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Berhasil menambahkan ${data.count} tamu sekaligus!`);
      closeModal('modalBulkGuest');
      document.getElementById('bulkNamesText').value = '';
      loadGuests();
      loadStats();
    } else {
      alert(data.error || 'Gagal mengimpor');
    }
  } catch (e) {
    alert('Koneksi server bermasalah');
  }
}

async function deleteGuest(id, name) {
  if (confirm(`Yakin ingin menghapus tamu "${name}"?`)) {
    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success) {
        loadGuests();
        loadStats();
      } else {
        alert(data.error || 'Gagal menghapus tamu');
      }
    } catch (e) {
      alert('Koneksi server bermasalah');
    }
  }
}

async function fastCheckIn(code) {
  try {
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (data.success) {
      playBeep('success');
      loadGuests();
      loadStats();
    } else {
      alert(data.message || data.error);
    }
  } catch (e) {
    alert('Koneksi server bermasalah');
  }
}

async function undoCheckIn(code) {
  if (confirm('Batalkan status check-in tamu ini?')) {
    try {
      const res = await fetch('/api/guests/undo-checkin', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        loadGuests();
        loadStats();
      }
    } catch (e) {
      alert('Koneksi server bermasalah');
    }
  }
}

// 8. QR Preview Modal
function openQrPreview(code) {
  const guest = allGuests.find(g => g.code === code);
  if (!guest) return;
  previewTargetGuest = guest;

  document.getElementById('previewGuestName').textContent = guest.name;
  document.getElementById('previewGuestCode').textContent = guest.code;
  
  const statusEl = document.getElementById('previewGuestStatusText');
  if (guest.checkedIn) {
    statusEl.innerHTML = `<span style="color: #16a34a;">✔ Sudah Hadir di Lokasi (${new Date(guest.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})</span>`;
  } else {
    statusEl.innerHTML = `<span style="color: #b45309;">Belum Melakukan Presensi</span>`;
  }

  const container = document.getElementById('previewQrContainer');
  container.innerHTML = '';
  if (window.QRCode) {
    new QRCode(container, {
      text: guest.code,
      width: 180,
      height: 180,
      colorDark: '#1e293b',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  document.getElementById('modalQrPreview').classList.add('active');
  refreshIcons();
}

function copyGuestLinkFromPreview() {
  if (!previewTargetGuest) return;
  copyGuestLink(previewTargetGuest.code);
}

function downloadPreviewQr() {
  const qrCanvas = document.querySelector('#previewQrContainer canvas');
  if (!qrCanvas || !previewTargetGuest) return;
  const link = document.createElement('a');
  link.download = `QR-${previewTargetGuest.code}-${previewTargetGuest.name.replace(/\s+/g, '_')}.png`;
  link.href = qrCanvas.toDataURL('image/png');
  link.click();
}

// 9. QR Scanner Camera Desk
function toggleScanner() {
  if (isScannerRunning) {
    stopScanner();
  } else {
    startScanner();
  }
}

function startScanner() {
  if (!window.Html5Qrcode) {
    alert('Pustaka pemindai belum termuat sepenuhnya');
    return;
  }

  document.getElementById('cameraPlaceholder').style.display = 'none';
  html5QrCode = new Html5Qrcode('reader');

  const config = { fps: 10, qrbox: { width: 250, height: 250 } };

  html5QrCode.start(
    { facingMode: 'environment' },
    config,
    onQrScanSuccess,
    onQrScanError
  ).then(() => {
    isScannerRunning = true;
    document.getElementById('btnCameraText').textContent = 'Matikan Kamera';
    document.getElementById('btnToggleCamera').classList.replace('btn-primary', 'btn-danger');
  }).catch(err => {
    console.error('Error starting camera:', err);
    alert('Gagal mengakses kamera: Pastikan izin kamera telah diberikan di browser.');
    document.getElementById('cameraPlaceholder').style.display = 'block';
  });
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      isScannerRunning = false;
      document.getElementById('btnCameraText').textContent = 'Nyalakan Kamera';
      document.getElementById('btnToggleCamera').classList.replace('btn-danger', 'btn-primary');
      document.getElementById('cameraPlaceholder').style.display = 'block';
    }).catch(e => console.warn(e));
  }
}

let lastScannedCode = '';
let scanCooldown = false;

function onQrScanSuccess(decodedText) {
  if (scanCooldown) return;
  scanCooldown = true;
  setTimeout(() => { scanCooldown = false; }, 2500); // 2.5s cooldown

  handleCheckInCode(decodedText.trim());
}

function onQrScanError(errorMessage) {
  // Silent scan frame error
}

async function handleManualCheckIn() {
  const code = document.getElementById('manualCodeInput').value.trim();
  if (!code) {
    alert('Silakan masukkan kode tamu atau nama tamu');
    return;
  }
  await handleCheckInCode(code);
  document.getElementById('manualCodeInput').value = '';
}

async function handleCheckInCode(code) {
  const resultCard = document.getElementById('scanResultCard');
  const resultInner = document.getElementById('scanResultInner');
  resultCard.style.display = 'block';

  try {
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (data.success) {
      playBeep('success');
      resultCard.style.borderColor = '#16a34a';
      resultCard.style.background = '#f0fdf4';

      resultInner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #16a34a; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i data-lucide="check" style="width: 28px; height: 28px;"></i>
          </div>
          <div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #16a34a; text-transform: uppercase;">Presensi Berhasil (Check-In)</div>
            <h3 style="font-size: 1.3rem; font-weight: 800; color: #1e293b; margin: 2px 0;">${escapeHtml(data.guest.name)}</h3>
            <p style="font-size: 0.85rem; color: #64748b;">
              Kategori: <strong>${data.guest.category}</strong> | Kuota: <strong>${data.guest.paxActual || data.guest.pax} Pax</strong> | Waktu: <strong>${new Date().toLocaleTimeString('id-ID')} WIB</strong>
            </p>
          </div>
        </div>
      `;
      loadStats();
    } else if (data.alreadyCheckedIn) {
      playBeep('warning');
      resultCard.style.borderColor = '#f59e0b';
      resultCard.style.background = '#fffbeb';

      resultInner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #f59e0b; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i data-lucide="alert-triangle" style="width: 28px; height: 28px;"></i>
          </div>
          <div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #d97706; text-transform: uppercase;">Peringatan: Tamu Sudah Check-In!</div>
            <h3 style="font-size: 1.3rem; font-weight: 800; color: #1e293b; margin: 2px 0;">${escapeHtml(data.guest.name)}</h3>
            <p style="font-size: 0.85rem; color: #92400e;">
              Tamu ini sudah tercatat hadir sebelumnya pada pukul <strong>${new Date(data.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong>.
            </p>
          </div>
        </div>
      `;
    } else {
      resultCard.style.borderColor = '#dc2626';
      resultCard.style.background = '#fef2f2';

      resultInner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #dc2626; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i data-lucide="x" style="width: 28px; height: 28px;"></i>
          </div>
          <div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #dc2626; text-transform: uppercase;">Kode Tidak Valid</div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #1e293b; margin: 2px 0;">Tamu Tidak Ditemukan</h3>
            <p style="font-size: 0.82rem; color: #991b1b;">Kode: <code>${escapeHtml(code)}</code> tidak terdaftar di buku tamu.</p>
          </div>
        </div>
      `;
    }
    refreshIcons();
  } catch (err) {
    alert('Koneksi server bermasalah');
  }
}

// 10. Export Guests to CSV
function exportGuestsCsv() {
  if (!allGuests || allGuests.length === 0) {
    alert('Tidak ada data tamu untuk diekspor');
    return;
  }

  let csv = 'No,Nama Tamu,Kategori,Pax,Status RSVP,Presensi Lokasi,Waktu Check-In,Kode Undangan,No WhatsApp,Link Undangan\n';

  allGuests.forEach((g, idx) => {
    const inviteLink = `${window.location.origin}/undangan/${g.code}`;
    const checkinTime = g.checkedInAt ? new Date(g.checkedInAt).toLocaleString('id-ID') : '-';
    csv += `"${idx + 1}","${g.name}","${g.category}","${g.pax}","${g.rsvp}","${g.checkedIn ? 'Sudah' : 'Belum'}","${checkinTime}","${g.code}","${g.phone || '-'}","${inviteLink}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Daftar_Tamu_Habib_Adiba_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

// 11. Wishes Moderation
async function loadWishesAdmin() {
  try {
    const res = await fetch('/api/wishes');
    if (!res.ok) return;
    allWishes = await res.json();

    const tbody = document.getElementById('adminWishesTable');
    if (!allWishes || allWishes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">Belum ada doa atau ucapan masuk.</td></tr>`;
      return;
    }

    tbody.innerHTML = allWishes.map(w => {
      const isHadir = w.attendance === 'hadir';
      return `
        <tr>
          <td style="font-size: 0.75rem; color: #94a3b8;">${new Date(w.createdAt).toLocaleString('id-ID')}</td>
          <td><strong>${escapeHtml(w.name)}</strong></td>
          <td><span class="badge ${isHadir ? 'badge-hadir' : 'badge-tidak'}">${isHadir ? 'Hadir' : 'Tidak Hadir'}</span></td>
          <td style="line-height: 1.5;">${escapeHtml(w.message)}</td>
          <td style="text-align: right;">
            <button class="btn-danger" onclick="deleteWishAdmin('${w.id}')">Hapus</button>
          </td>
        </tr>
      `;
    }).join('');
    refreshIcons();
  } catch (e) {
    console.error('Error loading wishes admin:', e);
  }
}

async function deleteWishAdmin(id) {
  if (confirm('Hapus ucapan ini?')) {
    try {
      const res = await fetch(`/api/wishes/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success) {
        loadWishesAdmin();
      }
    } catch (e) {
      alert('Koneksi server bermasalah');
    }
  }
}

// 12. Settings Form
async function loadSettingsForm() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return;
    const config = await res.json();

    if (config.couple) {
      document.getElementById('setGroomName').value = config.couple.groom || '';
      document.getElementById('setGroomNick').value = config.couple.groomNickname || '';
      document.getElementById('setGroomParents').value = config.couple.groomParents || '';
      document.getElementById('setGroomIg').value = config.couple.groomInstagram || '';

      document.getElementById('setBrideName').value = config.couple.bride || '';
      document.getElementById('setBrideNick').value = config.couple.brideNickname || '';
      document.getElementById('setBrideParents').value = config.couple.brideParents || '';
      document.getElementById('setBrideIg').value = config.couple.brideInstagram || '';
    }

    if (config.event) {
      document.getElementById('setAkadTime').value = config.event.akadTime || '';
      document.getElementById('setResepsiTime').value = config.event.resepsiTime || '';
      document.getElementById('setVenue').value = config.event.venue || '';
      document.getElementById('setAddress').value = config.event.address || '';
      document.getElementById('setMapsUrl').value = config.event.mapsUrl || '';
      document.getElementById('setLiveUrl').value = config.event.liveStreamingUrl || '';
    }

    if (config.bankAccounts && config.bankAccounts.length >= 2) {
      document.getElementById('setBank1Num').value = config.bankAccounts[0].accountNumber || '';
      document.getElementById('setBank1Holder').value = config.bankAccounts[0].accountName || '';
      document.getElementById('setBank2Num').value = config.bankAccounts[1].accountNumber || '';
      document.getElementById('setBank2Holder').value = config.bankAccounts[1].accountName || '';
    }
  } catch (e) {
    console.error('Error loading settings form:', e);
  }
}

async function saveSettings() {
  const updatePayload = {
    couple: {
      groom: document.getElementById('setGroomName').value.trim(),
      groomNickname: document.getElementById('setGroomNick').value.trim(),
      groomParents: document.getElementById('setGroomParents').value.trim(),
      groomInstagram: document.getElementById('setGroomIg').value.trim(),
      groomPhoto: "/assets/groom.jpg",
      bride: document.getElementById('setBrideName').value.trim(),
      brideNickname: document.getElementById('setBrideNick').value.trim(),
      brideParents: document.getElementById('setBrideParents').value.trim(),
      brideInstagram: document.getElementById('setBrideIg').value.trim(),
      bridePhoto: "/assets/bride.jpg",
      heroPhoto: "/assets/couple-hero.jpg"
    },
    event: {
      date: "2026-12-28T08:00:00",
      dateFormatted: "Senin, 28 Desember 2026",
      akadTime: document.getElementById('setAkadTime').value.trim(),
      resepsiTime: document.getElementById('setResepsiTime').value.trim(),
      venue: document.getElementById('setVenue').value.trim(),
      address: document.getElementById('setAddress').value.trim(),
      mapsUrl: document.getElementById('setMapsUrl').value.trim(),
      liveStreamingTime: "08.00 WIB",
      liveStreamingUrl: document.getElementById('setLiveUrl').value.trim()
    },
    bankAccounts: [
      {
        bank: "BCA",
        accountNumber: document.getElementById('setBank1Num').value.trim(),
        accountName: document.getElementById('setBank1Holder').value.trim(),
        logo: "/assets/bca.webp"
      },
      {
        bank: "Mandiri",
        accountNumber: document.getElementById('setBank2Num').value.trim(),
        accountName: document.getElementById('setBank2Holder').value.trim(),
        logo: ""
      }
    ]
  };

  const newPass = document.getElementById('setNewPassword').value.trim();
  if (newPass) {
    updatePayload.adminPassword = newPass;
  }

  try {
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updatePayload)
    });
    const data = await res.json();
    if (data.success) {
      alert('Pengaturan undangan berhasil disimpan!');
      document.getElementById('setNewPassword').value = '';
    } else {
      alert(data.error || 'Gagal menyimpan');
    }
  } catch (e) {
    alert('Koneksi server bermasalah');
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Ready
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});
