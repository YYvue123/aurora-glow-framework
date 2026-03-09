import { useEffect, useState, useCallback } from "react";
import { Moon, Sun, Gift, FileText, CheckCircle2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const THEME_KEY = "tech-theme";
type ThemeMode = "light" | "dark";
type ModalView = "main" | "history" | "success";

const CODE_REGEX = /^[A-Za-z0-9]{12}$/;

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const steps = [
  { title: "输入密钥", desc: "准确输入您收到的卡密密钥，\n请注意区分大小写" },
  { title: "点击兑换", desc: "点击「立即兑换」，系统将自动完成有效性校验" },
  { title: "开始使用", desc: "兑换成功后，我们会自动为您的账户充值相应权益" },
];

const mockHistory = [
  { code: "2zn25XXhUYvz", redeemTime: "2026-03-09 09:56:10", expireTime: "2026-04-04 11:11:33", plan: "专业版-1天", status: "已兑换" },
  { code: "Abc123Xyz789", redeemTime: "2026-02-15 14:22:05", expireTime: "2026-03-15 14:22:05", plan: "专业版-30天", status: "已兑换" },
  { code: "qWeRtY098765", redeemTime: "2026-01-20 08:10:33", expireTime: "2026-02-20 08:10:33", plan: "基础版-7天", status: "已过期" },
];

/* ---------- Floating QR ---------- */
const QrFloating = () => (
  <div className="absolute right-0 top-8 z-20 w-44 rounded-2xl border border-border bg-card p-3 shadow-soft">
    <div className="mb-2 text-center text-xs text-text-body-2">扫码联系客服</div>
    <div className="rounded-xl bg-surface-card-2 p-2">
      <div className="grid aspect-square grid-cols-7 gap-0.5 rounded-lg bg-background p-1">
        {Array.from({ length: 49 }).map((_, idx) => (
          <div
            key={idx}
            className={idx % 2 === 0 || idx % 5 === 0 ? "rounded-[2px] bg-foreground" : "rounded-[2px] bg-surface-card-2"}
          />
        ))}
      </div>
    </div>
  </div>
);

/* ---------- Success View ---------- */
interface SuccessViewProps {
  countdown: number;
}

const SuccessView = ({ countdown }: SuccessViewProps) => (
  <div className="flex flex-col items-center gap-4 py-8">
    <div className="relative">
      {/* confetti dots */}
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{
            background: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#6FD6B4", "#5252E5", "#FF9F43"][i % 6],
            top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 12)}%`,
            left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 12)}%`,
            transform: "translate(-50%,-50%)",
          }}
        />
      ))}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]">
        <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-text-title">兑换成功</h3>
    <p className="text-sm text-text-body-2">权益已充值到账,快去体验吧!</p>
    <Button className="mt-2 h-12 w-full rounded-full bg-tech-gradient text-primary-foreground hover:opacity-90">
      立即使用 ({countdown}s)
    </Button>
  </div>
);

/* ---------- Redeem Main ---------- */
interface RedeemMainProps {
  onOpenHistory: () => void;
  onRedeem: (code: string) => void;
}

const RedeemMain = ({ onOpenHistory, onRedeem }: RedeemMainProps) => {
  const [showQr, setShowQr] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleRedeem = () => {
    if (!CODE_REGEX.test(code)) {
      setError("卡密格式错误，请输入12位大小写字母及数字组合");
      return;
    }
    setError("");
    onRedeem(code);
  };

  return (
    <div className="space-y-5 pt-2">
      <div>
        <Input
          placeholder="请输入卡密"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          className="h-12 rounded-2xl border-border bg-surface-card-2 text-foreground placeholder:text-text-brief focus:outline-none focus:border-primary focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {error && <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>}
      </div>

      <Button onClick={handleRedeem} className="h-12 w-full rounded-full bg-tech-gradient text-primary-foreground transition-all duration-200 hover:opacity-90">
        立即兑换
      </Button>

      <div className="h-px bg-border" />

      <div className="space-y-3">
        <div className="relative flex items-center justify-between">
          <h3 className="text-base font-semibold leading-none text-text-title">操作流程</h3>
          <button type="button" className="text-sm text-text-body-2 transition-colors hover:text-primary" onClick={() => setShowQr((p) => !p)}>
            联系客服
          </button>
          {showQr && <QrFloating />}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step, i) => (
            <Card key={step.title} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="mb-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{i + 1}</div>
              <h4 className="mb-1.5 text-base font-semibold text-text-title">{step.title}</h4>
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-body-2">{step.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-sm text-text-body-2">
        想要查看历史兑换信息?点击
        <button type="button" onClick={onOpenHistory} className="ml-1 text-primary transition-opacity hover:opacity-80">「兑换记录」</button>
      </p>
    </div>
  );
};

