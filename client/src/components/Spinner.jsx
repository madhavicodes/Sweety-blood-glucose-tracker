import React from 'react';

export default function Spinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3" role="status">
      <div
        className={`animate-spin rounded-full border-sky-600 border-t-transparent ${
          sizeClasses[size] || sizeClasses.md
        }`}
      />
      {text && <span className="text-sm font-medium text-slate-500">{text}</span>}
      <span className="sr-only">{text}</span>
    </div>
  );
}
