'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService, AuthUser, LoginDto, RegisterDto } from '@/api/services/auth.service';
import { toast } from 'sonner';
import { extractErrorMessage, ApiError } from '@/api/client';
import AlertModal from '@/components/common/AlertModal';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<boolean>;
  register: (data: RegisterDto) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertData, setAlertData] = useState<{
    type: 'error' | 'success';
    title: string;
    message: string;
    code?: number;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const showError = (error: any, title?: string) => {
    const message = extractErrorMessage(error);
    const isApiError = error instanceof ApiError;
    setAlertData({
      type: 'error',
      title: title || (isApiError ? error.error : 'Erreur'),
      message,
      code: isApiError ? error.statusCode : undefined,
    });
    setAlertOpen(true);
  };

  // Charger l'utilisateur depuis localStorage et rafraîchir depuis l'API
  const loadUser = useCallback(async () => {
    const storedUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();

    if (isAuth && storedUser) {
      setUser(storedUser);

      // Rafraîchir le profil depuis l'API
      try {
        const response = await authService.getProfile();
        console.log('[AuthProvider] Profile refreshed from API:', response);
        if (response.data) {
          setUser(response.data);
          // Mettre à jour le localStorage avec les données fraîches
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        }
      } catch (error) {
        console.error('[AuthProvider] Failed to refresh profile:', error);
        // Si le token est invalide, déconnecter l'utilisateur
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Protection des routes
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
    const isAuth = authService.isAuthenticated();

    if (!isAuth && !isPublicRoute) {
      // Rediriger vers login si non authentifié sur une route protégée
      router.push('/login');
    } else if (isAuth && pathname === '/login') {
      // Rediriger vers dashboard si déjà connecté sur la page login
      router.push('/');
    }
  }, [isLoading, pathname, router]);

  const login = async (credentials: LoginDto): Promise<boolean> => {
    console.log('[AuthProvider] Login called with:', { email: credentials.email });
    try {
      const response = await authService.login(credentials);
      console.log('[AuthProvider] Login response:', response);
      console.log('[AuthProvider] statusCode:', response.statusCode, 'has data:', !!response.data);
      if (response.statusCode === 200 && response.data) {
        console.log('[AuthProvider] Login successful, setting user');
        setUser(response.data.user);
        toast.success(response.message || 'Connexion réussie');
        return true;
      }
      console.warn('[AuthProvider] Login failed - statusCode not 200 or no data');
      return false;
    } catch (error: any) {
      console.error('[AuthProvider] Login error:', error);
      showError(error, 'Erreur de connexion');
      return false;
    }
  };

  const register = async (data: RegisterDto): Promise<boolean> => {
    try {
      const response = await authService.register(data);
      if (response.statusCode === 200 && response.data) {
        setUser(response.data.user);
        toast.success(response.message || 'Inscription réussie');
        return true;
      }
      return false;
    } catch (error: any) {
      showError(error, 'Erreur d\'inscription');
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  const refreshUser = () => {
    loadUser();
  };

  // Afficher un loader pendant le chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
      {alertData && (
        <AlertModal
          open={alertOpen}
          onClose={() => setAlertOpen(false)}
          type={alertData.type}
          title={alertData.title}
          message={alertData.message}
          code={alertData.code}
        />
      )}
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