/* ---------- Redeem History ---------- */
interface RedeemHistoryProps {
  onBackMain: () => void;
  isMobile?: boolean;
}

const RedeemHistory = ({ onBackMain, isMobile }: RedeemHistoryProps) => (
  <div className="space-y-5 pt-2">
    {isMobile ? (
      /* Mobile: Card layout */
      <div className="space-y-3">
        {mockHistory.map((row) => (
          <Card key={row.code} className="rounded-xl border border-border bg-card p-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-body-2">卡密</span>
                <span className="font-mono text-sm text-foreground">{row.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-body-2">兑换时间</span>
                <span className="text-sm text-foreground">{row.redeemTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-body-2">到期时间</span>
                <span className="text-sm text-foreground">{row.expireTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-body-2">套餐类型</span>
                <span className="text-sm text-foreground">{row.plan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-body-2">状态</span>
                <Badge className={`rounded-full ${row.status === "已兑换" ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600"}`}>
                  {row.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    ) : (
      /* Desktop: Table layout */
      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-card-2">
              <TableHead className="text-foreground">卡密</TableHead>
              <TableHead className="text-foreground">兑换时间</TableHead>
              <TableHead className="text-foreground">到期时间</TableHead>
              <TableHead className="text-foreground">套餐类型</TableHead>
              <TableHead className="text-foreground">状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockHistory.map((row) => (
              <TableRow key={row.code}>
                <TableCell className="font-mono text-sm text-foreground">{row.code}</TableCell>
                <TableCell className="text-sm text-foreground">{row.redeemTime}</TableCell>
                <TableCell className="text-sm text-foreground">{row.expireTime}</TableCell>
                <TableCell className="text-sm text-foreground">{row.plan}</TableCell>
                <TableCell>
                  <Badge className={`rounded-full ${row.status === "已兑换" ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600"}`}>
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}

    <Button onClick={onBackMain} className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
      关闭
    </Button>
  </div>
);

/* ---------- Main Page ---------- */
const Index = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [view, setView] = useState<ModalView>("main");
  const [countdown, setCountdown] = useState(3);

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

  const handleRedeem = useCallback((_code: string) => {
    setView("success");
    setCountdown(3);
  }, []);

  // Countdown timer for success view
  useEffect(() => {
    if (view !== "success") return;
    if (countdown <= 0) {
      setOpen(false);
      setView("main");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [view, countdown]);

  const openRedeem = () => { setView("main"); setOpen(true); };

  const closeAll = (next: boolean) => {
    setOpen(next);
    if (!next) setView("main");
  };

  const titleMap: Record<ModalView, string> = {
    main: "兑换卡密",
    history: "卡密兑换记录",
    success: "兑换卡密",
  };

  const content = (
    <>
      {view === "main" && <RedeemMain onOpenHistory={() => setView("history")} onRedeem={handleRedeem} />}
      {view === "history" && <RedeemHistory onBackMain={() => setView("main")} />}
      {view === "success" && <SuccessView countdown={countdown} />}
    </>
  );

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
            <Button type="button" variant="outline" size="icon" onClick={toggleTheme} className="rounded-full border-border bg-surface-selected hover:bg-surface-hover" aria-label="切换主题">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </Card>

        <Card className="rounded-3xl border border-border bg-surface-card-2 p-6 shadow-soft sm:p-8">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-surface-selected p-3"><Gift className="h-5 w-5 text-primary" /></div>
            <h2 className="text-xl font-semibold text-text-title">点击按钮打开兑换弹窗</h2>
            <p className="text-sm text-text-body-2">已按参考图重做，移动端自动从底部弹出。</p>
            <Button type="button" onClick={openRedeem} className="w-full rounded-xl bg-primary text-primary-foreground transition-colors duration-200 hover:bg-primary/90 sm:w-auto">
              兑换
            </Button>
          </div>
        </Card>
      </section>

      {isMobile ? (
        <Drawer open={open} onOpenChange={closeAll}>
          <DrawerContent className="max-h-[85vh] rounded-t-2xl border-border bg-card px-4 pb-5 pt-2">
            <DrawerHeader className="px-1 text-left">
              <DrawerTitle className="text-base font-semibold text-text-title">{titleMap[view]}</DrawerTitle>
              <DrawerDescription className="sr-only">兑换弹窗</DrawerDescription>
            </DrawerHeader>
            <div className="max-h-[calc(85vh-80px)] overflow-y-auto px-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{content}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={closeAll}>
          <DialogContent className="w-[758px] max-w-[758px] rounded-2xl border-border bg-card p-5 shadow-soft">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-text-title">{titleMap[view]}</DialogTitle>
              <DialogDescription className="sr-only">兑换弹窗</DialogDescription>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
};

export default Index;
