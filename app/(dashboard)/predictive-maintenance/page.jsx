"use client";

import React from 'react';
import { Brain, Car, AlertTriangle, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Données mock
const mockAlerts = [];

export default function PredictiveMaintenance() {
  const alerts = mockAlerts;

  return (
    <div>
      <PageHeader
        title="IA Prédictive"
        subtitle="Maintenance prédictive basée sur l'intelligence artificielle"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Alertes actives</p>
                <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Véhicules analysés</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Car className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Prédictions résolues</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Alertes de maintenance prédictive
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucune alerte de maintenance prédictive</p>
              <p className="text-sm text-slate-400 mt-2">
                L'IA analysera les données des véhicules pour prédire les besoins de maintenance
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Liste des alertes */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
