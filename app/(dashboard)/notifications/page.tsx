// @ts-nocheck
"use client";

import React from 'react';
import { Bell, Check, AlertTriangle, Info, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Données mock
const mockNotifications: any[] = [];

export default function Notifications() {
  const notifications = mockNotifications;

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'warning': return 'text-amber-500 bg-amber-100';
      case 'error': return 'text-red-500 bg-red-100';
      case 'success': return 'text-green-500 bg-green-100';
      default: return 'text-blue-500 bg-blue-100';
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Centre de notifications et alertes"
      />

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucune notification</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors",
                  !notification.read && "border-l-4 border-l-blue-500"
                )}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      getIconColor(notification.type)
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{notification.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {notification.created_at && format(new Date(notification.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </div>
                    </div>
                    {!notification.read && (
                      <Button variant="ghost" size="sm">
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
