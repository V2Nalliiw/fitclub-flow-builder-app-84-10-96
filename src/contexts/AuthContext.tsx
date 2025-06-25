
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular verificação de sessão
    const checkAuth = () => {
      const storedUser = localStorage.getItem('fitclub-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulação de login - substituir pela integração com Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user based on email
    let mockUser: User;
    if (email.includes('admin')) {
      mockUser = {
        id: '1',
        email,
        role: 'super_admin',
        name: 'Super Admin',
      };
    } else if (email.includes('clinic')) {
      mockUser = {
        id: '2',
        email,
        role: 'clinic',
        name: 'Dr. Clínica',
        clinic_id: 'clinic-1',
        is_chief: true,
      };
    } else {
      mockUser = {
        id: '3',
        email,
        role: 'patient',
        name: 'Paciente',
        clinic_id: 'clinic-1',
      };
    }

    localStorage.setItem('fitclub-user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('fitclub-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
