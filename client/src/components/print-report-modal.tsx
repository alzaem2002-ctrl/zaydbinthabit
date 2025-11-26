import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { IndicatorWithCriteria, DashboardStats, User } from "@shared/schema";

interface PrintReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indicators: IndicatorWithCriteria[];
  stats: DashboardStats;
  user?: User;
}

export function PrintReportModal({ 
  open, 
  onOpenChange, 
  indicators, 
  stats, 
  user 
}: PrintReportModalProps) {
  const principalName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : "زياد العتيبي";

  const schoolName = user?.schoolName || "مدرسة زيد بن ثابت الابتدائية";
  const department = user?.educationDepartment || "إدارة التعليم بالأحساء";
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-full print:h-full" data-testid="print-report-modal">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-right">نموذج طباعة التقرير</DialogTitle>
        </DialogHeader>

        {/* Report Content */}
        <div className="space-y-8 p-8 print:p-0 print:m-0 bg-white print:bg-white text-black print:text-black">
          
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold mb-2">{schoolName}</h1>
            <p className="text-lg font-semibold mb-1">{department}</p>
            <p className="text-sm font-semibold">نظام توثيق شواهد الأداء الوظيفي</p>
            <p className="text-xs mt-2">تقرير شامل - {new Date().toLocaleDateString('ar-SA')}</p>
          </div>

          {/* Principal Info */}
          <div className="border border-black p-4">
            <h2 className="text-lg font-bold mb-4 text-center">بيانات مدير المدرسة</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">الاسم:</p>
                <p className="ml-4">{principalName}</p>
              </div>
              <div>
                <p className="font-semibold">المدرسة:</p>
                <p className="ml-4">{schoolName}</p>
              </div>
              <div>
                <p className="font-semibold">الإدارة:</p>
                <p className="ml-4">{department}</p>
              </div>
              <div>
                <p className="font-semibold">المشرف:</p>
                <p className="ml-4">عبدالعزيز الخلفان</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="border border-black p-4">
            <h2 className="text-lg font-bold mb-4 text-center">ملخص الإحصائيات</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-black p-3 text-center">
                <p className="font-bold text-2xl">{stats.totalIndicators}</p>
                <p className="text-sm font-semibold">إجمالي المؤشرات</p>
              </div>
              <div className="border border-black p-3 text-center">
                <p className="font-bold text-2xl">{stats.completedIndicators}</p>
                <p className="text-sm font-semibold">مؤشرات مكتملة</p>
              </div>
              <div className="border border-black p-3 text-center">
                <p className="font-bold text-2xl">{stats.totalWitnesses}</p>
                <p className="text-sm font-semibold">إجمالي الشواهد</p>
              </div>
              <div className="border border-black p-3 text-center">
                <p className="font-bold text-2xl">{stats.totalCapabilities}</p>
                <p className="text-sm font-semibold">القدرات المهنية</p>
              </div>
            </div>
          </div>

          {/* Indicators Table */}
          <div className="border border-black p-4">
            <h2 className="text-lg font-bold mb-4 text-center">المؤشرات المهنية المفصلة</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border border-black">
                  <th className="border border-black p-2 font-bold text-right">المؤشر</th>
                  <th className="border border-black p-2 font-bold text-center">المعايير</th>
                  <th className="border border-black p-2 font-bold text-center">الشواهد</th>
                  <th className="border border-black p-2 font-bold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((indicator, index) => (
                  <tr key={indicator.id} className="border border-black">
                    <td className="border border-black p-2 text-right">
                      {index + 1}. {indicator.title}
                    </td>
                    <td className="border border-black p-2 text-center">
                      {indicator.criteria?.length || 0}
                    </td>
                    <td className="border border-black p-2 text-center">
                      {indicator.witnessCount || 0}
                    </td>
                    <td className="border border-black p-2 text-center font-semibold">
                      <span className={indicator.status === 'completed' ? 'font-bold' : ''}>
                        {indicator.status === 'completed' ? '✓ مكتمل' : 
                         indicator.status === 'in_progress' ? '⊙ قيد الإنجاز' : '○ معلق'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Criteria Details */}
          {indicators.length > 0 && (
            <div className="border border-black p-4">
              <h2 className="text-lg font-bold mb-4 text-center">تفاصيل المعايير</h2>
              {indicators.map((indicator, indIndex) => (
                <div key={indicator.id} className="mb-4 pb-4 border-b border-black last:border-b-0">
                  <p className="font-bold mb-2">{indIndex + 1}. {indicator.title}</p>
                  {indicator.criteria && indicator.criteria.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      {indicator.criteria.map((criteria, criIndex) => (
                        <li key={criteria.id} className="text-sm">
                          {criteria.title}
                          {criteria.isCompleted && <span className="ml-2 font-bold">✓</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600 ml-4">لا توجد معايير</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center border-t-2 border-black pt-4">
            <p className="text-sm font-semibold">تم إعداد هذا التقرير بواسطة نظام توثيق شواهد الأداء الوظيفي</p>
            <p className="text-xs mt-2">التاريخ: {new Date().toLocaleDateString('ar-SA')} | الوقت: {new Date().toLocaleTimeString('ar-SA')}</p>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex gap-3 pt-4 print:hidden">
          <Button 
            onClick={handlePrint}
            className="flex-1 gap-2"
            data-testid="button-print"
          >
            <Printer className="h-4 w-4" />
            طباعة التقرير
          </Button>
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            data-testid="button-close-print"
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
