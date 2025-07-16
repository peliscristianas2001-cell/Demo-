"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { LogInIcon, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // IMPORTANT: This is a mock login for demonstration purposes.
    // In a real production app, passwords should be hashed and validated on a server.
    if (password === "AngelaRojasYTL") {
      toast({
        title: "¡Bienvenida, Angela!",
        description: "Has iniciado sesión correctamente.",
      });
      // In a real app, you would set a session cookie here.
      router.push("/admin/dashboard");
    } else {
      toast({
        title: "Error de autenticación",
        description: "La contraseña es incorrecta. Inténtalo de nuevo.",
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
          <CardTitle className="text-2xl font-headline">Panel de Administración</CardTitle>
          <CardDescription>Ingresa tu contraseña para acceder al panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
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
