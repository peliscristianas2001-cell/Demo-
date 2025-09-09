
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
import { LogInIcon, UserPlus, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import type { Passenger, Employee } from "@/lib/types";
import { mockEmployees } from "@/lib/mock-data";

import { app, auth } from "@/lib/firebase";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile
} from "firebase/auth";

const GoogleIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.712,34.464,44,28.756,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

function UnifiedLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const isDNI = /^\d+$/.test(identifier);

    if (isDNI) {
      // --- Employee/Admin Login Logic ---
      const employees: Employee[] = JSON.parse(localStorage.getItem("ytl_employees") || JSON.stringify(mockEmployees));
      const adminUser = employees.find(emp => emp.dni === '99999999');
      let targetUser: Employee | undefined;

      if (identifier === adminUser?.dni) {
        targetUser = adminUser;
      } else {
        targetUser = employees.find(emp => emp.dni === identifier);
      }
      
      if (targetUser && targetUser.password === password) {
        if (targetUser.dni === '99999999') {
          localStorage.setItem("ytl_admin_id", targetUser.id);
          toast({ title: "¡Bienvenida, Admin!", description: "Has iniciado sesión correctamente." });
          router.push("/admin/dashboard");
        } else {
          localStorage.setItem("ytl_employee_id", targetUser.id);
          toast({ title: "¡Bienvenido/a!", description: "Has iniciado sesión correctamente." });
          router.push("/employee/dashboard");
        }
      } else {
        toast({ title: "Credenciales incorrectas", description: "El DNI o la contraseña son incorrectos.", variant: "destructive" });
        setIsLoading(false);
      }
    } else {
      // --- Passenger Login Logic ---
      if (!app) {
          toast({ title: "Servicio no disponible", description: "La autenticación no está configurada.", variant: "destructive" });
          setIsLoading(false);
          return;
      }
      try {
        await signInWithEmailAndPassword(auth, identifier, password);
        toast({ title: "¡Bienvenido/a de nuevo!", description: "Has iniciado sesión correctamente." });
        router.push("/");
      } catch (error: any) {
        console.error(error);
        toast({ title: "Error de autenticación", description: "El email o la contraseña son incorrectos.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier">Email o DNI</Label>
        <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="tu@email.com o 12345678" required className="h-11"/>
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
    </form>
  );
}

function PassengerRegisterForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

    const handleFormChange = (id: keyof typeof formData, value: any) => {
        setFormData(prev => ({...prev, [id]: value}));
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!app) {
            toast({ title: "Servicio no disponible", description: "El registro no está configurado.", variant: "destructive" });
            return;
        }
        setIsLoading(true);

        const { fullName, email, password } = formData;
        if (!fullName || !email || !password || password.length < 6) {
            toast({ title: "Datos inválidos", description: "Nombre, email y una contraseña de 6+ caracteres son obligatorios.", variant: "destructive"});
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: fullName });
            
            const localPassengers: Passenger[] = JSON.parse(localStorage.getItem("ytl_passengers") || "[]");
            const newPassenger: Passenger = {
                id: userCredential.user.uid,
                fullName: fullName,
                email: email,
                dni: "",
                nationality: "Argentina",
                tierId: "adult"
            };
            localPassengers.push(newPassenger);
            localStorage.setItem("ytl_passengers", JSON.stringify(localPassengers));
            localStorage.setItem("ytl_user_id", newPassenger.id);


            toast({ title: "¡Registro exitoso!", description: "Tu cuenta ha sido creada. ¡Bienvenido/a!" });
            router.push('/');
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                 toast({ title: "Email ya registrado", description: "Ya existe una cuenta con ese email. Intenta iniciar sesión.", variant: "destructive"});
            } else {
                 toast({ title: "Error de registro", description: "No se pudo crear la cuenta. Inténtalo de nuevo.", variant: "destructive"});
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleRegister} className="space-y-4">
             <div className="space-y-2"><Label htmlFor="register-name">Nombre Completo</Label><Input id="register-name" placeholder="Ej: Juan Pérez" required className="h-11" value={formData.fullName} onChange={e => handleFormChange('fullName', e.target.value)}/></div>
             <div className="space-y-2"><Label htmlFor="register-email">Email</Label><Input id="register-email" type="email" placeholder="tu@email.com" required className="h-11" value={formData.email} onChange={e => handleFormChange('email', e.target.value)}/></div>
             <div className="space-y-2"><Label htmlFor="register-password">Contraseña</Label><Input id="register-password" type="password" placeholder="Crea una contraseña segura (mín. 6)" required className="h-11" value={formData.password} onChange={e => handleFormChange('password', e.target.value)}/></div>
             <Button type="submit" className="w-full h-11" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <> <UserPlus className="mr-2 h-4 w-4" /> Registrarse </>}</Button>
        </form>
    )
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const mode = searchParams.get('mode') || 'login';

  const handleGoogleSignIn = async () => {
    if (!app) {
        toast({ title: "Servicio no disponible", description: "La autenticación con Google no está configurada.", variant: "destructive" });
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const localPassengers: Passenger[] = JSON.parse(localStorage.getItem("ytl_passengers") || "[]");
        const existingPassenger = localPassengers.find(p => p.email === user.email);

        if (!existingPassenger) {
            const newPassenger: Passenger = {
                id: user.uid,
                fullName: user.displayName || 'Usuario de Google',
                email: user.email || '',
                dni: "",
                nationality: "Argentina",
                tierId: "adult"
            };
            localPassengers.push(newPassenger);
            localStorage.setItem("ytl_passengers", JSON.stringify(localPassengers));
            localStorage.setItem("ytl_user_id", newPassenger.id);
        } else {
             localStorage.setItem("ytl_user_id", existingPassenger.id);
        }
        
        toast({ title: "¡Bienvenido/a!", description: "Has iniciado sesión con Google." });
        router.push('/');

    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("Google Sign-In popup closed by user.");
            return;
        }
        console.error(error);
        toast({ title: "Error", description: "No se pudo iniciar sesión con Google.", variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
       <div className="w-full max-w-sm">
            <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
            </Button>
            <Card className="shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4"><Logo /></div>
                    <CardTitle className="text-2xl font-headline">Acceso a YO TE LLEVO</CardTitle>
                    <CardDescription>Ingresa o crea tu cuenta de pasajero.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs defaultValue={mode} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                           <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                           <TabsTrigger value="register">Registro</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="login" className="pt-4">
                           <Button variant="outline" className="w-full h-11 mb-4" onClick={handleGoogleSignIn}>
                                <GoogleIcon /> Continuar con Google
                            </Button>
                            <div className="flex items-center mb-4">
                                <Separator className="flex-1" />
                                <span className="px-4 text-xs text-muted-foreground uppercase">O</span>
                                <Separator className="flex-1" />
                            </div>
                           <UnifiedLoginForm />
                        </TabsContent>
                       <TabsContent value="register" className="pt-4">
                           <PassengerRegisterForm />
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter>
                     <p className="text-xs text-muted-foreground text-center px-4">Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.</p>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
