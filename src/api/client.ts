import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

console.log('[API Client] Base URL:', API_BASE_URL);

// Classe d'erreur personnalisée pour les erreurs API
export class ApiError extends Error {
  statusCode: number;
  error: string;
  details: string[];
  path?: string;
  timestamp?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    error: string = 'Error',
    details: string[] = [],
    path?: string,
    timestamp?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
    this.path = path;
    this.timestamp = timestamp;
  }
}

// Helper pour extraire un message d'erreur lisible
export function extractErrorMessage(error: any): string {
  // Si c'est une ApiError, retourner le message formaté
  if (error instanceof ApiError) {
    if (error.details.length > 0) {
      return error.details.join('\n');
    }
    return error.message;
  }

  // Si c'est une Error standard
  if (error instanceof Error) {
    return error.message;
  }

  // Si c'est une chaîne
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'Une erreur inattendue est survenue';
}

// Helper pour obtenir tous les détails de l'erreur (pour debug)
export function getErrorDetails(error: any): { message: string; details: string[]; statusCode: number; error: string } {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      error: error.error,
    };
  }

  return {
    message: error?.message || 'Erreur inconnue',
    details: [],
    statusCode: 500,
    error: 'Unknown Error',
  };
}

// Créer l'instance axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('[API Request]', config.method?.toUpperCase(), config.baseURL + config.url, config.data);
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url, response.data);
    // Retourner directement les données de la réponse
    return response.data;
  },
  (error: AxiosError<{ message?: string | string[]; statusCode?: number; error?: string; path?: string; timestamp?: string }>) => {
    console.error('[API Error]', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    // Gérer les erreurs d'authentification (mais pas sur /auth/login)
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Extraire les données d'erreur du backend
    const responseData = error.response?.data;
    const statusCode = responseData?.statusCode || error.response?.status || 500;
    const errorType = responseData?.error || error.response?.statusText || 'Error';
    const path = responseData?.path;
    const timestamp = responseData?.timestamp;

    // Extraire le message - peut être une chaîne ou un tableau
    let message: string;
    let details: string[] = [];

    if (responseData?.message) {
      if (Array.isArray(responseData.message)) {
        // Si c'est un tableau, joindre les messages
        details = responseData.message;
        message = responseData.message.join(' | ');
      } else {
        message = responseData.message;
        details = [responseData.message];
      }
    } else if (error.message) {
      message = error.message;
      details = [error.message];
    } else {
      message = 'Une erreur est survenue';
      details = ['Une erreur est survenue'];
    }

    // Créer une erreur personnalisée avec tous les détails
    const apiError = new ApiError(message, statusCode, errorType, details, path, timestamp);

    return Promise.reject(apiError);
  }
);

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total?: number;
    skip?: number;
    take?: number;
    hasMore?: boolean;
  };
}

// Helpers pour le stockage du token
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
};

export const setUser = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export default apiClient;
