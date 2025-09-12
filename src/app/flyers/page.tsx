
"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { mockTours } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import type { Tour } from "@/lib/types"

export default function FlyersPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const storedTours = localStorage.getItem("app_tours")
    setTours(storedTours ? JSON.parse(storedTours) : mockTours);
    const handleStorageChange = () => {
        const newStoredTours = localStorage.getItem("app_tours");
        setTours(newStoredTours ? JSON.parse(newStoredTours) : mockTours);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [])

  const activeToursWithFlyers = useMemo(() => {
    return tours.filter(tour => new Date(tour.date) >= new Date() && tour.flyers && tour.flyers.length > 0)
  }, [tours]);


  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-12 md:py-24">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
                Nuestros Flyers Promocionales
              </h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                ¡Inspirate para tu próxima aventura! Aquí están los flyers de nuestros viajes más recientes.
              </p>
            </div>
          </div>
          <div className="space-y-12">
            {activeToursWithFlyers.map((tour) => (
               <div key={tour.id}>
                <h2 className="text-2xl font-bold tracking-tighter mb-6 text-center sm:text-left">{tour.destination}</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(tour.flyers || []).map(flyer => (
                    <Card key={flyer.id} className="overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl">
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
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
