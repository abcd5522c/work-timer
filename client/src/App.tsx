import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

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
          <Home />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
