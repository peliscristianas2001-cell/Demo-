
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogInIcon, UserPlus, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/logo";

function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (name === "Angela Rojas" && password === "AngelaRojasYTL") {
      toast({
        title: "¡Bienvenida, Angela!",
        description: "Has iniciado sesión como administradora.",
      });
      router.push("/admin/dashboard");
    } else if (name && password) {
      toast({
        title: "¡Inicio de sesión exitoso!",
        description: `Bienvenido/a de nuevo, ${name}.`,
      });
      // Here you would typically set user session
      // For now, just redirect to home
      router.push("/");
    } else {
      toast({
        title: "Error de autenticación",
        description: "El nombre de usuario o la contraseña son incorrectos.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="login-name">Nombre de Usuario</Label>
        <Input
          id="login-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre de usuario"
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
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Tabs defaultValue={mode} className="w-full max-w-md">
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
  );
}
