
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useDailyReset } from '@/hooks/use-daily-reset';
import type { Passenger } from '@/lib/types';

interface AuthContextType {
  user: Passenger | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Passenger | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize daily reset hook
  useDailyReset();

  useEffect(() => {
    const checkUser = () => {
        const userId = localStorage.getItem("app_user_id");
        if (userId) {
            const passengers: Passenger[] = JSON.parse(localStorage.getItem("app_passengers") || "[]");
            const currentUser = passengers.find(p => p.id === userId);
            setUser(currentUser || null);
        } else {
            setUser(null);
        }
        setLoading(false);
    }
    
    checkUser();

    // Listen for storage changes to sync login/logout across tabs
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-primary"/>
        </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
