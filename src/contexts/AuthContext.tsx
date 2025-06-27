
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      return {
        id: data.user_id,
        email: data.email,
        name: data.name,
        role: data.role as 'super_admin' | 'clinic' | 'patient',
        avatar_url: data.avatar_url,
        clinic_id: data.clinic_id,
        is_chief: data.is_chief,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Buscar perfil do usuário com delay para evitar problemas de timing
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user);
            setUser(profile);
            setIsLoading(false);
          }, 100);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user).then(profile => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { error: 'Erro inesperado no login' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: { name: string; role?: string }) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userData.name,
            role: userData.role || 'patient'
          }
        }
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        return { error: error.message };
      }

      if (data.user && !data.session) {
        toast({
          title: "Confirmação necessária",
          description: "Verifique seu email para confirmar a conta.",
        });
      }

      return {};
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      return { error: 'Erro inesperado no cadastro' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar_url: updates.avatar_url,
          clinic_id: updates.clinic_id,
          is_chief: updates.is_chief,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { error: error.message };
      }

      // Atualizar estado local
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return {};
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return { error: 'Erro inesperado ao atualizar perfil' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      login,
      signup,
      logout,
      updateProfile,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
