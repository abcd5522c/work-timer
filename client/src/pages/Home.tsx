/**
 * Home — 極簡每日工時記錄（手機優化版）
 * 只做一件事：記錄每天上班幾小時
 */

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ── 資料型別 ──────────────────────────────────────────
interface DayEntry {
  date: string;   // YYYY-MM-DD
  hours: number;  // 工時（小時，支援小數，如 8.5）
  note: string;   // 備註（可空）
}

const STORAGE_KEY = "daily_work_hours";

function load(): DayEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}
function save(data: DayEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── 日期工具 ──────────────────────────────────────────
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function todayStr() { return toDateStr(new Date()); }
function displayDate(s: string) {
  const [y, m, d] = s.split("-");
  return `${y} 年 ${parseInt(m)} 月 ${parseInt(d)} 日`;
}
const WEEKDAYS = ["日","一","二","三","四","五","六"];
function weekday(s: string) {
  return "週" + WEEKDAYS[new Date(s + "T00:00:00").getDay()];
}
function addDays(s: string, n: number) {
  const d = new Date(s + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

// ── 主元件 ────────────────────────────────────────────
export default function Home() {
  const [entries, setEntries] = useState<DayEntry[]>(load);
  const [viewDate, setViewDate] = useState(todayStr());
  const [hoursInput, setHoursInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  // 當前日期的記錄
  const current = entries.find(e => e.date === viewDate);
  const isToday = viewDate === todayStr();

  // 本月統計
  const monthPrefix = viewDate.slice(0, 7);
  const monthEntries = entries.filter(e => e.date.startsWith(monthPrefix));
  const monthTotal = monthEntries.reduce((s, e) => s + e.hours, 0);
  const monthDays = monthEntries.length;

  // 儲存記錄
  const handleSave = () => {
    const h = parseFloat(hoursInput);
    if (isNaN(h) || h < 0 || h > 24) {
      toast.error("請輸入有效的工時（0–24）");
      return;
    }
    const note = noteInput.trim();
    const updated = entries.filter(e => e.date !== viewDate);
    updated.push({ date: viewDate, hours: h, note });
    updated.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(updated);
    save(updated);
    setHoursInput("");
    setNoteInput("");
    toast.success(`已記錄 ${displayDate(viewDate)}：${h} 小時`);
  };

  // 刪除記錄
  const handleDelete = (date: string) => {
    const updated = entries.filter(e => e.date !== date);
    setEntries(updated);
    save(updated);
    toast("已刪除記錄");
  };

  // 切換日期時填入已有資料
  useEffect(() => {
    const c = entries.find(e => e.date === viewDate);
    if (c) {
      setHoursInput(String(c.hours));
      setNoteInput(c.note);
    } else {
      setHoursInput("");
      setNoteInput("");
    }
  }, [viewDate, entries]);

  // 近 30 天記錄（最新在前）
  const recentEntries = entries.slice(0, 30);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-4 px-4 pb-safe">
      {/* Header */}
      <div className="w-full max-w-md mb-6 text-center pt-safe">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img src="/manus-storage/logo_99dea628.png" alt="logo" className="w-6 h-6" />
          <h1 className="font-timer text-lg font-semibold tracking-widest text-zinc-100">WorkLog</h1>
        </div>
        <p className="text-xs text-zinc-600 tracking-wide">每日工時記錄</p>
      </div>

      {/* Date Picker */}
      <div className="w-full max-w-md mb-5">
        <div className="flex items-center justify-between bg-zinc-900 rounded-2xl px-3 py-3">
          <button
            onClick={() => setViewDate(d => addDays(d, -1))}
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-2 rounded-lg hover:bg-zinc-800 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <p className="text-sm font-semibold text-zinc-100">{displayDate(viewDate)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {weekday(viewDate)}{isToday && <span className="ml-2 text-amber-500 font-medium">今天</span>}
            </p>
          </div>
          <button
            onClick={() => setViewDate(d => addDays(d, 1))}
            disabled={viewDate >= todayStr()}
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Input Card */}
      <div className="w-full max-w-md mb-5">
        <div className="bg-zinc-900 rounded-3xl p-5 space-y-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
            {current ? "修改記錄" : "新增記錄"}
          </p>

          {/* Hours input */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={hoursInput}
                onChange={e => setHoursInput(e.target.value)}
                placeholder="0"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 font-timer text-3xl h-16 text-center pr-14 focus:border-amber-500/50 focus:ring-amber-500/20"
                onKeyDown={e => e.key === "Enter" && handleSave()}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none font-medium">
                小時
              </span>
            </div>
          </div>

          {/* Quick select buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[6, 7, 7.5, 8, 8.5, 9, 10, 12].map(h => (
              <button
                key={h}
                onClick={() => setHoursInput(String(h))}
                className={`px-2 py-2.5 rounded-xl text-xs font-timer font-semibold transition-all duration-150 active:scale-95 ${
                  hoursInput === String(h)
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                    : "bg-zinc-800 text-zinc-300 active:bg-zinc-700"
                }`}
              >
                {h}h
              </button>
            ))}
          </div>

          {/* Note input */}
          <Input
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            placeholder="備註（選填）"
            className="bg-zinc-800 border-zinc-700 text-zinc-300 placeholder:text-zinc-600 text-sm focus:border-amber-500/50 focus:ring-amber-500/20 h-11"
            onKeyDown={e => e.key === "Enter" && handleSave()}
          />

          <Button
            onClick={handleSave}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-12 text-base transition-all duration-150 active:scale-95 rounded-2xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            {current ? "更新記錄" : "儲存記錄"}
          </Button>
        </div>
      </div>

      {/* Month Summary */}
      {monthDays > 0 && (
        <div className="w-full max-w-md mb-5">
          <div className="bg-zinc-900/60 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 tracking-wide">
                {viewDate.slice(0, 7).replace("-", " 年 ")} 月
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">共 {monthDays} 天</p>
            </div>
            <div className="text-right">
              <p className="font-timer text-2xl text-amber-400">{monthTotal.toFixed(1)}<span className="text-sm ml-1 text-zinc-500">h</span></p>
              <p className="text-xs text-zinc-600">均 {(monthTotal / monthDays).toFixed(1)}h／天</p>
            </div>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="w-full max-w-md pb-safe">
        <p className="text-xs font-semibold tracking-widest uppercase text-zinc-600 mb-3 px-1">
          歷史記錄
        </p>
        {recentEntries.length === 0 ? (
          <div className="text-center py-12 text-zinc-700 text-sm">
            尚無記錄，從今天開始吧
          </div>
        ) : (
          <div className="space-y-2">
            {recentEntries.map(entry => (
              <div
                key={entry.date}
                className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-colors duration-150 active:scale-95 ${
                  entry.date === viewDate
                    ? "bg-zinc-800 ring-1 ring-amber-500/30"
                    : "bg-zinc-900/60 active:bg-zinc-900"
                }`}
                onClick={() => setViewDate(entry.date)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-zinc-200">
                      {displayDate(entry.date)}
                    </span>
                    <span className="text-xs text-zinc-600">{weekday(entry.date)}</span>
                    {entry.date === todayStr() && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">今天</span>
                    )}
                  </div>
                  {entry.note && (
                    <p className="text-xs text-zinc-600 mt-1 truncate">{entry.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="font-timer text-lg text-amber-400">
                    {entry.hours}<span className="text-xs text-zinc-500 ml-0.5">h</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(entry.date);
                    }}
                    className="opacity-0 group-active:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-2 rounded-lg active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
