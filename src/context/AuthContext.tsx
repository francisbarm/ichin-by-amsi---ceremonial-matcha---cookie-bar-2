import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'admin' | 'cliente';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: 'admin' | 'cliente';
  }) => Promise<{ error: AuthError | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'eventos.ichin@gmail.com').toLowerCase();
  
  // Identificación del Rol de Usuario (Administrador vs Cliente)
  const isUserAdmin = Boolean(
    user && (
      user.user_metadata?.role === 'admin' ||
      user.email?.toLowerCase() === adminEmail
    )
  );

  // Derivar perfil legible con rol asignado automáticamente
  const profile: UserProfile | null = user
    ? {
        id: user.id,
        email: user.email || '',
        fullName:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Anfitrión',
        phone: user.user_metadata?.phone || '',
        role: isUserAdmin ? 'admin' : (user.user_metadata?.role || 'cliente'),
      }
    : null;

  useEffect(() => {
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Suscribirse a cambios de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error };
  };

  const signUp = async ({
    email,
    password,
    fullName,
    phone,
    role = 'cliente',
  }: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: 'admin' | 'cliente';
  }) => {
    // Si el correo coincide con el admin configurado, asignar admin automáticamente
    const effectiveRole = email.toLowerCase() === adminEmail ? 'admin' : role;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : '',
          role: effectiveRole,
        },
      },
    });

    // Si data.session es nula pero no hay error, Supabase requiere confirmación de email
    const needsEmailConfirmation = !error && !data.session;

    return { error, needsEmailConfirmation };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin: isUserAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
