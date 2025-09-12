
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Settings as SettingsIcon, Save } from "lucide-react"
import { mockEmployees } from "@/lib/mock-data"
import type { Employee } from "@/lib/types"

export default function EmployeeSettingsPage() {
    const { toast } = useToast()
    const [isClient, setIsClient] = useState(false);
    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [formData, setFormData] = useState({ name: '', dni: '', phone: '' });

    useEffect(() => {
        setIsClient(true);
        const storedEmployeeId = localStorage.getItem("app_employee_id");
        setEmployeeId(storedEmployeeId);

        const storedEmployees = JSON.parse(localStorage.getItem("app_employees") || JSON.stringify(mockEmployees));
        setEmployees(storedEmployees);
        
        const currentEmployee = storedEmployees.find((s: Employee) => s.id === storedEmployeeId);
        if (currentEmployee) {
            setFormData({
                name: currentEmployee.name || '',
                dni: currentEmployee.dni || '',
                phone: currentEmployee.phone || ''
            });
        }
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    }

    const handleSaveChanges = () => {
        if (!employeeId) return;

        if (!formData.dni || !formData.phone) {
             toast({
                title: "Datos incompletos",
                description: "El DNI y el Teléfono son obligatorios.",
                variant: "destructive",
            });
            return;
        }

        const updatedEmployees = employees.map(s => {
            if (s.id === employeeId) {
                return { ...s, ...formData };
            }
            return s;
        });

        setEmployees(updatedEmployees);
        localStorage.setItem("app_employees", JSON.stringify(updatedEmployees));

        toast({
            title: "¡Datos guardados!",
            description: "Tu información personal ha sido actualizada.",
        });
    }

    if (!isClient) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SettingsIcon className="w-6 h-6"/> Mi Perfil</CardTitle>
          <CardDescription>
            Actualiza tu información personal. El DNI y el teléfono son obligatorios para el registro de tus ventas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4 p-4 border rounded-lg max-w-lg">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" value={formData.name} onChange={handleFormChange}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="dni">DNI (obligatorio)</Label>
                    <Input id="dni" value={formData.dni} onChange={handleFormChange} placeholder="Tu número de DNI sin puntos"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (obligatorio)</Label>
                    <Input id="phone" value={formData.phone} onChange={handleFormChange} placeholder="Tu número de teléfono"/>
                </div>
                <Button onClick={handleSaveChanges}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
