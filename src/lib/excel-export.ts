
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

  for (let i = 0; i < 42; i++) {
    const currentDay = new Date(startDateGrid);
    currentDay.setDate(startDateGrid.getDate() + i);
    const row = Math.floor(i / 7) + 1; // +1 for header row
    const col = i % 7;
    const cellRef = XLSX.utils.encode_cell({ r: row, c: col });

    const isCurrentMonth = currentDay.getMonth() === month;
    const dayNumber = currentDay.getDate();

    if (!ws[cellRef]) ws[cellRef] = { v: "" };
    ws[cellRef].v = isCurrentMonth ? dayNumber : "";
    ws[cellRef].t = 's';
    ws[cellRef].s = {
      font: {
        sz: 14,
        bold: true,
        color: { rgb: isCurrentMonth ? "000000" : "AAAAAA" }
      },
      alignment: {
        vertical: "top",
        horizontal: "left"
      }
    };
  }

  bubbles.forEach(bubble => {
    const dates = bubble.multiSelectDates?.sort((a,b) => new Date(a).getTime() - new Date(b).getTime()) || [];
    const colorClass = bubble.color?.split(' ')[0] || '';
    const hexColor = tailwindToHex[colorClass] || "E5E7EB"; // Default grey
    
    let currentMerge: {s: XLSX.CellAddress, e: XLSX.CellAddress} | null = null;
    
    dates.forEach((dateStr, index) => {
        const date = new Date(dateStr + "T00:00:00");
        const dayDiff = Math.floor((date.getTime() - startDateGrid.getTime()) / (1000 * 60 * 60 * 24));
        const r = Math.floor(dayDiff / 7) + 1;
        const c = dayDiff % 7;

        // Place text and style
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
        
        ws[cellRef].s = {
            ...ws[cellRef].s,
            fill: { fgColor: { rgb: hexColor } },
            font: { ...ws[cellRef].s?.font, sz: 10, bold: false },
            alignment: { ...ws[cellRef].s?.alignment, vertical: 'center', horizontal: 'center', wrapText: true }
        };

        const existingText = (ws[cellRef].v || '').toString();
        const separator = existingText.includes('\n') || existingText.length === 0 ? '' : '\n\n';
        ws[cellRef].v = `${existingText}${separator}${bubble.text}`;
        
        // Handle merging logic
        const prevDate = index > 0 ? new Date(dates[index - 1] + "T00:00:00") : null;
        const isConsecutive = prevDate && (date.getTime() - prevDate.getTime() === 86400000) && prevDate.getDay() < 6;

        if (isConsecutive) {
            if (currentMerge) {
                currentMerge.e.c = c; // Extend the merge range
            }
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

  ws['!merges'] = merges;
  ws['!cols'] = weekdays.map(() => ({ wch: 20 }));
  ws['!rows'] = Array(7).fill({ hpx: 80 });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  XLSX.writeFile(wb, `Calendario_${ws_name.replace(/ /g, '_')}.xlsx`);
};
