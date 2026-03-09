import { useEffect, useState } from "react";
import { Moon, Sun, Gift, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const THEME_KEY = "tech-theme";

type ThemeMode = "light" | "dark";

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const RedeemBody = () => (
  <div className="space-y-5">
    <div className="rounded-2xl border border-border bg-surface-card-2 p-4 shadow-soft transition-colors duration-200">
      <label className="mb-2 block text-sm font-medium text-text-body-2">兑换码</label>
      <Input
        placeholder="请输入兑换码"
        className="h-11 rounded-xl border-border bg-background text-foreground placeholder:text-text-brief"
      />
    </div>

    <div className="space-y-2 rounded-2xl border border-border bg-background p-4">
      <p className="text-xs text-text-brief">使用说明</p>
      <ul className="space-y-1.5 text-sm text-text-body-2">
        <li>• 兑换码区分大小写，请完整输入。</li>
        <li>• 每个兑换码仅可使用一次。</li>
        <li>• 兑换成功后权益即时到账。</li>
      </ul>
    </div>

    <div className="flex items-center gap-2 rounded-full bg-surface-hover px-3 py-2 text-xs text-text-body-2">
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      安全兑换通道
    </div>

    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" className="rounded-xl border-border hover:bg-surface-hover">
        取消
      </Button>
      <Button className="rounded-xl bg-primary hover:bg-primary/90">立即兑换</Button>
    </div>
  </div>
);

const Index = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(THEME_KEY, next);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-8rem] h-64 w-64 -translate-x-1/2 rounded-full bg-tech-gradient blur-3xl motion-safe:animate-float-pulse motion-reduce:animate-none" />
      </div>

      <section className="relative mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card className="rounded-3xl border border-border bg-card/90 p-4 shadow-soft backdrop-blur sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-text-title sm:text-3xl">兑换中心</h1>
              <p className="mt-1 text-sm text-text-brief">现代科技感 UI · Light / Dark 双主题</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full border-border bg-surface-selected hover:bg-surface-hover"
              aria-label="切换主题"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border bg-surface-card-2 p-6 shadow-soft sm:p-8">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-surface-selected p-3">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-text-title">输入兑换码解锁权益</h2>
            <p className="text-sm text-text-body-2">支持桌面端弹窗与移动端底部弹出，交互遵循移动端友好逻辑。</p>
            <Button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full rounded-xl bg-primary text-primary-foreground transition-colors duration-200 hover:bg-primary/90 sm:w-auto"
            >
              兑换
            </Button>
          </div>
        </Card>
      </section>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[85vh] rounded-t-3xl border-border bg-card px-4 pb-6 pt-2">
            <DrawerHeader className="px-1 text-left">
              <DrawerTitle className="text-xl text-text-title">兑换会员</DrawerTitle>
              <DrawerDescription className="text-text-body-2">请输入兑换码以激活对应权益</DrawerDescription>
            </DrawerHeader>
            <div className="px-1">
              <RedeemBody />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-soft">
            <DialogHeader>
              <DialogTitle className="text-2xl text-text-title">兑换会员</DialogTitle>
              <DialogDescription className="text-text-body-2">请输入兑换码以激活对应权益</DialogDescription>
            </DialogHeader>
            <RedeemBody />
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
};

export default Index;
