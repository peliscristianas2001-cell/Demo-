
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
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
import { BarChart3, TrendingUp, DollarSign, Plane, Users, PlusCircle, Trash2, Package, Banknote } from "lucide-react"
import { mockTours, mockReservations, mockSellers } from "@/lib/mock-data"
import type { Tour, Reservation, Seller, CustomExpense } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

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
    const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([])
    const [isClient, setIsClient] = useState(false)
    const [commissionModalData, setCommissionModalData] = useState<{ tour: Tour, details: CommissionDetail[] } | null>(null);
    const [monthlyExpenseModalOpen, setMonthlyExpenseModalOpen] = useState(false);
    const [newCustomExpense, setNewCustomExpense] = useState({ description: "", amount: "" });
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true)
        const storedTours = localStorage.getItem("ytl_tours")
        const storedReservations = localStorage.getItem("ytl_reservations")
        const storedSellers = localStorage.getItem("ytl_sellers")
        const storedCustomExpenses = localStorage.getItem("ytl_custom_expenses")
        
        setTours(storedTours ? JSON.parse(storedTours) : mockTours)
        setReservations(storedReservations ? JSON.parse(storedReservations) : mockReservations)
        setSellers(storedSellers ? JSON.parse(storedSellers) : mockSellers)
        setCustomExpenses(storedCustomExpenses ? JSON.parse(storedCustomExpenses) : [])
    }, [])
    
     useEffect(() => {
        if (isClient) {
            localStorage.setItem("ytl_custom_expenses", JSON.stringify(customExpenses));
        }
    }, [customExpenses, isClient]);

    const reportData = useMemo((): ReportData[] => {
        const activeTours = tours.filter(t => new Date(t.date) >= new Date());
        
        return activeTours.map(tour => {
            const tripReservations = reservations.filter(res => res.tripId === tour.id && res.status === 'Confirmado');
            
            const totalIncome = tripReservations.reduce((sum, res) => sum + res.finalPrice, 0);

            const commissionData = tripReservations.reduce((acc, res) => {
                const seller = sellers.find(s => s.id === res.sellerId);
                if (seller) {
                    const commissionAmount = res.finalPrice * (seller.fixedCommissionRate || 0 / 100);
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

            const totalExpenses = totalFixedCosts + (commissionData.total > 0 ? commissionData.total : 0);
            const netProfit = totalIncome - totalExpenses;

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

    const monthlyReport = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyTours = tours.filter(t => {
            const tourDate = new Date(t.date);
            return tourDate.getMonth() === currentMonth && tourDate.getFullYear() === currentYear;
        });

        const monthlyTripIds = new Set(monthlyTours.map(t => t.id));
        const monthlyReservations = reservations.filter(r => monthlyTripIds.has(r.tripId) && r.status === 'Confirmado');

        const transportCosts = monthlyTours.reduce((sum, t) => sum + (t.costs?.transport || 0), 0);
        const hotelCosts = monthlyTours.reduce((sum, t) => sum + (t.costs?.hotel || 0), 0);
        const extraCosts = monthlyTours.flatMap(t => t.costs?.extras || []);

        const commissionCosts = monthlyReservations.reduce((sum, res) => {
            const seller = sellers.find(s => s.id === res.sellerId);
            if (seller) {
                return sum + (res.finalPrice * ((seller.fixedCommissionRate || 0) / 100));
            }
            return sum;
        }, 0);
        
        const manualExpenses = customExpenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });

        const totalManualExpenses = manualExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalNetExpense = transportCosts + hotelCosts + extraCosts.reduce((s, e) => s + e.amount, 0) + (commissionCosts > 0 ? commissionCosts : 0) + totalManualExpenses;
        
        return {
            transportCosts,
            hotelCosts,
            extraCosts,
            commissionCosts,
            manualExpenses,
            totalNetExpense
        };
    }, [tours, reservations, sellers, customExpenses]);
    
    const handleAddCustomExpense = () => {
        if (!newCustomExpense.description || !newCustomExpense.amount) {
            toast({ title: "Datos incompletos", description: "Por favor, añade descripción y monto.", variant: "destructive" });
            return;
        }
        const expenseToAdd: CustomExpense = {
            id: `CE-${Date.now()}`,
            description: newCustomExpense.description,
            amount: parseFloat(newCustomExpense.amount),
            date: new Date()
        };
        setCustomExpenses(prev => [...prev, expenseToAdd]);
        setNewCustomExpense({ description: "", amount: "" });
    }

    const handleDeleteCustomExpense = (id: string) => {
        setCustomExpenses(prev => prev.filter(e => e.id !== id));
    }

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
        
        <Dialog open={monthlyExpenseModalOpen} onOpenChange={setMonthlyExpenseModalOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Desglose de Gastos del Mes</DialogTitle>
                    <DialogDescription>Aquí se detallan todos los gastos registrados en el mes actual.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Costos de Viajes</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                           <InfoRow label="Comisiones Pagadas" value={formatCurrency(monthlyReport.commissionCosts)} />
                           <InfoRow label="Transporte" value={formatCurrency(monthlyReport.transportCosts)} />
                           <InfoRow label="Hotel" value={formatCurrency(monthlyReport.hotelCosts)} />
                           <Accordion type="single" collapsible>
                             <AccordionItem value="extras">
                               <AccordionTrigger className="text-sm">Gastos Extras ({monthlyReport.extraCosts.length})</AccordionTrigger>
                               <AccordionContent>
                                {monthlyReport.extraCosts.map(e => <InfoRow key={e.id} label={e.description} value={formatCurrency(e.amount)}/>)}
                               </AccordionContent>
                             </AccordionItem>
                           </Accordion>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Gastos Manuales</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2 mb-4">
                                {monthlyReport.manualExpenses.map(e => (
                                    <div key={e.id} className="flex items-center gap-2">
                                        <div className="flex-grow"><InfoRow label={e.description} value={formatCurrency(e.amount)}/></div>
                                        <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDeleteCustomExpense(e.id)}>
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                             <div className="p-4 border rounded-lg space-y-2">
                                <Label>Añadir Nuevo Gasto Manual</Label>
                                <div className="flex items-center gap-2">
                                    <Input placeholder="Descripción..." value={newCustomExpense.description} onChange={e => setNewCustomExpense({...newCustomExpense, description: e.target.value})}/>
                                    <Input type="number" placeholder="Monto" className="w-32" value={newCustomExpense.amount} onChange={e => setNewCustomExpense({...newCustomExpense, amount: e.target.value})}/>
                                    <Button onClick={handleAddCustomExpense} size="icon" className="flex-shrink-0">
                                        <PlusCircle className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setMonthlyExpenseModalOpen(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Reportes Financieros</h2>
                    <p className="text-muted-foreground">
                        Analiza los ingresos, gastos y ganancias de cada viaje activo.
                    </p>
                </div>
                <Button variant="outline" onClick={() => setMonthlyExpenseModalOpen(true)}>
                    <div className="flex flex-col items-end">
                       <span className="font-bold">Gasto Neto Mensual</span>
                       <span className="text-destructive">{formatCurrency(monthlyReport.totalNetExpense)}</span>
                    </div>
                </Button>
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
                <Accordion type="multiple" className="w-full space-y-4" defaultValue={reportData.map(r=>r.tour.id)}>
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
                                       <Card className="cursor-pointer hover:bg-muted/50" onClick={() => totalCommission > 0 && handleOpenCommissionModal(tour, commissionDetails)}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Comisiones Pagadas</CardTitle>
                                                <Users className="h-5 w-5 text-red-600" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
                                                <p className="text-xs text-muted-foreground">{totalCommission > 0 ? "Clic para ver detalle por vendedora." : "Sin comisiones para este viaje."}</p>
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
                                            icon={Banknote} 
                                            color="text-primary"
                                            description="Ingresos menos gastos y comisiones."
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
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-sm">
    <p className="text-muted-foreground">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);
    
