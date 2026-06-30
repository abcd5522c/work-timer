/**
 * App.tsx — 主應用程式
 * 設計：工業極簡，左側邊欄 + 右側主內容
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Sidebar from "./components/Sidebar";
import TimerPage from "./pages/TimerPage";
import StatsPage from "./pages/StatsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-6 py-5 border-b border-zinc-800 shrink-0">
      <h1 className="text-base font-semibold text-zinc-100 tracking-wide">{title}</h1>
      {subtitle && <p className="text-xs text-zinc-600 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <div className="flex flex-col h-full">
          <PageHeader title="計時器" subtitle="追蹤今日工時" />
          <TimerPage />
        </div>
      </Route>
      <Route path="/stats">
        <div className="flex flex-col h-full">
          <PageHeader title="統計" subtitle="工時分析與歷史記錄" />
          <StatsPage />
        </div>
      </Route>
      <Route path="/settings">
        <div className="flex flex-col h-full">
          <PageHeader title="設定" subtitle="資料管理與匯出" />
          <SettingsPage />
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                border: "1px solid #27272a",
                color: "#f4f4f5",
                fontFamily: "IBM Plex Sans, sans-serif",
              },
            }}
          />
          {/* Main Layout: Sidebar + Content */}
          <div className="flex h-screen bg-zinc-950 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-hidden bg-zinc-950">
              <Router />
            </main>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
