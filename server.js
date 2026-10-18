const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const WEB_DIR = path.join(__dirname, 'web');

/* ---- Admin Basic Auth (staging-level protection; replace with real RBAC later).
        Credentials come from env vars; change them before deploying anywhere. ---- */
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'doctorbill-admin';

function checkAdminAuth(req) {
  const header = req.headers.authorization || '';
  const m = /^Basic\s+(.+)$/i.exec(header);
  if (!m) return false;
  try {
    const [user, pass] = Buffer.from(m[1], 'base64').toString('utf8').split(':');
    return user === ADMIN_USER && pass === ADMIN_PASS;
  } catch (e) {
    return false;
  }
}

/* ---- Bill submissions ----
   Users submit bill/receipt files; they land in data/ (outside web/, so the
   static handler can never serve them). Review happens in admin (Basic Auth).
   Approved records can be exported as price-record JSON for data.js merge. */
const DATA_DIR = path.join(__dirname, 'data');
const BILLS_DIR = path.join(DATA_DIR, 'bills');
const BILLS_FILE = path.join(DATA_DIR, 'bills.json');
const BILL_FILE_EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'application/pdf': '.pdf' };
const BILL_STATUSES = { queued: 'যাচাই চলছে', more_info: 'আরও তথ্য প্রয়োজন', approved: 'যাচাইকৃত', rejected: 'বাতিল' };
const MAX_FILE_BYTES = 5 * 1024 * 1024;   // stored file limit
const MAX_BODY_BYTES = 8 * 1024 * 1024;   // JSON body limit (base64 grows ~1.4x)
const RATE_WINDOW_MS = 60 * 60 * 1000, RATE_MAX = 5;

function ensureDataDir() {
  if (!fs.existsSync(BILLS_DIR)) fs.mkdirSync(BILLS_DIR, { recursive: true });
}
function loadBills() {
  try { return JSON.parse(fs.readFileSync(BILLS_FILE, 'utf8') || '[]'); } catch (e) { return []; }
}
function saveBills(list) {
  fs.writeFileSync(BILLS_FILE, JSON.stringify(list, null, 2));
}
function makeRef() {
  const t = Date.now().toString(36).toUpperCase().padStart(6, '0').slice(-6);
  return 'DB-' + t + '-' + Math.floor(Math.random() * 90 + 10);
}
function validateBillPayload(b) {
  const errs = [];
  if (!/^[ho]\d+$/.test(String(b.hospital_id || ''))) errs.push('hospital');
  if (!/^s\d+$/.test(String(b.service_id || ''))) errs.push('service');
  const amt = Number(b.amount);
  if (!Number.isInteger(amt) || amt < 1 || amt > 99999999) errs.push('amount');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.date || '')) || isNaN(Date.parse(b.date + 'T00:00:00Z'))) errs.push('date');
  if (String(b.details || '').length > 1000) errs.push('details');
  if (String(b.contact || '').length > 120) errs.push('contact');
  if (b.consent !== true) errs.push('consent');
  if (!b.file || !BILL_FILE_EXT[b.file.type] || typeof b.file.data !== 'string' || !b.file.data.length || b.file.data.length > Math.ceil(MAX_FILE_BYTES * 4 / 3)) errs.push('file');
  return errs;
}
const rateHits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (rateHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) { rateHits.set(ip, arr); return true; }
  arr.push(now); rateHits.set(ip, arr); return false;
}
/* --- OSRM geo proxy: cache + polite per-IP limit (public demo server) --- */
const GEO_TTL_MS = 5 * 60 * 1000;      // road data cache: 5 min
const GEO_TIMEOUT_MS = 6000;           // upstream timeout
const GEO_MAX_PER_WINDOW = 60;         // per IP
const GEO_WINDOW_MS = 5 * 60 * 1000;
const geoCache = new Map();
const geoHits = new Map();
/* --- OpenStreetMap (Overpass) hospital cache --- */
const OSM_CACHE_FILE = path.join(__dirname, 'data', 'osm_cache.json');
const OSM_MAX_PER_WINDOW = 20;
const OSM_WINDOW_MS = 60 * 60 * 1000;
const osmHits = new Map();
function osmLimited(ip) {
  const now = Date.now();
  const arr = (osmHits.get(ip) || []).filter((t) => now - t < OSM_WINDOW_MS);
  if (arr.length >= OSM_MAX_PER_WINDOW) { osmHits.set(ip, arr); return true; }
  arr.push(now); osmHits.set(ip, arr); return false;
}
function geoGeoLimited(ip) {
  const now = Date.now();
  const arr = (geoHits.get(ip) || []).filter((t) => now - t < GEO_WINDOW_MS);
  if (arr.length >= GEO_MAX_PER_WINDOW) { geoHits.set(ip, arr); return true; }
  arr.push(now); geoHits.set(ip, arr); return false;
}
function readJsonBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let total = 0, done = false;
    req.on('data', (c) => {
      if (done) return;
      total += c.length;
      if (total > limit) { done = true; reject(new Error('body too large')); return; }
      chunks.push(c);
    });
    req.on('end', () => { if (!done) { done = true; try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (e) { reject(new Error('bad json')); } } });
    req.on('error', () => { if (!done) { done = true; reject(new Error('read error')); } });
  });
}
function unauthorized(res) {
  send(res, 401, JSON.stringify({ ok: false, error: 'unauthorized' }),
    { 'Content-Type': 'application/json; charset=utf-8', 'WWW-Authenticate': 'Basic realm="DoctorBill Admin", charset="UTF-8"' });
}
function jsonSend(res, code, obj) {
  send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}

