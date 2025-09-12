
"use client"

import { useState } from 'react';
import { Calendar } from '@/components/admin/calendar';
import { Button } from '@/components/ui/button';
import { BookMarked, AlertCircle, HelpCircle } from 'lucide-react';
import { HistoryViewer } from '@/components/admin/history-viewer';
import { GuideDialog } from '@/components/admin/guide-dialog';
import { guides } from '@/lib/guides';

export default function CalendarPage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [hasDueItems, setHasDueItems] = useState(false); // This would be updated by a check

  return (
    <>
      <HistoryViewer 
        isOpen={isHistoryOpen} 
        onOpenChange={setIsHistoryOpen} 
        historyKey="ytl_calendar_history"
        title="Historial de Calendarios"
        itemTitleKey="name"
        downloadFolderNameKey="calendarDownloadFolder"
        setHasDueItems={setHasDueItems}
      />
      <GuideDialog
        isOpen={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        title={guides.calendar.title}
        description={guides.calendar.description}
        content={guides.calendar.content}
      />
      <div className="printable-area">
        <div className="no-print flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Calendario de Anotaciones</h2>
            <p className="text-muted-foreground">
              Organiza tus eventos y notas directamente en el calendario.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsGuideOpen(true)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Guía de la Sección
            </Button>
            <Button variant="outline" onClick={() => setIsHistoryOpen(true)}>
              {hasDueItems && <AlertCircle className="mr-2 h-4 w-4 text-destructive" />}
              <BookMarked className="mr-2 h-4 w-4" />
              Historial
            </Button>
          </div>
        </div>
        <Calendar />
      </div>
    </>
  );
}
