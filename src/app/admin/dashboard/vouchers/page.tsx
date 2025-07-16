
"use client"

import { useState, useEffect } from "react"
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

type Voucher = {
    id: string;
    code: string;
    value: number;
    status: "Activo" | "Canjeado" | "Expirado";
    expiryDate: Date;
}

// Mock data for vouchers
const mockVouchers: Voucher[] = [
  { id: "V001", code: "VERANO2025", value: 10000, status: "Activo", expiryDate: new Date("2025-03-31T23:59:59") },
  { id: "V002", code: "REGALOESPECIAL", value: 25000, status: "Canjeado", expiryDate: new Date("2024-12-31T23:59:59") },
  { id: "V003", code: "AVENTURA15", value: 15000, status: "Activo", expiryDate: new Date("2024-10-31T23:59:59") },
  { id: "V004", code: "EXPIRADO01", value: 5000, status: "Expirado", expiryDate: new Date("2024-01-01T23:59:59") },
];

export default function VouchersAdminPage() {
  const [activeVouchers, setActiveVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    // Filter out vouchers that have expired on the client-side to avoid hydration errors
    const filtered = mockVouchers.filter(v => {
        const now = new Date();
        // If status is "Expirado", only show if it has not actually expired yet (edge case for manual setting)
        if(v.status === "Expirado") {
            return v.expiryDate >= now;
        }
        // Always show "Canjeado"
        if(v.status === "Canjeado") {
            return true;
        }
        // Show "Activo" only if not expired
        return v.expiryDate >= now;
    });
    setActiveVouchers(filtered);
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Activo": return "secondary";
      case "Canjeado": return "default";
      case "Expirado": return "destructive";
      default: return "outline";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Vouchers</h2>
          <p className="text-muted-foreground">
            Crea, edita y administra los vouchers de regalo. Los vouchers expirados se ocultan.
          </p>
        </div>
        <Button>
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
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium font-mono">{voucher.code}</TableCell>
                  <TableCell>${voucher.value.toLocaleString("es-AR")}</TableCell>
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
