"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plane } from "lucide-react"

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-primary" />
            Gestión de Viajes
          </CardTitle>
          <CardDescription>
            Aquí podrás crear, editar y eliminar los viajes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta sección está en construcción.</p>
        </CardContent>
      </Card>
    </div>
  )
}
