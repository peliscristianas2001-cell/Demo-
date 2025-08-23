
"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { mockTours } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import type { Tour } from "@/lib/types"

export default function EmployeeFlyersPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const storedTours = localStorage.getItem("ytl_tours")
    if (storedTours) {
      setTours(JSON.parse(storedTours, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
      }));
    } else {
      setTours(mockTours)
    }
  }, [])

  const activeTours = useMemo(() => tours.filter(tour => new Date(tour.date) >= new Date()), [tours]);

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-center space-y-2 mb-8">
        <h1 className="text-2xl font-bold tracking-tighter">
          Flyers Promocionales
        </h1>
        <p className="max-w-[900px] text-muted-foreground">
          Utiliza estos flyers para promocionar los viajes con tus clientes.
        </p>
      </div>
      {activeTours.length === 0 ? (
        <Card>
            <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No hay flyers de viajes activos para mostrar.</p>
            </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeTours.map((tour) => (
          <Card key={tour.id} className="overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl">
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
                        alt={`Flyer de ${tour.destination}`}
                        width={400}
                        height={500}
                        className="w-full h-auto object-cover aspect-[4/5]"
                        data-ai-hint="travel flyer"
                      />
                    )}
                  </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  )
}
