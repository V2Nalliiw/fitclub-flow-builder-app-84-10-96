
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'clinic' | 'patient';
  avatar_url?: string;
  clinic_id?: string;
  is_chief?: boolean;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: any;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, userData: { name: string; role?: string }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>;
  isLoading: boolean;
}
