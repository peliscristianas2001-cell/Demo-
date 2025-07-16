
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Tour } from "@/lib/types"

interface FlyerFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  tours: Tour[]
  onSave: (tripId: string, flyerUrl: string) => void
}

export function FlyerForm({ isOpen, onOpenChange, tours, onSave }: FlyerFormProps) {
  const [selectedTrip, setSelectedTrip] = useState("")
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!isOpen) {
      setSelectedTrip("")
      setFlyerFile(null)
      setPreviewUrl(null)
    }
  }, [isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFlyerFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!selectedTrip || !flyerFile || !previewUrl) {
      toast({
        title: "Faltan datos",
        description: "Por favor, selecciona un viaje y sube un archivo.",
        variant: "destructive"
      })
      return
    }
    // In a real app, you would upload the file to a storage service and get a URL.
    // For this mock, we'll just use the local data URL from the preview.
    onSave(selectedTrip, previewUrl)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir Nuevo Flyer</DialogTitle>
          <DialogDescription>
            Selecciona el viaje y el archivo de imagen para el flyer promocional.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="trip">Viaje</Label>
            <Select onValueChange={setSelectedTrip} value={selectedTrip}>
              <SelectTrigger id="trip">
                <SelectValue placeholder="Selecciona un viaje" />
              </SelectTrigger>
              <SelectContent>
                {tours.map(tour => (
                  <SelectItem key={tour.id} value={tour.id}>
                    {tour.destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="flyerFile">Archivo del Flyer</Label>
            <Input
              id="flyerFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:text-primary-foreground file:font-bold file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-primary hover:file:bg-primary/90"
            />
          </div>
          {previewUrl && (
            <div className="space-y-2">
              <Label>Vista Previa</Label>
              <img src={previewUrl} alt="Vista previa del flyer" className="rounded-md object-cover w-full aspect-[4/5]" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar Flyer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
