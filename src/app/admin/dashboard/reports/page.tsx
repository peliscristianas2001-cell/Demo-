
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Plane, Building, Package, Users } from "lucide-react"
import { mockTours, mockReservations, mockSellers } from "@/lib/mock-data"
import type { Tour, Reservation, Seller } from "@/lib/types"

type CommissionDetail = {
    sellerId: string;
    sellerName: string;
    totalCommission: number;
}

type ReportData = {
    tour: Tour;
    totalIncome: number;
    totalCommission: number;
    commissionDetails: CommissionDetail[];
    totalFixedCosts: number;
    netProfit: number;
    reservationCount: number;
}

export default function ReportsPage() {
    const [tours, setTours] = useState<Tour[]>([])
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [sellers, setSellers] = useState<Seller[]>([])
    const [isClient, setIsClient] = useState(false)
    const [commissionModalData, setCommissionModalData] = useState<{ tour: Tour, details: CommissionDetail[] } | null>(null);


    useEffect(() => {
        setIsClient(true)
        const storedTours = localStorage.getItem("ytl_tours")
        const storedReservations = localStorage.getItem("ytl_reservations")
        const storedSellers = localStorage.getItem("ytl_sellers")
        
        setTours(storedTours ? JSON.parse(storedTours) : mockTours)
        setReservations(storedReservations ? JSON.parse(storedReservations) : mockReservations)
        setSellers(storedSellers ? JSON.parse(storedSellers) : mockSellers)
    }, [])

    const reportData = useMemo((): ReportData[] => {
        const activeTours = tours.filter(t => new Date(t.date) >= new Date());
        
        return activeTours.map(tour => {
            const tripReservations = reservations.filter(res => res.tripId === tour.id && res.status === 'Confirmado');
            
            const totalIncome = tripReservations.reduce((sum, res) => sum + res.finalPrice, 0);

            const commissionData = tripReservations.reduce((acc, res) => {
                const seller = sellers.find(s => s.id === res.sellerId);
                if (seller) {
                    const commissionAmount = res.finalPrice * (seller.commission / 100);
                    if (!acc.details[seller.id]) {
                        acc.details[seller.id] = { sellerId: seller.id, sellerName: seller.name, totalCommission: 0 };
                    }
                    acc.details[seller.id].totalCommission += commissionAmount;
                    acc.total += commissionAmount;
                }
                return acc;
            }, { total: 0, details: {} as Record<string, CommissionDetail> });

            const tourCosts = tour.costs || {};
            const transportCost = tourCosts.transport || 0;
            const hotelCost = tourCosts.hotel || 0;
            const extrasCost = (tourCosts.extras || []).reduce((sum, extra) => sum + extra.amount, 0);
            const totalFixedCosts = transportCost + hotelCost + extrasCost;

            const netProfit = totalIncome - commissionData.total - totalFixedCosts;

            return {
                tour,
                totalIncome,
                totalCommission: commissionData.total,
                commissionDetails: Object.values(commissionData.details),
                totalFixedCosts,
                netProfit,
                reservationCount: tripReservations.length
            };
        }).filter(data => data.reservationCount > 0 || data.totalFixedCosts > 0);
    }, [tours, reservations, sellers]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    }
    
    const handleOpenCommissionModal = (tour: Tour, details: CommissionDetail[]) => {
        setCommissionModalData({ tour, details });
    }

    if (!isClient) {
        return null;
    }

    return (
        <>
        <Dialog open={!!commissionModalData} onOpenChange={(isOpen) => !isOpen && setCommissionModalData(null)}>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalle de Comisiones Pagadas</DialogTitle>
                    <DialogDescription>
                        Desglose de comisiones para el viaje a {commissionModalData?.tour.destination}.
                    </DialogDescription>
                </DialogHeader>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vendedor/a</TableHead>
                            <TableHead className="text-right">Comisión a Pagar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {commissionModalData?.details.map(detail => (
                            <TableRow key={detail.sellerId}>
                                <TableCell className="font-medium">{detail.sellerName}</TableCell>
                                <TableCell className="text-right">{formatCurrency(detail.totalCommission)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setCommissionModalData(null)}>Cerrar</Button>
                </DialogFooter>
             </DialogContent>
        </Dialog>

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
                    {reportData.map(({ tour, totalIncome, totalCommission, commissionDetails, totalFixedCosts, netProfit, reservationCount }) => (
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
                                    <div className="bg-secondary/20 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                       <InfoCard 
                                            title="Ingresos Totales" 
                                            value={formatCurrency(totalIncome)} 
                                            icon={TrendingUp} 
                                            color="text-green-600"
                                            description="Suma de todos los pagos recibidos."
                                       />
                                       <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenCommissionModal(tour, commissionDetails)}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Comisiones Pagadas</CardTitle>
                                                <Users className="h-5 w-5 text-red-600" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
                                                <p className="text-xs text-muted-foreground">Clic para ver detalle por vendedora.</p>
                                            </CardContent>
                                        </Card>
                                       <InfoCard 
                                            title="Gastos Fijos" 
                                            value={formatCurrency(totalFixedCosts)} 
                                            icon={Package} 
                                            color="text-orange-600"
                                            description="Transporte, hotel y extras."
                                       />
                                       <InfoCard 
                                            title="Ganancia Neta" 
                                            value={formatCurrency(netProfit)} 
                                            icon={DollarSign} 
                                            color="text-primary"
                                            description="Ingresos menos gastos."
                                        />
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
        </>
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

    