/**
 * useShiftSchedule — 排班系統管理
 */

import { useState, useCallback } from "react";

export interface ShiftType {
  id: string;
  name: string;
  color: string;
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
}

export interface DayEntry {
  date: string;
  hours: number;
  shiftId: string;
  note: string;
}

const SHIFTS_KEY = "shift_types";
const ENTRIES_KEY = "shift_entries";

// 預設班次
const DEFAULT_SHIFTS: ShiftType[] = [
  { id: "day", name: "日班", color: "#FFD700", startTime: "09:00", endTime: "17:00" },
  { id: "night", name: "夜班", color: "#4B0082", startTime: "21:00", endTime: "06:00" },
  { id: "evening", name: "晚班", color: "#FF6347", startTime: "17:00", endTime: "21:00" },
  { id: "rest", name: "休息", color: "#808080" },
];

function loadShifts(): ShiftType[] {
  try {
    const raw = localStorage.getItem(SHIFTS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SHIFTS;
  } catch {
    return DEFAULT_SHIFTS;
  }
}

function saveShifts(shifts: ShiftType[]) {
  localStorage.setItem(SHIFTS_KEY, JSON.stringify(shifts));
}

function loadEntries(): DayEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: DayEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function useShiftSchedule() {
  const [shifts, setShifts] = useState<ShiftType[]>(loadShifts);
  const [entries, setEntries] = useState<DayEntry[]>(loadEntries);

  // 新增班次類型
  const addShift = useCallback((shift: Omit<ShiftType, "id">) => {
    const newShift: ShiftType = {
      ...shift,
      id: `shift_${Date.now()}`,
    };
    const updated = [...shifts, newShift];
    setShifts(updated);
    saveShifts(updated);
    return newShift;
  }, [shifts]);

  // 編輯班次類型
  const updateShift = useCallback((id: string, updates: Partial<ShiftType>) => {
    const updated = shifts.map(s => s.id === id ? { ...s, ...updates } : s);
    setShifts(updated);
    saveShifts(updated);
  }, [shifts]);

  // 刪除班次類型
  const deleteShift = useCallback((id: string) => {
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    saveShifts(updated);
    // 同時刪除使用該班次的記錄
    const entriesUpdated = entries.filter(e => e.shiftId !== id);
    setEntries(entriesUpdated);
    saveEntries(entriesUpdated);
  }, [shifts, entries]);

  // 記錄工時
  const addEntry = useCallback((date: string, shiftId: string, hours: number, note: string = "") => {
    const updated = entries.filter(e => e.date !== date || e.shiftId !== shiftId);
    updated.push({ date, shiftId, hours, note });
    updated.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(updated);
    saveEntries(updated);
  }, [entries]);

  // 刪除記錄
  const deleteEntry = useCallback((date: string, shiftId: string) => {
    const updated = entries.filter(e => !(e.date === date && e.shiftId === shiftId));
    setEntries(updated);
    saveEntries(updated);
  }, [entries]);

  // 取得特定日期的記錄
  const getDateEntries = useCallback((date: string) => {
    return entries.filter(e => e.date === date);
  }, [entries]);

  // 取得特定班次的統計
  const getShiftStats = useCallback((shiftId: string, startDate?: string, endDate?: string) => {
    let filtered = entries.filter(e => e.shiftId === shiftId);
    if (startDate) {
      filtered = filtered.filter(e => e.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(e => e.date <= endDate);
    }
    const totalHours = filtered.reduce((s, e) => s + e.hours, 0);
    const days = filtered.length;
    return { totalHours, days, entries: filtered };
  }, [entries]);

  // 取得月份統計
  const getMonthStats = useCallback((yearMonth: string) => {
    const monthEntries = entries.filter(e => e.date.startsWith(yearMonth));
    const stats: Record<string, { hours: number; days: number }> = {};
    
    shifts.forEach(shift => {
      const shiftEntries = monthEntries.filter(e => e.shiftId === shift.id);
      stats[shift.id] = {
        hours: shiftEntries.reduce((s, e) => s + e.hours, 0),
        days: shiftEntries.length,
      };
    });

    return {
      stats,
      totalHours: monthEntries.reduce((s, e) => s + e.hours, 0),
      totalDays: monthEntries.length,
    };
  }, [entries, shifts]);

  return {
    shifts,
    entries,
    addShift,
    updateShift,
    deleteShift,
    addEntry,
    deleteEntry,
    getDateEntries,
    getShiftStats,
    getMonthStats,
  };
}

// 取得班次顏色
export function getShiftColor(shifts: ShiftType[], shiftId: string): string {
  return shifts.find(s => s.id === shiftId)?.color ?? "#808080";
}

// 取得班次名稱
export function getShiftName(shifts: ShiftType[], shiftId: string): string {
  return shifts.find(s => s.id === shiftId)?.name ?? "未知班次";
}
