
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, UserPlus, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const BulkUserCreation = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `name,email,student_id,department,mobile_number,role,shift,status
John Doe,john@example.com,STU001,Computer Science,1234567890,student,morning,active
Jane Smith,jane@example.com,STU002,Information Technology,0987654321,student,evening,active`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk_user_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCsvData = (csv: string) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const user: any = {};
      
      headers.forEach((header, index) => {
        user[header] = values[index] || '';
      });
      
      return user;
    });
  };

  const validateUserData = (users: any[]) => {
    const errors: string[] = [];
    
    users.forEach((user, index) => {
      const lineNum = index + 2; // +2 because of header and 0-based index
      
      if (!user.name) errors.push(`Line ${lineNum}: Name is required`);
      if (!user.email) errors.push(`Line ${lineNum}: Email is required`);
      if (!user.student_id) errors.push(`Line ${lineNum}: Student ID is required`);
      if (!user.department) errors.push(`Line ${lineNum}: Department is required`);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.push(`Line ${lineNum}: Invalid email format`);
      }
    });
    
    return errors;
  };

  const handleBulkCreate = async () => {
    if (!csvData.trim()) {
      toast({
        title: 'No Data',
        description: 'Please upload a CSV file or paste CSV data',
        variant: 'destructive',
      });
      return;
    }

    try {
      const users = parseCsvData(csvData);
      const validationErrors = validateUserData(users);
      
      if (validationErrors.length > 0) {
        toast({
          title: 'Validation Errors',
          description: validationErrors.slice(0, 3).join('; ') + (validationErrors.length > 3 ? '...' : ''),
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      setProgress({ current: 0, total: users.length });

      const results = [];
      
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        setProgress({ current: i + 1, total: users.length });

        try {
          // Set default password and points
          const defaultPassword = 'Student@123';
          const userData = {
            ...user,
            password: defaultPassword,
            points: parseInt(user.points) || 100,
            status: user.status || 'active'
          };

          const { data, error } = await supabase.functions.invoke('auth-signup', {
            body: userData
          });

          if (error) throw error;

          results.push({ 
            success: true, 
            user: userData.name,
            studentId: userData.student_id
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({ 
            success: false, 
            user: user.name,
            studentId: user.student_id,
            error: errorMessage
          });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      toast({
        title: 'Bulk Creation Complete',
        description: `Successfully created ${successful} users. ${failed} failed.`,
        variant: successful > 0 ? 'default' : 'destructive',
      });

      if (successful > 0) {
        setCsvData('');
        setDialogOpen(false);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bulk creation failed';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Bulk Create Users
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk User Creation</DialogTitle>
          <DialogDescription>
            Upload a CSV file or paste CSV data to create multiple users at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CSV Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Download the CSV template to ensure proper formatting
                </p>
                <Button onClick={downloadTemplate} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csvFile">Upload CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </div>

          {/* CSV Data Input */}
          <div className="space-y-2">
            <Label htmlFor="csvData">Or Paste CSV Data</Label>
            <Textarea
              id="csvData"
              placeholder="name,email,student_id,department,mobile_number,role,shift,status&#10;John Doe,john@example.com,STU001,Computer Science,1234567890,student,morning,active"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              disabled={loading}
            />
          </div>

          {/* Progress */}
          {loading && progress.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creating users...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkCreate}
              disabled={loading || !csvData.trim()}
            >
              {loading ? 'Creating...' : 'Create Users'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
