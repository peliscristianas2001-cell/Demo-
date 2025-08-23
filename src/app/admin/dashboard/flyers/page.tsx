
"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { mockTours } from "@/lib/mock-data"
import { FlyerForm } from "@/components/admin/flyer-form"
import type { Tour } from "@/lib/types"

export default function FlyersPage() {
  const [tours, setTours] = useState<Tour[]>(mockTours)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const activeTours = useMemo(() => tours.filter(tour => new Date(tour.date) >= new Date()), [tours]);

  const handleFlyerUpload = (tripId: string, flyerUrl: string, flyerType: 'image' | 'video') => {
    setTours(prevTours => 
      prevTours.map(tour => 
        tour.id === tripId ? { ...tour, flyerUrl, flyerType } : tour
      )
    )
    setIsFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <FlyerForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        tours={activeTours}
        onSave={handleFlyerUpload}
      />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Flyers</h2>
          <p className="text-muted-foreground">
            Sube y administra los flyers (fotos o videos) promocionales para los viajes.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
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
                  <div className="relative aspect-[4/5] w-full bg-muted">
                    {tour.flyerType === 'video' ? (
                       <video
                        src={tour.flyerUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      >
                        Tu navegador no soporta videos.
                      </video>
                    ) : (
                      <Image
                        src={tour.flyerUrl}
                        alt={tour.destination}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="travel flyer"
                      />
                    )}
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
