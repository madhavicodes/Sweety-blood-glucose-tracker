import React, { useState } from 'react';
import ReadingRow from './ReadingRow';
import EmptyState from './EmptyState';
import ReadingForm from './ReadingForm';
import { X, Info } from 'lucide-react';

export default function ReadingList({
  readings = [],
  onUpdate,
  onDelete,
  onAddNew,
  isMutating = false
}) {
  const [editingReading, setEditingReading] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateSubmit = async (formData) => {
    await onUpdate(editingReading.id, formData);
    setEditingReading(null);
  };

  if (!readings || readings.length === 0) {
    return (
      <EmptyState
        title="No readings recorded for this day"
        description="You can record up to 4 readings per day (Morning, After breakfast, After lunch, After dinner)."
        actionText="Add Reading"
        onAction={onAddNew}
      />
    );
  }

  const usedSlots = readings.map((r) => r.slot);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>Recorded ({readings.length}/4 slots)</span>
        <span className="flex items-center gap-1 text-slate-400">
          <Info className="w-3.5 h-3.5" />
          Sorted by time slot
        </span>
      </div>

      <div className="space-y-2.5">
        {readings.map((reading) => (
          <ReadingRow
            key={reading.id}
            reading={reading}
            onEdit={() => setEditingReading(reading)}
            onDelete={handleDelete}
            isDeleting={deletingId === reading.id}
          />
        ))}
      </div>

      {/* Medical Disclaimer */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Note:</strong> Sweety is a personal tracking tool, not medical advice. Target ranges may differ based on your doctor's recommendations.
        </span>
      </div>

      {/* Edit Reading Modal */}
      {editingReading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                Edit Reading – {editingReading.slotLabel}
              </h3>
              <button
                type="button"
                onClick={() => setEditingReading(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ReadingForm
              initialData={editingReading}
              usedSlots={usedSlots}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setEditingReading(null)}
              isSubmitting={isMutating}
            />
          </div>
        </div>
      )}
    </div>
  );
}

