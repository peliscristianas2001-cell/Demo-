
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet } from "lucide-react";
import { TemplateImporter } from "@/components/admin/template-importer";
import { DataExporter } from "@/components/admin/data-exporter";

export default function DashboardPage() {
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isExporterOpen, setIsExporterOpen] = useState(false);

  return (
    <>
      <TemplateImporter isOpen={isImporterOpen} onOpenChange={setIsImporterOpen} />
      <DataExporter isOpen={isExporterOpen} onOpenChange={setIsExporterOpen} />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>¡Bienvenida al Panel de Administración!</CardTitle>
            <CardDescription>
              Desde aquí podrás gestionar los viajes, las reservas, los pasajeros y la configuración de tu sitio web "YO TE LLEVO".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Utiliza el menú de la izquierda para navegar por las diferentes secciones.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => setIsImporterOpen(true)}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  IMPORTAR PLANTILLA
                </Button>
                 <Button variant="outline" onClick={() => setIsExporterOpen(true)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  DATOS DE EXPORTACIÓN
                </Button>
            </div>
             <p className="text-sm text-muted-foreground pt-2">
              Usa estas opciones para cargar o exportar datos masivamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
