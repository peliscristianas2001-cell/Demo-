
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
import { BarChart3, TrendingUp, DollarSign, Plane, Users, PlusCircle, Trash2, Package, Banknote, TrendingDown, HandCoins, MountainSnow, Wallet, BookMarked, AlertCircle, Pencil, Bus, Ship } from "lucide-react"
import { mockTours, mockReservations, mockSellers } from "@/lib/mock-data"
import type { Tour, Reservation, Seller, CustomExpense, ExternalCommission, ExcursionIncome, HistoryItem } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HistoryViewer } from "@/components/admin/history-viewer"

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

type ModalType = 'expenses' | 'commissions' | 'excursions' | 'netIncome' | 'commissionsPaid' | null;


export default function ReportsPage() {
    const [tours, setTours] = useState<Tour[]>([])
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([])
    const [externalCommissions, setExternalCommissions] = useState<ExternalCommission[]>([]);
    const [excursionIncomes, setExcursionIncomes] = useState<ExcursionIncome[]>([]);
    const [isClient, setIsClient] = useState(false)
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [commissionModalData, setCommissionModalData] = useState<{ tour: Tour, details: CommissionDetail[] } | null>(null);
    const [newItem, setNewItem] = useState({ description: "", amount: "" });
    const { toast } = useToast();
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [hasDueItems, setHasDueItems] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);


    useEffect(() => {
        setIsClient(true)
        const storedTours = localStorage.getItem("ytl_tours")
        const storedReservations = localStorage.getItem("ytl_reservations")
        const storedSellers = localStorage.getItem("ytl_sellers")
        const storedCustomExpenses = localStorage.getItem("ytl_custom_expenses")
        const storedExternalCommissions = localStorage.getItem("ytl_external_commissions");
        const storedExcursionIncomes = localStorage.getItem("ytl_excursion_incomes");
        
        setTours(storedTours ? JSON.parse(storedTours) : mockTours)
        setReservations(storedReservations ? JSON.parse(storedReservations) : mockReservations)
        setSellers(storedSellers ? JSON.parse(storedSellers) : mockSellers)
        setCustomExpenses(storedCustomExpenses ? JSON.parse(storedCustomExpenses) : [])
        setExternalCommissions(storedExternalCommissions ? JSON.parse(storedExternalCommissions) : []);
        setExcursionIncomes(storedExcursionIncomes ? JSON.parse(storedExcursionIncomes) : []);

        // Archiving logic
        const now = new Date();
        const activeTours = storedTours ? JSON.parse(storedTours) : mockTours;
        const pastTours = activeTours.filter((t: Tour) => new Date(t.date) < now);
        
        if (pastTours.length > 0) {
            const reportHistory: HistoryItem[] = JSON.parse(localStorage.getItem("ytl_report_history") || "[]");
            const newHistoryItems: HistoryItem[] = [];

            pastTours.forEach((tour: Tour) => {
                if (!reportHistory.some(h => h.id === tour.id)) {
                    // This tour hasn't been archived yet, create a report for it
                    const tripReservations = reservations.filter(res => res.tripId === tour.id && res.status === 'Confirmado');
                    const totalIncome = tripReservations.reduce((sum, res) => sum + res.finalPrice, 0);
                    const tourCosts = tour.costs || {};
                    const transportCost = tourCosts.transport || 0;
                    const hotelCost = tourCosts.hotel || 0;
                    const extrasCost = (tourCosts.extras || []).reduce((sum, extra) => sum + extra.amount, 0);
                    const totalFixedCosts = transportCost + hotelCost + extrasCost;

                    const report: ReportData = {
                        tour: tour,
                        totalIncome: totalIncome,
                        totalCommission: 0, // Simplified for history
                        commissionDetails: [],
                        totalFixedCosts: totalFixedCosts,
                        netProfit: totalIncome - totalFixedCosts,
                        reservationCount: tripReservations.length,
                    };
                    
                    newHistoryItems.push({
                        id: tour.id,
                        name: `${tour.destination} - ${new Date(tour.date).toLocaleDateString()}`,
                        data: report,
                        savedAt: new Date().toISOString(),
                    });
                }
            });

            if (newHistoryItems.length > 0) {
                const updatedHistory = [...reportHistory, ...newHistoryItems];
                localStorage.setItem("ytl_report_history", JSON.stringify(updatedHistory));
                // Remove archived tours from active list
                const remainingTours = activeTours.filter((t: Tour) => new Date(t.date) >= now);
                localStorage.setItem("ytl_tours", JSON.stringify(remainingTours));
                setTours(remainingTours);
                window.dispatchEvent(new Event('storage'));
                toast({ title: `${newHistoryItems.length} reporte(s) archivado(s).`, description: "Los viajes pasados se han movido al historial." });
            }
        }

    }, [])
    
     useEffect(() => {
        if (isClient) {
            localStorage.setItem("ytl_custom_expenses", JSON.stringify(customExpenses));
            localStorage.setItem("ytl_external_commissions", JSON.stringify(externalCommissions));
            localStorage.setItem("ytl_excursion_incomes", JSON.stringify(excursionIncomes));
        }
    }, [customExpenses, externalCommissions, excursionIncomes, isClient]);

    const reportData = useMemo((): ReportData[] => {
        const activeTours = tours.filter(t => new Date(t.date) >= new Date());
        
        return activeTours.map(tour => {
            const tripReservations = reservations.filter(res => res.tripId === tour.id && res.status === 'Confirmado');
            
            const totalIncome = tripReservations.reduce((sum, res) => sum + res.finalPrice, 0);

            const commissionData = tripReservations.reduce((acc, res) => {
                const seller = sellers.find(s => s.id === res.sellerId);
                if (seller) {
                    const commissionAmount = res.finalPrice * ((seller.fixedCommissionRate || 0) / 100);
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

            const totalExpenses = totalFixedCosts + commissionData.total;
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

        const monthlyToursData = reportData.filter(rd => {
            const tourDate = new Date(rd.tour.date);
            return tourDate.getMonth() === currentMonth && tourDate.getFullYear() === currentYear;
        });

        // INCOMES
        const totalProfitFromTrips = monthlyToursData.reduce((sum, rd) => sum + rd.netProfit, 0);
        const monthlyExternalCommissions = externalCommissions.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear);
        const totalCommissionIncome = monthlyExternalCommissions.reduce((sum, e) => sum + e.amount, 0);
        const monthlyExcursionIncomes = excursionIncomes.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear);
        const totalExcursionIncome = monthlyExcursionIncomes.reduce((sum, e) => sum + e.amount, 0);

        // EXPENSES
        const monthlyManualExpenses = customExpenses.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear);
        const totalManualExpenses = monthlyManualExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        const totalTripCommissionsPaid = monthlyToursData.reduce((sum, rd) => sum + rd.totalCommission, 0);
        
        const costsByTransportType = monthlyToursData.reduce((acc, rd) => {
            const transportCost = rd.tour.costs?.transport || 0;
            if(transportCost > 0 && rd.tour.transportUnits){
                rd.tour.transportUnits.forEach(unit => {
                    acc[unit.category] = (acc[unit.category] || 0) + (transportCost / rd.tour.transportUnits!.length); // Distribute cost if multiple units
                })
            }
            return acc;
        }, {} as Record<string, number>);

        const totalHotelCost = monthlyToursData.reduce((sum, rd) => sum + (rd.tour.costs?.hotel || 0), 0);
        const monthlyTotalExtrasCost = monthlyToursData.flatMap(rd => rd.tour.costs?.extras || []);

        const totalNetExpense = Object.values(costsByTransportType).reduce((a,b) => a+b, 0) 
            + totalHotelCost 
            + monthlyTotalExtrasCost.reduce((sum, extra) => sum + extra.amount, 0)
            + totalTripCommissionsPaid 
            + totalManualExpenses;
        
        // NET INCOME
        const totalGrossIncome = totalProfitFromTrips + totalCommissionIncome + totalExcursionIncome;
        const totalNetIncome = totalGrossIncome - totalManualExpenses;
        
        return {
            totalNetExpense,
            totalCommissionIncome,
            monthlyExternalCommissions,
            totalExcursionIncome,
            monthlyExcursionIncomes,
            totalNetIncome,
            monthlyToursData,
            monthlyManualExpenses,
            costsByTransportType,
            totalHotelCost,
            monthlyTotalExtrasCost,
            totalTripCommissionsPaid
        };
    }, [reportData, customExpenses, externalCommissions, excursionIncomes]);
    
    const handleAddItem = (type: 'expense' | 'commission' | 'excursion') => {
        if (!newItem.description || !newItem.amount) {
            toast({ title: "Datos incompletos", description: "Por favor, añade descripción y monto.", variant: "destructive" });
            return;
        }

        if (type === 'expense') {
            if (editingExpenseId) {
                // Edit existing expense
                setCustomExpenses(prev => prev.map(e => e.id === editingExpenseId ? { ...e, description: newItem.description, amount: parseFloat(newItem.amount) } : e));
                setEditingExpenseId(null);
            } else {
                // Add new expense
                const itemToAdd = {
                    id: `ITEM-${Date.now()}`,
                    description: newItem.description,
                    amount: parseFloat(newItem.amount),
                    date: new Date()
                };
                setCustomExpenses(prev => [...prev, itemToAdd]);
            }
        } else {
             const itemToAdd = {
                id: `ITEM-${Date.now()}`,
                description: newItem.description,
                amount: parseFloat(newItem.amount),
                date: new Date()
            };
            if (type === 'commission') setExternalCommissions(prev => [...prev, itemToAdd]);
            else if (type === 'excursion') setExcursionIncomes(prev => [...prev, itemToAdd]);
        }
        
        setNewItem({ description: "", amount: "" });
    }

    const handleEditItem = (expense: CustomExpense) => {
        setEditingExpenseId(expense.id);
        setNewItem({ description: expense.description, amount: String(expense.amount) });
    };

    const handleCancelEdit = () => {
        setEditingExpenseId(null);
        setNewItem({ description: "", amount: "" });
    }

    const handleDeleteItem = (id: string, type: 'expense' | 'commission' | 'excursion') => {
        if(type === 'expense') setCustomExpenses(prev => prev.filter(e => e.id !== id));
        else if (type === 'commission') setExternalCommissions(prev => prev.filter(e => e.id !== id));
        else if (type === 'excursion') setExcursionIncomes(prev => prev.filter(e => e.id !== id));
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    }
    
    const handleOpenCommissionModal = (tour: Tour, details: CommissionDetail[]) => {
        setActiveModal('commissionsPaid');
        setCommissionModalData({ tour, details });
    }

    if (!isClient) {
        return null;
    }

    return (
        <>
         {/* -- MODALS -- */}
        <Dialog open={activeModal === 'commissionsPaid'} onOpenChange={(isOpen) => !isOpen && setActiveModal(null)}>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalle de Comisiones Pagadas</DialogTitle>
                    <DialogDescription>Desglose de comisiones para el viaje a {commissionModalData?.tour.destination}.</DialogDescription>
                </DialogHeader>
                 <Table>
                    <TableHeader><TableRow><TableHead>Vendedor/a</TableHead><TableHead className="text-right">Comisión a Pagar</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {commissionModalData?.details.map(detail => (
                            <TableRow key={detail.sellerId}><TableCell className="font-medium">{detail.sellerName}</TableCell><TableCell className="text-right">{formatCurrency(detail.totalCommission)}</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
                <DialogFooter><Button variant="outline" onClick={() => setActiveModal(null)}>Cerrar</Button></DialogFooter>
             </DialogContent>
        </Dialog>
        
        <Dialog open={activeModal === 'expenses'} onOpenChange={(isOpen) => !isOpen && setActiveModal(null)}>
            <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Desglose de Gastos del Mes</DialogTitle><DialogDescription>Aquí se detallan todos los gastos registrados en el mes actual.</DialogDescription></DialogHeader>
                <ScrollArea className="h-[60vh]"><div className="py-4 space-y-4 pr-6">
                    <Card><CardHeader><CardTitle className="text-base">Costos de Viajes del Mes</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                             {monthlyReport.costsByTransportType.vehicles > 0 && <InfoRow label="Costo Micros" value={formatCurrency(monthlyReport.costsByTransportType.vehicles)} />}
                             {monthlyReport.costsByTransportType.airplanes > 0 && <InfoRow label="Costo Aviones" value={formatCurrency(monthlyReport.costsByTransportType.airplanes)} />}
                             {monthlyReport.costsByTransportType.cruises > 0 && <InfoRow label="Costo Cruceros" value={formatCurrency(monthlyReport.costsByTransportType.cruises)} />}
                             {monthlyReport.totalHotelCost > 0 && <InfoRow label="Costo Total Hotel" value={formatCurrency(monthlyReport.totalHotelCost)} />}
                             {monthlyReport.totalTripCommissionsPaid > 0 && <InfoRow label="Total Comisiones Pagadas" value={formatCurrency(monthlyReport.totalTripCommissionsPaid)} />}
                             
                             {monthlyReport.monthlyTotalExtrasCost.length > 0 && (
                                <>
                                    <h4 className="font-semibold text-sm pt-2">Costos Extras de Viajes:</h4>
                                    {monthlyReport.monthlyTotalExtrasCost.map(extra => (
                                        <InfoRow key={extra.id} label={extra.description} value={formatCurrency(extra.amount)} />
                                    ))}
                                </>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Card><CardHeader><CardTitle className="text-base">Gastos Varios (Manuales)</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2 mb-4">{monthlyReport.monthlyManualExpenses.map(e => (<div key={e.id} className="flex items-center gap-2"><div className="flex-grow"><InfoRow label={e.description} value={formatCurrency(e.amount)}/></div><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditItem(e)}><Pencil className="w-4 h-4"/></Button><Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDeleteItem(e.id, 'expense')}><Trash2 className="w-4 h-4"/></Button></div>))}</div>
                             <div className="p-4 border rounded-lg space-y-2"><Label>{editingExpenseId ? "Editar Gasto Manual" : "Añadir Nuevo Gasto Manual"}</Label><div className="flex items-center gap-2"><Input placeholder="Descripción..." value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}/><Input type="number" placeholder="Monto" className="w-32" value={newItem.amount} onChange={e => setNewItem({...newItem, amount: e.target.value})}/><Button onClick={() => handleAddItem('expense')} size="icon" className="flex-shrink-0"><PlusCircle className="w-4 h-4"/></Button>{editingExpenseId && <Button onClick={handleCancelEdit} variant="outline" size="sm">Cancelar</Button>}</div></div>
                        </CardContent>
                    </Card>
                </div></ScrollArea>
                 <DialogFooter><Button variant="outline" onClick={() => setActiveModal(null)}>Cerrar</Button></DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={activeModal === 'commissions'} onOpenChange={(isOpen) => !isOpen && setActiveModal(null)}>
            <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Ingresos por Comisión (Externos)</DialogTitle><DialogDescription>Registra aquí las comisiones ganadas por ventas de servicios de terceros.</DialogDescription></DialogHeader>
                 <ScrollArea className="h-[60vh]"><div className="py-4 space-y-4 pr-6">
                     <Card><CardContent className="pt-6">
                        <div className="space-y-2 mb-4">{monthlyReport.monthlyExternalCommissions.map(e => (<div key={e.id} className="flex items-center gap-2"><div className="flex-grow"><InfoRow label={e.description} value={formatCurrency(e.amount)}/></div><Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDeleteItem(e.id, 'commission')}><Trash2 className="w-4 h-4"/></Button></div>))}</div>
                        <div className="p-4 border rounded-lg space-y-2"><Label>Añadir Nueva Comisión Ganada</Label><div className="flex items-center gap-2"><Input placeholder="Descripción..." value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}/><Input type="number" placeholder="Monto" className="w-32" value={newItem.amount} onChange={e => setNewItem({...newItem, amount: e.target.value})}/><Button onClick={() => handleAddItem('commission')} size="icon" className="flex-shrink-0"><PlusCircle className="w-4 h-4"/></Button></div></div>
                    </CardContent></Card>
                 </div></ScrollArea>
                 <DialogFooter><Button variant="outline" onClick={() => setActiveModal(null)}>Cerrar</Button></DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={activeModal === 'excursions'} onOpenChange={(isOpen) => !isOpen && setActiveModal(null)}>
            <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Ingresos por Excursión</DialogTitle><DialogDescription>Registra aquí los ingresos generados por excursiones adicionales.</DialogDescription></DialogHeader>
                <ScrollArea className="h-[60vh]"><div className="py-4 space-y-4 pr-6">
                    <Card><CardContent className="pt-6">
                        <div className="space-y-2 mb-4">{monthlyReport.monthlyExcursionIncomes.map(e => (<div key={e.id} className="flex items-center gap-2"><div className="flex-grow"><InfoRow label={e.description} value={formatCurrency(e.amount)}/></div><Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDeleteItem(e.id, 'excursion')}><Trash2 className="w-4 h-4"/></Button></div>))}</div>
                        <div className="p-4 border rounded-lg space-y-2"><Label>Añadir Nuevo Ingreso por Excursión</Label><div className="flex items-center gap-2"><Input placeholder="Descripción..." value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}/><Input type="number" placeholder="Monto" className="w-32" value={newItem.amount} onChange={e => setNewItem({...newItem, amount: e.target.value})}/><Button onClick={() => handleAddItem('excursion')} size="icon" className="flex-shrink-0"><PlusCircle className="w-4 h-4"/></Button></div></div>
                    </CardContent></Card>
                </div></ScrollArea>
                <DialogFooter><Button variant="outline" onClick={() => setActiveModal(null)}>Cerrar</Button></DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={activeModal === 'netIncome'} onOpenChange={(isOpen) => !isOpen && setActiveModal(null)}>
            <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Ingreso Neto Mensual</DialogTitle><DialogDescription>Desglose de todas las ganancias y gastos del mes en curso.</DialogDescription></DialogHeader>
                <ScrollArea className="h-[60vh]"><div className="py-4 space-y-4 pr-6">
                    <h4 className="font-semibold text-lg text-green-600">Ingresos</h4>
                    {monthlyReport.monthlyToursData.map(rd => (
                        <InfoRow key={rd.tour.id} label={`Ganancia Neta - ${rd.tour.destination}`} value={formatCurrency(rd.netProfit)} />
                    ))}
                    {monthlyReport.totalCommissionIncome > 0 && <InfoRow label="Total Comisiones Externas" value={formatCurrency(monthlyReport.totalCommissionIncome)} />}
                    {monthlyReport.totalExcursionIncome > 0 && <InfoRow label="Total Ingresos Excursiones" value={formatCurrency(monthlyReport.totalExcursionIncome)} />}
                    <hr className="my-4"/>
                    <h4 className="font-semibold text-lg text-destructive">Gastos</h4>
                    {monthlyReport.monthlyManualExpenses.map(e => (
                       <InfoRow key={e.id} label={e.description} value={formatCurrency(e.amount * -1)} />
                    ))}
                </div></ScrollArea>
                <DialogFooter><Button variant="outline" onClick={() => setActiveModal(null)}>Cerrar</Button></DialogFooter>
            </DialogContent>
        </Dialog>

        <HistoryViewer
            isOpen={isHistoryOpen}
            onOpenChange={setIsHistoryOpen}
            historyKey="ytl_report_history"
            title="Historial de Reportes"
            itemTitleKey="name"
            downloadFolderNameKey="reportDownloadFolder"
            setHasDueItems={setHasDueItems}
        />

        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-bold">Reportes Financieros</h2><p className="text-muted-foreground">Analiza los ingresos, gastos y ganancias de cada viaje activo.</p></div>
                 <Button variant="outline" onClick={() => setIsHistoryOpen(true)}>
                    {hasDueItems && <AlertCircle className="mr-2 h-4 w-4 text-destructive" />}
                    <BookMarked className="mr-2 h-4 w-4" />
                    Historial de Reportes
                </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <Button variant="outline" className="h-auto py-2" onClick={() => setActiveModal('expenses')}>
                    <div className="flex flex-col items-end w-full"><div className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-destructive"/><span className="font-bold">Gasto Neto Mensual</span></div><span className="text-destructive text-lg">{formatCurrency(monthlyReport.totalNetExpense)}</span></div>
                </Button>
                 <Button variant="outline" className="h-auto py-2" onClick={() => setActiveModal('commissions')}>
                    <div className="flex flex-col items-end w-full"><div className="flex items-center gap-2"><HandCoins className="w-4 h-4 text-green-600"/><span className="font-bold">Ingresos Por Comisión</span></div><span className="text-green-600 text-lg">{formatCurrency(monthlyReport.totalCommissionIncome)}</span></div>
                </Button>
                 <Button variant="outline" className="h-auto py-2" onClick={() => setActiveModal('excursions')}>
                    <div className="flex flex-col items-end w-full"><div className="flex items-center gap-2"><MountainSnow className="w-4 h-4 text-cyan-600"/><span className="font-bold">Ingresos Por Excursión</span></div><span className="text-cyan-600 text-lg">{formatCurrency(monthlyReport.totalExcursionIncome)}</span></div>
                </Button>
                 <Button variant="outline" className="h-auto py-2" onClick={() => setActiveModal('netIncome')}>
                    <div className="flex flex-col items-end w-full"><div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-primary"/><span className="font-bold">Ingreso Neto Mensual</span></div><span className="text-primary text-lg">{formatCurrency(monthlyReport.totalNetIncome)}</span></div>
                </Button>
            </div>
             {reportData.length === 0 ? (
                <Card><CardContent className="p-12 text-center flex flex-col items-center gap-4"><BarChart3 className="w-16 h-16 text-muted-foreground/50"/><p className="text-muted-foreground">No hay datos financieros para mostrar de los viajes activos.</p></CardContent></Card>
            ) : (
                <Accordion type="multiple" className="w-full space-y-4" defaultValue={reportData.map(r=>r.tour.id)}>
                    {reportData.map(({ tour, totalIncome, totalCommission, commissionDetails, totalFixedCosts, netProfit, reservationCount }) => (
                        <AccordionItem value={tour.id} key={tour.id} className="border-b-0">
                            <Card className="overflow-hidden">
                                <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50 text-left">
                                    <div className="flex items-center gap-4"><div className="p-2 rounded-full bg-primary/10 text-primary"><Plane className="w-5 h-5"/></div><div><p className="font-semibold">{tour.destination}</p><p className="text-sm text-muted-foreground">{reservationCount} reservas confirmadas</p></div></div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="bg-secondary/20 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                       <InfoCard title="Ingresos Totales" value={formatCurrency(totalIncome)} icon={TrendingUp} color="text-green-600" description="Suma de todos los pagos recibidos."/>
                                       <Card className="cursor-pointer hover:bg-muted/50" onClick={() => totalCommission > 0 && handleOpenCommissionModal(tour, commissionDetails)}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Comisiones Pagadas</CardTitle><Users className="h-5 w-5 text-red-600" /></CardHeader>
                                            <CardContent><div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div><p className="text-xs text-muted-foreground">{totalCommission > 0 ? "Clic para ver detalle por vendedora." : "Sin comisiones para este viaje."}</p></CardContent>
                                        </Card>
                                       <InfoCard title="Gastos Fijos" value={formatCurrency(totalFixedCosts)} icon={Package} color="text-orange-600" description="Transporte, hotel y extras."/>
                                       <InfoCard title="Ganancia Neta" value={formatCurrency(netProfit)} icon={Banknote} color="text-primary" description="Ingresos menos gastos y comisiones."/>
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className={`h-5 w-5 ${color}`} /></CardHeader>
        <CardContent><div className="text-2xl font-bold">{value}</div><p className="text-xs text-muted-foreground">{description}</p></CardContent>
    </Card>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-sm"><p className="text-muted-foreground">{label}</p><p className="font-semibold">{value}</p></div>
);
    




    