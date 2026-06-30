/**
 * TimerPage — 主計時器頁面
 * 設計：工業極簡，超大等寬計時數字，琥珀橙強調
 */

import { useState, useRef } from "react";
import { Play, Pause, Square, Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDuration, formatHuman, useWorkTimer } from "@/hooks/useWorkTimer";
import type { WorkSession } from "@/hooks/useWorkTimer";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function TimerPage() {
  const {
    status,
    elapsed,
    currentLabel,
    setCurrentLabel,
    start,
    pause,
    stop,
    todayRecord,
    deleteSession,
    getTodayStr,
  } = useWorkTimer();

  const [labelInput, setLabelInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    const label = labelInput.trim() || currentLabel || "工作";
    setCurrentLabel(label);
    start(label);
    toast.success(`開始計時：${label}`);
  };

  const handlePause = () => {
    pause();
    toast("計時已暫停");
  };

  const handleStop = () => {
    if (elapsed < 1) {
      toast.error("尚未開始計時");
      return;
    }
    const label = currentLabel || "工作";
    stop(label);
    toast.success(`已記錄：${label} — ${formatHuman(elapsed)}`);
    setLabelInput("");
  };

  const handleDelete = (session: WorkSession) => {
    deleteSession(getTodayStr(), session.id);
    toast("已刪除記錄");
  };

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isIdle = status === "idle";

  const todaySessions = todayRecord?.sessions ?? [];
  const todayTotal = todayRecord?.totalSeconds ?? 0;
  const todayTotalWithCurrent = todayTotal + (isRunning || isPaused ? elapsed : 0);

  return (
    <div className="flex flex-col h-full">
      {/* Timer Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative">
        {/* Status indicator */}
        <div className="flex items-center gap-2 mb-6 fade-up fade-up-1">
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 dot-blink" />
              計時中
            </span>
          )}
          {isPaused && (
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              已暫停
            </span>
          )}
          {isIdle && (
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-zinc-600">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              待機
            </span>
          )}
        </div>

        {/* Big Timer Display */}
        <div
          className={`font-timer text-center mb-8 fade-up fade-up-2 transition-all duration-300 ${
            isRunning ? "timer-active-glow rounded-2xl px-8 py-4" : "px-8 py-4"
          }`}
        >
          <span
            className={`font-timer font-light tabular-nums transition-colors duration-300 ${
              isRunning
                ? "text-amber-400"
                : isPaused
                ? "text-amber-600"
                : "text-zinc-300"
            }`}
            style={{ fontSize: "clamp(3.5rem, 10vw, 7rem)", letterSpacing: "-0.02em" }}
          >
            {formatDuration(elapsed)}
          </span>
        </div>

        {/* Label Input */}
        <div className="w-full max-w-sm mb-8 fade-up fade-up-3">
          <Input
            ref={inputRef}
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            placeholder={currentLabel || "工作項目名稱..."}
            disabled={isRunning}
            className="bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 text-center font-medium tracking-wide focus:border-amber-500/50 focus:ring-amber-500/20 h-11"
            onKeyDown={(e) => {
              if (e.key === "Enter" && isIdle) handleStart();
            }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 fade-up fade-up-4">
          {isIdle && (
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-8 h-12 text-sm tracking-wide transition-all duration-150 active:scale-[0.97]"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              開始計時
            </Button>
          )}

          {isRunning && (
            <>
              <Button
                onClick={handlePause}
                variant="outline"
                size="lg"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white h-12 px-6 transition-all duration-150 active:scale-[0.97]"
              >
                <Pause className="w-4 h-4 mr-2" />
                暫停
              </Button>
              <Button
                onClick={handleStop}
                size="lg"
                className="bg-zinc-800 hover:bg-zinc-700 text-white h-12 px-6 transition-all duration-150 active:scale-[0.97]"
              >
                <Square className="w-4 h-4 mr-2 fill-current" />
                停止並記錄
              </Button>
            </>
          )}

          {isPaused && (
            <>
              <Button
                onClick={() => start()}
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 h-12 transition-all duration-150 active:scale-[0.97]"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                繼續
              </Button>
              <Button
                onClick={handleStop}
                variant="outline"
                size="lg"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 h-12 px-6 transition-all duration-150 active:scale-[0.97]"
              >
                <Square className="w-4 h-4 mr-2 fill-current" />
                停止並記錄
              </Button>
            </>
          )}
        </div>

        {/* Today total */}
        {todayTotalWithCurrent > 0 && (
          <div className="mt-8 text-center fade-up fade-up-5">
            <span className="text-xs tracking-widest uppercase text-zinc-600">今日累計</span>
            <p className="font-timer text-2xl text-zinc-400 mt-1">
              {formatHuman(todayTotalWithCurrent)}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800 mx-6" />

      {/* Today's Sessions */}
      <div className="px-6 py-5 max-h-72 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
            今日記錄
          </h3>
          {todaySessions.length > 0 && (
            <span className="text-xs text-zinc-600 font-timer">
              {todaySessions.length} 筆
            </span>
          )}
        </div>

        {todaySessions.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-zinc-700">
            <Clock className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">尚無記錄，開始計時吧</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((session, i) => (
              <div
                key={session.id}
                className="group flex items-center justify-between py-2.5 px-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 transition-colors duration-150 fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 font-medium truncate">{session.label}</p>
                    <p className="text-xs text-zinc-600 font-timer">
                      {formatTime(session.startTime)} — {formatTime(session.endTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="font-timer text-sm text-amber-400/80">
                    {formatHuman(session.duration)}
                  </span>
                  <button
                    onClick={() => handleDelete(session)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all duration-150 p-1 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
