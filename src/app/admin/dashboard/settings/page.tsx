
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Upload, Settings as SettingsIcon, Ticket, UserCheck, CheckCircle } from "lucide-react"
import type { VoucherSettings } from "@/lib/types"

export default function SettingsPage() {
    const { toast } = useToast()
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    
    const [voucherSettings, setVoucherSettings] = useState<VoucherSettings>({
      visibility: "all",
      minTrips: 1
    })

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem("ytl_voucher_settings")
            if (savedSettings) {
                setVoucherSettings(JSON.parse(savedSettings))
            }
        } catch (error) {
            console.error("Failed to load voucher settings from local storage", error)
        }
    }, [])

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
    
    const handleSettingsSave = () => {
      try {
        localStorage.setItem("ytl_voucher_settings", JSON.stringify(voucherSettings))
        toast({
          title: "¡Configuración Guardada!",
          description: "Las reglas de visibilidad de vouchers han sido actualizadas.",
        })
      } catch (error) {
        toast({
          title: "Error al guardar",
          description: "No se pudo guardar la configuración de vouchers.",
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
            
             <Card className="bg-secondary/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Ticket className="w-6 h-6"/> Configuración de Vouchers</CardTitle>
                    <CardDescription>Define quién puede ver y acceder a los vouchers de regalo en el sitio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Visibilidad de Vouchers</Label>
                        <RadioGroup 
                            value={voucherSettings.visibility} 
                            onValueChange={(value: "all" | "registered") => setVoucherSettings(prev => ({...prev, visibility: value}))}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="r1" />
                                <Label htmlFor="r1">Mostrar a todos los visitantes (público general)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="registered" id="r2" />
                                <Label htmlFor="r2">Mostrar solo a clientes registrados que cumplan una condición</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {voucherSettings.visibility === 'registered' && (
                        <div className="p-4 space-y-3 rounded-lg bg-background/70 border-l-4 border-primary animate-fade-in-down">
                            <Label htmlFor="minTrips" className="flex items-center gap-2 text-base font-semibold">
                                <UserCheck className="w-5 h-5"/>
                                Condición para Clientes
                            </Label>
                             <p className="text-sm text-muted-foreground">
                                Mostrar vouchers solo a clientes que hayan completado al menos esta cantidad de viajes:
                            </p>
                            <Input
                                id="minTrips"
                                type="number"
                                value={voucherSettings.minTrips}
                                onChange={(e) => setVoucherSettings(prev => ({...prev, minTrips: parseInt(e.target.value) || 1}))}
                                className="w-48"
                                min="1"
                            />
                        </div>
                    )}
                     <Button onClick={handleSettingsSave}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Guardar Configuración de Vouchers
                    </Button>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
    </div>
  )
}
