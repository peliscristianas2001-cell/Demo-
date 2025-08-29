
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
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { PlusCircle, MoreHorizontal, Edit, Trash2, InfinityIcon, Percent, Save, Settings } from "lucide-react"
import { mockSellers, mockCommissionSettings } from "@/lib/mock-data"
import type { Seller, CommissionRule, CommissionSettings } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

type FormData = Omit<Seller, 'id'>;

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCommissionSettingsOpen, setIsCommissionSettingsOpen] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState<FormData>({ name: '', dni: '', phone: '', useFixedCommission: false, fixedCommissionRate: 0 });
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>(mockCommissionSettings)
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true)
    const storedSellers = localStorage.getItem("ytl_sellers")
    setSellers(storedSellers ? JSON.parse(storedSellers) : mockSellers)
    const storedCommissionSettings = localStorage.getItem("ytl_commission_settings")
    setCommissionSettings(storedCommissionSettings ? JSON.parse(storedCommissionSettings) : mockCommissionSettings)
  }, [])
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("ytl_sellers", JSON.stringify(sellers));
      localStorage.setItem("ytl_commission_settings", JSON.stringify(commissionSettings));
    }
  }, [sellers, commissionSettings, isClient])
  
  useEffect(() => {
    if (selectedSeller) {
        setFormData({
            name: selectedSeller.name,
            dni: selectedSeller.dni,
            phone: selectedSeller.phone,
            useFixedCommission: selectedSeller.useFixedCommission,
            fixedCommissionRate: selectedSeller.fixedCommissionRate || 0,
        });
    } else {
        setFormData({ name: '', dni: '', phone: '', useFixedCommission: false, fixedCommissionRate: 0 });
    }
  }, [selectedSeller, isFormOpen]);

  const handleCreate = () => {
    setSelectedSeller(null)
    setIsFormOpen(true)
  }

  const handleEdit = (seller: Seller) => {
    setSelectedSeller(seller)
    setIsFormOpen(true)
  }

  const handleFormChange = (id: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  const handleSave = () => {
    const { name } = formData;
    if (!name) {
        toast({ title: "Datos incompletos", description: "El nombre es obligatorio.", variant: "destructive" });
        return;
    }

    const sellerData: Seller = {
        id: selectedSeller?.id || `S-${Math.random().toString(36).substring(2, 11)}`,
        ...formData
    }

    if (selectedSeller) {
      setSellers(sellers.map(s => s.id === sellerData.id ? sellerData : s))
    } else {
      setSellers([...sellers, sellerData])
    }
    
    setIsFormOpen(false)
    setSelectedSeller(null)
    toast({ title: "¡Éxito!", description: "El vendedor/a ha sido guardado/a." });
  }

  const handleDelete = (sellerToDelete: Seller) => {
    setSellers(prev => prev.filter(s => s.id !== sellerToDelete.id));
    toast({ title: "Vendedor/a eliminado/a", description: "El vendedor/a ha sido borrado del sistema." });
  }
  
  const handleCommissionRuleChange = (id: string, field: keyof CommissionRule, value: any) => {
    setCommissionSettings(prev => ({
      ...prev,
      rules: prev.rules.map(rule => {
        if (rule.id === id) {
          return { ...rule, [field]: value };
        }
        return rule;
      })
    }))
  }

  const handleAddCommissionRule = () => {
    setCommissionSettings(prev => ({
      ...prev,
      rules: [...prev.rules, { id: `C-${Date.now()}`, from: 0, to: 0, rate: 0 }]
    }))
  }

  const handleRemoveCommissionRule = (id: string) => {
    setCommissionSettings(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== id)
    }))
  }
  
  const handleSaveCommissionSettings = () => {
    // Optional: Add validation logic here
    toast({ title: "Configuración de comisiones guardada."});
    setIsCommissionSettingsOpen(false);
  }

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedSeller ? "Editar Vendedor" : "Nuevo Vendedor"}</DialogTitle>
                <DialogDescription>
                {selectedSeller ? "Modifica los datos del vendedor." : "Añade un nuevo vendedor al sistema."}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="dni">DNI</Label>
                    <Input id="dni" value={formData.dni} onChange={(e) => handleFormChange('dni', e.target.value)}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)}/>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Switch id="useFixedCommission" checked={formData.useFixedCommission} onCheckedChange={(c) => handleFormChange('useFixedCommission', c)} />
                  <Label htmlFor="useFixedCommission">Usar Comisión Fija</Label>
                </div>
                 {formData.useFixedCommission && (
                    <div className="space-y-2 pl-8">
                        <Label htmlFor="fixedCommissionRate">Comisión Fija (%)</Label>
                        <Input id="fixedCommissionRate" type="number" value={formData.fixedCommissionRate} onChange={(e) => handleFormChange('fixedCommissionRate', parseFloat(e.target.value) || 0)} placeholder="Ej: 15"/>
                    </div>
                 )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
        </DialogContent>
       </Dialog>

       <Dialog open={isCommissionSettingsOpen} onOpenChange={setIsCommissionSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Comisiones por Venta</DialogTitle>
              <DialogDescription>
                Define los rangos de comisiones que se aplicarán a los vendedores (a menos que tengan una comisión fija).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {commissionSettings.rules.map((rule, index) => (
                <div key={rule.id} className="flex items-center gap-2">
                  <Input type="number" placeholder="Desde" value={rule.from} onChange={e => handleCommissionRuleChange(rule.id, 'from', parseInt(e.target.value) || 0)} className="w-24"/>
                  <span>-</span>
                  {rule.to === 'infinite' ? (
                     <Button variant="outline" size="icon" onClick={() => handleCommissionRuleChange(rule.id, 'to', (rule.from || 0) + 1)}><InfinityIcon className="w-4 h-4"/></Button>
                  ) : (
                    <Input type="number" placeholder="Hasta" value={rule.to} onChange={e => handleCommissionRuleChange(rule.id, 'to', parseInt(e.target.value) || 0)} className="w-24"/>
                  )}
                   <Input type="number" placeholder="%" value={rule.rate} onChange={e => handleCommissionRuleChange(rule.id, 'rate', parseInt(e.target.value) || 0)} className="w-24"/>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveCommissionRule(rule.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddCommissionRule}><PlusCircle className="mr-2 h-4 w-4"/>Añadir Rango</Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCommissionSettingsOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveCommissionSettings}><Save className="mr-2 h-4 w-4"/>Guardar Configuración</Button>
            </DialogFooter>
          </DialogContent>
       </Dialog>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Vendedores</h2>
          <p className="text-muted-foreground">
            Añade vendedores y configura las comisiones por ventas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCommissionSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Configurar Comisiones
          </Button>
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Vendedor
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo Comisión</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No hay vendedores registrados.
                  </TableCell>
                </TableRow>
              ) : sellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell className="font-medium">{seller.name}</TableCell>
                    <TableCell>{seller.dni}</TableCell>
                    <TableCell>{seller.phone}</TableCell>
                    <TableCell>
                      {seller.useFixedCommission 
                        ? <span className="font-semibold">{seller.fixedCommissionRate}% (Fija)</span>
                        : <span>Por Rangos</span>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(seller)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(seller)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
