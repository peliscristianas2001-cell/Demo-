
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { TemplateImporter } from "@/components/admin/template-importer";

export default function DashboardPage() {
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  return (
    <>
      <TemplateImporter isOpen={isImporterOpen} onOpenChange={setIsImporterOpen} />
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
            <Button onClick={() => setIsImporterOpen(true)}>
              <UploadCloud className="mr-2 h-4 w-4" />
              IMPORTAR PLANTILLA
            </Button>
             <p className="text-sm text-muted-foreground">
              Usa esta opción para cargar datos masivamente desde tus planillas de Excel.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
