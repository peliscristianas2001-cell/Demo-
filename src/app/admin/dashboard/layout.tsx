
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Ticket,
  Users,
  Image as ImageIcon,
  Plane,
  LogOut,
  Globe,
  LayoutDashboard,
  TicketCheck,
  PercentSquare,
  BarChart3,
  Briefcase,
  Calendar
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
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/trips", label: "Viajes", icon: Plane },
  { href: "/admin/dashboard/reservations", label: "Reservas", icon: Ticket },
  { href: "/admin/dashboard/passengers", label: "Pasajeros", icon: Users },
  { href: "/admin/dashboard/employees", label: "Empleados", icon: Briefcase },
  { href: "/admin/dashboard/sellers", label: "Vendedores", icon: PercentSquare },
  { href: "/admin/dashboard/flyers", label: "Flyers", icon: ImageIcon },
  { href: "/admin/dashboard/tickets", label: "Tickets", icon: TicketCheck },
  { href: "/admin/dashboard/reports", label: "Reportes", icon: BarChart3 },
  { href: "/admin/dashboard/calendar", label: "Calendario", icon: Calendar },
  { href: "/admin/dashboard/settings", label: "Configuración", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Ver Sitio Web"
                  >
                    <Link href="/" target="_blank">
                      <Globe />
                      <span>Ver Sitio Web</span>
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
                <SidebarMenuButton asChild tooltip="Salir del Panel">
                  <Link href="/">
                    <LogOut />
                    <span>Salir del Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <SidebarInset>
              <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
                   <SidebarTrigger className="md:hidden" />
                   <h1 className="text-xl font-semibold">Panel de Administración</h1>
              </header>
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