/* API routes return true when handled. */
function handleApi(req, res, pathname, ip) {
  // --- public: submit a bill ---
  if (req.method === 'POST' && pathname === '/api/bills') {
    readJsonBody(req, MAX_BODY_BYTES).then((body) => {
      if (rateLimited(ip)) { jsonSend(res, 429, { ok: false, error: 'rate_limited' }); return; }
      const errs = validateBillPayload(body);
      if (errs.length) { jsonSend(res, 400, { ok: false, error: 'invalid_fields', fields: errs }); return; }
      const ref = makeRef();
      let buf;
      try { buf = Buffer.from(body.file.data, 'base64'); } catch (e) { buf = null; }
      if (!buf || !buf.length || buf.length > MAX_FILE_BYTES) { jsonSend(res, 400, { ok: false, error: 'invalid_fields', fields: ['file'] }); return; }
      ensureDataDir();
      const ext = BILL_FILE_EXT[body.file.type];
      fs.writeFileSync(path.join(BILLS_DIR, ref + ext), buf);
      const list = loadBills();
      list.push({
        ref, hospital_id: body.hospital_id, service_id: body.service_id,
        amount: Number(body.amount), date: body.date,
        details: String(body.details || '').slice(0, 1000),
        contact: String(body.contact || '').slice(0, 120),
        file: { ext, size: buf.length, mime: body.file.type },
        status: 'queued', ts: new Date().toISOString()
      });
      saveBills(list);
      jsonSend(res, 201, { ok: true, ref });
    }).catch(() => jsonSend(res, 400, { ok: false, error: 'bad_request' }));
    return true;
  }

  // --- public: submission status lookup (status only, no personal data) ---
  if (req.method === 'GET' && pathname.startsWith('/api/bills/status/')) {
    const ref = pathname.slice('/api/bills/status/'.length);
    if (!/^DB-[A-Z0-9-]{3,20}$/.test(ref)) { jsonSend(res, 400, { ok: false, error: 'bad_ref' }); return true; }
    const rec = loadBills().find((r) => r.ref === ref);
    jsonSend(res, 200, rec ? { ok: true, ref, status: rec.status, label: BILL_STATUSES[rec.status] || rec.status } : { ok: false, error: 'not_found' });
    return true;
  }

  // --- public: REAL Bangladeshi hospitals from OpenStreetMap (Overpass API proxy) ---
  // Browsers/proxies can't always reach overpass-api.de directly; server fetches
  // once per area and caches to disk for 24h (hospitals don't move).
  if (req.method === 'GET' && pathname === '/api/geo/hospitals') {
    const q = new URL(req.url, 'http://x').searchParams;
    // Validations: no-args → all fetched (for admin/debug)? Keep lat,lng,radius required.
    const parseCoord = (s) => {
      const m = /^(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)$/.exec(String(s || ''));
      if (!m) return null;
      const lat = Number(m[1]), lng = Number(m[2]);
      return (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) ? [lat, lng] : null;
    };
    const src = parseCoord(q.get('src'));
    const r = Math.max(4000, Math.min(30000, Math.round(Number(q.get('radius') || 15000) / 5000) * 5000));
    if (!src) { jsonSend(res, 400, { ok: false, error: 'bad_coords' }); return true; }
    // quantized cache key so every user in a city shares one cache entry
    const qlat = Math.round(src[0] / 0.05) * 0.05, qlng = Math.round(src[1] / 0.05) * 0.05;
    const key = 'k' + qlat.toFixed(2) + '_' + qlng.toFixed(2) + '_' + r;
    const CACHE_D_TTL = 24 * 60 * 60 * 1000;
    const FRESH_AT = Date.now() - CACHE_D_TTL;
    let disk = null;
    try { disk = JSON.parse(fs.readFileSync(OSM_CACHE_FILE, 'utf8') || '{}'); } catch (e) { disk = {}; }
    const hit = disk[key];
    if (hit && hit.t > FRESH_AT) { jsonSend(res, 200, hit); return true; }
    if (osmLimited(ip)) { jsonSend(res, 429, { ok: false, error: 'rate_limited' }); return true; }
    const coord = qlat.toFixed(4) + ',' + qlng.toFixed(4);
    const query = '[out:json][timeout:45];(node["amenity"~"^(hospital|clinic)$"](around:' + r + ',' + coord + ');way["amenity"~"^(hospital|clinic)$"](around:' + r + ',' + coord + ');relation["amenity"~"^(hospital|clinic)$"](around:' + r + ',' + coord + '););out center tags 1500;';
    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'User-Agent': 'DoctorBill/1.0 (BD hospital cost guide)' },
      body: query,
      signal: AbortSignal.timeout(50000),
    })
      .then((r2) => r2.json())
      .then((j) => {
        if (!j || !Array.isArray(j.elements)) { jsonSend(res, 200, { ok: false, error: 'upstream' }); return; }
        // Normalize: named hospitals/clinics only, no invented fields.
        const norm = j.elements
          .filter((e) => e.tags && e.tags.name && ((e.lat && e.lon) || e.center))
          .slice(0, 1200)
          .map((e) => {
            const c = (e.lat && e.lon) ? e : e.center;
            const t = e.tags;
            const area = t['addr:suburb'] || t['addr:neighbourhood'] || t['addr:quarter'] || t['addr:village'] || '';
            const city = t['addr:city'] || t['addr:town'] || q.get('city') || '';
            let address = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');
            const rec = {
              id: 'o' + e.id, slug: 'osm-' + e.id,
              name_bn: t['name:bn'] || t.name,
              name_en: t['name:en'] || null,
              hospital_type: e.tags.amenity === 'clinic' ? 'ক্লিনিক' : 'হাসপাতাল',
              city: city || null, area: area || null,
              address_bn: address || null,
              website: t.website || t['contact:website'] || null,
              latitude: c.lat, longitude: c.lon,
              is_real: true, is_directory: true, has_price_data: false, coords_source: 'osm',
            };
            return rec;
          })
          .filter(Boolean);
        const body = { ok: true, source: 'OpenStreetMap (Overpass API)', license: 'ODbL', fetched_at: new Date().toISOString(), t: Date.now(), count: norm.length, results: norm };
        disk[key] = body;
        try { fs.writeFileSync(OSM_CACHE_FILE, JSON.stringify(disk)); } catch (e2) {}
        jsonSend(res, 200, body);
      })
      .catch(() => jsonSend(res, 200, { ok: false, error: 'upstream_unreachable' }));
    return true;
  }

  // --- public: REAL prices from approved user-submitted bills (no personal data) ---
  if (req.method === 'GET' && pathname === '/api/prices') {
    const bills = loadBills().filter((b) => b.status === 'approved');
    const prices = bills.map((b) => ({
      hospital_id: b.hospital_id, service_id: b.service_id,
      currency: 'BDT', price_amount: b.amount, price_min: null, price_max: null,
      price_basis: 'রোগীর আসল বিল থেকে', inclusions: '', exclusions: '',
      source_type: 'user_submission', verification_status: 'user_provided',
      last_checked_at: b.date, ref: b.ref, is_real: true,
    }));
    const dir = (new URL(req.url, 'http://x').searchParams.get('group') === '1')
      ? { hospitals: [...new Set(prices.map((p) => p.hospital_id))], services: [...new Set(prices.map((p) => p.service_id))] } : null;
    jsonSend(res, 200, dir ? { ok: true, source: 'user_bills', prices, ...dir } : { ok: true, source: 'user_bills', prices });
    return true;
  }

  // --- public: real road distance & time via OSRM (server proxy: browsers can't reach OSRM directly here) ---
  if (req.method === 'GET' && pathname === '/api/geo/routes') {    const q = new URL(req.url, 'http://x').searchParams;
    const parseCoord = (s) => {
      const m = /^(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)$/.exec(String(s || ''));
      if (!m) return null;
      const lat = Number(m[1]), lng = Number(m[2]);
      return (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) ? [lat, lng] : null;
    };
    const src = parseCoord(q.get('src'));
    const dests = String(q.get('dests') || '').split('|').slice(0, 25).map(parseCoord).filter(Boolean);
    if (!src || dests.length < 1) { jsonSend(res, 400, { ok: false, error: 'bad_coords' }); return true; }
    // In-memory cache: roads hardly change; ~5 min TTL. Key = rounded coords.
    const rr = (v) => v.toFixed(3); // ~100 m
    const cacheKey = 'g:' + rr(src[0]) + ',' + rr(src[1]) + '|' + dests.map((d) => rr(d[0]) + ',' + rr(d[1])).sort().join(';');
    const cached = geoCache.get(cacheKey);
    if (cached && Date.now() - cached.t < GEO_TTL_MS) { jsonSend(res, 200, cached.body); return true; }
    if (geoGeoLimited(ip)) { jsonSend(res, 429, { ok: false, error: 'rate_limited' }); return true; }
    const coords = [src].concat(dests).map((c) => c[1] + ',' + c[0]).join(';'); // OSRM wants lng,lat
    const url = 'https://router.project-osrm.org/table/v1/driving/' + coords + '?sources=0&annotations=distance,duration';
    fetch(url, { signal: AbortSignal.timeout(GEO_TIMEOUT_MS), headers: { 'User-Agent': 'DoctorBill/1.0 (+local demo)' } })
      .then((r2) => r2.json())
      .then((j) => {
        if (!j || j.code !== 'Ok' || !Array.isArray(j.distances) || !Array.isArray(j.durations)) {
          jsonSend(res, 200, { ok: false, error: 'upstream' }); return;
        }
        const body = {
          ok: true, provider: 'OSRM',
          results: dests.map((d, i) => ({
            km: Math.round((j.distances[0][i + 1] || 0) / 100) / 10,
            min: Math.round((j.durations[0][i + 1] || 0) / 60),
          })),
        };
        geoCache.set(cacheKey, { t: Date.now(), body });
        if (geoCache.size > 300) geoCache.delete(geoCache.keys().next().value);
        jsonSend(res, 200, body);
      })
      .catch(() => jsonSend(res, 200, { ok: false, error: 'upstream_unreachable' }));
    return true;
  }

  // --- admin-only from here on ---
  if (!pathname.startsWith('/api/bills')) { return false; }
  if (!checkAdminAuth(req)) { unauthorized(res); return true; }

  if (req.method === 'GET' && pathname === '/api/bills') {
    jsonSend(res, 200, { ok: true, bills: loadBills().sort((a, b) => b.ts.localeCompare(a.ts)) });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/bills/status') {
    readJsonBody(req, 4096).then((body) => {
      const ref = String(body.ref || ''), status = String(body.status || '');
      if (!/^DB-[A-Z0-9-]{3,20}$/.test(ref) || !BILL_STATUSES[status]) { jsonSend(res, 400, { ok: false, error: 'bad_request' }); return; }
      const list = loadBills();
      const rec = list.find((r) => r.ref === ref);
      if (!rec) { jsonSend(res, 404, { ok: false, error: 'not_found' }); return; }
      rec.status = status; rec.reviewed_ts = new Date().toISOString();
      saveBills(list);
      jsonSend(res, 200, { ok: true, ref, status, label: BILL_STATUSES[status] });
    }).catch(() => jsonSend(res, 400, { ok: false, error: 'bad_request' }));
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/bills/export') {
    const approved = loadBills().filter((r) => r.status === 'approved').map((r) => ({
      hospital_id: r.hospital_id, service_id: r.service_id,
      price_amount: r.amount, price_min: null, price_max: null,
      verification_status: 'user_provided', source_type: 'user_submission',
      last_checked_at: r.date, bill_ref: r.ref
    }));
    jsonSend(res, 200, { ok: true, count: approved.length, records: approved });
    return true;
  }

  if (req.method === 'GET' && pathname.startsWith('/api/bills/file/')) {
    const ref = decodeURIComponent(pathname.slice('/api/bills/file/'.length));
    if (!/^DB-[A-Z0-9-]{3,20}$/.test(ref)) { jsonSend(res, 400, { ok: false, error: 'bad_ref' }); return true; }
    const rec = loadBills().find((r) => r.ref === ref);
    if (!rec || !rec.file) { jsonSend(res, 404, { ok: false, error: 'not_found' }); return true; }
    const fp = path.join(BILLS_DIR, ref + rec.file.ext);
    if (!fs.existsSync(fp)) { jsonSend(res, 404, { ok: false, error: 'file_missing' }); return true; }
    send(res, 200, fs.readFileSync(fp), {
      'Content-Type': rec.file.mime || 'application/octet-stream',
      'Content-Disposition': 'inline; filename="' + (ref + rec.file.ext) + '"',
      'Cache-Control': 'no-store'
    });
    return true;
  }

  return false;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

