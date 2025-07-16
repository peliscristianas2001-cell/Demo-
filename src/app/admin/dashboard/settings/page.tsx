"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"

export default function SettingsPage() {
    const { toast } = useToast()
    const [logoUrl, setLogoUrl] = useState("https://instagram.fepa9-2.fna.fbcdn.net/v/t51.2885-19/478145482_2050373918705456_5085497722998866930_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fepa9-2.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QFzjVvSlHCf0Z2hstJHws97y0Q1b3iIKZskWlJOzKkzsXA5d7w5jeqV3MF8EUnkXK0&_nc_ohc=0kFfIMnvmBwQ7kNvwHJGNkB&_nc_gid=9W3okjmGr8DgZuyMHj14tg&edm=AEYEu-QBAAAA&ccb=7-5&oh=00_AfSWH7AGXQ1um0uq2Vfz-d6jjRHQIyOiIFf90fiE8TXyiA&oe=687DAD20&_nc_sid=ead929")

    const handleSave = () => {
        // Here you would typically save the settings to a database or a config file.
        // For now, we'll just show a success message.
        console.log("Saving new logo URL:", logoUrl);
        toast({
            title: "Configuración guardada",
            description: "La URL del logo se ha actualizado correctamente.",
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
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="logoUrl">URL del Logo</Label>
                <p className="text-sm text-muted-foreground">
                    Pega la URL pública de la imagen de tu logo. Por ahora, no se puede subir un archivo directamente.
                </p>
                <Input 
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                />
            </div>
           <Button onClick={handleSave}>
                <Upload className="mr-2 h-4 w-4" />
                Guardar Logo
            </Button>
        </CardContent>
      </Card>
    </div>
  )
}
