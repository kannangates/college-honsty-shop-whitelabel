import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Search, FileText, Calendar, User, Database, Filter, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AuditLog {
  id: string;
  user_id: string;
  user_role: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  student_id: string;
  role: string;
}

const AdminAuditLogs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filters
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const query = supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      const { data, error } = await query;

      if (error) throw error;
      // Type cast the data to match our AuditLog interface
      const typedData = (data || []).map(log => ({
        ...log,
        old_values: log.old_values as Record<string, unknown> | null,
        new_values: log.new_values as Record<string, unknown> | null,
      }));
      setLogs(typedData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs';
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, [fetchLogs]);

  // Real-time subscription for new audit logs
  useEffect(() => {
    const channel = supabase
      .channel('audit-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_audit_log'
        },
        (payload) => {
          const newLog = payload.new as AuditLog;
          setLogs(prevLogs => [newLog, ...prevLogs]);
          toast({
            title: 'New Audit Log',
            description: `${newLog.action} on ${newLog.table_name}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, student_id, role')
        .in('role', ['admin', 'developer'])
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };



  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} (${user.student_id})` : userId.substring(0, 8);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-500';
      case 'UPDATE': return 'bg-blue-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filter by user
    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.user_id === selectedUser);
    }

    // Filter by table
    if (selectedTable !== 'all') {
      filtered = filtered.filter(log => log.table_name === selectedTable);
    }

    // Filter by action
    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(log => new Date(log.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.created_at) <= endDate);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.table_name.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        getUserName(log.user_id).toLowerCase().includes(query) ||
        log.record_id?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredLogs = applyFilters();
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const uniqueTables = [...new Set(logs.map(log => log.table_name))].sort();

  const resetFilters = () => {
    setSelectedUser('all');
    setSelectedTable('all');
    setSelectedAction('all');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const renderNewValuesWithHighlight = (oldValues: Record<string, unknown> | null, newValues: Record<string, unknown> | null) => {
    if (!newValues) return null;

    const changedKeys = new Set<string>();

    if (oldValues && newValues) {
      Object.keys(newValues).forEach(key => {
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
          changedKeys.add(key);
        }
      });
    }

    const renderValue = (key: string, value: unknown, indent: number = 0): JSX.Element => {
      const isChanged = changedKeys.has(key);
      const indentStr = '  '.repeat(indent);

      if (value === null) {
        return (
          <span key={key} className={isChanged ? 'text-destructive font-semibold' : ''}>
            {indentStr}"{key}": null
          </span>
        );
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        return (
          <span key={key}>
            <span className={isChanged ? 'text-destructive font-semibold' : ''}>
              {indentStr}"{key}": {'{'}
            </span>
            {'\n'}
            {Object.entries(value).map(([k, v]) => renderValue(k, v, indent + 1))}
            {indentStr}{'}'}
          </span>
        );
      }

      const valueStr = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
      return (
        <span key={key} className={isChanged ? 'text-destructive font-semibold' : ''}>
          {indentStr}"{key}": {valueStr}
          {'\n'}
        </span>
      );
    };

    return (
      <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
        {'{\n'}
        {Object.entries(newValues).map(([key, value]) => renderValue(key, value, 1))}
        {'}'}
      </pre>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive tracking of all administrative actions
          </p>
        </div>
        <Button onClick={fetchLogs} variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter logs by user, table, action type, date range, or search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Filter */}
            <div className="space-y-2">
              <Label htmlFor="user-filter" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                User
              </Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger id="user-filter">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.student_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table Filter */}
            <div className="space-y-2">
              <Label htmlFor="table-filter" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Table
              </Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger id="table-filter">
                  <SelectValue placeholder="All tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  {uniqueTables.map(table => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <Label htmlFor="action-filter">Action Type</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger id="action-filter">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="INSERT">INSERT</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </Label>
              <Input
                id="search"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="date-from" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                From Date
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="date-to" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                To Date
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedLogs.length} of {filteredLogs.length} logs
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
          ) : paginatedLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No logs found</div>
          ) : (
            <>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Record ID</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {getUserName(log.user_id)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold capitalize">
                            {log.user_role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold text-white ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.table_name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.record_id?.substring(0, 8) || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this audit log entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Timestamp</Label>
                    <p className="font-mono text-sm">
                      {format(new Date(selectedLog.created_at), 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">User</Label>
                    <p className="text-sm">{getUserName(selectedLog.user_id)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <p className="text-sm capitalize">{selectedLog.user_role}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Action</Label>
                    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold text-white ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Table</Label>
                    <p className="font-mono text-sm">{selectedLog.table_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Record ID</Label>
                    <p className="font-mono text-xs">{selectedLog.record_id || '-'}</p>
                  </div>
                  {selectedLog.ip_address && (
                    <div>
                      <Label className="text-muted-foreground">IP Address</Label>
                      <p className="font-mono text-sm">{selectedLog.ip_address}</p>
                    </div>
                  )}
                </div>

                {selectedLog.old_values && (
                  <div>
                    <Label className="text-muted-foreground">Old Values</Label>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_values && (
                  <div>
                    <Label className="text-muted-foreground">New Values</Label>
                    {renderNewValuesWithHighlight(selectedLog.old_values, selectedLog.new_values)}
                  </div>
                )}

                {selectedLog.user_agent && (
                  <div>
                    <Label className="text-muted-foreground">User Agent</Label>
                    <p className="text-xs text-muted-foreground mt-1 break-all">
                      {selectedLog.user_agent}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuditLogs;
