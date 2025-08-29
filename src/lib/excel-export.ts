
import * as XLSX from 'xlsx';
import { Bubble } from '@/hooks/use-calendar-bubbles';

export const exportToExcel = (currentDate: Date, bubbles: Bubble[]) => {
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const ws_name = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // 1. Create headers
  const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const data: any[][] = [weekdays];

  // 2. Prepare calendar data structure
  const calendarData: Record<string, string[]> = {};

  bubbles.forEach(bubble => {
    const startDate = new Date(bubble.startDate + "T00:00:00");
    const endDate = new Date(bubble.endDate + "T00:00:00");

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (!calendarData[dateStr]) {
            calendarData[dateStr] = [];
        }
        
        let content = bubble.text;
        if(bubble.startDate !== bubble.endDate && dateStr === bubble.startDate) {
            content = `(Inicia) ${bubble.text}`;
        }
        
        // Add content only to the first day of a multi-day bubble
        if(dateStr === bubble.startDate) {
            calendarData[dateStr].push(content);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // 3. Populate worksheet data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDateGrid = new Date(firstDayOfMonth);
  startDateGrid.setDate(startDateGrid.getDate() - startDateGrid.getDay());

  let week: any[] = [];
  for (let i = 0; i < 42; i++) {
    const currentDay = new Date(startDateGrid);
    currentDay.setDate(startDateGrid.getDate() + i);
    const dateStr = currentDay.toISOString().split("T")[0];
    
    if (currentDay.getMonth() !== month) {
      week.push(""); // Empty cell for days outside the current month
    } else {
      const dayNumber = currentDay.getDate();
      const cellContent = calendarData[dateStr] ? calendarData[dateStr].join('\n') : '';
      week.push(`${dayNumber}\n${cellContent}`);
    }

    if (week.length === 7) {
      data.push(week);
      week = [];
    }
  }

  // 4. Create worksheet and workbook
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths and row heights
  const colWidths = weekdays.map(() => ({ wch: 25 }));
  ws['!cols'] = colWidths;
  const rowHeights = Array(data.length).fill({ hpx: 80 });
  ws['!rows'] = rowHeights;

  // Apply cell styles
  const cellStyle = { alignment: { wrapText: true, vertical: "top" }, font: { sz: 10 } };
  Object.keys(ws).forEach(cellRef => {
    if (cellRef[0] === '!') return;
    if (!ws[cellRef].s) ws[cellRef].s = {};
    Object.assign(ws[cellRef].s, cellStyle);
  });
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  // 5. Trigger download
  XLSX.writeFile(wb, `Calendario_${ws_name.replace(' ', '_')}.xlsx`);
};
