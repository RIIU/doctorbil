/* DoctorBill — local write layer (prototype: no server yet).
   Everything here lives in this browser only; it is not a shared dataset. */

window.Store = (function () {
  "use strict";

  const NS = "dbill:";
  const K = {
    contrib: NS + "contrib",
    feedback: NS + "feedback",
    overrides: NS + "overrides",
    gaps: NS + "gaps",
  };
  const MAX_CONTRIB = 200;
  const MAX_GAPS = 120;

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      return false;
    }
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function nowIso() { return new Date().toISOString(); }

  /* ---------- contributions (bill / quick "আজ কত লাগল") ---------- */

  function contributions() {
    const list = read(K.contrib, []);
    return Array.isArray(list) ? list : [];
  }

  function addContribution(input) {
    const list = contributions();
    const rec = {
      id: uid("c"),
      hospital_id: input.hospital_id || null,
      service_id: input.service_id || null,
      amount: Number(input.amount),
      bill_date: input.bill_date || null,
      details: String(input.details || "").slice(0, 500),
      has_receipt: !!input.has_receipt,
      contact: String(input.contact || "").slice(0, 120),
      mode: input.mode === "quick" ? "quick" : "full",
      status: "pending",
      created_at: nowIso(),
      reviewer_note: "",
    };
    if (!rec.hospital_id || !rec.service_id || !isFinite(rec.amount) || rec.amount <= 0) {
      return { ok: false, error: "invalid" };
    }
    list.unshift(rec);
    if (list.length > MAX_CONTRIB) list.length = MAX_CONTRIB;
    const saved = write(K.contrib, list);
    return { ok: saved, record: rec, saved };
  }

  function updateContribution(id, patch) {
    const list = contributions();
    let hit = null;
    const next = list.map((r) => {
      if (r.id !== id) return r;
      hit = Object.assign({}, r, patch, { reviewed_at: nowIso() });
      return hit;
    });
    write(K.contrib, next);
    return hit;
  }

  function removeContribution(id) {
    write(K.contrib, contributions().filter((r) => r.id !== id));
  }

  function clearContributions() { write(K.contrib, []); }

  const CONTRIB_STATUS = {
    pending: { bn: "পর্যালোচনাধীন", en: "Under review" },
    verified: { bn: "যাচাইকৃত", en: "Verified" },
    rejected: { bn: "বাতিল", en: "Not accepted" },
    needs_info: { bn: "আরও তথ্য প্রয়োজন", en: "More info needed" },
  };

  function contributionCount() { return contributions().length; }

  /* ---------- one-tap price feedback ("এই মূল্য ঠিক?") ---------- */

  function feedbackMap() {
    const m = read(K.feedback, {});
    return m && typeof m === "object" ? m : {};
  }

  function fkey(hospitalId, serviceId) { return hospitalId + "|" + serviceId; }

  function voteFeedback(hospitalId, serviceId, dir) {
    const m = feedbackMap();
    const k = fkey(hospitalId, serviceId);
    const cur = m[k] || { up: 0, down: 0, mine: null };
    if (cur.mine === dir) {
      cur[dir === "up" ? "up" : "down"] = Math.max(0, cur[dir === "up" ? "up" : "down"] - 1);
      cur.mine = null;
    } else {
      if (cur.mine) cur[cur.mine === "up" ? "up" : "down"] = Math.max(0, cur[cur.mine === "up" ? "up" : "down"] - 1);
      cur[dir === "up" ? "up" : "down"] += 1;
      cur.mine = dir;
    }
    m[k] = cur;
    write(K.feedback, m);
    return cur;
  }

  function feedbackFor(hospitalId, serviceId) {
    return feedbackMap()[fkey(hospitalId, serviceId)] || { up: 0, down: 0, mine: null };
  }

  /* ---------- admin price overrides ---------- */

  function overrides() {
    const list = read(K.overrides, []);
    return Array.isArray(list) ? list : [];
  }

  function normalizeOverride(rec) {
    const out = {
      hospital_id: String(rec.hospital_id || rec.hospital || "").trim(),
      service_id: String(rec.service_id || rec.service || "").trim(),
      currency: "BDT",
      price_amount: rec.price_amount === "" || rec.price_amount == null ? null : Number(rec.price_amount),
      price_min: rec.price_min === "" || rec.price_min == null ? null : Number(rec.price_min),
      price_max: rec.price_max === "" || rec.price_max == null ? null : Number(rec.price_max),
      price_basis: rec.price_basis || "তালিকাভুক্ত মূল্য",
      inclusions: rec.inclusions || "",
      exclusions: rec.exclusions || "",
      source_type: rec.source_type || "hospital_provided",
      source_reference: rec.source_reference || null,
      last_checked_at: rec.last_checked_at || new Date().toISOString().slice(0, 10),
      effective_from: rec.effective_from || null,
      verification_status: rec.verification_status || "hospital_provided",
      verified_by: rec.verified_by || null,
      is_sample: false,
      environment: "local-admin",
      sample_label: null,
      updated_at: nowIso(),
    };
    if (out.price_amount != null && !isFinite(out.price_amount)) out.price_amount = null;
    if (out.price_min != null && !isFinite(out.price_min)) out.price_min = null;
    if (out.price_max != null && !isFinite(out.price_max)) out.price_max = null;
    if (out.verification_status === "unavailable") { out.price_amount = out.price_min = out.price_max = null; }
    return out;
  }

  function validOverride(rec) {
    if (!rec.hospital_id || !rec.service_id) return false;
    if (rec.verification_status === "unavailable") return true;
    return rec.price_amount != null || (rec.price_min != null && rec.price_max != null);
  }

  function upsertOverride(rec) {
    const norm = normalizeOverride(rec);
    if (!validOverride(norm)) return { ok: false, error: "invalid" };
    const list = overrides().filter((o) => !(o.hospital_id === norm.hospital_id && o.service_id === norm.service_id));
    list.unshift(norm);
    return { ok: write(K.overrides, list), record: norm };
  }

  function removeOverride(hospitalId, serviceId) {
    write(K.overrides, overrides().filter((o) => !(o.hospital_id === hospitalId && o.service_id === serviceId)));
  }

  function clearOverrides() { write(K.overrides, []); }

  /* Apply admin overrides onto the in-memory price table so every page sees them. */
  function applyOverrides(DB) {
    const list = overrides();
    if (!list.length || !DB || !Array.isArray(DB.prices)) return { applied: 0, added: 0 };
    let applied = 0, added = 0;
    list.forEach((o) => {
      const i = DB.prices.findIndex((p) => p.hospital_id === o.hospital_id && p.service_id === o.service_id);
      const merged = Object.assign({}, i >= 0 ? DB.prices[i] : {}, o);
      if (i >= 0) { DB.prices[i] = merged; applied++; }
      else { DB.prices.push(merged); added++; }
    });
    return { applied: applied, added: added };
  }

  /* ---------- search gaps (user searched, we have no price) ---------- */

  function gapMap() {
    const m = read(K.gaps, {});
    return m && typeof m === "object" ? m : {};
  }

  function logGap(term) {
    const q = String(term || "").toLowerCase().trim();
    if (q.length < 2) return;
    const m = gapMap();
    const hit = Object.keys(m).find((k) => k === q);
    m[hit || q] = hit ? m[hit] + 1 : 1;
    const keys = Object.keys(m);
    if (keys.length > MAX_GAPS) {
      keys.sort((a, b) => m[b] - m[a]).slice(MAX_GAPS).forEach((k) => delete m[k]);
    }
    write(K.gaps, m);
  }

  function gaps() {
    const m = gapMap();
    return Object.keys(m).map((term) => ({ term: term, count: m[term] })).sort((a, b) => b.count - a.count);
  }

  function clearGaps() { write(K.gaps, {}); }

  /* ---------- CSV / JSON ---------- */

  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", quoted = false;
    const s = String(text || "").replace(/\r\n?/g, "\n");
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (quoted) {
        if (ch === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += ch;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
  }

  const CSV_ALIASES = {
    hospital_id: ["hospital_id", "hospital", "হাসপাতাল", "hospital id", "hid"],
    service_id: ["service_id", "service", "সেবা", "service id", "sid"],
    price_amount: ["price_amount", "price", "amount", "মূল্য", "টাকার পরিমাণ", "পরিমাণ"],
    price_min: ["price_min", "min", "সর্বনিম্ন"],
    price_max: ["price_max", "max", "সর্বোচ্চ"],
    verification_status: ["verification_status", "status", "অবস্থা"],
    source_type: ["source_type", "source", "উৎস"],
    last_checked_at: ["last_checked_at", "checked", "updated", "তারিখ"],
    inclusions: ["inclusions", "অন্তর্ভুক্ত"],
    exclusions: ["exclusions", "বাদ"],
    price_basis: ["price_basis", "basis"],
  };

  function toCSV(rows) {
    const cols = ["hospital_id", "service_id", "price_amount", "price_min", "price_max",
      "verification_status", "source_type", "last_checked_at", "inclusions", "exclusions", "price_basis"];
    const esc = (v) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return [cols.join(",")].concat(rows.map((r) => cols.map((c) => esc(r[c])).join(","))).join("\n");
  }

  /* Header row → normalized override rows. Returns { rows, errors }. */
  function importCSV(text, DB) {
    const rows = parseCSV(text);
    if (rows.length < 2) return { rows: [], errors: ["কমপক্ষে একটি header ও একটি data row লাগবে।"] };
    const header = rows[0].map((h) => String(h).trim().toLowerCase());
    const idx = {};
    Object.keys(CSV_ALIASES).forEach((field) => {
      const at = header.findIndex((h) => CSV_ALIASES[field].indexOf(h) !== -1);
      if (at !== -1) idx[field] = at;
    });
    if (idx.hospital_id == null || idx.service_id == null) {
      return { rows: [], errors: ["hospital_id ও service_id কলাম বাধ্যতামূলক (হাসপাতালের নাম/কোডও চলবে)।"] };
    }
    const out = [], errors = [];
    rows.slice(1).forEach((r, n) => {
      const pick = (f) => (idx[f] == null ? "" : String(r[idx[f]] || "").trim());
      const hid = resolveId(DB ? DB.hospitals : [], pick("hospital_id"), "h");
      const sid = resolveId(DB ? DB.services : [], pick("service_id"), "s");
      if (!hid || !sid) { errors.push("row " + (n + 2) + ": হাসপাতাল/সেবা চেনা যায়নি (" + pick("hospital_id") + " / " + pick("service_id") + ")"); return; }
      const amountRaw = pick("price_amount");
      const status = pick("verification_status") || "hospital_provided";
      const rec = normalizeOverride({
        hospital_id: hid, service_id: sid,
        price_amount: amountRaw === "" ? null : Number(amountRaw.replace(/[^\d.]/g, "")),
        price_min: pick("price_min"), price_max: pick("price_max"),
        verification_status: status, source_type: pick("source_type") || "hospital_provided",
        last_checked_at: pick("last_checked_at"), inclusions: pick("inclusions"),
        exclusions: pick("exclusions"), price_basis: pick("price_basis"),
      });
      if (!validOverride(rec)) { errors.push("row " + (n + 2) + ": মূল্য বা min–max range দিন, অথবা status = unavailable"); return; }
      out.push(rec);
    });
    return { rows: out, errors: errors };
  }

  function resolveId(list, value, prefix) {
    const v = String(value || "").trim();
    if (!v) return null;
    if (/^[a-z]\d+$/i.test(v) && list.some((x) => x.id === v)) return v;
    const low = v.toLowerCase();
    const byEn = list.find((x) => (x.name_en || "").toLowerCase() === low);
    if (byEn) return byEn.id;
    const byBn = list.find((x) => (x.name_bn || "").toLowerCase() === low);
    if (byBn) return byBn.id;
    const bySlug = list.find((x) => (x.slug || "").toLowerCase() === low);
    if (bySlug) return bySlug.id;
    const partial = list.find((x) => (x.name_bn || "").toLowerCase().indexOf(low) !== -1 || (x.name_en || "").toLowerCase().indexOf(low) !== -1);
    return partial ? partial.id : null;
  }

  function importJSON(text) {
    let data;
    try { data = JSON.parse(text); } catch (e) { return { rows: [], errors: ["JSON parse error: " + e.message] }; }
    const arr = Array.isArray(data) ? data : (data && Array.isArray(data.prices) ? data.prices : null);
    if (!arr) return { rows: [], errors: ["Expected an array of price records, or { prices: [...] }."] };
    const out = [], errors = [];
    arr.forEach((r, n) => {
      const rec = normalizeOverride(r);
      if (!validOverride(rec)) { errors.push("item " + (n + 1) + ": invalid"); return; }
      out.push(rec);
    });
    return { rows: out, errors: errors };
  }

  function exportJSON() {
    return JSON.stringify({ exported_at: nowIso(), source: "DoctorBill local admin", prices: overrides() }, null, 2);
  }

  function download(filename, text, mime) {
    try {
      const blob = new Blob([text], { type: (mime || "text/plain") + ";charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- coverage + stats ---------- */

  function coverage(DB) {
    if (!DB) return { filled: 0, total: 0, missing: [] };
    const have = {};
    DB.prices.forEach((p) => { if (p.verification_status !== "unavailable") have[fkey(p.hospital_id, p.service_id)] = true; });
    const missing = [];
    DB.hospitals.forEach((h) => DB.services.forEach((s) => {
      if (!have[fkey(h.id, s.id)]) missing.push({ hospital_id: h.id, service_id: s.id });
    }));
    const total = DB.hospitals.length * DB.services.length;
    return { filled: total - missing.length, total: total, missing: missing };
  }

  function stats(DB) {
    const c = coverage(DB);
    const fb = feedbackMap();
    return {
      filled: c.filled, total: c.total,
      overrides: overrides().length,
      contributions: contributionCount(),
      pending: contributions().filter((r) => r.status === "pending").length,
      feedbackVotes: Object.keys(fb).reduce((n, k) => n + ((fb[k].up || 0) + (fb[k].down || 0)), 0),
      gaps: gaps().length,
    };
  }

  function resetAll() {
    [K.contrib, K.feedback, K.overrides, K.gaps].forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
  }

  function storageOk() {
    try { localStorage.setItem(NS + "probe", "1"); localStorage.removeItem(NS + "probe"); return true; }
    catch (e) { return false; }
  }

  return {
    contributions, addContribution, updateContribution, removeContribution, clearContributions,
    contributionCount, CONTRIB_STATUS,
    voteFeedback, feedbackFor,
    overrides, upsertOverride, removeOverride, clearOverrides, applyOverrides, normalizeOverride,
    logGap, gaps, clearGaps,
    parseCSV, toCSV, importCSV, importJSON, exportJSON, download,
    coverage, stats, resetAll, storageOk,
  };
})();
