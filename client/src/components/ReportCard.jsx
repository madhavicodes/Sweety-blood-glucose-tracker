import React from 'react';
import { TrendingUp, TrendingDown, Calculator, Hash, Calendar } from 'lucide-react';
import EmptyState from './EmptyState';
import ReadingRow from './ReadingRow';

export default function ReportCard({ report, onAddNew }) {
  if (!report) return null;

  const { range, stats, readings = [], type } = report;
  const hasData = stats && stats.count > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Range Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md">
            {type === 'daily' ? 'Daily Report' : type === 'month-to-date' ? 'Month to Date' : 'Previous Month'}
          </span>
          <h2 className="text-lg font-bold text-slate-800 mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            {range?.label || `${range?.from} – ${range?.to}`}
          </h2>
        </div>
        <div className="text-xs font-medium text-slate-400">
          Range: {range?.from} to {range?.to}
        </div>
      </div>

      {/* 4 Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highest */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Highest</div>
            <div className="text-xl font-bold text-slate-800">
              {stats?.highest !== null ? `${stats.highest}` : '—'}
              {stats?.highest !== null && <span className="text-xs font-normal text-slate-400 ml-1">mg/dl</span>}
            </div>
          </div>
        </div>

        {/* Lowest */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Lowest</div>
            <div className="text-xl font-bold text-slate-800">
              {stats?.lowest !== null ? `${stats.lowest}` : '—'}
              {stats?.lowest !== null && <span className="text-xs font-normal text-slate-400 ml-1">mg/dl</span>}
            </div>
          </div>
        </div>

        {/* Average */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Average</div>
            <div className="text-xl font-bold text-slate-800">
              {stats?.average !== null ? Number(stats.average).toFixed(1) : '—'}
              {stats?.average !== null && <span className="text-xs font-normal text-slate-400 ml-1">mg/dl</span>}
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Readings</div>
            <div className="text-xl font-bold text-slate-800">
              {stats?.count ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* For Daily Report: Show List of Readings */}
      {type === 'daily' && (
        <div className="pt-2">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Day's Readings</h3>
          {hasData ? (
            <div className="space-y-2">
              {readings.map((r) => (
                <ReadingRow key={r.id} reading={r} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No readings found for this day"
              description="Add readings to see breakdown by time slots."
              onAction={onAddNew}
            />
          )}
        </div>
      )}

      {/* If Month to Date or Monthly and no readings */}
      {!hasData && type !== 'daily' && (
        <EmptyState
          title="No readings recorded for this period"
          description="Readings added during this calendar window will appear here."
          onAction={onAddNew}
        />
      )}
    </div>
  );
}

