import { toast } from 'sonner';
import { ApiError, extractErrorMessage } from '@/api/client';

interface ToastOptions {
  successMessage?: string;
  errorTitle?: string;
  duration?: number;
}

/**
 * Hook pour gérer les messages toast de succès et d'erreur de manière cohérente
 */
export function useToastError() {
  /**
   * Affiche un toast d'erreur avec les détails de l'erreur API
   */
  const showError = (error: any, customTitle?: string) => {
    const message = extractErrorMessage(error);
    const isApiError = error instanceof ApiError;

    toast.error(customTitle || message, {
      description: isApiError
        ? `${error.error} (Code: ${error.statusCode})`
        : undefined,
      duration: 5000,
    });

    // Log pour debug
    if (isApiError) {
      console.error('[Toast Error]', {
        message: error.message,
        details: error.details,
        statusCode: error.statusCode,
        error: error.error,
        path: error.path,
      });
    }
  };

  /**
   * Affiche un toast de succès
   */
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  };

  /**
   * Retourne les handlers onSuccess et onError pour les mutations
   */
  const getMutationHandlers = (options?: ToastOptions) => ({
    onSuccess: (response: any) => {
      const message = response?.message || options?.successMessage || 'Opération réussie';
      showSuccess(message);
    },
    onError: (error: any) => {
      showError(error, options?.errorTitle);
    },
  });

  return {
    showError,
    showSuccess,
    getMutationHandlers,
  };
}

/**
 * Fonction utilitaire pour créer un handler onError standard
 */
export function createErrorHandler(customTitle?: string) {
  return (error: any) => {
    const message = extractErrorMessage(error);
    const isApiError = error instanceof ApiError;

    toast.error(customTitle || message, {
      description: isApiError
        ? `${error.error} (Code: ${error.statusCode})`
        : undefined,
      duration: 5000,
    });
  };
}

/**
 * Fonction utilitaire pour créer un handler onSuccess standard
 */
export function createSuccessHandler(fallbackMessage: string) {
  return (response: any) => {
    const message = response?.message || fallbackMessage;
    toast.success(message, { duration: 3000 });
  };
}
