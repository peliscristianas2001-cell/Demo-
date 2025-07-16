
"use client"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, ArrowRight, Tag } from "lucide-react"
import { mockVouchers } from "@/lib/mock-data"
import type { Voucher, VoucherSettings } from "@/lib/types"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

const VoucherCard = ({ voucher }: { voucher: Voucher }) => {
    switch (voucher.layout) {
        case "modern":
            return <ModernVoucherCard voucher={voucher} />;
        case "minimal":
            return <MinimalVoucherCard voucher={voucher} />;
        case "classic":
        default:
            return <ClassicVoucherCard voucher={voucher} />;
    }
};

const ClassicVoucherCard = ({ voucher }: { voucher: Voucher }) => (
  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-2xl group flex flex-col justify-between p-6 text-white bg-gray-900">
    <Image 
      src={voucher.imageUrl || "https://placehold.co/600x400.png"}
      alt="Fondo del voucher" 
      layout="fill" 
      objectFit="cover" 
      className="z-0 brightness-50 group-hover:brightness-75 transition-all duration-300"
      data-ai-hint="abstract texture"
    />
    
    <div className="relative z-10 flex justify-between items-start">
      <div className="font-headline text-2xl tracking-wider uppercase">{voucher.title}</div>
      <Gift className="w-8 h-8 opacity-80"/>
    </div>

    <div className="relative z-10 flex flex-col items-center text-center">
      {voucher.recipientName && <p className="text-sm opacity-80">Para: {voucher.recipientName}</p>}
      <p className="text-4xl lg:text-5xl font-bold mt-1 text-amber-300 drop-shadow-lg">${voucher.value.toLocaleString('es-AR')}</p>
      <p className="font-mono text-lg tracking-widest mt-2 bg-black/30 px-3 py-1 rounded-md border border-white/20">{voucher.code}</p>
      {voucher.message && <p className="text-sm opacity-80 mt-2 italic">"{voucher.message}"</p>}
    </div>
    
    <div className="relative z-10 text-right">
      <p className="text-xs opacity-70">
        Válido hasta: {format(voucher.expiryDate, "dd 'de' LLLL 'de' yyyy", { locale: es })}
      </p>
    </div>
  </div>
);

const ModernVoucherCard = ({ voucher }: { voucher: Voucher }) => (
    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-2xl group flex bg-gradient-to-br from-primary/80 to-accent/90">
        <div className="w-2/3 p-6 flex flex-col justify-between text-white">
            <div>
                <h3 className="font-headline text-2xl uppercase tracking-wider">{voucher.title}</h3>
                <p className="text-sm opacity-80">De: {voucher.senderName || "YO TE LLEVO"}</p>
            </div>
            <div>
                 <p className="font-mono text-xl tracking-widest bg-black/20 px-4 py-2 rounded-lg inline-block">{voucher.code}</p>
                 <p className="text-xs opacity-70 mt-2">
                    Vence: {format(voucher.expiryDate, "dd/MM/yyyy", { locale: es })}
                </p>
            </div>
        </div>
         <div className="w-1/3 bg-white/90 flex flex-col items-center justify-center text-center text-primary p-4">
            <p className="text-sm">Valor</p>
            <p className="text-4xl font-bold">${voucher.value.toLocaleString('es-AR')}</p>
            {voucher.recipientName && <p className="text-xs mt-2">Para: {voucher.recipientName}</p>}
        </div>
    </div>
);

const MinimalVoucherCard = ({ voucher }: { voucher: Voucher }) => (
     <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-2xl group flex flex-col justify-center items-center p-6 text-center bg-secondary/30 border-2 border-dashed border-primary/50">
        <h3 className="font-headline text-2xl uppercase tracking-wider text-primary">{voucher.title}</h3>
        <p className="text-5xl font-bold my-4 text-foreground">${voucher.value.toLocaleString('es-AR')}</p>
        <p className="font-mono text-lg tracking-widest bg-background px-4 py-2 rounded-lg border">{voucher.code}</p>
         <p className="text-xs text-muted-foreground mt-4">
            Válido hasta: {format(voucher.expiryDate, "dd/MM/yyyy", { locale: es })}
        </p>
    </div>
);


export default function VouchersPage() {
  const [settings, setSettings] = useState<VoucherSettings | null>(null);

  const activeVouchers = useMemo(() => {
    const now = new Date();
    return mockVouchers.filter(v => 
      v.status === "Activo" && 
      new Date(v.expiryDate) >= now
    );
  }, []);

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
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary flex items-center gap-4">
                <Tag className="w-10 h-10" />
                Vouchers Disponibles
              </h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                ¡Aprovechá estos descuentos para tu próxima aventura! Mencioná el código al momento de contactarnos por WhatsApp para realizar tu reserva.
              </p>
            </div>
          </div>
          {activeVouchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeVouchers.map(voucher => (
                <VoucherCard key={voucher.id} voucher={voucher} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Por el momento no hay vouchers disponibles. ¡Vuelve a consultar pronto!</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
