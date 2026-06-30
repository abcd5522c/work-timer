/**
 * StatsPage — 工時統計與歷史記錄
 * 設計：工業極簡，數據儀表板，Recharts 圖表
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
} from "recharts";
import { Trash2, TrendingUp, Clock, Calendar, Award } from "lucide-react";
import { toast } from "sonner";
import { formatHuman, formatDateDisplay, getWeekDay, useWorkTimer } from "@/hooks/useWorkTimer";

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }
  return days;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        <p className="font-timer text-amber-400 font-medium">
          {formatHuman(payload[0].value * 3600)}
        </p>
      </div>
    );
  }
  return null;
}

export default function StatsPage() {
  const { records, deleteSession, deleteDay } = useWorkTimer();
  const today = getTodayStr();
  const last7 = getLast7Days();

  // Chart data — last 7 days
  const chartData = useMemo(() => {
    return last7.map((date) => {
      const record = records.find((r) => r.date === date);
      const hours = record ? Math.round((record.totalSeconds / 3600) * 10) / 10 : 0;
      return {
        date,
        label: `${formatDateDisplay(date)}\n${getWeekDay(date)}`,
        shortLabel: getWeekDay(date),
        hours,
        isToday: date === today,
      };
    });
  }, [records, last7, today]);

  // Summary stats
  const stats = useMemo(() => {
    const totalSeconds = records.reduce((s, r) => s + r.totalSeconds, 0);
    const days = records.length;
    const avgSeconds = days > 0 ? Math.floor(totalSeconds / days) : 0;
    const maxDay = records.reduce(
      (max, r) => (r.totalSeconds > max.totalSeconds ? r : max),
      { totalSeconds: 0, date: "" }
    );
    const thisWeekSeconds = last7.reduce((s, date) => {
      const r = records.find((d) => d.date === date);
      return s + (r?.totalSeconds ?? 0);
    }, 0);
    return { totalSeconds, days, avgSeconds, maxDay, thisWeekSeconds };
  }, [records, last7]);

  // Sorted records (newest first)
  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-5 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 fade-up fade-up-1">
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="本週工時"
            value={formatHuman(stats.thisWeekSeconds)}
            sub="近 7 天"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="日均工時"
            value={formatHuman(stats.avgSeconds)}
            sub={`共 ${stats.days} 天`}
          />
          <StatCard
            icon={<Calendar className="w-4 h-4" />}
            label="累計工時"
            value={formatHuman(stats.totalSeconds)}
            sub="所有記錄"
          />
          <StatCard
            icon={<Award className="w-4 h-4" />}
            label="最長單日"
            value={stats.maxDay.date ? formatHuman(stats.maxDay.totalSeconds) : "—"}
            sub={stats.maxDay.date ? formatDateDisplay(stats.maxDay.date) : "尚無記錄"}
          />
        </div>

        {/* Bar Chart */}
        <div className="fade-up fade-up-2">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">
            近 7 天工時
          </h3>
          <div className="bg-zinc-900/60 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={24} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: "#52525b", fontSize: 11, fontFamily: "IBM Plex Sans" }}
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
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.isToday ? "#FF8C00" : entry.hours > 0 ? "#FF8C0055" : "#27272a"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History Records */}
        <div className="fade-up fade-up-3">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">
            歷史記錄
          </h3>

          {sortedRecords.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-zinc-700">
              <Calendar className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">尚無歷史記錄</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRecords.map((day) => (
                <div key={day.date} className="bg-zinc-900/60 rounded-xl overflow-hidden">
                  {/* Day header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-sm font-semibold text-zinc-200">
                          {formatDateDisplay(day.date)}
                        </span>
                        <span className="text-xs text-zinc-600 ml-2">{getWeekDay(day.date)}</span>
                        {day.date === today && (
                          <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">
                            今天
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-timer text-amber-400 text-sm">
                        {formatHuman(day.totalSeconds)}
                      </span>
                      <button
                        onClick={() => {
                          deleteDay(day.date);
                          toast("已刪除當日所有記錄");
                        }}
                        className="text-zinc-700 hover:text-red-400 transition-colors p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="divide-y divide-zinc-800/60">
                    {day.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="group flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
                          <span className="text-sm text-zinc-300 truncate">{session.label}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <span className="font-timer text-xs text-zinc-500">
                            {formatHuman(session.duration)}
                          </span>
                          <button
                            onClick={() => {
                              deleteSession(day.date, session.id);
                              toast("已刪除記錄");
                            }}
                            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-1 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="bg-zinc-900/60 rounded-xl p-4">
      <div className="flex items-center gap-2 text-zinc-500 mb-2">
        {icon}
        <span className="text-xs tracking-wide">{label}</span>
      </div>
      <p className="font-timer text-xl text-zinc-100 font-medium">{value}</p>
      <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>
    </div>
  );
}
