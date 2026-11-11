import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTodayString, formatDisplayDate } from '../utils/dates';

export default function DatePicker({ value, onChange, max }) {
  const today = max || getTodayString();
  const selectedDate = value || today;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${day}`);
  };

  const handleNextDay = () => {
    if (selectedDate >= today) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const nextDate = `${y}-${m}-${day}`;
    if (nextDate <= today) {
      onChange(nextDate);
    }
  };

  const isToday = selectedDate === today;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevDay}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Previous day"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-sm">
          <Calendar className="w-4 h-4 text-sky-600" />
          <span>{formatDisplayDate(selectedDate)}</span>
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          disabled={isToday}
          className={`p-1.5 rounded-lg transition-colors ${
            isToday
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Next day"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {!isToday && (
          <button
            type="button"
            onClick={() => onChange(today)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
          >
            Today
          </button>
        )}
        <label htmlFor="calendar-date-input" className="sr-only">Choose date</label>
        <input
          id="calendar-date-input"
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="text-sm px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
        />
      </div>
    </div>
  );
}

