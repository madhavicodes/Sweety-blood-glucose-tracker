import React from 'react';
import { Activity, Plus } from 'lucide-react';

export default function EmptyState({
  title = 'No readings for this period yet',
  description = 'Add your first reading to see your report and glucose patterns.',
  actionText = 'Add Reading',
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-slate-50 border-2 border-dashed border-slate-200">
      <div className="w-14 h-14 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-4 shadow-inner">
        <Activity className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}

