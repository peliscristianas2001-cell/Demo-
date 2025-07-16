
"use client"

import { useMemo } from "react"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { mockTours } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"

export default function FlyersPage() {
  const activeTours = useMemo(() => mockTours.filter(tour => new Date(tour.date) >= new Date()), []);

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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeTours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl">
                <CardContent className="p-0">
                  <Image
                    src={tour.flyerUrl}
                    alt={`Flyer de ${tour.destination}`}
                    width={400}
                    height={500}
                    className="w-full h-auto object-cover aspect-[4/5]"
                    data-ai-hint="travel flyer"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
