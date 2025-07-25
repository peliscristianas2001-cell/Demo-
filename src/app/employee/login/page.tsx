
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { LogInIcon, Eye, EyeOff, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { mockSellers } from "@/lib/mock-data";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const sellers = JSON.parse(localStorage.getItem("ytl_sellers") || JSON.stringify(mockSellers));
    const seller = sellers.find((s: any) => s.dni === dni && s.password === password);

    if (seller) {
      toast({
        title: `¡Bienvenido/a, ${seller.name}!`,
        description: "Has iniciado sesión en tu panel.",
      });
      localStorage.setItem("ytl_employee_id", seller.id);
      router.push("/employee/dashboard");
    } else {
      toast({
        title: "Error de autenticación",
        description: "El DNI o la contraseña son incorrectos.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
     <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
                <UserRound/> Panel de Vendedores
            </CardTitle>
             <CardDescription>
                Ingresa con tus credenciales para gestionar tus ventas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-dni">Tu DNI</Label>
                <Input
                  id="login-dni"
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="DNI sin puntos"
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
          </CardContent>
        </Card>
    </div>
  );
}
