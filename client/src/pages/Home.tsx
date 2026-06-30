/**
 * Home — 每日工時記錄（含排班系統）
 */

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useShiftSchedule, getShiftColor, getShiftName } from "@/hooks/useShiftSchedule";

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
  const { shifts, entries, addEntry, deleteEntry, getDateEntries, getMonthStats } = useShiftSchedule();
  const [viewDate, setViewDate] = useState(todayStr());
  const [selectedShiftId, setSelectedShiftId] = useState(shifts[0]?.id ?? "");
  const [hoursInput, setHoursInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const isToday = viewDate === todayStr();
  const dateEntries = getDateEntries(viewDate);
  const monthPrefix = viewDate.slice(0, 7);
  const monthStats = getMonthStats(monthPrefix);

  // 初始化選中班次
  useEffect(() => {
    if (shifts.length > 0 && !shifts.find(s => s.id === selectedShiftId)) {
      setSelectedShiftId(shifts[0].id);
    }
  }, [shifts, selectedShiftId]);

  // 儲存記錄
  const handleSave = () => {
    const h = parseFloat(hoursInput);
    if (isNaN(h) || h < 0 || h > 24) {
      toast.error("請輸入有效的工時（0–24）");
      return;
    }
    const note = noteInput.trim();
    addEntry(viewDate, selectedShiftId, h, note);
    setHoursInput("");
    setNoteInput("");
    toast.success(`已記錄 ${getShiftName(shifts, selectedShiftId)} — ${h} 小時`);
  };

  // 刪除記錄
  const handleDelete = (shiftId: string) => {
    deleteEntry(viewDate, shiftId);
    toast("已刪除記錄");
  };

  // 當前日期的工時總計
  const dayTotal = dateEntries.reduce((s, e) => s + e.hours, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-4 px-4 pb-safe">
      {/* Header */}
      <div className="w-full max-w-md mb-5 flex items-center justify-between pt-safe">
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="/manus-storage/logo_99dea628.png" alt="logo" className="w-6 h-6" />
            <h1 className="font-timer text-lg font-semibold tracking-widest text-zinc-100">WorkLog</h1>
          </div>
          <p className="text-xs text-zinc-600 tracking-wide">排班工時記錄</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-zinc-600 hover:text-zinc-200 transition-colors p-2 rounded-lg hover:bg-zinc-800 active:scale-95"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full max-w-md mb-5 bg-zinc-900 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">班次設定</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {shifts.map(shift => (
              <div key={shift.id} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: shift.color }}
                />
                <span className="text-sm text-zinc-300 flex-1">{shift.name}</span>
                {shift.startTime && (
                  <span className="text-xs text-zinc-600 font-timer">
                    {shift.startTime}–{shift.endTime}
                  </span>
                )}
              </div>
            ))}
          </div>
          <Button
            onClick={() => setShowSettings(false)}
            variant="outline"
            size="sm"
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-9"
          >
            關閉
          </Button>
        </div>
      )}

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

      {/* Shift Selector */}
      <div className="w-full max-w-md mb-5">
        <p className="text-xs font-semibold tracking-widest uppercase text-zinc-600 mb-2 px-1">選擇班次</p>
        <div className="grid grid-cols-3 gap-2">
          {shifts.map(shift => (
            <button
              key={shift.id}
              onClick={() => setSelectedShiftId(shift.id)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 border-2 ${
                selectedShiftId === shift.id
                  ? "border-amber-500 text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
              style={
                selectedShiftId === shift.id
                  ? { backgroundColor: shift.color + "20", color: "white" }
                  : {}
              }
            >
              <div
                className="w-2 h-2 rounded-full mx-auto mb-1"
                style={{ backgroundColor: shift.color }}
              />
              {shift.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Card */}
      <div className="w-full max-w-md mb-5">
        <div className="bg-zinc-900 rounded-3xl p-5 space-y-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
            新增記錄
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
            儲存記錄
          </Button>
        </div>
      </div>

      {/* Today's Summary */}
      {dayTotal > 0 && (
        <div className="w-full max-w-md mb-5">
          <div className="bg-zinc-900/60 rounded-2xl px-5 py-4">
            <p className="text-xs text-zinc-500 tracking-wide mb-3">今日工時</p>
            <div className="space-y-2">
              {dateEntries.map(entry => (
                <div key={entry.shiftId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getShiftColor(shifts, entry.shiftId) }}
                    />
                    <span className="text-sm text-zinc-300">{getShiftName(shifts, entry.shiftId)}</span>
                  </div>
                  <span className="font-timer text-amber-400">{entry.hours}h</span>
                </div>
              ))}
              <div className="border-t border-zinc-800 pt-2 mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">累計</span>
                <span className="font-timer text-lg text-amber-400">{dayTotal.toFixed(1)}h</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Records */}
      {dateEntries.length > 0 && (
        <div className="w-full max-w-md mb-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-600 mb-3 px-1">
            今日記錄
          </p>
          <div className="space-y-2">
            {dateEntries.map(entry => (
              <div
                key={entry.shiftId}
                className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-zinc-900/60 active:bg-zinc-900"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: getShiftColor(shifts, entry.shiftId) }}
                    />
                    <span className="text-sm font-medium text-zinc-200">
                      {getShiftName(shifts, entry.shiftId)}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-xs text-zinc-600 mt-1 truncate">{entry.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="font-timer text-lg text-amber-400">{entry.hours}h</span>
                  <button
                    onClick={() => handleDelete(entry.shiftId)}
                    className="opacity-0 group-active:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-2 rounded-lg active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month Summary */}
      <div className="w-full max-w-md pb-safe">
        <p className="text-xs font-semibold tracking-widest uppercase text-zinc-600 mb-3 px-1">
          {viewDate.slice(0, 7).replace("-", " 年 ")} 月統計
        </p>
        <div className="bg-zinc-900/60 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">總工時</span>
            <span className="font-timer text-xl text-amber-400">{monthStats.totalHours.toFixed(1)}h</span>
          </div>
          <div className="border-t border-zinc-800 pt-3">
            {shifts.map(shift => {
              const stat = monthStats.stats[shift.id];
              if (stat.days === 0) return null;
              return (
                <div key={shift.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: shift.color }}
                    />
                    <span className="text-xs text-zinc-400">{shift.name}</span>
                  </div>
                  <span className="font-timer text-sm text-zinc-300">
                    {stat.hours.toFixed(1)}h ({stat.days}d)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
