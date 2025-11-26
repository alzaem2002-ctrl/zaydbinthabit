import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { AddIndicatorModal } from "@/components/add-indicator-modal";
import { AddWitnessModal } from "@/components/add-witness-modal";
import { StrategiesModal } from "@/components/strategies-modal";
import { PrintReportModal } from "@/components/print-report-modal";
import type { 
  DashboardStats, 
  IndicatorWithCriteria, 
  Strategy, 
  StrategyWithSelection,
  Witness,
  User 
} from "@shared/schema";
import { 
  Plus, 
  Printer, 
  FileDown, 
  FileUp, 
  RotateCcw, 
  CheckCircle,
  User as UserIcon,
  School,
  Building,
  BookOpen,
  Award,
  UserCog,
  Calendar,
  Mail,
  Pencil,
  Eye,
  Trash2,
  FileText,
  BarChart3,
  Target,
  Users,
  Lightbulb,
  Settings,
  ClipboardList,
  PenTool,
  Presentation,
  TrendingUp,
  Layers,
  Star
} from "lucide-react";

const educationalLevels = [
  { value: "معلم", label: "معلم" },
  { value: "معلم ممارس", label: "معلم ممارس" },
  { value: "معلم متقدم", label: "معلم متقدم" },
  { value: "معلم خبير", label: "معلم خبير" },
];

