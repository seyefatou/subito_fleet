// @ts-nocheck
"use client";

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AlertType = 'error' | 'success' | 'warning' | 'info';

export interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  type: AlertType;
  title: string;
  message: string;
  details?: string[];
  code?: number;
}

const alertConfig = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconBgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    defaultTitle: 'Erreur',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    defaultTitle: 'Succès',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconBgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-800',
    messageColor: 'text-amber-700',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    defaultTitle: 'Attention',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    defaultTitle: 'Information',
  },
};

export default function AlertModal({
  open,
  onClose,
  type,
  title,
  message,
  details,
  code,
}: AlertModalProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-md border-2",
        config.bgColor,
        config.borderColor
      )}>
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              config.iconBgColor
            )}>
              <Icon className={cn("w-6 h-6", config.iconColor)} />
            </div>
            <div className="flex-1">
              <DialogTitle className={cn("text-lg font-semibold", config.titleColor)}>
                {title || config.defaultTitle}
              </DialogTitle>
              {code && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Code: {code}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {/* Si c'est un seul message, l'afficher normalement */}
          {(!details || details.length <= 1) && (
            <p className={cn("text-sm", config.messageColor)}>
              {message}
            </p>
          )}

          {/* Si plusieurs erreurs, les afficher en liste */}
          {details && details.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase mb-3">
                {details.length} erreur(s) détectée(s):
              </p>
              <ul className="space-y-2">
                {details.map((detail, index) => (
                  <li
                    key={index}
                    className={cn(
                      "text-sm flex items-start gap-2 p-2.5 rounded-lg border",
                      type === 'error' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <span className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                      type === 'error' ? 'bg-red-200 text-red-700' : 'bg-slate-200 text-slate-700'
                    )}>
                      {index + 1}
                    </span>
                    <span className={config.messageColor}>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className={cn("w-full text-white", config.buttonColor)}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
