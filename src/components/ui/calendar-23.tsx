import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function Calendar23({
  selected,
  onSelect,
  label,
  placeholder
}: {
  selected: DateRange | undefined,
  onSelect: (range: DateRange) => void,
  label?: string,
  placeholder?: string
}) {
  const [range, setRange] = React.useState<DateRange | undefined>(selected)

  React.useEffect(() => {
    setRange(selected)
  }, [selected])

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <Label htmlFor="dates" className="px-1">
          {label}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="dates"
            className="w-56 justify-between font-normal"
          >
            {range?.from && range?.to
              ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
              : (placeholder || "Select date")}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            captionLayout="dropdown"
            onSelect={(range) => {
              setRange(range)
              onSelect(range as DateRange)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 