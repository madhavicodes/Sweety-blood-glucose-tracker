import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/reports.api';
import { getTodayString } from '../utils/dates';
import DatePicker from '../components/DatePicker';
import ReportCard from '../components/ReportCard';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';
import { BarChart3, Calendar, History, TrendingUp } from 'lucide-react';

export default function Reports() {
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'month-to-date' | 'monthly'
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async (tab, date) => {
    setIsLoading(true);
    setError('');
    try {
      let data;
      if (tab === 'daily') {
        data = await reportsApi.getDailyReport(date);
      } else if (tab === 'month-to-date') {
        data = await reportsApi.getMonthToDateReport(date);
      } else if (tab === 'monthly') {
        data = await reportsApi.getMonthlyReport(date);
      }
      setReport(data);
    } catch (err) {
      setError('Could not generate the requested report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab, selectedDate);
  }, [activeTab, selectedDate]);

  const tabs = [
    { id: 'daily', label: 'Daily Report', icon: Calendar },
    { id: 'month-to-date', label: 'Month to Date', icon: TrendingUp },
    { id: 'monthly', label: 'Previous Month', icon: History }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sky-600" />
          Glucose Reports & Trends
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review statistical summaries, high/low ranges, and averages over time
        </p>
      </div>

      {/* Date Picker */}
      <DatePicker
        value={selectedDate}
        onChange={(d) => setSelectedDate(d)}
        max={today}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all ${
                isActive
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Report Display */}
      {isLoading ? (
        <Spinner size="lg" text="Computing statistics..." />
      ) : (
        <ReportCard report={report} />
      )}
    </div>
  );
}
