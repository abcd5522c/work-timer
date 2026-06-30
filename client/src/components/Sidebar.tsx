/**
 * Sidebar — 左側固定導覽
 * 設計：工業極簡，細線分隔，精準對齊
 */

import { Timer, BarChart2, Settings } from "lucide-react";
import { useLocation, Link } from "wouter";

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { path: "/", icon: <Timer className="w-5 h-5" />, label: "計時" },
  { path: "/stats", icon: <BarChart2 className="w-5 h-5" />, label: "統計" },
  { path: "/settings", icon: <Settings className="w-5 h-5" />, label: "設定" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-16 md:w-56 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800">
        <img
          src="/manus-storage/logo_99dea628.png"
          alt="WorkTimer"
          className="w-8 h-8 shrink-0"
        />
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-zinc-100 tracking-wide">WorkTimer</p>
          <p className="text-xs text-zinc-600">每日工時追蹤</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = item.path === "/" ? location === "/" : location.startsWith(item.path);
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="hidden md:block text-sm font-medium">{item.label}</span>
                {isActive && (
                  <span className="hidden md:block ml-auto w-1 h-1 rounded-full bg-amber-400" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <p className="hidden md:block text-xs text-zinc-700 font-timer">v1.0.0</p>
      </div>
    </aside>
  );
}
