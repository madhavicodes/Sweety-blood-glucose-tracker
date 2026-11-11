import React, { useState, useEffect } from 'react';
import { readingsApi } from '../api/readings.api';
import { reportsApi } from '../api/reports.api';
import { SLOTS, SLOT_ORDER } from '../constants/slots';
import { getTodayString, formatDisplayDate } from '../utils/dates';
import { Plus, Check, Clock, X, BarChart2, Pencil, Trash2, CheckCircle } from 'lucide-react';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';
import ReadingForm from '../components/ReadingForm';

export default function Dashboard() {
  const today = getTodayString();
  const [readings, setReadings] = useState([]);
  const [dailyReport, setDailyReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [activeSlotModal, setActiveSlotModal] = useState(null); // slot string for adding
  const [editingReading, setEditingReading] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [readingsData, reportData] = await Promise.all([
        readingsApi.getReadingsByDate(today),
        reportsApi.getDailyReport(today)
      ]);
      setReadings(readingsData || []);
      setDailyReport(reportData);
    } catch (err) {
      setError('Could not load today\'s glucose dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Find the first unrecorded slot for today
  const getFirstAvailableSlot = () => {
    const recordedSlots = readings.map((r) => r.slot);
    return SLOT_ORDER.find((s) => !recordedSlots.includes(s)) || 'MORNING_FASTING';
  };

  const handleOpenAddModal = (preferredSlot) => {
    const slotToUse = preferredSlot || getFirstAvailableSlot();
    setActiveSlotModal(slotToUse);
  };

  const handleCreateSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await readingsApi.createReading(formData);
      setActiveSlotModal(null);
      showToast('Reading saved successfully.');
      await fetchDashboardData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await readingsApi.updateReading(editingReading.id, formData);
      setEditingReading(null);
      showToast('Reading updated successfully.');
      await fetchDashboardData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, slotLabel) => {
    if (!window.confirm(`Are you sure you want to delete today's ${slotLabel} reading?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await readingsApi.deleteReading(id);
      showToast('Reading deleted successfully.');
      await fetchDashboardData();
    } catch (err) {
      setError('Failed to delete reading. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getReadingForSlot = (slotKey) => readings.find((r) => r.slot === slotKey);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-xl animate-slideUp"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-600 to-cyan-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-sky-600/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-100 bg-sky-500/30 px-3 py-1 rounded-full">
            Today's Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            {formatDisplayDate(today)}
          </h1>
          <p className="text-sm text-sky-100 mt-1 max-w-xl">
            Diabetes management requires consistent logging. Keep track of up to 4 routine readings each day.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white text-sky-700 hover:bg-sky-50 shadow-md transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Log Reading
        </button>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {isLoading ? (
        <Spinner size="lg" text="Loading today's readings..." />
      ) : (
        <>
          {/* 4 Daily Slots Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Today's 4 Time Slots</h2>
              <span className="text-xs font-semibold text-slate-500">
                {readings.length} of 4 recorded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SLOT_ORDER.map((slotKey) => {
                const reading = getReadingForSlot(slotKey);
                const isRecorded = !!reading;

                return (
                  <div
                    key={slotKey}
                    className={`p-5 rounded-2xl border transition-all ${
                      isRecorded
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-50/70 border-dashed border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {SLOTS[slotKey]}
                      </span>
                      {isRecorded ? (
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-slate-200/60 text-slate-400 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {isRecorded ? (
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {reading.value}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">mg/dl</span>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Recorded
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingReading(reading)}
                              className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-50"
                              title="Edit reading"
                              aria-label={`Edit ${SLOTS[slotKey]}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(reading.id, reading.slotLabel)}
                              disabled={deletingId === reading.id}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                              title="Delete reading"
                              aria-label={`Delete ${SLOTS[slotKey]}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-slate-400 mb-4">No reading logged for this slot</p>
                        <button
                          type="button"
                          onClick={() => handleOpenAddModal(slotKey)}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Log {SLOTS[slotKey]}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Summary */}
          {dailyReport && dailyReport.stats && dailyReport.stats.count > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-800 text-base">Today's Statistical Snapshot</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-500 font-medium">Readings Count</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">{dailyReport.stats.count} / 4</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-500 font-medium">Average</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">
                    {dailyReport.stats.average !== null ? Number(dailyReport.stats.average).toFixed(1) : '—'} mg/dl
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-500 font-medium">Lowest</div>
                  <div className="text-xl font-bold text-emerald-700 mt-1">
                    {dailyReport.stats.lowest ?? '—'} mg/dl
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-500 font-medium">Highest</div>
                  <div className="text-xl font-bold text-rose-700 mt-1">
                    {dailyReport.stats.highest ?? '—'} mg/dl
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Add Modal */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Add New Reading</h3>
              <button
                type="button"
                onClick={() => setActiveSlotModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ReadingForm
              initialData={{ date: today, slot: activeSlotModal, value: '' }}
              usedSlots={readings.map((r) => r.slot)}
              onSubmit={handleCreateSubmit}
              onCancel={() => setActiveSlotModal(null)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

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
              usedSlots={readings.map((r) => r.slot)}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setEditingReading(null)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
