import apiClient, { ApiResponse, setAuthToken, setUser, removeAuthToken, getUser, getAuthToken } from '../client';

export interface LoginDto {
  email: string;
  password: string;
  otpCode?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  bankId?: string;
  gieId?: string;
  driverId?: string;
  guaranteeFundId?: string;
  insurerId?: string;
}

// Structure de réponse du backend NestJS
export interface BackendAuthResponse {
  statusCode: number;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    expiresIn: string;
  };
}

export const authService = {
  // Connexion
  async login(credentials: LoginDto): Promise<BackendAuthResponse> {
    console.log('[Auth Service] Login attempt with:', { email: credentials.email });
    const response = await apiClient.post<any, BackendAuthResponse>('/auth/login', credentials);
    console.log('[Auth Service] Login response:', response);
    if (response.data) {
      console.log('[Auth Service] Saving token and user');
      setAuthToken(response.data.accessToken);
      setUser(response.data.user);
    } else {
      console.warn('[Auth Service] No data in response');
    }
    return response;
  },

  // Inscription
  async register(data: RegisterDto): Promise<BackendAuthResponse> {
    const response = await apiClient.post<any, BackendAuthResponse>('/auth/register', data);
    if (response.data) {
      setAuthToken(response.data.accessToken);
      setUser(response.data.user);
    }
    return response;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!getAuthToken();
  },

  // Récupérer l'utilisateur courant depuis le localStorage
  getCurrentUser(): AuthUser | null {
    return getUser();
  },

  // Déconnexion
  logout(): void {
    removeAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // Profil utilisateur
  async getProfile(): Promise<any> {
    console.log('[Auth Service] Getting profile from API');
    const response = await apiClient.get('/auth/me');
    console.log('[Auth Service] Profile response:', response);
    return response;
  },

  // Changer mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },

  // Demander réinitialisation mot de passe
  async requestPasswordReset(email: string): Promise<ApiResponse<any>> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Réinitialiser mot de passe
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },

  // Activer 2FA
  async enable2FA(): Promise<ApiResponse<{ secret: string; otpauthUrl: string }>> {
    return apiClient.post('/auth/2fa/enable');
  },

  // Vérifier 2FA
  async verify2FA(otpCode: string): Promise<ApiResponse<any>> {
    return apiClient.post('/auth/2fa/verify', { otpCode });
  },

  // Désactiver 2FA
  async disable2FA(): Promise<ApiResponse<any>> {
    return apiClient.post('/auth/2fa/disable');
  },
};

export default authService;
