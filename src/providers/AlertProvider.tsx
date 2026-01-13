// @ts-nocheck
"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertModal, { AlertType } from '@/components/common/AlertModal';
import { ApiError, extractErrorMessage } from '@/api/client';

interface AlertData {
  type: AlertType;
  title: string;
  message: string;
  details?: string[];
  code?: number;
}

interface AlertContextType {
  showAlert: (data: AlertData) => void;
  showError: (error: any, customTitle?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [open, setOpen] = useState(false);

  const showAlert = useCallback((data: AlertData) => {
    setAlert(data);
    setOpen(true);
  }, []);

  const showError = useCallback((error: any, customTitle?: string) => {
    const message = extractErrorMessage(error);
    const isApiError = error instanceof ApiError;

    setAlert({
      type: 'error',
      title: customTitle || (isApiError ? error.error : 'Erreur'),
      message: message,
      details: isApiError && error.details.length > 1 ? error.details : undefined,
      code: isApiError ? error.statusCode : undefined,
    });
    setOpen(true);
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    setAlert({
      type: 'success',
      title: title || 'Succès',
      message,
    });
    setOpen(true);
  }, []);

  const showWarning = useCallback((message: string, title?: string) => {
    setAlert({
      type: 'warning',
      title: title || 'Attention',
      message,
    });
    setOpen(true);
  }, []);

  const showInfo = useCallback((message: string, title?: string) => {
    setAlert({
      type: 'info',
      title: title || 'Information',
      message,
    });
    setOpen(true);
  }, []);

  const closeAlert = useCallback(() => {
    setOpen(false);
    // Petit délai avant de reset les données pour l'animation
    setTimeout(() => setAlert(null), 200);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        closeAlert,
      }}
    >
      {children}
      {alert && (
        <AlertModal
          open={open}
          onClose={closeAlert}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          details={alert.details}
          code={alert.code}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
