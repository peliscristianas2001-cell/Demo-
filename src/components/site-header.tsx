
"use client"

import Link from "next/link"
import React, { useState, useEffect, useCallback } from "react"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { MenuIcon, LogInIcon } from "lucide-react"

export function SiteHeader() {
  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/tours", label: "Viajes" },
    { href: "/vouchers", label: "Vouchers" },
    { href: "/flyers", label: "Flyers" },
    { href: "/contact", label: "Contacto" },
  ]
  
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [keySequence, setKeySequence] = useState<string[]>([])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.altKey) {
      const key = event.key.toLowerCase()
      const targetSequence = ['y', 't', 'l']
      
      let currentSequence = [...keySequence, key]

      // Check if current sequence is a prefix of targetSequence
      if (targetSequence.slice(0, currentSequence.length).join('') !== currentSequence.join('')) {
        // Incorrect key, reset. If the key is 'y', start a new sequence.
        currentSequence = key === 'y' ? ['y'] : []
      }
      
      setKeySequence(currentSequence)

      if (currentSequence.join('') === targetSequence.join('')) {
        setShowAdminLogin(true)
        setKeySequence([]) // Reset after success
      }
    } else {
      // If other keys are pressed without Ctrl+Alt, reset the sequence
      setKeySequence([])
    }
  }, [keySequence])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])


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
                {showAdminLogin && (
                  <div className="p-6 mt-auto">
                     <Button asChild className="w-full">
                        <Link href="/admin">
                          <LogInIcon className="w-4 h-4 mr-2" />
                          Admin Login
                        </Link>
                      </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
           {showAdminLogin && (
            <Button asChild className="hidden md:flex">
                <Link href="/admin">
                  <LogInIcon className="w-4 h-4 mr-2" />
                  Admin Login
                </Link>
              </Button>
            )}
        </div>
      </div>
    </header>
  )
}
