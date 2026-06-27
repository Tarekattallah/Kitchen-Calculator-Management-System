import { CatalogData } from "../types";

export const initialCatalogData: CatalogData = {
  wood: [
    { id: "chip", name: "شيب بورد", desc: "جزيئات خشب مضغوطة — الأوفر", price: 35, badge: "اقتصادي", badgeType: "eco", patternId: "p-chip" },
    { id: "mdf", name: "MDF عادي", desc: "ألياف مضغوطة — للأماكن الجافة", price: 45, badge: "اقتصادي", badgeType: "eco", patternId: "p-mdf" },
    { id: "mdf_w", name: "MDF مقاوم للماء", desc: "طبقة حماية — عمر أطول", price: 65, badge: "متوسط", badgeType: "mid", patternId: "p-mdf_w" },
    { id: "hdf", name: "HDF عالي الكثافة", desc: "كثافة عالية — يتحمل الرطوبة", price: 85, badge: "جيد", badgeType: "gd", patternId: "p-hdf" },
    { id: "ply", name: "بلايوود", desc: "طبقات متعاكسة — مقاوم للمياه", price: 110, badge: "متميز", badgeType: "gd", patternId: "p-ply" },
    { id: "solid", name: "خشب صلب طبيعي", desc: "فخامة ومتانة — الأعلى سعراً", price: 160, badge: "فاخر", badgeType: "lux", patternId: "p-solid" }
  ],
  door: [
    { id: "melamine", name: "ميلامين مطفي", desc: "هادئ وعصري — ألوان سادة", price: 0, badge: "مشمول", badgeType: "eco", patternId: "p-melamine" },
    { id: "pvc", name: "PVC محفور", desc: "كلاسيكي / ريفي — حفر بارز", price: 55, badge: "متوسط", badgeType: "mid", patternId: "p-pvc" },
    { id: "hpl", name: "HPL لامينيت", desc: "مقاوم للخدش والحرارة والرطوبة", price: 65, badge: "عملي", badgeType: "gd", patternId: "p-hpl" },
    { id: "acrylic", name: "أكريليك لامع/مطفي", desc: "مقفل بالليزر — عاكس للضوء", price: 75, badge: "جيد", badgeType: "gd", patternId: "p-acrylic" },
    { id: "glass", name: "زجاج", desc: "إطار ألومنيوم — شفاف أو مطفي", price: 100, badge: "فاخر", badgeType: "lux", patternId: "p-glass" },
    { id: "veneer", name: "فينير خشبي", desc: "قشرة طبيعية — عروق دافئة", price: 120, badge: "فاخر", badgeType: "lux", patternId: "p-veneer" }
  ],
  ctr: [
    { id: "gran_l", name: "جرانيت محلي", desc: "يتحمل الحرارة — ألوان محدودة", price: 40, badge: "اقتصادي", badgeType: "eco", patternId: "p-gran-l" },
    { id: "gran_i", name: "جرانيت مستورد", desc: "ألوان أرقى — مصادر عالمية", price: 75, badge: "متوسط", badgeType: "mid", patternId: "p-gran-i" },
    { id: "quartz", name: "كوارتز", desc: "غير مسامي — يحاكي الرخام", price: 110, badge: "ممتاز", badgeType: "gd", patternId: "p-quartz" },
    { id: "porce", name: "بورسلان", desc: "مقاوم تماماً — سطح نحيف عصري", price: 200, badge: "فاخر", badgeType: "lux", patternId: "p-porce" },
    { id: "corian", name: "كوريان", desc: "بدون فواصل — مغسلة مدمجة", price: 220, badge: "فاخر", badgeType: "lux", patternId: "p-corian" },
    { id: "marble", name: "رخام طبيعي", desc: "عروق فريدة — يحتاج عناية", price: 270, badge: "فاخر", badgeType: "lux", patternId: "p-marble" }
  ],
  acc: [
    { id: "a0", name: "إكسسوار صيني تجاري", desc: "مفصلات بدون هيدروليك", price: 0, badge: "مشمول", badgeType: "eco", patternId: "p-acc0" },
    { id: "a1", name: "DTC صيني معتمد", desc: "Soft-close معتمد", price: 6, badge: "اقتصادي", badgeType: "eco", patternId: "p-acc1" },
    { id: "a2", name: "Samet تركي", desc: "هيدروليك تركي أصلي", price: 10, badge: "متوسط", badgeType: "mid", patternId: "p-acc2" },
    { id: "a3", name: "Hettich ألماني", desc: "إغلاق صامت طويل الأمد", price: 25, badge: "ممتاز", badgeType: "gd", patternId: "p-acc3" },
    { id: "a4", name: "Blum نمساوي", desc: "قضبان مخفية هيدروليكية", price: 60, badge: "فاخر", badgeType: "lux", patternId: "p-acc4" },
    { id: "a5", name: "Blum منظومة كاملة", desc: "Aventos + Legrabox كاملة", price: 120, badge: "فاخر جداً", badgeType: "lux", patternId: "p-acc5" }
  ],
  height: [
    { id: "standard", name: "ارتفاع قياسي (80 سم)", desc: "مشمول في السعر الأساسي", price: 0, badge: "مجاني", badgeType: "eco" },
    { id: "extended", name: "ارتفاع ممتد (90-100 سم)", desc: "تطويل الأبواب العلوية", price: 20, badge: "إضافي", badgeType: "mid" },
    { id: "full", name: "تقفيل كامل للسقف", desc: "طابق إضافي — مودرن ممتد", price: 50, badge: "فاخر", badgeType: "lux" }
  ],
  handle: [
    { id: "classic", name: "مقابض خارجية تقليدية", desc: "براغي على وجه الباب", price: 0, badge: "مجاني", badgeType: "eco" },
    { id: "gola", name: "Gola مخفية ألومنيوم", desc: "مجرى مدمج في الهيكل", price: 10, badge: "متوسط", badgeType: "mid" },
    { id: "push", name: "Push to Open", desc: "تفتح بلمسة — بدون مقبض", price: 18, badge: "ذكي", badgeType: "gd" }
  ],
  light: [
    { id: "none", name: "بدون إضاءة", desc: "لا توجد إضاءة خلفية مدمجة", price: 0, badge: "مجاني", badgeType: "eco" },
    { id: "led", name: "LED مع بروفايل ألومنيوم", desc: "إنارة سطح العمل", price: 8, badge: "متوسط", badgeType: "mid" },
    { id: "sensor", name: "LED ذكية بحساس", desc: "تضيء تلقائياً بالحركة", price: 15, badge: "ذكي", badgeType: "gd" }
  ],
  finish: [
    { id: "none", name: "بدون إضافات", desc: "تشطيب حواف مستقيم قياسي", price: 0, badge: "مجاني", badgeType: "eco" },
    { id: "bullnose", name: "Double Bullnose", desc: "حافة دائرية ناعمة", price: 5, badge: "متوسط", badgeType: "mid" },
    { id: "laser", name: "شطف 45° ليزر", desc: "حافة مخفية — تبدو سميكة فاخرة", price: 10, badge: "جيد", badgeType: "gd" },
    { id: "backsplash", name: "Backsplash (60 سم)", desc: "الرخام يصعد لتغطية الجدار", price: 50, badge: "فاخر", badgeType: "lux" }
  ],
  addons: [
    { id: "oven_eco", name: "فرن مدمج — اقتصادي", sub: "تركي/صيني", price: 130 },
    { id: "oven_mid", name: "فرن مدمج — متوسط", sub: "إيطالي / براند معروف", price: 220 },
    { id: "oven_lux", name: "فرن مدمج — فاخر", sub: "Bosch / Miele", price: 450 },
    { id: "hob_eco", name: "سطح طبخ — 4 شعلات غاز", sub: "اقتصادي", price: 80 },
    { id: "hob_mid", name: "سطح طبخ — 5 شعلات / سيراميك", sub: "متوسط", price: 170 },
    { id: "hob_lux", name: "سطح طبخ — سيراميك ذكي", sub: "فاخر", price: 380 },
    { id: "hood_und", name: "شفاط Under-cabinet", sub: "كلاسيكي", price: 65 },
    { id: "hood_t", name: "شفاط ديكوري T-Shape", sub: "زجاجي / حائط", price: 140 },
    { id: "hood_isl", name: "شفاط جزيرة Island Hood", sub: "معلق وسطي", price: 290 },
    { id: "dw_semi", name: "غسالة صحون شبه مدمجة", sub: "لوحة تحكم ظاهرة", price: 190 },
    { id: "dw_full", name: "غسالة صحون مدمجة كاملاً", sub: "مخفية وراء الباب", price: 340 },
    { id: "mw", name: "ميكروويف مدمج", sub: "متوسط إلى فاخر", price: 150 },
    { id: "corner_lemans", name: "سلة زاوية LeMans", sub: "نصف دائرية", price: 50 },
    { id: "corner_magic", name: "زاوية Magic Corner", sub: "سحب كامل للخارج", price: 90 },
    { id: "pantry", name: "صيدلية مؤونة Pantry", sub: "5-6 سلال طولية", price: 180 },
    { id: "spice", name: "سلة زجاجات / بهارات", sub: "درج نظيف جانب الفرن", price: 35 },
    { id: "bin", name: "سلة مهملات مزدوجة", sub: "تخرج مع الباب", price: 40 },
    { id: "org_plastic", name: "مقسم أدراج — بلاستيك", sub: "ملاعق وأدوات", price: 12 },
    { id: "org_wood", name: "مقسم أدراج — خشب/ألومنيوم", sub: "فاخر قابل للتعديل", price: 35 }
  ]
};
