/* DoctorBill — bill-composition data: extra charge items, problem-based scenarios,
   government reference rates and discount/insurance checklist.
   All ranges are ILLUSTRATIVE SAMPLE data for this prototype, not published tariffs.
   They exist so a user can see "a bill is more than the test price", never as a quote. */

(function () {
  "use strict";

  const SAMPLE = { is_sample: true, environment: "development", sample_label: "নমুনা ডেটা" };

  /* type: per_visit | per_day | per_item | percent
     govt / private ranges are typical ৳ spans; percent items carry rate instead. */
  const EXTRAS = [
    { id: "x_visit", name_bn: "OPD ভিজিট ফি", name_en: "OPD visit fee", type: "per_visit",
      private: [300, 1200], govt: [10, 30], note_bn: "বিশেষজ্ঞ ডাক্তারের ভিজিট; সিনিয়র/অধ্যাপক হলে বেশি।" },
    { id: "x_reg", name_bn: "রেজিস্ট্রেশন / ফাইল খরচ", name_en: "Registration / file fee", type: "per_visit",
      private: [100, 500], govt: [5, 20], note_bn: "প্রথমবার হাসপাতালে এলে ফাইল খরচ যুক্ত হয়।" },
    { id: "x_emergency", name_bn: "জরুরি / ইমার্জেন্সি চার্জ", name_en: "Emergency charge", type: "per_visit",
      private: [500, 2500], govt: [0, 50], note_bn: "রাত/ছুটির দিন বা ইমার্জেন্সি ওয়ার্ড দিয়ে গেলে আলাদা যুক্ত হয়।" },
    { id: "x_medicine", name_bn: "ওষুধ (ভর্তিকালীন)", name_en: "Medicines (inpatient)", type: "per_day",
      private: [400, 2500], govt: [0, 300], note_bn: "সরকারি হাসপাতালে ওষুধ বহুক্ষেত্রে ফ্রি বা কাছারি দরে পাওয়া যায়।" },
    { id: "x_medicine_opd", name_bn: "ওষুধ (বাইরের রোগী, একবার)", name_en: "Medicines (outpatient, one course)", type: "per_visit",
      private: [300, 1500], govt: [0, 300], note_bn: "OPD ভিজিট বা এক ডায়ালাইসিস সেশনের ওষুধ; ভর্তি হলে প্রতি দিন হিসেবে আলাদা যোগ হবে।" },
    { id: "x_consumable", name_bn: "স্যালাইন, ইনজেকশন, consumables", name_en: "IV fluids & consumables", type: "per_day",
      private: [300, 1500], govt: [20, 150], note_bn: "সবচেয়ে বেশি অদৃশ্য খরচ এখানে — বিলে স্যালাইন সেট, গ্লাভস ও সিরিঞ্জ আলাদা লাইনে থাকে।" },
    { id: "x_nursing", name_bn: "নার্সিং চার্জ", name_en: "Nursing charge", type: "per_day",
      private: [500, 2000], govt: [0, 100], note_bn: "বেসরকারি হাসপাতালে প্রতি দিন আলাদা নার্সিং ফি কাটা হয়।" },
    { id: "x_ward", name_bn: "সাধারণ ওয়ার্ড (প্রতি দিন)", name_en: "General ward (per day)", type: "per_day",
      private: [800, 2500], govt: [10, 60], note_bn: "বেড সংখ্যার ওপর নির্ভর করে; বেসরকারিতে সাধারণ ওয়ার্ডও কম নয়।" },
    { id: "x_cabin", name_bn: "কেবিন / সেমি-প্রাইভেট (প্রতি দিন)", name_en: "Cabin room (per day)", type: "per_day",
      private: [2500, 9000], govt: [100, 400], note_bn: "একই চিকিৎসা, কেবল রুমের দরে খরচ কয়েক গুণ বাড়ে।" },
    { id: "x_icu", name_bn: "আইসিইউ / সিসিইউ (প্রতি দিন)", name_en: "ICU/CCU (per day)", type: "per_day",
      private: [6000, 20000], govt: [300, 1200], note_bn: "ভেন্টিলেটর যুক্ত হলে দাম আরও বাড়ে; সব হাসপাতালে সরকারি আইসিইউ নেই।" },
    { id: "x_ot", name_bn: "অপারেশন থিয়েটার চার্জ", name_en: "Operation theatre charge", type: "per_item",
      private: [5000, 35000], govt: [200, 3000], note_bn: "সার্জারির ধরন ও সময়ের সাথে বদলায়; ডাক্তারের ফি আলাদা।" },
    { id: "x_anesthesia", name_bn: "অ্যানেসথেসিয়া / সিজল ফি", name_en: "Anaesthesia fee", type: "per_item",
      private: [2000, 12000], govt: [50, 800], note_bn: "জেনারেল অ্যানেসথেসিয়া হলে উল্লেখযোগ্য খরচ।" },
    { id: "x_surgeon", name_bn: "সার্জন / বিশেষজ্ঞ ফি", name_en: "Surgeon / specialist fee", type: "per_item",
      private: [5000, 60000], govt: [0, 500], note_bn: "বেসরকারিতে সার্জনের ফি প্যাকেজের বাইরেও আলাদা লাইনে আসতে পারে।" },
    { id: "x_implant", name_bn: "ইমপ্ল্যান্ট / স্টেন্ট / লেন্স", name_en: "Implant / stent / lens", type: "per_item",
      private: [15000, 180000], govt: [3000, 40000], note_bn: "সবচেয়ে বড় অস্থির খরচ; ব্র্যান্ড অনুযায়ী দাম ভিন্ন, বিলে ব্র্যান্ড লেখা থাকে।" },
    { id: "x_blood", name_bn: "রক্ত / ব্লাড ব্যাংক চার্জ", name_en: "Blood bank charge", type: "per_item",
      private: [800, 3000], govt: [0, 500], note_bn: "ডোনর রক্ত দিলেও প্রসেসিং ফি আলাদা লাগে।" },
    { id: "x_labout", name_bn: "আউটসোর্সড ল্যাব টেস্ট", name_en: "Outsourced lab tests", type: "per_item",
      private: [500, 6000], govt: [100, 1500], note_bn: "হাসপাতালের ল্যাবে না থাকলে বাইরের ল্যাবে পাঠায়, সেই খরচ বিলে আসে।" },
    { id: "x_dialysis", name_bn: "ডায়ালাইসিস (প্রতি সেশন)", name_en: "Dialysis (per session)", type: "per_item",
      private: [2500, 6000], govt: [0, 800], note_bn: "সাপ্তাহিক ২–৩ সেশন লাগে — মাসিক খরচ দ্রুত বড় হয়ে যায়।" },
    { id: "x_ambulance", name_bn: "অ্যাম্বুলেন্স", name_en: "Ambulance", type: "per_item",
      private: [800, 5000], govt: [0, 500], note_bn: "দূরত্ব ও ধরন (সাধারণ/ভেন্টিলেটর) অনুযায়ী।" },
    { id: "x_discharge", name_bn: "ডিসচার্জ প্রসেসিং / রিপোর্ট ফি", name_en: "Discharge processing", type: "per_item",
      private: [200, 1500], govt: [0, 50], note_bn: "ছাড়পত্র, কপি ও রিপোর্ট প্রস্তুতির ফি।" },
    { id: "x_vat", name_bn: "ভ্যাট / সার্ভিস চার্জ", name_en: "VAT / service charge", type: "percent",
      rate: 0.05, private: [0, 0], govt: [0, 0], note_bn: "কিছু খরচে ভ্যাট যুক্ত হয়; বিলে আলাদা লাইনে দেখা যায়।" },
  ];

  /* Problem-first entry: user picks what happened, not the test name. */
  const SCENARIOS = [
    { id: "sc_opd", name_bn: "জ্বর/সাধারণ অসুখে ডাক্তার দেখানো (OPD)", name_en: "Fever — outpatient visit",
      icon: "stethoscope", stay_days: 0,
      services: [{ id: "s7", qty: 1 }, { id: "s1", qty: 1 }, { id: "s2", qty: 1 }],
      extras: ["x_visit", "x_reg", "x_medicine_opd"],
      note_bn: "একই দিনে ফিরে আসা। বিলে ভিজিট ফি + টেস্ট + ওষুধ — তিনটি আলাদা লাইন।",
      note_en: "Same-day visit: consultation, tests and medicines appear as separate lines." },

    { id: "sc_dengue", name_bn: "ডেঙ্গু/তীব্র জ্বরে ভর্তি (≈৩ দিন)", name_en: "Dengue admission (~3 days)",
      icon: "bed", stay_days: 3,
      services: [{ id: "s1", qty: 2 }, { id: "s9", qty: 1 }],
      extras: ["x_ward", "x_nursing", "x_consumable", "x_medicine", "x_labout", "x_discharge"],
      note_bn: "ওয়ার্ড, নার্সিং ও স্যালাইন প্রতি দিন আলাদা কাটে — টেস্টের দামের চেয়ে এটাই বড় অংশ হতে পারে।",
      note_en: "Ward, nursing and IVs are charged per day and often exceed the test costs." },

    { id: "sc_delivery_normal", name_bn: "স্বাভাবিক ডেলিভারি (≈২ দিন ভর্তি)", name_en: "Normal delivery (~2 days)",
      icon: "baby", stay_days: 2,
      services: [{ id: "s1", qty: 1 }, { id: "s7", qty: 1 }],
      extras: ["x_ward", "x_nursing", "x_consumable", "x_medicine", "x_blood", "x_discharge"],
      note_bn: "প্যাকেজ দিলেও রক্ত, ওষুধ ও জটিলতার খরচ আলাদা লাইনে আসতে পারে।",
      note_en: "Even with a package, blood, medicines and complications may be billed separately." },

    { id: "sc_cesarean", name_bn: "সিজার ডেলিভারি (≈৩–৪ দিন ভর্তি)", name_en: "Caesarean (~3–4 days)",
      icon: "scalpel", stay_days: 4,
      services: [{ id: "s1", qty: 1 }, { id: "s7", qty: 1 }],
      extras: ["x_ot", "x_anesthesia", "x_surgeon", "x_cabin", "x_nursing", "x_consumable", "x_medicine", "x_blood", "x_discharge"],
      note_bn: "অপারেশন, অ্যানেসথেসিয়া ও সার্জনের ফি — এই তিনটিতেই খরচের সবচেয়ে বড় পার্থক্য হয়।",
      note_en: "OT, anaesthesia and surgeon fees create the widest spread between hospitals." },

    { id: "sc_appendix", name_bn: "অ্যাপেন্ডিসাইটিক্টমি (≈৩ দিন ভর্তি)", name_en: "Appendectomy (~3 days)",
      icon: "scalpel", stay_days: 3,
      services: [{ id: "s12", qty: 1 }, { id: "s1", qty: 1 }, { id: "s5", qty: 1 }],
      extras: ["x_ot", "x_anesthesia", "x_ward", "x_nursing", "x_consumable", "x_medicine", "x_discharge"],
      note_bn: "লেপ্রোস্কোপিক (বোতাম) সার্জারিতে OT ও ইমপ্ল্যান্ট/কিট খরচ খোলা কাটা অপেক্ষা বেশি হতে পারে।",
      note_en: "Laparoscopic surgery can cost more than open surgery due to kit/OT charges." },

    { id: "sc_dialysis", name_bn: "ডায়ালাইসিস (প্রতি সেশন)", name_en: "Dialysis (per session)",
      icon: "drop", stay_days: 0,
      services: [{ id: "s1", qty: 1 }, { id: "s10", qty: 1 }],
      extras: ["x_dialysis", "x_visit", "x_medicine_opd"],
      note_bn: "সেশন চার্জে সাধারণত ডায়ালাইজার ও স্যালাইন সেট ধরা হয়। সাপ্তাহিক ২–৩ সেশন ধরে মাসিক হিসাব করলে খরচ অনেক বড় দেখায়।",
      note_en: "The session fee usually covers the dialyzer and tubing. Multiply by 8–12 sessions a month to see the real monthly burden." },

    { id: "sc_stent", name_bn: "হৃদরোগ / স্টেন্ট বসানো", name_en: "Cardiac stent",
      icon: "heart", stay_days: 4,
      services: [{ id: "s6", qty: 1 }, { id: "s8", qty: 1 }, { id: "s10", qty: 1 }],
      extras: ["x_icu", "x_implant", "x_ot", "x_anesthesia", "x_consumable", "x_medicine", "x_nursing", "x_discharge"],
      note_bn: "স্টেন্টের ব্র্যান্ড ও সংখ্যাই এখানে সবচেয়ে বড় খরচ — বিলে অবশ্যই ব্র্যান্ড/সিরিয়াল দেখবেন।",
      note_en: "Stent brand and count dominate the bill — always check them on the invoice." },

    { id: "sc_cataract", name_bn: "মোতাবেক (মোতিবিন্দু) অপারেশন", name_en: "Cataract surgery",
      icon: "eye", stay_days: 1,
      services: [{ id: "s7", qty: 1 }],
      extras: ["x_ot", "x_implant", "x_anesthesia", "x_medicine", "x_discharge"],
      note_bn: "লেন্সের ধরন (সাধারণ/biofold/প্রিমিয়াম) অনুযায়ী পুরো খরচ বদলে যায়।",
      note_en: "The lens type chosen changes the whole bill." },
  ];

  /* Illustrative government-facility reference rates for the same services,
     so a user can see the public option exists. Not an official tariff sheet. */
  const GOVT_SERVICE = {
    s1: [30, 60], s2: [25, 50], s3: [1200, 2500], s4: [800, 1800], s5: [150, 400],
    s6: [300, 800], s7: [10, 30], s8: [80, 200], s9: [150, 350], s10: [200, 450],
    s11: [50, 150], s12: [1000, 4000],
  };

  const BIMA = [
    { id: "b_ssk", name_bn: "স্বাস্থ্যসেবা কম্পোনেন্ট / সামাজিক নিরাপত্তা", name_en: "Social safety-net health cover",
      applies_bn: "নির্ধারিত সুবিধাভোগী কার্ড থাকলে সরকারি হাসপাতালে ভর্তি ও ওষুধে ছাড়।",
      cut_bn: "মূলত সরকারি হাসপাতালে প্রযোজ্য; বেসরকারিতে সাধারণত নয়।" },
    { id: "b_bid", name_bn: "বিমা বোর্ড নিয়ন্ত্রিত মেডিকেল ক্লেইম", name_en: "Regulated medical insurance claim",
      applies_bn: "ব্যক্তিগত/গ্রুপ মেডিকেল বিমা থাকলে হাসপাতাল ক্যাশ বা রিম্বার্সমেন্ট।",
      cut_bn: "পলিসির সীমা, রুম-ক্যাপ ও pre-authorization আগে জেনে নিন।" },
    { id: "b_ref", name_bn: "সরকারি রেফারেল", name_en: "Government referral",
      applies_bn: "উপজেলা/জেলা হাসপাতালের রেফারেল নিলে মেডিকেল কলেজে সস্তায় চিকিৎসা।",
      cut_bn: "রেফারেল ছাড়া বেসরকারি খাতে পুরো দাম দিতে হয়।" },
    { id: "b_corp", name_bn: "কর্পোরেট / চাকরির গ্রুপ পলিসি", name_en: "Employer group policy",
      applies_bn: "অফিসের বিমা কার্ড নিয়ে গেলে cashless বা তহবিল ফেরত।",
      cut_bn: "HR-এর কাছ থেকে নেটওয়ার্ক হাসপাতালের তালিকা আগে নিন।" },
    { id: "b_family", name_bn: "পরিবার / একই হাসপাতালের রোগী-ছাড়", name_en: "Family / repeat-patient discount",
      applies_bn: "একই পরিবারের একাধিক রোগী বা পুরনো রোগীর ফাইল থাকলে কিছু হাসপাতাল ছাড়ে।",
      cut_bn: "ভর্তির সময় জিজ্ঞেস করলে না জানা থাকে না।" },
    { id: "b_student", name_bn: "শিক্ষার্থী / প্রতিবন্ধী / মুক্তিযোদ্ধা ছাড়", name_en: "Student / disability / veteran concession",
      applies_bn: "প্রমাণপত্র থাকলে নির্দিষ্ট খাতে ছাড়ের নিয়ম আছে।",
      cut_bn: "কোন খাতে প্রযোজ্য (ভিজিট/ওয়ার্ড/ল্যাব) তা আলাদা করে জেনে নিন।" },
  ];

  /* Which extras usually appear on a Bangladeshi bill, in plain words. */
  const ANATOMY = [
    { part_bn: "ভিজিট / রেজিস্ট্রেশন", part_en: "Visit & registration", why_bn: "ডাক্তার দেখানোর ফি — টেস্টের দামের সাথে এর সম্পর্ক নেই।", why_en: "Consultation fee, unrelated to test prices." },
    { part_bn: "টেস্ট ও স্ক্যান", part_en: "Tests & scans", why_bn: "তালিকাভুক্ত মূল্য; কিন্তু কতগুলো টেস্ট করা হলো সেটাই খরচ নির্ধারণ করে।", why_en: "Listed prices, but the number of tests drives the total." },
    { part_bn: "ওয়ার্ড / কেবিন / আইসিইউ", part_en: "Ward / cabin / ICU", why_bn: "প্রতি দিন হিসেবে কাটে; রুম বদলালেই বিল বদলায়।", why_en: "Charged per day — the room choice changes everything." },
    { part_bn: "ওষুধ ও স্যালাইন", part_en: "Medicines & IVs", why_bn: "প্রায় সবসময় আনুমানিকের চেয়ে বেশি হয়, কারণ এটা ডাক্তারের প্রেসক্রিপশনে বদলায়।", why_en: "Usually higher than expected because it follows the prescription." },
    { part_bn: "অপারেশন ও অ্যানেসথেসিয়া", part_en: "Surgery & anaesthesia", why_bn: "সার্জারি হলে OT, অ্যানেসথেসিয়া ও সার্জনের ফি আলাদা তিনটি লাইন।", why_en: "Three separate lines: theatre, anaesthesia and surgeon." },
    { part_bn: "ইমপ্ল্যান্ট / কিট", part_en: "Implants & kits", why_bn: "ব্র্যান্ড অনুযায়ী দাম; বিলে ব্র্যান্ড ও সিরিয়াল লেখা থাকতে বাধ্য।", why_en: "Brand-dependent; the invoice should name the brand." },
    { part_bn: "নার্সিং ও consumables", part_en: "Nursing & consumables", why_bn: "সবচেয়ে অদৃশ্য অংশ — সেট, গ্লাভস, সিরিঞ্জ প্রতিদিন যোগ হয়।", why_en: "The least visible part — sets, gloves, syringes add up daily." },
    { part_bn: "ভ্যাট / সার্ভিস চার্জ", part_en: "VAT / service charge", why_bn: "কোন খাতে ভ্যাট পড়ে, কোন খাতে পড়ে না — সেটা আগে জেনে নিন।", why_en: "Ask which lines attract VAT before admission." },
  ];

  Object.assign(window.DB, {
    extras: EXTRAS,
    scenarios: SCENARIOS,
    govtService: GOVT_SERVICE,
    bima: BIMA,
    anatomy: ANATOMY,
    extraById: function (id) { return EXTRAS.find((x) => x.id === id) || null; },
    scenarioById: function (id) { return SCENARIOS.find((s) => s.id === id) || null; },
    /* low / typical / high for one extra under a given sector */
    extraRange: function (x, sector) {
      if (!x) return null;
      if (x.type === "percent") return { rate: x.rate, low: null, mid: null, high: null };
      const r = sector === "govt" ? x.govt : x.private;
      return { low: r[0], mid: Math.round((r[0] + r[1]) / 2), high: r[1] };
    },
    SAMPLE_FLAGS: SAMPLE,
  });
})();