/* ---- Security headers (applied to every response) ----
   'unsafe-inline' for script-src/style-src is required because the pages use
   inline bootstrap code; stricten later when the pages are converted to files. */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://unpkg.com https://tile.openstreetmap.org",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
};

/* ---- Cache policy: HTML/CSS/JS must always validate fresh (no asset
        versioning yet); binary assets can be cached briefly. ---- */
function cacheHeaderFor(ext) {
  if (ext === '.html' || ext === '.css' || ext === '.js') return 'no-cache';
  if (['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico', '.woff', '.woff2', '.ttf'].includes(ext)) {
    return 'public, max-age=86400';
  }
  return 'public, max-age=3600';
}

function send(res, code, body, headers) {
  res.writeHead(code, Object.assign({}, SECURITY_HEADERS, headers || {}));
  res.end(body);
}

const server = http.createServer((req, res) => {
  // Parse URL and clean pathname (invalid percent-encoding must not crash the server)
  let pathname;
  try {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    pathname = decodeURIComponent(reqUrl.pathname);
  } catch (e) {
    send(res, 400, '400 Bad Request', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  // API endpoints (bill submissions + admin review); handled before serving static files
  const ip = (req.socket && req.socket.remoteAddress) || 'unknown';
  if (pathname.startsWith('/api/')) {
    let handled = false;
    try {
      handled = handleApi(req, res, pathname, ip);
    } catch (e) {
      handled = true;
      jsonSend(res, 500, { ok: false, error: 'server_error' });
    }
    if (handled) return;
  }

  // Admin panel: protected with HTTP Basic Auth (401 challenge until authorized)
  if (pathname === '/admin' || pathname === '/admin.html' || pathname.toLowerCase() === '/admin/') {
    if (!checkAdminAuth(req)) {
      send(res, 401, '401 Unauthorized — অ্যাডমিন প্যানেল কেবল অনুমোদিত ব্যবহারকারীর জন্য।',
        { 'WWW-Authenticate': 'Basic realm="DoctorBill Admin", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }
  }

  if (pathname === '/') {
    pathname = '/index.html';
  }

  let filePath = path.join(WEB_DIR, pathname);

  // Security check to avoid path traversal: use a normalized, absolute path and
  // verify it stays inside WEB_DIR (startsWith on a raw joined path is bypassable).
  const resolved = path.resolve(filePath);
  if (resolved !== path.resolve(WEB_DIR) && !resolved.startsWith(path.resolve(WEB_DIR) + path.sep)) {
    send(res, 403, '403 Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }
  filePath = resolved;

  // Check if file exists or try with .html extension
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else {
      send(res, 404, '<h1>404 Not Found</h1><p><a href="/">হোমে ফিরে যান</a></p>', { 'Content-Type': 'text/html; charset=utf-8' });
      return;
    }
  }

  // If path is a directory, look for index.html
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      if (!fs.existsSync(filePath)) {
        send(res, 404, '404 Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        send(res, 500, `Server Error: ${err.code}`, { 'Content-Type': 'text/plain; charset=utf-8' });
      } else {
        send(res, 200, content, {
          'Content-Type': contentType,
          'Cache-Control': cacheHeaderFor(ext)
        });
      }
    });
  } catch (e) {
    send(res, 500, 'Server Error', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
});

server.listen(PORT, () => {
  console.log(`DoctorBill server is running at http://localhost:${PORT}`);
  console.log(`Bill submissions are stored in: ${BILLS_DIR}`);
  if (ADMIN_PASS === 'doctorbill-admin') {
    console.log('WARNING: default admin password in use — set ADMIN_USER / ADMIN_PASS env vars.');
  }
});
