import React, { useState } from "react";
import { CatalogData, CatalogItem, AddonItem } from "../types";
import { 
  Save, RefreshCw, Plus, Trash2, Edit3, Settings, Layers, Columns, 
  Tag, AlertTriangle, CheckCircle, Package, HelpCircle, Eye
} from "lucide-react";

interface AdminPanelProps {
  initialCatalog: CatalogData;
  onSaveCatalog: (newCatalog: CatalogData) => Promise<boolean>;
  onResetCatalog: () => Promise<boolean>;
}

type CategoryType = 'wood' | 'door' | 'ctr' | 'acc' | 'height' | 'handle' | 'light' | 'finish' | 'addons';

export default function AdminPanel({ initialCatalog, onSaveCatalog, onResetCatalog }: AdminPanelProps) {
  const [catalog, setCatalog] = useState<CatalogData>(JSON.parse(JSON.stringify(initialCatalog)));
  const [activeCategory, setActiveCategory] = useState<CategoryType>('wood');
  
  // Adding new item form states
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemBadge, setNewItemBadge] = useState("");
  const [newItemBadgeType, setNewItemBadgeType] = useState<'eco' | 'mid' | 'gd' | 'lux'>("eco");
  const [newItemSub, setNewItemSub] = useState(""); // specifically for addons

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState("");

  const categories: { id: CategoryType; name: string; unit: string; hasBadge: boolean }[] = [
    { id: 'wood', name: 'الهيكل الداخلي (الكاركاس)', unit: 'ر.ع / متر', hasBadge: true },
    { id: 'door', name: 'واجهة الأبواب', unit: 'ر.ع / متر', hasBadge: true },
    { id: 'ctr', name: 'سطح العمل (الرخام)', unit: 'ر.ع / م²', hasBadge: true },
    { id: 'acc', name: 'المفصلات والسحاب', unit: 'ر.ع / متر', hasBadge: true },
    { id: 'height', name: 'الارتفاع وتقفيل السقف', unit: 'ر.ع / متر', hasBadge: false },
    { id: 'handle', name: 'نظام فتح الأبواب والمقابض', unit: 'ر.ع / متر', hasBadge: false },
    { id: 'light', name: 'الإضاءة المخفية', unit: 'ر.ع / متر', hasBadge: false },
    { id: 'finish', name: 'تشطيب سطح العمل', unit: 'ر.ع / متر', hasBadge: false },
    { id: 'addons', name: 'الإضافات والأجهزة (بالحبة)', unit: 'ر.ع / قطعة', hasBadge: false }
  ];

  // Sync state if initialCatalog changes
  React.useEffect(() => {
    setCatalog(JSON.parse(JSON.stringify(initialCatalog)));
  }, [initialCatalog]);

  const handlePriceChange = (category: CategoryType, id: string, val: string) => {
    const parsedVal = parseFloat(val) || 0;
    setCatalog((prev) => {
      const copy = { ...prev };
      if (category === 'addons') {
        copy.addons = copy.addons.map((item) => 
          item.id === id ? { ...item, price: parsedVal } : item
        );
      } else {
        copy[category] = copy[category].map((item) => 
          item.id === id ? { ...item, price: parsedVal } : item
        );
      }
      return copy;
    });
  };

  const handleTextChange = (category: CategoryType, id: string, field: 'name' | 'desc' | 'badge' | 'sub', val: string) => {
    setCatalog((prev) => {
      const copy = { ...prev };
      if (category === 'addons') {
        copy.addons = copy.addons.map((item) => 
          item.id === id ? { ...item, [field]: val } : item
        );
      } else {
        copy[category] = copy[category].map((item) => 
          item.id === id ? { ...item, [field]: val } : item
        );
      }
      return copy;
    });
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      setError("الرجاء إدخال اسم المورد أو الخيار");
      return;
    }

    const randomId = `${activeCategory}_${Date.now()}`;
    
    setCatalog((prev) => {
      const copy = { ...prev };
      if (activeCategory === 'addons') {
        const newItem: AddonItem = {
          id: randomId,
          name: newItemName,
          sub: newItemSub || "إضافة مخصصة",
          price: newItemPrice
        };
        copy.addons = [...copy.addons, newItem];
      } else {
        const newItem: CatalogItem = {
          id: randomId,
          name: newItemName,
          desc: newItemDesc || "مواصفات مخصصة",
          price: newItemPrice,
          badge: newItemBadge || undefined,
          badgeType: newItemBadge ? newItemBadgeType : undefined
        };
        copy[activeCategory] = [...copy[activeCategory], newItem];
      }
      return copy;
    });

    // Clear form inputs
    setNewItemName("");
    setNewItemDesc("");
    setNewItemPrice(0);
    setNewItemBadge("");
    setNewItemSub("");
    setError("");
  };

  const handleDeleteItem = (category: CategoryType, id: string) => {
    setCatalog((prev) => {
      const copy = { ...prev };
      if (category === 'addons') {
        copy.addons = copy.addons.filter((i) => i.id !== id);
      } else {
        copy[category] = copy[category].filter((i) => i.id !== id);
      }
      return copy;
    });
  };

  const triggerSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError("");
    try {
      const result = await onSaveCatalog(catalog);
      if (result) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError("فشل تحديث الأسعار على الخادم. الرجاء المحاولة مرة أخرى.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع أثناء الحفظ.");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerReset = async () => {
    if (!window.confirm("هل أنت متأكد من رغبتك في إعادة الأسعار وخيارات الموارد الافتراضية؟ سيتم مسح أي خيارات أضفتها.")) {
      return;
    }
    setIsResetting(true);
    setResetSuccess(false);
    setError("");
    try {
      const result = await onResetCatalog();
      if (result) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
      } else {
        setError("فشل إعادة ضبط البيانات على الخادم.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إعادة ضبط البيانات.");
    } finally {
      setIsResetting(false);
    }
  };

  const selectedCategoryMeta = categories.find((c) => c.id === activeCategory);

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm text-right" dir="rtl" id="admin-panel-root">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-neutral-100 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 animate-spin-slow" />
            لوحة الإدارة المتقدمة وتعديل الأسعار لحظيًا
          </h2>
          <p className="text-xs text-neutral-400 mt-1">تتيح لك هذه اللوحة تعديل أسعار الموارد، وإضافة خيارات جديدة، وتحديث الأسعار التقديرية للحاسبة فوراً</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerReset}
            disabled={isResetting || isSaving}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
            <span>إعادة الضبط الافتراضي</span>
          </button>
          
          <button
            onClick={triggerSave}
            disabled={isSaving || isResetting}
            className="px-4 py-2 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "جاري الحفظ..." : "حفظ التحديثات لحظيًا"}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
          <span>تم حفظ التحديثات وحفظ الكتالوج على السيرفر بنجاح! تم تحديث حاسبة الأسعار بالقيم الجديدة فورًا.</span>
        </div>
      )}

      {resetSuccess && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4.5 h-4.5 text-blue-600" />
          <span>تمت إعادة الأسعار والبيانات إلى التوليفة الأساسية بنجاح!</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Categories Tab Selector (4 cols) */}
        <div className="md:col-span-3 space-y-1.5">
          <span className="block text-2xs font-bold text-neutral-400 px-3 mb-2">تصنيفات الموارد المتاحة</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setError("");
              }}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-semibold flex justify-between items-center transition-all ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-100/50"
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-4xs px-2 py-0.5 rounded ${activeCategory === cat.id ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-500"}`}>
                {cat.id === 'addons' ? catalog.addons?.length : (catalog[cat.id]?.length || 0)} خيارًا
              </span>
            </button>
          ))}
        </div>

        {/* Category Items Editor and New Form (9 cols) */}
        <div className="md:col-span-9 space-y-6">
          <div className="border border-neutral-100 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-50 pb-3">
              <div>
                <h3 className="font-bold text-neutral-800 text-sm">قائمة خيارات: {selectedCategoryMeta?.name}</h3>
                <p className="text-4xs text-neutral-400 mt-0.5">تعديل قيم الأسعار لحظيًا ومباشرة من الحقول في الجدول</p>
              </div>
              <span className="bg-neutral-50 px-3 py-1 text-2xs border border-neutral-200 text-neutral-600 rounded-lg">
                الوحدة: {selectedCategoryMeta?.unit}
              </span>
            </div>

            {/* List of current items inside selected Category */}
            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {activeCategory === 'addons' ? (
                catalog.addons?.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleTextChange('addons', item.id, 'name', e.target.value)}
                          className="px-2 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-800"
                          placeholder="اسم الجهاز أو المورد"
                        />
                        <input
                          type="text"
                          value={item.sub}
                          onChange={(e) => handleTextChange('addons', item.id, 'sub', e.target.value)}
                          className="px-2 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-600"
                          placeholder="النوع أو الصناعة"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white border border-neutral-200 rounded-lg px-2 py-1 w-[120px]">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handlePriceChange('addons', item.id, e.target.value)}
                          className="w-full bg-transparent text-left focus:outline-none font-bold text-xs text-blue-600 font-mono"
                        />
                        <span className="text-4xs text-neutral-400 mr-1.5">ر.ع</span>
                      </div>
                      <button
                        onClick={() => handleDeleteItem('addons', item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="حذف هذا الخيار"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                catalog[activeCategory]?.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleTextChange(activeCategory, item.id, 'name', e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-800"
                          placeholder="الاسم"
                        />
                        <input
                          type="text"
                          value={item.desc}
                          onChange={(e) => handleTextChange(activeCategory, item.id, 'desc', e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-600"
                          placeholder="وصف بسيط للمورد"
                        />
                      </div>
                      
                      {selectedCategoryMeta?.hasBadge && (
                        <div className="flex items-center gap-2">
                          <span className="text-4xs text-neutral-400">شارات الجودة والسعر:</span>
                          <input
                            type="text"
                            value={item.badge || ""}
                            onChange={(e) => handleTextChange(activeCategory, item.id, 'badge', e.target.value)}
                            className="px-2 py-1 bg-white border border-neutral-200 rounded text-3xs w-24 text-center"
                            placeholder="مثال: متميز"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white border border-neutral-200 rounded-lg px-2 py-1 w-[120px]">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handlePriceChange(activeCategory, item.id, e.target.value)}
                          className="w-full bg-transparent text-left focus:outline-none font-bold text-xs text-blue-600 font-mono"
                        />
                        <span className="text-4xs text-neutral-400 mr-1.5">ر.ع</span>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(activeCategory, item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="حذف هذا الخيار"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {((activeCategory === 'addons' ? catalog.addons?.length : catalog[activeCategory]?.length) || 0) === 0 && (
                <div className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-neutral-400 text-xs">
                  لا توجد خيارات معرّفة داخل هذا التصنيف حاليًا. يمكنك إضافة خيارات بالأسفل.
                </div>
              )}
            </div>
          </div>

          {/* Form to Add New Custom Item */}
          <div className="border border-neutral-100 rounded-2xl p-5 bg-neutral-50/50 space-y-4">
            <h4 className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              إضافة مورد أو خيار تسعير جديد إلى: {selectedCategoryMeta?.name}
            </h4>

            <form onSubmit={handleAddNewItem} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="block text-4xs font-bold text-neutral-400 mb-1.5">اسم المورد / الخيار</label>
                <input
                  type="text"
                  placeholder="مثال: جرانيت إيطالي ممتاز"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {activeCategory === 'addons' ? (
                <div className="md:col-span-4">
                  <label className="block text-4xs font-bold text-neutral-400 mb-1.5 font-sans">النوع / بلد المنشأ</label>
                  <input
                    type="text"
                    placeholder="مثال: إيطالي أصلي"
                    value={newItemSub}
                    onChange={(e) => setNewItemSub(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              ) : (
                <div className="md:col-span-4">
                  <label className="block text-4xs font-bold text-neutral-400 mb-1.5">الوصف والخصائص</label>
                  <input
                    type="text"
                    placeholder="مثال: مظهر كلاسيكي محفور مقاوم للحرارة"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-4xs font-bold text-neutral-400 mb-1.5">السعر بالريال العماني</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newItemPrice === 0 ? "" : newItemPrice}
                  onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none font-bold text-blue-600 text-left font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة الخيار</span>
                </button>
              </div>

              {/* Badges section if relevant and not addons */}
              {activeCategory !== 'addons' && selectedCategoryMeta?.hasBadge && (
                <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-dashed border-neutral-200 mt-2">
                  <div>
                    <label className="block text-4xs font-bold text-neutral-400 mb-1.5">شارة تمييز مخصصة (اختياري)</label>
                    <input
                      type="text"
                      placeholder="مثال: متميز، حصري"
                      value={newItemBadge}
                      onChange={(e) => setNewItemBadge(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-3xs focus:outline-none"
                    />
                  </div>
                  {newItemBadge && (
                    <div>
                      <label className="block text-4xs font-bold text-neutral-400 mb-1.5">نوع الشارة واللون</label>
                      <select
                        value={newItemBadgeType}
                        onChange={(e: any) => setNewItemBadgeType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-3xs focus:outline-none"
                      >
                        <option value="eco">اقتصادي (أخضر)</option>
                        <option value="mid">متوسط (برتقالي)</option>
                        <option value="gd">جيد (أزرق)</option>
                        <option value="lux">فاخر (بنفسجي)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
