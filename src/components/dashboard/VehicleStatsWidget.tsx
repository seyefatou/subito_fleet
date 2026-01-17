// @ts-nocheck
"use client";

import React from 'react';
import Link from 'next/link';
import { Car, MapPin, AlertTriangle, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VehicleStatsWidget() {
  // Données mock - à remplacer par tes appels API
  const vehicles = [];
  const incidents = [];
  const gpsData = [];

  // Calculate stats
  const activeVehicles = vehicles.filter(v => v.status === 'active');
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentIncidents = incidents.filter(i =>
    new Date(i.incident_date) >= last30Days
  );

  // Calculate mileage per vehicle
  const vehicleStats = activeVehicles.map(vehicle => {
    const vehicleGPS = gpsData.filter(g => g.vehicle_id === vehicle.id);
    const vehicleIncidents = recentIncidents.filter(i => i.vehicle_id === vehicle.id);

    // Simple mileage calculation
    let mileage = 0;
    if (vehicleGPS.length > 1) {
      vehicleGPS.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      for (let i = 1; i < Math.min(vehicleGPS.length, 50); i++) {
        const prev = vehicleGPS[i - 1];
        const curr = vehicleGPS[i];
        const R = 6371;
        const dLat = (curr.latitude - prev.latitude) * Math.PI / 180;
        const dLon = (curr.longitude - prev.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(prev.latitude * Math.PI / 180) * Math.cos(curr.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        if (distance < 1) mileage += distance;
      }
    }

    return {
      ...vehicle,
      mileage: Math.round(mileage),
      incident_count: vehicleIncidents.length
    };
  });

  // Top mileage vehicles
  const topMileage = [...vehicleStats]
    .sort((a, b) => b.mileage - a.mileage)
    .slice(0, 5);

  // Most incidents
  const mostIncidents = [...vehicleStats]
    .filter(v => v.incident_count > 0)
    .sort((a, b) => b.incident_count - a.incident_count)
    .slice(0, 3);

  const totalMileage = vehicleStats.reduce((sum, v) => sum + v.mileage, 0);
  const avgIncidents = vehicleStats.length > 0
    ? (recentIncidents.length / vehicleStats.length).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-500" />
          Statistiques Véhicules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">Kilométrage total</p>
              </div>
              <p className="text-xl font-bold text-blue-900">
                {totalMileage.toLocaleString()} km
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <p className="text-xs text-orange-700 font-medium">Moy. incidents</p>
              </div>
              <p className="text-xl font-bold text-orange-900">{avgIncidents}</p>
            </div>
          </div>

          {/* Top Mileage */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-slate-600" />
              <h4 className="text-sm font-semibold text-slate-700">Plus utilisés (30j)</h4>
            </div>
            {topMileage.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-2">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {topMileage.slice(0, 3).map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {vehicle.registration_number}
                      </p>
                      <p className="text-xs text-slate-500">
                        {vehicle.brand} {vehicle.model}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      {vehicle.mileage} km
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most Incidents */}
          {mostIncidents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h4 className="text-sm font-semibold text-slate-700">Incidents fréquents</h4>
              </div>
              <div className="space-y-2">
                {mostIncidents.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-900">
                      {vehicle.registration_number}
                    </p>
                    <Badge className="bg-red-100 text-red-700">
                      {vehicle.incident_count} incidents
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link href="/vehicles">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 bg-blue-50 rounded-lg">
              Voir tous les véhicules →
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
