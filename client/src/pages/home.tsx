import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { SidebarProfile } from "@/components/sidebar-profile";
import { IndicatorCard } from "@/components/indicator-card";
import { StrategiesSection } from "@/components/strategies-section";
import { AddIndicatorModal } from "@/components/add-indicator-modal";
import { AddWitnessModal } from "@/components/add-witness-modal";
import { StrategiesModal } from "@/components/strategies-modal";
import { ReEvaluateModal } from "@/components/re-evaluate-modal";
import { IndicatorDetailsModal } from "@/components/indicator-details-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { 
  DashboardStats, 
  IndicatorWithCriteria, 
  Strategy, 
  StrategyWithSelection,
  Witness 
} from "@shared/schema";
import { Plus, Target } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [addIndicatorOpen, setAddIndicatorOpen] = useState(false);
  const [addWitnessOpen, setAddWitnessOpen] = useState(false);
  const [strategiesOpen, setStrategiesOpen] = useState(false);
  const [reEvaluateOpen, setReEvaluateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: indicators, isLoading: indicatorsLoading } = useQuery<IndicatorWithCriteria[]>({
    queryKey: ["/api/indicators"],
  });

  const { data: strategies } = useQuery<Strategy[]>({
    queryKey: ["/api/strategies"],
  });

  const { data: userStrategies } = useQuery<Strategy[]>({
    queryKey: ["/api/user-strategies"],
  });

  const { data: selectedIndicatorWitnesses } = useQuery<Witness[]>({
    queryKey: ["/api/indicators", selectedIndicatorId, "witnesses"],
    enabled: !!selectedIndicatorId && detailsOpen,
  });

  const selectedIndicator = indicators?.find(i => i.id === selectedIndicatorId);

  const strategiesWithSelection: StrategyWithSelection[] = (strategies || []).map(s => ({
    ...s,
    isSelected: (userStrategies || []).some(us => us.id === s.id),
  }));

  const addIndicatorMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; criteria: string[] }) => {
      return apiRequest("POST", "/api/indicators", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setAddIndicatorOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المؤشر الجديد",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة المؤشر",
        variant: "destructive",
      });
    },
  });

  const addWitnessMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; criteriaId?: string; fileType?: string }) => {
      return apiRequest("POST", `/api/indicators/${selectedIndicatorId}/witnesses`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/indicators", selectedIndicatorId, "witnesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setAddWitnessOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الشاهد الجديد",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الشاهد",
        variant: "destructive",
      });
    },
  });

  const deleteIndicatorMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/indicators/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف المؤشر",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المؤشر",
        variant: "destructive",
      });
    },
  });

  const toggleCriteriaMutation = useMutation({
    mutationFn: async ({ indicatorId, criteriaId, completed }: { indicatorId: string; criteriaId: string; completed: boolean }) => {
      return apiRequest("PATCH", `/api/indicators/${indicatorId}/criteria/${criteriaId}`, { isCompleted: completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const updateStrategiesMutation = useMutation({
    mutationFn: async (strategyIds: string[]) => {
      return apiRequest("POST", "/api/user-strategies", { strategyIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-strategies"] });
      setStrategiesOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث الاستراتيجيات",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الاستراتيجيات",
        variant: "destructive",
      });
    },
  });

  const reEvaluateMutation = useMutation({
    mutationFn: async (indicatorIds: string[]) => {
      return apiRequest("POST", "/api/indicators/re-evaluate", { indicatorIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setReEvaluateOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم إعادة تحقيق المؤشرات المختارة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إعادة التحقيق",
        variant: "destructive",
      });
    },
  });

  const handleAddWitness = (indicatorId: string) => {
    setSelectedIndicatorId(indicatorId);
    setAddWitnessOpen(true);
  };

  const handleViewDetails = (indicatorId: string) => {
    setSelectedIndicatorId(indicatorId);
    setDetailsOpen(true);
  };

  const handleDeleteIndicator = (indicatorId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المؤشر؟")) {
      deleteIndicatorMutation.mutate(indicatorId);
    }
  };

  const handlePrintReport = () => {
    window.print();
    toast({
      title: "طباعة التقرير",
      description: "جاري تحضير التقرير للطباعة",
    });
  };

  const handleExportData = () => {
    toast({
      title: "تصدير البيانات",
      description: "جاري تحضير البيانات للتصدير",
    });
  };

  const handleImportData = () => {
    toast({
      title: "استيراد البيانات",
      description: "ميزة الاستيراد قيد التطوير",
    });
  };

  const defaultStats: DashboardStats = {
    totalCapabilities: 12,
    totalChanges: 12,
    totalIndicators: indicators?.length || 0,
    completedIndicators: indicators?.filter(i => i.status === "completed").length || 0,
    pendingIndicators: indicators?.filter(i => i.status === "pending").length || 0,
    inProgressIndicators: indicators?.filter(i => i.status === "in_progress").length || 0,
    totalWitnesses: indicators?.reduce((acc, i) => acc + (i.witnessCount || 0), 0) || 0,
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <div className="fixed top-4 left-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Header stats={stats || defaultStats} user={user} />
        
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 mt-6">
          <aside className="order-2 lg:order-1">
            <SidebarProfile 
              user={user}
              onPrintReport={handlePrintReport}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onReEvaluate={() => setReEvaluateOpen(true)}
              isAuthenticated={true}
            />
          </aside>
          
          <main className="order-1 lg:order-2 space-y-6">
            <Card className="p-6 shadow-sm" data-testid="section-indicators">
              <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b-2 border-border">
                <h2 className="text-xl font-bold text-primary" data-testid="text-indicators-title">
                  المؤشرات المهنية لتوثيق الأداء
                </h2>
                <Button 
                  onClick={() => setAddIndicatorOpen(true)}
                  className="gap-2"
                  data-testid="button-add-indicator"
                >
                  <Plus className="h-4 w-4" />
                  إضافة مؤشر جديد
                </Button>
              </div>
              
              {indicatorsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-5">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-10 w-full mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 w-16" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : indicators && indicators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {indicators.map((indicator) => (
                    <IndicatorCard
                      key={indicator.id}
                      indicator={indicator}
                      onAddWitness={handleAddWitness}
                      onViewDetails={handleViewDetails}
                      onDelete={handleDeleteIndicator}
                      onToggleCriteria={(indicatorId, criteriaId, completed) => 
                        toggleCriteriaMutation.mutate({ indicatorId, criteriaId, completed })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg" data-testid="text-no-indicators">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">لا توجد مؤشرات بعد</p>
                  <Button onClick={() => setAddIndicatorOpen(true)} data-testid="button-add-first-indicator">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة أول مؤشر
                  </Button>
                </div>
              )}
            </Card>
            
            <StrategiesSection 
              strategies={userStrategies || []}
              onSelectStrategies={() => setStrategiesOpen(true)}
            />
          </main>
        </div>
        
        <footer className="text-center py-8 mt-8 border-t border-border" data-testid="footer">
          <p className="text-muted-foreground">
            جميع الحقوق محفوظة © 2024 - مدرسة زيد بن ثابت الابتدائية
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            توثيق شواهد الأداء الوظيفي - نظام إلكتروني متكامل
          </p>
        </footer>
      </div>

      <AddIndicatorModal 
        open={addIndicatorOpen}
        onOpenChange={setAddIndicatorOpen}
        onSubmit={(data) => addIndicatorMutation.mutate(data)}
        isLoading={addIndicatorMutation.isPending}
      />

      <AddWitnessModal 
        open={addWitnessOpen}
        onOpenChange={setAddWitnessOpen}
        onSubmit={(data) => addWitnessMutation.mutate(data)}
        indicatorId={selectedIndicatorId || ""}
        indicatorTitle={selectedIndicator?.title}
        criteria={selectedIndicator?.criteria}
        isLoading={addWitnessMutation.isPending}
      />

      <StrategiesModal 
        open={strategiesOpen}
        onOpenChange={setStrategiesOpen}
        strategies={strategiesWithSelection}
        onSubmit={(ids) => updateStrategiesMutation.mutate(ids)}
        isLoading={updateStrategiesMutation.isPending}
      />

      <ReEvaluateModal 
        open={reEvaluateOpen}
        onOpenChange={setReEvaluateOpen}
        indicators={indicators || []}
        onSubmit={(ids) => reEvaluateMutation.mutate(ids)}
        isLoading={reEvaluateMutation.isPending}
      />

      <IndicatorDetailsModal 
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        indicator={selectedIndicator || null}
        witnesses={selectedIndicatorWitnesses}
        onAddWitness={handleAddWitness}
      />
    </div>
  );
}
