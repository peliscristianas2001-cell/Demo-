
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/logo";
import { mockSellers } from "@/lib/mock-data";
import type { Seller } from "@/lib/types";

export default function EmployeeRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect ensures we only run logic that needs the window object on the client.
    setIsClient(true);
    const id = searchParams.get('sellerId');
    if (id) {
        setSellerId(id);
        const storedSellers = JSON.parse(localStorage.getItem("ytl_sellers") || JSON.stringify(mockSellers));
        setSellers(storedSellers);
    }
  }, [searchParams]);

  const seller = useMemo(() => sellers.find(s => s.id === sellerId), [sellers, sellerId]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) {
        toast({ title: "Error", description: "Link de registro inválido o expirado.", variant: "destructive" });
        return;
    }
    if (password !== confirmPassword) {
        toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
        return;
    }
    if (password.length < 6) {
        toast({ title: "Contraseña muy corta", description: "Debe tener al menos 6 caracteres.", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    const updatedSeller = { ...seller, password };
    const updatedSellers = sellers.map(s => s.id === sellerId ? updatedSeller : s);
    localStorage.setItem("ytl_sellers", JSON.stringify(updatedSellers));

    toast({
        title: "¡Registro completado!",
        description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
    });

    setTimeout(() => {
        router.push("/login");
    }, 2000);
  };

  if (!isClient) {
    // Render nothing on the server to avoid hydration mismatches,
    // and wait for the client-side useEffect to run.
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-headline">
                Completar Registro de Vendedor
            </CardTitle>
            <CardDescription>
                {seller ? `¡Hola, ${seller.name}! Crea una contraseña para acceder a tu panel.` : "Verificando link de registro..."}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {seller ? (
                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Nombre (asignado por admin)</Label>
                        <Input 
                            value={seller.name}
                            readOnly 
                            disabled
                            className="h-11 bg-muted/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Crea tu Contraseña</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="Mínimo 6 caracteres" 
                            required 
                            className="h-11"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite la contraseña"
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
                        {isLoading ? "Guardando..." : <> <UserPlus className="mr-2 h-4 w-4" /> Finalizar Registro </>}
                    </Button>
                </form>
            ) : (
                 <p className="text-center text-muted-foreground p-4">
                    {sellerId ? "Verificando datos del vendedor..." : "Link inválido o no se encontró el ID del vendedor."}
                </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
