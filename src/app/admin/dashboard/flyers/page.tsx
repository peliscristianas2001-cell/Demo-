
"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Trash2 } from "lucide-react"
import { mockTours } from "@/lib/mock-data"
import { FlyerForm } from "@/components/admin/flyer-form"
import type { Tour, Flyer } from "@/lib/types"

export default function FlyersPage() {
  const [tours, setTours] = useState<Tour[]>(mockTours)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    const storedTours = localStorage.getItem("ytl_tours")
    setTours(storedTours ? JSON.parse(storedTours) : mockTours);
    const handleStorageChange = () => {
        const newStoredTours = localStorage.getItem("ytl_tours");
        setTours(newStoredTours ? JSON.parse(newStoredTours) : mockTours);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [])
  
  useEffect(() => {
    localStorage.setItem("ytl_tours", JSON.stringify(tours));
  }, [tours]);


  const activeToursWithFlyers = useMemo(() => {
    return tours.filter(tour => new Date(tour.date) >= new Date() && tour.flyers && tour.flyers.length > 0)
  }, [tours]);

  const handleFlyerUpload = (tripId: string, newFlyer: Flyer) => {
    setTours(prevTours => 
      prevTours.map(tour => {
        if (tour.id === tripId) {
          const updatedFlyers = [...(tour.flyers || []), newFlyer];
          return { ...tour, flyers: updatedFlyers };
        }
        return tour;
      })
    )
    setIsFormOpen(false)
  }

  const handleFlyerDelete = (tripId: string, flyerId: string) => {
    setTours(prevTours =>
      prevTours.map(tour => {
        if (tour.id === tripId) {
          const updatedFlyers = (tour.flyers || []).filter(flyer => flyer.id !== flyerId);
          return { ...tour, flyers: updatedFlyers };
        }
        return tour;
      })
    );
  };

  return (
    <div className="space-y-6">
      <FlyerForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        tours={tours.filter(tour => new Date(tour.date) >= new Date())}
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
      {activeToursWithFlyers.length === 0 ? (
         <Card>
            <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No hay flyers de viajes activos para mostrar.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {activeToursWithFlyers.map(tour => (
            <div key={tour.id}>
              <h3 className="text-xl font-semibold mb-4">{tour.destination}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(tour.flyers || []).map((flyer) => (
                <Card key={flyer.id} className="overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/5] w-full bg-muted">
                        {flyer.type === 'video' ? (
                          <video
                            src={flyer.url}
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
                            src={flyer.url}
                            alt={tour.destination}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint="travel flyer"
                          />
                        )}
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleFlyerDelete(tour.id, flyer.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
