// @ts-nocheck
"use client";

import React from 'react';
import { MapPin, Car, User } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Données mock
const mockVehicles: any[] = [];

export default function Tracking() {
  const vehicles = mockVehicles;

  return (
    <div>
      <PageHeader
        title="Tracking GPS"
        subtitle="Localisation en temps réel des véhicules"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Carte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
              <p className="text-slate-500">
                Carte de tracking - Intégrer Google Maps ou Leaflet ici
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Véhicules ({vehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Aucun véhicule à afficher
              </p>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="p-3 bg-slate-50 rounded-lg flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Car className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{vehicle.registration_number}</p>
                      <p className="text-xs text-slate-500">{vehicle.brand} {vehicle.model}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
