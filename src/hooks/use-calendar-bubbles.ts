
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface Bubble {
  id: string;
  startDate: string;
  endDate: string;
  text: string;
  height?: number;
  color?: string;
}

export const useCalendarBubbles = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [selection, setSelection] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [isSelecting, setIsSelecting] = useState(false);
  const mouseDownRef = useRef(false);

  useEffect(() => {
    const savedBubbles = localStorage.getItem("calendarBubbles");
    if (savedBubbles) {
      setBubbles(JSON.parse(savedBubbles));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarBubbles", JSON.stringify(bubbles));
  }, [bubbles]);

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
    const dayBubbles = bubbles.filter(b => {
      const bubbleStart = new Date(b.startDate);
      const bubbleEnd = new Date(b.endDate);
      bubbleStart.setHours(0, 0, 0, 0);
      bubbleEnd.setHours(0, 0, 0, 0);
      const currentDay = new Date(dateStr + "T00:00:00");
      return currentDay >= bubbleStart && currentDay <= bubbleEnd;
    });

    const isDateInSelection = () => {
        if (!isSelecting || !selection.start || !selection.end) return false;
        const start = selection.start < selection.end ? selection.start : selection.end;
        const end = selection.start > selection.end ? selection.start : selection.end;
        const currentDay = new Date(dateStr + "T00:00:00");
        return currentDay >= start && currentDay <= end;
    };


    days.push({
      date: new Date(currentDatePointer),
      isCurrentMonth: currentDatePointer.getMonth() === month,
      isToday: currentDatePointer.toDateString() === new Date().toDateString(),
      bubbles: dayBubbles,
      selectionInfo: { isSelecting: isDateInSelection() },
    });

    currentDatePointer.setDate(currentDatePointer.getDate() + 1);
  }

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const dateStr = target.closest("[data-date]")?.getAttribute("data-date");
    if (dateStr) {
      mouseDownRef.current = true;
      setIsSelecting(true);
      const clickedDate = new Date(dateStr + "T00:00:00");
      setSelection({ start: clickedDate, end: clickedDate });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!isSelecting || !selection.start || !mouseDownRef.current) return;
      const target = e.target as HTMLElement;
      const dateStr = target.closest("[data-date]")?.getAttribute("data-date");
      if (dateStr) {
        const currentDate = new Date(dateStr + "T00:00:00");
        setSelection((prev) => ({ ...prev, end: currentDate }));
      }
    }, [isSelecting, selection.start]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseDownRef.current) return;
    
    if (isSelecting && selection.start && selection.end) {
      const start = selection.start < selection.end ? selection.start : selection.end;
      const end = selection.start < selection.end ? selection.end : selection.start;
      
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      
      const newBubble: Bubble = {
        id: `bubble-${Date.now()}`,
        startDate: startStr,
        endDate: endStr,
        text: "",
        height: 28,
        color: "bg-blue-200 border-blue-400"
      };
      setBubbles((prev) => [...prev, newBubble]);
    }
    
    setIsSelecting(false);
    setSelection({ start: null, end: null });
    mouseDownRef.current = false;
  }, [isSelecting, selection]);

  const handleDayClick = useCallback(() => {}, []); // Placeholder, logic is now in mouse up/down

  const handleBubbleChange = useCallback((id: string, text: string) => {
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text } : b))
    );
  }, []);

  const handleBubbleClick = useCallback((id: string) => {
    // Logic to focus or bring bubble to front if needed in future
  }, []);

  const handleExpandBubble = useCallback((id: string) => {
    setBubbles((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, height: (b.height || 28) + 20 } : b
      )
    );
  }, []);
    
  const handleDeleteBubble = useCallback((id: string) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
  }, []);

  const handleColorChange = useCallback((id: string, color: string) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, color } : b));
  }, []);

  return {
    currentDate,
    setCurrentDate,
    days,
    weekdays,
    bubbles,
    handleDayClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isSelecting,
    handleBubbleChange,
    handleBubbleClick,
    handleExpandBubble,
    handleDeleteBubble,
    handleColorChange
  };
};
