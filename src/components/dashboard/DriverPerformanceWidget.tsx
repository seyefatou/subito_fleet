// @ts-nocheck
"use client";

import React from 'react';
import Link from 'next/link';
import { Award, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DriverPerformanceWidget() {
  // Données mock - à remplacer par tes appels API
  const drivers = [];
  const allPerformances = [];
  const isLoading = false;

  const topPerformers = [...allPerformances]
    .sort((a, b) => b.performance_score - a.performance_score)
    .slice(0, 3);

  const needsImprovement = [...allPerformances]
    .filter(p => p.performance_score < 60)
    .sort((a, b) => a.performance_score - b.performance_score)
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Performance Chauffeurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Performance Chauffeurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Top Performers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-semibold text-slate-700">Top Performers</h4>
            </div>
            {topPerformers.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-2">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {topPerformers.map((perf, idx) => (
                  <div key={perf.driver_id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                        idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-gray-400" : "bg-orange-400"
                      )}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {perf.driver?.first_name} {perf.driver?.last_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {perf.metrics?.payment_rate}% paiements à temps
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {perf.performance_score}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Needs Improvement */}
          {needsImprovement.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <h4 className="text-sm font-semibold text-slate-700">À Améliorer</h4>
              </div>
              <div className="space-y-2">
                {needsImprovement.map((perf) => (
                  <div key={perf.driver_id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {perf.driver?.first_name} {perf.driver?.last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {perf.metrics?.incident_count} incidents récents
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700">
                      {perf.performance_score}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link href="/driver-performance">
            <button className="w-full text-center text-sm text-amber-600 hover:text-amber-700 font-medium py-2 bg-amber-50 rounded-lg">
              Voir l'analyse complète →
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
