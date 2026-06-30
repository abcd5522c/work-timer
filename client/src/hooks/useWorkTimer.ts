/**
 * useWorkTimer — 工時計時核心 Hook
 * 設計：工業極簡，數字至上，精準追蹤
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type TimerStatus = "idle" | "running" | "paused";

export interface WorkSession {
  id: string;
  label: string;
  startTime: number;
  endTime: number;
  duration: number; // seconds
  date: string; // YYYY-MM-DD
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  sessions: WorkSession[];
  totalSeconds: number;
}

const STORAGE_KEY = "worktimer_records";
const CURRENT_KEY = "worktimer_current";

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadRecords(): DayRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: DayRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

interface CurrentTimer {
  startTime: number;
  label: string;
  accumulated: number; // seconds accumulated before current start
}

export function useWorkTimer() {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [elapsed, setElapsed] = useState(0); // seconds
  const [currentLabel, setCurrentLabel] = useState("工作");
  const [records, setRecords] = useState<DayRecord[]>(loadRecords);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [accumulated, setAccumulated] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Restore persisted running state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CURRENT_KEY);
      if (raw) {
        const current: CurrentTimer = JSON.parse(raw);
        const now = Date.now();
        const extra = Math.floor((now - current.startTime) / 1000);
        const total = current.accumulated + extra;
        setAccumulated(current.accumulated);
        setElapsed(total);
        setCurrentLabel(current.label);
        setSessionStartTime(current.startTime);
        startTimeRef.current = current.startTime;
        setStatus("running");
      }
    } catch {
      // ignore
    }
  }, []);

  // Tick interval
  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          const extra = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsed(accumulated + extra);
        }
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, accumulated]);

  const start = useCallback((label?: string) => {
    const lbl = label ?? currentLabel;
    const now = Date.now();
    setCurrentLabel(lbl);
    setSessionStartTime(now);
    startTimeRef.current = now;
    setStatus("running");

    const current: CurrentTimer = {
      startTime: now,
      label: lbl,
      accumulated,
    };
    localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
  }, [currentLabel, accumulated]);

  const pause = useCallback(() => {
    if (status !== "running" || startTimeRef.current === null) return;
    const extra = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const newAcc = accumulated + extra;
    setAccumulated(newAcc);
    setElapsed(newAcc);
    startTimeRef.current = null;
    setStatus("paused");
    localStorage.removeItem(CURRENT_KEY);
  }, [status, accumulated]);

  const stop = useCallback((label?: string) => {
    const finalLabel = label ?? currentLabel;
    let finalElapsed = elapsed;

    if (status === "running" && startTimeRef.current !== null) {
      const extra = Math.floor((Date.now() - startTimeRef.current) / 1000);
      finalElapsed = accumulated + extra;
    }

    if (finalElapsed < 1) {
      // Nothing to record
      setStatus("idle");
      setElapsed(0);
      setAccumulated(0);
      startTimeRef.current = null;
      localStorage.removeItem(CURRENT_KEY);
      return;
    }

    const today = getTodayStr();
    const session: WorkSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: finalLabel,
      startTime: sessionStartTime ?? Date.now() - finalElapsed * 1000,
      endTime: Date.now(),
      duration: finalElapsed,
      date: today,
    };

    setRecords((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((d) => d.date === today);
      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx],
          sessions: [...updated[idx].sessions, session],
          totalSeconds: updated[idx].totalSeconds + finalElapsed,
        };
      } else {
        updated.push({
          date: today,
          sessions: [session],
          totalSeconds: finalElapsed,
        });
      }
      saveRecords(updated);
      return updated;
    });

    setStatus("idle");
    setElapsed(0);
    setAccumulated(0);
    startTimeRef.current = null;
    setSessionStartTime(null);
    localStorage.removeItem(CURRENT_KEY);
  }, [status, elapsed, accumulated, currentLabel, sessionStartTime]);

  const deleteSession = useCallback((date: string, sessionId: string) => {
    setRecords((prev) => {
      const updated = prev.map((d) => {
        if (d.date !== date) return d;
        const sessions = d.sessions.filter((s) => s.id !== sessionId);
        const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
        return { ...d, sessions, totalSeconds };
      }).filter((d) => d.sessions.length > 0);
      saveRecords(updated);
      return updated;
    });
  }, []);

  const deleteDay = useCallback((date: string) => {
    setRecords((prev) => {
      const updated = prev.filter((d) => d.date !== date);
      saveRecords(updated);
      return updated;
    });
  }, []);

  const todayRecord = records.find((d) => d.date === getTodayStr());

  return {
    status,
    elapsed,
    currentLabel,
    setCurrentLabel,
    start,
    pause,
    stop,
    records,
    todayRecord,
    deleteSession,
    deleteDay,
    getTodayStr,
  };
}

/** Format seconds → HH:MM:SS */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

/** Format seconds → human readable (e.g. 2h 30m) */
export function formatHuman(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${seconds}s`;
}

/** Format date string → display (e.g. 2024-01-15 → 1月15日) */
export function formatDateDisplay(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m)}月${parseInt(d)}日`;
}

/** Get week day name */
export function getWeekDay(dateStr: string): string {
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  const d = new Date(dateStr + "T00:00:00");
  return `週${days[d.getDay()]}`;
}
