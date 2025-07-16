"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"

export default function SettingsPage() {
    const { toast } = useToast()
    const [logoPreview, setLogoPreview] = useState("https://instagram.fepa9-2.fna.fbcdn.net/v/t51.2885-19/478145482_2050373918705456_5085497722998866930_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fepa9-2.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QFzjVvSlHCf0Z2hstJHws97y0Q1b3iIKZskWlJOzKkzsXA5d7w5jeqV3MF8EUnkXK0&_nc_ohc=0kFfIMnvmBwQ7kNvwHJGNkB&_nc_gid=9W3okjmGr8DgZuyMHj14tg&edm=AEYEu-QBAAAA&ccb=7-5&oh=00_AfSWH7AGXQ1um0uq2Vfz-d6jjRHQIyOiIFf90fiE8TXyiA&oe=687DAD20&_nc_sid=ead929")
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

    const handleSave = () => {
        // In a real app, you would upload `selectedFile` to a storage service
        // and get back a permanent URL to save.
        // For now, we'll just show a success message.
        if (!selectedFile) {
             toast({
                title: "No se seleccionó ningún archivo",
                description: "Por favor, elige un archivo para subir.",
                variant: "destructive"
            })
            return
        }

        console.log("Simulating upload for:", selectedFile.name);
        toast({
            title: "¡Éxito!",
            description: "El logo se ha actualizado en la vista previa. El guardado permanente se habilitará con un backend.",
        })
    }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>
            Administra las configuraciones generales del sitio web.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <Label htmlFor="logoFile">Subir nuevo logo</Label>
                <Input 
                    id="logoFile"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    className="file:text-primary-foreground file:font-bold file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-primary hover:file:bg-primary/90"
                />
            </div>
            {logoPreview && (
                <div className="space-y-2">
                    <Label>Vista previa del logo actual</Label>
                    <div className="flex items-center gap-4 p-4 border rounded-md bg-muted">
                         <Image
                            src={logoPreview}
                            alt="Vista previa del Logo"
                            width={64}
                            height={64}
                            className="rounded-full"
                        />
                        <p className="text-sm text-muted-foreground">
                            Así se verá tu logo en el sitio. Haz clic en "Guardar Logo" para confirmar el cambio.
                        </p>
                    </div>
                </div>
            )}
           <Button onClick={handleSave}>
                <Upload className="mr-2 h-4 w-4" />
                Guardar Logo
            </Button>
        </CardContent>
      </Card>
    </div>
  )
}
