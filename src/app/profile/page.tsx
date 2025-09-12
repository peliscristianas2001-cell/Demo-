
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Passenger } from "@/lib/types";
import { mockPassengers } from "@/lib/mock-data";
import { Loader2, UserCircle, Save } from "lucide-react";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [passenger, setPassenger] = useState<Passenger | null>(null);
    const [formData, setFormData] = useState({ fullName: '', dni: '', phone: '' });

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        } else if (user) {
            const allPassengers: Passenger[] = JSON.parse(localStorage.getItem("app_passengers") || JSON.stringify(mockPassengers));
            const currentPassenger = allPassengers.find(p => p.id === user.uid || p.email === user.email);
            
            if (currentPassenger) {
                setPassenger(currentPassenger);
                setFormData({
                    fullName: currentPassenger.fullName,
                    dni: currentPassenger.dni || '',
                    phone: currentPassenger.phone || ''
                });
            }
        }
    }, [user, loading, router]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    }

    const handleSaveChanges = () => {
        if (!passenger) return;

        const allPassengers: Passenger[] = JSON.parse(localStorage.getItem("app_passengers") || JSON.stringify(mockPassengers));
        const updatedPassengers = allPassengers.map(p => {
            if (p.id === passenger.id) {
                return { ...p, ...formData };
            }
            return p;
        });
        localStorage.setItem("app_passengers", JSON.stringify(updatedPassengers));
        window.dispatchEvent(new Event('storage'));
        toast({ title: "¡Datos guardados!", description: "Tu perfil ha sido actualizado." });
    };

    if (loading || !user || !passenger) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary"/>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1">
                <div className="container py-12 md:py-24">
                    <Card className="max-w-2xl mx-auto shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <UserCircle className="w-10 h-10 text-primary"/>
                                <div>
                                    <CardTitle className="text-2xl">Mi Perfil</CardTitle>
                                    <CardDescription>Actualiza tu información personal.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user.email || ''} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nombre Completo</Label>
                                <Input id="fullName" value={formData.fullName} onChange={handleFormChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="dni">DNI</Label>
                                <Input id="dni" value={formData.dni} onChange={handleFormChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" value={formData.phone} onChange={handleFormChange} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges}>
                               <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
