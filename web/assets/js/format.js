/* DoctorBill — Bangladesh locale formatters.
   Underlying numeric values stay accurate; only presentation is localized. */

window.Fmt = (function () {
  "use strict";

  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  const EN_MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  // Convert ASCII digits to Bengali numerals (keeps separators as-is).
  function bn(str) {
    return String(str).replace(/\d/g, (d) => BN_DIGITS[+d]);
  }

  // Group using the Bangladesh/Indian system (…,##,###). Keeps decimals and signs.
  function groupBD(num) {
    const n = Number(num);
    const neg = n < 0;
    const s = String(Math.abs(n));
    const dot = s.indexOf(".");
    const intPart = dot === -1 ? s : s.slice(0, dot);
    const decPart = dot === -1 ? "" : s.slice(dot + 1);
    let grouped = intPart;
    if (intPart.length > 3) {
      const last3 = intPart.slice(-3);
      let rest = intPart.slice(0, -3);
      rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
      grouped = rest + "," + last3;
    }
    return (neg ? "-" : "") + grouped + (decPart ? "." + decPart : "");
  }

  // Amount in Bengali numerals with ৳ prefix. Decimal portion is preserved as-is
  // (no silent truncation); unnecessary trailing digits are not invented.
  // When the site language is English, renders with western digits instead —
  // bare Fmt.taka() call sites across pages stay language-correct automatically.
  function activeLang() {
    try { return window.localStorage.getItem("db_lang") === "en" ? "en" : "bn"; }
    catch (e) { return "bn"; }
  }
  function taka(num, lang) {
    if (num === null || num === undefined || num === "" || isNaN(Number(num))) return null;
    return (lang || activeLang()) === "en" ? takaEn(Number(num)) : "৳" + bn(groupBD(Number(num)));
  }

  // English-mode variant: western digits, same Bangladesh grouping, same ৳ prefix.
  function takaEn(num) {
    if (num === null || num === undefined || num === "" || isNaN(Number(num))) return null;
    return "৳" + groupBD(Number(num));
  }

  // Fixed price or range → display string. Returns null when no usable price.
  // Optional lang ("bn" | "en", default "bn") localizes connectors and numerals.
  function price(rec, lang) {
    if (!rec) return null;
    if (rec.verification_status === "unavailable") return null;
    const en = lang === "en";
    const T = en ? takaEn : taka;
    if (rec.price_amount !== null && rec.price_amount !== undefined) return T(rec.price_amount);
    if (rec.price_min !== null && rec.price_max !== null) return T(rec.price_min) + " – " + T(rec.price_max);
    if (rec.price_min !== null) return T(rec.price_min) + (en ? " from" : " থেকে");
    if (rec.price_max !== null) return (en ? "Up to " : "সর্বোচ্চ ") + T(rec.price_max);
    return null;
  }

  // ISO date → localized date, e.g. "০৫ অক্টোবর ২০২৬" (bn) / "05 October 2026" (en).
  function date(iso, lang) {
    if (!iso || typeof iso !== "string") return null;
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    if (isNaN(d.getTime())) return null;
    if (lang === "en") {
      return String(d.getDate()).padStart(2, "0") + " " + EN_MONTHS[d.getMonth()] + " " + d.getFullYear();
    }
    return bn(String(d.getDate()).padStart(2, "0")) + " " + BN_MONTHS[d.getMonth()] + " " + bn(d.getFullYear());
  }

  // Verification status → { label_bn, label_en, cls }
  const STATUS = {
    verified: { label_bn: "যাচাইকৃত মূল্য", label_en: "Verified price", cls: "verified" },
    hospital_provided: { label_bn: "হাসপাতাল-প্রদত্ত তথ্য", label_en: "Hospital-provided", cls: "hospital" },
    user_provided: { label_bn: "ব্যবহারকারী-প্রদত্ত তথ্য", label_en: "User-provided", cls: "user" },
    unverified: { label_bn: "মূল্য যাচাই করা হয়নি", label_en: "Price not verified", cls: "unverified" },
    unavailable: { label_bn: "মূল্য পাওয়া যায়নি", label_en: "Price not available", cls: "unavailable" },
  };
  function status(key) {
    return STATUS[key] || STATUS.unverified;
  }
  function statusLabel(key, lang) {
    const s = status(key);
    return lang === "en" ? s.label_en : s.label_bn;
  }

  // Relative freshness note: "সর্বশেষ আপডেট: …" (bn) / "Last updated: …" (en)
  function updated(iso, lang) {
    const d = date(iso, lang);
    if (d) return (lang === "en" ? "Last updated: " : "সর্বশেষ আপডেট: ") + d;
    return lang === "en" ? "No update date" : "আপডেটের তারিখ নেই";
  }

  // Compact variant for card meta: "আপডেট ০৫ অক্টোবর ২০২৬" / "Updated 05 October 2026"
  function updatedShort(iso, lang) {
    const d = date(iso, lang);
    if (d) return (lang === "en" ? "Updated " : "আপডেট ") + d;
    return lang === "en" ? "No update date" : "আপডেটের তারিখ নেই";
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  return { bn, taka, takaEn, price, date, status, statusLabel, updated, updatedShort, escapeHtml, groupBD };
})();
