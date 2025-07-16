
"use client"
import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Users, Search } from "lucide-react"

// Mock data
const mockPassengers = [
    { id: "P001", name: "Juan Pérez", dni: "30123456" },
    { id: "P002", name: "María García", dni: "32654987" },
    { id: "P003", name: "Carlos López", dni: "28789123" },
    { id: "P004", name: "Ana Martínez", dni: "35987654" },
    { id: "P005", name: "Lucía Hernández", dni: "38456789" },
    { id: "P006", name: "Jorge Rodriguez", dni: "25123789" },
]


export default function PassengersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPassengers = mockPassengers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestión de Pasajeros</h2>
        <p className="text-muted-foreground">
          Busca y administra la información de todos los pasajeros.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por nombre o DNI..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>DNI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPassengers.map((p) => (
                <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.dni}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
