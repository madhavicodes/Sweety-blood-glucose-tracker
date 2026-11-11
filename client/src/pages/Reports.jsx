import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/reports.api';
import { readingsApi } from '../api/readings.api';
import { getTodayString } from '../utils/dates';
import { exportReadingsToCSV } from '../utils/csv';
import DatePicker from '../components/DatePicker';
import ReportCard from '../components/ReportCard';
import GlucoseChart from '../components/GlucoseChart';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';
import { BarChart3, Calendar, History, TrendingUp, Download } from 'lucide-react';

export default function Reports() {
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'month-to-date' | 'monthly'
  const [report, setReport] = useState(null);
  const [rangeReadings, setRangeReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async (tab, date) => {
    setIsLoading(true);
    setError('');
    try {
      let data;
      if (tab === 'daily') {
        data = await reportsApi.getDailyReport(date);
        setRangeReadings(data?.readings || []);
      } else if (tab === 'month-to-date') {
        data = await reportsApi.getMonthToDateReport(date);
        // Fetch readings within the range for charting
        if (data?.range?.from && data?.range?.to) {
          const rangeRes = await readingsApi.getReadingsRange({
            from: data.range.from,
            to: data.range.to,
            limit: 100
          });
          // Sort ascending by date for line chart
          const sorted = (rangeRes.data || []).slice().reverse();
          setRangeReadings(sorted);
        }
      } else if (tab === 'monthly') {
        data = await reportsApi.getMonthlyReport(date);
        if (data?.range?.from && data?.range?.to) {
          const rangeRes = await readingsApi.getReadingsRange({
            from: data.range.from,
            to: data.range.to,
            limit: 100
          });
          const sorted = (rangeRes.data || []).slice().reverse();
          setRangeReadings(sorted);
        }
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

  const handleExportCSV = () => {
    const filename = `sweety_${activeTab}_report_${selectedDate}.csv`;
    exportReadingsToCSV(rangeReadings, filename);
  };

  const tabs = [
    { id: 'daily', label: 'Daily Report', icon: Calendar },
    { id: 'month-to-date', label: 'Month to Date', icon: TrendingUp },
    { id: 'monthly', label: 'Previous Month', icon: History }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Title & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-600" />
            Glucose Reports & Trends
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review statistical summaries, high/low ranges, and averages over time
          </p>
        </div>

        {rangeReadings.length > 0 && (
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors self-start sm:self-center"
            title="Download report data as CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
        )}
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
              className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
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
        <div className="space-y-6">
          <ReportCard report={report} />

          {/* Recharts Visual Trends */}
          {rangeReadings.length > 0 && (
            <GlucoseChart
              data={rangeReadings}
              title={`${report?.range?.label || 'Period'} Glucose Trend Line`}
            />
          )}
        </div>
      )}
    </div>
  );
}
