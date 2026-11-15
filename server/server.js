const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(body);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        // limit 5MB
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getAuthToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

function requireAuth(req, res) {
  const token = getAuthToken(req);
  if (!token || !db.validateSession(token)) {
    sendJson(res, 401, { error: 'Unauthorized: Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.' });
    return false;
  }
  return true;
}

function serveStatic(req, res, filePath) {
  // Prevent directory traversal
  const safePath = path.normalize(filePath);
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Support audio Range requests for smooth streaming & seeking
    if (ext === '.mp3') {
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = end - start + 1;
        const fileStream = fs.createReadStream(safePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        fileStream.pipe(res);
        return;
      }
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });
    fs.createReadStream(safePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  // --- API ROUTES ---
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Admin Auth
      if (pathname === '/api/admin/login' && method === 'POST') {
        const body = await parseJsonBody(req);
        const settings = db.getSettings();
        if (body.password === settings.adminPassword) {
          const token = db.createSession();
          return sendJson(res, 200, { success: true, token });
        } else {
          return sendJson(res, 401, { success: false, error: 'Password salah!' });
        }
      }

      if (pathname === '/api/admin/logout' && method === 'POST') {
        const token = getAuthToken(req);
        if (token) db.revokeSession(token);
        return sendJson(res, 200, { success: true });
      }

      if (pathname === '/api/admin/verify' && method === 'GET') {
        const token = getAuthToken(req);
        const valid = db.validateSession(token);
        return sendJson(res, 200, { valid });
      }

      // 2. Settings / Config
      if (pathname === '/api/config') {
        if (method === 'GET') {
          const settings = { ...db.getSettings() };
          delete settings.adminPassword; // hide password in public config
          return sendJson(res, 200, settings);
        }
        if (method === 'PUT') {
          if (!requireAuth(req, res)) return;
          const body = await parseJsonBody(req);
          const updated = db.updateSettings(body);
          const safe = { ...updated };
          delete safe.adminPassword;
          return sendJson(res, 200, { success: true, settings: safe });
        }
      }

      // 3. Stats (Admin)
      if (pathname === '/api/stats' && method === 'GET') {
        if (!requireAuth(req, res)) return;
        return sendJson(res, 200, db.getStats());
      }

      // 4. Guests CRUD
      if (pathname === '/api/guests') {
        if (method === 'GET') {
          if (!requireAuth(req, res)) return;
          return sendJson(res, 200, db.getGuests());
        }
        if (method === 'POST') {
          if (!requireAuth(req, res)) return;
          const body = await parseJsonBody(req);
          if (!body.name || !body.name.trim()) {
            return sendJson(res, 400, { error: 'Nama tamu wajib diisi' });
          }
          const guest = db.addGuest(body);
          return sendJson(res, 201, { success: true, guest });
        }
      }

      if (pathname === '/api/guests/bulk' && method === 'POST') {
        if (!requireAuth(req, res)) return;
        const body = await parseJsonBody(req);
        if (!Array.isArray(body.guests)) {
          return sendJson(res, 400, { error: 'Payload harus berupa array guests' });
        }
        const created = db.bulkAddGuests(body.guests);
        return sendJson(res, 201, { success: true, count: created.length, guests: created });
      }

      if (pathname.startsWith('/api/guests/') && pathname !== '/api/guests/bulk' && pathname !== '/api/guests/undo-checkin') {
        const targetId = pathname.replace('/api/guests/', '');
        if (method === 'PUT') {
          if (!requireAuth(req, res)) return;
          const body = await parseJsonBody(req);
          const updated = db.updateGuest(targetId, body);
          if (!updated) return sendJson(res, 404, { error: 'Tamu tidak ditemukan' });
          return sendJson(res, 200, { success: true, guest: updated });
        }
        if (method === 'DELETE') {
          if (!requireAuth(req, res)) return;
          const ok = db.deleteGuest(targetId);
          if (!ok) return sendJson(res, 404, { error: 'Tamu tidak ditemukan' });
          return sendJson(res, 200, { success: true });
        }
      }

      if (pathname === '/api/guests/undo-checkin' && method === 'POST') {
        if (!requireAuth(req, res)) return;
        const body = await parseJsonBody(req);
        const ok = db.undoCheckIn(body.id || body.code);
        if (!ok) return sendJson(res, 404, { error: 'Tamu tidak ditemukan' });
        return sendJson(res, 200, { success: true });
      }

      // 5. Public Guest Lookup by Code or Slug or Name
      if (pathname.startsWith('/api/guest/')) {
        const codeOrSlug = decodeURIComponent(pathname.replace('/api/guest/', ''));
        const guest = db.findGuest(codeOrSlug);
        if (!guest) {
          return sendJson(res, 404, { error: 'Tamu tidak ditemukan' });
        }
        return sendJson(res, 200, {
          code: guest.code,
          name: guest.name,
          category: guest.category,
          pax: guest.pax,
          rsvp: guest.rsvp,
          checkedIn: guest.checkedIn,
          checkedInAt: guest.checkedInAt
        });
      }

      // 6. Check-in (Scanner / Reception Desk)
      if (pathname === '/api/checkin' && method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.code) {
          return sendJson(res, 400, { error: 'Kode QR tamu wajib diisi' });
        }
        const result = db.checkInGuest(body.code, body.pax);
        return sendJson(res, result.success ? 200 : (result.alreadyCheckedIn ? 409 : 404), result);
      }

      // 7. RSVP & Wishes
      if (pathname === '/api/rsvp' && method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.name || !body.attendance) {
          return sendJson(res, 400, { error: 'Nama dan konfirmasi kehadiran wajib diisi' });
        }
        const result = db.addRsvp(body);
        return sendJson(res, 200, { success: true, ...result });
      }

      if (pathname === '/api/wishes') {
        if (method === 'GET') {
          return sendJson(res, 200, db.getWishes());
        }
      }

      if (pathname.startsWith('/api/wishes/') && method === 'DELETE') {
        if (!requireAuth(req, res)) return;
        const wishId = pathname.replace('/api/wishes/', '');
        const ok = db.deleteWish(wishId);
        if (!ok) return sendJson(res, 404, { error: 'Ucapan tidak ditemukan' });
        return sendJson(res, 200, { success: true });
      }

      // Route not found in API
      return sendJson(res, 404, { error: 'API endpoint not found' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJson(res, 500, { error: 'Internal Server Error: ' + err.message });
    }
  }

  // --- HTML / PAGE ROUTING ---
  if (pathname === '/' || pathname === '/index.html' || pathname.startsWith('/undangan/')) {
    return serveStatic(req, res, path.join(PUBLIC_DIR, 'index.html'));
  }

  if (pathname === '/admin' || pathname === '/admin.html') {
    return serveStatic(req, res, path.join(PUBLIC_DIR, 'admin.html'));
  }

  if (pathname === '/scanner' || pathname === '/scanner.html') {
    return serveStatic(req, res, path.join(PUBLIC_DIR, 'scanner.html'));
  }

  // --- STATIC ASSET SERVING ---
  const filePath = path.join(PUBLIC_DIR, pathname);
  serveStatic(req, res, filePath);
});

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Wedding Invitation Full-Stack Server Running!  `);
  console.log(` - Undangan Digital : http://localhost:${PORT}`);
  console.log(` - Admin Dashboard  : http://localhost:${PORT}/admin`);
  console.log(` - QR Code Scanner  : http://localhost:${PORT}/scanner`);
  console.log(`=================================================`);
});
