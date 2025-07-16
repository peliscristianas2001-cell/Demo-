"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Image as ImageIcon } from "lucide-react"

export default function FlyersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" />
            Gestión de Flyers
          </CardTitle>
          <CardDescription>
            Sube y administra los flyers promocionales para los viajes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta sección está en construcción.</p>
        </CardContent>
      </Card>
    </div>
  )
}
