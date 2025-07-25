
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockSellers } from '@/lib/mock-data';
import type { Seller } from '@/lib/types';

export default function EmployeeDashboardPage() {
    const [sellerName, setSellerName] = useState('');

    useEffect(() => {
        const employeeId = localStorage.getItem('ytl_employee_id');
        const sellers: Seller[] = JSON.parse(localStorage.getItem('ytl_sellers') || JSON.stringify(mockSellers));
        const currentSeller = sellers.find(s => s.id === employeeId);
        if (currentSeller) {
            setSellerName(currentSeller.name);
        }
    }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>¡Bienvenido/a a tu panel, {sellerName}!</CardTitle>
          <CardDescription>
            Desde aquí podrás gestionar tus ventas, ver la información de tus pasajeros y acceder a los materiales de los viajes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Utiliza el menú de la izquierda para navegar por las diferentes secciones. Para generar una nueva venta, haz click en "Nueva Venta".
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
