// ===================================================================
// APP.JS - CLIENT-SIDE UNDANGAN DIGITAL SPESIAL 03
// ===================================================================

let currentGuest = null;
let isMusicPlaying = false;
const audio = document.getElementById('weddingAudio');
const musicToggle = document.getElementById('musicToggle');

// 1. Initialize Lucide Icons
function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 2. Toast Notification
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  toastText.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function copyText(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg || 'Berhasil disalin ke papan klip!');
  }).catch(() => {
    // Fallback
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast(successMsg || 'Berhasil disalin!');
  });
}

// 3. Audio Controller
function setupAudio() {
  musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
      audio.pause();
      musicToggle.classList.remove('playing');
      isMusicPlaying = false;
    } else {
      audio.play().then(() => {
        musicToggle.classList.add('playing');
        isMusicPlaying = true;
      }).catch(e => console.warn('Audio play error:', e));
    }
  });
}

// 4. Open Invitation Modal
function setupCover() {
  const btnOpen = document.getElementById('btnOpenInvite');
  const modal = document.getElementById('coverModal');

  btnOpen.addEventListener('click', () => {
    modal.classList.add('opened');
    
    // Play music automatically
    audio.play().then(() => {
      musicToggle.classList.add('playing');
      isMusicPlaying = true;
    }).catch(err => {
      console.log('Audio autoplay prevented by browser policy:', err);
    });

    // Scroll slightly to trigger animations
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// 5. Countdown Timer
function setupCountdown(targetDateStr) {
  const targetDate = new Date(targetDateStr || '2026-12-28T08:00:00+07:00').getTime();

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.getElementById('cdDays').textContent = '00';
      document.getElementById('cdHours').textContent = '00';
      document.getElementById('cdMinutes').textContent = '00';
      document.getElementById('cdSeconds').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cdDays').textContent = String(days).padStart(2, '0');
    document.getElementById('cdHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cdMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cdSeconds').textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// 6. Load Invitation Config (Dynamic from Backend)
async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return;
    const config = await res.json();

    // Couple info
    if (config.couple) {
      document.getElementById('groomName').textContent = config.couple.groom;
      document.getElementById('groomParents').innerHTML = config.couple.groomParents.replace('&', '&amp;');
      document.getElementById('groomIg').href = `https://instagram.com/${config.couple.groomInstagram}`;
      document.getElementById('groomIg').querySelector('span').textContent = `@${config.couple.groomInstagram}`;

      document.getElementById('brideName').textContent = config.couple.bride;
      document.getElementById('brideParents').innerHTML = config.couple.brideParents.replace('&', '&amp;');
      document.getElementById('brideIg').href = `https://instagram.com/${config.couple.brideInstagram}`;
      document.getElementById('brideIg').querySelector('span').textContent = `@${config.couple.brideInstagram}`;
    }

    // Event info
    if (config.event) {
      document.getElementById('akadTime').textContent = `Pukul : ${config.event.akadTime}`;
      document.getElementById('resepsiTime').textContent = `Pukul : ${config.event.resepsiTime}`;
      document.getElementById('eventVenueAkad').textContent = config.event.venue;
      document.getElementById('eventAddressAkad').textContent = config.event.address;
      document.getElementById('mapBtnAkad').href = config.event.mapsUrl;
      document.getElementById('eventVenueResepsi').textContent = config.event.venue;
      document.getElementById('eventAddressResepsi').textContent = config.event.address;
      document.getElementById('mapBtnResepsi').href = config.event.mapsUrl;
      document.getElementById('liveBtn').href = config.event.liveStreamingUrl;
      setupCountdown(config.event.date);
    }

    // Story Timeline
    if (config.story && config.story.length > 0) {
      const storyContainer = document.getElementById('storyTimeline');
      storyContainer.innerHTML = config.story.map(s => `
        <div class="story-item">
          <div class="story-node"></div>
          <div class="story-card">
            <span class="story-badge">${s.year}</span>
            <h3 class="story-title">${s.title}</h3>
            <p class="story-desc">${s.desc}</p>
          </div>
        </div>
      `).join('');
    }

    // Gallery
    if (config.gallery && config.gallery.length > 0) {
      const galleryContainer = document.getElementById('galleryGrid');
      galleryContainer.innerHTML = config.gallery.map(img => `
        <div class="gallery-grid-item" onclick="openLightbox('${img}')">
          <img src="${img}" alt="Wedding Gallery Photo" loading="lazy">
        </div>
      `).join('');
    }

    // Bank Accounts
    if (config.bankAccounts && config.bankAccounts.length >= 2) {
      document.getElementById('accNum1').textContent = config.bankAccounts[0].accountNumber;
      document.getElementById('accHolder1').textContent = config.bankAccounts[0].accountName.toUpperCase();
      document.getElementById('accNum2').textContent = config.bankAccounts[1].accountNumber;
      document.getElementById('accHolder2').textContent = config.bankAccounts[1].accountName.toUpperCase();
    }

    // Gift Address
    if (config.giftAddress) {
      document.getElementById('giftRecipient').innerHTML = `<strong>Penerima:</strong> ${config.giftAddress.recipient}`;
      document.getElementById('giftPhone').innerHTML = `<strong>No. HP:</strong> ${config.giftAddress.phone}`;
      document.getElementById('giftAddress').innerHTML = `<strong>Alamat:</strong> ${config.giftAddress.address}`;
    }

    refreshIcons();
  } catch (err) {
    console.error('Error loading config:', err);
  }
}

// 7. Personalized Guest & QR Code Presensi
async function setupGuestInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const toParam = urlParams.get('to');
  const codeParam = urlParams.get('code');

  // Also check if path has /undangan/GUEST-XXXX
  const pathParts = window.location.pathname.split('/');
  const pathCode = pathParts[1] === 'undangan' && pathParts[2] ? pathParts[2] : null;

  const targetIdentifier = codeParam || pathCode || toParam;

  if (targetIdentifier) {
    try {
      const res = await fetch(`/api/guest/${encodeURIComponent(targetIdentifier)}`);
      if (res.ok) {
        currentGuest = await res.json();
      }
    } catch (e) {
      console.warn('Guest lookup error:', e);
    }
  }

  // Fallback if not found in db or purely custom name from ?to=Nama
  if (!currentGuest) {
    const displayName = toParam || 'Tamu Undangan';
    currentGuest = {
      name: displayName,
      code: 'GUEST-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      category: 'Tamu Kehormatan',
      pax: 2,
      rsvp: 'pending',
      checkedIn: false
    };
  }

  // Populate UI
  document.getElementById('coverGuestName').textContent = currentGuest.name;
  if (currentGuest.category) {
    document.getElementById('coverGuestCategory').textContent = `[ ${currentGuest.category} ]`;
  }
  document.getElementById('rsvpName').value = currentGuest.name;

  // QR Code Presensi Card
  document.getElementById('qrGuestName').textContent = currentGuest.name;
  document.getElementById('qrGuestCode').textContent = currentGuest.code;
  document.getElementById('qrGuestPax').textContent = `${currentGuest.pax || 1} Orang`;

  const statusBadge = document.getElementById('qrStatusBadge');
  const statusText = document.getElementById('qrStatusText');
  if (currentGuest.checkedIn) {
    statusBadge.className = 'qr-status-indicator status-checkedin';
    statusText.textContent = `Sudah Hadir di Lokasi (${new Date(currentGuest.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`;
  } else {
    statusBadge.className = 'qr-status-indicator status-notchecked';
    statusText.textContent = 'Belum Melakukan Presensi';
  }

  // Render QR Code
  generateQrCode(currentGuest.code);
}

function generateQrCode(text) {
  const container = document.getElementById('qrcode');
  container.innerHTML = '';
  
  if (window.QRCode) {
    new QRCode(container, {
      text: text,
      width: 170,
      height: 170,
      colorDark: '#2b3951',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

// 8. Download QR Presensi Card as PNG
function setupQrDownload() {
  const btn = document.getElementById('btnDownloadQr');
  btn.addEventListener('click', () => {
    const qrCanvas = document.querySelector('#qrcode canvas');
    if (!qrCanvas) {
      showToast('QR Code sedang disiapkan, silakan coba lagi');
      return;
    }

    // Create a luxury printable pass canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 800);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#2b3951');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 800);

    // Gold border frame
    ctx.strokeStyle = '#d7ac64';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 560, 760);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(215, 172, 100, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, 544, 744);

    // Title & Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d7ac64';
    ctx.font = 'bold 20px Cinzel, serif';
    ctx.fillText('THE WEDDING OF', 300, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Cinzel, serif';
    ctx.fillText('Habib & Adiba', 300, 125);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Senin, 28 Desember 2026', 300, 160);

    // Guest Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(50, 190, 500, 130);
    ctx.strokeStyle = '#d7ac64';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(50, 190, 500, 130);

    ctx.fillStyle = '#d7ac64';
    ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
    ctx.fillText('GUEST PASS / KARTU PRESENSI', 300, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Cinzel, serif';
    ctx.fillText(currentGuest.name, 300, 260);

    ctx.fillStyle = '#f3e3be';
    ctx.font = '16px monospace';
    ctx.fillText(`KODE: ${currentGuest.code}  |  KUOTA: ${currentGuest.pax || 1} ORANG`, 300, 295);

    // Draw QR Code
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(175, 360, 250, 250);
    ctx.drawImage(qrCanvas, 190, 375, 220, 220);

    // Instructions
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Tunjukkan QR Code ini di meja penerima tamu', 300, 655);
    ctx.fillText('untuk scan presensi kehadiran langsung.', 300, 680);

    // Footer
    ctx.fillStyle = '#d7ac64';
    ctx.font = '13px Cinzel, serif';
    ctx.fillText('Ds Pagu, Wates, Kediri, Jawa Timur', 300, 740);

    // Trigger download
    const link = document.createElement('a');
    link.download = `QR-Presensi-${currentGuest.code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Kartu QR Presensi berhasil diunduh!');
  });
}

// 9. RSVP & Wishes
async function loadWishes() {
  try {
    const res = await fetch('/api/wishes');
    if (!res.ok) return;
    const wishes = await res.json();
    renderWishes(wishes);
  } catch (e) {
    console.error('Error loading wishes:', e);
  }
}

function renderWishes(wishes) {
  const container = document.getElementById('wishesContainer');
  const countBadge = document.getElementById('wishesCountBadge');
  countBadge.textContent = `${wishes.length} Ucapan`;

  if (!wishes || wishes.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 30px; font-size: 0.85rem;">
        Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
      </div>
    `;
    return;
  }

  container.innerHTML = wishes.map(w => {
    const isHadir = w.attendance === 'hadir';
    const badgeClass = isHadir ? 'badge-hadir' : 'badge-tidak';
    const badgeText = isHadir ? 'Hadir' : 'Tidak Hadir';
    const timeFormatted = formatTimeAgo(w.createdAt);

    return `
      <div class="wish-item">
        <div class="wish-header">
          <span class="wish-author">${escapeHtml(w.name)}</span>
          <span class="wish-badge ${badgeClass}">${badgeText}</span>
        </div>
        <p class="wish-message">${escapeHtml(w.message)}</p>
        <div class="wish-time">${timeFormatted}</div>
      </div>
    `;
  }).join('');
}

function setupRsvpForm() {
  const form = document.getElementById('rsvpForm');
  const paxGroup = document.getElementById('paxGroup');
  const attendanceInputs = document.querySelectorAll('input[name="attendance"]');

  // Toggle Pax selector based on attendance
  attendanceInputs.forEach(input => {
    input.addEventListener('change', () => {
      paxGroup.style.display = input.value === 'hadir' ? 'block' : 'none';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitRsvp');
    btn.disabled = true;
    btn.innerHTML = '<span>Mengirim...</span>';

    const name = document.getElementById('rsvpName').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    const pax = document.getElementById('rsvpPax').value;
    const message = document.getElementById('rsvpMessage').value.trim();

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          attendance,
          pax,
          message,
          guestCode: currentGuest ? currentGuest.code : ''
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Konfirmasi & ucapan Anda berhasil terkirim! Terima kasih.');
        document.getElementById('rsvpMessage').value = '';
        loadWishes();
      } else {
        showToast('Gagal mengirim: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      showToast('Koneksi bermasalah, silakan coba lagi');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <i data-lucide="send" style="width: 16px; height: 16px;"></i>
        <span>Kirim Ucapan &amp; Konfirmasi</span>
      `;
      refreshIcons();
    }
  });
}

// 10. Lightbox
function openLightbox(src) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  img.src = src;
  modal.classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightboxModal').classList.remove('active');
}

// Utilities
function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const past = new Date(isoString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Baru saja';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit yang lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam yang lalu`;
  return `${Math.floor(diffSec / 86400)} hari yang lalu`;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Bottom nav active item observer
function setupNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.bottom-nav-item');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
}

// Document Ready
document.addEventListener('DOMContentLoaded', async () => {
  setupCover();
  setupAudio();
  await loadConfig();
  await setupGuestInfo();
  setupQrDownload();
  setupRsvpForm();
  loadWishes();
  setupNavObserver();
  refreshIcons();
});
