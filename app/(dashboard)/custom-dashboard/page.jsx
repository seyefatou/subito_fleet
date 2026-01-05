"use client";

import React from 'react';
import { Settings, LayoutDashboard } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomDashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard Personnalisé"
        subtitle="Configurez votre tableau de bord"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <LayoutDashboard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              Fonctionnalité de personnalisation du dashboard à venir
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
