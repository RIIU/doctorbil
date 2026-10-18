/* DoctorBill — shared UI components & behaviors (frontend prototype).
   Renders nav, footer, search suggestions, cards, badges. All data is sample. */

window.UI = (function () {
  "use strict";
  const h = Fmt.escapeHtml;

  const NAV = [
    { key: "home", i18n: "nav.home", href: "index.html" },
    { key: "compare", i18n: "nav.compare", href: "compare.html" },
    { key: "hospitals", i18n: "nav.hospitals", href: "hospitals.html" },
    { key: "emergency", i18n: "nav.emergency", href: "emergency.html" },
    { key: "more", i18n: "nav.more", href: "#more" },
  ];

  const DESKTOP_NAV = [
    { key: "home", i18n: "nav.home", href: "index.html" },
    { key: "compare", i18n: "nav.compare_long", href: "compare.html" },
    { key: "hospitals", i18n: "nav.hospitals", href: "hospitals.html" },
    { key: "calculator", i18n: "nav.calculator", href: "calculator.html" },
    { key: "emergency", i18n: "nav.emergency", href: "emergency.html" },
    { key: "submit", i18n: "nav.submit", href: "submit-bill.html" },
  ];

  const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    compare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M4 12h16M4 17h7"/><path d="m17 4 3 3-3 3"/></svg>',
    hospitals: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V8l8-5 8 5v13"/><path d="M12 9v5M9.5 11.5h5"/><path d="M9 21v-4h6v4"/></svg>',
    emergency: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a16 16 0 0 1-16-16Z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  };

  /* ---------- Theme (dark / light) ---------- */
  const THEME_KEY = "db_theme";
  // Guarded localStorage helpers — storage ACCESS itself can throw (Safari private
  // mode, "block all cookies"), and an unguarded read blanked out the whole site.
  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function safeRemove(key) { try { localStorage.removeItem(key); } catch (e) {} }
  /* ---- Text size (accessibility): normal → বড় → সবচেয়ে বড় ---- */
  const FONT_KEY = "db_font";
  function getFont() { const v = safeGet(FONT_KEY); return (v === "lg" || v === "xl") ? v : ""; }
  function applyFont() {
    const v = getFont();
    if (v) document.documentElement.setAttribute("data-fontsize", v);
    else document.documentElement.removeAttribute("data-fontsize");
    document.querySelectorAll("[data-font-toggle]").forEach((b) => {
      const tag = b.querySelector(".font-tag");
      if (tag) tag.textContent = v === "xl" ? "A++" : v === "lg" ? "A+" : "A";
      b.setAttribute("aria-label", v ? "টেক্সট সাইজ বাড়ান-কমান (এখন " + (v === "lg" ? "বড়" : "সবচেয়ে বড়") + ")" : "টেক্সট সাইজ বাড়ান-কমান");
    });
  }
  function cycleFont() {
    const order = ["", "lg", "xl"];
    const next = order[(order.indexOf(getFont()) + 1) % order.length];
    if (next) safeSet(FONT_KEY, next); else safeRemove(FONT_KEY);
    applyFont();
  }
  function getTheme() {
    const saved = safeGet(THEME_KEY);
    return saved === "dark" ? "dark" : "light";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      const isDark = t === "dark";
      b.setAttribute("aria-pressed", isDark ? "true" : "false");
      b.setAttribute("aria-label", isDark ? "লাইট মোড চালু করুন" : "ডার্ক মোড চালু করুন");
      b.title = isDark ? "লাইট মোড" : "ডার্ক মোড";
      b.innerHTML = isDark ? ICONS.sun : ICONS.moon;
    });
  }
  function toggleTheme() {
    const next = getTheme() === "dark" ? "light" : "dark";
    safeSet(THEME_KEY, next);
    applyTheme(next);
    return next;
  }
  // Apply persisted/system theme before paint to avoid a flash.
  applyTheme(getTheme());

  /* ---------- Language (bn / en) ---------- */
  const LANG_KEY = "db_lang";
  const I18N = {
    bn: {
      "nav.home": "হোম", "nav.compare": "তুলনা", "nav.compare_long": "মূল্য তুলনা",
      "nav.hospitals": "হাসপাতাল", "nav.emergency": "জরুরি", "nav.more": "আরও",
      "nav.calculator": "খরচ ক্যালকুলেটর", "nav.submit": "বিল জমা দিন",
      "action.search": "খুঁজুন", "action.details": "বিস্তারিত দেখুন",
      "action.compare_price": "মূল্য তুলনা", "action.directions": "দিকনির্দেশনা",
      "action.submit_bill": "বিল জমা দিন", "action.compare_other": "অন্য হাসপাতালের মূল্য তুলনা",
      "badge.sample": "নমুনা ডেটা", "badge.sample_title": "এটি নমুনা/ডেমো তথ্য",
      "badge.unverified": "তথ্য যাচাই বাকি", "label.price_na": "মূল্য পাওয়া যায়নি",
      "label.services_price": "টি সেবার মূল্য", "label.no_data_yet": "মূল্য-তথ্য এখনো যুক্ত হয়নি",
      "search.placeholder": "টেস্ট, চিকিৎসা বা হাসপাতালের নাম লিখুন",
      "search.aria": "সেবা বা হাসপাতাল খুঁজুন",
      "search.recent": "সাম্প্রতিক অনুসন্ধান", "search.clear": "মুছুন",
      "theme.dark_on": "ডার্ক মোড চালু করুন", "theme.light_on": "লাইট মোড চালু করুন",
      "theme.dark": "ডার্ক মোড", "theme.light": "লাইট মোড", "lang.switch": "ভাষা পরিবর্তন করুন",
      "more.title": "আরও", "more.calculator": "খরচ ক্যালকুলেটর", "more.submit": "বিল জমা দিন",
      "more.compare": "মূল্য তুলনা", "more.emergency": "জরুরি তথ্য",
      "more.guide": "খরচ সাশ্রয় গাইড", "more.tracker": "বিল ট্র্যাকার",
      "more.admin_note": "অ্যাডমিন প্যানেল কেবল অনুমোদিত ব্যবহারকারীর জন্য।",
      "more.close": "বন্ধ করুন",
      "banner.sample": "উন্নয়ন সংস্করণ — সব তথ্য নমুনা ডেটা, কোনো যাচাইকৃত বাস্তব মূল্য নয়।",
      "nav.main_label": "প্রধান মেনু", "nav.mobile": "মোবাইল মেনু",
      "brand.home": "DoctorBill হোম", "brand.logo": "DoctorBill লোগো",
      "footer.tagline": "হাসপাতালের খরচ জানুন, বুঝে সিদ্ধান্ত নিন। তালিকাভুক্ত মূল্য থেকে সম্ভাব্য খরচের ধারণা নিন — চূড়ান্ত বিল নয়।",
      "footer.platform": "প্ল্যাটফর্ম", "footer.support": "সহায়তা", "footer.legal": "আইনি",
      "footer.how": "কীভাবে কাজ করে", "footer.trust": "স্বচ্ছতা", "footer.emergency": "জরুরি তথ্য",
      "footer.guide": "খরচ সাশ্রয় গাইড", "footer.tracker": "বিল ট্র্যাকার",
      "footer.report": "ভুল তথ্য জানান", "footer.contact": "যোগাযোগ",
      "footer.privacy": "প্রাইভেসি পলিসি", "footer.terms": "শর্তাবলি", "footer.disclaimer": "মূল্য দাবিত্যাগ",
      "fav.add": "প্রিয় তালিকায় যোগ করুন", "fav.remove": "প্রিয় থেকে সরান",
      "fav.added": "প্রিয় তালিকায় যোগ হয়েছে", "fav.removed": "প্রিয় তালিকা থেকে সরানো হয়েছে",
      "near.me": "📍 আমার কাছাকাছি", "near.on": "✓ কাছাকাছি চালু (বন্ধ করুন)", "near.searching": "অবস্থান খোঁজা হচ্ছে…",
      "near.denied": "অবস্থান অনুমতি পাওয়া যায়নি — শহর বেছে দেখুন।",
      "near.live": "🟢 লাইভ: আমার কাছাকাছি", "near.live.status": "লাইভ ট্র্যাকিং চালু — আপনি সরলে তালিকা ও দূরত্ব নিজেই আপডেট হবে।", "near.accunit": "মিটার", "near.straight": "সরলরেখা দূরত্ব",
      "map.loading": "মানচিত্র লোড হচ্ছে…", "map.failed": "মানচিত্র লোড করা যায়নি (ইন্টারনেট সংযোগ প্রয়োজন)।",
      "map.you": "আপনি এখানে", "map.approx": "আনুমানিক অবস্থান", "map.sample": "নমুনা তথ্য", "map.distance": "দূরত্ব",
      "unit.km": "কিমি",
      "page.home.h1": "হাসপাতালের খরচ জানুন, বুঝে সিদ্ধান্ত নিন",
      "page.compare.h1": "মূল্য তুলনা", "page.hospitals.h1": "হাসপাতালসমূহ",
      "page.calculator.h1": "খরচ ক্যালকুলেটর", "page.submit.h1": "বিল জমা দিন",
      "page.hospitals.sub": "শহর বা এলাকা দিয়ে ফিল্টার করুন। মানচিত্র ও তালিকা দুভাবেই দেখুন।",
      "hospitals.near": "📍 আমার কাছাকাছি", "hospitals.favonly": "★ শুধু প্রিয়",
      "hospitals.showall": "★ সব দেখুন", "hospitals.city": "শহর", "hospitals.area": "এলাকা",
      "hospitals.allcity": "সব শহর", "hospitals.allarea": "সব এলাকা",
      "hospitals.near.status": "নিকটতম হাসপাতাল দূরত্ব অনুযায়ী সাজানো (আনুমানিক)।",
      "hospitals.empty.none": "এই ফিল্টারে কোনো মূল্য-তথ্য যুক্ত হাসপাতাল নেই। মানচিত্রে সবুজ পিনগুলো পরিচিত হাসপাতাল (আনুমানিক অবস্থান)।",
      "hospitals.empty.fav": "আপনার প্রিয় তালিকায় এখনো কোনো হাসপাতাল নেই। কার্ডের ★ তারকা চিহ্নে ট্যাপ করে প্রিয় তালিকায় যোগ করুন।",
      "common.skip": "মূল কনটেন্টে যান",
      "hospitals.skip": "মূল কনটেন্টে যান", "emerg.skip": "মূল কনটেন্টে যান",
      "hosp.skip": "মূল কনটেন্টে যান", "bill.skip": "মূল কনটেন্টে যান",      "home.hero.sub": "আপনার প্রয়োজনীয় চিকিৎসা ও ডায়াগনস্টিক সেবার সম্ভাব্য খরচ খুঁজুন এবং বিভিন্ন হাসপাতালের মূল্য তুলনা করুন।",
      "home.cta.compare": "হাসপাতাল তুলনা করুন", "home.cta.calc": "খরচ হিসাব করুন",
      "home.popular.h2": "জনপ্রিয় সেবা",
      "home.popular.sub": "সবচেয়ে বেশি খোঁজা হয় এমন টেস্ট ও চিকিৎসা। মূল্য ব্যবহারকারীদের আসল বিল থেকে যুক্ত হয়।",
      "home.popular.all": "সব সেবা দেখুন",
      "home.nearby.h2": "আপনার কাছের হাসপাতাল",
      "home.nearby.sub": "এলাকা বেছে নিন বা মানচিত্রে দেখুন।",
      "home.nearby.citylabel": "এলাকা/শহর:",
      "home.nearby.empty": "এই শহরে এখনো কোনো মূল্য-তথ্য যুক্ত নেই। মানচিত্রে সবুজ পিনগুলো এই শহরের পরিচিত হাসপাতাল (আনুমানিক অবস্থান)।",
      "home.nearby.status": "আপনার অবস্থান থেকে নিকটতম হাসপাতাল দেখানো হচ্ছে (দূরত্ব আনুমানিক)।",
      "home.how.h2": "কীভাবে কাজ করে",
      "home.how.s1.t": "সেবা খুঁজুন", "home.how.s1.d": "টেস্ট, চিকিৎসা বা হাসপাতালের নাম লিখে সার্চ করুন।",
      "home.how.s2.t": "হাসপাতালের খরচ তুলনা করুন", "home.how.s2.d": "একই সেবার তালিকাভুক্ত মূল্য পাশাপাশি দেখুন, সাথে কী কী অন্তর্ভুক্ত।",
      "home.how.s3.t": "তথ্য যাচাই করে সিদ্ধান্ত নিন", "home.how.s3.d": "মূল্যের উৎস, আপডেটের তারিখ ও যাচাইয়ের অবস্থা দেখে সিদ্ধান্ত নিন।",
      "home.trust.h2": "স্বচ্ছতা ও বিশ্বাস",
      "home.trust.sub": "মূল্য কোথা থেকে আসে এবং কীভাবে যাচাই হয়, তা আমরা স্পষ্টভাবে জানাই।",
      "home.trust.c1.t": "মূল্যের উৎস", "home.trust.c1.d": "মূল্য আসে হাসপাতাল-প্রদত্ত তথ্য, ব্যবহারকারীর জমা দেওয়া বিল ও প্রকাশ্য তালিকা থেকে। প্রতিটি মূল্যে তার উৎস ও অবস্থা দেখানো হয়।",
      "home.trust.c2.t": "বিল জমা ও যাচাই", "home.trust.c2.d": "ব্যবহারকারীরা বিল জমা দিতে পারেন। জমা দেওয়া মানেই মূল্য \"যাচাইকৃত\" নয় — নির্ধারিত পর্যালোচনা প্রক্রিয়া শেষ হলে তবেই যাচাইকৃত হিসেবে চিহ্নিত হয়।",
      "home.trust.c3.t": "মূল্য কেন ভিন্ন হয়", "home.trust.c3.d": "রোগীর অবস্থা, চিকিৎসক, প্যাকেজ, কেবিন ও অতিরিক্ত সেবার কারণে একই সেবার খরচ হাসপাতালভেদে ভিন্ন হতে পারে।",
      "home.trust.c4.t": "ভুল তথ্য জানান", "home.trust.c4.d": "কোনো মূল্য ভুল বা পুরনো মনে হলে হাসপাতাল পৃষ্ঠা থেকে \"ভুল মূল্য জানান\" ব্যবহার করুন।",
      "home.trust.disclaimer": "মূল্য দাবিত্যাগ: এখানে দেখানো মূল্য তালিকাভুক্ত তথ্যভিত্তিক আনুমানিক। চূড়ান্ত বিলে পরামর্শ ফি, ট্যাক্স, রেজিস্ট্রেশন, consumables, কেবিন ও অন্যান্য খরচ যুক্ত হতে পারে। এটি চিকিৎসা পরামর্শ নয়।",
      "cmp.skip": "মূল কনটেন্টে যান", "cmp.h1": "মূল্য তুলনা", "cmp.sub": "একটি সেবা বেছে নিন — বিভিন্ন হাসপাতালের তালিকাভুক্ত মূল্য পাশাপাশি দেখুন।",
      "cmp.filters": "ফিল্টার", "cmp.reset": "রিসেট", "cmp.city": "শহর", "cmp.hos_type": "হাসপাতালের ধরন", "cmp.price_status": "মূল্যের অবস্থা",
      "cmp.opt_all": "সব", "cmp.opt_hospital": "হাসপাতাল-প্রদত্ত তথ্য", "cmp.opt_user": "ব্যবহারকারী-প্রদত্ত তথ্য", "cmp.opt_unverified": "মূল্য যাচাই করা হয়নি",
      "cmp.min_price": "সর্বনিম্ন মূল্য (৳)", "cmp.max_price": "সর্বোচ্চ মূল্য (৳)", "cmp.ph_min": "যেমন ৫০০", "cmp.ph_max": "যেমন ৫০০০",
      "cmp.sort": "সাজান", "cmp.sort_asc": "মূল্য: কম থেকে বেশি", "cmp.sort_desc": "মূল্য: বেশি থেকে কম", "cmp.sort_updated": "সর্বশেষ আপডেট",
      "cmp.selected_count": "টি হাসপাতাল নির্বাচিত", "cmp.clear": "মুছুন", "cmp.show_compare": "তুলনা দেখুন", "cmp.modal_title": "মূল্য তুলনা",
      "calc.skip": "মূল কনটেন্টে যান", "calc.h1": "খরচ ক্যালকুলেটর", "calc.sub": "ধাপে ধাপে সেবা বেছে সম্ভাব্য খরচের আনুমানিক হিসাব নিন। মূল্য আসে ব্যবহারকারীদের আসল বিল থেকে।",
      "hosp.pm_title": "মূল্যের বিস্তারিত",
      "bill.submit_title": "বিল জমা দিন", "bill.submit_sub": "আপনার হাসপাতালের বিল বা রশিদের তথ্য জমা দিয়ে মূল্য যাচাই ও গবেষণায় সহায়তা করুন।",
      "bill.privacy_strong": "গোপনীয়তা:", "bill.privacy_body": "অপ্রয়োজনীয় ব্যক্তিগত তথ্য আপলোড করবেন না। প্রকাশের আগে রোগীর নাম, ফোন নম্বর, পেশেন্ট আইডি, ঠিকানা ও পেমেন্টের তথ্য মুছে/লুকিয়ে দেওয়া হয়।",
      "bill.label_hospital": "হাসপাতালের নাম", "bill.choose_opt": "বেছে নিন…", "bill.err_hospital": "হাসপাতাল বেছে নিন।",
      "bill.label_service": "সেবা বা টেস্টের নাম", "bill.err_service": "সেবা বেছে নিন।", "bill.label_amount": "বিলের পরিমাণ (৳)",
      "bill.ph_amount": "যেমন ৭০০", "bill.err_amount": "সঠিক পরিমাণ লিখুন।", "bill.label_date": "বিলের তারিখ", "bill.err_date": "তারিখ দিন।",
      "bill.label_details": "অতিরিক্ত বিবরণ (ঐচ্ছিক)", "bill.ph_details": "প্যাকেজ, কেবিন, কী কী অন্তর্ভুক্ত ছিল ইত্যাদি",
      "bill.label_file": "রশিদ/বিলের ছবি বা PDF", "bill.file_hint": "অনুমোদিত: PNG, JPG, WEBP, PDF · সর্বোচ্চ ৫ এমবি। ফাইলটি গোপন রাখা হয়, পাবলিক লিংকে প্রকাশ হয় না।",
      "bill.err_file": "গ্রহণযোগ্য ফাইল দিন (PNG/JPG/WEBP/PDF, ≤৫ এমবি)।", "bill.label_contact": "যোগাযোগ (কেবল যাচাইয়ের প্রয়োজনে, ঐচ্ছিক)",
      "bill.ph_contact": "ফোন বা ইমেইল", "bill.hint_contact": "প্রকাশ্যে দেখানো হবে না।",
      "bill.use_strong": "কেন ও কীভাবে ব্যবহার হবে:", "bill.use_body": "মূল্য গবেষণা ও যাচাইয়ের জন্য বিল সংগ্রহ করা হয়। মূল ডকুমেন্ট কেবল অনুমোদিত পর্যালোচকরা দেখতে পারেন। যাচাই শেষে ব্যক্তিগত তথ্য সরিয়ে বেনামি মূল্য তুলনায় ব্যবহার হতে পারে। আপনি যেকোনো সময় সংশোধন বা মুছে ফেলার অনুরোধ করতে পারেন।",
      "bill.consent": "আমি উপরের শর্তে সম্মত, এবং জমাকৃত তথ্য বেনামি মূল্য তুলনায় ব্যবহার হতে পারে তা বুঝেছি।", "bill.err_consent": "জমা দিতে সম্মতি দিন।",
      "bill.submit_btn": "বিল জমা দিন", "bill.review_note": "জমা দিলেই মূল্য \"যাচাইকৃত\" হয় না — নির্ধারিত পর্যালোচনা প্রক্রিয়া শেষ হলে তবেই হয়।",
      "bill.lookup_title": "জমাকৃত বিলের অবস্থা দেখুন", "bill.lookup_hint": "জমা দেওয়ার সময় পাওয়া রেফারেন্স আইডি বসিয়ে অবস্থা জানুন — যেমন", "bill.lookup_period": "।",
      "bill.label_ref": "রেফারেন্স আইডি", "bill.lookup_btn": "অবস্থা দেখুন",
      "emerg.title": "জরুরি তথ্য ও জরুরি নম্বর", "emerg.call_service": "জরুরি সেবা (পুলিশ/অ্যাম্বুলেন্স/ফায়ার)", "emerg.number": "৯৯৯",
      "emerg.call_sub": "বাংলাদেশের সরকারি জরুরি নম্বর", "emerg.call_now": "এখনই কল করুন",
      "emerg.warn_strong": "গুরুত্বপূর্ণ:", "emerg.warn_body": "এই প্ল্যাটফর্ম জরুরি চিকিৎসা সেবার বিকল্প নয়। জীবনঝুঁকি থাকলে অবিলম্বে ৯৯৯-এ কল করুন বা নিকটস্থ হাসপাতালের জরুরি বিভাগে যান।",
      "emerg.by_area": "এলাকাভিত্তিক হাসপাতাল", "emerg.by_area_sub": "শহর/এলাকা বেছে নিন। ঠিকানা ও দিকনির্দেশনা দেখুন। (তালিকা OpenStreetMap থেকে আসল।)",
      "emerg.label_city": "শহর", "emerg.label_area": "এলাকা", "emerg.all_areas": "সব এলাকা",
      "guide.skip": "মূল কনটেন্টে যান", "guide.title": "খরচ সাশ্রয়ের গাইড",
      "guide.sub": "বাংলাদেশে চিকিৎসা ও ডায়াগনস্টিক খরচের একটা বড় অংশই হয় জানা-অজানায়। একই পরীক্ষা বা সেবার দাম এক প্রতিষ্ঠান থেকে অন্য প্রতিষ্ঠানে অনেক ভিন্ন হতে পারে। নিচের সাধারণ ধাপগুলো কাজে লাগালে অপ্রয়োজনীয় খরচ অনেকটাই এড়ানো যায়। ",
      "guide.subWarn": "এটি সাধারণ পরামর্শ — চিকিৎসকের নির্দেশনা সর্বোপরি।",
      "guide.t1": "১. বেশ কয়েকটি প্রতিষ্ঠানের মূল্য জেনে তারপর টেস্ট করান",
      "guide.c1pre": "একই রক্ত পরীক্ষা, ইউএসজি বা এমআরআই-এর দাম অন্য প্রতিষ্ঠানে ব্যাপক ভিন্ন হতে পারে। টেস্ট করানোর আগে ", "guide.c1link": "DoctorBill-এ সেবা খুঁজে তুলনা করুন", "guide.c1post": ", আর গেলে হাসপাতালের কাউন্টারে মূল্য যাচাই করে নিন।",
      "guide.t2": "২. অপারেশন/ডেলিভারির \"প্যাকেজ আছে কি না\" জিজ্ঞেস করুন",
      "guide.c2p": "অনেক হাসপাতালে অপারেশন বা ডেলিভারির প্যাকেজ থাকে — টেস্ট, ঘর, ওপারেশন আলাদা আলাদা করে দিলে টাকা বেড়ে যেতে পারে। ভর্তির আগে লিখিতভাবে জেনে নিন: প্যাকেজে কী কী অন্তর্ভুক্ত, কী নয় (ওষুধ, কেবিন, অতিরিক্ত টেস্ট)।",
      "guide.t3": "৩. বিস্তারিত বিল নিন, প্রতিটি রশিদ সঙ্গে রাখুন",
      "guide.c3pre": "\"Itemized bill\" চান — কোন খরচের জন্য কত ধরা হয়েছে পরিষ্কার হয়ে যায়। প্রতিদিনের রশিদ সংগ্রহে রাখুন; ", "guide.c3link": "বিল ট্র্যাকার", "guide.c3post": " দিয়ে মোট খরচ নজরে রাখুন। চেনা নয় এমন খরচ পেলেই দায়িত্বের মানুষকে জিজ্ঞেস করে মেটান।",
      "guide.t4": "৪. ওষুধে সাশ্রয় সম্ভব",
      "guide.c4pre": "রেসিপির ওষুধের জেনেরিক নামটাও চিকিৎসক বা ফার্মাসিস্টকে জিজ্ঞেস করে নিন; একই ওষুধের দাম ব্র্যান্ডভেদে প্রায়ই অনেক কম হতে পারে। দীর্ঘদিনের ওষুধের ক্ষেত্রে ২-৩টা দোকানে দাম তুলনা করে নিন। ", "guide.c4warn": "কোনো ওষুধ নিজে বদলাবেন না — বদল কেবল চিকিৎসকের পরামর্শে।",
      "guide.t5": "৫. পুরনো প্রেসক্রিপশন ও রিপোর্ট এক জায়গায় রেখে রাখুন",
      "guide.c5p": "আগের রিপোর্ট সাথে নিয়ে যাওয়া দরকারি — অনেক সময় বিশেষজ্ঞ পুরনো রিপোর্ট দেখেই ওষুধ বা প্রসেডিউর সিদ্ধান্ত নেন; নতুন করে সব টেস্ট করাতে করাতে খরচ বড় হয়ে যায়।",
      "guide.t6": "৬. বড় অস্ত্রোপচারে দ্বিতীয় মত (second opinion) নিন",
      "guide.c6p": "বড় অস্ত্রোপচার বা বেশি খরচের প্রসেডিউরের আগে অন্য একজন অভিজ্ঞ চিকিৎসকের মতামত নিন। অনেক ক্ষেত্রে এতে সেই অস্ত্রোপচার কম ঝুঁকি বা কম খরচে সম্ভব হয়, কখনো বড় প্রসেডিউরের প্রয়োজনই থাকে না।",
      "guide.wnS": "মনে রাখবেন:", "guide.wnT": "সাশ্রয়ের চেষ্টা কেবল জানা-তুলনার মাধ্যমে করতে হবে; চিকিৎসক যা অপরিহার্য বলেছেন তা বাদ দিয়ে অর্থ বাঁচানোর চেষ্টা করবেন না।",
      "guide.faqh": "সাধারণ প্রশ্নোত্তর (FAQ)", "guide.qlabel": "প্রশ্ন:",
      "guide.q1": "DoctorBill দেখানো মূল্য কি চূড়ান্ত বিল?", "guide.a1": "না। দেখানো মূল্য কেবল তালিকাভুক্ত তথ্যের ভিত্তিতে আনুমানিক। চূড়ান্ত বিলে পরামর্শ ফি, কেবিন, ওষুধ ও অতিরিক্ত সেবা যোগ হতে পারে।",
      "guide.q2": "মূল্য যাচাই করা হয় কীভাবে?", "guide.a2pre": "প্রতি রেকর্ডে লেখা থাকে তথ্য কোথা থেকে এল (হাসপাতাল-প্রদত্ত / ব্যবহারকারী-প্রদত্ত) ও \"সর্বশেষ আপডেট\" কবে। কেবল নির্ধারিত পর্যালোচনা শেষ হলে \"যাচাইকৃত\" বলা হয়। ভুল তথ্য দেখলে ", "guide.a2link": "জানান", "guide.a2post": "।",
      "guide.q3": "বিল জমা দেওয়ার আগে গোপনীয়তা কীভাবে রাখব?", "guide.a3": "রশিদ দেওয়ার আগে রোগীর নাম, ফোন, বেড নম্বর, পেশেন্ট আইডি ও পেমেন্টের তথ্য কালি দিয়ে ঢেকে দিন। ফাইলটি কেবল অনুমোদিত পর্যালোচক দেখেন; পাবলিক লিংকে প্রকাশ হয় না।",
      "guide.q4": "জরুরি অবস্থায় তো মূল্য জানার সময় থাকে না?", "guide.a4pre": "জরুরি অবস্থায় প্রথম কাজ চিকিৎসা শুরু করা — দেরিতে মূল্য যাচাই নয়। সরকারি হাসপাতালের জরুরি বিভাগে প্রাথমিক চিকিৎসা প্রদান করা হয়; দেখুন ", "guide.a4link": "জরুরি তথ্য", "guide.a4post": "। মূল্য-তুলনা তো পরিকল্পিত সেবার জন্যই।",
      "guide.q5": "মোট খরচ এগিয়ে হিসাব করতে চাই — কীভাবে?", "guide.a5link": "খরচ ক্যালকুলেটর", "guide.a5": " ব্যবহার করুন। হাসপাতাল-সেবা বেছে ব্যাপ্তি-ভিত্তিক আনুমানিক মোট দেখা যায়; কেবিন/ওষুধ খরচ যোগ করা যায়, আর একই সেবা অন্য হাসপাতালে কত তা-ও পাশাপাশি দেখা যায়। ফল সংরক্ষণ/WhatsApp পাঠানো যায়।",
      "guide.note": "এই পেজটি সাধারণ পরামর্শ নিয়ে — এটি চিকিৎসা/আইনি পরামর্শ নয়।",
      "track.skip": "মূল কনটেন্টে যান", "track.title": "বিল ট্র্যাকার — আপনার খরচের খাতা",
      "track.sub": "চিকিৎসা, টেস্ট ও ওষুধের খরচ লিখে রাখুন। মোট খরচ দেখে বিল মিলিয়ে নিন। সব তথ্য ", "track.subDevice": "আপনার ডিভাইসেই", "track.subPost": " থাকে (localStorage), কোথাও পাঠানো বা প্রকাশ হয় না।",
      "track.date": "তারিখ", "track.errDate": "তারিখ দিন।", "track.amount": "পরিমাণ (৳)", "track.errAmount": "সঠিক পরিমাণ লিখুন।", "track.phAmount": "যেমন ৫০০",
      "track.place": "হাসপাতাল/ডায়াগনস্টিক (ঐচ্ছিক)", "track.phPlace": "যেমন জেলা হাসপাতাল", "track.item": "কী খরচ (ঐচ্ছিক)", "track.phItem": "যেমন CBC, দেখা, ওষুধ",
      "track.add": "খরচ যোগ করুন", "track.listTitle": "আপনার খরচসমূহ", "track.print": "প্রিন্ট", "track.clear": "সব মুছুন",
      "track.notice": "ট্র্যাকারের তথ্য কেবল আপনার ব্রাউজারে সংরক্ষিত। ব্রাউজার ডেটা পরিষ্কার করলে মুছে যায় — গুরুত্বপূর্ণ হলে প্রিন্ট করে রাখুন।",
      "contact.skip": "মূল কনটেন্টে যান", "contact.title": "যোগাযোগ", "contact.sub": "ভুল মূল্য জানাতে, হাসপাতালের তথ্য যুক্ত করতে বা প্রস্তাব দিতে আমাদের সাথে যোগাযোগ করুন।",
      "contact.hEmail": "ইমেইল", "contact.tGeneric": "সাধারণ যোগাযোগ:", "contact.hReport": "ভুল মূল্য জানান",
      "contact.tReportPre": "যেকোনো হাসপাতাল পৃষ্ঠায় \"ভুল মূল্য জানান\" ব্যবহার করুন অথবা সরাসরি ", "contact.tSubmitLink": "বিল জমা", "contact.tReportPost": " দিয়ে সত্য মূল্যের যাচাইয়ে সহায়তা করুন।",
      "contact.hOwner": "হাসপাতাল মালিক/প্রতিষ্ঠান", "contact.tOwner": "আপনার প্রতিষ্ঠানের অফিশিয়াল মূল্য তালিকা যুক্ত/সংশোধন করতেে ইমেইল করুন।", "contact.tOwnerSubject": "বিষয়: \"মূল্য তথ্য আপডেট\"",
      "contact.hEmergency": "জরুরি", "contact.tEmergPre": "জরুরি প্রয়োজনে এই প্ল্যাটফর্ম নয় — সরাসরি ", "contact.tNumber": "৯৯৯", "contact.tEmergMid": " কল করুন বা ", "contact.tEmergLink": "জরুরি তথ্য", "contact.tEmergPost": " দেখুন।",
      "contact.devS": "উন্নয়ন সংস্করণ:", "contact.devT": "প্রতিষ্ঠান-প্রকৃত যোগাযোগ চ্যানেল যুক্ত হলে এখানে আলাদা করে ঘোষণা করা হবে। এই ইমেইল এখনো প্লেসহোল্ডার।",
      "cmp.doc_title": "মূল্য তুলনা করুন | DoctorBill", "calc.doc_title": "খরচ ক্যালকুলেটর | DoctorBill",
      "hospitals.doc_title": "হাসপাতালসমূহ | DoctorBill", "bill.doc_title": "বিল জমা দিন | DoctorBill",
      "emerg.doc_title": "জরুরি তথ্য | DoctorBill", "guide.doc_title": "খরচ সাশ্রয়ের গাইড ও FAQ | DoctorBill",
      "track.doc_title": "বিল ট্র্যাকার | DoctorBill", "contact.doc_title": "যোগাযোগ | DoctorBill",
      "home.doc_title": "হাসপাতালের খরচ জানুন ও তুলনা করুন | DoctorBill বাংলাদেশ",
      "hosp.doc_title": "হাসপাতালের বিস্তারিত | DoctorBill",
    },
    en: {
      "nav.home": "Home", "nav.compare": "Compare", "nav.compare_long": "Compare Prices",
      "nav.hospitals": "Hospitals", "nav.emergency": "Emergency", "nav.more": "More",
      "nav.calculator": "Cost Calculator", "nav.submit": "Submit a Bill",
      "action.search": "Search", "action.details": "View details",
      "action.compare_price": "Compare prices", "action.directions": "Directions",
      "action.submit_bill": "Submit a bill", "action.compare_other": "Compare other hospitals",
      "badge.sample": "Sample data", "badge.sample_title": "This is sample/demo information",
      "badge.unverified": "Verification pending", "label.price_na": "Price not available",
      "label.services_price": "services priced", "label.no_data_yet": "Price data not added yet",
      "search.placeholder": "Search tests, treatments or hospitals",
      "search.aria": "Search services or hospitals",
      "search.recent": "Recent searches", "search.clear": "Clear",
      "theme.dark_on": "Enable dark mode", "theme.light_on": "Enable light mode",
      "theme.dark": "Dark mode", "theme.light": "Light mode", "lang.switch": "Change language",
      "more.title": "More", "more.calculator": "Cost Calculator", "more.submit": "Submit a Bill",
      "more.compare": "Compare Prices", "more.emergency": "Emergency Info",
      "more.guide": "Savings Guide", "more.tracker": "Bill Tracker",
      "more.admin_note": "The admin panel is for authorized users only.",
      "more.close": "Close",
      "banner.sample": "Development version — all information is sample data, no verified real prices.",
      "nav.main_label": "Main navigation", "nav.mobile": "Mobile menu",
      "brand.home": "DoctorBill home", "brand.logo": "DoctorBill logo",
      "footer.tagline": "Know hospital costs, decide with clarity. Get an indicative cost from listed prices — not a final bill.",
      "footer.platform": "Platform", "footer.support": "Support", "footer.legal": "Legal",
      "footer.how": "How it works", "footer.trust": "Transparency", "footer.emergency": "Emergency Info",
      "footer.guide": "Savings Guide", "footer.tracker": "Bill Tracker",
      "footer.report": "Report wrong info", "footer.contact": "Contact",
      "footer.privacy": "Privacy Policy", "footer.terms": "Terms", "footer.disclaimer": "Price Disclaimer",
      "fav.add": "Add to favorites", "fav.remove": "Remove from favorites",
      "fav.added": "Added to favorites", "fav.removed": "Removed from favorites",
      "near.me": "📍 Near me", "near.on": "✓ Nearby on (turn off)", "near.searching": "Finding location…",
      "near.denied": "Location permission denied — try choosing a city.",
      "near.live": "🟢 Live: Near me", "near.live.status": "Live tracking on — the list and distances update as you move.", "near.accunit": "m", "near.straight": "Straight-line distance",
      "map.loading": "Loading map…", "map.failed": "Could not load the map (internet connection required).",
      "map.you": "You are here", "map.approx": "Approximate location", "map.sample": "Sample info", "map.distance": "Distance",
      "unit.km": "km",
      "page.home.h1": "Know hospital costs, decide with clarity",
      "page.compare.h1": "Compare Prices", "page.hospitals.h1": "Hospitals",
      "page.calculator.h1": "Cost Calculator", "page.submit.h1": "Submit a Bill",
      "page.hospitals.sub": "Filter by city or area. View as a map or a list.",
      "hospitals.near": "📍 Near me", "hospitals.favonly": "★ Favorites only",
      "hospitals.showall": "★ Show all", "hospitals.city": "City", "hospitals.area": "Area",
      "hospitals.allcity": "All cities", "hospitals.allarea": "All areas",
      "hospitals.near.status": "Nearest hospitals sorted by distance (approximate).",
      "hospitals.empty.none": "No hospitals with price data match this filter. Green pins on the map are known hospitals (approximate locations).",
      "hospitals.empty.fav": "No hospitals in your favorites yet. Tap the ★ star on a card to add it.",
      "common.skip": "Skip to main content",
      "hospitals.skip": "Skip to main content", "emerg.skip": "Skip to main content",
      "hosp.skip": "Skip to main content", "bill.skip": "Skip to main content",      "home.hero.sub": "Find the likely cost of the tests and treatments you need, and compare prices across hospitals.",
      "home.cta.compare": "Compare hospitals", "home.cta.calc": "Estimate a cost",
      "home.popular.h2": "Popular services",
      "home.popular.sub": "The most-searched tests and treatments. Prices come from users' real submitted bills.",
      "home.popular.all": "See all services",
      "home.nearby.h2": "Hospitals near you",
      "home.nearby.sub": "Pick an area or view them on the map.",
      "home.nearby.citylabel": "Area/City:",
      "home.nearby.empty": "No price data added for this city yet. Green pins on the map are known hospitals in this city (approximate locations).",
      "home.nearby.status": "Showing the nearest hospitals from your location (distances are approximate).",
      "home.how.h2": "How it works",
      "home.how.s1.t": "Find a service", "home.how.s1.d": "Search by test, treatment or hospital name.",
      "home.how.s2.t": "Compare hospital costs", "home.how.s2.d": "See listed prices for the same service side by side, along with what's included.",
      "home.how.s3.t": "Decide with verified info", "home.how.s3.d": "Decide based on the price source, update date and verification status.",
      "home.trust.h2": "Transparency & trust",
      "home.trust.sub": "We're clear about where prices come from and how they're verified.",
      "home.trust.c1.t": "Where prices come from", "home.trust.c1.d": "Prices come from hospital-provided info, user-submitted bills and public listings. Each price shows its source and status.",
      "home.trust.c2.t": "Bill submission & verification", "home.trust.c2.d": "Users can submit bills. Submitting does not make a price \"verified\" — it's marked verified only after the defined review process completes.",
      "home.trust.c3.t": "Why prices differ", "home.trust.c3.d": "The same service can cost differently across hospitals due to patient condition, doctor, package, cabin and add-on services.",
      "home.trust.c4.t": "Report wrong info", "home.trust.c4.d": "If a price looks wrong or outdated, use \"Report wrong price\" from the hospital page.",
      "home.trust.disclaimer": "Price disclaimer: Prices shown here are indicative, based on listed information. A final bill may add consultation fees, tax, registration, consumables, cabin and other charges. This is not medical advice.",
      "cmp.skip": "Skip to main content", "cmp.h1": "Compare prices", "cmp.sub": "Pick a service to see listed prices from different hospitals side by side.",
      "cmp.filters": "Filters", "cmp.reset": "Reset", "cmp.city": "City", "cmp.hos_type": "Hospital type", "cmp.price_status": "Price status",
      "cmp.opt_all": "All", "cmp.opt_hospital": "Hospital-provided data", "cmp.opt_user": "User-provided data", "cmp.opt_unverified": "Price not yet verified",
      "cmp.min_price": "Min price (৳)", "cmp.max_price": "Max price (৳)", "cmp.ph_min": "e.g. 500", "cmp.ph_max": "e.g. 5000",
      "cmp.sort": "Sort", "cmp.sort_asc": "Price: low to high", "cmp.sort_desc": "Price: high to low", "cmp.sort_updated": "Recently updated",
      "cmp.selected_count": "hospitals selected", "cmp.clear": "Clear", "cmp.show_compare": "Compare", "cmp.modal_title": "Compare prices",
      "calc.skip": "Skip to main content", "calc.h1": "Cost calculator", "calc.sub": "Pick services step by step to estimate the likely cost. Prices come from users' actual bills.",
      "hosp.pm_title": "Price details",
      "bill.submit_title": "Submit a bill", "bill.submit_sub": "Submit your hospital bill or receipt details to help verify and research prices.",
      "bill.privacy_strong": "Privacy:", "bill.privacy_body": "Don't upload unnecessary personal information. Patient name, phone number, patient ID, address and payment details are removed/redacted before publication.",
      "bill.label_hospital": "Hospital name", "bill.choose_opt": "Choose…", "bill.err_hospital": "Please choose a hospital.",
      "bill.label_service": "Service or test name", "bill.err_service": "Please choose a service.", "bill.label_amount": "Bill amount (৳)",
      "bill.ph_amount": "e.g. 700", "bill.err_amount": "Please enter a valid amount.", "bill.label_date": "Bill date", "bill.err_date": "Please enter a date.",
      "bill.label_details": "Additional details (optional)", "bill.ph_details": "Package, cabin, what was included, etc.",
      "bill.label_file": "Photo or PDF of receipt/bill", "bill.file_hint": "Accepted: PNG, JPG, WEBP, PDF · max 5 MB. The file is kept private and is never published on a public link.",
      "bill.err_file": "Please provide an accepted file (PNG/JPG/WEBP/PDF, ≤5 MB).", "bill.label_contact": "Contact (only for verification, optional)",
      "bill.ph_contact": "Phone or email", "bill.hint_contact": "Will not be shown publicly.",
      "bill.use_strong": "Why & how it's used:", "bill.use_body": "Bills are collected for price research and verification. Only authorized reviewers can see the original document. After verification, personal details are removed and the price may be used anonymously in price comparisons. You can request correction or deletion at any time.",
      "bill.consent": "I agree to the terms above and understand that the submitted information may be used anonymously in price comparisons.", "bill.err_consent": "Please give consent to submit.",
      "bill.submit_btn": "Submit a bill", "bill.review_note": "Submitting does not make a price \"verified\" — that only happens after the defined review process completes.",
      "bill.lookup_title": "Check the status of a submitted bill", "bill.lookup_hint": "Check status by entering the reference ID you received when submitting — e.g.", "bill.lookup_period": ".",
      "bill.label_ref": "Reference ID", "bill.lookup_btn": "Check status",
      "emerg.title": "Emergency info & numbers", "emerg.call_service": "Emergency services (police/ambulance/fire)", "emerg.number": "999",
      "emerg.call_sub": "Bangladesh's national emergency number", "emerg.call_now": "Call now",
      "emerg.warn_strong": "Important:", "emerg.warn_body": "This platform is not a substitute for emergency medical care. If life is at risk, call 999 immediately or go to the emergency department of the nearest hospital.",
      "emerg.by_area": "Hospitals by area", "emerg.by_area_sub": "Choose a city/area. See address and directions. (The list comes from real OpenStreetMap data.)",
      "emerg.label_city": "City", "emerg.label_area": "Area", "emerg.all_areas": "All areas",
      "guide.skip": "Go to main content", "guide.title": "Cost-saving guide",
      "guide.sub": "A big share of medical and diagnostic costs in Bangladesh is simply not knowing — the same test or service can cost very differently from one facility to another. Following the simple steps below can help you avoid a lot of unnecessary cost. ",
      "guide.subWarn": "This is general advice — your doctor's instructions come first.",
      "guide.t1": "1. Check prices at several facilities before getting a test",
      "guide.c1pre": "Prices for the same blood test, USG or MRI can vary widely between facilities. Before you get a test, ", "guide.c1link": "search and compare services on DoctorBill", "guide.c1post": ", and double-check the price at the hospital counter when you go.",
      "guide.t2": "2. Ask whether a \"package\" is available for surgery/delivery",
      "guide.c2p": "Many hospitals offer packages for surgery or delivery — booking tests, room and operation separately can push the bill up. Before admission, find out in writing what the package includes and what it does not (medicines, cabin, extra tests).",
      "guide.t3": "3. Get a detailed bill and keep every receipt",
      "guide.c3pre": "Ask for an \"itemized bill\" — it makes clear exactly what you are being charged for. Keep each day's receipts; ", "guide.c3link": "bill tracker", "guide.c3post": " helps you keep the total in view. As soon as a charge you don't recognize appears, ask the responsible staff person.",
      "guide.t4": "4. You can save on medicines",
      "guide.c4pre": "Ask your doctor or pharmacist for the generic name of each prescribed medicine; the same drug is often much cheaper depending on the brand. For long-term medicines, compare prices at 2–3 pharmacies. ", "guide.c4warn": "Never change any medicine on your own — change only on a doctor's advice.",
      "guide.t5": "5. Keep old prescriptions and reports in one place",
      "guide.c5p": "Taking earlier reports with you matters — specialists often decide on medicines or procedures from old reports; re-running every test can drive costs up.",
      "guide.t6": "6. Get a second opinion before major surgery",
      "guide.c6p": "Before a major surgery or high-cost procedure, get another experienced doctor's opinion. In many cases this makes the surgery possible at lower risk or cost, and sometimes no major procedure is needed at all.",
      "guide.wnS": "Remember:", "guide.wnT": "savings should only come from knowing and comparing; do not try to save money by skipping anything your doctor calls essential.",
      "guide.faqh": "Frequently asked questions (FAQ)", "guide.qlabel": "Q:",
      "guide.q1": "Is the price shown by DoctorBill the final bill?", "guide.a1": "No. The displayed price is only an estimate based on listed data. Consultation fees, cabin, medicines and additional services may be added to the final bill.",
      "guide.q2": "How are prices verified?", "guide.a2pre": "Each record shows where its data came from (hospital-provided / user-provided) and the \"last updated\" date. A record is called \"verified\" only after the scheduled review is done. If you see wrong data, ", "guide.a2link": "report it", "guide.a2post": ".",
      "guide.q3": "How do I protect privacy when submitting a bill?", "guide.a3": "Before sharing a receipt, black out the patient's name, phone, bed number, patient ID and payment details. The file is seen only by an approved reviewer; it is never published on a public link.",
      "guide.q4": "In an emergency there is no time to check prices, right?", "guide.a4pre": "In an emergency, the first job is to start treatment — never delay care to check prices. Public hospitals' emergency departments provide initial treatment; see ", "guide.a4link": "emergency info", "guide.a4post": ". Price comparison is meant for planned care.",
      "guide.q5": "I want to estimate the total cost in advance — how?", "guide.a5link": "cost calculator", "guide.a5": " Pick a hospital and service to see a range-based estimated total; cabin/medicine costs can be added, and the same service's price at other hospitals is shown side by side. Results can be saved or sent via WhatsApp.",
      "guide.note": "This page gives general advice only — it is not medical or legal advice.",
      "track.skip": "Go to main content", "track.title": "Bill tracker — your expense log",
      "track.sub": "Log your treatment, test and medicine costs. Check the total and reconcile it against the bill. All data stays ", "track.subDevice": "on your device", "track.subPost": " (localStorage) — it is never sent anywhere or published.",
      "track.date": "Date", "track.errDate": "Enter a date.", "track.amount": "Amount (৳)", "track.errAmount": "Enter a valid amount.", "track.phAmount": "e.g. 500",
      "track.place": "Hospital / diagnostic centre (optional)", "track.phPlace": "e.g. district hospital", "track.item": "What the expense was (optional)", "track.phItem": "e.g. CBC, consultation, medicines",
      "track.add": "Add expense", "track.listTitle": "Your expenses", "track.print": "Print", "track.clear": "Clear all",
      "track.notice": "Tracker data is stored only in your browser. Clearing browser data deletes it — print a copy if it matters.",
      "contact.skip": "Go to main content", "contact.title": "Contact", "contact.sub": "Get in touch to report wrong prices, add hospital information, or share suggestions.",
      "contact.hEmail": "Email", "contact.tGeneric": "General contact:", "contact.hReport": "Report a wrong price",
      "contact.tReportPre": "Use \"Report wrong price\" on any hospital page, or ", "contact.tSubmitLink": "submit a bill", "contact.tReportPost": " to help verify true prices.",
      "contact.hOwner": "Hospital owners / institutions", "contact.tOwner": "Email us to add or correct your institution's official price list.", "contact.tOwnerSubject": "Subject: \"Price info update\"",
      "contact.hEmergency": "Emergency", "contact.tEmergPre": "For emergencies this platform is not the place — call ", "contact.tNumber": "999", "contact.tEmergMid": " directly, or see ", "contact.tEmergLink": "emergency info", "contact.tEmergPost": ".",
      "contact.devS": "Development version:", "contact.devT": "Dedicated institution contact channels will be announced here once added. This email is still a placeholder.",
      "cmp.doc_title": "Compare Prices | DoctorBill", "calc.doc_title": "Cost Calculator | DoctorBill",
      "hospitals.doc_title": "Hospitals | DoctorBill", "bill.doc_title": "Submit a Bill | DoctorBill",
      "emerg.doc_title": "Emergency Info | DoctorBill", "guide.doc_title": "Savings Guide & FAQ | DoctorBill",
      "track.doc_title": "Bill Tracker | DoctorBill", "contact.doc_title": "Contact | DoctorBill",
      "home.doc_title": "Know hospital costs & compare | DoctorBill Bangladesh",
      "hosp.doc_title": "Hospital details | DoctorBill",
    },
  };
  function getLang() { const l = safeGet(LANG_KEY); return (l === "en" || l === "bn") ? l : "bn"; }
  function t(key) { const d = I18N[getLang()]; return (d && d[key]) || I18N.bn[key] || key; }
  function isEn() { return getLang() === "en"; }
  function setLang(l) { safeSet(LANG_KEY, l); }
  // English labels for the canonical Bengali district names stored in DB.cities.
  const CITY_EN = {
    "ঢাকা": "Dhaka", "গাজীপুর": "Gazipur", "নারায়ণগঞ্জ": "Narayanganj", "নরসিংদী": "Narsingdi",
    "মুন্সিগঞ্জ": "Munshiganj", "রাজবাড়ী": "Rajbari", "ফরিদপুর": "Faridpur", "গোপালগঞ্জ": "Gopalganj",
    "শরীয়তপুর": "Shariatpur", "মাদারীপুর": "Madaripur", "মানিকগঞ্জ": "Manikganj", "টাঙ্গাইল": "Tangail",
    "কিশোরগঞ্জ": "Kishoreganj", "ময়মনসিংহ": "Mymensingh", "জামালপুর": "Jamalpur", "শেরপুর": "Sherpur",
    "নেত্রকোণা": "Netrokona", "চট্টগ্রাম": "Chattogram", "কক্সবাজার": "Cox's Bazar", "বান্দরবান": "Bandarban",
    "রাঙ্গামাটি": "Rangamati", "খাগড়াছড়ি": "Khagrachhari", "ফেনী": "Feni", "নোয়াখালী": "Noakhali",
    "লক্ষ্মীপুর": "Lakshmipur", "কুমিল্লা": "Cumilla", "চাঁদপুর": "Chandpur", "ব্রাহ্মণবাড়িয়া": "Brahmanbaria",
    "সিলেট": "Sylhet", "মৌলভীবাজার": "Moulvibazar", "হবিগঞ্জ": "Habiganj", "সুনামগঞ্জ": "Sunamganj",
    "রাজশাহী": "Rajshahi", "চাঁপাইনবাবগঞ্জ": "Chapai Nawabganj", "নওগাঁ": "Naogaon", "জয়পুরহাট": "Joypurhat",
    "বগুড়া": "Bogura", "সিরাজগঞ্জ": "Sirajganj", "পাবনা": "Pabna", "নাটোর": "Natore",
    "রংপুর": "Rangpur", "দিনাজপুর": "Dinajpur", "ঠাকুরগাঁও": "Thakurgaon", "পঞ্চগড়": "Panchagarh",
    "নীলফামারী": "Nilphamari", "লালমনিরহাট": "Lalmonirhat", "কুড়িগ্রাম": "Kurigram", "গাইবান্ধা": "Gaibandha",
    "খুলনা": "Khulna", "বাগেরহাট": "Bagerhat", "সাতক্ষীরা": "Satkhira", "যশোর": "Jashore",
    "ঝিনাইদহ": "Jhenaidah", "মাগুরা": "Magura", "নড়াইল": "Narail", "কুষ্টিয়া": "Kushtia",
    "চুয়াডাঙ্গা": "Chuadanga", "মেহেরপুর": "Meherpur", "বরিশাল": "Barishal", "বরগুনা": "Borguna",
    "পটুয়াখালী": "Patuakhali", "ভোলা": "Bhola", "পিরোজপুর": "Pirojpur", "ঝালকাঠি": "Jhalokati",
  };
  // Canonical value stays Bengali (DB/filters); only the visible label is localized.
  function cityName(c) { return isEn() && CITY_EN[c] ? CITY_EN[c] : c; }
  // Service unit label (গ congregation of short unit strings in data.js).
  const UNIT_EN = { "প্রতি টেস্ট": "per test", "প্রতি স্ক্যান": "per scan", "প্রতি ভিজিট": "per visit", "প্রতি সেশন": "per session", "প্যাকেজ": "package" };
  function unitName(u) { return isEn() && UNIT_EN[u] ? UNIT_EN[u] : u; }
  // Hospital-type labels (data.js hospitalTypes + OSM-derived types).
  const TYPE_EN = {
    "বেসরকারি": "Private", "মেডিকেল কলেজ": "Medical college", "ডায়াগনস্টিক": "Diagnostic centre",
    "বিশেষায়িত": "Specialized", "হাসপাতাল": "Hospital", "ক্লিনিক": "Clinic", "নার্সিং হোম": "Nursing home",
    "সরকারি": "Government", "সরকারি (রেট কার্ড)": "Government (rate card)",
  };
  function typeName(z) { return isEn() && TYPE_EN[z] ? TYPE_EN[z] : z; }
  // expose
  function syncLangToggle() {
    document.documentElement.setAttribute("lang", getLang());
    document.querySelectorAll("[data-lang-toggle]").forEach((b) => {
      const en = isEn();
      b.setAttribute("aria-label", t("lang.switch"));
      b.title = en ? "বাংলা" : "English";
      const tag = b.querySelector(".lang-tag");
      if (tag) tag.textContent = en ? "বাং" : "EN";
    });
  }
  // Translate static HTML nodes annotated with data-i18n / data-i18n-attr.
  function translateDom(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    (root || document).querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    (root || document).querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
  }
  function toggleLang() {
    const next = isEn() ? "bn" : "en";
    setLang(next);
    location.reload();
  }
  syncLangToggle();

  /* ---------- Status badge (sample data no longer exists; badge removed) ---------- */
  function statusBadge(rec) {
    const s = Fmt.status(rec && rec.verification_status);
    return '<span class="badge ' + s.cls + '"><span class="dot"></span>' + h(isEn() ? s.label_en : s.label_bn) + "</span>";
  }
  function sampleBadge() {
    // No sample records exist anywhere, so this is always empty — kept as a
    // defensive no-op for call sites only.
    return "";
  }

  /* ---------- Price display ---------- */
  function priceText(rec) {
    const p = Fmt.price(rec, isEn() ? "en" : "bn");
    if (!p) return '<span class="price-na">' + h(t("label.price_na")) + "</span>";
    return '<span class="price">' + p + "</span>";
  }

  /* ---------- Header ---------- */
  function renderHeader(activeKey) {
    const el = document.getElementById("site-header");
    if (!el) return;
    el.className = "site-header";
    el.innerHTML =
      '<div class="container header-inner">' +
        '<a class="brand" href="index.html" aria-label="' + h(t("brand.home")) + '">' +
          '<img src="assets/img/logo.svg" alt="' + h(t("brand.logo")) + '">' +
        "</a>" +
        '<nav class="pill-nav" aria-label="' + h(t("nav.main_label")) + '"><ul>' +
          DESKTOP_NAV.map((n) =>
            '<li><a href="' + n.href + '"' + (n.key === activeKey ? ' aria-current="page"' : "") + ">" + h(t(n.i18n)) + "</a></li>"
          ).join("") +
        "</ul></nav>" +
        '<div class="header-actions">' +
          '<button class="icon-btn" type="button" data-font-toggle aria-label="টেক্সট সাইজ বাড়ান-কমান"><span class="font-tag">A</span></button>' +
          '<button class="icon-btn" type="button" data-lang-toggle aria-label="' + h(t("lang.switch")) + '" title="English"><span class="lang-tag">EN</span></button>' +
          '<button class="icon-btn" type="button" data-theme-toggle aria-label="ডার্ক মোড চালু করুন"></button>' +
          '<button class="icon-btn" type="button" data-header-search aria-label="' + h(t("action.search")) + '">' + ICONS.search + "</button>" +
        "</div>" +
      "</div>";
    const btn = el.querySelector("[data-header-search]");
    if (btn) btn.addEventListener("click", () => {
      const box = document.querySelector("[data-searchbox]");
      if (box) { box.scrollIntoView({ behavior: "smooth", block: "center" }); const i = box.querySelector("input"); if (i) i.focus(); }
      else location.href = "compare.html";
    });
    const tbtn = el.querySelector("[data-theme-toggle]");
    if (tbtn) tbtn.addEventListener("click", () => toggleTheme());
    const lbtn = el.querySelector("[data-lang-toggle]");
    if (lbtn) lbtn.addEventListener("click", () => toggleLang());
    // Text size (accessibility — cycle: normal → বড় → সবচেয়ে বড় → normal)
    const fbtn = el.querySelector("[data-font-toggle]");
    if (fbtn) fbtn.addEventListener("click", () => cycleFont());
    applyFont();
    applyTheme(getTheme());
    syncLangToggle();
  }

  /* ---------- Bottom nav (mobile) ---------- */
  function renderBottomNav(activeKey) {
    let el = document.getElementById("bottom-nav");
    if (!el) { el = document.createElement("nav"); el.id = "bottom-nav"; document.body.appendChild(el); }
    el.className = "bottom-nav";
    el.setAttribute("aria-label", t("nav.mobile"));
    el.innerHTML = "<ul>" + NAV.map((n) =>
      '<li style="flex:1"><a href="' + (n.href === "#more" ? "#" : n.href) + '"' +
      (n.key === activeKey ? ' aria-current="page"' : "") + ' data-nav="' + n.key + '">' +
      ICONS[n.key] + "<span>" + h(t(n.i18n)) + "</span></a></li>"
    ).join("") + "</ul>";
    el.querySelector('[data-nav="more"]').addEventListener("click", (e) => { e.preventDefault(); openMore(); });
  }

  function openMore() {
    const items = [
      { i18n: "more.calculator", href: "calculator.html" },
      { i18n: "more.submit", href: "submit-bill.html" },
      { i18n: "more.compare", href: "compare.html" },
      { i18n: "more.guide", href: "guide.html" },
      { i18n: "more.tracker", href: "tracker.html" },
      { i18n: "more.emergency", href: "emergency.html" },
    ];
    const back = document.createElement("div");
    back.className = "modal-backdrop open";
    back.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + h(t("more.title")) + '">' +
      '<div class="modal-head"><h3 class="mb-0">' + h(t("more.title")) + '</h3><button class="icon-btn" type="button" aria-label="' + h(t("more.close")) + '" data-close>✕</button></div>' +
      '<div class="stack mt-3">' + items.map((i) => '<a class="btn secondary block" href="' + i.href + '">' + h(t(i.i18n)) + "</a>").join("") + "</div>" +
      '<p class="small muted mt-3 center">' + h(t("more.admin_note")) + "</p>" +
      "</div>";
    document.body.appendChild(back);
    back.addEventListener("click", (e) => { if (e.target === back || e.target.closest("[data-close]")) closeModal(back); });
    openModal(back);
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    el.className = "site-footer";
    el.innerHTML =
      '<div class="container footer-grid">' +
        '<div class="footer-brand">' +
          '<img src="assets/img/logo-footer.svg" alt="DoctorBill">' +
          '<p class="small">' + h(t("footer.tagline")) + "</p>" +
        "</div>" +
        "<div><h4>" + h(t("footer.platform")) + "</h4><ul>" +
          '<li><a href="index.html#how">' + h(t("footer.how")) + "</a></li>" +
          '<li><a href="index.html#trust">' + h(t("footer.trust")) + "</a></li>" +
          '<li><a href="submit-bill.html">' + h(t("more.submit")) + "</a></li>" +
        "</ul></div>" +
        "<div><h4>" + h(t("footer.support")) + "</h4><ul>" +
          '<li><a href="emergency.html">' + h(t("footer.emergency")) + "</a></li>" +
          '<li><a href="guide.html">' + h(t("footer.guide")) + "</a></li>" +
          '<li><a href="tracker.html">' + h(t("footer.tracker")) + "</a></li>" +
          '<li><a href="index.html#report">' + h(t("footer.report")) + "</a></li>" +
          '<li><a href="contact.html">' + h(t("footer.contact")) + "</a></li>" +
        "</ul></div>" +
        "<div><h4>" + h(t("footer.legal")) + "</h4><ul>" +
          '<li><a href="privacy.html">' + h(t("footer.privacy")) + "</a></li>" +
          '<li><a href="terms.html">' + h(t("footer.terms")) + "</a></li>" +
          '<li><a href="index.html#disclaimer">' + h(t("footer.disclaimer")) + "</a></li>" +
        "</ul></div>" +
      "</div>" +
      '<div class="container footer-bottom">© ' + Fmt.bn(new Date().getFullYear()) + ' DoctorBill — ' + (isEn() ? "not medical advice." : "এটি কোনো চিকিৎসা পরামর্শ নয়।") + "</div>";
  }

  /* ---------- Accessible modal helpers (focus trap + Escape + scroll lock) ---------- */
  function modalFocusables(back) {
    const modal = back.querySelector(".modal");
    if (!modal) return [];
    return [...modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((el) => el.offsetParent !== null);
  }
  function openModal(back) {
    back.classList.add("open");
    back._lastFocus = document.activeElement;
    if (!back._modBound) {
      back._modBound = true;
      back.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { e.stopPropagation(); closeModal(back); return; }
        if (e.key !== "Tab") return;
        const f = modalFocusables(back);
        if (!f.length) return;
        const firstF = f[0], lastF = f[f.length - 1];
        if (e.shiftKey && document.activeElement === firstF) { e.preventDefault(); lastF.focus(); }
        else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); firstF.focus(); }
      });
    }
    const f = modalFocusables(back);
    if (f.length) f[0].focus();
  }
  function closeModal(back) {
    back.classList.remove("open");
    const last = back._lastFocus;
    if (last && typeof last.focus === "function") { try { last.focus(); } catch (e) {} }
  }

  /* ---------- Toast ---------- */
  let toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------- Search box with suggestions ---------- */
  // opts: { onSelect(serviceSlug|hospitalSlug), placeholder }
  let SUGG_SEQ = 0, OPT_SEQ = 0;
  function searchBox(opts) {
    opts = opts || {};
    const placeholder = opts.placeholder || t("search.placeholder");
    const sgId = "sg-" + (++SUGG_SEQ);
    const wrap = document.createElement("div");
    wrap.className = "search";
    wrap.setAttribute("data-searchbox", "");
    wrap.innerHTML =
      '<span aria-hidden="true" style="color:var(--brand-600);display:flex">' + ICONS.search + "</span>" +
      '<input type="search" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="' + sgId + '" ' +
        'aria-label="' + h(t("search.aria")) + '" placeholder="' + h(placeholder) + '">' +
      '<button class="btn sm" type="button" data-go>' + h(t("action.search")) + "</button>" +
      '<div class="suggest" id="' + sgId + '" role="listbox"></div>';
    const input = wrap.querySelector("input");
    const list = wrap.querySelector(".suggest");
    const en = isEn();

    function normalize(s) { return String(s || "").toLowerCase().trim(); }
    // Precomputed lowercase index (built once per search box) — no re-scanning per keystroke.
    const INDEX = (function () {
      const out = [];
      DB.services.forEach((s) => out.push({
        type: "service", value: s.slug, label: en ? s.name_en : s.name_bn, sub: en ? s.name_bn : s.name_en,
        hay: [s.name_bn, s.name_en, s.slug].concat(s.synonyms || []).map(normalize)
      }));
      DB.hospitals.forEach((hp) => out.push({
        type: "hospital", value: hp.slug, label: en ? hp.name_en : hp.name_bn, sub: hp.area + ", " + hp.city,
        hay: [hp.name_bn, hp.name_en, hp.area, hp.city].map(normalize)
      }));
      // Directory hospitals: real names, search hints only (no price data yet).
      (DB.directory || []).forEach((hp) => out.push({
        type: "hospital", value: hp.slug, label: en ? hp.name_en : hp.name_bn, sub: (hp.area ? hp.area + ", " : "") + hp.city,
        hay: [hp.name_bn, hp.name_en, hp.area, hp.city].map(normalize)
      }));
      return out;
    })();
    function matches(term) {
      const q = normalize(term);
      if (!q) return [];
      const out = [];
      for (let i = 0; i < INDEX.length && out.length < 12; i++) {
        if (INDEX[i].hay.some((x) => x.includes(q))) {
          out.push({ type: INDEX[i].type, label: INDEX[i].label, sub: INDEX[i].sub, value: INDEX[i].value });
        }
      }
      return out;
    }
    function render(term) {
      const m = matches(term);
      input.removeAttribute("aria-activedescendant");
      if (!m.length) { list.classList.remove("open"); input.setAttribute("aria-expanded", "false"); return; }
      list.innerHTML = m.map((x) =>
        '<button type="button" role="option" id="' + sgId + '-opt-' + (++OPT_SEQ) + '" aria-selected="false" data-value="' + h(x.value) + '" data-type="' + x.type + '" data-label="' + h(x.label) + '">' +
          "<span>" + h(x.label) + "</span>" +
          '<span class="s-en">' + h(x.sub) + "</span></button>"
      ).join("");
      list.classList.add("open");
      input.setAttribute("aria-expanded", "true");
    }
    // Arrow-key navigation over the suggestion listbox (combobox pattern).
    function moveActive(dir) {
      const optEls = [...list.querySelectorAll('button[role="option"]')];
      if (!optEls.length) return;
      let i = optEls.findIndex((b) => b.getAttribute("aria-selected") === "true");
      i = i === -1 ? (dir > 0 ? 0 : optEls.length - 1) : (i + dir + optEls.length) % optEls.length;
      optEls.forEach((b) => { b.setAttribute("aria-selected", "false"); b.classList.remove("active"); });
      optEls[i].setAttribute("aria-selected", "true");
      optEls[i].classList.add("active");
      input.setAttribute("aria-activedescendant", optEls[i].id);
    }
    // Show recent-search chips when the box is focused with no query.
    function renderRecent() {
      input.removeAttribute("aria-activedescendant");
      const rec = getRecent();
      if (!rec.length) { list.classList.remove("open"); input.setAttribute("aria-expanded", "false"); return; }
      list.innerHTML =
        '<div class="recent-head"><span>' + h(t("search.recent")) + "</span>" +
          '<button type="button" class="link-btn" data-clear-recent>' + h(t("search.clear")) + "</button></div>" +
        '<div class="recent-chips">' + rec.map((r) =>
          '<button type="button" class="chip" data-value="' + h(r.value) + '" data-type="' + h(r.type) + '" data-label="' + h(r.label) + '">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
            h(r.label) + "</button>"
        ).join("") + "</div>";
      list.classList.add("open");
      input.setAttribute("aria-expanded", "true");
    }
    function choose(value, type, label) {
      list.classList.remove("open"); input.setAttribute("aria-expanded", "false");
      pushRecent(label || value, value, type);
      if (opts.onSelect) opts.onSelect(value, type);
      else if (type === "query") location.href = "compare.html?q=" + encodeURIComponent(value);
      else if (type === "hospital") location.href = "hospital.html?slug=" + encodeURIComponent(value);
      else location.href = "compare.html?service=" + encodeURIComponent(value);
    }
    // Debounce input events: the index scan rebuilds the whole list per keystroke.
    let debTimer;
    input.addEventListener("input", () => { clearTimeout(debTimer); debTimer = setTimeout(() => render(input.value), 180); });
    input.addEventListener("focus", () => { if (input.value) render(input.value); else renderRecent(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const active = list.querySelector('button[role="option"][aria-selected="true"]');
        (active || list.querySelector("button[data-value]") || wrap.querySelector("[data-go]")).click();
      }
      else if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
      else if (e.key === "Escape") { list.classList.remove("open"); input.setAttribute("aria-expanded", "false"); }
    });
    list.addEventListener("click", (e) => {
      if (e.target.closest("[data-clear-recent]")) { clearRecent(); renderRecent(); return; }
      const b = e.target.closest("button[data-value]"); if (b) choose(b.dataset.value, b.dataset.type, b.dataset.label || b.textContent.trim());
    });
    wrap.querySelector("[data-go]").addEventListener("click", () => {
      const first = list.querySelector("button[data-value]");
      if (first) first.click();
      else if (input.value.trim()) { const q = input.value.trim(); pushRecent(q, q, "query"); location.href = "compare.html?q=" + encodeURIComponent(q); }
    });
    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) { list.classList.remove("open"); input.setAttribute("aria-expanded", "false"); } });
    return wrap;
  }

  /* ---------- Cards ---------- */
  function serviceCard(s) {
    const ps = DB.pricesForService(s.id);
    // Numeric low/high across all usable records for an accurate indicative range.
    let lo = Infinity, hi = -Infinity;
    ps.forEach((p) => {
      const min = p.price_amount != null ? p.price_amount : p.price_min;
      const max = p.price_amount != null ? p.price_amount : p.price_max;
      if (min != null) lo = Math.min(lo, min);
      if (max != null) hi = Math.max(hi, max);
    });
    const cat = DB.categoryById(s.category_id);
    const latest = ps.map((p) => p.last_checked_at).filter(Boolean).sort().pop();
    const en = isEn();
    let range = null;
    if (lo !== Infinity && hi !== -Infinity) {
      const T = en ? Fmt.takaEn : Fmt.taka;
      range = lo === hi ? T(lo) : T(lo) + " – " + T(hi);
    }
    return '<a class="card tight" href="compare.html?service=' + encodeURIComponent(s.slug) + '" style="text-decoration:none;color:inherit;display:block">' +
      '<div class="row between items-center"><span class="tag">' + h(en && cat && cat.name_en ? cat.name_en : (cat ? cat.name_bn : "")) + "</span>" + sampleBadge() + "</div>" +
      "<h3 class='mt-2' style='font-size:17px'>" + h(en ? s.name_en : s.name_bn) + "</h3>" +
      '<div class="small muted">' + h(en ? s.name_bn : s.name_en) + "</div>" +
      (range ? '<div class="price mt-2" style="font-size:20px">' + range + "</div>" : '<div class="price-na mt-2">' + h(t("label.price_na")) + "</div>") +
      '<div class="price-meta mt-2">' + (en ? String(ps.length) : Fmt.bn(ps.length)) + (en ? " hospitals priced · " : " টি হাসপাতালে মূল্য · ") +
        (latest ? Fmt.updatedShort(latest, en ? "en" : "bn") : (en ? "No update date" : "আপডেটের তারিখ নেই")) + "</div>" +
      "</a>";
  }

  function hospitalCard(hp, o) {
    o = o || {};
    const en = isEn();
    const initials = (hp.name_bn || "").replace(/\(নমুনা\)/g, "").trim().slice(0, 1);
    const ps = DB.pricesForHospital(hp.id).filter((p) => p.verification_status !== "unavailable");
    return '<div class="card tight">' +
      '<div class="hcard-head">' +
        '<div class="hcard-avatar" aria-hidden="true">' + h(initials) + "</div>" +
        '<div class="grow"><h3>' + h(en && hp.name_en ? hp.name_en : hp.name_bn) + "</h3>" +
          '<div class="kv">' + ICONS.pin + "<span>" + h(hp.area) + ", " + h(cityName(hp.city)) + " · " + h(typeName(hp.hospital_type)) + "</span></div>" +
        "</div>" +
        favBtn(hp.slug) +
      "</div>" +
      '<div class="badge-row">' + sampleBadge() +
        (o.showDistance && hp._distance != null
          ? (hp._road && typeof hp._road.km === "number"
              ? '<span class="tag" title="' + h(t("near.straight")) + ": " + fmtDist(hp._distance) + '">🛣 ' + fmtDist(hp._road.km) +
                (hp._road.min > 0 ? " · " + (en ? hp._road.min + " min" : Fmt.bn(hp._road.min) + " মিনিট") : "") + "</span>"
              : '<span class="tag">' + fmtDist(hp._distance) + "</span>")
          : "") +
        '<span class="tag">' + (en ? String(ps.length) : Fmt.bn(ps.length)) + " " + h(t("label.services_price")) + "</span>" +
      "</div>" +
      '<div class="row gap-8 mt-3">' +
        '<a class="btn sm secondary" href="hospital.html?slug=' + encodeURIComponent(hp.slug) + '">' + h(t("action.details")) + "</a>" +
        '<a class="btn sm ghost" href="compare.html?area=' + encodeURIComponent(hp.area) + '">' + h(t("action.compare_price")) + "</a>" +
        directionsLink(hp) +
      "</div>" +
    "</div>";
  }

  /* ---------- Live map (Leaflet + OpenStreetMap, no API key) ---------- */
  let leafletPromise = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
      const s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = () => resolve(window.L);
      s.onerror = () => reject(new Error("leaflet-load-failed"));
      document.head.appendChild(s);
    });
    return leafletPromise;
  }
  let mapSeq = 0;
  /* Registered live maps (hospitals page): persist across position updates. */
  const LIVE_MAPS = {};
  function miniMap(list, o) {
    o = o || {};
    const id = "dbmap-" + (++mapSeq);
    const pts = (list || []).filter((x) => typeof x.latitude === "number" && typeof x.longitude === "number");
    setTimeout(() => initMap(id, pts, o), 0);
    return '<div id="' + id + '" style="height:' + (o.height || 320) + 'px;border-radius:var(--r-lg);overflow:hidden;' +
      'border:1px solid var(--line);background:#e7f3ec;display:flex;align-items:center;justify-content:center">' +
      '<span class="small muted">' + h(t("map.loading")) + "</span></div>";
  }
  function initMap(id, pts, o) {
    const el = document.getElementById(id);
    if (!el) return;
    const fail = (err) => { el.innerHTML = '<span class="small muted">' + h(t("map.failed")) + (err && err.message ? " <small>[" + h(String(err.message)) + "]</small>" : "") + "</span>"; console.error("initMap:", err); };
    loadLeaflet().then((L) => {
      if (!el.isConnected) return;
      el.innerHTML = "";
      const map = L.map(id, { scrollWheelZoom: false });
      // Key-free basemap: OpenStreetMap standard. (CARTO now needs an API key;
      // HOT/Esri/OpenTopo were not reachable from user networks, so only this.)
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const pinLayer = L.layerGroup().addTo(map);
      // Render-timing guard: the container may not have laid out yet; a zero-size
      // map crashes the circle renderer's first draw. Invalidate up front.
      if (map.getSize().x < 2) map.invalidateSize();
      // Real-time map: register instance so position updates move the marker
      // in-place (no map rebuild) + a "Follow" control.
      const rec = (o.live ? (LIVE_MAPS[id] = { map: map, me: null, acc: null, follow: false }) : null);
      if (o.live) {
        const FollowCtl = L.Control.extend({
          options: { position: "topleft" },
          onAdd: () => {
            const wrap = L.DomUtil.create("div", "leaflet-bar");
            const b = L.DomUtil.create("a", "db-follow-btn", wrap);
            b.href = "#"; b.setAttribute("role", "button");
            b.textContent = isEn() ? "🎯 Follow me" : "🎯 Follow on";
            L.DomEvent.disableClickPropagation(wrap);
            L.DomEvent.on(b, "click", (ev) => {
              L.DomEvent.stop(ev);
              if (!rec || !rec.me) return;
              rec.follow = !rec.follow;
              b.classList.toggle("on", rec.follow);
              if (rec.follow) map.setView(rec.me.getLatLng(), Math.max(map.getZoom(), 15), { animate: true });
            });
            map.on("dragstart", () => { rec.follow = false; b.classList.remove("on"); });
            return wrap;
          },
        });
        map.addControl(new FollowCtl());
      }
      if (!pts.length) { map.setView([23.75, 90.38], 7); return; }
      const all = pts.slice();
      if (o.user && typeof o.user.latitude === "number") all.push(o.user);
      const nmOf = (p) => isEn() && p.name_en ? p.name_en : p.name_bn;
      function pinPopup(p) {
        const label = p.is_sample ? t("map.sample") : (p.coords_approx ? t("map.approx") : "");
        return "<strong>" + h(nmOf(p)) + "</strong><br><span class='small'>" + h(typeName(p.hospital_type || "")) +
          (p.city ? " · " + h(cityName(p.city)) : "") +
          (label ? "<br><em>" + h(label) + "</em>" : "") +
          (p._distance != null ? "<br><em>" + h(t("map.distance")) + ": " + fmtDist(p._distance) + "</em>" : "") + "</span>" +
          '<br><span class="row gap-8 items-center" style="margin-top:4px">' +
          (p.slug ? '<a href="hospital.html?slug=' + encodeURIComponent(p.slug) + '" style="font-size:12.5px">' + h(t("action.details")) + " →</a>" : "") +
          directionsLink(p) + "</span>";
      }
      function drawPin(p) {
        const marker = L.circleMarker([p.latitude, p.longitude], { radius: 8, color: "#0b7a55", weight: 2, fillColor: "#16b07a", fillOpacity: .85 })
          .bindPopup(pinPopup(p));
        if (p.is_sample) marker.setStyle({ color: "#7a4fb0", fillColor: "#c69bf0" });
        return marker;
      }
      // Grid clustering at lower zooms: pins across the country collapse into
      // numbered bubbles; clicking one zooms in. At zoom >= 10, draw every pin.
      const MAX_CLUSTER_ZOOM = 9;
      function refreshPins() {
        pinLayer.clearLayers();
        const z = map.getZoom();
        if (z >= MAX_CLUSTER_ZOOM) { pts.forEach((p) => drawPin(p).addTo(pinLayer)); return; }
        const cell = 360 / Math.pow(2, z + 3);
        const groups = {};
        pts.forEach((p) => {
          const key = Math.round(p.longitude / cell) + ":" + Math.round(p.latitude / cell);
          (groups[key] = groups[key] || []).push(p);
        });
        Object.keys(groups).forEach((k) => {
          const g = groups[k];
          if (g.length === 1) { drawPin(g[0]).addTo(pinLayer); return; }
          const lat = g.reduce((s, p) => s + p.latitude, 0) / g.length;
          const lng = g.reduce((s, p) => s + p.longitude, 0) / g.length;
          L.circleMarker([lat, lng], { radius: Math.min(24, 12 + g.length), color: "#0b5c40", weight: 2, fillColor: "#21d197", fillOpacity: .85 })
            .bindTooltip(isEn() ? g.length + " facilities" : Fmt.bn(g.length) + "টি প্রতিষ্ঠান", { direction: "top" })
            .on("click", () => { map.setView([lat, lng], z + 2, { animate: true }); })
            .addTo(pinLayer);
        });
      }
      map.on("zoomend", refreshPins);
      // আগে ভিউ ঠিক করুন, তারপর user marker/accuracy circle — renderer loaded-state এ থাকতে হবে।
      if (all.length === 1) map.setView([all[0].latitude, all[0].longitude], 14);
      else map.fitBounds(L.latLngBounds(all.map((p) => [p.latitude, p.longitude])).pad(0.25));
      refreshPins();
      if (o.user && typeof o.user.latitude === "number") {
        // Pulse-ring marker = "আমি এখানি", live tracking-এ চোখে পড়ে।
        const me = L.marker([o.user.latitude, o.user.longitude], {
          icon: L.divIcon({ className: "", iconSize: [18, 18], html: '<span class="db-pin-me"></span>' }),
          zIndexOffset: 1000,
        }).addTo(map).bindPopup("<strong>" + h(t("map.you")) + "</strong>");
        if (rec) rec.me = me;
        if (typeof o.user.accuracy === "number" && o.user.accuracy > 0) {
          const acc = L.circle([o.user.latitude, o.user.longitude], {
            radius: o.user.accuracy, color: "#3b82f6", weight: 1, fillColor: "#60a5fa", fillOpacity: .12,
          }).addTo(map);
          if (rec) rec.acc = acc;
        }
      }
    }).catch(fail);
  }
  /* Real-time position update: move the "me" marker in-place on every live map,
     refresh the accuracy circle, pan when Follow is on. No map rebuild. */
  function liveMapUpdate(pos) {
    const L = window.L;
    if (!L || !pos || typeof pos.latitude !== "number") return false;
    let did = false;
    Object.keys(LIVE_MAPS).forEach((id) => {
      const rec = LIVE_MAPS[id];
      if (!rec || !rec.map._container || !rec.map._container.isConnected) { delete LIVE_MAPS[id]; return; }
      const ll = [pos.latitude, pos.longitude];
      if (!rec.me) {
        rec.me = L.marker(ll, {
          icon: L.divIcon({ className: "", iconSize: [18, 18], html: '<span class="db-pin-me"></span>' }),
          zIndexOffset: 1000,
        }).addTo(rec.map).bindPopup("<strong>" + h(t("map.you")) + "</strong>");
      } else {
        rec.me.setLatLng(ll);
      }
      const acc = (typeof pos.accuracy === "number" && pos.accuracy > 0) ? pos.accuracy : 45;
      if (rec.acc) { rec.acc.setLatLng(ll); rec.acc.setRadius(acc); }
      else {
        rec.acc = L.circle(ll, { radius: acc, color: "#3b82f6", weight: 1, fillColor: "#60a5fa", fillOpacity: .12 }).addTo(rec.map);
      }
      if (rec.follow) rec.map.setView(ll, Math.max(rec.map.getZoom(), 15), { animate: true, duration: .6 });
      did = true;
    });
    return did;
  }

  /* ---------- Favorites (localStorage) ---------- */
  const FAV_KEY = "db_favs";
  function readFavs() {
    try { return JSON.parse(safeGet(FAV_KEY) || "[]") || []; }
    catch (e) { return []; }
  }
  function getFavs() { return readFavs(); }
  function isFav(slug) { return readFavs().indexOf(slug) !== -1; }
  function toggleFav(slug) {
    if (!slug) return false;
    let favs = readFavs();
    const i = favs.indexOf(slug);
    if (i === -1) favs.unshift(slug); else favs.splice(i, 1);
    favs = favs.slice(0, 60);
    safeSet(FAV_KEY, JSON.stringify(favs));
    return i === -1; // true => now favorited
  }
  // Star toggle button markup for a card; delegated click handler in boot().
  function favBtn(slug) {
    if (!slug) return "";
    const on = isFav(slug);
    const lbl = on ? t("fav.remove") : t("fav.add");
    return '<button class="fav-btn' + (on ? " on" : "") + '" type="button" data-fav="' + h(slug) + '" ' +
      'aria-pressed="' + (on ? "true" : "false") + '" aria-label="' + h(lbl) + '" ' +
      'title="' + h(lbl) + '">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      '<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z"/></svg></button>';
  }
  // Delegated star-toggle handler (cards re-render often); attach once.
  function bindFavButtons() {
    if (document._favDelegated) return;
    document._favDelegated = true;
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-fav]");
      if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const slug = b.getAttribute("data-fav");
      const now = toggleFav(slug);
      const lbl = now ? t("fav.remove") : t("fav.add");
      b.classList.toggle("on", now);
      b.setAttribute("aria-pressed", now ? "true" : "false");
      b.setAttribute("aria-label", lbl);
      b.title = lbl;
      toast(now ? t("fav.added") : t("fav.removed"));
      document.dispatchEvent(new CustomEvent("db:favchange", { detail: { slug, on: now } }));
    });
  }

  /* ---------- Recent searches (localStorage) ---------- */
  const REC_KEY = "db_recent";
  function readRecent() {
    try { return JSON.parse(safeGet(REC_KEY) || "[]") || []; }
    catch (e) { return []; }
  }
  function pushRecent(label, value, type) {
    if (!label) return;
    let rec = readRecent().filter((r) => !(r.value === value && r.type === type));
    rec.unshift({ label, value, type });
    rec = rec.slice(0, 8);
    safeSet(REC_KEY, JSON.stringify(rec));
  }
  function clearRecent() { safeRemove(REC_KEY); }
  function getRecent() { return readRecent(); }

  /* ---------- Location ---------- */
  function getCity() { return safeGet("db_city") || "ঢাকা"; }
  function setCity(c) { safeSet("db_city", c); }
  function haversine(a, b) {
    const R = 6371, dLat = (b.latitude - a.latitude) * Math.PI / 180, dLng = (b.longitude - a.longitude) * Math.PI / 180;
    const la1 = a.latitude * Math.PI / 180, la2 = b.latitude * Math.PI / 180;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  // Directory (search-hint) hospitals for a city, used to add real pins to maps.
  function directoryForCity(city) {
    return DB.directory.filter((d) => !city || d.city === city);
  }
  // Union of priced-sample cities and every directory district, for city pickers.
  function allCityNames() {
    return [...new Set([...DB.cities, ...DB.directory.map((d) => d.city)])];
  }

  /* ---------- Near Me (geolocation) ---------- */
  function fmtDist(km) {
    const num = km < 10 ? km.toFixed(1) : String(Math.round(km));
    return isEn() ? (num + " " + t("unit.km")) : (Fmt.bn(num) + " " + t("unit.km"));
  }
  function requestLocation(onOk, onErr) {
    if (!navigator.geolocation) { onErr && onErr("unsupported"); return null; }
    navigator.geolocation.getCurrentPosition(
      (pos) => onOk({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => onErr && onErr("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 });
    return null;
  }
  /* Live tracking: keeps calling onUpdate as the user moves (watchPosition).
     opts: { highAccuracy: true } for real-time walking/driving updates. */
  function startTracking(onUpdate, onErr, opts) {
    if (!navigator.geolocation) { onErr && onErr("unsupported"); return null; }
    let first = true;
    const o = opts || {};
    return navigator.geolocation.watchPosition(
      (pos) => onUpdate({
        latitude: pos.coords.latitude, longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy, heading: (typeof pos.coords.heading === "number" ? pos.coords.heading : null),
        timestamp: pos.timestamp,
      }),
      (err) => { if (first) { first = false; onErr && onErr("denied"); } },
      {
        enableHighAccuracy: !!o.highAccuracy,
        timeout: o.highAccuracy ? 20000 : 15000,
        maximumAge: o.highAccuracy ? 3000 : 15000,
      });
  }
  function stopTracking(id) {
    if (id != null && navigator.geolocation) navigator.geolocation.clearWatch(id);
  }
  // Returns a new sorted-by-distance array (does not mutate DB records).
  function withDistance(list, pos) {
    return list
      .filter((hp) => typeof hp.latitude === "number" && typeof hp.longitude === "number")
      .map((hp) => Object.assign({}, hp, { _distance: haversine(pos, hp) }))
      .sort((a, b) => a._distance - b._distance);
  }
  function nearCard(hp) {
    if (hp.is_directory) {
      let dist = typeof hp._distance === "number" ? '<span class="tag">' + fmtDist(hp._distance) + "</span>" : "";
      // OSRM দেওয়া আসল রাস্তার দূরত্ব + সময় এলে সেটাই প্রধান ট্যাগ হবে
      if (hp._road && typeof hp._road.km === "number") {
        const minS = hp._road.min > 0 ? (isEn() ? hp._road.min + " min" : Fmt.bn(hp._road.min) + " মিনিট") : "";
        dist = '<span class="tag" title="' + h(t("near.straight")) + ": " + (typeof hp._distance === "number" ? fmtDist(hp._distance) : "") + '">🛣 ' + fmtDist(hp._road.km) +
          (minS ? " · " + minS : "") + "</span>";
      }
      const nm = isEn() && hp.name_en ? hp.name_en : hp.name_bn;
      return '<div class="card tight"><div class="row between items-center wrap gap-8">' +
        '<div class="grow"><h3 style="font-size:17px;margin:0">' + h(nm) + "</h3>" +
        '<div class="kv small">' + ICONS.pin + "<span>" + h(hp.area ? hp.area + ", " : "") + h(cityName(hp.city)) + " · " + h(typeName(hp.hospital_type)) + "</span></div></div>" +
        dist + favBtn(hp.slug) + "</div>" +
        '<div class="row gap-8 wrap items-center mt-2"><a class="btn sm secondary" href="hospital.html?slug=' + encodeURIComponent(hp.slug) + '">' + h(t("action.details")) + "</a>" +
        directionsLink(hp) +
        '<span class="small muted">' + h(t("label.no_data_yet")) + "</span></div></div>";
    }
    return hospitalCard(hp, { showDistance: true });
  }
  // External turn-by-turn directions for real (directory) hospitals only; the pin
  // is district-level approximate, so the link is labelled as such.
  function directionsLink(hp) {
    if (!hp || hp.is_sample || typeof hp.latitude !== "number" || typeof hp.longitude !== "number") return "";
    const url = "https://www.google.com/maps/dir/?api=1&destination=" + hp.latitude + "," + hp.longitude;
    return '<a class="btn sm ghost" href="' + url + '" target="_blank" rel="noopener" title="' + h(t("map.approx")) + '">🧭 ' + h(t("action.directions")) + "</a>";
  }

  /* ---------- Page boot ---------- */
  /* ---------- Real data loader (NO sample data anywhere) ----------
     Hospitals: OpenStreetMap via /api/geo/hospitals (server proxy, disk-cached 24h).
     Prices: ONLY approved user-submitted real bills via /api/prices. */
  const REAL_CACHE_TTL = 24 * 60 * 60 * 1000;
  const realCacheKey = (city) => "db_real_hosp_" + city;
  // OSM addr:city is often English ("Dhaka", "Uttara, Dhaka") — map to Bengali
  // district names so city/area filters and directories work consistently.
  function normalizeRealHospital(x) {
    if (!x) return x;
    const cityRaw = String(x.city || "");
    let city = null;
    const area = x.area || (/^[A-Za-z .]+,\s*[A-Za-z .]+$/.test(cityRaw) ? cityRaw.split(",")[0].trim() : null);
    if (/dhaka/i.test(cityRaw)) city = "ঢাকা";
    else if (/chattogram|chittagong/i.test(cityRaw)) city = "চট্টগ্রাম";
    else if (/sylhet/i.test(cityRaw)) city = "সিলেট";
    else if (/khulna/i.test(cityRaw)) city = "খুলনা";
    else if (/rajshahi/i.test(cityRaw)) city = "রাজশাহী";
    else if (/rangpur/i.test(cityRaw)) city = "রংপুর";
    else if (/barishal|barisal/i.test(cityRaw)) city = "বরিশাল";
    else if (/mymensingh/i.test(cityRaw)) city = "ময়মনসিংহ";
    else if (/gazipur/i.test(cityRaw)) city = "গাজীপুর";
    else if (/narayanganj/i.test(cityRaw)) city = "নারায়ণগঞ্জ";
    else if (/cumilla|comilla/i.test(cityRaw)) city = "কুমিল্লা";
    else if (/bogura|bogra/i.test(cityRaw)) city = "বগুড়া";
    else if (/jashore|jessore/i.test(cityRaw)) city = "যশোর";
    return Object.assign({}, x, { city, area });
  }
  function realHospitalsFromCache(city) {
    try {
      const j = JSON.parse(safeGet(realCacheKey(city)) || "null");
      return (j && j.t > Date.now() - REAL_CACHE_TTL && Array.isArray(j.results)) ? j.results : null;
    } catch (e) { return null; }
  }
  function announceRealData(detail) {
    try { window.dispatchEvent(new CustomEvent("db:realdata", { detail: detail || {} })); } catch (e) {}
  }
  function ensureRealData(city) {
    const c = city || getCity();
    const cached = realHospitalsFromCache(c);
    if (cached && cached.length) DB.addRealHospitals(cached.map(normalizeRealHospital));
    // Real prices: always fresh from server (cheap), LS fallback for offline.
    fetch("/api/prices").then((r) => r.ok ? r.json() : null).then((j) => {
      if (j && j.ok && Array.isArray(j.prices)) {
        DB.addRealPrices(j.prices);
        safeSet("db_real_prices", JSON.stringify({ t: Date.now(), prices: j.prices }));
        announceRealData({ prices: j.prices.length });
      }
    }).catch(() => {
      try {
        const jit = JSON.parse(safeGet("db_real_prices") || "null");
        if (jit && Array.isArray(jit.prices)) DB.addRealPrices(jit.prices);
      } catch (e) {}
    });
    if (cached && cached.length) return; // hospitals already in; no network needed now
    const cc = (DB.cityCoords && (DB.cityCoords[c] || DB.cityCoords["ঢাকা"])) || [23.8103, 90.4125];
    fetch("/api/geo/hospitals?src=" + cc[0] + "," + cc[1] + "&city=" + encodeURIComponent(c) + "&radius=15000")
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (j && j.ok && Array.isArray(j.results) && j.results.length) {
          DB.addRealHospitals(j.results.map(normalizeRealHospital));
          safeSet(realCacheKey(c), JSON.stringify({ t: Date.now(), results: j.results }));
          announceRealData({ hospitals: j.results.length, source: j.source, fromNetwork: true });
        } else {
          announceRealData({ empty: true });
        }
      })
      .catch(() => {
        // Offline: accept stale cache if any
        try {
          const jit = JSON.parse(safeGet(realCacheKey(c)) || "null");
          if (jit && Array.isArray(jit.results)) DB.addRealHospitals(jit.results);
        } catch (e) {}
        announceRealData({ offline: true });
      });
  }

  function boot(activeKey) {
    renderHeader(activeKey);
    renderBottomNav(activeKey);
    renderFooter();
    bindFavButtons();
    applyTheme(getTheme());
    applyFont();
    syncLangToggle();
    translateDom(document);
    ensureRealData(getCity());
    // PWA: manifest + service worker (http(s) only; registration fails silently on file://)
    if (!document.querySelector('link[rel="manifest"]')) {
      const m = document.createElement("link");
      m.rel = "manifest"; m.href = "manifest.webmanifest";
      m.setAttribute("fetchpriority", "low");
      document.head.appendChild(m);
    }
    if (("serviceWorker" in navigator) && (location.protocol === "http:" || location.protocol === "https:")) {
      try { navigator.serviceWorker.register("sw.js").catch(() => {}); } catch (e) {}
    }
  }

  return { NAV, DESKTOP_NAV, ICONS, statusBadge, sampleBadge, priceText, searchBox,
    serviceCard, hospitalCard, miniMap, getCity, setCity, cityName, unitName, typeName, haversine, toast, boot,
    openModal, closeModal, openMore, directoryForCity, allCityNames, fmtDist, requestLocation, withDistance, nearCard, directionsLink,
    getFavs, isFav, toggleFav, favBtn, bindFavButtons, getRecent, pushRecent, clearRecent,
    startTracking, stopTracking, liveMapUpdate,
    t, isEn, getLang, setLang, toggleLang, syncLangToggle, translateDom,
    getTheme, applyTheme, toggleTheme, getFont, applyFont, cycleFont, ensureRealData };
})();
