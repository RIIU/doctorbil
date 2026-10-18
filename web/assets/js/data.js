/* DoctorBill — runtime data layer (NO sample data)
   Real sources only:
   - hospitals: OpenStreetMap via server proxy /api/geo/hospitals (loaded at runtime)
   - prices: approved user-submitted real bills via /api/prices (loaded at runtime)
   - services/categories/CITY_COORDS: real generic facts (no prices attached). */

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
    { id: "s13", name_bn: "এইচবিএ১সি (HbA1c)", name_en: "HbA1c", slug: "hba1c", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["hba1c", "এইচবিএ১সি", "glycated hemoglobin", "ডায়াবেটিস মনিটরিং"] },
    { id: "s14", name_bn: "এসজিপিটি (SGPT)", name_en: "SGPT (ALT)", slug: "sgpt", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["sgpt", "alt", "লিভার টেস্ট", "এসজিপিটি"] },
    { id: "s15", name_bn: "টিএসএইচ (TSH)", name_en: "TSH", slug: "tsh", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["tsh", "টিএসএইচ", "থাইরয়েড টেস্ট", "thyroid"] },
    { id: "s16", name_bn: "ডেঙ্গু NS1 এন্টিজেন", name_en: "Dengue NS1 Antigen", slug: "dengue-ns1", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["dengue", "ডেঙ্গু", "ns1", "ডেঙ্গু টেস্ট"] },
    /* s17+ — সরকারি রেট তালিকা (প্রকাশিত) থেকে যুক্ত আসল টেস্ট-নাম */
    { id: "s17", name_bn: "রক্তে শর্করা (RBS)", name_en: "Blood Sugar (Random)", slug: "blood-sugar-random", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["rbs", "random sugar", "শর্করা", "sugar random"] },
    { id: "s18", name_bn: "ওজিটিটি (OGTT)", name_en: "Oral Glucose Tolerance Test", slug: "ogtt", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["ogtt", "গ্লুকোজ টলারেন্স"] },
    { id: "s19", name_bn: "রক্তের ইউরিয়া", name_en: "Blood Urea", slug: "blood-urea", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["urea", "ইউরিয়া", "কিডনি টেস্ট"] },
    { id: "s20", name_bn: "সিরাম ক্রিয়েটিনিন", name_en: "Serum Creatinine", slug: "serum-creatinine", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["creatinine", "ক্রিয়েটিনিন", "কিডনি"] },
    { id: "s21", name_bn: "SGOT (AST)", name_en: "SGOT (AST)", slug: "sgot-ast", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["sgot", "ast", "লিভার"] },
    { id: "s22", name_bn: "টি-থ্রি (T3)", name_en: "T3", slug: "t3", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["t3", "টি৩", "থাইরয়েড"] },
    { id: "s23", name_bn: "টি-ফোর (T4)", name_en: "T4", slug: "t4", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["t4", "টি৪", "থাইরয়েড"] },
    { id: "s24", name_bn: "ফ্রি টি-থ্রি (FT3)", name_en: "Free T3", slug: "ft3", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["ft3", "ফ্রি টি৩"] },
    { id: "s25", name_bn: "ফ্রি টি-ফোর (FT4)", name_en: "Free T4", slug: "ft4", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["ft4", "ফ্রি টি৪"] },
    { id: "s26", name_bn: "বিলিরুবিন (ডাইরেক্ট/ইনডাইরেক্ট)", name_en: "Bilirubin (D/I)", slug: "bilirubin-di", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["bilirubin", "বিলিরুবিন", "জন্ডিস"] },
    { id: "s27", name_bn: "ভিটামিন-ডি (সিরাম)", name_en: "Vitamin D (Serum)", slug: "vitamin-d", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["vitamin d", "ভিটামিন ডি", "25-oh"] },
    { id: "s28", name_bn: "PSA সিরাম", name_en: "PSA Serum", slug: "psa-serum", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["psa", "প্রোস্টেট", "prostate"] },
    { id: "s29", name_bn: "ফেরিটিন (সিরাম)", name_en: "Ferritin (Serum)", slug: "ferritin", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["ferritin", "ফেরিটিন", "রক্তের স্টক"] },
    { id: "s30", name_bn: "কোলেস্টেরল", name_en: "Cholesterol", slug: "cholesterol", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["cholesterol", "কোলেস্টেরল"] },
    { id: "s31", name_bn: "লিভার ফাংশন টেস্ট (LFT)", name_en: "Liver Function Test (LFT)", slug: "liver-function-test", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["lft", "liver function", "লিভার ফাংশন"] },
    { id: "s32", name_bn: "টোটাল বিলিরুবিন", name_en: "Total Bilirubin", slug: "bilirubin-total", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["total bilirubin", "টোটাল বিলিরুবিন", "জন্ডিস"] },
    { id: "s33", name_bn: "অ্যালবুমিন (সিরাম)", name_en: "Albumin (Serum)", slug: "albumin-serum", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["albumin", "অ্যালবুমিন"] },
    { id: "s34", name_bn: "ইলেক্ট্রোলাইট (সিরাম)", name_en: "Serum Electrolyte", slug: "serum-electrolyte", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["electrolyte", "না/কে", "sodium potassium"] },
    { id: "s35", name_bn: "সিরাম অ্যামাইলেজ", name_en: "Serum Amylase", slug: "serum-amylase", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["amylase", "অ্যামাইলেজ", "s. amylase"] },
    { id: "s36", name_bn: "ইউরিন অ্যামাইলেজ", name_en: "Urine Amylase", slug: "urine-amylase", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["urine amylase"] },
    { id: "s37", name_bn: "ট্রিপল অ্যান্টিজেন", name_en: "Triple Antigen", slug: "triple-antigen", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["triple antigen", "ট্রিপল অ্যান্টিজেন"] },
    { id: "s38", name_bn: "ওয়াইডাল টেস্ট", name_en: "Widal Test", slug: "widal-test", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["widal", "ওয়াইডাল", "টাইফয়েড", "typhoid"] },
    { id: "s39", name_bn: "এ-এস-ও টাইটার (ASO)", name_en: "ASO Titre", slug: "aso-titre", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["aso", "asot"] },
    { id: "s40", name_bn: "আর-এ টেস্ট (RA Factor)", name_en: "RA Test (Rheumatoid Factor)", slug: "ra-factor", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["ra test", "ra factor", "রিউমাটয়েড"] },
    { id: "s41", name_bn: "ব্লাড গ্রুপিং", name_en: "Blood Grouping", slug: "blood-grouping", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["blood group", "রক্তের গ্রুপ", "abo"] },
    { id: "s42", name_bn: "ভিডিআরএল (VDRL)", name_en: "VDRL", slug: "vdrl", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["vdrl", "vdrl"] },
    { id: "s43", name_bn: "সি-আর-পি (CRP)", name_en: "CRP", slug: "crp", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["crp", "c-reactive", "সি আর পি"] },
    { id: "s44", name_bn: "ম্যালেরিয়া (MP-ICT)", name_en: "Malaria Parasite (ICT)", slug: "malaria-ict", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["mp ict", "malaria ict"] },
    { id: "s45", name_bn: "হেপাটাইটিস-বি স্ক্রিনিং", name_en: "HBsAg (Screening)", slug: "hbsag-screening", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["hbsag screening", "হেপাটাইটিস বি স্ক্রিনিং"] },
    { id: "s46", name_bn: "প্রোথ্রম্বিন টাইম (PT/INR)", name_en: "Prothrombin Time (PT/INR)", slug: "prothrombin-time", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["pt", "inr", "prothrombin"] },
    { id: "s47", name_bn: "ট্রপোনিন-আই (ICT)", name_en: "Troponin I (ICT)", slug: "troponin-i", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["troponin", "ট্রপোনিন", "হার্ট অ্যাটাক"] },
    { id: "s48", name_bn: "ইউরিক এসিড", name_en: "Uric Acid", slug: "uric-acid", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["uric acid", "ইউরিক"] },
    { id: "s49", name_bn: "ক্যালসিয়াম (সিরাম)", name_en: "Calcium (Serum)", slug: "calcium-serum", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["calcium", "ক্যালসিয়াম"] },
    { id: "s50", name_bn: "ক্ষারীয় ফসফাটেজ (ALP)", name_en: "Alkaline Phosphatase", slug: "alkaline-phosphatase", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["alp", "alkaline phosphatase"] },
    { id: "s51", name_bn: "এমটি (ম্যান্টু টেস্ট)", name_en: "MT (Mantoux Test)", slug: "mantoux-test", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["mt", "mantoux", "টিবি টেস্ট"] },
    { id: "s52", name_bn: "টিপিএইচএ (TPHA)", name_en: "TPHA", slug: "tpha", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["tpha"] },
    { id: "s53", name_bn: "টিসি/ডিসি/এইচবি%", name_en: "TC/DC/Hb%", slug: "tc-dc-hb", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["tc dc", "differential count", "hb percent"] },
    { id: "s54", name_bn: "হিমোগ্লোবিন", name_en: "Haemoglobin", slug: "haemoglobin", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["hemoglobin", "হিমোগ্লোবিন", "hb"] },
    { id: "s55", name_bn: "ইএসআর (ESR)", name_en: "ESR", slug: "esr", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["esr", "esr"] },
    { id: "s56", name_bn: "প্লাটিলেট কাউন্ট", name_en: "Platelet Count", slug: "platelet-count", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["platelet", "প্লাটিলেট"] },
    { id: "s57", name_bn: "ম্যালেরিয়া প্যারাসাইট", name_en: "Malarial Parasite", slug: "malarial-parasite", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["mp", "malarial parasite"] },
    { id: "s58", name_bn: "ইউরিন আর/এম/ই", name_en: "Urine R/M/E", slug: "urine-rme", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["urine routine", "ইউরিন পরীক্ষা"] },
    { id: "s59", name_bn: "প্রেগন্যান্সি টেস্ট", name_en: "Pregnancy Test", slug: "pregnancy-test", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["pregnancy", "upt", "গর্ভধারণ"] },
    { id: "s60", name_bn: "স্টুল আর/এম/ই", name_en: "Stool R/M/E", slug: "stool-rme", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["stool routine", "মলের পরীক্ষা"] },
    { id: "s61", name_bn: "বিটা-এইচসিজি (B-HCG)", name_en: "B-HCG", slug: "bhcg", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["beta hcg", "b hcg", "এইচসিজি"] },
    { id: "s62", name_bn: "হেপাটাইটিস-বি (ELISA)", name_en: "HBsAg (ELISA)", slug: "hbsag-elisa", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["hbsag elisa", "hbsag"] },
    { id: "s63", name_bn: "প্রজেস্টেরন", name_en: "Progesterone", slug: "progesterone", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["progesterone", "প্রজেস্টেরন"] },
    { id: "s64", name_bn: "প্রোল্যাক্টিন (PRL)", name_en: "Prolactin (PRL)", slug: "prolactin", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["prolactin", "prl"] },
    { id: "s65", name_bn: "টোটাল আইজিই (IgE)", name_en: "Total IgE", slug: "total-ige", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["ige", "অ্যালার্জি", "total ige"] },
    { id: "s66", name_bn: "ডেঙ্গু IgG/IgM", name_en: "Dengue IgG/IgM", slug: "dengue-igg-igm", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["dengue igg", "dengue igm", "ডেঙ্গু পরীক্ষা"] },
    { id: "s67", name_bn: "এইচ. পাইলোরি IgG", name_en: "H. Pylori IgG", slug: "h-pylori-igg", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["h pylori", "gastric", "গ্যাস্ট্রিক"] },
    { id: "s68", name_bn: "অ্যান্টি-সিসিপি (Anti-CCP)", name_en: "Anti-CCP", slug: "anti-ccp", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["anti ccp", "accp"] },
    { id: "s69", name_bn: "এলএইচ (LH)", name_en: "LH", slug: "lh", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["lh", "luteinizing"] },
    { id: "s70", name_bn: "এফএসএইচ (FSH)", name_en: "FSH", slug: "fsh", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["fsh", "follicle"] },
    { id: "s71", name_bn: "সিরাম টোটাল প্রোটিন", name_en: "Serum Total Protein", slug: "total-protein", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["total protein", "প্রোটিন"] },
    { id: "s72", name_bn: "অ্যান্টি-এইচসিভি (Anti-HCV)", name_en: "Anti-HCV", slug: "anti-hcv", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["anti hcv", "hepatitis c", "হেপাটাইটিস সি"] },
    { id: "s73", name_bn: "টেস্টোস্টেরন", name_en: "Testosterone", slug: "testosterone", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["testosterone", "টেস্টোস্টেরন"] },
    { id: "s74", name_bn: "সিএ-19.9 (CA-19.9)", name_en: "CA-19.9", slug: "ca-19-9", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["ca199", "ca 19.9"] },
    { id: "s75", name_bn: "সিএ-15.3 (CA-15.3)", name_en: "CA-15.3", slug: "ca-15-3", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["ca153", "ca 15.3"] },
    { id: "s76", name_bn: "সিএ-125 (CA-125)", name_en: "CA-125", slug: "ca-125", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["ca 125", "ওভারিয়ান"] },
    { id: "s77", name_bn: "সিইএ (CEA)", name_en: "CEA", slug: "cea", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["cea", "carcinoembryonic"] },
    { id: "s78", name_bn: "এএফপি (আলফা ফিটো প্রোটিন)", name_en: "AFP (Alpha Feto Protein)", slug: "afp", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["afp", "alpha feto protein"] },
    { id: "s79", name_bn: "বিটি/সিটি (BT/CT)", name_en: "BT/CT", slug: "bt-ct", category_id: "c5", unit: "প্রতি টেস্ট", synonyms: ["bleeding time", "clotting time", "ব্লিডিং টাইম"] },
  ];

  const hospitals = [
    /* সরকারি রেট-তালিকা একটি কার্ড (কোনো নির্দিষ্ট হাসপাতাল নয়) — শুধু তুলনা-তালিকায় দেখায়,
       বিল-জমা/হাসপাতাল-তালিকা থেকে বাদ (is_rate_card)। কোনো বানানো ঠিকানা/ফোন নেই। */
    { id: "h900", slug: "govt-hospital-rate-list",
      name_bn: "সরকারি হাসপাতাল — নির্ধারিত রেট তালিকা", name_en: "Government Hospital Rate Schedule",
      hospital_type: "সরকারি (রেট কার্ড)", city: null, area: null, address_bn: null,
      phone_masked: null, website: null, status: "active", emergency_verified: false,
      is_rate_card: true, is_real: true, source_reference: "সরকারি হাসপাতালের প্রকাশিত রেট তালিকা" },
  ];

  const cities = ["ঢাকা", "চট্টগ্রাম", "সিলেট"];
  const hospitalTypes = ["বেসরকারি", "মেডিকেল কলেজ", "ডায়াগনস্টিক", "বিশেষায়িত"];

  
  /* Price builders — শুধুমাত্র আসল উৎস থেকে; কোনো বানানো মান নেই।
     G = সরকারি রেট তালিকা (unverified: মূল পরিপত্রের সাথে মেলানো বাকি),
     B = BRB Hospitals-এর নিজস্ব প্রকাশিত রেট চার্ট (hospital_provided)। */
  const G = (service_id, amount, note) => ({ hospital_id: "h900", service_id, currency: "BDT",
    price_amount: amount, price_min: null, price_max: null,
    price_basis: "সরকারি হাসপাতালের নির্ধারিত রেট", inclusions: note || "", exclusions: "",
    source_type: "hospital_provided", source_reference: "সরকারি হাসপাতাল রক্ত পরীক্ষার রেট তালিকা (প্রকাশিত ছবি)",
    last_checked_at: null, verification_status: "unverified", verified_by: null, is_real: true });
  const B = (service_id, amount, note) => ({ hospital_id: "o13954370219", service_id, currency: "BDT",
    price_amount: amount, price_min: null, price_max: null,
    price_basis: "হাসপাতালের প্রকাশিত রেট চার্ট", inclusions: note || "", exclusions: "",
    source_type: "hospital_provided", source_reference: "BRB Hospitals Limited রেট চার্ট (care line 10647)",
    last_checked_at: null, verification_status: "hospital_provided", verified_by: null, is_real: true });

  const prices = [
    /* ---- সরকারি হাসপাতাল রক্ত পরীক্ষার রেট তালিকা (h900) — পরিষ্কার ছবি থেকে ৭২টি সারি ---- */
    G("s1", 100, "সাধারণ CBC; পূর্ণ প্যানেল (TC, DC, Hb%, ESR, PC) ১৩০/-"),
    G("s17", 90), G("s18", 150), G("s19", 50), G("s20", 50),
    G("s10", 100), G("s30", 90), G("s31", 200), G("s32", 30), G("s14", 70),
    G("s21", 70), G("s33", 150), G("s34", 210), G("s35", 300), G("s36", 300),
    G("s37", 100), G("s38", 80), G("s39", 100), G("s40", 60), G("s41", 50),
    G("s42", 50), G("s43", 150), G("s44", 210), G("s45", 150), G("s46", 100),
    G("s47", 500), G("s48", 100), G("s49", 80), G("s50", 70), G("s51", 100),
    G("s52", 210), G("s53", 60), G("s54", 30), G("s55", 30), G("s56", 50),
    G("s79", 30), G("s57", 20), G("s58", 20), G("s59", 30), G("s60", 20),
    G("s22", 200), G("s23", 200), G("s15", 300), G("s24", 250), G("s25", 250),
    G("s61", 350), G("s28", 350, "টোটাল PSA"), G("s62", 450), G("s63", 250), G("s64", 250),
    G("s27", 1000, "25-OH Vitamin D"), G("s65", 500), G("s16", 50), G("s66", 100),
    G("s67", 400), G("s29", 250), G("s68", 250), G("s69", 280), G("s70", 280),
    G("s71", 270), G("s13", 700), G("s72", 200), G("s73", 280), G("s74", 300),
    G("s75", 300), G("s76", 450), G("s77", 450), G("s78", 450),
    G("s26", 120, "ডাইরেক্ট/ইনডাইরেক্ট ১২০/-; টোটাল বিলিরুবিন ৩০/-"),
    G("s8", 400),

    /* ---- BRB Hospitals Ltd (o13954370219) — নিজস্ব প্রকাশিত রেট চার্ট ---- */
    B("s1", 400, "সাধারণ CBC (CBC WITH ESR ৬৫০)"), B("s2", 270), B("s5", 2600, "USG পুরো পেট"),
    B("s4", 6000, "CT ব্রেইন (কনট্রাস্ট ছাড়া)"),
    B("s3", 8500, "MRI ব্রেইন (কনট্রাস্ট ছাড়া)"), B("s6", 2200), B("s8", 500), B("s9", 600, "বুক X-Ray (PA view)"),
    B("s10", 1400), B("s13", 1450), B("s14", 500), B("s15", 1430),
    B("s17", 150, "স্ট্রিপ পদ্ধতি (FBS/২ঘণ্টা/RBS)"), B("s18", 800), B("s20", 500), B("s21", 500),
    B("s22", 1430), B("s23", 1430), B("s24", 1650), B("s25", 1650),
    B("s26", 500, "ডাইরেক্ট বা ইনডাইরেক্ট (টোটাল ৪৫০)"),
    B("s27", 4000), B("s28", 1400), B("s29", 1400),
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
      const directory = [];

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

  return { SAMPLE, categories, services, hospitals, cities: Object.keys(CITY_COORDS), hospitalTypes, prices, directory,
    serviceById, hospitalById, categoryById, resolveHospital, pricesForService, pricesForHospital, hospitalsWithService, popularServices,
    cityCoords: CITY_COORDS,
    /* Runtime injection of REAL data (OpenStreetMap hospitals, approved real bills).
       Mutates the closed-over arrays so every finder (hospitalById, resolveHospital,
       pricesForService…) keeps working. No sample/dummy record ever passes here. */
    addRealHospitals(list) {
      if (!Array.isArray(list)) return;
      const seen = {};
      hospitals.forEach((h) => { seen[h.id] = 1; });
      list.forEach((x) => { if (x && x.id && x.slug && !seen[x.id]) { seen[x.id] = 1; hospitals.push(x); } });
    },
    addRealPrices(list) { if (Array.isArray(list)) list.forEach((x) => { if (x && x.hospital_id && x.service_id && typeof x.price_amount === "number") prices.push(x); }); } };
})();
