import { useState, useEffect } from 'react';

export interface WorkTime {
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  hours: number;
  note?: string;
}

const STORAGE_KEY = 'worktime_records';

export function useWorkTime() {
  const [records, setRecords] = useState<WorkTime[]>([]);

  // 初始化從 localStorage 讀取
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecords(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse work time records:', e);
      }
    }
  }, []);

  // 當 records 變更時保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  // 添加或更新記錄
  const addOrUpdateRecord = (date: string, startTime: string, endTime: string, note?: string) => {
    const hours = calculateHours(startTime, endTime);
    const existing = records.findIndex(r => r.date === date);
    
    if (existing >= 0) {
      const updated = [...records];
      updated[existing] = { date, startTime, endTime, hours, note };
      setRecords(updated);
    } else {
      setRecords([...records, { date, startTime, endTime, hours, note }]);
    }
  };

  // 刪除記錄
  const deleteRecord = (date: string) => {
    setRecords(records.filter(r => r.date !== date));
  };

  // 取得指定日期的記錄
  const getRecord = (date: string) => {
    return records.find(r => r.date === date);
  };

  // 取得指定月份的所有記錄
  const getMonthRecords = (yearMonth: string) => {
    return records.filter(r => r.date.startsWith(yearMonth));
  };

  // 計算工時
  function calculateHours(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let start = startH * 60 + startM;
    let end = endH * 60 + endM;
    
    // 如果結束時間小於開始時間，假設跨越午夜
    if (end < start) {
      end += 24 * 60;
    }
    
    return (end - start) / 60;
  }

  // 月份統計
  const getMonthStats = (yearMonth: string) => {
    const monthRecords = getMonthRecords(yearMonth);
    const totalHours = monthRecords.reduce((sum, r) => sum + r.hours, 0);
    const workDays = monthRecords.length;
    const avgHours = workDays > 0 ? totalHours / workDays : 0;

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      workDays,
      avgHours: Math.round(avgHours * 10) / 10,
    };
  };

  return {
    records,
    addOrUpdateRecord,
    deleteRecord,
    getRecord,
    getMonthRecords,
    getMonthStats,
  };
}
