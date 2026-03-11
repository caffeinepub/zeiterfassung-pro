import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import {
  Clock,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Timer,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Dashboard from "./pages/Dashboard";
import Einstellungen from "./pages/Einstellungen";
import Kunden from "./pages/Kunden";
import Rechnungen from "./pages/Rechnungen";
import Spesen from "./pages/Spesen";
import Zeiterfassung from "./pages/Zeiterfassung";

type Page =
  | "dashboard"
  | "kunden"
  | "zeiterfassung"
  | "spesen"
  | "rechnungen"
  | "einstellungen";

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Übersicht", icon: LayoutDashboard },
  { id: "kunden", label: "Kunden", icon: Users },
  { id: "zeiterfassung", label: "Zeiterfassung", icon: Clock },
  { id: "spesen", label: "Spesen", icon: Receipt },
  { id: "rechnungen", label: "Rechnungen", icon: FileText },
  { id: "einstellungen", label: "Einstellungen", icon: Settings },
];

function LoginScreen({
  onLogin,
  isLoading,
}: { onLogin: () => void; isLoading: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <Timer className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Zeiterfassung
        </h1>
        <p className="mt-3 text-muted-foreground">
          Professionelle Zeiterfassung und Rechnungsstellung in CHF.
        </p>
        <Button
          className="mt-8 w-full gap-2"
          size="lg"
          onClick={onLogin}
          disabled={isLoading}
          data-ocid="login.primary_button"
        >
          <LogIn className="h-4 w-4" />
          {isLoading ? "Wird angemeldet…" : "Anmelden"}
        </Button>
        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} ·{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Built with caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function App() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={login} isLoading={isLoggingIn} />
        <Toaster richColors position="bottom-right" />
      </>
    );
  }

  const navigate = (p: string) => {
    setPage(p as Page);
    setMobileOpen(false);
  };

  const CurrentPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard onNavigate={navigate} />;
      case "kunden":
        return <Kunden />;
      case "zeiterfassung":
        return <Zeiterfassung />;
      case "spesen":
        return <Spesen />;
      case "rechnungen":
        return <Rechnungen />;
      case "einstellungen":
        return <Einstellungen />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Timer className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">Zeiterfassung</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        <nav className="flex-1 space-y-1 p-3 pt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate(item.id)}
                data-ocid={`nav.${item.id}.link`}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        <div className="p-3">
          <button
            type="button"
            onClick={clear}
            data-ocid="nav.logout.button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
          <p className="mt-4 px-3 text-center text-xs text-sidebar-foreground/40">
            © {new Date().getFullYear()} ·{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-sidebar-foreground/70"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </motion.aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex h-16 items-center border-b border-border bg-card px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            data-ocid="nav.menu.button"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-3 font-display font-semibold">
            {navItems.find((n) => n.id === page)?.label}
          </span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CurrentPage />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
