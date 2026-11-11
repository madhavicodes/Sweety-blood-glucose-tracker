import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm shadow-sm transition-all animate-fadeIn"
    >
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1 font-medium">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-red-500 hover:text-red-700 text-xs font-semibold px-1 rounded focus:outline-none"
          aria-label="Close error message"
        >
          ✕
        </button>
      )}
    </div>
  );
}
