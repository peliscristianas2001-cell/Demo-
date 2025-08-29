
"use client";

import { useCalendarBubbles } from "@/hooks/use-calendar-bubbles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Printer,
  FileDown,
  Expand,
  Trash2,
} from "lucide-react";
import { exportToExcel } from "@/lib/excel-export";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";

const monthNames = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];

export function Calendar() {
  const {
    currentDate,
    setCurrentDate,
    days,
    weekdays,
    handleDayClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isSelecting,
    handleBubbleChange,
    handleBubbleClick,
    handleExpandBubble,
    handleDeleteBubble,
    handleColorChange,
  } = useCalendarBubbles();

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    exportToExcel(currentDate, bubbles);
  };
  
  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(monthIndex));
    setCurrentDate(newDate);
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(year));
    setCurrentDate(newDate);
  }

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const colors = [
    "bg-blue-200 border-blue-400",
    "bg-green-200 border-green-400",
    "bg-yellow-200 border-yellow-400",
    "bg-red-200 border-red-400",
    "bg-purple-200 border-purple-400",
    "bg-pink-200 border-pink-400",
  ];

  const bubbles = useCalendarBubbles().bubbles;

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm printable-calendar">
      <div className="flex justify-between items-center mb-4 no-print">
        <div className="flex items-center gap-2">
           <Select value={String(currentDate.getMonth())} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((name, index) => (
                  <SelectItem key={name} value={String(index)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select value={String(currentYear)} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir a A4
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>
      </div>

      <div
        className="grid grid-cols-7 gap-px bg-border calendar-grid"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={isSelecting ? handleMouseUp : undefined}
      >
        {weekdays.map((day) => (
          <div key={day} className="text-center font-bold py-2 bg-muted">
            {day}
          </div>
        ))}

        {days.map(({ date, isCurrentMonth, isToday, bubbles: dayBubbles, selectionInfo }) => {
            const dayKey = date.toISOString().split("T")[0];
            return (
              <div
                key={dayKey}
                data-date={dayKey}
                className={cn(
                  "calendar-day-cell bg-card p-1",
                  !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                  selectionInfo?.isSelecting && "bg-primary/20"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full",
                    isToday && "bg-primary text-primary-foreground"
                  )}
                >
                  {date.getDate()}
                </span>
                <div className="calendar-bubbles-container">
                  {(dayBubbles || []).map((bubble) => {
                     const isMultiDayStart = bubble.startDate !== bubble.endDate && bubble.startDate === dayKey;
                     
                     if (bubble.startDate !== bubble.endDate && !isMultiDayStart) {
                        return null; // Don't render bubble text on subsequent days
                     }

                     const colSpan = isMultiDayStart ? (new Date(bubble.endDate).getTime() - new Date(bubble.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1 : 1;

                    return (
                      <div
                        key={bubble.id}
                        className={cn("calendar-bubble relative group z-10", bubble.color)}
                         style={{ 
                            height: `${bubble.height || 28}px`,
                            width: isMultiDayStart ? `calc(${colSpan * 100}% + ${(colSpan - 1)}px)` : '100%',
                         }}
                        onClick={(e) => {
                           e.stopPropagation(); 
                           handleBubbleClick(bubble.id);
                        }}
                      >
                        <textarea
                          value={bubble.text}
                          onChange={(e) =>
                            handleBubbleChange(bubble.id, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="text-black"
                          placeholder="Escribe aquí..."
                        />
                         <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print z-20">
                           <Popover>
                              <PopoverTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-5 w-5 rounded-full" onClick={e => e.stopPropagation()}>
                                      <div className={cn("w-3 h-3 rounded-full", bubble.color)}></div>
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2">
                                <div className="flex gap-1">
                                  {colors.map(color => (
                                    <Button key={color} size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleColorChange(bubble.id, color); }}>
                                        <div className={cn("w-4 h-4 rounded-full", color)}></div>
                                    </Button>
                                  ))}
                                </div>
                              </PopoverContent>
                           </Popover>
                            <Button size="icon" variant="ghost" className="h-5 w-5 text-black/50 hover:text-black" onClick={(e) => { e.stopPropagation(); handleExpandBubble(bubble.id); }}>
                                <Expand className="w-3 h-3"/>
                            </Button>
                             <Button size="icon" variant="ghost" className="h-5 w-5 text-red-500/50 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDeleteBubble(bubble.id); }}>
                                <Trash2 className="w-3 h-3"/>
                            </Button>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}
