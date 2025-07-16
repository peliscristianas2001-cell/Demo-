
"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { mockTours } from "@/lib/mock-data"

export default function FlyersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Flyers</h2>
          <p className="text-muted-foreground">
            Sube y administra los flyers promocionales para los viajes.
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Subir Nuevo Flyer
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockTours.map((tour) => (
          <Card key={tour.id} className="overflow-hidden group">
            <CardContent className="p-0">
              <Image
                src={tour.flyerUrl}
                alt={tour.destination}
                width={400}
                height={300}
                className="w-full h-48 object-cover aspect-video"
                data-ai-hint="travel flyer"
              />
            </CardContent>
            <CardFooter className="p-4 bg-muted/50">
                <p className="font-semibold truncate text-sm">{tour.destination}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
