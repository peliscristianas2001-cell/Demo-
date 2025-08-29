
"use client";

import { useState, useEffect, useCallback } from "react";

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
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days = [];
  let currentDatePointer = new Date(startDate);

  while (days.length < 42) {
    const dateStr = currentDatePointer.toISOString().split("T")[0];
    const dayBubbles = bubbles
      .filter(b => {
          const bubbleStart = new Date(b.startDate);
          const bubbleEnd = new Date(b.endDate);
          bubbleStart.setHours(0,0,0,0);
          bubbleEnd.setHours(0,0,0,0);
          currentDatePointer.setHours(0,0,0,0);
          return currentDatePointer >= bubbleStart && currentDatePointer <= bubbleEnd;
      });

    const singleDayBubbles = dayBubbles.filter(b => b.startDate === b.endDate && b.startDate === dateStr);
    
    const multiDayBubbleInfo = dayBubbles
      .filter(b => b.startDate !== b.endDate)
      .map(b => {
          const bubbleStart = new Date(b.startDate);
          const bubbleEnd = new Date(b.endDate);
          const currentDay = new Date(dateStr);
          const isStart = bubbleStart.toISOString().split('T')[0] === dateStr;
          
          if (!isStart) return null;

          const diffTime = Math.abs(bubbleEnd.getTime() - bubbleStart.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          
          return { bubbleId: b.id, colSpan: diffDays };
      }).find(info => info !== null);
      

    days.push({
      date: new Date(currentDatePointer),
      isCurrentMonth: currentDatePointer.getMonth() === month,
      isToday: currentDatePointer.toDateString() === new Date().toDateString(),
      bubbles: singleDayBubbles,
      selectionInfo: multiDayBubbleInfo
    });

    currentDatePointer.setDate(currentDatePointer.getDate() + 1);
  }

  const handleDayClick = useCallback((date: Date) => {
    if (isSelecting) return;
    const dateStr = date.toISOString().split("T")[0];
    const newBubble: Bubble = {
      id: `bubble-${Date.now()}`,
      startDate: dateStr,
      endDate: dateStr,
      text: "",
      height: 28,
      color: "bg-blue-200 border-blue-400"
    };
    setBubbles((prev) => [...prev, newBubble]);
  }, [isSelecting]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const dateStr = target.closest("[data-date]")?.getAttribute("data-date");
    if (dateStr) {
      setIsSelecting(true);
      const clickedDate = new Date(dateStr + "T00:00:00");
      setSelection({ start: clickedDate, end: clickedDate });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!isSelecting || !selection.start) return;
      const target = e.target as HTMLElement;
      const dateStr = target.closest("[data-date]")?.getAttribute("data-date");
      if (dateStr) {
        const currentDate = new Date(dateStr + "T00:00:00");
        setSelection((prev) => ({ ...prev, end: currentDate }));
      }
    }, [isSelecting, selection.start]);

  const handleMouseUp = useCallback(() => {
    if (isSelecting && selection.start && selection.end) {
      const start = selection.start < selection.end ? selection.start : selection.end;
      const end = selection.start < selection.end ? selection.end : selection.start;
      
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      
      if(startStr !== endStr) {
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
    }
    setIsSelecting(false);
    setSelection({ start: null, end: null });
  }, [isSelecting, selection]);

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
