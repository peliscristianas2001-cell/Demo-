
"use client"
import { useMemo, useState, useEffect } from "react"
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
    const { 
        title,
        code,
        value,
        recipientName,
        expiryDate,
        width,
        height,
        background,
        border,
        stripes,
        message
     } = voucher;

    const backgroundStyles: React.CSSProperties = {};
    if (background.type === 'solid') {
        backgroundStyles.backgroundColor = background.color;
    } else if (background.type === 'gradient') {
        backgroundStyles.background = `linear-gradient(to bottom right, ${background.color1}, ${background.color2})`;
    }

    const borderStyles: React.CSSProperties = {};
    if (border?.enabled) {
        borderStyles.border = `${border.width || 4}px solid ${border.color || '#ffffff'}`;
    }

    const cardStyle = {
        width: `${width}px`,
        height: `${height}px`,
        ...backgroundStyles,
        ...borderStyles
    };

    return (
        <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl group flex flex-col justify-between p-6 text-white"
            style={cardStyle}
        >
            {background.type === 'image' && background.imageUrl && (
                 <Image 
                    src={background.imageUrl}
                    alt="Fondo del voucher" 
                    layout="fill" 
                    objectFit="cover" 
                    className="z-0 brightness-50 group-hover:brightness-75 transition-all duration-300"
                    data-ai-hint="abstract texture"
                />
            )}
             {stripes?.enabled && (
                <>
                    <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: stripes.color || 'rgba(255,255,255,0.3)' }} />
                    <div className="absolute bottom-0 left-0 w-full h-4" style={{ backgroundColor: stripes.color || 'rgba(255,255,255,0.3)' }} />
                </>
            )}
            
            <div className="relative z-10 flex justify-between items-start">
                <div className="font-headline text-2xl tracking-wider uppercase">{title}</div>
                <Gift className="w-8 h-8 opacity-80"/>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
                {recipientName && <p className="text-sm opacity-80">Para: {recipientName}</p>}
                <p className="text-4xl lg:text-5xl font-bold mt-1 drop-shadow-lg">${value.toLocaleString('es-AR')}</p>
                <p className="font-mono text-lg tracking-widest mt-2 bg-black/30 px-3 py-1 rounded-md border border-white/20">{code}</p>
                {message && <p className="text-sm opacity-80 mt-2 italic">"{message}"</p>}
            </div>
            
            <div className="relative z-10 text-right">
                <p className="text-xs opacity-70">
                    Válido hasta: {format(new Date(expiryDate), "dd 'de' LLLL 'de' yyyy", { locale: es })}
                </p>
            </div>
        </div>
    );
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const storedVouchers = localStorage.getItem("ytl_vouchers")
    if (storedVouchers) {
      setVouchers(JSON.parse(storedVouchers, (key, value) => {
        if (key === 'expiryDate') return new Date(value);
        return value;
      }));
    } else {
      setVouchers(mockVouchers)
    }
  }, [])

  const activeVouchers = useMemo(() => {
    const now = new Date();
    // In a real app with auth, you would check user status here.
    // For now, we simulate a non-registered user.
    const isUserRegistered = false; 
    const userTripCount = 0;

    return vouchers.filter(v => {
      const isExpired = new Date(v.expiryDate) < now;
      if (v.status !== "Activo" || isExpired) {
        return false;
      }
      
      // If visibility is for everyone, show it.
      if (v.visibility === "all") {
        return true;
      }

      // If visibility is for registered users, check conditions.
      if (v.visibility === "registered" && isUserRegistered) {
        return userTripCount >= (v.minTrips || 0);
      }
      
      // By default, if none of the above conditions are met, don't show it.
      return false;
    });
  }, [vouchers]);

  if (!isClient) {
    return null; // Or a loading skeleton
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

    