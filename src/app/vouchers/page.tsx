
"use client"
import { useMemo } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Tag } from "lucide-react"
import { mockVouchers } from "@/lib/mock-data"
import type { Voucher } from "@/lib/types"

const VoucherCard = ({ voucher }: { voucher: Voucher }) => {
    const cardStyle = {
        width: `${voucher.width}px`,
        height: `${voucher.height}px`,
        backgroundColor: voucher.imageUrl ? 'transparent' : voucher.backgroundColor,
    };

    return (
        <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl group flex flex-col justify-between p-6 text-white"
            style={cardStyle}
        >
            {voucher.imageUrl && (
                 <Image 
                    src={voucher.imageUrl}
                    alt="Fondo del voucher" 
                    layout="fill" 
                    objectFit="cover" 
                    className="z-0 brightness-50 group-hover:brightness-75 transition-all duration-300"
                    data-ai-hint="abstract texture"
                />
            )}
            
            <div className="relative z-10 flex justify-between items-start">
                <div className="font-headline text-2xl tracking-wider uppercase">{voucher.title}</div>
                <Gift className="w-8 h-8 opacity-80"/>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
                {voucher.recipientName && <p className="text-sm opacity-80">Para: {voucher.recipientName}</p>}
                <p className="text-4xl lg:text-5xl font-bold mt-1 drop-shadow-lg">${voucher.value.toLocaleString('es-AR')}</p>
                <p className="font-mono text-lg tracking-widest mt-2 bg-black/30 px-3 py-1 rounded-md border border-white/20">{voucher.code}</p>
                {voucher.message && <p className="text-sm opacity-80 mt-2 italic">"{voucher.message}"</p>}
            </div>
            
            <div className="relative z-10 text-right">
                <p className="text-xs opacity-70">
                    Válido hasta: {format(new Date(voucher.expiryDate), "dd 'de' LLLL 'de' yyyy", { locale: es })}
                </p>
            </div>
        </div>
    );
};

export default function VouchersPage() {

  const activeVouchers = useMemo(() => {
    const now = new Date();
    // For now, we assume the user is not logged in.
    // In a real app with auth, you would check user status here.
    const isUserRegistered = false; 
    const userTripCount = 0;

    return mockVouchers.filter(v => {
      const isExpired = new Date(v.expiryDate) < now;
      if (v.status !== "Activo" || isExpired) {
        return false;
      }
      
      if (v.visibility === "all") {
        return true;
      }

      if (v.visibility === "registered" && isUserRegistered) {
        return userTripCount >= (v.minTrips || 0);
      }
      
      return false;
    });
  }, []);

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
            <div className="flex flex-wrap justify-center items-start gap-8">
              {activeVouchers.map(voucher => (
                <VoucherCard key={voucher.id} voucher={voucher} />
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>No hay vouchers disponibles por ahora</CardTitle>
                        <CardDescription className="text-lg">
                            ¡Vuelve pronto para no perderte nuestras próximas ofertas y promociones exclusivas!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild><a href="/tours">Ver próximos viajes</a></Button>
                    </CardContent>
                </Card>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
