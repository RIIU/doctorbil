/* DoctorBill — shared UI components & behaviors (frontend prototype).
   Renders nav, footer, search suggestions, cards, badges. All data is sample. */

window.UI = (function () {
  "use strict";
  const h = Fmt.escapeHtml;

  // Admin edits live in localStorage; merge them before any page reads DB.prices.
  if (window.Store && window.DB) Store.applyOverrides(DB);

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
  function systemTheme() {
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }
  function getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved === "dark" || saved === "light") ? saved : systemTheme();
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    // logo.svg is the dark-artwork version; on the dark header it would vanish.
    const src = t === "dark" ? "assets/img/logo-dark.svg" : "assets/img/logo.svg";
    document.querySelectorAll(".brand img").forEach((i) => i.setAttribute("src", src));
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
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
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
      "more.admin_note": "অ্যাডমিন প্যানেল কেবল অনুমোদিত ব্যবহারকারীর জন্য।",
      "more.close": "বন্ধ করুন",
      "banner.sample": "উন্নয়ন সংস্করণ — সব তথ্য নমুনা ডেটা, কোনো যাচাইকৃত বাস্তব মূল্য নয়।",
      "footer.tagline": "হাসপাতালের খরচ জানুন, বুঝে সিদ্ধান্ত নিন। তালিকাভুক্ত মূল্য থেকে সম্ভাব্য খরচের ধারণা নিন — চূড়ান্ত বিল নয়।",
      "footer.platform": "প্ল্যাটফর্ম", "footer.support": "সহায়তা", "footer.legal": "আইনি",
      "footer.how": "কীভাবে কাজ করে", "footer.trust": "স্বচ্ছতা", "footer.emergency": "জরুরি তথ্য",
      "footer.report": "ভুল তথ্য জানান", "footer.contact": "যোগাযোগ",
      "footer.privacy": "প্রাইভেসি পলিসি", "footer.terms": "শর্তাবলি", "footer.disclaimer": "মূল্য দাবিত্যাগ",
      "fav.add": "প্রিয় তালিকায় যোগ করুন", "fav.remove": "প্রিয় থেকে সরান",
      "fav.added": "প্রিয় তালিকায় যোগ হয়েছে", "fav.removed": "প্রিয় তালিকা থেকে সরানো হয়েছে",
      "near.me": "📍 আমার কাছাকাছি", "near.on": "✓ কাছাকাছি চালু (বন্ধ করুন)", "near.searching": "অবস্থান খোঁজা হচ্ছে…",
      "near.denied": "অবস্থান অনুমতি পাওয়া যায়নি — শহর বেছে দেখুন।",
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
      "home.hero.sub": "আপনার প্রয়োজনীয় চিকিৎসা ও ডায়াগনস্টিক সেবার সম্ভাব্য খরচ খুঁজুন এবং বিভিন্ন হাসপাতালের মূল্য তুলনা করুন।",
      "home.cta.compare": "হাসপাতাল তুলনা করুন", "home.cta.calc": "খরচ হিসাব করুন",
      "home.popular.h2": "জনপ্রিয় সেবা",
      "home.popular.sub": "সবচেয়ে বেশি খোঁজা হয় এমন টেস্ট ও চিকিৎসা। কার্ডে দেখানো মূল্য তালিকাভুক্ত নমুনা তথ্য।",
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
      "home.legal.h2": "প্রাইভেসি, শর্ত ও যোগাযোগ",
      "home.legal.sub": "এই সংস্করণটি উন্নয়ন/নমুনা — নিচের তথ্যও সেই অনুযায়ী সীমাবদ্ধ।",
      "home.legal.privacy.t": "প্রাইভেসি পলিসি",
      "home.legal.privacy.p1": "কোনো অ্যাকাউন্ট খোলা লাগে না এবং কোনো তথ্য সার্ভারে জমা হয় না। দেখানো সব হাসপাতাল ও মূল্য নমুনা ডেটা।",
      "home.legal.privacy.p2": "আপনার ব্রাউজারে যা সংরক্ষিত থাকে: থিম, ভাষা, পছন্দের শহর, প্রিয় হাসপাতালের তালিকা ও সাম্প্রতিক অনুসন্ধান। এগুলো শুধু এই ডিভাইসে থাকে, কোথাও পাঠানো হয় না; ব্রাউজারের সেটিংস থেকে যেকোনো সময় মুছে ফেলা যায়।",
      "home.legal.privacy.p3": "অবস্থান কেবল \"আমার কাছাকাছি\" বোতামে চাপলে এবং সম্মতি দিলেই ব্যবহার হয় — তা সংরক্ষণ বা প্রেরণ করা হয় না।",
      "home.legal.privacy.p4": "তৃতীয় পক্ষের সেবা: ফন্ট Google Fonts থেকে এবং মানচিত্রের টাইল OpenStreetMap থেকে লোড হয়, সেই অনুরোধে আপনার IP ঠিকানা পৌঁছায়। মানচিত্রের লাইব্রেরি Leaflet (unpkg CDN)।",
      "home.legal.terms.t": "শর্তাবলি",
      "home.legal.terms.p1": "এটি চিকিৎসা পরামর্শ নয়। এখানে দেখানো মূল্য আনুমানিক ও নমুনা; চূড়ান্ত বিল রোগীর অবস্থা, চিকিৎসক, প্যাকেজ ও হাসপাতালের নীতি অনুযায়ী ভিন্ন হবে। যেকোনো সিদ্ধান্তের আগে হাসপাতালের সঙ্গে নিশ্চিত করুন।",
      "home.legal.terms.p2": "মূল্য, হাসপাতালের নাম ও অবস্থান কোনো নির্ভুলতার নিশ্চয়তা ছাড়া প্রকাশিত হয়; মানচিত্রে দেখানো অবস্থান আনুমানিক হতে পারে।",
      "home.legal.terms.p3": "সাইটের তথ্য যেকোনো সময় পরিবর্তন, সংযোজন বা বাদ দেওয়া হতে পারে। ব্যবহার চালিয়ে রাখার অর্থ আপনি এই শর্তগুলো মেনে নিচ্ছেন।",
      "home.legal.contact.t": "যোগাযোগ",
      "home.legal.contact.p1": "এই প্রোটোটাইপের এখনো কোনো সাপোর্ট ইনবক্স চালু হয়নি। মূল্য ভুল বা পুরনো মনে হলে সংশ্লিষ্ট হাসপাতালের পৃষ্ঠা থেকে \"ভুল মূল্য জানান\" ব্যবহার করুন। পাবলিক সংস্করণে যাওয়ার আগে এখানে একটি যাচাইকৃত যোগাযোগের ঠিকানা প্রকাশ করা হবে।",
      "sh.band.title": "সম্ভাব্য মোট খরচ",
      "sh.band.typical": "সাধারণত",
      "sh.band.spread": "বেশিরভাগ বিল {low} থেকে {high}-এর মধ্যে পড়ে।",
      "sh.band.same": "সব খরচ একই থাকার সম্ভাবনা বেশি।",
      "sh.band.note": "এটি আনুমানিক হিসাব, কোটেশন নয় — চূড়ান্ত বিল ভিন্ন হতে পারে।",
      "sh.extras.h": "বিলে যা যা আরও যুক্ত হতে পারে",
      "sh.extras.sub": "টেস্টের দামের বাইরে এই খরচগুলোই সাধারণত হিসাব বড় করে দেয়।",
      "sh.extras.add": "হিসাবে যোগ করুন",
      "sh.extras.on": "যোগ আছে",
      "sh.perday": "প্রতি দিন",
      "sh.once": "একবার",
      "sh.days_n": "{n} দিন",
      "sh.missing.h": "যেগুলোর মূল্য আমাদের কাছে নেই",
      "sh.missing.note": "{list} — এই সেবাগুলোর খরচ হিসাবে ধরা হয়নি, তাই বাস্তব বিল এর চেয়ে বেশি হতে পারে।",
      "sh.govt": "সরকারি",
      "sh.private": "বেসরকারি",
      "sh.govt_vs_private": "সরকারি বনাম বেসরকারি",
      "sh.govt_note": "একই সেবার জন্য আদর্শ সরকারি হাসপাতালের রেফারেন্স রেঞ্জ (নমুনা)।",
      "sh.bima.h": "ছাড় ও বীমা — আপনার ক্ষেত্রে কী প্রযোজ্য?",
      "sh.bima.sub": "ভর্তির আগে এই তালিকাটি দেখে নিন; জিজ্ঞেস করলে অনেক খরচ বাঁচতে পারে।",
      "sh.bima.applies": "কখন প্রযোজ্য",
      "sh.bima.cut": "কী খেয়াল রাখবেন",
      "sh.feedback.q": "এই মূল্যটি কি ঠিক আছে?",
      "sh.feedback.yes": "ঠিক",
      "sh.feedback.no": "ভুল / পুরনো",
      "sh.feedback.thanks": "ধন্যবাদ — মতামত এই ডিভাইসে সংরক্ষিত হয়েছে।",
      "sh.feedback.count": "{n} জন মতামত দিয়েছেন",
      "sh.stale": "এই মূল্য {d} দিনের পুরনো — এখনো সঠিক কি না যাচাই করুন।",
      "sh.share.h": "হিসাবটি শেয়ার করুন",
      "sh.share.btn": "ছবি হিসেবে ডাউনলোড করুন",
      "sh.share.busy": "ছবি তৈরি হচ্ছে…",
      "sh.share.tip": "ছবিটি WhatsApp-এ পাঠানো যায়। এটি নমুনা হিসাব, হাসপাতালের চূড়ান্ত বিল নয়।",
      "sh.coverage.h": "আমরা কতটা কভার করেছি",
      "sh.coverage.filled": "{f} / {t}টি সেবার মূল্য",
      "sh.contrib.h": "আপনার মতো মানুষের জমা দেওয়া তথ্য",
      "sh.contrib.count": "{n}টি জমা",
      "sh.contrib.none": "এখনো কোনো জমা নেই — প্রথমটি আপনিই জানান।",
      "sh.quick.h": "আজ কত লাগল? ৩০ সেকেন্ডে জানান",
      "sh.quick.btn": "দ্রুত জানান",
      "sh.income.h": "আয়ের সাথে তুলনা",
      "sh.income.label": "আপনার মাসিক আয় (৳)",
      "sh.income.note": "এই হিসাব আপনার মাসিক আয়ের প্রায় {p}%।",
      "sh.local_note": "প্রোটোটাইপ: আপনি যা জমা দিচ্ছেন তা এই ব্রাউজারেই থাকে, এখনো কোনো সার্ভারে যায় না।",
      "sh.status.pending": "পর্যালোচনাধীন",
      "sh.status.verified": "যাচাইকৃত",
      "sh.status.rejected": "বাতিল",
      "sh.status.needs_info": "আরও তথ্য প্রয়োজন",
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
      "more.admin_note": "The admin panel is for authorized users only.",
      "more.close": "Close",
      "banner.sample": "Development version — all information is sample data, no verified real prices.",
      "footer.tagline": "Know hospital costs, decide with clarity. Get an indicative cost from listed prices — not a final bill.",
      "footer.platform": "Platform", "footer.support": "Support", "footer.legal": "Legal",
      "footer.how": "How it works", "footer.trust": "Transparency", "footer.emergency": "Emergency Info",
      "footer.report": "Report wrong info", "footer.contact": "Contact",
      "footer.privacy": "Privacy Policy", "footer.terms": "Terms", "footer.disclaimer": "Price Disclaimer",
      "fav.add": "Add to favorites", "fav.remove": "Remove from favorites",
      "fav.added": "Added to favorites", "fav.removed": "Removed from favorites",
      "near.me": "📍 Near me", "near.on": "✓ Nearby on (turn off)", "near.searching": "Finding location…",
      "near.denied": "Location permission denied — try choosing a city.",
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
      "home.hero.sub": "Find the likely cost of the tests and treatments you need, and compare prices across hospitals.",
      "home.cta.compare": "Compare hospitals", "home.cta.calc": "Estimate a cost",
      "home.popular.h2": "Popular services",
      "home.popular.sub": "The most-searched tests and treatments. Prices shown on cards are listed sample data.",
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
      "home.legal.h2": "Privacy, terms and contact",
      "home.legal.sub": "This is a development/sample build — the information below is limited accordingly.",
      "home.legal.privacy.t": "Privacy Policy",
      "home.legal.privacy.p1": "No account is required and nothing is stored on a server. Every hospital and price shown is sample data.",
      "home.legal.privacy.p2": "What your browser stores: theme, language, preferred city, your favourite hospitals and recent searches. These stay on this device and are never sent anywhere; you can clear them at any time from your browser settings.",
      "home.legal.privacy.p3": "Location is used only when you tap \"Near me\" and grant permission — it is never stored or transmitted.",
      "home.legal.privacy.p4": "Third-party services: fonts load from Google Fonts and map tiles from OpenStreetMap, so those requests carry your IP address. The map library is Leaflet (unpkg CDN).",
      "home.legal.terms.t": "Terms",
      "home.legal.terms.p1": "This is not medical advice. Prices shown are indicative and sample; a final bill varies with the patient's condition, doctor, package and hospital policy. Confirm with the hospital before deciding.",
      "home.legal.terms.p2": "Prices, hospital names and locations are published without any guarantee of accuracy; locations on the map may be approximate.",
      "home.legal.terms.p3": "Site content may be changed, added or removed at any time. Continuing to use the site means you accept these terms.",
      "home.legal.contact.t": "Contact",
      "home.legal.contact.p1": "This prototype does not have a support inbox yet. If a price looks wrong or outdated, use \"Report wrong price\" on that hospital's page. A verified contact address will be published here before the public release.",
      "sh.band.title": "Estimated total cost",
      "sh.band.typical": "Usually",
      "sh.band.spread": "Most bills land between {low} and {high}.",
      "sh.band.same": "Every line here is likely to cost the same.",
      "sh.band.note": "This is an estimate, not a quote — the final bill can differ.",
      "sh.extras.h": "What else usually lands on the bill",
      "sh.extras.sub": "These extras, not the test prices, are what usually inflate a hospital bill.",
      "sh.extras.add": "Add to estimate",
      "sh.extras.on": "Included",
      "sh.perday": "per day",
      "sh.once": "one-time",
      "sh.days_n": "{n} days",
      "sh.missing.h": "Services we have no price for",
      "sh.missing.note": "{list} — not counted in this estimate, so a real bill may be higher.",
      "sh.govt": "Government",
      "sh.private": "Private",
      "sh.govt_vs_private": "Government vs private",
      "sh.govt_note": "Reference range for a typical government facility for the same service (sample data).",
      "sh.bima.h": "Discounts & insurance — what applies to you?",
      "sh.bima.sub": "Check this list before admission; asking can save a lot.",
      "sh.bima.applies": "When it applies",
      "sh.bima.cut": "What to watch for",
      "sh.feedback.q": "Is this price correct?",
      "sh.feedback.yes": "Correct",
      "sh.feedback.no": "Wrong / old",
      "sh.feedback.thanks": "Thanks — your feedback is saved on this device.",
      "sh.feedback.count": "{n} people responded",
      "sh.stale": "This price is {d} days old — please re-check it.",
      "sh.share.h": "Share this estimate",
      "sh.share.btn": "Download as image",
      "sh.share.busy": "Building image…",
      "sh.share.tip": "The image can be sent on WhatsApp. It is a sample estimate, not a hospital bill.",
      "sh.coverage.h": "How much we have covered",
      "sh.coverage.filled": "{f} / {t} service prices",
      "sh.contrib.h": "Submissions from people like you",
      "sh.contrib.count": "{n} submissions",
      "sh.contrib.none": "No submissions yet — be the first to report one.",
      "sh.quick.h": "What did it cost today? Tell us in 30 seconds",
      "sh.quick.btn": "Quick report",
      "sh.income.h": "Compared to your income",
      "sh.income.label": "Your monthly income (৳)",
      "sh.income.note": "This estimate is about {p}% of your monthly income.",
      "sh.local_note": "Prototype: what you submit stays in this browser and does not reach a server yet.",
      "sh.status.pending": "Under review",
      "sh.status.verified": "Verified",
      "sh.status.rejected": "Not accepted",
      "sh.status.needs_info": "More info needed",
    },
  };
  function getLang() { const l = localStorage.getItem(LANG_KEY); return (l === "en" || l === "bn") ? l : "bn"; }
  // Pages register their own strings via addI18n so the shared dict stays lean.
  const PAGE_I18N = [];
  let mergedDict = null;
  function addI18n(dict) { PAGE_I18N.push(dict); mergedDict = null; }
  function lookup() {
    if (!mergedDict) {
      const l = getLang();
      mergedDict = Object.assign({}, I18N.bn,
        ...PAGE_I18N.map((d) => d.bn || {}), I18N[l],
        ...PAGE_I18N.map((d) => d[l] || {}));
    }
    return mergedDict;
  }
  function t(key) { return lookup()[key] || key; }
  function isEn() { return getLang() === "en"; }
  function setLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} }
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

  /* ---------- Status + sample badges ---------- */
  function statusBadge(rec) {
    const s = Fmt.status(rec && rec.verification_status);
    return '<span class="badge ' + s.cls + '"><span class="dot"></span>' + h(isEn() ? s.label_en : s.label_bn) + "</span>";
  }
  function sampleBadge() {
    return '<span class="badge sample" title="' + h(t("badge.sample_title")) + '">' + h(t("badge.sample")) + "</span>";
  }

  /* ---------- Price display ---------- */
  function priceText(rec) {
    const p = Fmt.price(rec);
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
        '<a class="brand" href="index.html" aria-label="DoctorBill হোম">' +
          '<img src="assets/img/logo.svg" alt="DoctorBill লোগো">' +
        "</a>" +
        '<nav class="pill-nav" aria-label="' + h(t("nav.home")) + '"><ul>' +
          DESKTOP_NAV.map((n) =>
            '<li><a href="' + n.href + '"' + (n.key === activeKey ? ' aria-current="page"' : "") + ">" + h(t(n.i18n)) + "</a></li>"
          ).join("") +
        "</ul></nav>" +
        '<div class="header-actions">' +
          '<button class="icon-btn" type="button" data-lang-toggle aria-label="ভাষা পরিবর্তন করুন" title="English"><span class="lang-tag">EN</span></button>' +
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
    applyTheme(getTheme());
    syncLangToggle();
  }

  /* ---------- Bottom nav (mobile) ---------- */
  function renderBottomNav(activeKey) {
    let el = document.getElementById("bottom-nav");
    if (!el) { el = document.createElement("nav"); el.id = "bottom-nav"; document.body.appendChild(el); }
    el.className = "bottom-nav";
    el.setAttribute("aria-label", "মোবাইল মেনু");
    el.innerHTML = "<ul>" + NAV.map((n) =>
      '<li style="flex:1"><a href="' + (n.href === "#more" ? "javascript:void(0)" : n.href) + '"' +
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
    const close = () => back.remove();
    back.addEventListener("click", (e) => { if (e.target === back || e.target.closest("[data-close]")) close(); });
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    el.className = "site-footer";
    el.innerHTML =
      '<div class="container footer-grid">' +
        '<div class="footer-brand">' +
          '<img src="assets/img/logo-dark.svg" alt="DoctorBill">' +
          '<p class="small">' + h(t("footer.tagline")) + "</p>" +
        "</div>" +
        "<div><h4>" + h(t("footer.platform")) + "</h4><ul>" +
          '<li><a href="index.html#how">' + h(t("footer.how")) + "</a></li>" +
          '<li><a href="index.html#trust">' + h(t("footer.trust")) + "</a></li>" +
          '<li><a href="submit-bill.html">' + h(t("more.submit")) + "</a></li>" +
        "</ul></div>" +
        "<div><h4>" + h(t("footer.support")) + "</h4><ul>" +
          '<li><a href="emergency.html">' + h(t("footer.emergency")) + "</a></li>" +
          '<li><a href="index.html#report">' + h(t("footer.report")) + "</a></li>" +
          '<li><a href="index.html#contact">' + h(t("footer.contact")) + "</a></li>" +
        "</ul></div>" +
        "<div><h4>" + h(t("footer.legal")) + "</h4><ul>" +
          '<li><a href="index.html#privacy">' + h(t("footer.privacy")) + "</a></li>" +
          '<li><a href="index.html#terms">' + h(t("footer.terms")) + "</a></li>" +
          '<li><a href="index.html#disclaimer">' + h(t("footer.disclaimer")) + "</a></li>" +
        "</ul></div>" +
      "</div>" +
      '<div class="container footer-bottom">© ' + Fmt.bn(new Date().getFullYear()) + ' DoctorBill — ' + (isEn() ? "development/sample version. Not medical advice." : "নমুনা/উন্নয়ন সংস্করণ। এটি কোনো চিকিৎসা পরামর্শ নয়।") + "</div>";
  }

  /* ---------- Sample-data dev banner ---------- */
  function renderSampleBanner() {
    if (document.getElementById("sample-banner")) return;
    const b = document.createElement("div");
    b.id = "sample-banner";
    b.style.cssText = "background:#7b3fbf;color:#fff;text-align:center;font-size:13px;font-weight:600;padding:6px 12px;";
    b.textContent = t("banner.sample");
    document.body.prepend(b);
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
  function searchBox(opts) {
    opts = opts || {};
    const placeholder = opts.placeholder || t("search.placeholder");
    const wrap = document.createElement("div");
    wrap.className = "search";
    wrap.setAttribute("data-searchbox", "");
    wrap.innerHTML =
      '<span aria-hidden="true" style="color:var(--brand-600);display:flex">' + ICONS.search + "</span>" +
      '<input type="search" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="sg" ' +
        'aria-label="' + h(t("search.aria")) + '" placeholder="' + h(placeholder) + '">' +
      '<button class="btn sm" type="button" data-go>' + h(t("action.search")) + "</button>" +
      '<div class="suggest" id="sg" role="listbox"></div>';
    const input = wrap.querySelector("input");
    const list = wrap.querySelector(".suggest");
    const en = isEn();

    function normalize(s) { return String(s || "").toLowerCase().trim(); }
    function matches(term) {
      const q = normalize(term);
      if (!q) return [];
      const out = [];
      DB.services.forEach((s) => {
        const hay = [s.name_bn, s.name_en, s.slug].concat(s.synonyms || []).map(normalize);
        if (hay.some((x) => x.includes(q))) out.push({ type: "service", label: en ? s.name_en : s.name_bn, sub: en ? s.name_bn : s.name_en, value: s.slug });
      });
      DB.hospitals.forEach((hp) => {
        const hay = [hp.name_bn, hp.name_en, hp.area, hp.city].map(normalize);
        if (hay.some((x) => x.includes(q))) out.push({ type: "hospital", label: en ? hp.name_en : hp.name_bn, sub: hp.area + ", " + hp.city, value: hp.slug });
      });
      // Directory hospitals: real names, search hints only (no price data yet).
      (DB.directory || []).forEach((hp) => {
        const hay = [hp.name_bn, hp.name_en, hp.area, hp.city].map(normalize);
        if (hay.some((x) => x.includes(q))) out.push({ type: "hospital", label: en ? hp.name_en : hp.name_bn, sub: (hp.area ? hp.area + ", " : "") + hp.city, value: hp.slug });
      });
      return out.slice(0, 12);
    }
    function render(term) {
      const m = matches(term);
      if (!m.length) { list.classList.remove("open"); input.setAttribute("aria-expanded", "false"); return; }
      list.innerHTML = m.map((x, i) =>
        '<button type="button" role="option" data-i="' + i + '" data-value="' + h(x.value) + '" data-type="' + x.type + '" data-label="' + h(x.label) + '">' +
          "<span>" + h(x.label) + "</span>" +
          '<span class="s-en">' + h(x.sub) + "</span></button>"
      ).join("");
      list.classList.add("open");
      input.setAttribute("aria-expanded", "true");
    }
    // Show recent-search chips when the box is focused with no query.
    function renderRecent() {
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
      else if (type === "hospital") location.href = "hospital.html?slug=" + encodeURIComponent(value);
      else location.href = "compare.html?service=" + encodeURIComponent(value);
    }
    input.addEventListener("input", () => render(input.value));
    input.addEventListener("focus", () => { if (input.value) render(input.value); else renderRecent(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); const first = list.querySelector("button[data-value]"); if (first) first.click(); else wrap.querySelector("[data-go]").click(); }
      if (e.key === "Escape") { list.classList.remove("open"); input.setAttribute("aria-expanded", "false"); }
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
    let range = null;
    if (lo !== Infinity && hi !== -Infinity) range = lo === hi ? Fmt.taka(lo) : Fmt.taka(lo) + " – " + Fmt.taka(hi);
    const en = isEn();
    return '<a class="card tight" href="compare.html?service=' + encodeURIComponent(s.slug) + '" style="text-decoration:none;color:inherit;display:block">' +
      '<div class="row between items-center"><span class="tag">' + h(cat ? cat.name_bn : "") + "</span>" + sampleBadge() + "</div>" +
      "<h3 class='mt-2' style='font-size:17px'>" + h(en ? s.name_en : s.name_bn) + "</h3>" +
      '<div class="small muted">' + h(en ? s.name_bn : s.name_en) + "</div>" +
      (range ? '<div class="price mt-2" style="font-size:20px">' + range + "</div>" : '<div class="price-na mt-2">' + h(t("label.price_na")) + "</div>") +
      '<div class="price-meta mt-2">' + Fmt.bn(ps.length) + (en ? " hospitals priced · " : " টি হাসপাতালে মূল্য · ") +
        (latest ? (en ? "Updated " + Fmt.date(latest) : Fmt.updated(latest).replace("সর্বশেষ আপডেট: ", "আপডেট ")) : (en ? "No update date" : "আপডেটের তারিখ নেই")) + "</div>" +
      "</a>";
  }

  function hospitalCard(hp, o) {
    o = o || {};
    const en = isEn();
    const initials = hp.name_bn.replace(/\(নমুনা\)/g, "").trim().slice(0, 1);
    const ps = DB.pricesForHospital(hp.id).filter((p) => p.verification_status !== "unavailable");
    return '<div class="card tight">' +
      '<div class="hcard-head">' +
        '<div class="hcard-avatar" aria-hidden="true">' + h(initials) + "</div>" +
        '<div class="grow"><h3>' + h(en && hp.name_en ? hp.name_en : hp.name_bn) + "</h3>" +
          '<div class="kv">' + ICONS.pin + "<span>" + h(hp.area) + ", " + h(hp.city) + " · " + h(hp.hospital_type) + "</span></div>" +
        "</div>" +
        favBtn(hp.slug) +
      "</div>" +
      '<div class="badge-row">' + sampleBadge() +
        (o.showDistance && hp._distance != null ? '<span class="tag">' + fmtDist(hp._distance) + "</span>" : "") +
        '<span class="tag">' + Fmt.bn(ps.length) + " " + h(t("label.services_price")) + "</span>" +
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
    const fail = () => { el.innerHTML = '<span class="small muted">' + h(t("map.failed")) + "</span>"; };
    loadLeaflet().then((L) => {
      if (!el.isConnected) return;
      el.innerHTML = "";
      const map = L.map(id, { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      if (!pts.length) { map.setView([23.75, 90.38], 7); return; }
      const all = pts.slice();
      if (o.user && typeof o.user.latitude === "number") {
        all.push(o.user);
        L.circleMarker([o.user.latitude, o.user.longitude], { radius: 9, color: "#1d4ed8", weight: 3, fillColor: "#3b82f6", fillOpacity: .9 })
          .addTo(map).bindPopup("<strong>" + h(t("map.you")) + "</strong>");
      }
      pts.forEach((p) => {
        const label = p.is_sample ? t("map.sample") : (p.coords_approx ? t("map.approx") : "");
        const nm = isEn() && p.name_en ? p.name_en : p.name_bn;
        L.circleMarker([p.latitude, p.longitude], { radius: 8, color: "#0b7a55", weight: 2, fillColor: "#16b07a", fillOpacity: .85 })
          .addTo(map)
          .bindPopup("<strong>" + h(nm) + "</strong><br><span class='small'>" + h(p.hospital_type || "") +
            (label ? "<br><em>" + h(label) + "</em>" : "") +
            (p._distance != null ? "<br><em>" + h(t("map.distance")) + ": " + fmtDist(p._distance) + "</em>" : "") + "</span>");
      });
      if (all.length === 1) map.setView([all[0].latitude, all[0].longitude], 14);
      else map.fitBounds(L.latLngBounds(all.map((p) => [p.latitude, p.longitude])).pad(0.25));
    }).catch(fail);
  }

  /* ---------- Favorites (localStorage) ---------- */
  const FAV_KEY = "db_favs";
  function readFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") || []; }
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
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {}
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
    try { return JSON.parse(localStorage.getItem(REC_KEY) || "[]") || []; }
    catch (e) { return []; }
  }
  function pushRecent(label, value, type) {
    if (!label) return;
    let rec = readRecent().filter((r) => !(r.value === value && r.type === type));
    rec.unshift({ label, value, type });
    rec = rec.slice(0, 8);
    try { localStorage.setItem(REC_KEY, JSON.stringify(rec)); } catch (e) {}
  }
  function clearRecent() { try { localStorage.removeItem(REC_KEY); } catch (e) {} }
  function getRecent() { return readRecent(); }

  /* ---------- Location ---------- */
  function getCity() { return localStorage.getItem("db_city") || "ঢাকা"; }
  function setCity(c) { localStorage.setItem("db_city", c); }
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
    if (!navigator.geolocation) { onErr && onErr("unsupported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => onOk({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => onErr && onErr("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 });
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
      const dist = typeof hp._distance === "number" ? '<span class="tag">' + fmtDist(hp._distance) + "</span>" : "";
      const nm = isEn() && hp.name_en ? hp.name_en : hp.name_bn;
      return '<div class="card tight"><div class="row between items-center wrap gap-8">' +
        '<div class="grow"><h3 style="font-size:17px;margin:0">' + h(nm) + "</h3>" +
        '<div class="kv small">' + ICONS.pin + "<span>" + h(hp.area ? hp.area + ", " : "") + h(hp.city) + " · " + h(hp.hospital_type) + "</span></div></div>" +
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
  function boot(activeKey) {
    renderSampleBanner();
    renderHeader(activeKey);
    renderBottomNav(activeKey);
    renderFooter();
    bindFavButtons();
    applyTheme(getTheme());
    syncLangToggle();
    translateDom(document);
  }

  /* ---------- estimate engine: services + extras → low / typical / high ---------- */

  function nameOf(rec) { return isEn() && rec.name_en ? rec.name_en : rec.name_bn; }

  function computeEstimate(serviceItems, extraIds, opt) {
    opt = opt || {};
    const sector = opt.sector === "govt" ? "govt" : "private";
    const days = Math.max(0, Number(opt.days) || 0);
    const lines = [], missing = [];
    let low = 0, mid = 0, high = 0, vatRate = 0;

    (serviceItems || []).forEach((it) => {
      const svc = DB.serviceById(it.id);
      if (!svc) return;
      const qty = Math.max(1, Number(it.qty) || 1);
      const rec = opt.hospitalId
        ? DB.prices.find((p) => p.hospital_id === opt.hospitalId && p.service_id === svc.id)
        : null;
      let a = null, b = null, c = null;
      if (rec && rec.verification_status !== "unavailable") {
        if (rec.price_amount != null) { a = b = c = rec.price_amount * qty; }
        else if (rec.price_min != null && rec.price_max != null) {
          a = rec.price_min * qty; c = rec.price_max * qty; b = Math.round((a + c) / 2);
        } else if (rec.price_min != null) { a = b = c = rec.price_min * qty; }
        else if (rec.price_max != null) { a = b = c = rec.price_max * qty; }
      }
      if (a == null) { missing.push(svc); return; }
      low += a; mid += b; high += c;
      lines.push({ kind: "service", id: svc.id, name: nameOf(svc), qty: qty, unit: svc.unit || "",
        low: a, mid: b, high: c, rec: rec, note: "" });
    });

    (extraIds || []).forEach((id) => {
      const x = DB.extraById(id);
      if (!x) return;
      if (x.type === "percent") { vatRate = Math.max(vatRate, x.rate || 0); return; }
      const r = DB.extraRange(x, sector);
      if (!r) return;
      const qty = x.type === "per_day" ? Math.max(1, days) : 1;
      low += r.low * qty; mid += r.mid * qty; high += r.high * qty;
      // The item name already carries "প্রতি দিন", so the unit is left blank to avoid saying it twice.
      lines.push({ kind: "extra", id: x.id, name: nameOf(x), qty: qty, unit: "", low: r.low * qty,
        mid: r.mid * qty, high: r.high * qty, unitLow: r.low, unitMid: r.mid,
        unitHigh: r.high, note: isEn() ? x.note_en : x.note_bn });
    });

    if (vatRate > 0) {
      const before = { low: low, mid: mid, high: high };
      low = Math.round(low * (1 + vatRate)); mid = Math.round(mid * (1 + vatRate)); high = Math.round(high * (1 + vatRate));
      lines.push({ kind: "vat", id: "x_vat", name: isEn() ? "VAT / service charge" : "ভ্যাট / সার্ভিস চার্জ",
        qty: 1, unit: Math.round(vatRate * 100) + "%", low: low - before.low, mid: mid - before.mid,
        high: high - before.high, note: isEn() ? "Applied on the subtotal above." : "উপরের মোট অংশের ওপর হার অনুযায়ী।" });
    }
    return { lines: lines, low: low, mid: mid, high: high, missing: missing, days: days, sector: sector };
  }

  function estimate(scenarioId, hospitalId, opt) {
    opt = opt || {};
    const sc = DB.scenarioById ? DB.scenarioById(scenarioId) : null;
    if (!sc) return computeEstimate([], [], opt);
    const merged = Object.assign({ days: sc.stay_days }, opt);
    return computeEstimate(sc.services, sc.extras, merged);
  }

  function bandText(est) {
    if (!est) return "—";
    if (est.low === est.high) return Fmt.taka(est.mid) || "৳০";
    return (Fmt.taka(est.low) || "৳০") + "–" + (Fmt.taka(est.high) || "৳০");
  }

  function renderEstimate(est, opts) {
    opts = opts || {};
    const el = document.createElement("div");
    el.className = "estimate";
    let html = '<div class="band"><div class="band-label">' + h(t("sh.band.title")) + "</div>" +
      '<div class="band-figure">' + h(Fmt.taka(est.mid) || "৳০") + "</div>" +
      '<div class="band-typ">' + h(est.low === est.high ? t("sh.band.same")
        : t("sh.band.spread").replace("{low}", Fmt.taka(est.low)).replace("{high}", Fmt.taka(est.high))) + "</div></div>";
    if (est.days) html += '<div class="small muted mt-1">' + h(t("sh.days_n").replace("{n}", Fmt.bn(est.days))) + "</div>";
    if (est.lines.length) {
      html += '<ul class="est-lines">';
      est.lines.forEach((l) => {
        html += '<li><span class="est-name">' + h(l.name) +
          (l.qty > 1 ? ' <span class="muted small">× ' + Fmt.bn(l.qty) + "</span>" : "") +
          (l.unit ? ' <span class="muted small">' + h(l.unit) + "</span>" : "") +
          (l.note ? ' <span class="est-note" title="' + h(l.note) + '">' + h(l.note) + "</span>" : "") +
          '</span><span class="est-val">' + h(l.low === l.high ? (Fmt.taka(l.mid) || "—") : (Fmt.taka(l.low) + "–" + Fmt.taka(l.high))) + "</span></li>";
      });
      html += "</ul>";
    }
    if (est.missing.length) {
      html += '<div class="notice warn mt-2"><strong>' + h(t("sh.missing.h")) + "</strong> " +
        h(t("sh.missing.note").replace("{list}", est.missing.map(nameOf).join(", "))) + "</div>";
    }
    html += '<div class="notice mt-2 small">' + h(t("sh.band.note")) + "</div>";
    if (opts.sampleBadge !== false) html += '<div class="badge-row mt-2">' + sampleBadge() + "</div>";
    el.innerHTML = html;
    return el;
  }

  /* ---------- one-tap price feedback ---------- */

  function feedbackBtn(hospitalId, serviceId) {
    const f = Store.feedbackFor(hospitalId, serviceId);
    const total = (f.up || 0) + (f.down || 0);
    return '<span class="fb" data-fb-h="' + h(hospitalId) + '" data-fb-s="' + h(serviceId) + '">' +
      '<span class="fb-q">' + h(t("sh.feedback.q")) + "</span>" +
      '<button class="fb-btn' + (f.mine === "up" ? " on" : "") + '" type="button" data-fb-dir="up" aria-pressed="' + (f.mine === "up") + '">' + h(t("sh.feedback.yes")) + "</button>" +
      '<button class="fb-btn neg' + (f.mine === "down" ? " on" : "") + '" type="button" data-fb-dir="down" aria-pressed="' + (f.mine === "down") + '">' + h(t("sh.feedback.no")) + "</button>" +
      '<span class="fb-count">' + (total ? h(t("sh.feedback.count").replace("{n}", Fmt.bn(total))) : "") + "</span></span>";
  }

  function bindFeedback(root) {
    const scope = root || document;
    scope.querySelectorAll(".fb").forEach((wrap) => {
      if (wrap.dataset.fbBound) return;
      wrap.dataset.fbBound = "1";
      wrap.querySelectorAll("[data-fb-dir]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const w = btn.closest(".fb");
          const f = Store.voteFeedback(w.dataset.fbH, w.dataset.fbS, btn.dataset.fbDir);
          w.querySelectorAll("[data-fb-dir]").forEach((b) => {
            const on = b.dataset.fbDir === f.mine;
            b.classList.toggle("on", on);
            b.setAttribute("aria-pressed", String(on));
          });
          const total = f.up + f.down;
          w.querySelector(".fb-count").textContent = total ? t("sh.feedback.count").replace("{n}", Fmt.bn(total)) : "";
          if (f.mine) toast(t("sh.feedback.thanks"));
        });
      });
    });
  }

  /* ---------- freshness ---------- */

  function staleDays(iso) {
    if (!iso) return null;
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    if (isNaN(d)) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }

  function staleNote(iso, thresholdDays) {
    const n = staleDays(iso);
    if (n == null || n < (thresholdDays || 180)) return "";
    return '<div class="notice warn small mt-1">' + h(t("sh.stale").replace("{d}", Fmt.bn(n))) + "</div>";
  }

  /* ---------- income context ---------- */

  function incomeNote(amount) {
    let income = 0;
    try { income = Number(localStorage.getItem("dbill:income")) || 0; } catch (e) {}
    if (!income || income <= 0 || !amount) return "";
    const pct = Math.round((amount / income) * 100);
    if (!isFinite(pct) || pct <= 0) return "";
    return '<div class="small muted mt-1">' + h(t("sh.income.note").replace("{p}", Fmt.bn(pct))) + "</div>";
  }

  function setIncome(v) { try { localStorage.setItem("dbill:income", String(Number(v) || 0)); } catch (e) {} }
  function getIncome() { try { return Number(localStorage.getItem("dbill:income")) || 0; } catch (e) { return 0; } }

  /* ---------- share card (client-side canvas → PNG) ---------- */

  function makeShareCard(payload) {
    return new Promise((resolve, reject) => {
      const W = 720, pad = 44, rowH = 34;
      const rows = payload.lines || [];
      const H = 300 + rows.length * rowH;
      const c = document.createElement("canvas");
      c.width = W * 2; c.height = H * 2;
      const ctx = c.getContext("2d");
      if (!ctx) { reject(new Error("no canvas context")); return; }
      ctx.scale(2, 2);
      const paint = () => {
        ctx.fillStyle = "#0e3b2e"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 30px 'Hind Siliguri', sans-serif";
        ctx.fillText(payload.title || "DoctorBill", pad, pad + 26, W - pad * 2);
        ctx.font = "400 18px 'Hind Siliguri', sans-serif";
        ctx.fillStyle = "#9fc4b5";
        ctx.fillText(payload.subtitle || "", pad, pad + 56, W - pad * 2);
        let y = pad + 96;
        ctx.strokeStyle = "rgba(255,255,255,.16)";
        rows.forEach((l) => {
          ctx.font = "400 19px 'Hind Siliguri', sans-serif";
          ctx.fillStyle = "#e7f2ec";
          ctx.fillText(l.label, pad, y, W - pad * 2 - 190);
          ctx.textAlign = "right";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(l.value, W - pad, y);
          ctx.textAlign = "left";
          y += rowH;
          ctx.beginPath(); ctx.moveTo(pad, y - 12); ctx.lineTo(W - pad, y - 12); ctx.stroke();
        });
        y += 14;
        ctx.font = "700 24px 'Hind Siliguri', sans-serif";
        ctx.fillStyle = "#e7f2ec";
        ctx.fillText(payload.totalLabel || "সম্ভাব্য মোট খরচ", pad, y);
        ctx.textAlign = "right";
        ctx.fillStyle = "#7ee0b3"; ctx.font = "700 30px 'Hind Siliguri', sans-serif";
        ctx.fillText(payload.total || "", W - pad, y + 4);
        ctx.textAlign = "left";
        y += 44;
        ctx.font = "400 15px 'Hind Siliguri', sans-serif";
        ctx.fillStyle = "#9fc4b5";
        ctx.fillText(payload.note || "", pad, y, W - pad * 2);
        ctx.fillText("DoctorBill · নমুনা হিসাব", pad, y + 24);
        resolve(c.toDataURL("image/png"));
      };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint).catch(paint);
      else paint();
    });
  }

  function renderShareCard(host, payload) {
    const el = typeof host === "string" ? document.querySelector(host) : host;
    if (!el) return;
    el.className = "share-card";
    el.innerHTML = '<div class="share-img" aria-hidden="true"></div>' +
      '<div class="row gap-8 mt-2 wrap"><button class="btn sm" type="button" data-share-dl>' + h(t("sh.share.btn")) + "</button></div>" +
      '<div class="hint small mt-1">' + h(t("sh.share.tip")) + "</div>";
    const imgHost = el.querySelector(".share-img");
    const btn = el.querySelector("[data-share-dl]");
    btn.disabled = true;
    btn.textContent = t("sh.share.busy");
    makeShareCard(payload).then((url) => {
      const img = document.createElement("img");
      img.src = url; img.alt = t("sh.share.h");
      imgHost.innerHTML = ""; imgHost.appendChild(img);
      btn.disabled = false; btn.textContent = t("sh.share.btn");
      btn.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = "doctorbill-estimate-" + Date.now() + ".png";
        document.body.appendChild(a); a.click(); a.remove();
      });
    }).catch(() => {
      btn.textContent = t("sh.share.btn");
      imgHost.innerHTML = '<div class="notice small">' + h(t("sh.band.note")) + "</div>";
    });
  }

  /* ---------- coverage + checklist renderers ---------- */

  function coverageBar() {
    const s = Store.stats(DB);
    const pct = s.total ? Math.round((s.filled / s.total) * 100) : 0;
    return '<div class="coverage"><div class="row between items-center"><strong>' + h(t("sh.coverage.h")) + "</strong>" +
      '<span class="small muted">' + h(t("sh.coverage.filled").replace("{f}", Fmt.bn(s.filled)).replace("{t}", Fmt.bn(s.total))) + "</span></div>" +
      '<div class="bar" role="img" aria-label="' + Fmt.bn(pct) + '%"><span style="width:' + pct + '%"></span></div></div>';
  }

  function checklist(items, opts) {
    opts = opts || {};
    return '<ul class="checklist">' + items.map((it) => {
      const title = nameOf(it);
      return '<li><strong>' + h(title) + "</strong>" +
        (it.applies_bn ? '<div class="small"><span class="cl-k">' + h(t("sh.bima.applies")) + ":</span> " + h(isEn() ? (it.applies_en || "") : it.applies_bn) + "</div>" : "") +
        (it.cut_bn ? '<div class="small muted"><span class="cl-k">' + h(t("sh.bima.cut")) + ":</span> " + h(isEn() ? (it.cut_en || "") : it.cut_bn) + "</div>" : "") +
        "</li>";
    }).join("") + "</ul>";
  }

  function extrasPicker(selectedIds, onToggle, opts) {
    opts = opts || {};
    const sel = {};
    (selectedIds || []).forEach((id) => { sel[id] = true; });
    const wrap = document.createElement("div");
    wrap.className = "extras-picker";
    wrap.innerHTML = DB.extras.map((x) => {
      const r = DB.extraRange(x, opts.sector || "private");
      const val = x.type === "percent" ? Math.round(x.rate * 100) + "%" : (Fmt.taka(r.low) + "–" + Fmt.taka(r.high));
      return '<label class="card tight ex' + (sel[x.id] ? " on" : "") + '"><span class="check">' +
        '<input type="checkbox" data-ex="' + h(x.id) + '"' + (sel[x.id] ? " checked" : "") + ">" +
        '<span class="grow"><strong>' + h(nameOf(x)) + "</strong>" +
        '<span class="small muted"> · ' + h(x.type === "per_day" ? t("sh.perday") : t("sh.once")) + " · " + h(val) + "</span>" +
        (x.note_bn ? '<span class="ex-note">' + h(isEn() ? x.note_en : x.note_bn) + "</span>" : "") +
        "</span></span></label>";
    }).join("");
    wrap.querySelectorAll("input[data-ex]").forEach((cb) => {
      cb.addEventListener("change", () => {
        cb.closest(".ex").classList.toggle("on", cb.checked);
        if (onToggle) onToggle(cb.dataset.ex, cb.checked);
      });
    });
    return wrap;
  }

  function localNote() {
    return '<div class="notice small mt-2">' + h(t("sh.local_note")) + "</div>";
  }

  return { NAV, DESKTOP_NAV, ICONS, statusBadge, sampleBadge, priceText, searchBox,
    serviceCard, hospitalCard, miniMap, getCity, setCity, haversine, toast, boot,
    openMore, directoryForCity, allCityNames, fmtDist, requestLocation, withDistance, nearCard, directionsLink,
    getFavs, isFav, toggleFav, favBtn, bindFavButtons, getRecent, pushRecent, clearRecent,
    t, addI18n, isEn, getLang, setLang, toggleLang, syncLangToggle, translateDom,
    getTheme, applyTheme, toggleTheme,
    nameOf, computeEstimate, estimate, bandText, renderEstimate,
    feedbackBtn, bindFeedback, staleDays, staleNote,
    incomeNote, setIncome, getIncome, makeShareCard, renderShareCard,
    coverageBar, checklist, extrasPicker, localNote };
})();
