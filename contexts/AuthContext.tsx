import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import supabase from '../services/supabase';
import { UserRole } from '../types';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapSessionUser = (sessionUser: any): User => ({
    id: sessionUser.id,
    email: sessionUser.email || '',
    firstName: sessionUser.user_metadata?.first_name || 'System',
    lastName: sessionUser.user_metadata?.last_name || 'User',
    role: (sessionUser.user_metadata?.role as UserRole) || UserRole.JOURNALIST,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          // Fetch additional user data from public.users table if needed, 
          // or rely on user_metadata if it was synced.
          setToken(session.access_token);
          setUser(mapSessionUser(session.user));
        }
      } catch (err) {
        console.error('[NewsVortex] Session recovery failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setToken(session.access_token);
        setUser(mapSessionUser(session.user));
      } else {
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = UserRole.JOURNALIST) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('[NewsVortex] Signout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}