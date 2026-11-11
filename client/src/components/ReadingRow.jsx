import React from 'react';
import { Pencil, Trash2, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Returns color hints:
 * - Green (in range): 70 - 180 mg/dl
 * - Amber (low / high): 54-69 or 181-250 mg/dl
 * - Red (critical): < 54 or > 250 mg/dl
 */
function getGlucoseBadge(val) {
  if (val >= 70 && val <= 180) {
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      tagBg: 'bg-emerald-100 text-emerald-700',
      label: 'In Range',
      icon: CheckCircle2
    };
  }
  if ((val >= 54 && val < 70) || (val > 180 && val <= 250)) {
    return {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      tagBg: 'bg-amber-100 text-amber-700',
      label: val < 70 ? 'Low' : 'High',
      icon: AlertTriangle
    };
  }
  return {
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    tagBg: 'bg-rose-100 text-rose-700',
    label: val < 54 ? 'Very Low' : 'Very High',
    icon: ShieldAlert
  };
}

export default function ReadingRow({ reading, onEdit, onDelete, isDeleting }) {
  const badge = getGlucoseBadge(reading.value);
  const BadgeIcon = badge.icon;

  const handleDelete = () => {
    if (window.confirm(`Delete ${reading.slotLabel} reading (${reading.value} mg/dl)?`)) {
      onDelete(reading.id);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border font-bold text-base ${badge.bg}`}>
          {reading.value}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-800 text-sm">{reading.slotLabel}</h4>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.tagBg}`}>
              <BadgeIcon className="w-3 h-3" />
              {badge.label}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">mg/dl</span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(reading)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 transition-colors"
            title="Edit reading"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors disabled:opacity-50"
            title="Delete reading"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

