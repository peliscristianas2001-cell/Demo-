
import type {Metadata} from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Toaster } from "@/components/ui/toaster"
import { PT_Sans, Lilita_One } from "next/font/google";
import { Chatbot } from '@/components/chatbot';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const lilitaOne = Lilita_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Demo App',
  description: 'App Prototyper Demo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${ptSans.variable} ${lilitaOne.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Chatbot />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
