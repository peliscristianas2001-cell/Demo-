
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Settings,
  Ticket,
  Users,
  Image as ImageIcon,
  LogOut,
  TicketCheck,
  Plane,
  Home
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { mockEmployees } from "@/lib/mock-data";
import type { Employee } from "@/lib/types";

const navItems = [
  { href: "/employee/dashboard", label: "Inicio", icon: Home },
  { href: "/employee/dashboard/reservations", label: "Reservas", icon: Ticket },
  { href: "/employee/dashboard/passengers", label: "Pasajeros", icon: Users },
  { href: "/employee/dashboard/flyers", label: "Flyers", icon: ImageIcon },
  { href: "/employee/dashboard/tickets", label: "Tickets", icon: TicketCheck },
  { href: "/employee/dashboard/settings", label: "Mi Perfil", icon: Settings },
];

export default function EmployeeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const employeeId = localStorage.getItem("ytl_employee_id");
    const employees: Employee[] = JSON.parse(localStorage.getItem("ytl_employees") || JSON.stringify(mockEmployees));
    const isEmployeeValid = employees.some(s => s.id === employeeId && s.password);

    if (!employeeId || !isEmployeeValid) {
        localStorage.removeItem("ytl_employee_id"); // Clean up invalid ID
        router.replace('/login');
    }
  }, [router, pathname]); // Re-check on every route change within the dashboard

  const handleLogout = () => {
    localStorage.removeItem("ytl_employee_id");
    router.push('/');
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent className="bg-card">
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Crear Nueva Reserva"
                  >
                    <Link href="/tours">
                      <Plane />
                      <span>Nueva Venta</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
                    <LogOut />
                    <span>Cerrar Sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
                 <SidebarTrigger className="md:hidden" />
                 <h1 className="text-xl font-semibold">Panel de Empleado</h1>
            </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
