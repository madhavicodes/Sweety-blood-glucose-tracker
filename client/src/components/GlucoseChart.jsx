import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

export default function GlucoseChart({ data = [], title = 'Glucose Trends' }) {
  if (!data || data.length === 0) {
    return null;
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    date: item.date?.substring(5) || item.date, // 'MM-DD'
    fullDate: item.date,
    value: item.value,
    slot: item.slotLabel || item.slot
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-800 space-y-1">
          <div className="font-semibold text-slate-300">{d.fullDate}</div>
          <div className="text-sky-400 font-medium">{d.slot}</div>
          <div className="text-base font-extrabold text-white">
            {d.value} <span className="text-xs font-normal text-slate-400">mg/dl</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
            Glucose Reading
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" />
            Target (70–180)
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={[40, 'auto']}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              unit=" mg"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Reference Line for Normal Fasting Lower Bound (70) */}
            <ReferenceLine
              y={70}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{
                value: '70 Low',
                position: 'insideBottomLeft',
                fill: '#059669',
                fontSize: 10
              }}
            />

            {/* Reference Line for Post-Meal Upper Target Bound (180) */}
            <ReferenceLine
              y={180}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: '180 High',
                position: 'insideTopLeft',
                fill: '#d97706',
                fontSize: 10
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#0284c7', strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#0369a1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

