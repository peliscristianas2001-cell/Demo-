
"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon">
                    <div className="w-6 h-6 flex items-center justify-center font-bold text-sm">ES</div>
                 </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>Español</DropdownMenuItem>
                <DropdownMenuItem>English</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
