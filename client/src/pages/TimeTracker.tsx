/**
 * TimeTracker — 工時追蹤頁面（含上班時間和月份日曆）
 */

import { useState, useEffect } from 'react';
import { Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useWorkTime } from '@/hooks/useWorkTime';
import { MonthCalendar } from '@/components/MonthCalendar';

// 日期工具
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr() {
  return toDateStr(new Date());
}

function displayDate(s: string) {
  const [y, m, d] = s.split('-');
  return `${y} 年 ${parseInt(m)} 月 ${parseInt(d)} 日`;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
function weekday(s: string) {
  return '週' + WEEKDAYS[new Date(s + 'T00:00:00').getDay()];
}

function addDays(s: string, n: number) {
  const d = new Date(s + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

export default function TimeTracker() {
  const { records, addOrUpdateRecord, deleteRecord, getRecord, getMonthRecords, getMonthStats } = useWorkTime();
  const [viewDate, setViewDate] = useState(todayStr());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [note, setNote] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const isToday = viewDate === todayStr();
  const currentRecord = getRecord(viewDate);
  const monthPrefix = viewDate.slice(0, 7);
  const monthStats = getMonthStats(monthPrefix);

  // 載入當前日期的記錄
  useEffect(() => {
    if (currentRecord) {
      setStartTime(currentRecord.startTime);
      setEndTime(currentRecord.endTime);
      setNote(currentRecord.note || '');
    } else {
      setStartTime('09:00');
      setEndTime('18:00');
      setNote('');
    }
  }, [viewDate, currentRecord]);

  // 計算工時
  const calculateHours = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let start = startH * 60 + startM;
    let end = endH * 60 + endM;

    if (end < start) {
      end += 24 * 60;
    }

    return (end - start) / 60;
  };

  const hours = calculateHours();

  // 儲存記錄
  const handleSave = () => {
    if (!startTime || !endTime) {
      toast.error('請輸入上班和下班時間');
      return;
    }

    addOrUpdateRecord(viewDate, startTime, endTime, note || undefined);
    toast.success(`已記錄 ${hours.toFixed(1)} 小時`);
  };

  // 刪除記錄
  const handleDelete = () => {
    deleteRecord(viewDate);
    toast('已刪除記錄');
  };

  // 建立記錄對應表
  const recordsMap: Record<string, number> = {};
  records.forEach(r => {
    recordsMap[r.date] = r.hours;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-4 px-4 pb-safe">
      {/* Header */}
      <div className="w-full max-w-md mb-6 text-center pt-safe">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/manus-storage/logo_99dea628.png" alt="logo" className="w-6 h-6" />
          <h1 className="font-timer text-lg font-semibold tracking-widest text-zinc-100">WorkShift</h1>
        </div>
        <p className="text-xs text-zinc-600 tracking-wide">工時追蹤</p>
      </div>

      {/* 日期選擇 */}
      <div className="w-full max-w-md mb-6 bg-zinc-900 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewDate(addDays(viewDate, -1))}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-zinc-100">{displayDate(viewDate)}</p>
            <p className="text-xs text-zinc-500">{weekday(viewDate)}</p>
          </div>
          <button
            onClick={() => setViewDate(addDays(viewDate, 1))}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        {isToday && (
          <button
            onClick={() => setViewDate(todayStr())}
            className="w-full text-xs py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
          >
            返回今日
          </button>
        )}
      </div>

      {/* 上班時間設定 */}
      <div className="w-full max-w-md mb-6 bg-zinc-900 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-zinc-100">上班時間</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 block mb-2">上班時間</label>
            <Input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-2">下班時間</label>
            <Input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>
        </div>

        {/* 工時顯示 */}
        <div className="bg-zinc-800 rounded-lg p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">工時</p>
          <p className="font-timer text-3xl text-amber-400">{hours.toFixed(1)}<span className="text-sm text-zinc-500 ml-1">h</span></p>
        </div>

        {/* 備註 */}
        <div>
          <label className="text-xs text-zinc-500 block mb-2">備註（選填）</label>
          <Input
            type="text"
            placeholder="例：加班、特殊班次"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>

        {/* 按鈕 */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
          >
            儲存記錄
          </Button>
          {currentRecord && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1"
            >
              刪除
            </Button>
          )}
        </div>
      </div>

      {/* 月份統計 */}
      <div className="w-full max-w-md mb-6 grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 rounded-2xl p-4 text-center">
          <p className="text-xs text-zinc-500 mb-2">累計工時</p>
          <p className="font-timer text-2xl text-amber-400">{monthStats.totalHours}h</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 text-center">
          <p className="text-xs text-zinc-500 mb-2">工作天數</p>
          <p className="font-timer text-2xl text-cyan-400">{monthStats.workDays}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 text-center">
          <p className="text-xs text-zinc-500 mb-2">日均工時</p>
          <p className="font-timer text-2xl text-emerald-400">{monthStats.avgHours}h</p>
        </div>
      </div>

      {/* 日曆切換按鈕 */}
      <div className="w-full max-w-md mb-4">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-colors text-zinc-300"
        >
          <Calendar className="w-5 h-5" />
          {showCalendar ? '隱藏日曆' : '顯示月份日曆'}
        </button>
      </div>

      {/* 月份日曆 */}
      {showCalendar && (
        <div className="w-full max-w-md pb-safe">
          <MonthCalendar
            yearMonth={monthPrefix}
            onDateClick={date => {
              setViewDate(date);
              setShowCalendar(false);
            }}
            recordsMap={recordsMap}
          />
        </div>
      )}
    </div>
  );
}
