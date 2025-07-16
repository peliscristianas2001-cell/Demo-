"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Ticket } from "lucide-react"

export default function ReservationsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            Gestión de Reservas
          </CardTitle>
          <CardDescription>
            Visualiza las reservas para cada viaje y gestiona los pasajeros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta sección está en construcción.</p>
        </CardContent>
      </Card>
    </div>
  )
}
