
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

export const BulkUploadModal = ({ open, onOpenChange, onUploadComplete }: BulkUploadModalProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [results, setResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setStatus('idle');
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'student_id,name,email,department,mobile_number,shift,role,initial_points,password\n' +
                      'ST001,John Doe,john@example.com,Computer Science,9876543210,1,student,100,password123\n' +
                      'ST002,Jane Smith,jane@example.com,Information Technology,9876543211,2,teacher,150,password456\n' +
                      'ST003,Mike Johnson,mike@example.com,All Department,9876543212,full,teacher,200,password789';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_bulk_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('processing');
    setProgress(0);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      const dataLines = lines.slice(1);
      
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < dataLines.length; i++) {
        const values = dataLines[i].split(',');
        const userData = {
          student_id: values[0]?.trim(),
          name: values[1]?.trim(),
          email: values[2]?.trim(),
          department: values[3]?.trim(),
          mobile_number: values[4]?.trim(),
          shift: values[5]?.trim() || '1',
          role: values[6]?.trim() || 'student',
          initial_points: parseInt(values[7]?.trim() || '100'),
          password: values[8]?.trim()
        };

        try {
          // Simulate API call for demo - replace with actual bulk upload function
          await new Promise(resolve => setTimeout(resolve, 100));
          successCount++;
        } catch {
          errorCount++;
        }

        setProgress(((i + 1) / dataLines.length) * 100);
      }

      setResults({ success: successCount, errors: errorCount });
      setStatus('completed');
      
      toast({
        title: 'Upload Complete',
        description: `${successCount} users created successfully, ${errorCount} errors`,
      });

      onUploadComplete();
    } catch (error) {
      setStatus('error');
      toast({
        title: 'Upload Failed',
        description: 'Failed to process CSV file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setProgress(0);
    setStatus('idle');
    setResults({ success: 0, errors: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Users
          </DialogTitle>
          <DialogDescription>Upload multiple users via CSV file</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Button variant="outline" onClick={downloadTemplate} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          <div>
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Required columns: student_id, name, email, department, mobile_number, shift, role, initial_points, password
            </p>
          </div>

          {status === 'processing' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Processing users...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-600">{Math.round(progress)}% complete</p>
            </div>
          )}

          {status === 'completed' && (
            <div className="space-y-2 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Upload Completed</span>
              </div>
              <p className="text-sm text-green-600">
                {results.success} users created successfully
                {results.errors > 0 && `, ${results.errors} errors occurred`}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Upload Failed</span>
              </div>
              <p className="text-sm text-red-600">Please check your CSV file and try again</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading || status === 'completed'}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload Users'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {status === 'completed' ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
