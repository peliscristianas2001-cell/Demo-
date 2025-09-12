
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "../ui/scroll-area"

interface GuideDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  title: string
  description?: string
  content: React.ReactNode
}

export function GuideDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  content,
}: GuideDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col h-full max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            <div className="py-4 space-y-4 text-sm text-muted-foreground prose prose-sm prose-p:leading-relaxed prose-headings:text-foreground">
              {content}
            </div>
        </div>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
