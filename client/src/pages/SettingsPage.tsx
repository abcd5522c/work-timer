/**
 * SettingsPage — 設定與資料管理
 */

import { useState } from "react";
import { Download, Trash2, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useWorkTimer, formatHuman } from "@/hooks/useWorkTimer";

export default function SettingsPage() {
  const { records, deleteDay } = useWorkTimer();
  const [confirmClear, setConfirmClear] = useState(false);

  const exportCSV = () => {
    if (records.length === 0) {
      toast.error("尚無資料可匯出");
      return;
    }

    const rows = [
      ["日期", "工作項目", "開始時間", "結束時間", "時長（分鐘）", "時長（小時）"],
    ];

    records.forEach((day) => {
      day.sessions.forEach((session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const fmt = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        rows.push([
          day.date,
          session.label,
          fmt(start),
          fmt(end),
          String(Math.round(session.duration / 60)),
          String(Math.round((session.duration / 3600) * 100) / 100),
        ]);
      });
    });

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `worktimer_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("已匯出 CSV 檔案");
  };

  const exportJSON = () => {
    if (records.length === 0) {
      toast.error("尚無資料可匯出");
      return;
    }
    const json = JSON.stringify(records, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `worktimer_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("已匯出 JSON 檔案");
  };

  const clearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    // Delete all records
    const allDates = records.map((r) => r.date);
    allDates.forEach((date) => deleteDay(date));
    setConfirmClear(false);
    toast.success("已清除所有資料");
  };

  const totalHours = records.reduce((s, r) => s + r.totalSeconds, 0);
  const totalSessions = records.reduce((s, r) => s + r.sessions.length, 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-5 space-y-6">
        {/* Data Summary */}
        <div className="fade-up fade-up-1">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">
            資料概覽
          </h3>
          <div className="bg-zinc-900/60 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">記錄天數</span>
              <span className="font-timer text-zinc-200">{records.length} 天</span>
            </div>
            <div className="border-t border-zinc-800" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">工作項目數</span>
              <span className="font-timer text-zinc-200">{totalSessions} 筆</span>
            </div>
            <div className="border-t border-zinc-800" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">累計工時</span>
              <span className="font-timer text-amber-400">{formatHuman(totalHours)}</span>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="fade-up fade-up-2">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">
            匯出資料
          </h3>
          <div className="space-y-3">
            <button
              onClick={exportCSV}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-zinc-900/60 hover:bg-zinc-900 rounded-xl transition-colors duration-150 group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-200">匯出 CSV</p>
                  <p className="text-xs text-zinc-600">適合 Excel / Google Sheets</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={exportJSON}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-zinc-900/60 hover:bg-zinc-900 rounded-xl transition-colors duration-150 group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-200">匯出 JSON</p>
                  <p className="text-xs text-zinc-600">完整資料備份</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="fade-up fade-up-3">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-red-800 mb-4">
            危險操作
          </h3>
          <div className="border border-red-900/40 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-zinc-200">清除所有資料</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  此操作將永久刪除所有工時記錄，無法復原。
                </p>
              </div>
            </div>
            <Button
              onClick={clearAll}
              variant="outline"
              size="sm"
              className={`border-red-800/60 text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all duration-150 ${
                confirmClear ? "bg-red-950/40 border-red-600" : ""
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              {confirmClear ? "確認清除（點擊確認）" : "清除所有資料"}
            </Button>
            {confirmClear && (
              <button
                onClick={() => setConfirmClear(false)}
                className="ml-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                取消
              </button>
            )}
          </div>
        </div>

        {/* About */}
        <div className="fade-up fade-up-4 pb-4">
          <div className="text-center space-y-1">
            <p className="font-timer text-xs text-zinc-700">WorkTimer v1.0.0</p>
            <p className="text-xs text-zinc-800">資料儲存於本機瀏覽器</p>
          </div>
        </div>
      </div>
    </div>
  );
}
