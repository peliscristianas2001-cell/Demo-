
"use client"

import Link from "next/link"
import React from "react"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MenuIcon, LogInIcon, UserPlus, UserCircle, LogOut, Settings } from "lucide-react"
import { useAuth } from "./auth/auth-provider"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { LanguageToggle } from "./language-toggle"


export function SiteHeader() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("ytl_user_id");
    router.push('/');
  }

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
                    {user ? (
                         <Button onClick={handleLogout} className="w-full" variant="outline">
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                         </Button>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
            <div className="hidden md:flex items-center gap-2">
                <LanguageToggle />
                <div className="w-px h-6 bg-border mx-2" />
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Usuario'} />
                                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                             <DropdownMenuItem asChild>
                                <Link href="/profile"><Settings className="mr-2"/>Mi Perfil</Link>
                             </DropdownMenuItem>
                            <DropdownMenuItem>Mis Viajes</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                <LogOut className="mr-2"/>
                                Cerrar Sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
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
                    </>
                )}
           </div>
        </div>
      </div>
    </header>
  )
}
