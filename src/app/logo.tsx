
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Plane } from 'lucide-react';

const defaultLogo = "";

export function Logo() {
  const [logoUrl, setLogoUrl] = useState(defaultLogo);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const updateLogo = () => {
        const savedLogo = localStorage.getItem("app_logo_url");
        setLogoUrl(savedLogo || defaultLogo);
    };

    updateLogo();

    window.addEventListener('storage', updateLogo);

    return () => {
      window.removeEventListener('storage', updateLogo);
    };
  }, []);

  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      {isClient && logoUrl ? (
          <Image
            src={logoUrl}
            alt="Demo App Logo"
            width={36}
            height={36}
            className="rounded-full"
            key={logoUrl}
          />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Plane className="w-5 h-5" />
        </div>
      )}
      <span className="text-2xl font-bold tracking-tight text-foreground font-headline">
        PRUEBA
      </span>
    </Link>
  );
}
