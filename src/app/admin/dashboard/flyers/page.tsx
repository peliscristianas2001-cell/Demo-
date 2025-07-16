
"use client"

import { useMemo } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { mockTours } from "@/lib/mock-data"

export default function FlyersPage() {
  const activeTours = useMemo(() => mockTours.filter(tour => new Date(tour.date) >= new Date()), []);

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
      {activeTours.length === 0 ? (
         <Card>
            <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No hay flyers de viajes activos para mostrar.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden group">
                <CardContent className="p-0">
                <div className="relative aspect-[4/5] w-full">
                    <Image
                    src={tour.flyerUrl}
                    alt={tour.destination}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="travel flyer"
                    />
                </div>
                </CardContent>
                <CardFooter className="p-3 bg-muted/50">
                    <p className="font-semibold truncate text-sm">{tour.destination}</p>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}
    </div>
  )
}
