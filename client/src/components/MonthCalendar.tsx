import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  hours?: number;
}

interface MonthCalendarProps {
  yearMonth: string;
  onDateClick: (date: string) => void;
  recordsMap: Record<string, number>; // date -> hours
}

export function MonthCalendar({ yearMonth, onDateClick, recordsMap }: MonthCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(yearMonth);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = parseInt(displayMonth.split('-')[0]);
  const month = parseInt(displayMonth.split('-')[1]) - 1;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  const days: CalendarDay[] = [];

  // 上個月的日期
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const date = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({ date, day, isCurrentMonth: false });
  }

  // 本月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hours = recordsMap[date];
    days.push({ date, day, isCurrentMonth: true, hours });
  }

  // 下個月的日期
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const date = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({ date, day, isCurrentMonth: false });
  }

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 1, 1);
    setDisplayMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month + 1, 1);
    setDisplayMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthName = new Date(year, month).toLocaleDateString('zh-TW', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full bg-zinc-900 rounded-2xl p-4">
      {/* 月份導覽 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <h3 className="text-sm font-semibold text-zinc-300">{monthName}</h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-zinc-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 日期網格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, day, isCurrentMonth, hours }) => (
          <button
            key={date}
            onClick={() => onDateClick(date)}
            className={`
              aspect-square rounded-lg text-sm font-medium transition-all
              ${isCurrentMonth
                ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:scale-95'
                : 'bg-zinc-950 text-zinc-600'
              }
              ${hours ? 'ring-2 ring-amber-500' : ''}
            `}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-xs">{day}</span>
              {hours && <span className="text-xs text-amber-400 font-semibold">{hours.toFixed(1)}h</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
