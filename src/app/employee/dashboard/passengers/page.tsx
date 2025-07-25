
"use client"
import { useState, useMemo, useEffect } from "react"
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
import { Search } from "lucide-react"
import { mockReservations, mockSellers } from "@/lib/mock-data"
import type { Reservation } from "@/lib/types"

// This is a simplified version of the main passengers page.
// We are re-using the mock data structure for simplicity.
// A real app would fetch this data from a dedicated passenger service/table.
const getPassengersFromReservations = (reservations: Reservation[]) => {
    const passengersMap = new Map();
    reservations.forEach(res => {
        // Assuming the main passenger is the first one
        if (!passengersMap.has(res.passenger)) {
             passengersMap.set(res.passenger, { 
                id: res.id, // Using reservation ID as a pseudo-ID
                name: res.passenger, 
                dni: "XX.XXX.XXX" // Placeholder DNI
            });
        }
    });
    return Array.from(passengersMap.values());
}


export default function EmployeePassengersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [passengers, setPassengers] = useState<{id: string, name: string, dni: string}[]>([])
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("ytl_employee_id");
    setEmployeeId(storedEmployeeId);

    const allReservations: Reservation[] = JSON.parse(localStorage.getItem("ytl_reservations") || JSON.stringify(mockReservations));
    
    const myReservations = allReservations.filter(r => r.sellerId === storedEmployeeId);
    setPassengers(getPassengersFromReservations(myReservations));
  }, [])


  const filteredPassengers = passengers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mis Pasajeros</h2>
        <p className="text-muted-foreground">
          Busca y visualiza la información de los pasajeros de tus ventas.
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
               {filteredPassengers.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                        No se encontraron pasajeros.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
