"use client";

import React from 'react';
import Link from 'next/link';
import { Brain, AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const severityConfig = {
  low: { color: 'bg-blue-100 text-blue-700', label: 'Faible' },
  medium: { color: 'bg-amber-100 text-amber-700', label: 'Moyen' },
  high: { color: 'bg-orange-100 text-orange-700', label: 'Élevé' },
  critical: { color: 'bg-red-100 text-red-700', label: 'Critique' }
};

export default function MaintenanceAlertsWidget() {
  // Données mock - à remplacer par tes appels API
  const predictions = [];
  const vehicles = [];
  const isLoading = false;

  const urgentPredictions = predictions
    .filter(p => p.severity === 'critical' || p.severity === 'high')
    .sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    })
    .slice(0, 5);

  const getVehicle = (vehicleId) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Maintenance Prédictive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Alertes Maintenance IA
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-700">
            {urgentPredictions.length} urgentes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {urgentPredictions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Brain className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Aucune alerte urgente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {urgentPredictions.map((pred) => {
              const vehicle = getVehicle(pred.vehicle_id);
              const daysUntil = Math.ceil((new Date(pred.predicted_date) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <div key={pred.id} className="p-3 bg-slate-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {vehicle?.registration_number || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {vehicle?.brand} {vehicle?.model}
                      </p>
                    </div>
                    <Badge className={severityConfig[pred.severity].color}>
                      {severityConfig[pred.severity].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">
                    {pred.recommended_action}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Dans {daysUntil} jours</span>
                    </div>
                    <span className="text-purple-600 font-medium">
                      {pred.probability}% probabilité
                    </span>
                  </div>
                </div>
              );
            })}
            <Link href="/predictive-maintenance">
              <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-2">
                Voir toutes les prédictions →
              </button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
