
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";
import { mockEmployees } from "@/lib/mock-data";
import type { Employee } from "@/lib/types";

export function EmployeeRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const id = searchParams.get('employeeId');
    if (id) {
        setEmployeeId(id);
        const storedEmployees = JSON.parse(localStorage.getItem("app_employees") || JSON.stringify(mockEmployees));
        setEmployees(storedEmployees);
    }
  }, [searchParams]);

  const employee = useMemo(() => employees.find(s => s.id === employeeId), [employees, employeeId]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) {
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

    const updatedEmployee = { ...employee, password };
    const updatedEmployees = employees.map(s => s.id === employeeId ? updatedEmployee : s);
    localStorage.setItem("app_employees", JSON.stringify(updatedEmployees));

    toast({
        title: "¡Registro completado!",
        description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
    });

    setTimeout(() => {
        router.push("/login");
    }, 2000);
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="w-12 h-12 animate-spin text-primary"/>
      </div>
    );
  }

  if (!employee && employeeId) {
    return (
        <p className="text-center text-muted-foreground p-4">
            Verificando datos del empleado...
        </p>
    );
  }

  if (!employee) {
      return (
          <p className="text-center text-muted-foreground p-4">
              Link inválido o no se encontró el ID del empleado.
          </p>
      )
  }

  return (
    <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-2">
            <Label>Nombre (asignado por admin)</Label>
            <Input 
                value={employee.name}
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
  );
}
