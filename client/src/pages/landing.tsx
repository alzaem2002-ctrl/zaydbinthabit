import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  BookOpen, 
  Target, 
  FileCheck, 
  Users, 
  ChevronLeft,
  Shield,
  Zap,
  BarChart3
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-landing">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">توثيق الأداء الوظيفي</h1>
              <p className="text-xs text-muted-foreground">نظام إلكتروني متكامل</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/api/login">
              <Button data-testid="button-login">
                تسجيل الدخول
                <ChevronLeft className="h-4 w-4 mr-2" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
              نظام توثيق شواهد الأداء الوظيفي
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              منصة متكاملة لتوثيق وإدارة المؤشرات المهنية والشواهد الوظيفية للمعلمين والمشرفين التربويين
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/api/login">
                <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-get-started">
                  ابدأ الآن
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-learn-more">
                تعرف على المزيد
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12" data-testid="text-features-title">
              مميزات النظام
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={<Target className="h-8 w-8" />}
                title="إدارة المؤشرات"
                description="إضافة وتتبع المؤشرات المهنية بسهولة تامة"
                testId="feature-indicators"
              />
              <FeatureCard 
                icon={<FileCheck className="h-8 w-8" />}
                title="توثيق الشواهد"
                description="رفع وتنظيم الشواهد والمستندات الداعمة"
                testId="feature-witnesses"
              />
              <FeatureCard 
                icon={<BarChart3 className="h-8 w-8" />}
                title="تقارير متقدمة"
                description="تقارير شاملة وإحصائيات تفصيلية"
                testId="feature-reports"
              />
              <FeatureCard 
                icon={<Users className="h-8 w-8" />}
                title="إدارة المستخدمين"
                description="أدوار وصلاحيات متعددة للمستخدمين"
                testId="feature-users"
              />
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                icon={<Shield className="h-6 w-6" />}
                value="100%"
                label="آمن وموثوق"
                testId="stat-secure"
              />
              <StatCard 
                icon={<Zap className="h-6 w-6" />}
                value="سريع"
                label="أداء عالي"
                testId="stat-fast"
              />
              <StatCard 
                icon={<BookOpen className="h-6 w-6" />}
                value="سهل"
                label="واجهة بسيطة"
                testId="stat-easy"
              />
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-cta-title">
              ابدأ بتوثيق أدائك الوظيفي اليوم
            </h3>
            <p className="text-lg opacity-90 mb-8">
              انضم إلى نظام التوثيق الإلكتروني المتكامل
            </p>
            <a href="/api/login">
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2"
                data-testid="button-cta-login"
              >
                تسجيل الدخول الآن
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground" data-testid="text-footer">
            جميع الحقوق محفوظة © 2024 - مدرسة زيد بن ثابت الابتدائية
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            توثيق شواهد الأداء الوظيفي - نظام إلكتروني متكامل
          </p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  testId: string;
}

function FeatureCard({ icon, title, description, testId }: FeatureCardProps) {
  return (
    <Card 
      className="p-6 text-center hover-elevate transition-all duration-300"
      data-testid={testId}
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
        {icon}
      </div>
      <h4 className="font-bold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  testId: string;
}

function StatCard({ icon, value, label, testId }: StatCardProps) {
  return (
    <Card 
      className="p-6 text-center"
      data-testid={testId}
    >
      <div className="flex items-center justify-center gap-2 text-primary mb-2">
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-muted-foreground">{label}</p>
    </Card>
  );
}
