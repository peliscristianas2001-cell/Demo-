
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
    const { toast } = useToast()
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleLogoSave = () => {
        if (!selectedFile || !logoPreview) {
             toast({
                title: "No se seleccionó ningún archivo",
                description: "Por favor, elige un archivo para subir.",
                variant: "destructive"
            })
            return
        }

        try {
          localStorage.setItem("ytl_logo_url", logoPreview);
          toast({
              title: "¡Éxito!",
              description: "El nuevo logo se ha guardado. Se reflejará en todo el sitio.",
          })
          window.dispatchEvent(new Event('storage'));
        } catch (error) {
            toast({
                title: "Error al guardar",
                description: "No se pudo guardar el logo en el almacenamiento local.",
                variant: "destructive"
            })
        }
    }
    
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SettingsIcon className="w-6 h-6"/> Configuración General</CardTitle>
          <CardDescription>
            Administra las configuraciones generales del sitio web.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4 p-4 border rounded-lg">
                <Label htmlFor="logoFile" className="text-lg font-medium">Logo del Sitio Web</Label>
                <Input 
                    id="logoFile"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    className="file:text-primary-foreground file:font-bold file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-primary hover:file:bg-primary/90"
                />
                {logoPreview && (
                    <div className="space-y-2">
                        <Label>Vista previa del nuevo logo</Label>
                        <div className="flex items-center gap-4 p-4 border rounded-md bg-muted">
                            <Image
                                src={logoPreview}
                                alt="Vista previa del Logo"
                                width={64}
                                height={64}
                                className="rounded-full"
                            />
                            <p className="text-sm text-muted-foreground">
                                Así se verá tu logo. Haz clic en "Guardar Logo" para confirmar.
                            </p>
                        </div>
                    </div>
                )}
                <Button onClick={handleLogoSave} disabled={!logoPreview}>
                    <Upload className="mr-2 h-4 w-4" />
                    Guardar Logo
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
