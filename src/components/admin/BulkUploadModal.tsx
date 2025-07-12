
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, AlertCircle, CheckCircle, FileIcon, User, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

interface UploadProgress {
  current: number;
  total: number;
  currentUser: string;
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; error: string; user: string }>;
}

export const BulkUploadModal = ({ open, onOpenChange, onUploadComplete }: BulkUploadModalProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    current: 0,
    total: 0,
    currentUser: '',
    successCount: 0,
    errorCount: 0,
    errors: []
  });
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [results, setResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setStatus('idle');
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please drop a CSV file',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    const csvContent = '# Bulk User Upload Template\n' +
                      '# Note: Users will be required to change their password on first login\n' +
                      'student_id,name,email,department,mobile_number,shift,role,initial_points,password\n' +
                      'ST001,John Doe,john.doe@shasuncollege.edu.in,Computer Science,9876543210,Morning (1st Shift),student,100,shasun@123\n' +
                      'ST002,Jane Smith,jane.smith@shasuncollege.edu.in,Information Technology,9876543211,Evening (2nd Shift),teacher,150,password456\n' +
                      'ST003,Mike Johnson,mike.johnson@shasuncollege.edu.in,All Department,Full Shift,teacher,200,password789';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_users_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const createUserViaEdgeFunction = async (userData: {
    student_id: string;
    name: string;
    email: string;
    department: string;
    mobile_number: string;
    shift: string;
    role: string;
    initial_points: number;
    password: string;
  }, rowIndex: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-signup', {
        body: {
          studentId: userData.student_id,
          name: userData.name,
          email: userData.email,
          department: userData.department,
          password: userData.password,
          role: userData.role,
          shift: userData.shift,
          points: userData.initial_points,
          userMetadata: { must_change_password: true }
        }
      });

      if (error || data.error) {
        throw new Error(error?.message || data.error || 'Failed to create user');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        row: rowIndex,
        user: userData.name || userData.student_id
      };
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('processing');
    setProgress({
      current: 0,
      total: 0,
      currentUser: '',
      successCount: 0,
      errorCount: 0,
      errors: []
    });

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      const dataLines = lines.slice(1);
      
      setProgress(prev => ({ ...prev, total: dataLines.length }));

      for (let i = 0; i < dataLines.length; i++) {
        const values = dataLines[i].split(',');
        const userData = {
          student_id: values[0]?.trim(),
          name: values[1]?.trim(),
          email: values[2]?.trim(),
          department: values[3]?.trim(),
          mobile_number: values[4]?.trim(),
          shift: values[5]?.trim() || 'Morning (1st Shift)',
          role: values[6]?.trim() || 'student',
          initial_points: parseInt(values[7]?.trim() || '100'),
          password: values[8]?.trim() || 'Temp@123'
        };

        // Update current user being processed
        setProgress(prev => ({ 
          ...prev, 
          current: i + 1,
          currentUser: userData.name || userData.student_id
        }));

        const result = await createUserViaEdgeFunction(userData, i + 2);

        if (result.success) {
          setProgress(prev => ({ 
            ...prev, 
            successCount: prev.successCount + 1 
          }));
        } else {
          setProgress(prev => ({ 
            ...prev, 
            errorCount: prev.errorCount + 1,
            errors: [...prev.errors, {
              row: result.row,
              error: result.error,
              user: result.user
            }]
          }));
        }
      }

      const finalResults = {
        success: progress.successCount,
        errors: progress.errorCount
      };

      setResults(finalResults);
      setStatus('completed');
      
      toast({
        title: 'Upload Complete',
        description: `${finalResults.success} users created successfully, ${finalResults.errors} errors`,
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
    setProgress({
      current: 0,
      total: 0,
      currentUser: '',
      successCount: 0,
      errorCount: 0,
      errors: []
    });
    setStatus('idle');
    setResults({ success: 0, errors: 0 });
    setIsDragOver(false);
  };

  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

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

          {/* Drag and Drop Area */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium">
              CSV File
            </Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg flex flex-col gap-1 p-6 items-center cursor-pointer transition-colors",
                isDragOver 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300",
                file && "border-green-500 bg-green-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileSelect}
            >
              <FileIcon className={cn(
                "w-12 h-12",
                file ? "text-green-600" : "text-gray-400"
              )} />
              <span className="text-sm font-medium text-gray-500">
                {file ? file.name : "Drag and drop a CSV file or click to browse"}
              </span>
              <span className="text-xs text-gray-500">
                {file ? "File selected successfully" : "CSV files only"}
              </span>
            </div>
            
            {/* Hidden file input */}
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            
            <p className="text-xs text-gray-500">
              Required columns: student_id, name, email, department, mobile_number, shift, role, initial_points, password
            </p>
            <p className="text-xs text-blue-600">
              💡 Users will be required to change their password on first login for security
            </p>
          </div>

          {status === 'processing' && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Processing users...</span>
              </div>
              
              <Progress value={progressPercentage} className="w-full" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress: {progress.current} of {progress.total}</span>
                  <span>{Math.round(progressPercentage)}% complete</span>
                </div>
                
                {progress.currentUser && (
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <User className="h-3 w-3" />
                    <span>Currently processing: {progress.currentUser}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>{progress.successCount} successful</span>
                  </div>
                  {progress.errorCount > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>{progress.errorCount} errors</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="space-y-3 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Upload Completed</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-green-600">
                  <Users className="inline h-4 w-4 mr-1" />
                  {results.success} users created successfully
                </p>
                
                {results.errors > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm text-red-600">
                      {results.errors} errors occurred
                    </p>
                    {progress.errors.length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-red-600 hover:text-red-700">
                          View error details
                        </summary>
                        <div className="mt-2 space-y-1">
                          {progress.errors.slice(0, 5).map((error, index) => (
                            <div key={index} className="text-red-600">
                              Row {error.row}: {error.user} - {error.error}
                            </div>
                          ))}
                          {progress.errors.length > 5 && (
                            <div className="text-red-600">
                              ... and {progress.errors.length - 5} more errors
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2 p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
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
