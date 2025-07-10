import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, CalendarIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { DateRange } from 'react-day-picker';
import Calendar23 from '@/components/calendar-23';

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  onRefresh: () => void;
  onClearDateFilter: () => void;
  loading: boolean;
}

export const OrderFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onRefresh,
  onClearDateFilter,
  loading
}: OrderFiltersProps) => {
  // For shadcn calendar-05 range picker
  const [range, setRange] = React.useState<DateRange>({ from: dateFrom, to: dateTo });

  React.useEffect(() => {
    setRange({ from: dateFrom, to: dateTo });
  }, [dateFrom, dateTo]);

  const handleRangeChange = (nextRange: DateRange) => {
    setRange(nextRange);
    setDateFrom(nextRange.from);
    setDateTo(nextRange.to);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-800">Filters & Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Picker (calendar-23, popover on click) */}
          <div className="col-span-2">
            <Calendar23
              selected={range}
              onSelect={handleRangeChange}
              label="Date Range"
              placeholder="Select date"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 items-end">
            <Button variant="outline" onClick={onClearDateFilter}>
              Clear
            </Button>
            <Button variant="outline" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
