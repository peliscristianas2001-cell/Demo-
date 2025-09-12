
"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPinIcon, Clock, Instagram, Facebook } from "lucide-react"
import { type GeneralSettings } from "@/lib/types"

const InfoRow = ({ icon: Icon, label, value, href }: { icon: React.ElementType, label: string, value?: string, href?: string }) => {
    if (!value) return null;
    
    const content = href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary break-all">
            {value}
        </a>
    ) : (
        <span className="break-all">{value}</span>
    );
    
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{content}</p>
            </div>
        </div>
    )
}

export default function ContactPage() {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);

  useEffect(() => {
    const storedSettings = localStorage.getItem("app_general_settings");
    if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
    }
     const handleStorageChange = () => {
        const newStoredSettings = localStorage.getItem("app_general_settings")
        if (newStoredSettings) setSettings(JSON.parse(newStoredSettings))
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const contact = settings?.contact;

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-12 md:py-24">
          <div className="mx-auto max-w-2xl">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <Mail className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline">
                  Ponete en Contacto
                </CardTitle>
                 <p className="text-muted-foreground pt-2">
                  ¿Tenés dudas o consultas? Estamos para ayudarte.
                </p>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                <div className="space-y-6 p-6 border bg-muted/20 rounded-lg">
                  <InfoRow icon={MapPinIcon} label="Dirección" value={contact?.address} />
                  <InfoRow icon={Phone} label="Teléfono" value={contact?.phone} href={`tel:${contact?.phone}`} />
                  <InfoRow icon={Mail} label="Email" value={contact?.email} href={`mailto:${contact?.email}`} />
                  <InfoRow icon={Clock} label="Horario de Atención" value={contact?.hours} />
                </div>

                <div className="space-y-4 text-center">
                    <h3 className="text-lg font-semibold">Seguinos en Nuestras Redes</h3>
                    <div className="flex justify-center gap-6">
                       {contact?.instagram && (
                            <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                                <Instagram className="w-6 h-6"/>
                                <span className="font-medium">Instagram</span>
                            </a>
                       )}
                        {contact?.facebook && (
                            <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                                <Facebook className="w-6 h-6"/>
                                <span className="font-medium">Facebook</span>
                            </a>
                        )}
                    </div>
                </div>
                
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
