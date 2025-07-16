
"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Card,
  CardContent,
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
import { Badge } from "@/components/ui/badge"
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VoucherForm } from "@/components/admin/voucher-form"
import { mockVouchers } from "@/lib/mock-data"
import type { Voucher } from "@/lib/types"


export default function VouchersAdminPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>(mockVouchers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const activeVouchers = useMemo(() => {
    const now = new Date();
    return vouchers.filter(v => v.expiryDate >= now && v.status !== "Expirado");
  }, [vouchers]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Activo": return "secondary";
      case "Canjeado": return "default";
      case "Expirado": return "destructive";
      default: return "outline";
    }
  }

  const handleCreate = () => {
    setSelectedVoucher(null);
    setIsFormOpen(true);
  }

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsFormOpen(true);
  }

  const handleSave = (voucherData: Voucher) => {
    if (selectedVoucher) {
      setVouchers(vouchers.map(v => v.id === voucherData.id ? voucherData : v));
    } else {
      const newVoucher = { ...voucherData, id: `V${Date.now()}`, status: "Activo" as const };
      setVouchers([...vouchers, newVoucher]);
    }
    setIsFormOpen(false);
    setSelectedVoucher(null);
  }

  const handleDelete = (voucherId: string) => {
    setVouchers(vouchers.filter(v => v.id !== voucherId));
  }

  return (
    <div className="space-y-6">
      <VoucherForm 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        voucher={selectedVoucher}
      />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Vouchers</h2>
          <p className="text-muted-foreground">
            Crea, edita y administra los vouchers de regalo. Los expirados se ocultan automáticamente.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Nuevo Voucher
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Cantidad Disp.</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeVouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No hay vouchers activos.
                  </TableCell>
                </TableRow>
              ) : activeVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium font-mono">{voucher.code}</TableCell>
                  <TableCell>${voucher.value.toLocaleString("es-AR")}</TableCell>
                  <TableCell>{voucher.quantity}</TableCell>
                  <TableCell>
                    {voucher.expiryDate.toLocaleDateString("es-AR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(voucher.status)}>
                      {voucher.status}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleEdit(voucher)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(voucher.id)} className="text-destructive">
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
