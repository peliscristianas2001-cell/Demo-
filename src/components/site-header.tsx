
"use client"

import Link from "next/link"
import React, { useState } from "react"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { MenuIcon, LogInIcon } from "lucide-react"

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
        <div className="flex items-center justify-end flex-1 gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="w-6 h-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="p-6">
                  <Logo />
                </div>
                <nav className="flex flex-col gap-4 p-6 text-lg font-medium">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={label}
                      href={href}
                      className="transition-colors text-foreground hover:text-primary"
                      prefetch={false}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
                <div className="p-6 mt-auto">
                    <Button asChild className="w-full">
                    <Link href="/admin">
                        <LogInIcon className="w-4 h-4 mr-2" />
                        Admin Login
                    </Link>
                    </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
           <Button asChild className="hidden md:flex">
              <Link href="/admin">
                <LogInIcon className="w-4 h-4 mr-2" />
                Admin Login
              </Link>
            </Button>
        </div>
      </div>
    </header>
  )
}
