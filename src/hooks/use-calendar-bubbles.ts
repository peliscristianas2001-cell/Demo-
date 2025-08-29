
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface Bubble {
  id: string;
  text: string;
  dates: string[];
  height?: number;
  color?: string;
}

export const useCalendarBubbles = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [selection, setSelection] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [isSelecting, setIsSelecting] = useState(false);
  const mouseDownRef = useRef(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [multiSelectedDays, setMultiSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    const savedBubbles = localStorage.getItem("calendarBubbles");
    if (savedBubbles) {
      setBubbles(JSON.parse(savedBubbles));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarBubbles", JSON.stringify(bubbles));
  }, [bubbles]);

  useEffect(() => {
    if (!multiSelectMode) {
      setMultiSelectedDays([]);
    }
  }, [multiSelectMode]);

  const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days = [];
  let currentDatePointer = new Date(startDate);

  while (days.length < 42) {
    const dateStr = currentDatePointer.toISOString().split("T")[0];
    const dayBubbles = bubbles.filter(bubble => bubble.dates.includes(dateStr));
    
    const isDateInSelection = () => {
        if (!isSelecting || !selection.start || !selection.end) return false;
        const start = selection.start < selection.end ? selection.start : selection.end;
        const end = selection.start > selection.end ? selection.end : selection.start;
        const currentDay = new Date(dateStr + "T00:00:00");
        return currentDay >= start && currentDay <= end;
    };
    
    const isMultiSelected = multiSelectMode && multiSelectedDays.includes(dateStr);

    days.push({
      date: new Date(currentDatePointer),
      isCurrentMonth: currentDatePointer.getMonth() === month,
      isToday: currentDatePointer.toDateString() === new Date().toDateString(),
      bubbles: dayBubbles,
      selectionInfo: { isSelecting: isDateInSelection(), isMultiSelecting: isMultiSelected },
    });

    currentDatePointer.setDate(currentDatePointer.getDate() + 1);
  }

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (multiSelectMode) return;
    const target = e.target as HTMLElement;
    const isBubble = target.closest('.calendar-bubble');
    if (isBubble) return; // Don't start selection if clicking on a bubble

    const dateStr = target.closest("[data-date]")?.getAttribute("data-date");
    if (dateStr) {
      mouseDownRef.current = true;
      setIsSelecting(true);
      const clickedDate = new Date(dateStr + "T00:00:00");
      setSelection({ start: clickedDate, end: clickedDate });
    }
  }, [multiSelectMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (multiSelectMode || !isSelecting || !selection.start || !mouseDownRef.current) return;
    const target = e.target as HTMLElement;
    const dateStr = target.closest("[data-date]")?.getAttribute("data-date");
    if (dateStr) {
      const currentDate = new Date(dateStr + "T00:00:00");
      setSelection((prev) => ({ ...prev, end: currentDate }));
    }
  }, [isSelecting, selection.start, multiSelectMode]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (multiSelectMode || !mouseDownRef.current) return;
    
    mouseDownRef.current = false;
    
    if (isSelecting && selection.start && selection.end) {
      const start = selection.start < selection.end ? selection.start : selection.end;
      const end = selection.start > selection.end ? selection.end : selection.start;
      
      const selectedDates = [];
      let currentDate = new Date(start);
      while (currentDate <= end) {
        selectedDates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const newBubble: Bubble = {
        id: `bubble-${Date.now()}`,
        text: "",
        dates: selectedDates,
        height: 28,
        color: "bg-blue-200 border-blue-400",
      };
      setBubbles((prev) => [...prev, newBubble]);
    }
    
    setIsSelecting(false);
    setSelection({ start: null, end: null });
  }, [isSelecting, selection, multiSelectMode]);

  const handleBubbleChange = useCallback((id: string, text: string) => {
    setBubbles(prev => prev.map(b => (b.id === id ? { ...b, text } : b)));
  }, []);

  const handleExpandBubble = useCallback((id: string) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, height: (b.height || 28) + 20 } : b));
  }, []);
    
  const handleDeleteBubble = useCallback((id: string) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
  }, []);

  const handleColorChange = useCallback((id: string, color: string) => {
    setBubbles(prev => prev.map(b => (b.id === id ? { ...b, color } : b)));
  }, []);

  const handleMultiSelectDayClick = (dayStr: string) => {
    setMultiSelectedDays(prev => {
      if (prev.includes(dayStr)) {
        return prev.filter(d => d !== dayStr);
      }
      return [...prev, dayStr];
    });
  };

  const createBubbleFromMultiSelect = () => {
    if (multiSelectedDays.length === 0) return;

    const sortedDates = [...multiSelectedDays].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    const newBubble: Bubble = {
      id: `bubble-${Date.now()}`,
      text: "",
      dates: sortedDates,
      height: 28,
      color: "bg-green-200 border-green-400",
    };

    setBubbles(prev => [...prev, newBubble]);
    setMultiSelectedDays([]);
  };

  return {
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
  };
};
