
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
import { PlusCircle, MoreHorizontal, Edit, Trash2, Clipboard, UserPlus, Redo } from "lucide-react"
import { mockSellers } from "@/lib/mock-data"
import type { Seller } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FormData = Omit<Seller, 'id'>;

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [exSellers, setExSellers] = useState<Seller[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState<FormData>({ name: '', dni: '', phone: '', commission: 0, password: '' });
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true)
    const storedSellers = localStorage.getItem("ytl_sellers")
    const storedExSellers = localStorage.getItem("ytl_ex_sellers")
    setSellers(storedSellers ? JSON.parse(storedSellers) : mockSellers)
    setExSellers(storedExSellers ? JSON.parse(storedExSellers) : [])

    const handleStorageChange = () => {
      const newStoredSellers = localStorage.getItem("ytl_sellers")
      const newStoredExSellers = localStorage.getItem("ytl_ex_sellers")
      setSellers(newStoredSellers ? JSON.parse(newStoredSellers) : mockSellers)
      setExSellers(newStoredExSellers ? JSON.parse(newStoredExSellers) : [])
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [])
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("ytl_sellers", JSON.stringify(sellers));
      localStorage.setItem("ytl_ex_sellers", JSON.stringify(exSellers));
    }
  }, [sellers, exSellers, isClient])
  
  useEffect(() => {
    if (selectedSeller) {
        setFormData({
            name: selectedSeller.name,
            dni: selectedSeller.dni,
            phone: selectedSeller.phone,
            commission: selectedSeller.commission,
            password: selectedSeller.password || ''
        });
    } else {
        setFormData({ name: '', dni: '', phone: '', commission: 0, password: '' });
    }
  }, [selectedSeller, isFormOpen]);

  const getRegistrationLink = (sellerId: string) => {
    if (isClient) {
      return `${window.location.origin}/employee/register?sellerId=${sellerId}`;
    }
    return "";
  }

  const handleCopyLink = (sellerId: string) => {
    const link = getRegistrationLink(sellerId);
    if (link) {
      navigator.clipboard.writeText(link).then(() => {
        toast({ title: "¡Copiado!", description: "El link de registro se ha copiado al portapapeles." });
      });
    }
  }

  const handleCreate = () => {
    setSelectedSeller(null)
    setIsFormOpen(true)
  }

  const handleEdit = (seller: Seller) => {
    setSelectedSeller(seller)
    setIsFormOpen(true)
  }

  const handleRehireSelect = (sellerId: string) => {
      const sellerToRehire = exSellers.find(s => s.id === sellerId);
      if (sellerToRehire) {
          setSelectedSeller({ ...sellerToRehire, password: '' }); // Clear password for re-registration
          setIsFormOpen(true);
      }
  }
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [id]: id === 'commission' ? parseFloat(value) || 0 : value
    }));
  }

  const handleSave = () => {
    const { name, commission } = formData;
    if (!name || commission === null || commission < 0) {
        toast({ title: "Datos incompletos", description: "El nombre y una comisión válida son obligatorios.", variant: "destructive" });
        return;
    }

    const sellerData: Seller = {
        id: selectedSeller?.id || `S${Date.now()}`,
        ...formData
    }

    if (selectedSeller) {
      // Check if it's a re-hire
      const isRehiring = exSellers.some(s => s.id === sellerData.id);
      if (isRehiring) {
        setExSellers(prev => prev.filter(s => s.id !== sellerData.id));
        setSellers(prev => [...prev, sellerData]);
      } else {
        setSellers(sellers.map(s => s.id === sellerData.id ? sellerData : s))
      }
    } else {
      setSellers([...sellers, sellerData])
    }
    
    setIsFormOpen(false)
    setSelectedSeller(null)
    toast({ title: "¡Éxito!", description: "El vendedor/a ha sido guardado/a." });
  }

  const handleDelete = (sellerToDelete: Seller) => {
    const sellerWithoutPassword = { ...sellerToDelete, password: '' };
    setSellers(prev => prev.filter(s => s.id !== sellerToDelete.id));
    setExSellers(prev => [...prev, sellerWithoutPassword]);
    toast({ title: "Vendedor/a archivado/a", description: "El vendedor/a ha sido movido/a a ex-vendedores." });
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
                    <Input id="name" value={formData.name} onChange={handleFormChange}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="dni">DNI</Label>
                    <Input id="dni" value={formData.dni} onChange={handleFormChange}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" value={formData.phone} onChange={handleFormChange}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="commission">Comisión (%)</Label>
                    <Input id="commission" type="number" value={formData.commission} onChange={handleFormChange} placeholder="Ej: 10"/>
                </div>

                {selectedSeller && (
                    <div className="space-y-2 pt-4">
                        <Label>Link de Registro Único</Label>
                         <div className="flex items-center gap-2">
                            <Input value={getRegistrationLink(selectedSeller.id)} readOnly className="text-muted-foreground"/>
                            <Button size="icon" variant="outline" onClick={() => handleCopyLink(selectedSeller.id)}>
                                <Clipboard className="w-4 h-4"/>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Comparte este link para que el vendedor pueda (re)crear su contraseña.</p>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
        </DialogContent>
       </Dialog>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Vendedores</h2>
          <p className="text-muted-foreground">
            Añade, edita o archiva a los vendedores de viajes.
          </p>
        </div>
        <div className="flex items-center gap-2">
           {exSellers.length > 0 && (
             <Select onValueChange={handleRehireSelect}>
                <SelectTrigger className="w-[200px] h-10">
                    <SelectValue placeholder="Recontratar..." />
                </SelectTrigger>
                <SelectContent>
                    {exSellers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
            </Select>
           )}
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
                <TableHead>Link Reg.</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No hay vendedores registrados.
                  </TableCell>
                </TableRow>
              ) : sellers.map((seller) => (
                  <TableRow key={seller.id}>
                     <TableCell>
                      <Button variant="outline" size="icon" onClick={() => handleCopyLink(seller.id)}>
                        <Clipboard className="w-4 h-4" />
                        <span className="sr-only">Copiar link de registro</span>
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{seller.name}</TableCell>
                    <TableCell>{seller.dni}</TableCell>
                    <TableCell>{seller.phone}</TableCell>
                    <TableCell>{seller.commission}%</TableCell>
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
                            Archivar
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
