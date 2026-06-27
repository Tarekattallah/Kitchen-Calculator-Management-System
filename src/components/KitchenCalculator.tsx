import React, { useState, useEffect } from "react";
import { CatalogData, CatalogItem, AddonItem } from "../types";
import { 
  Check, Info, ChevronLeft, ArrowLeftRight, Flame, Layers, Columns, 
  Settings, Maximize2, Lightbulb, Scissors, Plus, Minus, CheckCircle, ChefHat,
  FileDown, FileSpreadsheet
} from "lucide-react";

interface KitchenCalculatorProps {
  catalog: CatalogData;
}

export default function KitchenCalculator({ catalog }: KitchenCalculatorProps) {
  // Selections state (defaults to first item in each category if exists)
  const [wood, setWood] = useState("");
  const [door, setDoor] = useState("");
  const [ctr, setCtr] = useState("");
  const [acc, setAcc] = useState("");
  
  // Radio values
  const [height, setHeight] = useState("");
  const [handle, setHandle] = useState("");
  const [light, setLight] = useState("");
  const [finish, setFinish] = useState("");

  // Dimensions
  const [lowerLength, setLowerLength] = useState(3.0);
  const [upperLength, setUpperLength] = useState(3.0);

  // Addons quantities
  const [addonQtys, setAddonQtys] = useState<Record<string, number>>({});

  // Initialize selections once catalog is loaded
  useEffect(() => {
    if (catalog) {
      if (catalog.wood?.length) setWood(catalog.wood[0].id);
      if (catalog.door?.length) setDoor(catalog.door[0].id);
      if (catalog.ctr?.length) setCtr(catalog.ctr[0].id);
      if (catalog.acc?.length) setAcc(catalog.acc[0].id);
      
      if (catalog.height?.length) setHeight(catalog.height[0].id);
      if (catalog.handle?.length) setHandle(catalog.handle[0].id);
      if (catalog.light?.length) setLight(catalog.light[0].id);
      if (catalog.finish?.length) setFinish(catalog.finish[0].id);

      // Initialize addon quantities
      const initialQtys: Record<string, number> = {};
      catalog.addons?.forEach((item) => {
        initialQtys[item.id] = 0;
      });
      setAddonQtys(initialQtys);
    }
  }, [catalog]);

  const handleAddonQtyChange = (id: string, delta: number) => {
    setAddonQtys((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const exportToExcel = () => {
    // BOM to support Arabic text in Excel/CSV
    let csvContent = "\ufeff";
    csvContent += "البند,المواصفات المختارة,المقاس / الكمية,السعر الإجمالي (ر.ع)\n";
    
    csvContent += `الهيكل الداخلي (الكاركاس),${selectedWoodObj?.name || ""},${lowerLength.toFixed(1)} متر (سفلي) + ${upperLength.toFixed(1)} متر (علوي),${lowerCabinetsPrice + upperCabinetsPrice}\n`;
    csvContent += `واجهة الأبواب,${selectedDoorObj?.name || ""},${(lowerLength + upperLength).toFixed(1)} متر,مشمول في الهيكل طولي\n`;
    csvContent += `سطح العمل الرخام,${selectedCtrObj?.name || ""},${counterArea.toFixed(2)} متر مربع,${counterPrice}\n`;
    csvContent += `المفصلات والملحقات,${selectedAccObj?.name || ""},${(lowerLength + upperLength).toFixed(1)} متر طولي,${hingesPrice}\n`;
    csvContent += `تقفيل السقف والارتفاع,${selectedHeightObj?.name || ""},-,${heightPrice}\n`;
    csvContent += `نظام فتح الأبواب والمقابض,${selectedHandleObj?.name || ""},-,${handlePrice}\n`;
    csvContent += `الإضاءة المخفية,${selectedLightObj?.name || ""},${upperLength.toFixed(1)} متر,${lightPrice}\n`;
    csvContent += `تشطيب الحواف,${selectedFinishObj?.name || ""},${lowerLength.toFixed(1)} متر,${finishPrice}\n`;
    
    // Addons
    catalog.addons?.forEach((item) => {
      const qty = addonQtys[item.id] || 0;
      if (qty > 0) {
        csvContent += `إضافة: ${item.name},${item.sub || ""},${qty} قطعة,${qty * item.price}\n`;
      }
    });
    
    csvContent += `التركيب والضمان والتشطيب,,12% من قيمة الخزائن,${installationPrice}\n`;
    csvContent += `الإجمالي الكلي التقديري,,,${grandTotal} ر.ع\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_تسعير_مطبخ_عماني_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Build lists of selected addons
    const selectedAddonsHtml = catalog.addons
      ?.filter((item) => (addonQtys[item.id] || 0) > 0)
      ?.map((item) => {
        const qty = addonQtys[item.id];
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155; text-align: right;"><strong>إضافة: ${item.name}</strong><br><small style="color: #64748b;">${item.sub || ""}</small></td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; color: #334155;">${qty} قطعة</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: left; font-weight: bold; color: #1e293b;">${item.price} ر.ع</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: left; font-weight: bold; color: #1e293b;">${qty * item.price} ر.ع</td>
          </tr>
        `;
      })
      .join("") || "";

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير عرض سعر مطبخ معتمد</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
            margin: 0;
            padding: 40px;
            color: #1e293b;
            background-color: #ffffff;
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #f59e0b;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .logo-icon {
            width: 45px;
            height: 45px;
            background-color: #1e293b;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-text h1 {
            font-size: 20px;
            font-weight: 800;
            margin: 0;
            color: #1e293b;
          }
          .logo-text p {
            font-size: 10px;
            margin: 3px 0 0 0;
            color: #64748b;
          }
          .quote-meta {
            text-align: left;
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
          }
          .title {
            text-align: center;
            font-size: 22px;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 25px;
            letter-spacing: -0.5px;
          }
          .info-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            background-color: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 12px;
            padding: 15px 20px;
            margin-bottom: 30px;
          }
          .info-item {
            font-size: 13px;
            line-height: 1.8;
          }
          .info-label {
            font-weight: 700;
            color: #475569;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .table th {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: 700;
            font-size: 12px;
            padding: 12px;
            text-align: right;
          }
          .table th:nth-child(2) {
            text-align: center;
          }
          .table th:nth-child(3), .table th:nth-child(4) {
            text-align: left;
          }
          .table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12.5px;
            color: #334155;
          }
          .total-box {
            float: left;
            width: 320px;
            background-color: #f8fafc;
            border: 2px solid #1e293b;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 40px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-bottom: 8px;
            color: #475569;
          }
          .total-grand {
            border-top: 2px solid #e2e8f0;
            padding-top: 10px;
            font-size: 16px;
            font-weight: 800;
            color: #2563eb;
            margin-bottom: 0;
          }
          .clear {
            clear: both;
          }
          .terms {
            background-color: #fffbeb;
            border: 1px solid #fef3c7;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
            font-size: 11px;
            color: #78350f;
            line-height: 1.8;
          }
          .terms h4 {
            margin: 0 0 10px 0;
            font-size: 13px;
            font-weight: 700;
          }
          .signatures {
            margin-top: 50px;
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 40px;
            text-align: center;
          }
          .signature-box {
            border-top: 1px dashed #cbd5e1;
            padding-top: 15px;
            font-size: 13px;
            font-weight: 700;
            color: #475569;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="logo-area">
            <div class="logo-icon">
              <svg viewBox="0 0 100 100" style="width: 28px; height: 28px;" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="15" width="70" height="70" rx="10" stroke="#F59E0B" stroke-width="8" stroke-linejoin="round" />
                <line x1="15" y1="50" x2="85" y2="50" stroke="#F59E0B" stroke-width="8" />
                <line x1="38" y1="32" x2="48" y2="32" stroke="#F59E0B" stroke-width="7" stroke-linecap="round" />
                <line x1="38" y1="68" x2="48" y2="68" stroke="#F59E0B" stroke-width="7" stroke-linecap="round" />
                <line x1="50" y1="50" x2="50" y2="85" stroke="#F59E0B" stroke-width="8" />
              </svg>
            </div>
            <div class="logo-text">
              <h1>مطابخ العُمانية</h1>
              <p>رؤية معمارية حديثة وموثوقية في التسعير والتصميم</p>
            </div>
          </div>
          <div class="quote-meta">
            <div>رقم العرض: OMK-2026-${Math.floor(1000 + Math.random() * 9000)}</div>
            <div>التاريخ: ${new Date().toLocaleDateString("ar-EG")}</div>
            <div>صلاحية العرض: 30 يوماً من تاريخه</div>
          </div>
        </div>

        <div class="title">تقرير عرض سعر ومواصفات مطبخ معتمد</div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">اسم العميل الكريـم:</span> ___________________________
          </div>
          <div class="info-item" style="text-align: left;">
            <span class="info-label">رقم الهاتف للتواصل:</span> ___________________________
          </div>
          <div class="info-item">
            <span class="info-label">طول المطبخ السفلي:</span> ${lowerLength.toFixed(1)} متر طولي
          </div>
          <div class="info-item" style="text-align: left;">
            <span class="info-label">طول المطبخ العلوي:</span> ${upperLength.toFixed(1)} متر طولي
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 45%;">البند والمواصفات المختارة</th>
              <th style="width: 20%; text-align: center;">المقاس / الكمية</th>
              <th style="width: 15%; text-align: left;">سعر الوحدة</th>
              <th style="width: 20%; text-align: left;">السعر الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>الهيكل الداخلي (الكاركاس):</strong> ${selectedWoodObj?.name || ""}<br>
                <small style="color:#64748b; font-size:10.5px;">${selectedWoodObj?.desc || ""}</small>
              </td>
              <td style="text-align: center;">${lowerLength.toFixed(1)} م طولي (سفلي) <br> ${upperLength.toFixed(1)} م طولي (علوي)</td>
              <td style="text-align: left;">${basePricePerMeter} ر.ع / متر</td>
              <td style="text-align: left; font-weight: bold;">${lowerCabinetsPrice + upperCabinetsPrice} ر.ع</td>
            </tr>
            <tr>
              <td>
                <strong>أبواب المطبخ الخارجية:</strong> ${selectedDoorObj?.name || ""}<br>
                <small style="color:#64748b; font-size:10.5px;">${selectedDoorObj?.desc || ""}</small>
              </td>
              <td style="text-align: center;">مشمول بالكامل</td>
              <td style="text-align: left;">-</td>
              <td style="text-align: left; font-weight: bold;">مشمول بالهيكل</td>
            </tr>
            <tr>
              <td>
                <strong>سطح العمل (الرخام/الجرانيت):</strong> ${selectedCtrObj?.name || ""}<br>
                <small style="color:#64748b; font-size:10.5px;">${selectedCtrObj?.desc || ""}</small>
              </td>
              <td style="text-align: center;">${counterArea.toFixed(2)} متر مربع</td>
              <td style="text-align: left;">${selectedCtrObj?.price || 0} ر.ع / م²</td>
              <td style="text-align: left; font-weight: bold;">${counterPrice} ر.ع</td>
            </tr>
            <tr>
              <td>
                <strong>المفصلات وسحاب الأدراج:</strong> ${selectedAccObj?.name || ""}<br>
                <small style="color:#64748b; font-size:10.5px;">${selectedAccObj?.desc || ""}</small>
              </td>
              <td style="text-align: center;">${(lowerLength + upperLength).toFixed(1)} م طولي</td>
              <td style="text-align: left;">${selectedAccObj?.price || 0} ر.ع / م</td>
              <td style="text-align: left; font-weight: bold;">${hingesPrice} ر.ع</td>
            </tr>
            ${heightPrice > 0 ? `
            <tr>
              <td>
                <strong>تقفيل السقف / الارتفاع:</strong> ${selectedHeightObj?.name || ""}<br>
                <small style="color:#64748b; font-size:10.5px;">${selectedHeightObj?.desc || ""}</small>
              </td>
              <td style="text-align: center;">${(lowerLength + upperLength).toFixed(1)} م طولي</td>
              <td style="text-align: left;">${selectedHeightObj?.price || 0} ر.ع / م</td>
              <td style="text-align: left; font-weight: bold;">${heightPrice} ر.ع</td>
            </tr>
            ` : ""}
            ${handlePrice > 0 ? `
            <tr>
              <td>
                <strong>نظام فتح الأبواب والمقابض:</strong> ${selectedHandleObj?.name || ""}<br>
                <small style="color:#64748b; font-size:10.5px;">${selectedHandleObj?.desc || ""}</small>
              </td>
              <td style="text-align: center;">${(lowerLength + upperLength).toFixed(1)} م طولي</td>
              <td style="text-align: left;">${selectedHandleObj?.price || 0} ر.ع / م</td>
              <td style="text-align: left; font-weight: bold;">${handlePrice} ر.ع</td>
            </tr>
            ` : ""}
            ${lightPrice > 0 ? `
            <tr>
              <td>
                <strong>الإضاءة الخلفية والملحقات:</strong> ${selectedLightObj?.name || ""}<br>
                <small style="color:#64748b; font-size:10.5px;">${selectedLightObj?.desc || ""}</small>
              </td>
              <td style="text-align: center;">${upperLength.toFixed(1)} م طولي</td>
              <td style="text-align: left;">${selectedLightObj?.price || 0} ر.ع / م</td>
              <td style="text-align: left; font-weight: bold;">${lightPrice} ر.ع</td>
            </tr>
            ` : ""}
            ${finishPrice > 0 ? `
            <tr>
              <td>
                <strong>تشطيب وتقفيل الحواف:</strong> ${selectedFinishObj?.name || ""}<br>
                <small style="color:#64748b; font-size:10.5px;">${selectedFinishObj?.desc || ""}</small>
              </td>
              <td style="text-align: center;">${lowerLength.toFixed(1)} م طولي</td>
              <td style="text-align: left;">${selectedFinishObj?.price || 0} ر.ع / م</td>
              <td style="text-align: left; font-weight: bold;">${finishPrice} ر.ع</td>
            </tr>
            ` : ""}
            ${selectedAddonsHtml}
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155;">
                <strong>التركيب والضمان والتشطيب النهائي:</strong><br>
                <small style="color:#64748b; font-size:10.5px;">شامل التوصيل والتركيب الاحترافي بجميع ولايات سلطنة عُمان</small>
              </td>
              <td style="text-align: center; padding: 12px; border-bottom: 1px solid #e2e8f0;">نسبة 12% من الخزائن</td>
              <td style="text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0;">-</td>
              <td style="text-align: left; font-weight: bold; padding: 12px; border-bottom: 1px solid #e2e8f0;">${installationPrice} ر.ع</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row">
            <span>إجمالي قيمة الخزائن والرخام:</span>
            <span>${lowerCabinetsPrice + upperCabinetsPrice + counterPrice} ر.ع</span>
          </div>
          <div class="total-row">
            <span>إجمالي الإكسسوارات والتشطيب والتركيب:</span>
            <span>${hingesPrice + heightPrice + handlePrice + lightPrice + finishPrice + addonsPrice + installationPrice} ر.ع</span>
          </div>
          <div class="total-row total-grand">
            <span>الإجمالي الكلي النهائي:</span>
            <span>${grandTotal} ر.ع</span>
          </div>
        </div>

        <div class="clear"></div>

        <div class="terms">
          <h4>الشروط والأحكام الفنية والتجارية:</h4>
          1. يتم توريد المطبخ وتركيبه خلال مدة لا تتجاوز 35 إلى 45 يوم عمل من تاريخ سداد الدفعة الأولى واعتماد المقاسات النهائية للموقع.<br>
          2. يمنح المصنع ضماناً فعلياً لمدة 10 سنوات على الهيكل الخشبي والأبواب ومقاومة المياه والفك والتركيب، وضمان 5 سنوات على المفصلات والإكسسوارات الهيدروليكية.<br>
          3. شروط الدفع: 50% دفعة مقدمة عند التوقيع والتعاقد وبدء التصنيع، 40% عند الانتهاء من تصنيع المطبخ في الورشة وقبل خروجه للتوصيل، و10% فور إتمام عملية التركيب والتشغيل بنجاح.<br>
          4. يشترط جاهزية جدران وأرضيات المطبخ وأعمال السباكة والكهرباء والتبليط قبل البدء بأعمال القياس والتركيب وتثبيت الرخام.
        </div>

        <div class="signatures">
          <div class="signature-box">
            توقيع العميل الكريم<br><br><br>
            ___________________________
          </div>
          <div class="signature-box">
            توقيع واعتماد ممثل إدارة المصنع والمبيعات<br><br><br>
            ___________________________
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Find selected objects
  const selectedWoodObj = catalog.wood?.find(i => i.id === wood);
  const selectedDoorObj = catalog.door?.find(i => i.id === door);
  const selectedCtrObj = catalog.ctr?.find(i => i.id === ctr);
  const selectedAccObj = catalog.acc?.find(i => i.id === acc);
  
  const selectedHeightObj = catalog.height?.find(i => i.id === height);
  const selectedHandleObj = catalog.handle?.find(i => i.id === handle);
  const selectedLightObj = catalog.light?.find(i => i.id === light);
  const selectedFinishObj = catalog.finish?.find(i => i.id === finish);

  // Prices calculation
  const basePricePerMeter = (selectedWoodObj?.price || 0) + (selectedDoorObj?.price || 0);
  
  const lowerCabinetsPrice = Math.round(lowerLength * basePricePerMeter);
  const upperCabinetsPrice = Math.round(upperLength * basePricePerMeter * 0.75);
  
  const counterArea = Math.round(lowerLength * 0.65 * 100) / 100;
  const counterPrice = Math.round(counterArea * (selectedCtrObj?.price || 0));
  
  const hingesPrice = Math.round((lowerLength + upperLength) * (selectedAccObj?.price || 0));
  const heightPrice = Math.round((lowerLength + upperLength) * (selectedHeightObj?.price || 0));
  const handlePrice = Math.round((lowerLength + upperLength) * (selectedHandleObj?.price || 0));
  const lightPrice = Math.round(upperLength * (selectedLightObj?.price || 0));
  const finishPrice = Math.round(lowerLength * (selectedFinishObj?.price || 0));

  let addonsPrice = 0;
  catalog.addons?.forEach((item) => {
    addonsPrice += (addonQtys[item.id] || 0) * item.price;
  });

  // Installation (12% of cabinet value)
  const installationPrice = Math.round((lowerCabinetsPrice + upperCabinetsPrice) * 0.12);
  
  // Grand total
  const grandTotal = lowerCabinetsPrice + upperCabinetsPrice + counterPrice + hingesPrice + heightPrice + handlePrice + lightPrice + finishPrice + addonsPrice + installationPrice;

  // Maximum benchmark for pricing bar
  const maxBenchmark = 12 * (160 + 120) * 1.75 * 1.12 + 12 * 0.65 * 270 + 12 * 120 + 12 * 50 + 12 * 18 + 12 * 15 + 12 * 50 + 450 + 380 + 290 + 340 + 180 + 90;
  const pricePct = Math.max(3, Math.min(97, Math.round((grandTotal / maxBenchmark) * 100)));

  // Cost tier name and styling
  let costTier = "اقتصادي";
  let costTierClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let costTierBarClass = "bg-emerald-500";
  if (pricePct < 25) {
    costTier = "اقتصادي الميزانية";
    costTierClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
    costTierBarClass = "bg-emerald-500";
  } else if (pricePct < 50) {
    costTier = "متوسط متوازن";
    costTierClass = "bg-amber-50 text-amber-700 border-amber-100";
    costTierBarClass = "bg-amber-500";
  } else if (pricePct < 75) {
    costTier = "جيد / متميز";
    costTierClass = "bg-blue-50 text-blue-700 border-blue-100";
    costTierBarClass = "bg-blue-500";
  } else {
    costTier = "فاخر VIP";
    costTierClass = "bg-purple-50 text-purple-700 border-purple-100";
    costTierBarClass = "bg-purple-500";
  }

  // Styles/Colors mapping for 2D diagram
  const getWoodColor = (id: string) => {
    switch (id) {
      case "chip": return "#D8C8A8";
      case "mdf": return "#E8DCC8";
      case "mdf_w": return "#D0E0D0";
      case "hdf": return "#C5B89A";
      case "ply": return "#C4A882";
      case "solid": return "#8B5E3C";
      default: return "#E8DCC8";
    }
  };

  const getDoorColor = (id: string) => {
    switch (id) {
      case "melamine": return "#EAE8E4";
      case "pvc": return "#C8BA9A";
      case "hpl": return "#5C5040";
      case "acrylic": return "#3b82f6"; // glossy blue
      case "glass": return "#93c5fd"; // translucent light blue
      case "veneer": return "#A0724A";
      default: return "#EAE8E4";
    }
  };

  const getCounterColor = (id: string) => {
    switch (id) {
      case "gran_l": return "#9E9E8E";
      case "gran_i": return "#B8A090";
      case "quartz": return "#E8E4E0";
      case "porce": return "#2C3440";
      case "corian": return "#F0EBE0";
      case "marble": return "#F5F2EE";
      default: return "#E8E4E0";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 text-right" dir="rtl" id="kitchen-calc-root">
      {/* 10 Step Form Selections */}
      <div className="xl:col-span-8 space-y-8">
        
        {/* Step 1: Wood Carcass */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">١</span>
            <h3 className="font-semibold text-neutral-800 text-sm">الهيكل الداخلي (الكاركاس) — السعر لكل متر طولي</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {catalog.wood?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setWood(item.id)}
                className={`relative flex flex-col items-center justify-between p-4 rounded-xl border text-center transition-all min-h-[160px] h-full ${
                  wood === item.id 
                    ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/10" 
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {/* Simulated tactile wood chip icon */}
                <div className="w-12 h-8 rounded-md mb-2 overflow-hidden shadow-xs border border-neutral-100" style={{ backgroundColor: getWoodColor(item.id) }}>
                  <div className="w-full h-full opacity-30 bg-repeat bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />
                </div>
                <div className="flex-1 flex flex-col justify-center w-full">
                  <span className="text-xs font-bold text-neutral-800 leading-tight w-full">{item.name}</span>
                  <span className="text-3xs text-neutral-400 mt-1 leading-normal w-full whitespace-normal px-1">{item.desc}</span>
                </div>
                <span className="text-xs font-bold text-blue-600 mt-2">{item.price} ر.ع</span>
                {item.badge && (
                  <span className={`absolute top-1.5 right-1.5 text-4xs font-semibold px-1 rounded ${
                    item.badgeType === "eco" ? "bg-emerald-100 text-emerald-800" :
                    item.badgeType === "mid" ? "bg-amber-100 text-amber-800" :
                    item.badgeType === "gd" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}>{item.badge}</span>
                )}
                {wood === item.id && (
                  <div className="absolute -bottom-1 -left-1 bg-blue-600 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Door Front */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">٢</span>
            <h3 className="font-semibold text-neutral-800 text-sm">واجهة الأبواب الخارجية — السعر لكل متر طولي</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {catalog.door?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDoor(item.id)}
                className={`relative flex flex-col items-center justify-between p-4 rounded-xl border text-center transition-all min-h-[160px] h-full ${
                  door === item.id 
                    ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/10" 
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div className="w-12 h-8 rounded-md mb-2 overflow-hidden shadow-xs border border-neutral-100 flex items-center justify-center" style={{ backgroundColor: getDoorColor(item.id) }}>
                  {item.id === "glass" && <div className="w-8 h-4 bg-white/40 rounded border border-white/60 text-center text-4xs text-white">زجاج</div>}
                  {item.id === "veneer" && <div className="w-full h-full opacity-40 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:10px_100%]" />}
                </div>
                <div className="flex-1 flex flex-col justify-center w-full">
                  <span className="text-xs font-bold text-neutral-800 leading-tight w-full">{item.name}</span>
                  <span className="text-3xs text-neutral-400 mt-1 leading-normal w-full whitespace-normal px-1">{item.desc}</span>
                </div>
                <span className="text-xs font-bold text-blue-600 mt-2">{item.price === 0 ? "مشمول" : `+${item.price} ر.ع`}</span>
                {item.badge && (
                  <span className={`absolute top-1.5 right-1.5 text-4xs font-semibold px-1 rounded ${
                    item.badgeType === "eco" ? "bg-emerald-100 text-emerald-800" :
                    item.badgeType === "mid" ? "bg-amber-100 text-amber-800" :
                    item.badgeType === "gd" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}>{item.badge}</span>
                )}
                {door === item.id && (
                  <div className="absolute -bottom-1 -left-1 bg-blue-600 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Countertop */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">٣</span>
            <h3 className="font-semibold text-neutral-800 text-sm">سطح العمل (الرخام/الجرانيت) — السعر لكل متر مربع</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {catalog.ctr?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCtr(item.id)}
                className={`relative flex flex-col items-center justify-between p-4 rounded-xl border text-center transition-all min-h-[160px] h-full ${
                  ctr === item.id 
                    ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/10" 
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div className="w-12 h-8 rounded-md mb-2 overflow-hidden shadow-xs border border-neutral-100" style={{ backgroundColor: getCounterColor(item.id) }}>
                  <div className="w-full h-full opacity-30 bg-repeat bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />
                </div>
                <div className="flex-1 flex flex-col justify-center w-full">
                  <span className="text-xs font-bold text-neutral-800 leading-tight w-full">{item.name}</span>
                  <span className="text-3xs text-neutral-400 mt-1 leading-normal w-full whitespace-normal px-1">{item.desc}</span>
                </div>
                <span className="text-xs font-bold text-blue-600 mt-2">{item.price} ر.ع / م²</span>
                {item.badge && (
                  <span className={`absolute top-1.5 right-1.5 text-4xs font-semibold px-1 rounded ${
                    item.badgeType === "eco" ? "bg-emerald-100 text-emerald-800" :
                    item.badgeType === "mid" ? "bg-amber-100 text-amber-800" :
                    item.badgeType === "gd" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}>{item.badge}</span>
                )}
                {ctr === item.id && (
                  <div className="absolute -bottom-1 -left-1 bg-blue-600 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Hinges */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">٤</span>
            <h3 className="font-semibold text-neutral-800 text-sm">المفصلات وسحاب الأدراج — السعر لكل متر طولي</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {catalog.acc?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAcc(item.id)}
                className={`relative flex flex-col items-center justify-between p-4 rounded-xl border text-center transition-all min-h-[135px] h-full ${
                  acc === item.id 
                    ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/10" 
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div className="flex-1 flex flex-col justify-center w-full">
                  <span className="text-xs font-bold text-neutral-800 leading-tight w-full">{item.name}</span>
                  <span className="text-3xs text-neutral-400 mt-1.5 leading-normal w-full whitespace-normal px-1">{item.desc}</span>
                </div>
                <span className="text-xs font-bold text-blue-600 mt-2">{item.price === 0 ? "مشمول" : `+${item.price} ر.ع / م`}</span>
                {item.badge && (
                  <span className={`absolute top-1.5 right-1.5 text-4xs font-semibold px-1 rounded ${
                    item.badgeType === "eco" ? "bg-emerald-100 text-emerald-800" :
                    item.badgeType === "mid" ? "bg-amber-100 text-amber-800" :
                    item.badgeType === "gd" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}>{item.badge}</span>
                )}
                {acc === item.id && (
                  <div className="absolute -bottom-1 -left-1 bg-blue-600 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Steps 5, 6, 7, 8: Radio Config Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 5: Height */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">٥</span>
              <h3 className="font-semibold text-neutral-800 text-sm">الارتفاع وتقفيل السقف</h3>
            </div>
            <div className="space-y-2">
              {catalog.height?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHeight(item.id)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border text-right transition-all ${
                    height === item.id ? "border-blue-600 bg-blue-50/40" : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${height === item.id ? "border-blue-600" : "border-neutral-300"}`}>
                      {height === item.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-800">{item.name}</div>
                      <div className="text-3xs text-neutral-400 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{item.price === 0 ? "مشمول" : `+${item.price} ر.ع / م`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 6: Opening System / Handles */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">٦</span>
              <h3 className="font-semibold text-neutral-800 text-sm">نظام فتح الأبواب والمقابض</h3>
            </div>
            <div className="space-y-2">
              {catalog.handle?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHandle(item.id)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border text-right transition-all ${
                    handle === item.id ? "border-blue-600 bg-blue-50/40" : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${handle === item.id ? "border-blue-600" : "border-neutral-300"}`}>
                      {handle === item.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-800">{item.name}</div>
                      <div className="text-3xs text-neutral-400 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{item.price === 0 ? "مشمول" : `+${item.price} ر.ع / م`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 7: Hidden Lighting */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">٧</span>
              <h3 className="font-semibold text-neutral-800 text-sm">الإضاءة المخفية (تحت الوحدات العلوية)</h3>
            </div>
            <div className="space-y-2">
              {catalog.light?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLight(item.id)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border text-right transition-all ${
                    light === item.id ? "border-blue-600 bg-blue-50/40" : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${light === item.id ? "border-blue-600" : "border-neutral-300"}`}>
                      {light === item.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-800">{item.name}</div>
                      <div className="text-3xs text-neutral-400 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{item.price === 0 ? "مجاني" : `+${item.price} ر.ع / م`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 8: Worktop Finishing */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">٨</span>
              <h3 className="font-semibold text-neutral-800 text-sm">تشطيب وتقفيل حواف سطح العمل</h3>
            </div>
            <div className="space-y-2">
              {catalog.finish?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFinish(item.id)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border text-right transition-all ${
                    finish === item.id ? "border-blue-600 bg-blue-50/40" : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${finish === item.id ? "border-blue-600" : "border-neutral-300"}`}>
                      {finish === item.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-800">{item.name}</div>
                      <div className="text-3xs text-neutral-400 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{item.price === 0 ? "مجاني" : `+${item.price} ر.ع / م`}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 9: Addons */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">٩</span>
            <h3 className="font-semibold text-neutral-800 text-sm">الإضافات والأجهزة المدمجة (بالحبة)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {catalog.addons?.map((item) => {
              const qty = addonQtys[item.id] || 0;
              return (
                <div key={item.id} className="flex justify-between items-center p-3.5 bg-neutral-50 border border-neutral-100 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800">{item.name}</h4>
                    <p className="text-3xs text-neutral-400 mt-0.5">{item.sub}</p>
                    <span className="inline-block text-xs font-semibold text-blue-600 mt-1">{item.price} ر.ع</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => handleAddonQtyChange(item.id, -1)}
                      className="w-7 h-7 rounded bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 active:scale-90 transition-all font-bold text-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-neutral-800 min-w-[20px] text-center">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddonQtyChange(item.id, 1)}
                      className="w-7 h-7 rounded bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 active:scale-90 transition-all font-bold text-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 10: Dimensions sliders */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 border-b border-neutral-50 pb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">١٠</span>
            <h3 className="font-semibold text-neutral-800 text-sm">أطوال ومقاسات المطبخ</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-50 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-neutral-700">طول الوحدات السفلية</span>
                <span className="text-sm font-bold text-blue-600">{lowerLength.toFixed(1)} متر</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.5"
                value={lowerLength}
                onChange={(e) => setLowerLength(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-4xs text-neutral-400 mt-1">
                <span>1.0 م</span>
                <span>6.0 م</span>
                <span>12.0 م</span>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-neutral-700">طول الوحدات العلوية</span>
                <span className="text-sm font-bold text-blue-600">{upperLength.toFixed(1)} متر</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="12.0"
                step="0.5"
                value={upperLength}
                onChange={(e) => setUpperLength(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-4xs text-neutral-400 mt-1">
                <span>0.0 م (بدون علوي)</span>
                <span>6.0 م</span>
                <span>12.0 م</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Dynamic SVG Preview & Price Summary */}
      <div className="xl:col-span-4 space-y-6">
        
        {/* Interactive Visual Kitchen Blueprint Drawing */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
            <h4 className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-blue-500" />
              رسم تخطيطي تفاعلي للمطبخ المختار:
            </h4>
            <span className="text-4xs text-neutral-400">تفاعلي لحظي</span>
          </div>

          <div className="relative border border-neutral-100 rounded-xl bg-neutral-900 overflow-hidden flex justify-center items-center h-[240px] shadow-inner">
            <svg viewBox="0 0 500 300" className="w-full h-full">
              {/* Back wall background */}
              <rect x="0" y="0" width="500" height="300" fill="#2d3748" />
              
              {/* Floor */}
              <rect x="0" y="240" width="500" height="60" fill="#1a202c" />

              {/* Backsplash panel (only if finish is backsplash) */}
              {finish === "backsplash" && (
                <rect x="60" y="110" width="380" height="60" fill={getCounterColor(ctr)} opacity="0.8" />
              )}

              {/* Upper Cabinets - Dynamic Width based on upperLength slider */}
              {upperLength > 0 && (
                <g>
                  {/* Ceiling filler (if full-ceiling height is chosen) */}
                  {height === "full" && (
                    <rect x="80" y="15" width="340" height="25" fill={getWoodColor(wood)} stroke="#1a202c" strokeWidth="1" />
                  )}

                  {/* Main Carcass of upper cabinet */}
                  <rect 
                    x="80" 
                    y={height === "full" ? 40 : height === "extended" ? 45 : 55} 
                    width="340" 
                    height={height === "full" ? 70 : height === "extended" ? 65 : 55} 
                    fill={getWoodColor(wood)} 
                    stroke="#1a202c" 
                    strokeWidth="2" 
                  />
                  
                  {/* Cabinet doors based on Door front style and colors */}
                  <g opacity="0.9">
                    {/* Door 1 */}
                    <rect 
                      x="82" 
                      y={height === "full" ? 42 : height === "extended" ? 47 : 57} 
                      width="80" 
                      height={height === "full" ? 66 : height === "extended" ? 61 : 51} 
                      fill={getDoorColor(door)} 
                      stroke="#1a202c" 
                      strokeWidth="1.5" 
                      rx={door === "glass" ? 2 : 0}
                    />
                    {/* Glass visual border/reflection */}
                    {door === "glass" && (
                      <line x1="88" y1="62" x2="110" y2="62" stroke="#fff" strokeWidth="1" opacity="0.6" />
                    )}

                    {/* Door 2 */}
                    <rect 
                      x="164" 
                      y={height === "full" ? 42 : height === "extended" ? 47 : 57} 
                      width="80" 
                      height={height === "full" ? 66 : height === "extended" ? 61 : 51} 
                      fill={getDoorColor(door)} 
                      stroke="#1a202c" 
                      strokeWidth="1.5" 
                    />

                    {/* Door 3 */}
                    <rect 
                      x="246" 
                      y={height === "full" ? 42 : height === "extended" ? 47 : 57} 
                      width="80" 
                      height={height === "full" ? 66 : height === "extended" ? 61 : 51} 
                      fill={getDoorColor(door)} 
                      stroke="#1a202c" 
                      strokeWidth="1.5" 
                    />

                    {/* Door 4 */}
                    <rect 
                      x="328" 
                      y={height === "full" ? 42 : height === "extended" ? 47 : 57} 
                      width="90" 
                      height={height === "full" ? 66 : height === "extended" ? 61 : 51} 
                      fill={getDoorColor(door)} 
                      stroke="#1a202c" 
                      strokeWidth="1.5" 
                    />
                  </g>

                  {/* Under cabinet LED Light bar glow */}
                  {light !== "none" && (
                    <g>
                      <rect x="80" y="110" width="340" height="4" fill="#eab308" filter="blur(1px)" />
                      {/* Glow polygon reflecting on counter */}
                      <polygon points="80,114 420,114 440,170 60,170" fill="url(#ledGlowGrad)" opacity="0.3" />
                    </g>
                  )}
                </g>
              )}

              {/* Countertop Slab */}
              <g>
                {/* Slab outline and fill based on countertops selection */}
                <rect x="60" y="170" width="380" height="12" fill={getCounterColor(ctr)} stroke="#1a202c" strokeWidth="1.5" />
                {/* Bevelled corner visual (if bullnose or laser finish) */}
                {finish === "bullnose" && (
                  <rect x="58" y="170" width="4" height="12" rx="2" fill={getCounterColor(ctr)} opacity="0.7" />
                )}
                {finish === "laser" && (
                  <line x1="60" y1="182" x2="440" y2="182" stroke="#fff" strokeWidth="1" opacity="0.4" />
                )}
              </g>

              {/* Lower Cabinets - Dynamic Width based on lowerLength slider */}
              <g>
                {/* Main carcass base */}
                <rect x="60" y="182" width="380" height="58" fill={getWoodColor(wood)} stroke="#1a202c" strokeWidth="2" />
                
                {/* Plinth/Toe kick */}
                <rect x="70" y="230" width="360" height="10" fill="#2d3748" opacity="0.8" />

                {/* Doors and drawers */}
                <g opacity="0.95">
                  {/* Left big cabinet drawer block */}
                  <rect x="62" y="184" width="90" height="44" fill={getDoorColor(door)} stroke="#1a202c" strokeWidth="1.5" />
                  
                  {/* Middle Double Cabinets */}
                  <rect x="154" y="184" width="85" height="44" fill={getDoorColor(door)} stroke="#1a202c" strokeWidth="1.5" />
                  <rect x="241" y="184" width="85" height="44" fill={getDoorColor(door)} stroke="#1a202c" strokeWidth="1.5" />

                  {/* Right drawers stack */}
                  <rect x="328" y="184" width="110" height="14" fill={getDoorColor(door)} stroke="#1a202c" strokeWidth="1.2" />
                  <rect x="328" y="200" width="110" height="14" fill={getDoorColor(door)} stroke="#1a202c" strokeWidth="1.2" />
                  <rect x="328" y="216" width="110" height="12" fill={getDoorColor(door)} stroke="#1a202c" strokeWidth="1.2" />
                </g>

                {/* Handles rendering if traditional classic is selected */}
                {handle === "classic" && (
                  <g stroke="#a0aec0" strokeWidth="2" strokeLinecap="round">
                    {/* Classic handles on drawers */}
                    <line x1="102" y1="190" x2="112" y2="190" />
                    <line x1="192" y1="206" x2="192" y2="216" />
                    <line x1="246" y1="206" x2="246" y2="216" />
                    
                    <line x1="378" y1="191" x2="388" y2="191" />
                    <line x1="378" y1="207" x2="388" y2="207" />
                    <line x1="378" y1="222" x2="388" y2="222" />
                  </g>
                )}

                {/* Gola channel visual run below countertop */}
                {handle === "gola" && (
                  <rect x="60" y="182" width="380" height="3" fill="#a0aec0" opacity="0.9" />
                )}
              </g>

              {/* Integrated Oven (if custom quantity of oven > 0) */}
              {(addonQtys["oven_eco"] > 0 || addonQtys["oven_mid"] > 0 || addonQtys["oven_lux"] > 0) && (
                <g>
                  {/* Replace Middle Doors with Oven */}
                  <rect x="160" y="184" width="160" height="44" fill="#1a202c" stroke="#4a5568" strokeWidth="2" />
                  <rect x="170" y="192" width="140" height="30" fill="#2d3748" rx="2" />
                  {/* Oven window glass */}
                  <rect x="180" y="196" width="120" height="18" fill="#e2e8f0" opacity="0.15" />
                  {/* Handle bar of oven */}
                  <line x1="190" y1="188" x2="310" y2="188" stroke="#a0aec0" strokeWidth="2.5" />
                  {/* Glowing light inside if on */}
                  <circle cx="240" cy="205" r="3" fill="#ecc94b" opacity="0.6" />
                </g>
              )}

              {/* Integrated Hob / Cooktop on Counter */}
              {(addonQtys["hob_eco"] > 0 || addonQtys["hob_mid"] > 0 || addonQtys["hob_lux"] > 0) && (
                <g>
                  {/* Glass cooktop plate */}
                  <rect x="200" y="169" width="80" height="2" fill="#1a202c" />
                  {/* Cooking burners */}
                  <ellipse cx="220" cy="170" rx="10" ry="1.5" fill="none" stroke="#e53e3e" strokeWidth="1.2" opacity="0.8" />
                  <ellipse cx="260" cy="170" rx="12" ry="1.5" fill="none" stroke="#3182ce" strokeWidth="1" opacity="0.9" />
                </g>
              )}

              {/* Gradients and patterns definitions for the drawing */}
              <defs>
                <linearGradient id="ledGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing neon helper details label */}
            <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-4xs font-mono text-neutral-300 p-1.5 rounded border border-neutral-700 space-y-0.5">
              <div>الهيكل: {selectedWoodObj?.name}</div>
              <div>الأبواب: {selectedDoorObj?.name}</div>
              <div>الرخام: {selectedCtrObj?.name}</div>
            </div>
          </div>
        </div>

        {/* Invoice Price Summary Sheet */}
        <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <div>
              <h4 className="font-bold text-neutral-800 text-sm">تفاصيل تسعير المطبخ المقدر</h4>
              <p className="text-4xs text-neutral-400 mt-0.5">الأسعار تعتمد على القياسات المدخلة</p>
            </div>
            <span className={`text-3xs font-semibold px-2.5 py-1 rounded-full border ${costTierClass}`}>
              {costTier}
            </span>
          </div>

          <div className="p-5 space-y-3.5 text-xs text-neutral-600">
            {/* Lower Cabinets */}
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-neutral-800 block">الوحدات السفلية</span>
                <span className="text-4xs text-neutral-400 font-mono">
                  {lowerLength.toFixed(1)}م × {basePricePerMeter} ر.ع/م طولي
                </span>
              </div>
              <span className="font-bold text-neutral-700">{lowerCabinetsPrice} ر.ع</span>
            </div>

            {/* Upper Cabinets */}
            {upperLength > 0 && (
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-neutral-800 block">الوحدات العلوية <span className="text-4xs text-neutral-400">(بنسبة 75%)</span></span>
                  <span className="text-4xs text-neutral-400 font-mono">
                    {upperLength.toFixed(1)}م × {Math.round(basePricePerMeter * 0.75)} ر.ع/م طولي
                  </span>
                </div>
                <span className="font-bold text-neutral-700">{upperCabinetsPrice} ر.ع</span>
              </div>
            )}

            {/* Worktop Counter */}
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-neutral-800 block">سطح العمل (الرخام)</span>
                <span className="text-4xs text-neutral-400 font-mono">
                  {counterArea.toFixed(2)}م² × {selectedCtrObj?.price || 0} ر.ع/م²
                </span>
              </div>
              <span className="font-bold text-neutral-700">{counterPrice}  ر.ع</span>
            </div>

            {/* Hinges & Slides */}
            {hingesPrice > 0 && (
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-neutral-800 block">المفصلات وسحاب الأدراج</span>
                  <span className="text-4xs text-neutral-400 font-mono">
                    {(lowerLength + upperLength).toFixed(1)}م × {selectedAccObj?.price || 0} ر.ع/م
                  </span>
                </div>
                <span className="font-bold text-neutral-700">{hingesPrice} ر.ع</span>
              </div>
            )}

            {/* Height ceiling addition */}
            {heightPrice > 0 && (
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-neutral-800 block">تقفيل السقف / الارتفاع الإضافي</span>
                  <span className="text-4xs text-neutral-400 font-mono">
                    {(lowerLength + upperLength).toFixed(1)}م × {selectedHeightObj?.price || 0} ر.ع/م
                  </span>
                </div>
                <span className="font-bold text-neutral-700">{heightPrice} ر.ع</span>
              </div>
            )}

            {/* Handles Run */}
            {handlePrice > 0 && (
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-neutral-800 block">مجرى المقابض المخفية / الحفر</span>
                  <span className="text-4xs text-neutral-400 font-mono">
                    {(lowerLength + upperLength).toFixed(1)}م × {selectedHandleObj?.price || 0} ر.ع/م
                  </span>
                </div>
                <span className="font-bold text-neutral-700">{handlePrice} ر.ع</span>
              </div>
            )}

            {/* Hidden lighting */}
            {lightPrice > 0 && (
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-neutral-800 block">الإضاءة الخلفية والملحقات</span>
                  <span className="text-4xs text-neutral-400 font-mono">
                    {upperLength.toFixed(1)}م × {selectedLightObj?.price || 0} ر.ع/م
                  </span>
                </div>
                <span className="font-bold text-neutral-700">{lightPrice} ر.ع</span>
              </div>
            )}

            {/* Finish Countertop */}
            {finishPrice > 0 && (
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-neutral-800 block">تشطيب حواف سطح العمل</span>
                  <span className="text-4xs text-neutral-400 font-mono">
                    {lowerLength.toFixed(1)}م × {selectedFinishObj?.price || 0} ر.ع/م
                  </span>
                </div>
                <span className="font-bold text-neutral-700">{finishPrice} ر.ع</span>
              </div>
            )}

            {/* Addons price */}
            {addonsPrice > 0 && (
              <div className="flex justify-between items-start border-t border-dashed border-neutral-100 pt-2.5">
                <div>
                  <span className="font-semibold text-neutral-800 block">الأجهزة المضافة والإكسسوارات</span>
                  <span className="text-4xs text-neutral-400">
                    مجموع {Object.values(addonQtys).reduce((a, b) => a + b, 0)} قطعة مدمجة
                  </span>
                </div>
                <span className="font-bold text-neutral-700">{addonsPrice} ر.ع</span>
              </div>
            )}

            {/* Installation Fee */}
            <div className="flex justify-between items-start border-t border-dashed border-neutral-100 pt-2.5">
              <div>
                <span className="font-semibold text-neutral-800 block">التركيب والتشطيب النهائي</span>
                <span className="text-4xs text-neutral-400 font-mono">
                  12% من قيمة الخزائن ({lowerCabinetsPrice + upperCabinetsPrice} ر.ع)
                </span>
              </div>
              <span className="font-bold text-neutral-700">{installationPrice} ر.ع</span>
            </div>
          </div>

          {/* Grand total segment */}
          <div className="bg-neutral-50 px-5 py-4 border-t border-neutral-100 flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-600">الإجمالي الكلي التقديري:</span>
            <span className="text-2xl font-black text-blue-600 font-mono">
              {grandTotal.toLocaleString("ar-OM")} ر.ع
            </span>
          </div>

          {/* Progress gauge bar */}
          <div className="px-5 pb-4 pt-2 bg-neutral-50 border-t border-neutral-100/50 space-y-1.5">
            <div className="flex justify-between text-4xs font-semibold text-neutral-400">
              <span>اقتصادي</span>
              <span>متوازن</span>
              <span>فاخر</span>
            </div>
            <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
              <div className={`h-full ${costTierBarClass} transition-all duration-500 ease-out`} style={{ width: `${pricePct}%` }} />
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="p-5 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={exportToPDF}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <FileDown className="w-4 h-4" />
              <span>تنزيل الفاتورة PDF</span>
            </button>
            <button
              type="button"
              onClick={exportToExcel}
              className="bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all border border-neutral-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
          </div>
        </div>

        {/* Small terms note */}
        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-2.5">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-4xs leading-relaxed text-blue-800 text-right">
            هذا السعر هو تسعير تقديري شامل لأعمال التصميم، التوريد، التركيب الاحترافي، والضمان بالريال العُماني. يمكنك تعديل الأسعار وعمليات الحساب من لوحة التحكم لتتوافق تمامًا مع أسعار المصنع الحالية.
          </p>
        </div>

      </div>
    </div>
  );
}
