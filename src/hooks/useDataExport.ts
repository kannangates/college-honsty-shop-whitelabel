
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExportData {
  headers: string[];
  data: (string | number)[][];
  filename: string;
}

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportData = async (data: ExportData, format: 'csv') => {
    setIsExporting(true);
    try {
      if (format === 'csv') {
        const csvContent = [
          data.headers.join(','),
          ...data.data.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${data.filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Export Successful',
          description: 'Data exported to CSV successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportData, isExporting };
};
