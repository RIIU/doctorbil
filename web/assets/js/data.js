/* DoctorBill — Sample dataset (DEVELOPMENT ONLY)
   Every record here is demo data and is explicitly marked is_sample=true.
   These must never be presented as verified real prices, counted as real
   hospital coverage, or emitted into structured data / public search.
   Underlying numeric values are kept accurate; presentation uses Bengali numerals. */

window.DB = (function () {
  "use strict";

  const SAMPLE = { is_sample: true, environment: "development", sample_label: "নমুনা ডেটা" };

  const categories = [
    { id: "c1", name_bn: "ডায়াগনস্টিক টেস্ট", name_en: "Diagnostic Tests", slug: "diagnostic-tests" },
    { id: "c2", name_bn: "ডাক্তার পরামর্শ", name_en: "Doctor Consultation", slug: "doctor-consultation" },
    { id: "c3", name_bn: "ইমেজিং", name_en: "Imaging", slug: "imaging" },
    { id: "c4", name_bn: "কার্ডিওলজি", name_en: "Cardiology", slug: "cardiology" },
    { id: "c5", name_bn: "প্যাথলজি", name_en: "Pathology", slug: "pathology" },
    { id: "c6", name_bn: "সার্জিকাল প্রসিডিউর", name_en: "Surgical Procedures", slug: "surgical-procedures" },
    { id: "c7", name_bn: "ফিজিওথেরাপি", name_en: "Physiotherapy", slug: "physiotherapy" },
  ];

  const services = [
    { id: "s1", name_bn: "সিবিপি / সিবিসি টেস্ট", name_en: "CBC Test", slug: "cbc-test", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["cbc", "সিবিসি", "complete blood count", "রক্ত পরীক্ষা"] },
    { id: "s2", name_bn: "রক্তে শর্করা (ফাস্টিং)", name_en: "Blood Sugar (Fasting)", slug: "blood-sugar-fasting", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["blood sugar", "গ্লুকোজ", "sugar test", "ডায়াবেটিস টেস্ট"] },
    { id: "s3", name_bn: "এমআরআই ব্রেন", name_en: "MRI Brain", slug: "mri-brain", category_id: "c3", unit: "প্রতি স্ক্যান", synonyms: ["mri", "এমআরআই", "brain mri", "মস্তিষ্ক স্ক্যান"] },
    { id: "s4", name_bn: "সিটি স্ক্যান", name_en: "CT Scan", slug: "ct-scan", category_id: "c3", unit: "প্রতি স্ক্যান", synonyms: ["ct", "সিটি", "ct scan", "কম্পিউটার টমোগ্রাফি"] },
    { id: "s5", name_bn: "আলট্রাসনোগ্রাম (ইউএসজি)", name_en: "USG", slug: "usg", category_id: "c3", unit: "প্রতি স্ক্যান", synonyms: ["usg", "ultrasound", "আলট্রাসাউন্ড", "সনো"] },
    { id: "s6", name_bn: "ইকোকার্ডিওগ্রাম", name_en: "Echocardiogram", slug: "echocardiogram", category_id: "c4", unit: "প্রতি টেস্ট", synonyms: ["echo", "ইকো", "echocardiogram", "হৃদপিণ্ড পরীক্ষা"] },
    { id: "s7", name_bn: "ডাক্তার পরামর্শ (মেডিসিন)", name_en: "Doctor Consultation", slug: "doctor-consultation", category_id: "c2", unit: "প্রতি ভিজিট", synonyms: ["consultation", "ডাক্তার", "doctor visit", "চিকিৎসক"] },
    { id: "s8", name_bn: "ইসিজি", name_en: "ECG", slug: "ecg", category_id: "c4", unit: "প্রতি টেস্ট", synonyms: ["ecg", "ইসিজি", "electrocardiogram"] },
    { id: "s9", name_bn: "বুক এক্স-রে", name_en: "Chest X-Ray", slug: "chest-xray", category_id: "c3", unit: "প্রতি স্ক্যান", synonyms: ["xray", "এক্সরে", "x-ray", "chest xray"] },
    { id: "s10", name_bn: "লিপিড প্রোফাইল", name_en: "Lipid Profile", slug: "lipid-profile", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["lipid", "কোলেস্টেরল", "cholesterol"] },
    { id: "s11", name_bn: "ফিজিওথেরাপি সেশন", name_en: "Physiotherapy Session", slug: "physiotherapy-session", category_id: "c7", unit: "প্রতি সেশন", synonyms: ["physio", "ফিজিও", "physiotherapy"] },
    { id: "s12", name_bn: "অ্যাপেন্ডিসেক্টমি", name_en: "Appendectomy", slug: "appendectomy", category_id: "c6", unit: "প্যাকেজ", synonyms: ["appendix", "অ্যাপেন্ডিক্স", "appendectomy"] },
  ];

  const hospitals = [
    { id: "h1", name_bn: "সেন্ট্রাল জেনারেল হাসপাতাল (নমুনা)", name_en: "Central General Hospital (Sample)", slug: "central-general-hospital", hospital_type: "বেসরকারি", address_bn: "বাড়ি ১২, সড়ক ৫, ধানমন্ডি, ঢাকা", city: "ঢাকা", area: "ধানমন্ডি", latitude: 23.746, longitude: 90.376, phone_masked: "০১৭XX-XXXXXX", website: null, status: "active", emergency_verified: false },
    { id: "h2", name_bn: "নগর মেডিকেল কলেজ হাসপাতাল (নমুনা)", name_en: "City Medical College Hospital (Sample)", slug: "city-medical-college", hospital_type: "মেডিকেল কলেজ", address_bn: "মিরপুর ১০, ঢাকা", city: "ঢাকা", area: "মিরপুর", latitude: 23.806, longitude: 90.368, phone_masked: "০১৮XX-XXXXXX", website: null, status: "active", emergency_verified: false },
    { id: "h3", name_bn: "সবুজবাগ ডায়াগনস্টিক সেন্টার (নমুনা)", name_en: "Sabujbag Diagnostic Centre (Sample)", slug: "sabujbag-diagnostic", hospital_type: "ডায়াগনস্টিক", address_bn: "সবুজবাগ, ঢাকা", city: "ঢাকা", area: "সবুজবাগ", latitude: 23.736, longitude: 90.425, phone_masked: "০১৯XX-XXXXXX", website: null, status: "active", emergency_verified: false },
    { id: "h4", name_bn: "উত্তরা মাতৃসদন হাসপাতাল (নমুনা)", name_en: "Uttara Maternity Hospital (Sample)", slug: "uttara-maternity", hospital_type: "বিশেষায়িত", address_bn: "সেক্টর ৭, উত্তরা, ঢাকা", city: "ঢাকা", area: "উত্তরা", latitude: 23.868, longitude: 90.396, phone_masked: "০১৬XX-XXXXXX", website: null, status: "active", emergency_verified: false },
    { id: "h5", name_bn: "চট্টগ্রাম সিটি হাসপাতাল (নমুনা)", name_en: "Chattogram City Hospital (Sample)", slug: "chattogram-city-hospital", hospital_type: "বেসরকারি", address_bn: "আগ্রাবাদ, চট্টগ্রাম", city: "চট্টগ্রাম", area: "আগ্রাবাদ", latitude: 22.331, longitude: 91.832, phone_masked: "০১৫XX-XXXXXX", website: null, status: "active", emergency_verified: false },
    { id: "h6", name_bn: "সিলেট মেডিকেল সেন্টার (নমুনা)", name_en: "Sylhet Medical Centre (Sample)", slug: "sylhet-medical-centre", hospital_type: "বেসরকারি", address_bn: "জিন্দাবাজার, সিলেট", city: "সিলেট", area: "জিন্দাবাজার", latitude: 24.894, longitude: 91.868, phone_masked: "০১৭XX-XXXXXX", website: null, status: "active", emergency_verified: false },
  ];

  const cities = ["ঢাকা", "চট্টগ্রাম", "সিলেট"];
  const hospitalTypes = ["বেসরকারি", "মেডিকেল কলেজ", "ডায়াগনস্টিক", "বিশেষায়িত"];

  /* verification_status: 'verified' | 'hospital_provided' | 'user_provided' | 'unverified' | 'unavailable'
     NOTE: no sample record is given 'verified' — sample data must never appear as a verified real price. */
  const P = (hospital_id, service_id, o) =>
    Object.assign({ hospital_id, service_id, currency: "BDT", price_amount: null, price_min: null, price_max: null,
      price_basis: "তালিকাভুক্ত মূল্য", inclusions: "", exclusions: "", source_type: "hospital_provided",
      source_reference: null, last_checked_at: "2026-09-20", effective_from: null,
      verification_status: "hospital_provided", verified_by: null }, SAMPLE, o);

  const prices = [
    P("h1", "s1", { price_amount: 700, verification_status: "hospital_provided", last_checked_at: "2026-09-25", inclusions: "নমুনা সংগ্রহ ও রিপোর্ট", exclusions: "ভিজিট ফি" }),
    P("h1", "s7", { price_min: 800, price_max: 1500, price_basis: "চিকিৎসকভেদে রেঞ্জ", verification_status: "hospital_provided", last_checked_at: "2026-09-18" }),
    P("h1", "s3", { price_amount: 8500, verification_status: "user_provided", source_type: "user_submission", last_checked_at: "2026-08-30", inclusions: "ব্রেইন স্ক্যান", exclusions: "কনট্রাস্ট ডাই আলাদা চার্জ হতে পারে" }),
    P("h1", "s5", { price_amount: 1200, verification_status: "hospital_provided", last_checked_at: "2026-09-22" }),
    P("h1", "s6", { price_amount: 2000, verification_status: "unverified", last_checked_at: "2026-07-11" }),
    P("h1", "s12", { price_min: 45000, price_max: 70000, price_basis: "প্যাকেজ (কেবিনভেদে)", verification_status: "hospital_provided", last_checked_at: "2026-09-05", inclusions: "অপারেশন, কাটা সেলাই", exclusions: "ওষুধ, কেবিন চার্জ, টেস্ট" }),

    P("h2", "s1", { price_amount: 450, verification_status: "hospital_provided", last_checked_at: "2026-09-27" }),
    P("h2", "s2", { price_amount: 250, verification_status: "hospital_provided", last_checked_at: "2026-09-27" }),
    P("h2", "s7", { price_amount: 600, verification_status: "hospital_provided", last_checked_at: "2026-09-15" }),
    P("h2", "s4", { price_amount: 6000, verification_status: "unverified", last_checked_at: "2026-06-20" }),
    P("h2", "s8", { price_amount: 500, verification_status: "hospital_provided", last_checked_at: "2026-09-10" }),
    P("h2", "s9", { price_amount: 400, verification_status: "hospital_provided", last_checked_at: "2026-09-12" }),
    P("h2", "s11", { price_amount: 800, price_basis: "প্রতি সেশন", verification_status: "hospital_provided", last_checked_at: "2026-09-01" }),

    P("h3", "s1", { price_amount: 600, verification_status: "user_provided", source_type: "user_submission", last_checked_at: "2026-09-19" }),
    P("h3", "s2", { price_amount: 200, verification_status: "hospital_provided", last_checked_at: "2026-09-24" }),
    P("h3", "s5", { price_amount: 1000, verification_status: "hospital_provided", last_checked_at: "2026-09-21" }),
    P("h3", "s10", { price_amount: 1100, verification_status: "hospital_provided", last_checked_at: "2026-09-08" }),
    P("h3", "s9", { price_amount: 350, verification_status: "unverified", last_checked_at: "2026-05-30" }),

    P("h4", "s7", { price_min: 1000, price_max: 2000, price_basis: "চিকিৎসকভেদে রেঞ্জ", verification_status: "hospital_provided", last_checked_at: "2026-09-14" }),
    P("h4", "s5", { price_amount: 1400, verification_status: "hospital_provided", last_checked_at: "2026-09-16" }),
    P("h4", "s6", { price_amount: 2200, verification_status: "hospital_provided", last_checked_at: "2026-09-02" }),
    P("h4", "s3", { price_min: 9000, price_max: 12000, price_basis: "কনট্রাস্টসহ/ছাড়া", verification_status: "unverified", last_checked_at: "2026-08-01" }),

    P("h5", "s1", { price_amount: 550, verification_status: "hospital_provided", last_checked_at: "2026-09-23" }),
    P("h5", "s4", { price_amount: 5500, verification_status: "hospital_provided", last_checked_at: "2026-09-09" }),
    P("h5", "s7", { price_amount: 700, verification_status: "hospital_provided", last_checked_at: "2026-09-11" }),
    P("h5", "s12", { price_min: 40000, price_max: 60000, price_basis: "প্যাকেজ", verification_status: "hospital_provided", last_checked_at: "2026-08-25", exclusions: "ওষুধ ও কেবিন চার্জ" }),

    P("h6", "s2", { price_amount: 220, verification_status: "hospital_provided", last_checked_at: "2026-09-20" }),
    P("h6", "s7", { price_amount: 500, verification_status: "hospital_provided", last_checked_at: "2026-09-13" }),
    P("h6", "s10", { price_amount: 1000, verification_status: "user_provided", source_type: "user_submission", last_checked_at: "2026-08-18" }),
    // A service with no usable price at a hospital:
    P("h6", "s3", { price_amount: null, price_min: null, price_max: null, verification_status: "unavailable", last_checked_at: null }),
  ];

  /* ---- Hospital directory (search hints only) ----
     Real, well-known hospitals across Bangladesh used ONLY to power search
     autocomplete. They carry no price records, and no address/phone is invented.
     Selecting one shows a "no data yet" state rather than fabricated details. */
  const _dir = [
    ["বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়", "Bangabandhu Sheikh Mujib Medical University", "ঢাকা", "শাহবাগ", "সরকারি"],
    ["ঢাকা মেডিকেল কলেজ হাসপাতাল", "Dhaka Medical College Hospital", "ঢাকা", "লালবাগ", "সরকারি"],
    ["স্যার সলিমুল্লাহ মেডিকেল কলেজ হাসপাতাল (মিটফোর্ড)", "Sir Salimullah Medical College Hospital", "ঢাকা", "লালবাগ", "সরকারি"],
    ["শহীদ সোহরাওয়ার্দী মেডিকেল কলেজ হাসপাতাল", "Shaheed Suhrawardy Medical College Hospital", "ঢাকা", "শেরেবাংলা নগর", "সরকারি"],
    ["জাতীয় হৃদরোগ ইনস্টিটিউট ও হাসপাতাল", "National Institute of Cardiovascular Diseases", "ঢাকা", "শেরেবাংলা নগর", "সরকারি"],
    ["জাতীয় কিডনি রোগ ইনস্টিটিউট ও হাসপাতাল", "National Institute of Kidney Diseases", "ঢাকা", "শেরেবাংলা নগর", "সরকারি"],
    ["জাতীয় স্নায়ুবিজ্ঞান ইনস্টিটিউট ও হাসপাতাল", "National Institute of Neurosciences", "ঢাকা", "আগারগাঁও", "সরকারি"],
    ["জাতীয় ক্যান্সার গবেষণা ও চিকিৎসা ইনস্টিটিউট", "National Institute of Cancer Research and Hospital", "ঢাকা", "মহাখালী", "সরকারি"],
    ["জাতীয় অর্থোপেডিক হাসপাতাল ও পুনর্বাসন প্রতিষ্ঠান (নিটোর)", "NITOR Orthopaedic Hospital", "ঢাকা", "শেরেবাংলা নগর", "সরকারি"],
    ["জাতীয় বক্ষব্যাধি ইনস্টিটিউট ও হাসপাতাল", "National Institute of Diseases of the Chest", "ঢাকা", "মহাখালী", "সরকারি"],
    ["জাতীয় মানসিক স্বাস্থ্য ইনস্টিটিউট", "National Institute of Mental Health", "ঢাকা", "শেরেবাংলা নগর", "সরকারি"],
    ["জাতীয় নাক-কান-গলা ইনস্টিটিউট ও হাসপাতাল", "National ENT Institute", "ঢাকা", "তেজগাঁও", "সরকারি"],
    ["জাতীয় চক্ষু বিজ্ঞান ইনস্টিটিউট ও হাসপাতাল", "National Institute of Ophthalmology", "ঢাকা", "শেরেবাংলা নগর", "সরকারি"],
    ["বারডেম জেনারেল হাসপাতাল", "BIRDEM General Hospital", "ঢাকা", "শাহবাগ", "বিশেষায়িত"],
    ["হলি ফ্যামিলি রেড ক্রিসেন্ট মেডিকেল কলেজ হাসপাতাল", "Holy Family Red Crescent Medical College Hospital", "ঢাকা", "এস্কাটন", "বেসরকারি"],
    ["ঢাকা শিশু হাসপাতাল", "Dhaka Shishu Hospital", "ঢাকা", "শ্যামলী", "বিশেষায়িত"],
    ["স্কয়ার হাসপাতাল", "Square Hospital", "ঢাকা", "পশ্চিম পান্থপথ", "বেসরকারি"],
    ["ইউনাইটেড হাসপাতাল", "United Hospital Limited", "ঢাকা", "গুলশান", "বেসরকারি"],
    ["এভারকেয়ার হাসপাতাল ঢাকা", "Evercare Hospital Dhaka", "ঢাকা", "বসুন্ধরা", "বেসরকারি"],
    ["ইবনে সিনা হাসপাতাল", "Ibn Sina Hospital", "ঢাকা", "ধানমন্ডি", "বেসরকারি"],
    ["ইবনে সিনা মেডিকেল কলেজ হাসপাতাল", "Ibn Sina Medical College Hospital", "ঢাকা", "কল্যাণপুর", "মেডিকেল কলেজ"],
    ["ল্যাবএইড স্পেশালাইজড হাসপাতাল", "Labaid Specialized Hospital", "ঢাকা", "ধানমন্ডি", "বেসরকারি"],
    ["পপুলার ডায়াগনস্টিক সেন্টার", "Popular Diagnostic Centre", "ঢাকা", "ধানমন্ডি", "ডায়াগনস্টিক"],
    ["আসগর আলী হাসপাতাল", "Asgar Ali Hospital", "ঢাকা", "গান্ডারিয়া", "বেসরকারি"],
    ["এনাম মেডিকেল কলেজ হাসপাতাল", "Enam Medical College Hospital", "ঢাকা", "সাভার", "মেডিকেল কলেজ"],
    ["গণস্বাস্থ্য নগর হাসপাতাল", "Gonoshasthaya Nagar Hospital", "ঢাকা", "ধানমন্ডি", "বেসরকারি"],
    ["আনোয়ার খান মডার্ন হাসপাতাল", "Anwar Khan Modern Hospital", "ঢাকা", "লালবাগ", "বেসরকারি"],
    ["গ্রীন লাইফ মেডিকেল কলেজ হাসপাতাল", "Green Life Medical College Hospital", "ঢাকা", "ধানমন্ডি", "মেডিকেল কলেজ"],
    ["ডেল্টা মেডিকেল কলেজ হাসপাতাল", "Delta Medical College Hospital", "ঢাকা", "মিরপুর", "মেডিকেল কলেজ"],
    ["বাংলাদেশ মেডিকেল কলেজ হাসপাতাল", "Bangladesh Medical College Hospital", "ঢাকা", "ধানমন্ডি", "মেডিকেল কলেজ"],
    ["আদ-দ্বীন হাসপাতাল", "Ad-din Foundation Hospital", "ঢাকা", "মগবাজার", "বেসরকারি"],
    ["আদ-দ্বীন উইমেন্স মেডিকেল কলেজ হাসপাতাল", "Ad-din Women's Medical College Hospital", "ঢাকা", "শান্তিনগর", "মেডিকেল কলেজ"],
    ["সেন্ট্রাল হাসপাতাল", "Central Hospital Limited", "ঢাকা", "এলিফ্যান্ট রোড", "বেসরকারি"],
    ["মনোয়ারা হাসপাতাল", "Monowara Hospital", "ঢাকা", "শান্তিনগর", "বেসরকারি"],
    ["জাপান বাংলাদেশ ফ্রেন্ডশিপ হাসপাতাল", "Japan Bangladesh Friendship Hospital", "ঢাকা", "উত্তরা", "বেসরকারি"],
    ["সম্মিলিত সামরিক হাসপাতাল (সিএমএইচ) ঢাকা", "Combined Military Hospital Dhaka", "ঢাকা", "ঢাকা সেনানিবাস", "সরকারি"],
    ["ন্যাশনাল হার্ট ফাউন্ডেশন হাসপাতাল", "National Heart Foundation Hospital", "ঢাকা", "আগারগাঁও", "বিশেষায়িত"],
    ["বাংলাদেশ কিডনি ফাউন্ডেশন হাসপাতাল", "Bangladesh Kidney Foundation Hospital", "ঢাকা", "আগারগাঁও", "বিশেষায়িত"],
    ["আল-ফাতাহ ল্যাবরেটরি", "Al-Fatah Laboratory", "ঢাকা", "মিরপুর", "ডায়াগনস্টিক"],
    ["চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল", "Chattogram Medical College Hospital", "চট্টগ্রাম", "চকবাজার", "সরকারি"],
    ["এভারকেয়ার হাসপাতাল চট্টগ্রাম", "Evercare Hospital Chattogram", "চট্টগ্রাম", "নাসিরাবাদ", "বেসরকারি"],
    ["ইম্পেরিয়াল হাসপাতাল চট্টগ্রাম", "Imperial Hospital Limited", "চট্টগ্রাম", "পাঁচলাইশ", "বেসরকারি"],
    ["চিটাগাং মেট্রোপলিটন হাসপাতাল", "Chattogram Metropolitan Hospital", "চট্টগ্রাম", "", "বেসরকারি"],
    ["সিএমএইচ চট্টগ্রাম", "Combined Military Hospital Chattogram", "চট্টগ্রাম", "সেনানিবাস", "সরকারি"],
    ["বাংলাদেশ ইনস্টিটিউট অব ট্রপিক্যাল মেডিসিন", "Bangladesh Institute of Tropical Medicine", "চট্টগ্রাম", "ফয়জলালী", "সরকারি"],
    ["সিলেট এমএজি ওসমানী মেডিকেল কলেজ হাসপাতাল", "Sylhet MAG Osmani Medical College Hospital", "সিলেট", "", "সরকারি"],
    ["মাউন্ট আদোরা হাসপাতাল", "Mount Adora Hospital", "সিলেট", "", "বেসরকারি"],
    ["ইবনে সিনা হাসপাতাল সিলেট", "Ibn Sina Hospital Sylhet", "সিলেট", "", "বেসরকারি"],
    ["নর্থ ইস্ট মেডিকেল কলেজ হাসপাতাল", "North East Medical College Hospital", "সিলেট", "", "মেডিকেল কলেজ"],
    ["জালালাবাদ রাগীব-রাবেয়া মেডিকেল কলেজ হাসপাতাল", "Jalalabad Ragib-Rabeya Medical College Hospital", "সিলেট", "", "মেডিকেল কলেজ"],
    ["সিলেট উইমেন্স মেডিকেল কলেজ হাসপাতাল", "Sylhet Women's Medical College Hospital", "সিলেট", "", "মেডিকেল কলেজ"],
    ["রাজশাহী মেডিকেল কলেজ হাসপাতাল", "Rajshahi Medical College Hospital", "রাজশাহী", "", "সরকারি"],
    ["পপুলার ডায়াগনস্টিক সেন্টার রাজশাহী", "Popular Diagnostic Centre Rajshahi", "রাজশাহী", "", "ডায়াগনস্টিক"],
    ["খুলনা মেডিকেল কলেজ হাসপাতাল", "Khulna Medical College Hospital", "খুলনা", "", "সরকারি"],
    ["খুলনা সিটি মেডিকেল কলেজ হাসপাতাল", "Khulna City Medical College Hospital", "খুলনা", "", "বেসরকারি"],
    ["শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল", "Shaheed Ziaur Rahman Medical College Hospital", "বগুড়া", "", "সরকারি"],
    ["টিএমএ মেডিকেল কলেজ হাসপাতাল", "T M A Medical College Hospital", "বগুড়া", "", "মেডিকেল কলেজ"],
    ["কুমিল্লা মেডিকেল কলেজ হাসপাতাল", "Cumilla Medical College Hospital", "কুমিল্লা", "", "সরকারি"],
    ["শের-ই-বাংলা মেডিকেল কলেজ হাসপাতাল", "Sher-e-Bangla Medical College Hospital", "বরিশাল", "", "সরকারি"],
    ["রংপুর মেডিকেল কলেজ হাসপাতাল", "Rangpur Medical College Hospital", "রংপুর", "", "সরকারি"],
    ["ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল", "Mymensingh Medical College Hospital", "ময়মনসিংহ", "", "সরকারি"],
    ["ফরিদপুর মেডিকেল কলেজ হাসপাতাল", "Faridpur Medical College Hospital", "ফরিদপুর", "", "সরকারি"],
    ["এম আব্দুর রহিম মেডিকেল কলেজ হাসপাতাল", "M Abdur Rahim Medical College Hospital", "দিনাজপুর", "", "সরকারি"],
    ["কক্সবাজার সদর হাসপাতাল", "Cox's Bazar Sadar Hospital", "কক্সবাজার", "", "সরকারি"],
    ["কুমুদিনী হাসপাতাল", "Kumudini Hospital", "টাঙ্গাইল", "", "বেসরকারি"],
    ["নারায়ণগঞ্জ জেনারেল হাসপাতাল", "Narayanganj General Hospital", "নারায়ণগঞ্জ", "", "সরকারি"],
    ["শহীদ তাজউদ্দীন আহমদ মেডিকেল কলেজ হাসপাতাল", "Shaheed Tajuddin Ahmad Medical College Hospital", "গাজীপুর", "", "সরকারি"],

    /* --- Additional Dhaka specialised / private (well-known) --- */
    ["মুগদা মেডিকেল কলেজ হাসপাতাল", "Mugda Medical College Hospital", "ঢাকা", "মুগদা", "সরকারি"],
    ["কুর্মিটোলা জেনারেল হাসপাতাল", "Kurmitola General Hospital", "ঢাকা", "কুর্মিটোলা", "সরকারি"],
    ["ইব্রাহিম কার্ডিয়াক হাসপাতাল", "Ibrahim Cardiac Hospital", "ঢাকা", "শাহবাগ", "বিশেষায়িত"],
    ["শেখ রাসেল গ্যাস্ট্রোলিভার হাসপাতাল ও ইনস্টিটিউট", "Sheikh Russel Gastro Liver Hospital and Institute", "ঢাকা", "মহাখালী", "বিশেষায়িত"],
    ["সমরিতা হাসপাতাল", "Samorita Hospital Limited", "ঢাকা", "পান্থপথ", "বেসরকারি"],
    ["ইসলামী ব্যাংক হাসপাতাল", "Islami Bank Hospital Limited", "ঢাকা", "মতিঝিল", "বেসরকারি"],
    ["বাংলাদেশ স্পেশালাইজড হাসপাতাল", "Bangladesh Specialized Hospital", "ঢাকা", "ধানমন্ডি", "বেসরকারি"],
    ["সেন্ট্রাল উইমেন্স মেডিকেল কলেজ হাসপাতাল", "Central Women's Medical College Hospital", "ঢাকা", "এস্কাটন", "মেডিকেল কলেজ"],
    ["চট্টগ্রাম ম্যাক্স হাসপাতাল", "Chattogram Max Hospital", "চট্টগ্রাম", "", "বেসরকারি"],

    /* --- District General (Sadar) Hospitals — one per district, all real govt facilities --- */
    ["গাজীপুর জেনারেল হাসপাতাল", "Gazipur General Hospital", "গাজীপুর", "", "সরকারি"],
    ["নরসিংদী জেনারেল হাসপাতাল", "Narsingdi General Hospital", "নরসিংদী", "", "সরকারি"],
    ["মুন্সিগঞ্জ জেনারেল হাসপাতাল", "Munshiganj General Hospital", "মুন্সিগঞ্জ", "", "সরকারি"],
    ["রাজবাড়ী জেনারেল হাসপাতাল", "Rajbari General Hospital", "রাজবাড়ী", "", "সরকারি"],
    ["ফরিদপুর জেনারেল হাসপাতাল", "Faridpur General Hospital", "ফরিদপুর", "", "সরকারি"],
    ["গোপালগঞ্জ জেনারেল হাসপাতাল", "Gopalganj General Hospital", "গোপালগঞ্জ", "", "সরকারি"],
    ["শরীয়তপুর জেনারেল হাসপাতাল", "Shariatpur General Hospital", "শরীয়তপুর", "", "সরকারি"],
    ["মাদারীপুর জেনারেল হাসপাতাল", "Madaripur General Hospital", "মাদারীপুর", "", "সরকারি"],
    ["মানিকগঞ্জ জেনারেল হাসপাতাল", "Manikganj General Hospital", "মানিকগঞ্জ", "", "সরকারি"],
    ["টাঙ্গাইল জেনারেল হাসপাতাল", "Tangail General Hospital", "টাঙ্গাইল", "", "সরকারি"],
    ["কিশোরগঞ্জ জেনারেল হাসপাতাল", "Kishoreganj General Hospital", "কিশোরগঞ্জ", "", "সরকারি"],
    ["ময়মনসিংহ জেনারেল হাসপাতাল", "Mymensingh General Hospital", "ময়মনসিংহ", "", "সরকারি"],
    ["জামালপুর জেনারেল হাসপাতাল", "Jamalpur General Hospital", "জামালপুর", "", "সরকারি"],
    ["শেরপুর জেনারেল হাসপাতাল", "Sherpur General Hospital", "শেরপুর", "", "সরকারি"],
    ["নেত্রকোণা জেনারেল হাসপাতাল", "Netrokona General Hospital", "নেত্রকোণা", "", "সরকারি"],
    ["কুমিল্লা জেনারেল হাসপাতাল", "Cumilla General Hospital", "কুমিল্লা", "", "সরকারি"],
    ["চাঁদপুর জেনারেল হাসপাতাল", "Chandpur General Hospital", "চাঁদপুর", "", "সরকারি"],
    ["ব্রাহ্মণবাড়িয়া জেনারেল হাসপাতাল", "Brahmanbaria General Hospital", "ব্রাহ্মণবাড়িয়া", "", "সরকারি"],
    ["ফেনী জেনারেল হাসপাতাল", "Feni General Hospital", "ফেনী", "", "সরকারি"],
    ["নোয়াখালী জেনারেল হাসপাতাল", "Noakhali General Hospital", "নোয়াখালী", "", "সরকারি"],
    ["লক্ষ্মীপুর জেনারেল হাসপাতাল", "Lakshmipur General Hospital", "লক্ষ্মীপুর", "", "সরকারি"],
    ["বান্দরবান জেনারেল হাসপাতাল", "Bandarban General Hospital", "বান্দরবান", "", "সরকারি"],
    ["রাঙ্গামাটি জেনারেল হাসপাতাল", "Rangamati General Hospital", "রাঙ্গামাটি", "", "সরকারি"],
    ["খাগড়াছড়ি জেনারেল হাসপাতাল", "Khagrachhari General Hospital", "খাগড়াছড়ি", "", "সরকারি"],
    ["মৌলভীবাজার জেনারেল হাসপাতাল", "Moulvibazar General Hospital", "মৌলভীবাজার", "", "সরকারি"],
    ["হবিগঞ্জ জেনারেল হাসপাতাল", "Habiganj General Hospital", "হবিগঞ্জ", "", "সরকারি"],
    ["সুনামগঞ্জ জেনারেল হাসপাতাল", "Sunamganj General Hospital", "সুনামগঞ্জ", "", "সরকারি"],
    ["রাজশাহী জেনারেল হাসপাতাল", "Rajshahi General Hospital", "রাজশাহী", "", "সরকারি"],
    ["চাঁপাইনবাবগঞ্জ জেনারেল হাসপাতাল", "Chapainawabganj General Hospital", "চাঁপাইনবাবগঞ্জ", "", "সরকারি"],
    ["নওগাঁ জেনারেল হাসপাতাল", "Naogaon General Hospital", "নওগাঁ", "", "সরকারি"],
    ["জয়পুরহাট জেনারেল হাসপাতাল", "Joypurhat General Hospital", "জয়পুরহাট", "", "সরকারি"],
    ["বগুড়া জেনারেল হাসপাতাল", "Bogura General Hospital", "বগুড়া", "", "সরকারি"],
    ["সিরাজগঞ্জ জেনারেল হাসপাতাল", "Sirajganj General Hospital", "সিরাজগঞ্জ", "", "সরকারি"],
    ["পাবনা জেনারেল হাসপাতাল", "Pabna General Hospital", "পাবনা", "", "সরকারি"],
    ["নাটোর জেনারেল হাসপাতাল", "Natore General Hospital", "নাটোর", "", "সরকারি"],
    ["রংপুর জেনারেল হাসপাতাল", "Rangpur General Hospital", "রংপুর", "", "সরকারি"],
    ["দিনাজপুর জেনারেল হাসপাতাল", "Dinajpur General Hospital", "দিনাজপুর", "", "সরকারি"],
    ["ঠাকুরগাঁও জেনারেল হাসপাতাল", "Thakurgaon General Hospital", "ঠাকুরগাঁও", "", "সরকারি"],
    ["পঞ্চগড় জেনারেল হাসপাতাল", "Panchagarh General Hospital", "পঞ্চগড়", "", "সরকারি"],
    ["নীলফামারী জেনারেল হাসপাতাল", "Nilphamari General Hospital", "নীলফামারী", "", "সরকারি"],
    ["লালমনিরহাট জেনারেল হাসপাতাল", "Lalmonirhat General Hospital", "লালমনিরহাট", "", "সরকারি"],
    ["কুড়িগ্রাম জেনারেল হাসপাতাল", "Kurigram General Hospital", "কুড়িগ্রাম", "", "সরকারি"],
    ["গাইবান্ধা জেনারেল হাসপাতাল", "Gaibandha General Hospital", "গাইবান্ধা", "", "সরকারি"],
    ["খুলনা জেনারেল হাসপাতাল", "Khulna General Hospital", "খুলনা", "", "সরকারি"],
    ["বাগেরহাট জেনারেল হাসপাতাল", "Bagerhat General Hospital", "বাগেরহাট", "", "সরকারি"],
    ["সাতক্ষীরা জেনারেল হাসপাতাল", "Satkhira General Hospital", "সাতক্ষীরা", "", "সরকারি"],
    ["যশোর জেনারেল হাসপাতাল", "Jashore General Hospital", "যশোর", "", "সরকারি"],
    ["ঝিনাইদহ জেনারেল হাসপাতাল", "Jhenaidah General Hospital", "ঝিনাইদহ", "", "সরকারি"],
    ["মাগুরা জেনারেল হাসপাতাল", "Magura General Hospital", "মাগুরা", "", "সরকারি"],
    ["নড়াইল জেনারেল হাসপাতাল", "Narail General Hospital", "নড়াইল", "", "সরকারি"],
    ["কুষ্টিয়া জেনারেল হাসপাতাল", "Kushtia General Hospital", "কুষ্টিয়া", "", "সরকারি"],
    ["চুয়াডাঙ্গা জেনারেল হাসপাতাল", "Chuadanga General Hospital", "চুয়াডাঙ্গা", "", "সরকারি"],
    ["মেহেরপুর জেনারেল হাসপাতাল", "Meherpur General Hospital", "মেহেরপুর", "", "সরকারি"],
    ["বরিশাল জেনারেল হাসপাতাল", "Barishal General Hospital", "বরিশাল", "", "সরকারি"],
    ["বরগুনা জেনারেল হাসপাতাল", "Barguna General Hospital", "বরগুনা", "", "সরকারি"],
    ["পটুয়াখালী জেনারেল হাসপাতাল", "Patuakhali General Hospital", "পটুয়াখালী", "", "সরকারি"],
    ["ভোলা জেনারেল হাসপাতাল", "Bhola General Hospital", "ভোলা", "", "সরকারি"],
    ["পিরোজপুর জেনারেল হাসপাতাল", "Pirojpur General Hospital", "পিরোজপুর", "", "সরকারি"],
    ["ঝালকাঠি জেনারেল হাসপাতাল", "Jhalokati General Hospital", "ঝালকাঠি", "", "সরকারি"],

    /* --- District Government Medical College Hospitals (real, govt-run) --- */
    ["শহীদ সৈয়দ নজরুল ইসলাম মেডিকেল কলেজ হাসপাতাল", "Shaheed Syed Nazrul Islam Medical College Hospital", "কিশোরগঞ্জ", "", "সরকারি"],
    ["শেখ হাসিনা মেডিকেল কলেজ হাসপাতাল গোপালগঞ্জ", "Sheikh Hasina Medical College Hospital Gopalganj", "গোপালগঞ্জ", "", "সরকারি"],
    ["শেখ হাসিনা মেডিকেল কলেজ হাসপাতাল হবিগঞ্জ", "Sheikh Hasina Medical College Hospital Habiganj", "হবিগঞ্জ", "", "সরকারি"],
    ["শেখ হাসিনা মেডিকেল কলেজ হাসপাতাল খুলনা", "Sheikh Hasina Medical College Hospital Khulna", "খুলনা", "", "সরকারি"],
    ["শেখ হাসিনা মেডিকেল কলেজ হাসপাতাল যশোর", "Sheikh Hasina Medical College Hospital Jashore", "যশোর", "", "সরকারি"],
    ["শেখ হাসিনা মেডিকেল কলেজ হাসপাতাল জামালপুর", "Sheikh Hasina Medical College Hospital Jamalpur", "জামালপুর", "", "সরকারি"],
    ["শেখ হাসিনা মেডিকেল কলেজ হাসপাতাল কক্সবাজার", "Sheikh Hasina Medical College Hospital Cox's Bazar", "কক্সবাজার", "", "সরকারি"],
    ["শেখ হাসিনা মেডিকেল কলেজ হাসপাতাল নওগাঁ", "Sheikh Hasina Medical College Hospital Naogaon", "নওগাঁ", "", "সরকারি"],
    ["শেখ হাসিনা মেডিকেল কলেজ হাসপাতাল টাঙ্গাইল", "Sheikh Hasina Medical College Hospital Tangail", "টাঙ্গাইল", "", "সরকারি"],
    ["আব্দুল মালেক উকিল মেডিকেল কলেজ হাসপাতাল", "Abdul Malek Ukil Medical College Hospital", "নোয়াখালী", "", "সরকারি"],
    ["নোয়াখালী মেডিকেল কলেজ হাসপাতাল", "Noakhali Medical College Hospital", "নোয়াখালী", "", "সরকারি"],
    ["চাঁদপুর মেডিকেল কলেজ হাসপাতাল", "Chandpur Medical College Hospital", "চাঁদপুর", "", "সরকারি"],
    ["ব্রাহ্মণবাড়িয়া মেডিকেল কলেজ হাসপাতাল", "Brahmanbaria Medical College Hospital", "ব্রাহ্মণবাড়িয়া", "", "সরকারি"],
    ["ফেনী মেডিকেল কলেজ হাসপাতাল", "Feni Medical College Hospital", "ফেনী", "", "সরকারি"],
    ["লক্ষ্মীপুর মেডিকেল কলেজ হাসপাতাল", "Lakshmipur Medical College Hospital", "লক্ষ্মীপুর", "", "সরকারি"],
    ["জামালপুর মেডিকেল কলেজ হাসপাতাল", "Jamalpur Medical College Hospital", "জামালপুর", "", "সরকারি"],
    ["টাঙ্গাইল মেডিকেল কলেজ হাসপাতাল", "Tangail Medical College Hospital", "টাঙ্গাইল", "", "সরকারি"],
    ["মানিকগঞ্জ মেডিকেল কলেজ হাসপাতাল", "Manikganj Medical College Hospital", "মানিকগঞ্জ", "", "সরকারি"],
    ["মুন্সিগঞ্জ মেডিকেল কলেজ হাসপাতাল", "Munshiganj Medical College Hospital", "মুন্সিগঞ্জ", "", "সরকারি"],
    ["নারায়ণগঞ্জ মেডিকেল কলেজ হাসপাতাল", "Narayanganj Medical College Hospital", "নারায়ণগঞ্জ", "", "সরকারি"],
    ["রাজবাড়ী মেডিকেল কলেজ হাসপাতাল", "Rajbari Medical College Hospital", "রাজবাড়ী", "", "সরকারি"],
    ["শরীয়তপুর মেডিকেল কলেজ হাসপাতাল", "Shariatpur Medical College Hospital", "শরীয়তপুর", "", "সরকারি"],
    ["মাদারীপুর মেডিকেল কলেজ হাসপাতাল", "Madaripur Medical College Hospital", "মাদারীপুর", "", "সরকারি"],
    ["নেত্রকোণা মেডিকেল কলেজ হাসপাতাল", "Netrokona Medical College Hospital", "নেত্রকোণা", "", "সরকারি"],
    ["শেরপুর মেডিকেল কলেজ হাসপাতাল", "Sherpur Medical College Hospital", "শেরপুর", "", "সরকারি"],
    ["নড়াইল মেডিকেল কলেজ হাসপাতাল", "Narail Medical College Hospital", "নড়াইল", "", "সরকারি"],
    ["মাগুরা মেডিকেল কলেজ হাসপাতাল", "Magura Medical College Hospital", "মাগুরা", "", "সরকারি"],
    ["ঝিনাইদহ মেডিকেল কলেজ হাসপাতাল", "Jhenaidah Medical College Hospital", "ঝিনাইদহ", "", "সরকারি"],
    ["কুষ্টিয়া মেডিকেল কলেজ হাসপাতাল", "Kushtia Medical College Hospital", "কুষ্টিয়া", "", "সরকারি"],
    ["চুয়াডাঙ্গা মেডিকেল কলেজ হাসপাতাল", "Chuadanga Medical College Hospital", "চুয়াডাঙ্গা", "", "সরকারি"],
    ["মেহেরপুর মেডিকেল কলেজ হাসপাতাল", "Meherpur Medical College Hospital", "মেহেরপুর", "", "সরকারি"],
    ["যশোর মেডিকেল কলেজ হাসপাতাল", "Jashore Medical College Hospital", "যশোর", "", "সরকারি"],
    ["সাতক্ষীরা মেডিকেল কলেজ হাসপাতাল", "Satkhira Medical College Hospital", "সাতক্ষীরা", "", "সরকারি"],
    ["বাগেরহাট মেডিকেল কলেজ হাসপাতাল", "Bagerhat Medical College Hospital", "বাগেরহাট", "", "সরকারি"],
    ["পাবনা মেডিকেল কলেজ হাসপাতাল", "Pabna Medical College Hospital", "পাবনা", "", "সরকারি"],
    ["জয়পুরহাট মেডিকেল কলেজ হাসপাতাল", "Joypurhat Medical College Hospital", "জয়পুরহাট", "", "সরকারি"],
    ["নওগাঁ মেডিকেল কলেজ হাসপাতাল", "Naogaon Medical College Hospital", "নওগাঁ", "", "সরকারি"],
    ["সিরাজগঞ্জ মেডিকেল কলেজ হাসপাতাল", "Sirajganj Medical College Hospital", "সিরাজগঞ্জ", "", "সরকারি"],
    ["ঠাকুরগাঁও মেডিকেল কলেজ হাসপাতাল", "Thakurgaon Medical College Hospital", "ঠাকুরগাঁও", "", "সরকারি"],
    ["পঞ্চগড় মেডিকেল কলেজ হাসপাতাল", "Panchagarh Medical College Hospital", "পঞ্চগড়", "", "সরকারি"],
    ["নীলফামারী মেডিকেল কলেজ হাসপাতাল", "Nilphamari Medical College Hospital", "নীলফামারী", "", "সরকারি"],
    ["লালমনিরহাট মেডিকেল কলেজ হাসপাতাল", "Lalmonirhat Medical College Hospital", "লালমনিরহাট", "", "সরকারি"],
    ["কুড়িগ্রাম মেডিকেল কলেজ হাসপাতাল", "Kurigram Medical College Hospital", "কুড়িগ্রাম", "", "সরকারি"],
    ["গাইবান্ধা মেডিকেল কলেজ হাসপাতাল", "Gaibandha Medical College Hospital", "গাইবান্ধা", "", "সরকারি"],
    ["দিনাজপুর মেডিকেল কলেজ হাসপাতাল", "Dinajpur Medical College Hospital", "দিনাজপুর", "", "সরকারি"],
    ["বরগুনা মেডিকেল কলেজ হাসপাতাল", "Barguna Medical College Hospital", "বরগুনা", "", "সরকারি"],
    ["পটুয়াখালী মেডিকেল কলেজ হাসপাতাল", "Patuakhali Medical College Hospital", "পটুয়াখালী", "", "সরকারি"],
    ["ভোলা মেডিকেল কলেজ হাসপাতাল", "Bhola Medical College Hospital", "ভোলা", "", "সরকারি"],
    ["ঝালকাঠি মেডিকেল কলেজ হাসপাতাল", "Jhalokati Medical College Hospital", "ঝালকাঠি", "", "সরকারি"],
    ["পিরোজপুর মেডিকেল কলেজ হাসপাতাল", "Pirojpur Medical College Hospital", "পিরোজপুর", "", "সরকারি"],
    ["মৌলভীবাজার মেডিকেল কলেজ হাসপাতাল", "Moulvibazar Medical College Hospital", "মৌলভীবাজার", "", "সরকারি"],
    ["সুনামগঞ্জ মেডিকেল কলেজ হাসপাতাল", "Sunamganj Medical College Hospital", "সুনামগঞ্জ", "", "সরকারি"],
    ["হবিগঞ্জ মেডিকেল কলেজ হাসপাতাল", "Habiganj Medical College Hospital", "হবিগঞ্জ", "", "সরকারি"],
    ["বান্দরবান মেডিকেল কলেজ হাসপাতাল", "Bandarban Medical College Hospital", "বান্দরবান", "", "সরকারি"],
    ["খাগড়াছড়ি মেডিকেল কলেজ হাসপাতাল", "Khagrachhari Medical College Hospital", "খাগড়াছড়ি", "", "সরকারি"],
    ["রাঙ্গামাটি মেডিকেল কলেজ হাসপাতাল", "Rangamati Medical College Hospital", "রাঙ্গামাটি", "", "সরকারি"],
    ["চাঁপাইনবাবগঞ্জ মেডিকেল কলেজ হাসপাতাল", "Chapainawabganj Medical College Hospital", "চাঁপাইনবাবগঞ্জ", "", "সরকারি"],
    ["কক্সবাজার মেডিকেল কলেজ হাসপাতাল", "Cox's Bazar Medical College Hospital", "কক্সবাজার", "", "সরকারি"],
  ];
  // Approximate district-centre coordinates (used only to place a district-level
  // pin on the map; explicitly labelled "আনুমানিক অবস্থান", never an exact address).
  const CITY_COORDS = {
    "ঢাকা": [23.8103, 90.4125], "গাজীপুর": [23.9999, 90.4203], "নারায়ণগঞ্জ": [23.6238, 90.4990],
    "নরসিংদী": [23.9322, 90.7151], "মুন্সিগঞ্জ": [23.5422, 90.5305], "রাজবাড়ী": [23.7574, 89.6444],
    "ফরিদপুর": [23.6070, 89.8429], "গোপালগঞ্জ": [23.0050, 89.8266], "শরীয়তপুর": [23.2423, 90.4348],
    "মাদারীপুর": [23.1641, 90.1896], "মানিকগঞ্জ": [23.8644, 90.0047], "টাঙ্গাইল": [24.2513, 89.9167],
    "কিশোরগঞ্জ": [24.4449, 90.7766], "ময়মনসিংহ": [24.7471, 90.4203], "জামালপুর": [24.9375, 89.9372],
    "শেরপুর": [25.0204, 90.0152], "নেত্রকোণা": [24.8709, 90.7278], "চট্টগ্রাম": [22.3569, 91.7832],
    "কক্সবাজার": [21.4272, 92.0058], "বান্দরবান": [22.1953, 92.2183], "রাঙ্গামাটি": [22.7324, 92.2985],
    "খাগড়াছড়ি": [23.1193, 91.9847], "ফেনী": [23.0159, 91.3976], "নোয়াখালী": [22.8696, 91.0995],
    "লক্ষ্মীপুর": [22.9424, 90.8413], "কুমিল্লা": [23.4607, 91.1809], "চাঁদপুর": [23.2332, 90.6712],
    "ব্রাহ্মণবাড়িয়া": [23.9571, 91.1119], "সিলেট": [24.8949, 91.8687], "মৌলভীবাজার": [24.4829, 91.7774],
    "হবিগঞ্জ": [24.3745, 91.4156], "সুনামগঞ্জ": [25.0658, 91.3950], "রাজশাহী": [24.3745, 88.6042],
    "চাঁপাইনবাবগঞ্জ": [24.5965, 88.2775], "নওগাঁ": [24.7936, 88.9318], "জয়পুরহাট": [25.0968, 89.0227],
    "বগুড়া": [24.8465, 89.3772], "সিরাজগঞ্জ": [24.4533, 89.7006], "পাবনা": [24.0064, 89.2372],
    "নাটোর": [24.4206, 89.0008], "রংপুর": [25.7439, 89.2752], "দিনাজপুর": [25.6217, 88.6354],
    "ঠাকুরগাঁও": [26.0336, 88.4616], "পঞ্চগড়": [26.3411, 88.5541], "নীলফামারী": [25.9317, 88.8560],
    "লালমনিরহাট": [25.9923, 89.2847], "কুড়িগ্রাম": [25.8055, 89.6361], "গাইবান্ধা": [25.3287, 89.5281],
    "খুলনা": [22.8456, 89.5403], "বাগেরহাট": [22.6602, 89.7895], "সাতক্ষীরা": [22.7185, 89.0705],
    "যশোর": [23.1697, 89.2137], "ঝিনাইদহ": [23.5448, 89.1539], "মাগুরা": [23.4855, 89.4198],
    "নড়াইল": [23.1725, 89.5127], "কুষ্টিয়া": [23.9013, 89.1206], "চুয়াডাঙ্গা": [23.6401, 88.8412],
    "মেহেরপুর": [23.7622, 88.6318], "বরিশাল": [22.7010, 90.3535], "বরগুনা": [22.1596, 90.1251],
    "পটুয়াখালী": [22.3596, 90.3298], "ভোলা": [22.6859, 90.6482], "পিরোজপুর": [22.5841, 89.9720],
    "ঝালকাঠি": [22.6406, 90.1981],
  };
  // Better approximate pins for well-known hospitals (still labelled approximate).
  const COORD_OVERRIDES = {
    "bangabandhu-sheikh-mujib-medical-university": [23.7272, 90.3926],
    "dhaka-medical-college-hospital": [23.7189, 90.3938],
    "sir-salimullah-medical-college-hospital": [23.7104, 90.4074],
    "square-hospital": [23.7465, 90.3769],
    "united-hospital-limited": [23.7806, 90.4163],
    "evercare-hospital-dhaka": [23.8103, 90.4210],
    "labaid-specialized-hospital": [23.7467, 90.3766],
    "birdem-general-hospital": [23.7290, 90.3874],
    "chattogram-medical-college-hospital": [22.3310, 91.8320],
    "sylhet-mag-osmani-medical-college-hospital": [24.8949, 91.8687],
  };
  const _slugSeen = {};
  const directory = _dir.map((r) => {
    const [name_bn, name_en, city, area, type] = r;
    let slug = name_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (_slugSeen[slug]) slug = slug + "-" + (++_slugSeen[slug]); else _slugSeen[slug] = 1;
    const c = COORD_OVERRIDES[slug] || CITY_COORDS[city] || null;
    return { slug, name_bn, name_en, city, area, hospital_type: type, is_directory: true, has_price_data: false,
      latitude: c ? c[0] : null, longitude: c ? c[1] : null, coords_approx: true };
  });

  const serviceById = (id) => services.find((s) => s.id === id);
  const hospitalById = (id) => hospitals.find((h) => h.id === id);
  const categoryById = (id) => categories.find((c) => c.id === id);
  // Resolve any hospital slug: priced sample hospitals first, then directory.
  const resolveHospital = (slug) => hospitals.find((h) => h.slug === slug) || directory.find((d) => d.slug === slug) || null;

  function pricesForService(serviceId) {
    return prices.filter((p) => p.service_id === serviceId && p.verification_status !== "unavailable");
  }
  function pricesForHospital(hospitalId) {
    return prices.filter((p) => p.hospital_id === hospitalId);
  }
  function hospitalsWithService(serviceId) {
    const ids = [...new Set(pricesForService(serviceId).map((p) => p.hospital_id))];
    return ids.map(hospitalById).filter(Boolean);
  }
  // Popular = services with the most usable price records
  function popularServices(n) {
    return services
      .map((s) => ({ s, count: pricesForService(s.id).length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, n)
      .map((x) => x.s);
  }

  return { SAMPLE, categories, services, hospitals, cities, hospitalTypes, prices, directory,
    serviceById, hospitalById, categoryById, resolveHospital, pricesForService, pricesForHospital, hospitalsWithService, popularServices };
})();
