
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
  Home,
  HelpCircle,
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
import { LanguageToggle } from "@/components/language-toggle";

const navItems = [
  { href: "/employee/dashboard", label: "Inicio", icon: Home },
  { href: "/employee/dashboard/trips", label: "Viajes", icon: Plane },
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
    const employeeId = localStorage.getItem("app_employee_id");
    if (!employeeId) {
        router.replace('/login');
        return;
    }
    const employees: Employee[] = JSON.parse(localStorage.getItem("app_employees") || JSON.stringify(mockEmployees));
    const isEmployeeValid = employees.some(s => s.id === employeeId && s.password);

    if (!isEmployeeValid) {
        localStorage.removeItem("app_employee_id"); // Clean up invalid ID
        router.replace('/login');
    }
  }, [router, pathname]); // Re-check on every route change within the dashboard

  const handleLogout = () => {
    localStorage.removeItem("app_employee_id");
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent className="bg-card flex flex-col">
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <div className="flex-1 overflow-y-auto">
              <SidebarMenu>
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
            </div>
            <SidebarFooter className="mt-auto">
              <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
                      <LogOut />
                      <span>Cerrar Sesión</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
                 <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-xl font-semibold hidden md:block">Panel de Empleado</h1>
                 </div>
                 <div className="flex items-center gap-2">
                    <LanguageToggle />
                 </div>
            </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
