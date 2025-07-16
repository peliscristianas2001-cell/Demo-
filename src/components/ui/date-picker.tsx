"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date;
    setDate?: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({ date, setDate, placeholder, className }: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date|undefined>(date)
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (setDate) {
      setDate(newDate)
    }
    setInternalDate(newDate)
  }

  const displayDate = date ?? internalDate;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-12 pl-10",
            !displayDate && "text-muted-foreground",
            className
          )}
        >
          {displayDate ? format(displayDate, "PPP", { locale: es }) : <span>{placeholder || "Pick a date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={displayDate}
          onSelect={handleDateChange}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}
