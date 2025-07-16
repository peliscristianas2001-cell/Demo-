
"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, ArrowRight } from "lucide-react"
import type { VoucherSettings } from "@/lib/types"

export default function VouchersPage() {
  const [settings, setSettings] = useState<VoucherSettings | null>(null);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("ytl_voucher_settings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      } else {
        setSettings({ visibility: 'all', minTrips: 1 }); // Default if no settings found
      }
    } catch (error) {
      console.error("Failed to load voucher settings", error)
      setSettings({ visibility: 'all', minTrips: 1 });
    }
  }, []);

  // In a real app with user authentication, you would check the user's status here.
  // For now, we'll just simulate the logic based on the settings.
  const showVouchers = settings?.visibility === 'all'; 
  // A real implementation would be:
  // const showVouchers = settings?.visibility === 'all' || (isUserLoggedIn && user.completedTrips >= settings.minTrips);

  if (!showVouchers) {
     return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <SiteHeader />
            <main className="flex-1 flex items-center justify-center">
                <div className="container py-12 md:py-24 text-center">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle>Vouchers Exclusivos</CardTitle>
                            <CardDescription className="text-lg">
                                ¡Tenemos sorpresas para nuestros viajeros frecuentes! Inicia sesión para ver si tienes vouchers disponibles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button>Iniciar Sesión</Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <SiteFooter />
        </div>
     )
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-12 md:py-24">
          <div className="mx-auto max-w-4xl">
            <Card className="overflow-hidden shadow-2xl md:grid md:grid-cols-2">
              <div className="relative h-64 md:h-full">
                 <Image 
                    src="https://placehold.co/600x800.png"
                    alt="Tarjeta de Regalo"
                    layout="fill"
                    objectFit="cover"
                    className="brightness-90"
                    data-ai-hint="gift card travel"
                 />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-4xl font-headline text-primary">
                    <Gift className="w-10 h-10" />
                    ¡Regalá una Aventura!
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mt-2">
                    Nuestras Gift Cards son el regalo perfecto para cualquier amante de los viajes. Sorprendé a esa persona especial con una experiencia que nunca olvidará.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">
                    Las Gift Cards son válidas para cualquier destino y no tienen fecha de vencimiento. Podés elegir el monto que quieras regalar y la persona agasajada podrá canjearlo por el viaje que más le guste.
                  </p>
                  <Button size="lg" className="w-full text-lg h-12 group">
                    Comprar Gift Card
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
