
"use client";

import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { EmployeeRegisterForm } from "@/components/auth/employee-register-form";

export default function EmployeeRegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">
            Completar Registro de Empleado
          </CardTitle>
          <CardDescription>
            Crea una contraseña para acceder a tu panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="flex justify-center items-center p-10">
              <Loader2 className="w-12 h-12 animate-spin text-primary"/>
            </div>
          }>
            <EmployeeRegisterForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
