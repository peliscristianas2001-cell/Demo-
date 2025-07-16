
"use client"
import { useMemo, useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { TourCard } from "@/components/tour-card"
import { mockTours } from "@/lib/mock-data"
import type { Tour } from '@/lib/types';

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedTours = localStorage.getItem("ytl_tours");
    if (storedTours) {
      setTours(JSON.parse(storedTours, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
      }));
    } else {
      setTours(mockTours);
    }
  }, []);

  const activeTours = useMemo(() => tours.filter(tour => new Date(tour.date) >= new Date()), [tours]);
  
  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-12 md:py-24">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
                Todos Nuestros Viajes
              </h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Explorá el catálogo completo y encontrá tu próximo destino. La aventura te espera.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

    