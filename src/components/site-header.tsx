
"use client"

import Link from "next/link"
import React from "react"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MenuIcon, LogInIcon, UserPlus } from "lucide-react"

export function SiteHeader() {
  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/tours", label: "Viajes" },
    { href: "/flyers", label: "Flyers" },
    { href: "/contact", label: "Contacto" },
  ]
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center h-16 max-w-screen-2xl">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        <nav className="items-center flex-1 hidden gap-6 text-sm font-medium md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="transition-colors text-foreground/60 hover:text-foreground/80"
              prefetch={false}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end flex-1 gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="w-6 h-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col p-0">
              <SheetHeader className="p-6">
                <SheetTitle className="sr-only">Menú Principal</SheetTitle>
                 <Logo />
              </SheetHeader>
              <div className="flex flex-col h-full flex-1 overflow-hidden">
                <nav className="flex-1 overflow-y-auto p-6 text-lg font-medium space-y-4">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={label}
                      href={href}
                      className="block transition-colors text-foreground hover:text-primary"
                      prefetch={false}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
                <div className="p-6 mt-auto space-y-4 border-t">
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/login">
                        <LogInIcon className="w-4 h-4 mr-2" />
                        Iniciar Sesión
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/login?mode=register">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Registro
                      </Link>
                    </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
           <div className="hidden md:flex items-center gap-2">
             <Button asChild variant="ghost">
                <Link href="/login">
                  <LogInIcon className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Link>
              </Button>
              <Button asChild>
                <Link href="/login?mode=register">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Registro
                </Link>
              </Button>
           </div>
        </div>
      </div>
    </header>
  )
}
