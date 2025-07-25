
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, Settings as SettingsIcon, Bus, Trash2, Edit, PlusCircle } from "lucide-react"
import { getVehicleConfig, saveVehicleConfig } from "@/lib/vehicle-config"
import type { CustomVehicleConfig } from "@/lib/types"
import { VehicleLayoutEditor } from "@/components/admin/vehicle-layout-editor"

type VehicleConfigState = Record<string, CustomVehicleConfig>;

export default function SettingsPage() {
    const { toast } = useToast()
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [vehicleConfig, setVehicleConfig] = useState<VehicleConfigState>(() => getVehicleConfig(true));
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingVehicleKey, setEditingVehicleKey] = useState<string | null>(null);

    useEffect(() => {
      const handleStorageChange = () => {
        setVehicleConfig(getVehicleConfig(true));
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
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

    const handleEditVehicle = (key: string) => {
        setEditingVehicleKey(key);
        setIsEditorOpen(true);
    };

    const handleAddNewVehicle = () => {
        setEditingVehicleKey(null); // No existing key means it's a new one
        setIsEditorOpen(true);
    };

    const handleDeleteVehicle = (keyToDelete: string) => {
      if (Object.keys(vehicleConfig).length <= 1) {
        toast({ title: "No se puede eliminar", description: "Debe existir al menos un tipo de vehículo.", variant: "destructive" });
        return;
      }
      const newConfig = { ...vehicleConfig };
      delete newConfig[keyToDelete];
      setVehicleConfig(newConfig);
      saveVehicleConfig(newConfig);
      toast({ title: "Vehículo Eliminado", description: "El tipo de vehículo fue eliminado." });
    };

    const handleSaveLayout = (key: string, newConfig: CustomVehicleConfig) => {
        const newKey = newConfig.name.toLowerCase().replace(/\s+/g, '_');
        const updatedVehicles = { ...vehicleConfig };

        if (editingVehicleKey && editingVehicleKey !== newKey) {
            // Key has changed, delete old one
            delete updatedVehicles[editingVehicleKey];
        }
        
        updatedVehicles[newKey] = newConfig;

        setVehicleConfig(updatedVehicles);
        saveVehicleConfig(updatedVehicles);
        setIsEditorOpen(false);
        setEditingVehicleKey(null);
    };
    
  return (
    <>
     <VehicleLayoutEditor
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onSave={handleSaveLayout}
        vehicleKey={editingVehicleKey}
        vehicleConfig={editingVehicleKey ? vehicleConfig[editingVehicleKey] : undefined}
      />
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
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Bus className="w-6 h-6"/> Tipos de Vehículo</CardTitle>
                            <CardDescription>
                                Añade, edita o elimina los tipos de vehículos y sus layouts de asientos.
                            </CardDescription>
                        </div>
                        <Button onClick={handleAddNewVehicle}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Vehículo
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                     {Object.entries(vehicleConfig).map(([key, config]) => (
                       <div key={key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                          <div className="font-medium">{config.name}</div>
                           <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" onClick={() => handleEditVehicle(key)}>
                               <Edit className="w-4 h-4" />
                               <span className="sr-only">Editar</span>
                             </Button>
                             <Button variant="destructive" size="icon" onClick={() => handleDeleteVehicle(key)}>
                               <Trash2 className="w-4 h-4" />
                               <span className="sr-only">Eliminar</span>
                             </Button>
                           </div>
                       </div>
                    ))}
                </CardContent>
             </Card>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
