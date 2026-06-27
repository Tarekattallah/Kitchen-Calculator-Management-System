import React, { useState, useEffect } from "react";
import { CatalogData } from "./types";
import KitchenCalculator from "./components/KitchenCalculator";
import AdminPanel from "./components/AdminPanel";
import { ChefHat, Settings, RefreshCw, Layers, ShieldCheck, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [activeTab, setActiveTab] = useState<"calculator" | "admin">("calculator");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch catalog on mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch("/api/catalog");
        if (!res.ok) {
          throw new Error("فشل تحميل كتالوج الموارد من السيرفر");
        }
        const data = await res.json();
        setCatalog(data);
      } catch (err: any) {
        console.error("Error loading catalog:", err);
        setError(err.message || "فشل الاتصال بكتالوج البيانات. يرجى إعادة تشغيل السيرفر.");
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Update catalog on server
  const handleSaveCatalog = async (newCatalog: CatalogData): Promise<boolean> => {
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCatalog),
      });
      if (res.ok) {
        setCatalog(newCatalog);
        return true;
      }
    } catch (err) {
      console.error("Error saving catalog:", err);
    }
    return false;
  };

  // Reset catalog to defaults on server
  const handleResetCatalog = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/catalog/reset", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setCatalog(data.catalog);
        return true;
      }
    } catch (err) {
      console.error("Error resetting catalog:", err);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full border-4 border-neutral-200 border-t-blue-600 animate-spin" />
          <ChefHat className="w-5 h-5 text-blue-600 absolute top-3.5 left-3.5 animate-pulse" />
        </div>
        <h3 className="text-sm font-bold text-neutral-800">جاري الاتصال بقاعدة البيانات والكتالوج...</h3>
        <p className="text-xs text-neutral-400 mt-1">يرجى الانتظار لحين تحميل الأسعار والمواصفات المعتمدة</p>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md shadow-sm space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-800">حدث خطأ في الاتصال بالكتالوج</h3>
            <p className="text-xs text-red-600 leading-relaxed">{error || "تأكد من أن السيرفر يعمل بشكل صحيح."}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-all"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-between" dir="rtl">
      {/* Top Premium Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* App Logo & Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-l from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/10">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-neutral-800 tracking-tight leading-none">منظومة تسعير المطابخ</h1>
                <p className="text-4xs text-neutral-400 font-medium mt-0.5">حاسبة متكاملة ومزامنة فورية للأسعار والموارد</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200/50">
              <button
                onClick={() => setActiveTab("calculator")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "calculator"
                    ? "bg-white text-blue-600 shadow-sm font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>حاسبة تسعير المطبخ</span>
              </button>

              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-white text-blue-600 shadow-sm font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>إدارة الأسعار والموارد</span>
              </button>
            </nav>

            {/* Omani Rial Badge & Status */}
            <div className="hidden md:flex items-center gap-2">
              <div className="bg-blue-50 border border-blue-100/50 px-3 py-1.5 rounded-xl text-blue-700 text-3xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>تحديث الأسعار لحظيًا بالريال العُماني (ر.ع)</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Body Stage with Staggered Entrance Motion */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            {activeTab === "calculator" && (
              <KitchenCalculator catalog={catalog} />
            )}

            {activeTab === "admin" && (
              <AdminPanel
                initialCatalog={catalog}
                onSaveCatalog={handleSaveCatalog}
                onResetCatalog={handleResetCatalog}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footnote Branding bar */}
      <footer className="bg-white border-t border-neutral-100 py-6 mt-12 text-center text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <p className="text-3xs">جميع العمليات الحسابية والصناعية ومزامنة الكتالوج تتم بشكل آمن تمامًا بالريال العُماني.</p>
          </div>
          <div className="flex items-center gap-1 text-3xs">
            <span>تم التطوير بحب وشغف</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>لتقديم تجربة تسعير وتصميم فائقة الجمال</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icon helper since we used AlertTriangle
function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
