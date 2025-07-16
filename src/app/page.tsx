"use client"
import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { TourCard } from "@/components/tour-card"
import { mockTours } from "@/lib/mock-data"
import { CalendarIcon, MapPinIcon, SearchIcon } from "lucide-react"

export default function Home() {
  const featuredTours = mockTours.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Destino destacado"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-[-1] brightness-50"
            data-ai-hint="tropical beach sunset"
          />
          <div className="container px-4 md:px-6">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl font-headline">
              Tu Próxima Aventura Comienza Aquí
            </h1>
            <p className="max-w-3xl mx-auto mt-4 text-lg md:text-xl">
              Explora los destinos más increíbles. Encontrá tu viaje soñado con YO TE LLEVO.
            </p>
            <div className="max-w-2xl mx-auto mt-8">
              <div className="flex flex-col gap-4 p-4 rounded-lg shadow-lg md:flex-row bg-background/80 backdrop-blur-sm">
                <div className="relative flex-1">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input type="text" placeholder="¿A dónde querés ir?" className="pl-10" />
                </div>
                <div className="relative flex-1">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <DatePicker placeholder="Seleccioná una fecha" />
                </div>
                <Button className="w-full md:w-auto" size="lg">
                  <SearchIcon className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">Viajes Destacados</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Descubrí nuestras ofertas más populares y preparate para una experiencia inolvidable.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {featuredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
            <div className="flex justify-center">
              <Link href="/tours">
                <Button variant="outline">Ver todos los viajes</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
