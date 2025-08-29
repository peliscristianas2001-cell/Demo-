
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockEmployees } from '@/lib/mock-data';
import type { Employee } from '@/lib/types';

export default function EmployeeDashboardPage() {
    const [employeeName, setEmployeeName] = useState('');

    useEffect(() => {
        const employeeId = localStorage.getItem('ytl_employee_id');
        const employees: Employee[] = JSON.parse(localStorage.getItem('ytl_employees') || JSON.stringify(mockEmployees));
        const currentEmployee = employees.find(s => s.id === employeeId);
        if (currentEmployee) {
            setEmployeeName(currentEmployee.name);
        }
    }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>¡Bienvenido/a a tu panel, {employeeName}!</CardTitle>
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
