// @ts-nocheck
import React from 'react';
import { Star, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const getRatingConfig = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-700', icon: '⭐⭐⭐⭐⭐' };
  if (score >= 70) return { label: 'Très bon', color: 'bg-blue-100 text-blue-700', icon: '⭐⭐⭐⭐' };
  if (score >= 60) return { label: 'Bon', color: 'bg-amber-100 text-amber-700', icon: '⭐⭐⭐' };
  if (score >= 50) return { label: 'Moyen', color: 'bg-orange-100 text-orange-700', icon: '⭐⭐' };
  return { label: 'À améliorer', color: 'bg-red-100 text-red-700', icon: '⭐' };
};

export default function DriverRatingCard({ performance, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (!performance) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">Données de performance non disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const config = getRatingConfig(performance.performance_score);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Notation Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-slate-900 mb-2">
            {performance.performance_score}
          </div>
          <Badge className={cn("text-lg px-4 py-1", config.color)}>
            {config.label}
          </Badge>
          <div className="text-3xl mt-2">{config.icon}</div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Taux paiement</span>
            <span className="font-semibold text-slate-900">
              {performance.metrics.payment_rate}%
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Paiements à temps</span>
            <span className="font-semibold text-slate-900">
              {performance.metrics.on_time_count}/{performance.metrics.total_payments}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Incidents</span>
            <Badge className={cn(
              performance.metrics.incident_count === 0 ? "bg-green-100 text-green-700" : 
              performance.metrics.incident_count <= 2 ? "bg-orange-100 text-orange-700" : 
              "bg-red-100 text-red-700"
            )}>
              {performance.metrics.incident_count}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Kilométrage</span>
            <span className="font-semibold text-slate-900">
              {performance.metrics.mileage_driven?.toLocaleString()} km
            </span>
          </div>

          {performance.metrics.maintenance_compliance && (
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Conformité entretien</span>
              <span className="font-semibold text-slate-900">
                {performance.metrics.maintenance_compliance}%
              </span>
            </div>
          )}
        </div>

        {performance.insights && performance.insights.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">Recommandations:</p>
            {performance.insights.map((insight, idx) => (
              <p key={idx} className="text-xs text-blue-700 mb-1">• {insight}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}