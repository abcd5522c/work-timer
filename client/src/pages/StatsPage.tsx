/**
 * StatsPage — 排班統計分析
 */

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import { useShiftSchedule, getShiftColor, getShiftName } from "@/hooks/useShiftSchedule";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getLast12Months(): string[] {
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  }
  return months;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
        <p className="font-timer text-amber-400 font-medium">
          {payload[0].value.toFixed(1)}h
        </p>
      </div>
    );
  }
  return null;
}

export default function StatsPage() {
  const { shifts, entries } = useShiftSchedule();
  const last12 = getLast12Months();

  // 近 12 個月統計
  const monthlyData = useMemo(() => {
    return last12.map(month => {
      const monthEntries = entries.filter(e => e.date.startsWith(month));
      const total = monthEntries.reduce((s, e) => s + e.hours, 0);
      return {
        month: month.slice(5),
        hours: Math.round(total * 10) / 10,
      };
    });
  }, [entries, last12]);

  // 班次分佈（所有時間）
  const shiftDistribution = useMemo(() => {
    return shifts.map(shift => {
      const shiftEntries = entries.filter(e => e.shiftId === shift.id);
      const hours = shiftEntries.reduce((s, e) => s + e.hours, 0);
      return {
        name: shift.name,
        value: Math.round(hours * 10) / 10,
        color: shift.color,
      };
    }).filter(d => d.value > 0);
  }, [shifts, entries]);

  // 班次統計
  const shiftStats = useMemo(() => {
    return shifts.map(shift => {
      const shiftEntries = entries.filter(e => e.shiftId === shift.id);
      const hours = shiftEntries.reduce((s, e) => s + e.hours, 0);
      const days = shiftEntries.length;
      return {
        shift,
        hours,
        days,
        avg: days > 0 ? Math.round((hours / days) * 10) / 10 : 0,
      };
    });
  }, [shifts, entries]);

  // 總統計
  const totalHours = entries.reduce((s, e) => s + e.hours, 0);
  const totalDays = entries.length;
  const avgHours = totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-4 px-4 pb-safe">
      {/* Header */}
      <div className="w-full max-w-md mb-6 text-center pt-safe">
        <h1 className="text-lg font-semibold text-zinc-100 tracking-wide">排班統計</h1>
        <p className="text-xs text-zinc-600 mt-0.5">工時分析與班次統計</p>
      </div>

      {/* Summary Cards */}
      <div className="w-full max-w-md mb-6 space-y-3">
        <div className="bg-zinc-900/60 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 tracking-wide mb-2">累計工時</p>
          <p className="font-timer text-3xl text-amber-400">{totalHours.toFixed(1)}<span className="text-sm text-zinc-500 ml-1">h</span></p>
          <p className="text-xs text-zinc-600 mt-1">{totalDays} 天記錄</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/60 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 tracking-wide mb-2">日均工時</p>
            <p className="font-timer text-2xl text-cyan-400">{avgHours.toFixed(1)}<span className="text-xs text-zinc-500 ml-0.5">h</span></p>
          </div>
          <div className="bg-zinc-900/60 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 tracking-wide mb-2">工作天數</p>
            <p className="font-timer text-2xl text-emerald-400">{totalDays}<span className="text-xs text-zinc-500 ml-0.5">天</span></p>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="w-full max-w-md mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-400">近 12 個月工時</h3>
        </div>
        <div className="bg-zinc-900/60 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fill: "#52525b", fontSize: 10, fontFamily: "IBM Plex Sans" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#52525b", fontSize: 10, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="#FF8C00" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shift Distribution Pie */}
      {shiftDistribution.length > 0 && (
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-400">班次分佈</h3>
          </div>
          <div className="bg-zinc-900/60 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={shiftDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {shiftDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value}h`}
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {shiftDistribution.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-zinc-400">{item.name}</span>
                  </div>
                  <span className="font-timer text-zinc-300">{item.value}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shift Details */}
      <div className="w-full max-w-md pb-safe">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4">班次詳情</h3>
        <div className="space-y-3">
          {shiftStats.map(stat => (
            <div key={stat.shift.id} className="bg-zinc-900/60 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stat.shift.color }}
                  />
                  <span className="font-semibold text-zinc-200">{stat.shift.name}</span>
                </div>
                <span className="font-timer text-amber-400">{stat.hours.toFixed(1)}h</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-zinc-600">工作天數</p>
                  <p className="font-timer text-zinc-300 mt-0.5">{stat.days} 天</p>
                </div>
                <div>
                  <p className="text-zinc-600">日均工時</p>
                  <p className="font-timer text-zinc-300 mt-0.5">{stat.avg}h</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
