import React, { useState, useEffect } from 'react';
import { SLOTS, SLOT_ORDER } from '../constants/slots';
import { getTodayString } from '../utils/dates';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import ErrorAlert from './ErrorAlert';

export default function ReadingForm({
  initialData = null,
  usedSlots = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const today = getTodayString();

  const [date, setDate] = useState(initialData?.date || today);
  const [slot, setSlot] = useState(initialData?.slot || 'MORNING_FASTING');
  const [value, setValue] = useState(initialData?.value !== undefined ? String(initialData.value) : '');

  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setSlot(initialData.slot);
      setValue(String(initialData.value));
    }
  }, [initialData]);

  // Client-side quick validation for responsive feedback matching exact server messages
  const validate = () => {
    const errors = {};
    if (!date) {
      errors.date = 'Date is required.';
    } else if (date > today) {
      errors.date = 'Date cannot be in the future.';
    }

    if (!slot) {
      errors.slot = 'Choose a valid time slot.';
    }

    const valStr = String(value).trim();
    if (!value || valStr === '') {
      errors.value = 'Please enter a glucose value.';
    } else {
      const num = Number(valStr);
      if (isNaN(num) || !/^-?\d+(\.\d+)?$/.test(valStr)) {
        errors.value = 'Please enter a glucose value.';
      } else if (!Number.isInteger(num)) {
        errors.value = 'Value must be a whole number.';
      } else if (num < 40 || num > 600) {
        errors.value = 'Value must be between 40 and 600 mg/dl.';
      }
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setClientErrors({});

    if (!validate()) return;

    try {
      await onSubmit({
        date,
        slot,
        value: Number(value)
      });
    } catch (err) {
      const msg = getErrorMessage(err);
      setServerError(msg);
      const fieldErrs = getFieldErrors(err);
      if (Object.keys(fieldErrs).length > 0) {
        setClientErrors(fieldErrs);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <ErrorAlert message={serverError} onClose={() => setServerError('')} />

      {/* Date Input */}
      <div>
        <label htmlFor="reading-date" className="block text-sm font-semibold text-slate-700 mb-1">
          Date
        </label>
        <input
          id="reading-date"
          type="date"
          max={today}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (clientErrors.date) setClientErrors({ ...clientErrors, date: null });
          }}
          className={`w-full px-3.5 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
            clientErrors.date
              ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
              : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'
          }`}
        />
        {clientErrors.date && (
          <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
            {clientErrors.date}
          </p>
        )}
      </div>

      {/* Slot Selector */}
      <div>
        <label htmlFor="reading-slot" className="block text-sm font-semibold text-slate-700 mb-1">
          Time Slot
        </label>
        <select
          id="reading-slot"
          value={slot}
          onChange={(e) => {
            setSlot(e.target.value);
            if (clientErrors.slot) setClientErrors({ ...clientErrors, slot: null });
          }}
          className={`w-full px-3.5 py-2 rounded-lg border text-sm bg-white transition-all focus:outline-none focus:ring-2 ${
            clientErrors.slot
              ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
              : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'
          }`}
        >
          {SLOT_ORDER.map((slotKey) => {
            const isUsed = usedSlots.includes(slotKey) && (!initialData || initialData.slot !== slotKey);
            return (
              <option key={slotKey} value={slotKey}>
                {SLOTS[slotKey]} {isUsed ? ' (Already recorded)' : ''}
              </option>
            );
          })}
        </select>
        {clientErrors.slot && (
          <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
            {clientErrors.slot}
          </p>
        )}
      </div>

      {/* Glucose Value Input */}
      <div>
        <label htmlFor="reading-value" className="block text-sm font-semibold text-slate-700 mb-1">
          Blood Glucose Value <span className="font-normal text-slate-500">(mg/dl)</span>
        </label>
        <div className="relative">
          <input
            id="reading-value"
            type="number"
            min="40"
            max="600"
            step="1"
            placeholder="e.g. 110"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (clientErrors.value) setClientErrors({ ...clientErrors, value: null });
            }}
            className={`w-full px-3.5 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
              clientErrors.value
                ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'
            }`}
          />
          <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
            mg/dl
          </span>
        </div>
        {clientErrors.value && (
          <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
            {clientErrors.value}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-400">Normal fasting range is typically 70–99 mg/dl.</p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Reading' : 'Save Reading'}
        </button>
      </div>
    </form>
  );
}
