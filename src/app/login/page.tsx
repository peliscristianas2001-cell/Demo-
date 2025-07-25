
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogInIcon, UserPlus, Eye, EyeOff, UserCog, UserRound, Plane, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { mockSellers } from "@/lib/mock-data";
import type { Seller } from "@/lib/types";

function RoleSelector({ onSelectRole }: { onSelectRole: (role: 'admin' | 'seller' | 'client') => void }) {
    return (
        <Dialog open={true}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} hideCloseButton>
                <DialogHeader>
                    <DialogTitle>Seleccionar Rol</DialogTitle>
                    <DialogDescription>
                        Hemos detectado múltiples perfiles asociados a tus credenciales. ¿Cómo quieres continuar?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-4 py-4">
                    <Button variant="outline" size="lg" className="h-16 text-lg justify-start" onClick={() => onSelectRole('admin')}>
                        <UserCog className="mr-4 w-6 h-6" />
                        <div>
                            <p className="font-bold">Panel de Administrador</p>
                            <p className="font-normal text-sm text-muted-foreground">Acceso total al sistema.</p>
                        </div>
                    </Button>
                     <Button variant="outline" size="lg" className="h-16 text-lg justify-start" onClick={() => onSelectRole('seller')}>
                        <UserRound className="mr-4 w-6 h-6" />
                        <div>
                             <p className="font-bold">Panel de Vendedor</p>
                             <p className="font-normal text-sm text-muted-foreground">Gestionar mis ventas.</p>
                        </div>
                    </Button>
                     <Button variant="outline" size="lg" className="h-16 text-lg justify-start" onClick={() => onSelectRole('client')}>
                        <Plane className="mr-4 w-6 h-6" />
                        <div>
                             <p className="font-bold">Navegar como Cliente</p>
                             <p className="font-normal text-sm text-muted-foreground">Explorar viajes y destinos.</p>
                        </div>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [matchedSeller, setMatchedSeller] = useState<Seller | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const isAdmin = credential === "Angela Rojas" && password === "AngelaRojasYTL";
    
    const sellers: Seller[] = JSON.parse(localStorage.getItem("ytl_sellers") || JSON.stringify(mockSellers));
    const seller = sellers.find(s => (s.dni === credential || s.name === credential) && s.password === password);

    // For this example, we'll simulate a client match with the admin's credentials
    const isClient = credential === "Angela Rojas" && password === "AngelaRojasYTL";
    
    // Clear any previous employee session
    localStorage.removeItem("ytl_employee_id");

    if (isAdmin && seller) {
        setMatchedSeller(seller);
        setShowRoleSelector(true);
        setIsLoading(false);
        return;
    }

    if (isAdmin) {
      handleRoleSelection('admin');
    } else if (seller) {
      setMatchedSeller(seller);
      // If user is only a seller, log them in directly
      handleRoleSelection('seller', seller);
    } else if (isClient) {
       handleRoleSelection('client');
    }
    else {
      toast({
        title: "Error de autenticación",
        description: "Las credenciales son incorrectas.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role: 'admin' | 'seller' | 'client', sellerInfo?: Seller) => {
      setShowRoleSelector(false);
      switch(role) {
          case 'admin':
              toast({ title: "¡Bienvenida, Angela!", description: "Has iniciado sesión como administradora." });
              router.push("/admin/dashboard");
              break;
          case 'seller':
              const sellerToLogin = sellerInfo || matchedSeller;
              if (sellerToLogin) {
                toast({ title: `¡Bienvenido/a, ${sellerToLogin.name}!`, description: "Has iniciado sesión en tu panel." });
                localStorage.setItem("ytl_employee_id", sellerToLogin.id);
                router.push("/employee/dashboard");
              }
              break;
          case 'client':
              toast({ title: "¡Inicio de sesión exitoso!", description: `Bienvenido/a de nuevo.` });
              router.push("/");
              break;
      }
  }
  
  if (showRoleSelector) {
      return <RoleSelector onSelectRole={handleRoleSelection} />
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="login-credential">Nombre de Usuario o DNI</Label>
        <Input
          id="login-credential"
          type="text"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          placeholder="Tu nombre o DNI"
          required
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            className="pr-10 h-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full h-11" disabled={isLoading}>
        {isLoading ? "Ingresando..." : <> <LogInIcon className="mr-2 h-4 w-4" /> Ingresar </>}
      </Button>
    </form>
  );
}

function RegisterForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock registration logic
        toast({
            title: "¡Registro exitoso!",
            description: "Tu cuenta ha sido creada. Ahora podés iniciar sesión.",
        });
        
        // In a real app, you would save user data here
        setTimeout(() => {
            setIsLoading(false);
            // Could redirect to login or show a message
        }, 1500)
    }

    return (
        <form onSubmit={handleRegister} className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="register-name">Nombre Completo</Label>
              <Input id="register-name" placeholder="Ej: Juan Pérez" required className="h-11" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input id="register-email" type="email" placeholder="juan.perez@email.com" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Contraseña</Label>
              <Input id="register-password" type="password" placeholder="Crea una contraseña segura" required className="h-11" />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : <> <UserPlus className="mr-2 h-4 w-4" /> Registrarse </>}
            </Button>
        </form>
    )
}


export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
       <div className="w-full max-w-md">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la tienda
            </Button>
            <Tabs defaultValue={mode} className="w-full">
                <Card className="shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                    <Logo />
                    </div>
                    <CardTitle className="text-2xl font-headline">
                        Acceso a YO TE LLEVO
                    </CardTitle>
                    <CardDescription>
                        Ingresá a tu cuenta o registrate para una nueva aventura.
                    </CardDescription>
                    <TabsList className="grid w-full grid-cols-2 mt-4">
                        <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                        <TabsTrigger value="register">Registro</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="login">
                        <LoginForm />
                    </TabsContent>
                    <TabsContent value="register">
                        <RegisterForm />
                    </TabsContent>
                </CardContent>
                </Card>
            </Tabs>
        </div>
    </div>
  );
}


    