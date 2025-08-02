import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Search, CalendarIcon, RefreshCw, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { DateRange } from 'react-day-picker';
import Calendar23 from '@/components/ui/calendar-23';

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
  // For shadcn calendar-23 range picker
  const [range, setRange] = React.useState<DateRange>({ from: dateFrom, to: dateTo });

  React.useEffect(() => {
    setRange({ from: dateFrom, to: dateTo });
  }, [dateFrom, dateTo]);

  const handleRangeChange = (nextRange: DateRange | undefined) => {
    if (nextRange) {
      setRange(nextRange);
      setDateFrom(nextRange.from);
      setDateTo(nextRange.to);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search Box */}
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by student name, ID, or order number..."
            className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Filter by payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="paid">Paid Orders</SelectItem>
              <SelectItem value="unpaid">Unpaid Orders</SelectItem>
              <SelectItem value="cancelled">Cancelled Orders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Picker */}
        <div className="w-full lg:w-64">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                  !range.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {range.from ? (
                  range.to ? (
                    <>
                      {format(range.from, "MMM dd")} - {format(range.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(range.from, "MMM dd, yyyy")
                  )
                ) : (
                  "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={range}
                onSelect={handleRangeChange}
                numberOfMonths={2}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full lg:w-auto">
          <Button 
            variant="outline" 
            onClick={onClearDateFilter}
            className="h-11 px-4 border-gray-200 hover:border-gray-300"
          >
            Clear Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={onRefresh} 
            disabled={loading}
            className="h-11 px-4 border-gray-200 hover:border-gray-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};
