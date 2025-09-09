
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, Settings as SettingsIcon, Bus, Trash2, Edit, PlusCircle, Ship, Plane, Save, MapPin, Loader2, Pin, Contact, Utensils, BedDouble, Folder, ShieldCheck } from "lucide-react"
import { getLayoutConfig, saveLayoutConfig } from "@/lib/layout-config"
import type { CustomLayoutConfig, LayoutCategory, GeneralSettings, GeoSettings, BoardingPoint, ContactSettings, Pension, RoomType, Employee } from "@/lib/types"
import { LayoutEditor } from "@/components/admin/layout-editor"
import { mockBoardingPoints, mockPensions, mockRoomTypes, mockEmployees } from "@/lib/mock-data"
import { auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"

const MapSelector = dynamic(
  () => import('@/components/admin/map-selector').then((mod) => mod.MapSelector),
  { 
    ssr: false,
    loading: () => <div className="h-96 flex items-center justify-center bg-muted rounded-lg"><Loader2 className="w-8 h-8 animate-spin"/></div>
  }
)

const GoogleIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.712,34.464,44,28.756,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


type LayoutConfigState = ReturnType<typeof getLayoutConfig>;

export default function SettingsPage() {
    const { toast } = useToast()
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfigState>(() => getLayoutConfig());
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({ mainWhatsappNumber: "", calendarDownloadFolder: "Calendarios YO-TE-LLEVO", reportDownloadFolder: "Reportes Gen. YO-TE-LLEVO" });
    const [contactSettings, setContactSettings] = useState<ContactSettings>({});
    const [geoSettings, setGeoSettings] = useState<GeoSettings>({ latitude: -34.6037, longitude: -58.3816, radiusKm: 100 });
    const [boardingPoints, setBoardingPoints] = useState<BoardingPoint[]>([]);
    const [pensions, setPensions] = useState<Pension[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingLayout, setEditingLayout] = useState<{ category: LayoutCategory, key: string | null } | null>(null);
    const [adminAuthEmail, setAdminAuthEmail] = useState('');
    const [adminAuthPassword, setAdminAuthPassword] = useState('');
    const [adminUser, setAdminUser] = useState<Employee | null>(null);

    useEffect(() => {
        const storedGeneralSettings = localStorage.getItem("ytl_general_settings");
        if (storedGeneralSettings) {
          const parsed = JSON.parse(storedGeneralSettings);
          setGeneralSettings(parsed);
          if (parsed.contact) {
            setContactSettings(parsed.contact);
          }
        }
        
        const storedGeoSettings = localStorage.getItem("ytl_geo_settings");
        if (storedGeoSettings) setGeoSettings(JSON.parse(storedGeoSettings));
        
        const storedBoardingPoints = localStorage.getItem("ytl_boarding_points");
        setBoardingPoints(storedBoardingPoints ? JSON.parse(storedBoardingPoints) : mockBoardingPoints);

        const storedPensions = localStorage.getItem("ytl_pensions");
        setPensions(storedPensions ? JSON.parse(storedPensions) : mockPensions);

        const storedRoomTypes = localStorage.getItem("ytl_room_types");
        setRoomTypes(storedRoomTypes ? JSON.parse(storedRoomTypes) : mockRoomTypes);
        
        const allEmployees = JSON.parse(localStorage.getItem('ytl_employees') || JSON.stringify(mockEmployees));
        const admin = allEmployees.find((e: Employee) => e.dni === '99999999');
        setAdminUser(admin);


      const handleStorageChange = () => {
        // Force a re-read from localStorage when other tabs change it
        setLayoutConfig(getLayoutConfig(true));
        const newBoardingPoints = localStorage.getItem("ytl_boarding_points");
        setBoardingPoints(newBoardingPoints ? JSON.parse(newBoardingPoints) : mockBoardingPoints);
        const newPensions = localStorage.getItem("ytl_pensions");
        setPensions(newPensions ? JSON.parse(newPensions) : mockPensions);
        const newRoomTypes = localStorage.getItem("ytl_room_types");
        setRoomTypes(newRoomTypes ? JSON.parse(newRoomTypes) : mockRoomTypes);
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

    const handleGeneralSettingsChange = (field: keyof GeneralSettings, value: string) => {
        setGeneralSettings(prev => ({ ...prev, [field]: value }));
    }

    const handleGeneralSettingsSave = () => {
        const newSettings = { ...generalSettings, contact: contactSettings };
        localStorage.setItem("ytl_general_settings", JSON.stringify(newSettings));
        toast({
            title: "Configuración guardada",
            description: "Los ajustes generales han sido actualizados."
        })
        window.dispatchEvent(new Event('storage'));
    }

    const handleContactSettingsChange = (field: keyof ContactSettings, value: string) => {
        setContactSettings(prev => ({ ...prev, [field]: value }));
    }
    
    const handleGeoSettingsSave = () => {
        localStorage.setItem("ytl_geo_settings", JSON.stringify(geoSettings));
         toast({
            title: "Zona guardada",
            description: "La zona de servicio ha sido actualizada."
        })
    }

    const handleEditLayout = (category: LayoutCategory, key: string) => {
        setEditingLayout({ category, key });
        setIsEditorOpen(true);
    };

    const handleAddNewLayout = (category: LayoutCategory) => {
        setEditingLayout({ category, key: null });
        setIsEditorOpen(true);
    };

    const handleDeleteLayout = (category: LayoutCategory, keyToDelete: string) => {
      const currentConfig = getLayoutConfig();
      if (currentConfig[category] && currentConfig[category][keyToDelete]) {
        delete currentConfig[category][keyToDelete];
        saveLayoutConfig(currentConfig);
        setLayoutConfig(currentConfig);
      }
      toast({ title: "Elemento Eliminado", description: "El tipo fue eliminado." });
    };

    const handleSaveLayout = (originalKey: string | null, newConfig: CustomLayoutConfig) => {
        if (!editingLayout) return;

        const { category } = editingLayout;
        const newKey = newConfig.name.toLowerCase().replace(/\s+/g, '_');

        const currentFullConfig = getLayoutConfig();

        if (!currentFullConfig[category]) {
            currentFullConfig[category] = {};
        }

        const categoryConfig = currentFullConfig[category];
        
        if (originalKey && originalKey !== newKey) {
            delete categoryConfig[originalKey];
        }
        
        categoryConfig[newKey] = newConfig;
        
        saveLayoutConfig(currentFullConfig);
        
        setLayoutConfig(currentFullConfig);

        setIsEditorOpen(false);
        setEditingLayout(null);
        toast({ title: "¡Guardado!", description: `El layout "${newConfig.name}" se ha guardado.` });
    };

    const handleAddBoardingPoint = () => {
        setBoardingPoints(prev => [...prev, { id: `BP-${Date.now()}`, name: '' }]);
    }

    const handleBoardingPointChange = (id: string, name: string) => {
        setBoardingPoints(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    }

    const handleRemoveBoardingPoint = (id: string) => {
        setBoardingPoints(prev => prev.filter(p => p.id !== id));
    }
    
    const handleSaveBoardingPoints = () => {
        const filteredPoints = boardingPoints.filter(p => p.name.trim() !== "");
        localStorage.setItem("ytl_boarding_points", JSON.stringify(filteredPoints));
        setBoardingPoints(filteredPoints);
        toast({ title: "Puntos de embarque guardados." });
        window.dispatchEvent(new Event('storage'));
    }

    const handleAddPension = () => {
        setPensions(prev => [...prev, { id: `PENSION-${Date.now()}`, name: '', description: '' }]);
    }

    const handlePensionChange = (id: string, field: 'name' | 'description', value: string) => {
        setPensions(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    }

    const handleRemovePension = (id: string) => {
        setPensions(prev => prev.filter(p => p.id !== id));
    }
    
    const handleSavePensions = () => {
        const filteredPensions = pensions.filter(p => p.name.trim() !== "");
        localStorage.setItem("ytl_pensions", JSON.stringify(filteredPensions));
        setPensions(filteredPensions);
        toast({ title: "Tipos de pensión guardados." });
        window.dispatchEvent(new Event('storage'));
    }

    const handleAddRoomType = () => {
        setRoomTypes(prev => [...prev, { id: `RT-${Date.now()}`, name: '' }]);
    }

    const handleRoomTypeChange = (id: string, name: string) => {
        setRoomTypes(prev => prev.map(rt => rt.id === id ? { ...rt, name } : rt));
    }

    const handleRemoveRoomType = (id: string) => {
        setRoomTypes(prev => prev.filter(rt => rt.id !== id));
    }
    
    const handleSaveRoomTypes = () => {
        const filteredRoomTypes = roomTypes.filter(rt => rt.name.trim() !== "");
        localStorage.setItem("ytl_room_types", JSON.stringify(filteredRoomTypes));
        setRoomTypes(filteredRoomTypes);
        toast({ title: "Tipos de habitación guardados." });
        window.dispatchEvent(new Event('storage'));
    }

    const layoutCategoryDetails = {
        vehicles: { icon: Bus, title: "Tipos de Vehículo" },
        airplanes: { icon: Plane, title: "Tipos de Avión" },
        cruises: { icon: Ship, title: "Tipos de Crucero" },
    }
    
    const updateAdminEmail = (email: string) => {
      if (!adminUser) return;
      const allEmployees: Employee[] = JSON.parse(localStorage.getItem('ytl_employees') || '[]');
      const updatedEmployees = allEmployees.map(e => e.id === adminUser.id ? { ...e, email } : e);
      localStorage.setItem('ytl_employees', JSON.stringify(updatedEmployees));
      setAdminUser(prev => prev ? { ...prev, email } : null);
    }
    
    const handleEmailLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminAuthEmail || !adminAuthPassword) {
            toast({ title: 'Error', description: 'Email y contraseña son requeridos.', variant: 'destructive'});
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, adminAuthEmail, adminAuthPassword);
            updateAdminEmail(adminAuthEmail);
            toast({ title: '¡Éxito!', description: 'Cuenta de administrador vinculada con email.'});
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                 toast({ title: "Email ya registrado", description: "Este email ya está en uso por otra cuenta.", variant: "destructive"});
            } else {
                toast({ title: 'Error', description: 'No se pudo vincular la cuenta.', variant: 'destructive'});
            }
            console.error(error);
        }
    }
    
    const handleGoogleLink = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            if (result.user.email) {
                 updateAdminEmail(result.user.email);
                 toast({ title: '¡Éxito!', description: 'Cuenta de administrador vinculada con Google.'});
            }
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo vincular la cuenta con Google.', variant: 'destructive'});
            console.error(error);
        }
    }
    
  return (
    <>
     <LayoutEditor
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onSave={handleSaveLayout}
        layoutKey={editingLayout?.key}
        category={editingLayout?.category}
        layoutConfig={editingLayout?.key && editingLayout?.category ? layoutConfig[editingLayout.category][editingLayout.key] : undefined}
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
            
             <div className="space-y-4 p-4 border rounded-lg">
                <Label className="text-lg font-medium">Ajustes Generales</Label>
                 <div className="space-y-2">
                    <Label htmlFor="main-whatsapp">Número de WhatsApp Principal</Label>
                    <Input 
                        id="main-whatsapp"
                        type="tel"
                        placeholder="Ej: 5491122334455"
                        value={generalSettings.mainWhatsappNumber || ''}
                        onChange={(e) => handleGeneralSettingsChange('mainWhatsappNumber', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Este número se usará si un vendedor no tiene uno asignado.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="calendar-folder" className="flex items-center gap-2"><Folder/> Nombre Carpeta Calendarios</Label>
                        <Input id="calendar-folder" value={generalSettings.calendarDownloadFolder} onChange={(e) => handleGeneralSettingsChange('calendarDownloadFolder', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="report-folder" className="flex items-center gap-2"><Folder/> Nombre Carpeta Reportes</Label>
                        <Input id="report-folder" value={generalSettings.reportDownloadFolder} onChange={(e) => handleGeneralSettingsChange('reportDownloadFolder', e.target.value)} />
                    </div>
                </div>

                <Button onClick={handleGeneralSettingsSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Ajustes
                </Button>
            </div>

            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-6 h-6"/> Seguridad de la Cuenta</CardTitle>
                  <CardDescription>Vincula tu cuenta de administrador a un correo para mayor seguridad y un inicio de sesión más rápido.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {adminUser && adminUser.email ? (
                      <div className="p-4 border rounded-lg bg-green-50 text-green-800">
                          <p>Esta cuenta de administrador está vinculada al correo: <span className="font-bold">{adminUser.email}</span></p>
                      </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <form onSubmit={handleEmailLink} className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold">Vincular con Email y Contraseña</h3>
                            <div className="space-y-2">
                                <Label htmlFor="admin-email">Email</Label>
                                <Input id="admin-email" type="email" value={adminAuthEmail} onChange={e => setAdminAuthEmail(e.target.value)} required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-password">Contraseña</Label>
                                <Input id="admin-password" type="password" value={adminAuthPassword} onChange={e => setAdminAuthPassword(e.target.value)} required/>
                            </div>
                            <Button type="submit">Vincular Cuenta</Button>
                        </form>
                        <div className="space-y-4 p-4 border rounded-lg flex flex-col items-start justify-center">
                             <h3 className="font-semibold">Vincular con Google</h3>
                             <p className="text-sm text-muted-foreground">Usa tu cuenta de Google para un inicio de sesión rápido y seguro.</p>
                             <Button onClick={handleGoogleLink} variant="outline" className="w-full">
                                <GoogleIcon/> Continuar con Google
                            </Button>
                        </div>
                    </div>
                  )}
              </CardContent>
          </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Contact className="w-6 h-6"/> Datos de Contacto</CardTitle>
                    <CardDescription>Esta información se mostrará en la página de contacto pública.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact-address">Dirección</Label>
                            <Input id="contact-address" value={contactSettings.address || ''} onChange={(e) => handleContactSettingsChange('address', e.target.value)} placeholder="Calle Falsa 123, Ciudad"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact-phone">Teléfono de Contacto</Label>
                            <Input id="contact-phone" value={contactSettings.phone || ''} onChange={(e) => handleContactSettingsChange('phone', e.target.value)} placeholder="011-4567-8901"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact-email">Email</Label>
                            <Input id="contact-email" type="email" value={contactSettings.email || ''} onChange={(e) => handleContactSettingsChange('email', e.target.value)} placeholder="contacto@empresa.com"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact-hours">Horario de Atención</Label>
                            <Input id="contact-hours" value={contactSettings.hours || ''} onChange={(e) => handleContactSettingsChange('hours', e.target.value)} placeholder="Lunes a Viernes de 9 a 18hs"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="contact-instagram">Instagram</Label>
                            <Input id="contact-instagram" value={contactSettings.instagram || ''} onChange={(e) => handleContactSettingsChange('instagram', e.target.value)} placeholder="https://instagram.com/usuario"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="contact-facebook">Facebook</Label>
                            <Input id="contact-facebook" value={contactSettings.facebook || ''} onChange={(e) => handleContactSettingsChange('facebook', e.target.value)} placeholder="https://facebook.com/usuario"/>
                        </div>
                    </div>
                     <Button onClick={handleGeneralSettingsSave}>
                        <Save className="mr-2 h-4 w-4"/> Guardar Datos de Contacto
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Pin className="w-6 h-6"/> Puntos de Embarque</CardTitle>
                    <CardDescription>Añade y gestiona las paradas o puntos de encuentro para los viajes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {boardingPoints.map((point) => (
                           <div key={point.id} className="flex items-center gap-2">
                               <Input 
                                   value={point.name}
                                   onChange={(e) => handleBoardingPointChange(point.id, e.target.value)}
                                   placeholder="Nombre de la parada..."
                                />
                               <Button variant="ghost" size="icon" onClick={() => handleRemoveBoardingPoint(point.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive"/>
                               </Button>
                           </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center">
                        <Button variant="outline" onClick={handleAddBoardingPoint}>
                           <PlusCircle className="mr-2 h-4 w-4"/> Añadir Parada
                        </Button>
                         <Button onClick={handleSaveBoardingPoints}>
                           <Save className="mr-2 h-4 w-4"/> Guardar Paradas
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Utensils className="w-6 h-6"/> Tipos de Pensión</CardTitle>
                    <CardDescription>Gestiona los tipos de pensiones que se pueden asignar a una reserva.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {pensions.map((pension) => (
                           <div key={pension.id} className="flex items-center gap-2">
                               <Input 
                                   value={pension.name}
                                   onChange={(e) => handlePensionChange(pension.id, 'name', e.target.value)}
                                   placeholder="Nombre de la pensión (Ej: Media Pensión)"
                                />
                                <Input 
                                   value={pension.description}
                                   onChange={(e) => handlePensionChange(pension.id, 'description', e.target.value)}
                                   placeholder="Descripción (Ej: Desayuno y cena)"
                                />
                               <Button variant="ghost" size="icon" onClick={() => handleRemovePension(pension.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive"/>
                               </Button>
                           </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center">
                        <Button variant="outline" onClick={handleAddPension}>
                           <PlusCircle className="mr-2 h-4 w-4"/> Añadir Tipo de Pensión
                        </Button>
                         <Button onClick={handleSavePensions}>
                           <Save className="mr-2 h-4 w-4"/> Guardar Pensiones
                        </Button>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BedDouble className="w-6 h-6"/> Tipos de Habitación</CardTitle>
                    <CardDescription>Añade y gestiona los tipos de habitaciones disponibles.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {roomTypes.map((rt) => (
                           <div key={rt.id} className="flex items-center gap-2">
                               <Input 
                                   value={rt.name}
                                   onChange={(e) => handleRoomTypeChange(rt.id, e.target.value)}
                                   placeholder="Nombre de la habitación (Ej: Doble Matrimonial)"
                                />
                               <Button variant="ghost" size="icon" onClick={() => handleRemoveRoomType(rt.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive"/>
                               </Button>
                           </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center">
                        <Button variant="outline" onClick={handleAddRoomType}>
                           <PlusCircle className="mr-2 h-4 w-4"/> Añadir Tipo de Habitación
                        </Button>
                         <Button onClick={handleSaveRoomTypes}>
                           <Save className="mr-2 h-4 w-4"/> Guardar Habitaciones
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4 p-4 border rounded-lg">
                <Label className="text-lg font-medium flex items-center gap-2"><MapPin className="w-5 h-5"/> Zona Geográfica</Label>
                <p className="text-sm text-muted-foreground">Define el centro y el radio de tu zona de servicio.</p>
                 <MapSelector
                    settings={geoSettings}
                    onSettingsChange={setGeoSettings}
                 />
                <Button onClick={handleGeoSettingsSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Zona
                </Button>
            </div>


            {(Object.keys(layoutCategoryDetails) as LayoutCategory[]).map(category => {
                const details = layoutCategoryDetails[category];
                const Icon = details.icon;
                return (
                    <Card key={category}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="flex items-center gap-2"><Icon className="w-6 h-6"/> {details.title}</CardTitle>
                                    <CardDescription>Añade, edita o elimina los tipos y sus layouts.</CardDescription>
                                </div>
                                <Button onClick={() => handleAddNewLayout(category)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Añadir
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {Object.entries(layoutConfig[category] || {}).map(([key, config]) => (
                               <div key={key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                  <div className="font-medium">{config.name}</div>
                                   <div className="flex items-center gap-2">
                                     <Button variant="outline" size="icon" onClick={() => handleEditLayout(category, key)}>
                                       <Edit className="w-4 h-4" />
                                       <span className="sr-only">Editar</span>
                                     </Button>
                                     <Button variant="destructive" size="icon" onClick={() => handleDeleteLayout(category, key)}>
                                       <Trash2 className="w-4 h-4" />
                                       <span className="sr-only">Eliminar</span>
                                     </Button>
                                   </div>
                               </div>
                            ))}
                            {Object.keys(layoutConfig[category] || {}).length === 0 && (
                                <p className="text-sm text-muted-foreground p-4 text-center">No hay tipos definidos para esta categoría.</p>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </CardContent>
      </Card>
    </div>
    </>
  )
}
