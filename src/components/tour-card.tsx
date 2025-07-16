import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Tour } from "@/lib/types"
import { CalendarIcon, MapPinIcon, TicketIcon } from "lucide-react"

interface TourCardProps {
  tour: Tour
}

export function TourCard({ tour }: TourCardProps) {
  return (
    <Card className="w-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="relative">
          <Link href={`/booking/${tour.id}`} prefetch={false}>
            <Image
              src={tour.flyerUrl}
              alt={`Flyer for ${tour.destination}`}
              width={400}
              height={300}
              className="object-cover w-full h-48"
              data-ai-hint="travel flyer"
            />
          </Link>
        </div>
        <div className="p-6 space-y-4">
          <h3 className="text-2xl font-bold font-headline text-primary">{tour.destination}</h3>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date(tour.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Desde</p>
              <p className="text-3xl font-bold text-foreground">${tour.price.toLocaleString('es-AR')}</p>
            </div>
            <Link href={`/booking/${tour.id}`} prefetch={false}>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <TicketIcon className="w-4 h-4 mr-2" />
                Reservar
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
