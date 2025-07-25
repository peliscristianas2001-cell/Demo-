
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Plane } from "lucide-react"
import { mockTours, mockReservations, mockSellers } from "@/lib/mock-data"
import type { Tour, Reservation, Seller } from "@/lib/types"

type ReportData = {
    tour: Tour;
    totalIncome: number;
    totalCommission: number;
    netProfit: number;
    reservationCount: number;
}

export default function ReportsPage() {
    const [tours, setTours] = useState<Tour[]>([])
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [sellers, setSellers] = useState<Seller[]>([])
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        const storedTours = localStorage.getItem("ytl_tours")
        const storedReservations = localStorage.getItem("ytl_reservations")
        const storedSellers = localStorage.getItem("ytl_sellers")
        
        setTours(storedTours ? JSON.parse(storedTours) : mockTours)
        setReservations(storedReservations ? JSON.parse(storedReservations) : mockReservations)
        setSellers(storedSellers ? JSON.parse(storedSellers) : mockSellers)
    }, [])

    const reportData = useMemo(() => {
        const activeTours = tours.filter(t => new Date(t.date) >= new Date());
        
        return activeTours.map(tour => {
            const tripReservations = reservations.filter(res => res.tripId === tour.id && res.status === 'Confirmado');
            
            const totalIncome = tripReservations.reduce((sum, res) => sum + res.finalPrice, 0);

            const totalCommission = tripReservations.reduce((sum, res) => {
                const seller = sellers.find(s => s.id === res.sellerId);
                if (seller) {
                    return sum + (res.finalPrice * (seller.commission / 100));
                }
                return sum;
            }, 0);

            const netProfit = totalIncome - totalCommission;

            return {
                tour,
                totalIncome,
                totalCommission,
                netProfit,
                reservationCount: tripReservations.length
            };
        }).filter(data => data.reservationCount > 0);
    }, [tours, reservations, sellers]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    }

    if (!isClient) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Reportes Financieros</h2>
                <p className="text-muted-foreground">
                    Analiza los ingresos, gastos y ganancias de cada viaje activo.
                </p>
            </div>
             {reportData.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center flex flex-col items-center gap-4">
                        <BarChart3 className="w-16 h-16 text-muted-foreground/50"/>
                        <p className="text-muted-foreground">
                            No hay datos financieros para mostrar de los viajes activos.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Accordion type="multiple" className="w-full space-y-4">
                    {reportData.map(({ tour, totalIncome, totalCommission, netProfit, reservationCount }) => (
                        <AccordionItem value={tour.id} key={tour.id} className="border-b-0">
                            <Card className="overflow-hidden">
                                <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            <Plane className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{tour.destination}</p>
                                            <p className="text-sm text-muted-foreground">{reservationCount} reservas confirmadas</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="bg-secondary/20 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                       <InfoCard 
                                            title="Ingresos Totales" 
                                            value={formatCurrency(totalIncome)} 
                                            icon={TrendingUp} 
                                            color="text-green-600"
                                            description="Suma de todos los pagos recibidos."
                                       />
                                       <InfoCard 
                                            title="Comisiones Pagadas" 
                                            value={formatCurrency(totalCommission)} 
                                            icon={TrendingDown} 
                                            color="text-red-600"
                                            description="Total pagado a vendedoras."
                                       />
                                       <InfoCard 
                                            title="Ganancia Neta" 
                                            value={formatCurrency(netProfit)} 
                                            icon={DollarSign} 
                                            color="text-primary"
                                            description="Ingresos menos comisiones."
                                        />
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    )
}

interface InfoCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    description: string;
}

const InfoCard = ({ title, value, icon: Icon, color, description }: InfoCardProps) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${color}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
)
