import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { cn } from "@/lib/utils"
import { DayPicker } from "react-day-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


export interface DatePickerProps {
  /** The date value in ISO format (YYYY-MM-DD) */
  value?: string | null
  /** Called when the date changes */
  onChange?: (date: string | null) => void
  /** Whether the picker is disabled */
  disabled?: boolean
  /** Whether the picker is read-only */
  readOnly?: boolean
  /** Placeholder text when no date is selected */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
  /** Format to display the date (default: 'PPP') */
  displayFormat?: string
  /** Error state */
  error?: boolean
  /** Max selectable date */
  maxDate?: Date
  /** Min selectable date */
  minDate?: Date
  /** Custom trigger button className */
  triggerClassName?: string
  /** Whether to show the calendar icon */
  showIcon?: boolean
  /** Optional ID for the input */
  id?: string
}

const DatePicker = ({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  placeholder = "Pick a date",
  className,
  displayFormat = "PPP",
  error = false,
  maxDate,
  minDate,
  triggerClassName,
  showIcon = true,
  id,
}: DatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (!value) return undefined
    const parsed = parse(value, 'yyyy-MM-dd', new Date())
    return isValid(parsed) ? parsed : undefined
  })
  
  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"days" | "months" | "years">("days")
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date())

  useEffect(() => {
    // Update internal state when value prop changes
    if (!value) {
      setSelectedDate(undefined)
    } else {
      const parsed = parse(value, 'yyyy-MM-dd', new Date())
      if (isValid(parsed)) {
        setSelectedDate(parsed)
      }
    }
  }, [value])

  // Initialize with 120 years from current year
  const allYears = Array.from({ length: 120 }, (_, i) => 
    new Date().getFullYear() - i
  )
  const [currentYearPage, setCurrentYearPage] = useState(0)
  const yearsPerPage = 16 // 4x4 grid
  const totalYearPages = Math.ceil(allYears.length / yearsPerPage)
  
  const years = allYears.slice(
    currentYearPage * yearsPerPage,
    (currentYearPage + 1) * yearsPerPage
  )

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ]

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setIsOpen(false)
    if (onChange) {
      onChange(date ? format(date, 'yyyy-MM-dd') : null)
    }
  }

  const handleYearSelect = (year: string) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(parseInt(year))
    setCurrentMonth(newDate)
    setCurrentView("months")
  }

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(monthIndex)
    setCurrentMonth(newDate)
    setCurrentView("days")
  }

  // If in read-only mode, render a simple input
  if (readOnly) {
    return (
      <Input
        id={id}
        value={selectedDate ? format(selectedDate, displayFormat) : ''}
        className={cn("h-10 disabled:cursor-default", className)}
        disabled

      />
    )
  }

  return (
    <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          size="default"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !selectedDate && "text-muted-foreground",
            error && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            triggerClassName
          )}
          disabled={disabled}
        >
          {showIcon && <CalendarIcon className="mr-2 h-4 w-4" />}
          {selectedDate ? format(selectedDate, displayFormat) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 space-y-4">
          {/* Navigation Header */}
          <div className="flex items-center justify-between px-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("years")}
            >
              {format(currentMonth, "yyyy")}
            </Button>
            {currentView === "days" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView("months")}
              >
                {format(currentMonth, "MMMM")}
              </Button>
            )}
          </div>

          {/* Year Selection View */}
          {currentView === "years" && (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 p-2">
                {years.map((year) => (
                  <Button
                    key={year}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleYearSelect(year.toString())}
                    className={cn(
                      "w-full",
                      currentMonth.getFullYear() === year && "bg-primary text-primary-foreground"
                    )}
                  >
                    {year}
                  </Button>
                ))}
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentYearPage(prev => Math.max(0, prev - 1))}
                  disabled={currentYearPage === 0}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {`${currentYearPage + 1} / ${totalYearPages}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentYearPage(prev => Math.min(totalYearPages - 1, prev + 1))}
                  disabled={currentYearPage === totalYearPages - 1}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Month Selection View */}
          {currentView === "months" && (
            <div className="grid grid-cols-3 gap-2 p-2">
              {months.map((month, index) => (
                <Button
                  key={month}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMonthSelect(index)}
                  className={cn(
                    "w-full",
                    currentMonth.getMonth() === index && "bg-primary text-primary-foreground"
                  )}
                >
                  {month.slice(0, 3)}
                </Button>
              ))}
            </div>
          )}

          {/* Day Selection View */}
          {currentView === "days" && (
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              disabled={disabled}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              defaultMonth={selectedDate}
              fromDate={minDate}
              toDate={maxDate}
              showOutsideDays
              className="p-0"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "hidden", // Hide default month/year labels
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: cn(
                  "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                  "[&:has([aria-selected].day-outside)]:bg-accent/50",
                  "[&:has([aria-selected].day-range-end)]:rounded-r-md",
                ),
                day: cn(
                  "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
                ),
                day_range_end: "day-range-end",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                  "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker