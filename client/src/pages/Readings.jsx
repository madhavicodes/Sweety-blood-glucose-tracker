import React, { useState, useEffect } from 'react';
import { readingsApi } from '../api/readings.api';
import { getTodayString } from '../utils/dates';
import DatePicker from '../components/DatePicker';
import ReadingList from '../components/ReadingList';
import ReadingForm from '../components/ReadingForm';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';
import { Plus, X, CheckCircle } from 'lucide-react';

export default function Readings() {
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchReadings = async (date) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await readingsApi.getReadingsByDate(date);
      setReadings(data || []);
    } catch (err) {
      setError('Could not load readings for this date. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings(selectedDate);
  }, [selectedDate]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCreateReading = async (formData) => {
    setIsMutating(true);
    try {
      await readingsApi.createReading(formData);
      setIsAddModalOpen(false);
      showToast('Reading saved successfully.');
      if (formData.date === selectedDate) {
        await fetchReadings(selectedDate);
      } else {
        setSelectedDate(formData.date);
      }
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateReading = async (id, formData) => {
    setIsMutating(true);
    try {
      await readingsApi.updateReading(id, formData);
      showToast('Reading updated successfully.');
      await fetchReadings(selectedDate);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteReading = async (id) => {
    setIsMutating(true);
    try {
      await readingsApi.deleteReading(id);
      showToast('Reading deleted successfully.');
      await fetchReadings(selectedDate);
    } finally {
      setIsMutating(false);
    }
  };

  const usedSlots = readings.map((r) => r.slot);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
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

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Glucose Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View, add, edit, or delete readings by date
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record Reading
        </button>
      </div>

      {/* Date Picker Bar */}
      <DatePicker
        value={selectedDate}
        onChange={(d) => setSelectedDate(d)}
        max={today}
      />

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Readings List */}
      {isLoading ? (
        <Spinner size="lg" text="Loading readings..." />
      ) : (
        <ReadingList
          readings={readings}
          onUpdate={handleUpdateReading}
          onDelete={handleDeleteReading}
          onAddNew={() => setIsAddModalOpen(true)}
          isMutating={isMutating}
        />
      )}

      {/* Add Reading Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">New Glucose Reading</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ReadingForm
              initialData={{ date: selectedDate, slot: 'MORNING_FASTING', value: '' }}
              usedSlots={usedSlots}
              onSubmit={handleCreateReading}
              onCancel={() => setIsAddModalOpen(false)}
              isSubmitting={isMutating}
            />
          </div>
        </div>
      )}
    </div>
  );
}
