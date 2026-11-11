/**
 * Exports readings array to a CSV file and triggers browser download
 */
export function exportReadingsToCSV(readings, filename = 'glucose_readings.csv') {
  if (!readings || readings.length === 0) return;

  const headers = ['ID', 'Date', 'Time Slot', 'Glucose Value (mg/dl)', 'Logged At'];
  const rows = readings.map((r) => [
    r.id,
    r.date,
    `"${r.slotLabel || r.slot}"`,
    r.value,
    `"${r.createdAt}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
