import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import StatsPage from "./pages/StatsPage";
import TimeTracker from "./pages/TimeTracker";
import { BarChart3, Home as HomeIcon } from "lucide-react";

function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around pb-safe">
      <button
        onClick={() => setLocation("/")}
        className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
          location === "/" ? "text-amber-500" : "text-zinc-600 hover:text-zinc-300"
        }`}
      >
        <HomeIcon className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">記錄</span>
      </button>
      <button
        onClick={() => setLocation("/stats")}
        className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
          location === "/stats" ? "text-amber-500" : "text-zinc-600 hover:text-zinc-300"
        }`}
      >
        <BarChart3 className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">統計</span>
      </button>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <TimeTracker />
      </Route>
      <Route path="/classic">
        <Home />
      </Route>
      <Route path="/stats">
        <StatsPage />
      </Route>
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
          <div className="pb-20">
            <Router />
          </div>
          <Navigation />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
