
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogInIcon, UserPlus, Eye, EyeOff, Loader2, ArrowLeft, Shield } from "lucide-react";
import { Logo } from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import type { Passenger, Employee } from "@/lib/types";
import { mockEmployees, mockPassengers } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

function UnifiedLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localPassengers, setLocalPassengers] = useState<Passenger[]>([]);
  const [localEmployees, setLocalEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    setLocalPassengers(JSON.parse(localStorage.getItem("app_passengers") || JSON.stringify(mockPassengers)));
    setLocalEmployees(JSON.parse(localStorage.getItem("app_employees") || JSON.stringify(mockEmployees)));
  }, []);

  const handleAdminLogin = () => {
    // Demo logic: using a hardcoded DNI for admin for simplicity
    const adminUser = localEmployees.find(emp => emp.dni === '99999999');
    if (adminUser) {
        localStorage.setItem("app_employee_id", adminUser.id);
        toast({ title: "Acceso de Administrador Concedido", description: "Bienvenido al panel de control." });
        router.push("/admin/dashboard");
    } else {
        toast({ title: "Error", description: "No se encontró el usuario administrador de prueba.", variant: "destructive"});
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Employee login check (by DNI)
    const employeeUser = localEmployees.find(emp => emp.dni === identifier && emp.password === password);
    if (employeeUser) {
      localStorage.setItem("app_employee_id", employeeUser.id);
      toast({ title: "¡Bienvenido/a!", description: "Has iniciado sesión correctamente." });
      router.push("/employee/dashboard");
      setIsLoading(false);
      return; 
    }
    
    // Passenger Login (by DNI or Full Name)
    const passengerUser = localPassengers.find(
      p => (p.dni === identifier || p.fullName.toLowerCase() === identifier.toLowerCase()) && p.password === password
    );

    if (passengerUser) {
        localStorage.setItem("app_user_id", passengerUser.id);
        toast({ title: "¡Bienvenido/a de nuevo!", description: "Has iniciado sesión correctamente." });
        router.push("/");
    } else {
         toast({ title: "Credenciales incorrectas", description: "El usuario o la contraseña son incorrectos.", variant: "destructive" });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier">DNI o Nombre de Usuario</Label>
        <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Tu DNI o nombre de usuario" required className="h-11"/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required className="pr-10 h-11"/>
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full h-11" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <> <LogInIcon className="mr-2 h-4 w-4" /> Ingresar </>}</Button>
      <Button type="button" variant="secondary" className="w-full h-11" onClick={handleAdminLogin}>
          <Shield className="mr-2 h-4 w-4" /> Ingresar como Administrador (Demo)
      </Button>
    </form>
  );
}

function PassengerRegisterForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', dni: '', password: '' });

    const handleFormChange = (id: keyof typeof formData, value: any) => {
        setFormData(prev => ({...prev, [id]: value}));
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { fullName, dni, password } = formData;
        if (!fullName || !dni || !password || password.length < 6) {
            toast({ title: "Datos inválidos", description: "Nombre, DNI y una contraseña de 6+ caracteres son obligatorios.", variant: "destructive"});
            setIsLoading(false);
            return;
        }

        const localPassengers: Passenger[] = JSON.parse(localStorage.getItem("app_passengers") || "[]");
        const existingPassenger = localPassengers.find(p => p.dni === dni);

        if (existingPassenger) {
            toast({ title: "DNI ya registrado", description: "Ya existe un usuario con ese DNI. Intenta iniciar sesión.", variant: "destructive"});
            setIsLoading(false);
            return;
        }

        const newPassenger: Passenger = {
            id: `P-USER-${Date.now()}`,
            fullName: fullName,
            dni: dni,
            password: password,
            nationality: "Argentina",
            tierId: "adult"
        };
        
        localPassengers.push(newPassenger);
        localStorage.setItem("app_passengers", JSON.stringify(localPassengers));
        localStorage.setItem("app_user_id", newPassenger.id);

        window.dispatchEvent(new Event('storage'));

        toast({ title: "¡Registro exitoso!", description: "Tu cuenta ha sido creada. ¡Bienvenido/a!" });
        router.push('/');
        setIsLoading(false);
    }

    return (
        <form onSubmit={handleRegister} className="space-y-4">
             <div className="space-y-2"><Label htmlFor="register-name">Nombre Completo</Label><Input id="register-name" placeholder="Ej: Juan Pérez" required className="h-11" value={formData.fullName} onChange={e => handleFormChange('fullName', e.target.value)}/></div>
             <div className="space-y-2"><Label htmlFor="register-dni">DNI</Label><Input id="register-dni" type="text" placeholder="Tu número de DNI" required className="h-11" value={formData.dni} onChange={e => handleFormChange('dni', e.target.value)}/></div>
             <div className="space-y-2"><Label htmlFor="register-password">Contraseña</Label><Input id="register-password" type="password" placeholder="Crea una contraseña segura (mín. 6)" required className="h-11" value={formData.password} onChange={e => handleFormChange('password', e.target.value)}/></div>
             <Button type="submit" className="w-full h-11" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <> <UserPlus className="mr-2 h-4 w-4" /> Registrarse </>}</Button>
        </form>
    )
}

function ForgotPasswordDialog() {
    const { toast } = useToast();
    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Funcionalidad no disponible</DialogTitle>
                <DialogDescription>
                    La recuperación de contraseña no está habilitada en esta demo de frontend puro.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                 <DialogClose asChild><Button>Entendido</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  return (
    <Dialog>
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="w-full max-w-sm">
            <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
            </Button>
            <Card className="shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4"><Logo /></div>
                    <CardTitle className="text-2xl font-headline">Acceso a la Demo</CardTitle>
                    <CardDescription>Ingresa a tu cuenta de prueba o regístrate.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs defaultValue={mode} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                           <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                           <TabsTrigger value="register">Registro</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="login" className="pt-4">
                           <UnifiedLoginForm />
                            <DialogTrigger asChild>
                               <Button variant="link" className="w-full mt-2 text-xs">¿Olvidaste tu contraseña?</Button>
                           </DialogTrigger>
                        </TabsContent>
                       <TabsContent value="register" className="pt-4">
                           <PassengerRegisterForm />
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter>
                     <p className="text-xs text-muted-foreground text-center px-4">Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad de esta demo.</p>
                </CardFooter>
            </Card>
        </div>
    </div>
    <ForgotPasswordDialog />
    </Dialog>
  );
}
