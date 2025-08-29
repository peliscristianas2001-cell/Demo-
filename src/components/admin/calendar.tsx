
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
  ListPlus,
  PlusCircle,
} from "lucide-react";
import { exportToExcel } from "@/lib/excel-export";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import type { Bubble } from "@/hooks/use-calendar-bubbles";

const monthNames = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];

const tailwindToHex: Record<string, { bg: string; border: string }> = {
  "bg-blue-200 border-blue-400": { bg: "#BFDBFE", border: "#60A5FA" },
  "bg-green-200 border-green-400": { bg: "#BBF7D0", border: "#4ADE80" },
  "bg-yellow-200 border-yellow-400": { bg: "#FEF08A", border: "#FACC15" },
  "bg-red-200 border-red-400": { bg: "#FECACA", border: "#F87171" },
  "bg-purple-200 border-purple-400": { bg: "#E9D5FF", border: "#A78BFA" },
  "bg-pink-200 border-pink-400": { bg: "#FBCFE8", border: "#F472B6" },
};

export function Calendar() {
  const {
    currentDate,
    setCurrentDate,
    days,
    weekdays,
    bubbles,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isSelecting,
    handleBubbleChange,
    handleExpandBubble,
    handleDeleteBubble,
    handleColorChange,
    multiSelectMode,
    setMultiSelectMode,
    handleMultiSelectDayClick,
    createBubbleFromMultiSelect,
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

  const colors = Object.keys(tailwindToHex);

  const renderBubble = (bubble: Bubble, dayKey: string, isStartOfWeek: boolean) => {
    let colSpan = 1;

    if (!isStartOfWeek) {
        return null;
    }
    
    let currentDate = new Date(dayKey + "T00:00:00");
    while (currentDate.getDay() < 6) { // While it's not Saturday
      currentDate.setDate(currentDate.getDate() + 1);
      const nextDayKey = currentDate.toISOString().split('T')[0];
      if (bubble.dates.includes(nextDayKey)) {
        colSpan++;
      } else {
        break; 
      }
    }
    
    const printColors = tailwindToHex[bubble.color || colors[0]];

    return (
      <div
        key={bubble.id + '-' + dayKey}
        className={cn("calendar-bubble relative group z-10", bubble.color)}
        style={{
          height: `${bubble.height || 28}px`,
          gridColumn: `span ${colSpan}`,
          '--bubble-print-bg-color': printColors.bg,
          '--bubble-print-border-color': printColors.border,
        } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()} 
      >
        <textarea
          value={bubble.text}
          onChange={(e) => handleBubbleChange(bubble.id, e.target.value)}
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
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4 no-print">
        <div className="flex items-center gap-4">
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
             <div className="flex items-center space-x-2">
                <Switch
                    id="multi-select-mode"
                    checked={multiSelectMode}
                    onCheckedChange={setMultiSelectMode}
                />
                <Label htmlFor="multi-select-mode" className="flex items-center gap-2"><ListPlus className="w-4 h-4" /> Selección Múltiple</Label>
            </div>
            {multiSelectMode && (
                <Button onClick={createBubbleFromMultiSelect}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Crear Burbuja
                </Button>
            )}
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>
      </div>

      <div className="printable-calendar">
         <div className="calendar-header-month text-center font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <div className="calendar-header-days">
            {weekdays.map((day) => (
            <div key={day} className="text-center font-bold">
                {day}
            </div>
            ))}
        </div>
        <div className="calendar-grid">
            {days.map(({ date, isCurrentMonth, isToday, bubbles: dayBubbles, selectionInfo }) => {
                const dayKey = date.toISOString().split("T")[0];
                const dayOfWeek = date.getDay();
                const isSelectedForMulti = selectionInfo?.isMultiSelecting;
                
                return (
                <div
                    key={dayKey}
                    data-date={dayKey}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={isSelecting ? handleMouseUp : undefined}
                    onClick={multiSelectMode ? () => handleMultiSelectDayClick(dayKey) : undefined}
                    className={cn(
                    "calendar-day-cell",
                    !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                    selectionInfo?.isSelecting && !multiSelectMode && "bg-primary/20",
                    isSelectedForMulti && multiSelectMode && "bg-primary/30 ring-2 ring-primary inset-0",
                    multiSelectMode && "cursor-pointer"
                    )}
                >
                    <div className="calendar-day-number">
                        <span
                        className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                            isToday && "bg-primary text-primary-foreground"
                        )}
                        >
                        {date.getDate()}
                        </span>
                    </div>
                    <div className="calendar-bubbles-container grid grid-cols-1 auto-rows-min gap-0.5">
                        {dayBubbles.map((bubble) => {
                            if (!bubble.dates.includes(dayKey)) return null;
                            const isStartOfBubbleInWeek = dayOfWeek === 0 || !bubble.dates.includes(new Date(date.getTime() - 86400000).toISOString().split('T')[0]);
                            return renderBubble(bubble, dayKey, isStartOfBubbleInWeek);
                        })}
                    </div>
                </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}
