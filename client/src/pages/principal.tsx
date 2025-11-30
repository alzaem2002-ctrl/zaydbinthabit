import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  BarChart3,
  User,
  BookOpen,
  Award,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  LogOut,
  Moon,
  Sun,
  Shield,
  Crown,
  UserCog
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { 
  User as UserType, 
  PrincipalDashboardStats, 
  TeacherWithStats, 
  SignatureWithDetails,
  IndicatorWithCriteria 
} from "@shared/schema";

export default function PrincipalDashboard() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithStats | null>(null);
  const [selectedSignature, setSelectedSignature] = useState<SignatureWithDetails | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
    staleTime: Infinity,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<PrincipalDashboardStats>({
    queryKey: ["/api/principal/stats"],
    staleTime: 60000,
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<TeacherWithStats[]>({
    queryKey: ["/api/principal/teachers"],
    staleTime: 60000,
  });

  const { data: pendingSignatures = [], isLoading: signaturesLoading } = useQuery<SignatureWithDetails[]>({
    queryKey: ["/api/principal/pending-signatures"],
    staleTime: 30000,
  });

  const { data: teacherIndicators = [] } = useQuery<IndicatorWithCriteria[]>({
    queryKey: ["/api/principal/teachers", selectedTeacher?.id, "indicators"],
    enabled: !!selectedTeacher?.id,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ signatureId, notes }: { signatureId: string; notes?: string }) => {
      return apiRequest("POST", `/api/principal/signatures/${signatureId}/approve`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/principal/pending-signatures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/principal/stats"] });
      toast({
        title: "تم الاعتماد",
        description: "تم اعتماد المؤشر بنجاح",
      });
      setShowApprovalModal(false);
      setApprovalNotes("");
      setSelectedSignature(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ signatureId, notes }: { signatureId: string; notes: string }) => {
      return apiRequest("POST", `/api/principal/signatures/${signatureId}/reject`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/principal/pending-signatures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/principal/stats"] });
      toast({
        title: "تم الرفض",
        description: "تم رفض المؤشر",
      });
      setShowApprovalModal(false);
      setApprovalNotes("");
      setSelectedSignature(null);
    },
  });

  // Creator-only: Get all users
  const { data: allUsers = [] } = useQuery<UserType[]>({
    queryKey: ["/api/creator/users"],
    enabled: user?.role === "creator",
    staleTime: 60000,
  });

  // Creator-only: Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest("PATCH", `/api/creator/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/principal/teachers"] });
      toast({
        title: "تم التحديث",
        description: "تم تغيير صلاحية المستخدم بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تغيير الصلاحية",
        variant: "destructive",
      });
    },
  });

  const handleApproval = () => {
    if (!selectedSignature) return;
    
    if (approvalAction === "approve") {
      approveMutation.mutate({ signatureId: selectedSignature.id, notes: approvalNotes });
    } else {
      if (!approvalNotes.trim()) {
        toast({
          title: "خطأ",
          description: "يجب إدخال سبب الرفض",
          variant: "destructive",
        });
        return;
      }
      rejectMutation.mutate({ signatureId: selectedSignature.id, notes: approvalNotes });
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return first + last || "م";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">مكتمل</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">قيد الإنجاز</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-200">معلق</Badge>;
    }
  };

  const isAdminOrCreator = user?.role === "admin" || user?.role === "creator";
  const isCreator = user?.role === "creator";

  const getRoleBadge = (role: string | null | undefined) => {
    switch (role) {
      case "creator":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 gap-1"><Crown className="h-3 w-3" />منشئ الموقع</Badge>;
      case "admin":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 gap-1"><Shield className="h-3 w-3" />مدير</Badge>;
      case "supervisor":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">مشرف</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-200">معلم</Badge>;
    }
  };

  if (!user || !isAdminOrCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">غير مصرح</h2>
          <p className="text-muted-foreground mb-4">
            ليس لديك صلاحية للوصول إلى لوحة تحكم المدير
          </p>
          <a href="/">
            <Button>العودة للصفحة الرئيسية</Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">لوحة تحكم مدير المدرسة</h1>
              <p className="text-sm opacity-80">نظام توثيق شواهد الأداء الوظيفي</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-primary-foreground hover:bg-primary-foreground/20"
              data-testid="button-theme-toggle"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <a href="/api/logout">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20"
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </a>
            <Avatar>
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card data-testid="card-stat-teachers">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalTeachers || 0}</p>
                  <p className="text-sm text-muted-foreground">إجمالي المعلمين</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-pending">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pendingApprovals || 0}</p>
                  <p className="text-sm text-muted-foreground">طلبات معلقة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-approved">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.approvedIndicators || 0}</p>
                  <p className="text-sm text-muted-foreground">مؤشرات معتمدة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-indicators">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalIndicators || 0}</p>
                  <p className="text-sm text-muted-foreground">إجمالي المؤشرات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className={`grid w-full lg:w-auto lg:inline-grid ${isCreator ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending">
              <FileCheck className="h-4 w-4" />
              الطلبات المعلقة ({pendingSignatures.length})
            </TabsTrigger>
            <TabsTrigger value="teachers" className="gap-2" data-testid="tab-teachers">
              <Users className="h-4 w-4" />
              المعلمين ({teachers.length})
            </TabsTrigger>
            {isCreator && (
              <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
                <UserCog className="h-4 w-4" />
                إدارة المستخدمين
              </TabsTrigger>
            )}
          </TabsList>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  طلبات الاعتماد المعلقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {signaturesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
                ) : pendingSignatures.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد طلبات معلقة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSignatures.map((signature) => (
                      <div
                        key={signature.id}
                        className="p-4 border rounded-lg hover-elevate"
                        data-testid={`signature-${signature.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={signature.teacher?.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {getInitials(signature.teacher?.firstName, signature.teacher?.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">
                                {signature.teacher?.firstName} {signature.teacher?.lastName}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {signature.indicator?.title}
                              </p>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(signature.indicator?.status || "pending")}
                                <span className="text-xs text-muted-foreground">
                                  {signature.indicator?.criteria?.length || 0} معايير
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSignature(signature);
                                setApprovalAction("approve");
                                setShowApprovalModal(true);
                              }}
                              data-testid={`button-approve-${signature.id}`}
                            >
                              <ThumbsUp className="h-4 w-4 ml-1" />
                              اعتماد
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedSignature(signature);
                                setApprovalAction("reject");
                                setShowApprovalModal(true);
                              }}
                              data-testid={`button-reject-${signature.id}`}
                            >
                              <ThumbsDown className="h-4 w-4 ml-1" />
                              رفض
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Teachers List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    قائمة المعلمين
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {teachersLoading ? (
                    <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
                  ) : teachers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا يوجد معلمين</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {teachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className={`p-4 cursor-pointer hover-elevate ${
                            selectedTeacher?.id === teacher.id ? "bg-accent" : ""
                          }`}
                          onClick={() => setSelectedTeacher(teacher)}
                          data-testid={`teacher-${teacher.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={teacher.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {getInitials(teacher.firstName, teacher.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {teacher.firstName} {teacher.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {teacher.indicatorCount} مؤشر • {teacher.completedCount} مكتمل
                              </p>
                            </div>
                            {teacher.pendingApprovalCount > 0 && (
                              <Badge variant="secondary">{teacher.pendingApprovalCount}</Badge>
                            )}
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Teacher Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {selectedTeacher
                      ? `مؤشرات ${selectedTeacher.firstName} ${selectedTeacher.lastName}`
                      : "اختر معلماً لعرض مؤشراته"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedTeacher ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Eye className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>اختر معلماً من القائمة لعرض تفاصيل مؤشراته</p>
                    </div>
                  ) : teacherIndicators.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>لا توجد مؤشرات لهذا المعلم</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teacherIndicators.map((indicator) => (
                        <div
                          key={indicator.id}
                          className="p-4 border rounded-lg"
                          data-testid={`indicator-${indicator.id}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{indicator.title}</h4>
                            {getStatusBadge(indicator.status || "pending")}
                          </div>
                          {indicator.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {indicator.description}
                            </p>
                          )}
                          {indicator.criteria && indicator.criteria.length > 0 && (
                            <div className="space-y-1">
                              {indicator.criteria.map((criterion) => (
                                <div
                                  key={criterion.id}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  {criterion.isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span
                                    className={
                                      criterion.isCompleted
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    {criterion.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-3 text-xs text-muted-foreground">
                            عدد الشواهد: {indicator.witnessCount || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management Tab (Creator Only) */}
          {isCreator && (
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle>إدارة المستخدمين</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          تحكم في صلاحيات جميع المستخدمين
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">
                      {allUsers.length} مستخدم
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {allUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>لا يوجد مستخدمين مسجلين</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allUsers.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                          data-testid={`user-row-${u.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={u.profileImageUrl || ""} />
                              <AvatarFallback className="bg-primary/10">
                                {getInitials(u.firstName, u.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {u.firstName} {u.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getRoleBadge(u.role)}
                            <Select
                              value={u.role || "teacher"}
                              onValueChange={(role) => updateRoleMutation.mutate({ userId: u.id, role })}
                              disabled={u.id === user.id}
                            >
                              <SelectTrigger className="w-36" data-testid={`select-role-${u.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="creator">منشئ الموقع</SelectItem>
                                <SelectItem value="admin">مدير</SelectItem>
                                <SelectItem value="supervisor">مشرف</SelectItem>
                                <SelectItem value="teacher">معلم</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            نظام توثيق شواهد الأداء الوظيفي - نظام إلكتروني متكامل
          </p>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            الصفحة من إعداد عبدالعزيز الخلفان
          </p>
        </div>
      </footer>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "اعتماد المؤشر" : "رفض المؤشر"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedSignature && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedSignature.indicator?.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  المعلم: {selectedSignature.teacher?.firstName} {selectedSignature.teacher?.lastName}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {approvalAction === "approve" ? "ملاحظات (اختياري)" : "سبب الرفض (إجباري)"}
              </label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder={
                  approvalAction === "approve"
                    ? "أضف ملاحظاتك هنا..."
                    : "يرجى توضيح سبب الرفض..."
                }
                rows={3}
                data-testid="input-approval-notes"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowApprovalModal(false)}
              data-testid="button-cancel-approval"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleApproval}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className={approvalAction === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}
              data-testid="button-confirm-approval"
            >
              {approveMutation.isPending || rejectMutation.isPending
                ? "جاري المعالجة..."
                : approvalAction === "approve"
                ? "تأكيد الاعتماد"
                : "تأكيد الرفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
