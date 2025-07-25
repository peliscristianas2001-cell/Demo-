
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Settings as SettingsIcon, Save } from "lucide-react"
import { mockSellers } from "@/lib/mock-data"
import type { Seller } from "@/lib/types"

export default function EmployeeSettingsPage() {
    const { toast } = useToast()
    const [isClient, setIsClient] = useState(false);
    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [formData, setFormData] = useState({ name: '', dni: '', phone: '' });

    useEffect(() => {
        setIsClient(true);
        const storedEmployeeId = localStorage.getItem("ytl_employee_id");
        setEmployeeId(storedEmployeeId);

        const storedSellers = JSON.parse(localStorage.getItem("ytl_sellers") || JSON.stringify(mockSellers));
        setSellers(storedSellers);
        
        const currentSeller = storedSellers.find((s: Seller) => s.id === storedEmployeeId);
        if (currentSeller) {
            setFormData({
                name: currentSeller.name || '',
                dni: currentSeller.dni || '',
                phone: currentSeller.phone || ''
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

        const updatedSellers = sellers.map(s => {
            if (s.id === employeeId) {
                return { ...s, ...formData };
            }
            return s;
        });

        setSellers(updatedSellers);
        localStorage.setItem("ytl_sellers", JSON.stringify(updatedSellers));

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
