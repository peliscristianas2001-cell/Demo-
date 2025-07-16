
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const defaultLogo = "https://instagram.fepa9-2.fna.fbcdn.net/v/t51.2885-19/478145482_2050373918705456_5085497722998866930_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fepa9-2.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QFzjVvSlHCf0Z2hstJHws97y0Q1b3iIKZskWlJOzKkzsXA5d7w5jeqV3MF8EUnkXK0&_nc_ohc=0kFfIMnvmBwQ7kNvwHJGNkB&_nc_gid=9W3okjmGr8DgZuyMHj14tg&edm=AEYEu-QBAAAA&ccb=7-5&oh=00_AfSWH7AGXQ1um0uq2Vfz-d6jjRHQIyOiIFf90fiE8TXyiA&oe=687DAD20&_nc_sid=ead929";

export function Logo() {
  const [logoUrl, setLogoUrl] = useState(defaultLogo);

  useEffect(() => {
    const updateLogo = () => {
        const savedLogo = localStorage.getItem("ytl_logo_url");
        setLogoUrl(savedLogo || defaultLogo);
    };

    updateLogo(); // Initial load

    window.addEventListener('storage', updateLogo); // Listen for changes from other tabs/windows

    return () => {
      window.removeEventListener('storage', updateLogo); // Cleanup listener
    };
  }, []);

  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <Image
        src={logoUrl}
        alt="YO TE LLEVO Logo"
        width={36}
        height={36}
        className="rounded-full"
        key={logoUrl} // Adding key forces re-render when src changes
      />
      <span className="text-2xl font-bold tracking-tight text-foreground font-headline">
        YO TE LLEVO
      </span>
    </Link>
  );
}
