// exportUtils.ts

import { supabase } from '@/integrations/supabase/client';
import { AuditLogger } from './auditLogger'; // Import the AuditLogger

// ExportData interface
export interface ExportData {
  headers: string[];
  data: (string | number | null | boolean)[][];
  filename: string;
}

// Loading state management
let isExporting = false;
export const getIsExporting = () => isExporting;
const setIsExporting = (state: boolean) => {
  isExporting = state;
};

// CSV escape helper
const escapeCsvCell = (cell: string | number | null | boolean) => {
  if (cell == null) return '';
  const cellStr = String(cell);
  if (cellStr.includes('"')) {
    return `"${cellStr.replace(/"/g, '""')}"`;
  }
  if (cellStr.includes(',') || cellStr.includes('\n')) {
    return `"${cellStr}"`;
  }
  return cellStr;
};

const CHUNK_SIZE = 1000;

// Helper to download CSV in chunks
const downloadCSVChunked = (exportData: ExportData) => {
  const { headers, data, filename } = exportData;
  const headerRow = headers.map(escapeCsvCell).join(',') + '\n';

  let chunkIndex = 0;

  const downloadChunk = (rows: (string | number | null | boolean)[][], index: number) => {
    const chunkCsv = rows.map(row => row.map(escapeCsvCell).join(',')).join('\n') + '\n';
    const blob = new Blob([headerRow + chunkCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const chunkFilename = data.length > CHUNK_SIZE
      ? `${filename}_part${index + 1}.csv`
      : `${filename}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', chunkFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (data.length <= CHUNK_SIZE) {
    downloadChunk(data, 0);
    return;
  }

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunkRows = data.slice(i, i + CHUNK_SIZE);
    downloadChunk(chunkRows, chunkIndex);
    chunkIndex++;
  }
};

// Main CSV download function
export const downloadCSV = (exportData: ExportData) => {
  if (exportData.data.length > CHUNK_SIZE) {
    downloadCSVChunked(exportData);
  } else {
    const { headers, data, filename } = exportData;
    let csvContent = headers.map(escapeCsvCell).join(',') + '\n';
    data.forEach(row => {
      const csvRow = row.map(escapeCsvCell).join(',');
      csvContent += csvRow + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Main export function with notification support
export const exportInventoryData = async (
  date: string,
  notify?: (title: string, description?: string, type?: 'success' | 'error') => void
) => {
  const auditLogger = AuditLogger.getInstance(); // Get the logger instance
  
  if (isExporting) {
    console.warn('Export already in progress');
    notify?.('Export in progress', 'Please wait until the current export finishes.', 'error');
    auditLogger.log('Export aborted', 'export', { reason: 'Export already in progress' }, 'low'); // Log the event
    return;
  }

  try {
    setIsExporting(true);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filenameBase = `daily-inventory-${date}-${timestamp}`;

    const { data, error } = await supabase.functions.invoke('daily-inventory-operations', {
      body: { operation: 'export', date, format: 'csv' }
    });

    if (error) {
      notify?.('Export failed', error.message || String(error), 'error');
      auditLogger.log('Export failed', 'export', { error: error.message || String(error) }, 'high'); // Log the error
      throw error;
    }

    if (!data || !data.headers || !data.data) {
      const msg = 'Invalid data received from server.';
      notify?.('Export failed', msg, 'error');
      auditLogger.log('Export failed', 'export', { reason: msg }, 'high'); // Log the invalid data scenario
      throw new Error(msg);
    }


    const exportData: ExportData = {
      headers: data.headers,
      data: data.data,
      filename: filenameBase
    };

    notify?.('Export started', `Exporting data for ${date}`, 'success');
    auditLogger.log('Export started', 'export', { date, filename: filenameBase }, 'low'); // Log the start

    downloadCSV(exportData);

    notify?.('Export completed', 'Your CSV file has been downloaded.', 'success');
    auditLogger.log('Export completed', 'export', { filename: filenameBase }, 'low');
 // Log the completion
  } catch (error) {
    console.error('Export failed:', error);
    auditLogger.log('Export failed', 'export', { error: String(error) }, 'high');// Log the error if not notified
  } finally {
    setIsExporting(false);
  }
};