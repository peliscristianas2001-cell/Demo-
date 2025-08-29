
import * as XLSX from 'xlsx';
import type { Bubble } from '@/hooks/use-calendar-bubbles';

const tailwindToHex: Record<string, string> = {
  "bg-blue-200": "BFDBFE",
  "bg-green-200": "BBF7D0",
  "bg-yellow-200": "FEF08A",
  "bg-red-200": "FECACA",
  "bg-purple-200": "E9D5FF",
  "bg-pink-200": "FBCFE8",
};

export const exportToExcel = (currentDate: Date, bubbles: Bubble[]) => {
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const ws_name = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const headerData = [weekdays];
  const ws = XLSX.utils.aoa_to_sheet(headerData);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDateGrid = new Date(firstDayOfMonth);
  startDateGrid.setDate(startDateGrid.getDate() - startDateGrid.getDay());

  const merges: XLSX.Range[] = [];
  const cellData: Record<string, {text: string[], color?: string}> = {};

  // First, populate day numbers
  for (let i = 0; i < 42; i++) {
    const currentDay = new Date(startDateGrid);
    currentDay.setDate(startDateGrid.getDate() + i);
    const dayKey = currentDay.toISOString().split('T')[0];

    const isCurrentMonth = currentDay.getMonth() === month;
    const dayNumber = currentDay.getDate();

    if (isCurrentMonth) {
      cellData[dayKey] = { text: [String(dayNumber)] };
    }
  }

  // Then, process bubbles
  bubbles.forEach(bubble => {
    const dates = bubble.multiSelectDates?.sort((a,b) => new Date(a).getTime() - new Date(b).getTime()) || [];
    const colorClass = bubble.color?.split(' ')[0] || '';
    const hexColor = tailwindToHex[colorClass] || "E5E7EB"; // Default grey
    
    let currentMerge: {s: XLSX.CellAddress, e: XLSX.CellAddress} | null = null;
    
    dates.forEach((dateStr, index) => {
      if (!cellData[dateStr]) cellData[dateStr] = { text: [] };
      cellData[dateStr].text.push(bubble.text);
      cellData[dateStr].color = hexColor;

      const date = new Date(dateStr + "T00:00:00");
      const prevDate = index > 0 ? new Date(dates[index - 1] + "T00:00:00") : null;
      const isConsecutiveInWeek = prevDate && (date.getTime() - prevDate.getTime() === 86400000) && date.getDay() !== 0;

      const dayDiff = Math.floor((date.getTime() - startDateGrid.getTime()) / (1000 * 60 * 60 * 24));
      const r = Math.floor(dayDiff / 7) + 1;
      const c = dayDiff % 7;

      if (isConsecutiveInWeek && currentMerge) {
          currentMerge.e.c = c;
      } else {
        if (currentMerge) {
          merges.push(currentMerge);
        }
        currentMerge = { s: { r, c }, e: { r, c } };
      }
    });

    if (currentMerge) {
      merges.push(currentMerge);
    }
  });

  // Write data to worksheet
  for (let i = 0; i < 42; i++) {
    const currentDay = new Date(startDateGrid);
    currentDay.setDate(startDateGrid.getDate() + i);
    const dayKey = currentDay.toISOString().split('T')[0];
    const data = cellData[dayKey];
    
    const r = Math.floor(i / 7) + 1;
    const c = i % 7;
    const cellRef = XLSX.utils.encode_cell({ r, c });

    if (data) {
      ws[cellRef] = {
        v: data.text.join('\n\n'),
        t: 's',
        s: {
          font: {
            sz: 10,
            color: { rgb: "000000" }
          },
          alignment: {
            vertical: "top",
            horizontal: "left",
            wrapText: true
          },
          ...(data.color && { fill: { fgColor: { rgb: data.color } } })
        }
      };
    }
  }

  ws['!merges'] = merges;
  ws['!cols'] = weekdays.map(() => ({ wch: 25 }));
  ws['!rows'] = Array(7).fill({ hpx: 80 });
  // Set header row height
  if (ws['!rows'][0]) ws['!rows'][0].hpx = 20;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  XLSX.writeFile(wb, `Calendario_${ws_name.replace(/ /g, '_')}.xlsx`);
};