const indicatorIcons: Record<number, React.ReactNode> = {
  1: <ClipboardList className="h-6 w-6" />,
  2: <Target className="h-6 w-6" />,
  3: <Users className="h-6 w-6" />,
  4: <Presentation className="h-6 w-6" />,
  5: <TrendingUp className="h-6 w-6" />,
  6: <FileText className="h-6 w-6" />,
  7: <Layers className="h-6 w-6" />,
  8: <Star className="h-6 w-6" />,
  9: <Settings className="h-6 w-6" />,
  10: <BarChart3 className="h-6 w-6" />,
  11: <CheckCircle className="h-6 w-6" />,
  12: <Lightbulb className="h-6 w-6" />,
};

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [addIndicatorOpen, setAddIndicatorOpen] = useState(false);
  const [addWitnessOpen, setAddWitnessOpen] = useState(false);
  const [strategiesOpen, setStrategiesOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [printFilterCompleted, setPrintFilterCompleted] = useState(false);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    schoolName: "",
    educationDepartment: "",
    subject: "",
    educationalLevel: "معلم",
    principalName: "",
    yearsOfService: "",
    contactEmail: "",
  });

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
      toast({ title: "تم بنجاح", description: "تم إضافة المؤشر الجديد" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في إضافة المؤشر", variant: "destructive" });
    },
  });

  const addWitnessMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; criteriaId?: string; fileType?: string }) => {
      return apiRequest("POST", `/api/indicators/${selectedIndicatorId}/witnesses`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setAddWitnessOpen(false);
      toast({ title: "تم بنجاح", description: "تم إضافة الشاهد الجديد" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في إضافة الشاهد", variant: "destructive" });
    },
  });

  const updateStrategiesMutation = useMutation({
    mutationFn: async (strategyIds: string[]) => {
      return apiRequest("POST", "/api/user-strategies", { strategyIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-strategies"] });
      setStrategiesOpen(false);
      toast({ title: "تم بنجاح", description: "تم تحديث الاستراتيجيات" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return apiRequest("PATCH", "/api/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditingProfile(false);
      toast({ title: "تم بنجاح", description: "تم حفظ بيانات المعلم بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في حفظ البيانات", variant: "destructive" });
    },
  });

  const toggleCriteriaMutation = useMutation({
    mutationFn: async ({ indicatorId, criteriaId, isCompleted }: { indicatorId: string; criteriaId: string; isCompleted: boolean }) => {
      return apiRequest("PATCH", `/api/indicators/${indicatorId}/criteria/${criteriaId}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في تحديث المعيار", variant: "destructive" });
    },
  });

  const handleEditProfile = () => {
    setProfileForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      schoolName: user?.schoolName || "",
      educationDepartment: user?.educationDepartment || "",
      subject: user?.subject || "",
      educationalLevel: user?.educationalLevel || "معلم",
      principalName: "",
      yearsOfService: user?.yearsOfService?.toString() || "",
      contactEmail: user?.contactEmail || "",
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      schoolName: profileForm.schoolName,
      educationDepartment: profileForm.educationDepartment,
      subject: profileForm.subject,
      educationalLevel: profileForm.educationalLevel,
      yearsOfService: profileForm.yearsOfService ? parseInt(profileForm.yearsOfService) : undefined,
      contactEmail: profileForm.contactEmail,
    });
  };

  const handleAddWitness = (indicatorId: string, criteriaId?: string) => {
    setSelectedIndicatorId(indicatorId);
    setAddWitnessOpen(true);
  };

  const handlePrintReport = () => {
    setPrintFilterCompleted(false);
    setPrintOpen(true);
  };

  const handlePrintCompleted = () => {
    setPrintFilterCompleted(true);
    setPrintOpen(true);
  };

  const handleExportData = () => {
    toast({ title: "تصدير البيانات", description: "جاري تحضير البيانات للتصدير" });
  };

  const handleImportData = () => {
    toast({ title: "استيراد البيانات", description: "ميزة الاستيراد قيد التطوير" });
  };

  const handleReset = () => {
    if (confirm("هل أنت متأكد من إعادة تعيين جميع البيانات؟")) {
      toast({ title: "إعادة تعيين", description: "تم إعادة تعيين البيانات" });
    }
  };

  const defaultStats: DashboardStats = {
    totalCapabilities: 12,
    totalChanges: 12,
    totalIndicators: indicators?.length || 12,
    completedIndicators: indicators?.filter(i => i.status === "completed").length || 0,
    pendingIndicators: indicators?.filter(i => i.status === "pending").length || 0,
    inProgressIndicators: indicators?.filter(i => i.status === "in_progress").length || 0,
    totalWitnesses: indicators?.reduce((acc, i) => acc + (i.witnessCount || 0), 0) || 0,
  };

  const currentStats = stats || defaultStats;
  const completionPercentage = currentStats.totalIndicators > 0 
    ? Math.round((currentStats.completedIndicators / currentStats.totalIndicators) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl" data-testid="page-home">
      <div className="fixed top-4 left-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-testid="section-stats">
          <Card className="bg-primary text-primary-foreground p-4 text-center" data-testid="stat-total-indicators">
            <div className="text-3xl font-bold">{currentStats.totalIndicators}</div>
            <div className="text-sm opacity-90">إجمالي المؤشرات</div>
          </Card>
          <Card className="bg-primary text-primary-foreground p-4 text-center" data-testid="stat-completed-indicators">
            <div className="text-3xl font-bold">{currentStats.completedIndicators}</div>
            <div className="text-sm opacity-90">المؤشرات المكتملة</div>
          </Card>
          <Card className="bg-primary text-primary-foreground p-4 text-center" data-testid="stat-total-witnesses">
            <div className="text-3xl font-bold">{currentStats.totalWitnesses}</div>
            <div className="text-sm opacity-90">إجمالي الشواهد</div>
          </Card>
          <Card className="bg-primary text-primary-foreground p-4 text-center" data-testid="stat-completion-percentage">
            <div className="text-3xl font-bold">{completionPercentage}%</div>
            <div className="text-sm opacity-90">نسبة الإنجاز</div>
          </Card>
        </div>

        {/* Teacher Info Section */}
        <Card className="p-6 mb-6" data-testid="section-teacher-info">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>👨‍🏫</span>
              بيانات المعلم/ة
            </h2>
            {!isEditingProfile ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEditProfile}
                className="gap-2"
                data-testid="button-edit-profile"
              >
                <Pencil className="h-4 w-4" />
                تحرير
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditingProfile(false)}
                className="gap-2"
                data-testid="button-cancel-edit"
              >
                إلغاء
              </Button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="space-y-6" data-testid="edit-profile-form">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">الاسم</label>
                  <Input
                    value={profileForm.firstName + (profileForm.lastName ? " " + profileForm.lastName : "")}
                    onChange={(e) => {
                      const parts = e.target.value.split(" ");
                      setProfileForm({
                        ...profileForm,
                        firstName: parts[0] || "",
                        lastName: parts.slice(1).join(" ") || "",
                      });
                    }}
                    placeholder="أدخل الاسم"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">المدرسة</label>
                  <Input
                    value={profileForm.schoolName}
                    onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                    placeholder="اسم المدرسة"
                    data-testid="input-school"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">إدارة تعليم</label>
                  <Input
                    value={profileForm.educationDepartment}
                    onChange={(e) => setProfileForm({ ...profileForm, educationDepartment: e.target.value })}
                    placeholder="إدارة التعليم"
                    data-testid="input-department"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">مادة أو مواد التدريس</label>
                  <Input
                    value={profileForm.subject}
                    onChange={(e) => setProfileForm({ ...profileForm, subject: e.target.value })}
                    placeholder="المادة"
                    data-testid="input-subject"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">رتبة المعلم</label>
                  <Select 
                    value={profileForm.educationalLevel} 
                    onValueChange={(value) => setProfileForm({ ...profileForm, educationalLevel: value })}
                  >
                    <SelectTrigger data-testid="select-educational-level">
                      <SelectValue placeholder="اختر الرتبة" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationalLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">مدير/ة المدرسة</label>
                  <Input
                    value={profileForm.principalName}
                    onChange={(e) => setProfileForm({ ...profileForm, principalName: e.target.value })}
                    placeholder="اسم المدير"
                    data-testid="input-principal"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">سنوات الخدمة</label>
                  <Input
                    type="number"
                    value={profileForm.yearsOfService}
                    onChange={(e) => setProfileForm({ ...profileForm, yearsOfService: e.target.value })}
                    placeholder="عدد السنوات"
                    data-testid="input-years"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">وسيلة التواصل</label>
                  <Input
                    value={profileForm.contactEmail}
                    onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                    placeholder="رقم الجوال أو البريد الإلكتروني"
                    data-testid="input-contact"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-start">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  data-testid="button-save-profile"
                >
                  <FileDown className="h-4 w-4" />
                  حفظ البيانات
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setIsEditingProfile(false)}
                  className="gap-2"
                  data-testid="button-cancel-profile"
                >
                  ✕ إلغاء
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="profile-display">
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  <span className="font-medium">الاسم</span>
                </div>
                <div className="text-muted-foreground" data-testid="display-name">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : "غير محدد"}
                </div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <School className="h-5 w-5 text-primary" />
                  <span className="font-medium">المدرسة</span>
                </div>
                <div className="text-muted-foreground" data-testid="display-school">
                  {user?.schoolName || "غير محدد"}
                </div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-5 w-5 text-primary" />
                  <span className="font-medium">إدارة تعليم</span>
                </div>
                <div className="text-muted-foreground" data-testid="display-department">
                  {user?.educationDepartment || "غير محدد"}
                </div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-medium">مادة أو مواد التدريس</span>
                </div>
                <div className="text-muted-foreground" data-testid="display-subject">
                  {user?.subject || "غير محدد"}
                </div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-medium">رتبة المعلم</span>
                </div>
                <div className="text-muted-foreground" data-testid="display-level">
                  {user?.educationalLevel || "غير محدد"}
                </div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <UserCog className="h-5 w-5 text-primary" />
                  <span className="font-medium">مدير/ة المدرسة</span>
                </div>
                <div className="text-muted-foreground" data-testid="display-principal">
                  غير محدد
                </div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">سنوات الخدمة</span>
                </div>
                <div className="text-muted-foreground" data-testid="display-years">
                  {user?.yearsOfService || "غير محدد"}
                </div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="font-medium">وسيلة التواصل</span>
                </div>
                <div className="text-muted-foreground" data-testid="display-contact">
                  {user?.contactEmail || "غير محدد"}
                </div>
              </Card>
            </div>
          )}
        </Card>

        {/* Quick Actions Section */}
        <Card className="p-6 mb-6" data-testid="section-quick-actions">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 justify-end">
            الإجراءات السريعة
            <span>⚡</span>
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              onClick={handlePrintCompleted}
              className="gap-2 bg-green-600 hover:bg-green-700"
              data-testid="button-print-completed"
            >
              <CheckCircle className="h-4 w-4" />
              طباعة المكتمل
            </Button>
            <Button 
              onClick={handlePrintReport}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              data-testid="button-print-full"
            >
              <Printer className="h-4 w-4" />
              طباعة الملف كامل
            </Button>
            <Button 
              onClick={handleExportData}
              className="gap-2 bg-blue-500 hover:bg-blue-600"
              data-testid="button-export"
            >
              <FileDown className="h-4 w-4" />
              تصدير البيانات
            </Button>
            <Button 
              onClick={handleImportData}
              className="gap-2 bg-orange-500 hover:bg-orange-600"
              data-testid="button-import"
            >
              <FileUp className="h-4 w-4" />
              استيراد البيانات
            </Button>
            <Button 
              onClick={() => setStrategiesOpen(true)}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
              data-testid="button-strategies"
            >
              <Lightbulb className="h-4 w-4" />
              استراتيجيات التدريس
            </Button>
            <Button 
              onClick={handleReset}
              variant="destructive"
              className="gap-2"
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة تعيين
            </Button>
          </div>
        </Card>

        {/* Professional Indicators Section */}
        <Card className="p-6 mb-6" data-testid="section-indicators">
          <div className="flex items-center justify-between mb-6">
            <Button 
              onClick={() => setAddIndicatorOpen(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
              data-testid="button-add-indicator"
            >
              <Plus className="h-4 w-4" />
              إضافة مؤشر جديد
            </Button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              المؤشرات المهنية
              <span>📊</span>
            </h2>
          </div>

          {indicatorsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-10 w-10 mx-auto mb-2 rounded" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-1/2 mx-auto" />
                </Card>
              ))}
            </div>
          ) : indicators && indicators.length > 0 ? (
            <>
              {/* Indicators Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {indicators.map((indicator, index) => (
                  <Card 
                    key={indicator.id}
                    className={`p-4 text-center cursor-pointer transition-all hover-elevate ${
                      expandedIndicator === indicator.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : ""
                    } ${indicator.status === "completed" ? "bg-green-50 dark:bg-green-900/20" : ""}`}
                    onClick={() => setExpandedIndicator(expandedIndicator === indicator.id ? null : indicator.id)}
                    data-testid={`indicator-card-${indicator.id}`}
                  >
                    <div className={`mx-auto mb-2 p-2 rounded-lg inline-block ${
                      indicator.status === "completed" 
                        ? "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {indicatorIcons[(index % 12) + 1]}
                    </div>
                    <div className="text-sm font-medium line-clamp-2 mb-1">
                      {indicator.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {indicator.witnessCount || 0} شاهد
                    </div>
                    {indicator.status === "completed" && (
                      <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
                    )}
                  </Card>
                ))}
              </div>

              {/* Expanded Indicator Details */}
              {expandedIndicator && (
                <Card className="p-6 border-2 border-primary/20" data-testid="expanded-indicator">
                  {(() => {
                    const indicator = indicators.find(i => i.id === expandedIndicator);
                    if (!indicator) return null;
                    
                    const indicatorIndex = indicators.findIndex(i => i.id === expandedIndicator);
                    
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              data-testid="button-print-indicator"
                            >
                              <Printer className="h-4 w-4" />
                              طباعة المؤشر
                            </Button>
                            <Button
                              onClick={() => setStrategiesOpen(true)}
                              size="sm"
                              className="gap-2 bg-blue-500 hover:bg-blue-600"
                              data-testid="button-add-criteria"
                            >
                              <Plus className="h-4 w-4" />
                              إضافة معيار
                            </Button>
                          </div>
                          <div className="text-right">
                            <h3 className="text-lg font-bold flex items-center gap-2 justify-end">
                              المؤشر {indicatorIndex + 1}: {indicator.title}
                              {indicatorIcons[(indicatorIndex % 12) + 1]}
                            </h3>
                            <div className="flex items-center gap-2 justify-end mt-1">
                              <Badge variant={indicator.status === "completed" ? "default" : "secondary"}>
                                {indicator.status === "completed" ? "مكتمل" : "غير مكتمل"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {indicator.witnessCount || 0} شاهد
                              </span>
                              <span className="text-red-500">○</span>
                            </div>
                          </div>
                        </div>

                        {/* Strategies Section for Indicator 4 */}
                        {indicatorIndex === 3 && (
                          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setStrategiesOpen(true)}
                                className="gap-2"
                                data-testid="button-manage-strategies"
                              >
                                <Settings className="h-4 w-4" />
                                إدارة الاستراتيجيات
                              </Button>
                              <h4 className="font-bold flex items-center gap-2">
                                الاستراتيجيات المختارة
                                <span>🎯</span>
                              </h4>
                            </div>
                            {userStrategies && userStrategies.length > 0 ? (
                              <div className="flex flex-wrap gap-2 justify-end">
                                {userStrategies.map((s) => (
                                  <Badge key={s.id} variant="secondary">{s.name}</Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground">لم يتم اختيار استراتيجيات بعد</p>
                            )}
                          </div>
                        )}

                        {/* Criteria List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {indicator.criteria?.map((criterion, idx) => (
                            <Card 
                              key={criterion.id} 
                              className={`p-4 ${criterion.isCompleted ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' : 'bg-muted/30'}`} 
                              data-testid={`criterion-${criterion.id}`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-2 items-center">
                                  <Checkbox
                                    checked={criterion.isCompleted || false}
                                    onCheckedChange={(checked) => 
                                      toggleCriteriaMutation.mutate({
                                        indicatorId: indicator.id,
                                        criteriaId: criterion.id,
                                        isCompleted: checked as boolean
                                      })
                                    }
                                    data-testid={`checkbox-criterion-${criterion.id}`}
                                    className="h-5 w-5"
                                  />
                                  <Button
                                    onClick={() => handleAddWitness(indicator.id, criterion.id)}
                                    size="sm"
                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                    data-testid={`button-add-witness-${criterion.id}`}
                                  >
                                    <Plus className="h-3 w-3" />
                                    إضافة شاهد
                                  </Button>
                                </div>
                                <div className="text-right flex-1">
                                  <span className={`font-medium ${criterion.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                    {idx + 1}. {criterion.title}
                                  </span>
                                  {criterion.isCompleted && (
                                    <Badge variant="secondary" className="mr-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                      مكتمل
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              )}
            </>
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

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border" data-testid="footer">
          <p className="text-muted-foreground">
            جميع الحقوق محفوظة © 2024 - مدرسة زيد بن ثابت الابتدائية
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            توثيق شواهد الأداء الوظيفي - نظام إلكتروني متكامل
          </p>
        </footer>
      </div>

      {/* Modals */}
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

      <PrintReportModal 
        open={printOpen}
        onOpenChange={setPrintOpen}
        indicators={indicators || []}
        stats={currentStats}
        user={user}
        filterCompleted={printFilterCompleted}
      />
    </div>
  );
}
