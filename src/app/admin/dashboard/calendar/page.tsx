
"use client"

import { Calendar } from '@/components/admin/calendar';

export default function CalendarPage() {
  return (
    <div className="space-y-6 printable-area">
       <div className="no-print">
        <h2 className="text-2xl font-bold">Calendario de Anotaciones</h2>
        <p className="text-muted-foreground">
          Organiza tus eventos y notas directamente en el calendario. Haz clic en un día, arrastra para crear un rango o usa la selección múltiple.
        </p>
      </div>
      <Calendar />
    </div>
  );
}
