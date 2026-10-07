/* DoctorBill — Bangladesh locale formatters.
   Underlying numeric values stay accurate; only presentation is localized. */

window.Fmt = (function () {
  "use strict";

  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

  // Convert ASCII digits to Bengali numerals (keeps separators as-is).
  function bn(str) {
    return String(str).replace(/\d/g, (d) => BN_DIGITS[+d]);
  }

  // Group an integer using the Bangladesh/Indian system (…,##,###).
  function groupBD(num) {
    const s = String(Math.trunc(Math.abs(num)));
    if (s.length <= 3) return s;
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return rest + "," + last3;
  }

  // Amount in Bengali numerals with ৳ prefix.
  function taka(num) {
    if (num === null || num === undefined || num === "" || isNaN(num)) return null;
    return "৳" + bn(groupBD(Number(num)));
  }

  // Fixed price or range → display string. Returns null when no usable price.
  function price(rec) {
    if (!rec) return null;
    if (rec.verification_status === "unavailable") return null;
    if (rec.price_amount !== null && rec.price_amount !== undefined) return taka(rec.price_amount);
    if (rec.price_min !== null && rec.price_max !== null) return taka(rec.price_min) + "–" + taka(rec.price_max);
    if (rec.price_min !== null) return taka(rec.price_min) + " থেকে";
    if (rec.price_max !== null) return "সর্বোচ্চ " + taka(rec.price_max);
    return null;
  }

  // ISO date → "০৫ অক্টোবর ২০২৬"
  function date(iso) {
    if (!iso) return null;
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    if (isNaN(d)) return null;
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
  function statusLabel(key) {
    return status(key).label_bn;
  }

  // Relative freshness note, e.g. "সর্বশেষ আপডেট: …"
  function updated(iso) {
    const d = date(iso);
    return d ? "সর্বশেষ আপডেট: " + d : "আপডেটের তারিখ নেই";
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  return { bn, taka, price, date, status, statusLabel, updated, escapeHtml, groupBD };
})();
