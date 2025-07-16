
"use client"
import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { TourCard } from "@/components/tour-card"
import { mockTours } from "@/lib/mock-data"
import { CalendarIcon, MapPinIcon, SearchIcon, ArrowRight, PlaneIcon, SparklesIcon } from "lucide-react"
import type { Tour } from "@/lib/types"

export default function Home() {
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
  const featuredTours = activeTours.slice(0, 3);
  
  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative w-full h-[70vh] md:h-[90vh] flex items-center justify-center text-center text-white overflow-hidden">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Destino destacado"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-[-1] brightness-[0.6]"
            data-ai-hint="tropical beach sunset"
            priority
          />
          <div className="container px-4 md:px-6 z-10">
            <h1 className="text-4xl sm:text-5xl font-headline tracking-tight md:text-7xl lg:text-8xl drop-shadow-2xl animate-fade-in-down">
              Tu Próxima Aventura Comienza Aquí
            </h1>
            <p className="max-w-3xl mx-auto mt-4 text-base sm:text-lg md:text-xl text-white/90 drop-shadow-lg animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
              Explora los destinos más increíbles. Encontrá tu viaje soñado con YO TE LLEVO.
            </p>
            <div className="max-w-3xl mx-auto mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col gap-4 p-4 rounded-2xl shadow-2xl md:flex-row bg-background/80 backdrop-blur-lg border border-white/20">
                <div className="relative flex-1">
                  <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input type="text" placeholder="¿A dónde querés ir?" className="pl-12 h-14 bg-white/80 text-lg border-2 border-transparent focus:border-primary focus:bg-white" />
                </div>
                <div className="relative flex-1">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                   <DatePicker placeholder="Seleccioná una fecha" className="h-14 pl-12 bg-white/80 text-lg border-2 border-transparent focus:border-primary focus:bg-white" />
                </div>
                <Button className="w-full md:w-auto h-14 text-lg" size="lg">
                  <SearchIcon className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                 <div className="inline-block px-4 py-1 text-sm font-semibold tracking-wider rounded-full bg-primary/10 text-primary">
                  OFERTAS IMPERDIBLES
                </div>
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">Viajes Destacados</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Descubrí nuestras ofertas más populares y preparate para una experiencia inolvidable.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
              {featuredTours.map((tour, i) => (
                <div key={tour.id} className="animate-fade-in-up" style={{ animationDelay: `${0.2 * (i + 1)}s` }}>
                    <TourCard tour={tour} />
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Link href="/tours">
                <Button variant="outline" size="lg" className="text-base">
                  Ver todos los viajes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-24">
            <div className="grid items-center gap-12 md:grid-cols-2">
                <div className="animate-fade-in-up">
                    <div className="inline-block px-4 py-1 text-sm font-semibold tracking-wider rounded-full bg-primary/10 text-primary">
                        SOBRE NOSOTROS
                    </div>
                    <h2 className="mt-4 text-4xl font-bold tracking-tighter font-headline text-primary sm:text-5xl">Viajes grupales, experiencias únicas</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        En "YO TE LLEVO" creemos que viajar es más que visitar un lugar, es vivirlo. Nos especializamos en crear viajes grupales económicos, llenos de buena onda y momentos que recordarás para siempre.
                    </p>
                     <p className="mt-4 text-lg text-muted-foreground">
                        Con nosotros, no solo descubrís un destino, te sumas a una comunidad de viajeros. ¡La aventura te espera!
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-2"><PlaneIcon className="w-5 h-5 text-primary" /><span>Coordinación Permanente</span></div>
                        <div className="flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-primary" /><span>La Mejor Onda</span></div>
                    </div>
                </div>
                <div className="relative w-full h-80 lg:h-96 animate-fade-in-up" style={{ animationDelay: "0.2s"}}>
                     <Image src="https://placehold.co/600x400.png" alt="Grupo de amigos viajando" className="object-cover rounded-2xl shadow-2xl" layout="fill" data-ai-hint="friends traveling" />
                </div>
            </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  )
}
