"use client";

import React from 'react';
import { TrendingUp, Users, Star, Award } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Données mock
const mockDrivers = [];

export default function DriverPerformance() {
  const drivers = mockDrivers;

  return (
    <div>
      <PageHeader
        title="Performance Chauffeurs"
        subtitle="Analyse des performances des chauffeurs"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total chauffeurs</p>
                <p className="text-2xl font-bold">{drivers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Note moyenne</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <Star className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Meilleur taux</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <Award className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tendance</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classement des chauffeurs</CardTitle>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucun chauffeur à afficher</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Liste des chauffeurs avec leurs performances */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
