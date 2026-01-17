// @ts-nocheck
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Calendar, Gauge } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MaintenanceAlerts() {
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ status: 'active' })
  });

  const { data: maintenances = [] } = useQuery({
    queryKey: ['maintenances'],
    queryFn: () => base44.entities.Maintenance.list('-date')
  });

  const { data: gpsData = [] } = useQuery({
    queryKey: ['gps-latest'],
    queryFn: () => base44.entities.GPSTracking.list('-timestamp', 500)
  });

  // Calculate alerts
  const alerts = [];
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  vehicles.forEach(vehicle => {
    const vehicleMaintenances = maintenances.filter(
      m => m.vehicle_id === vehicle.id && m.status === 'completed'
    );
    const lastMaintenance = vehicleMaintenances[0];

    if (!lastMaintenance) return;

    const vehicleGPS = gpsData.filter(g => g.vehicle_id === vehicle.id);
    const currentMileage = vehicle.last_gps_update && vehicleGPS.length > 0 
      ? estimateMileage(vehicleGPS) 
      : 0;

    // Check date-based alert
    if (lastMaintenance.next_maintenance_date) {
      const nextDate = new Date(lastMaintenance.next_maintenance_date);
      if (nextDate <= thirtyDaysFromNow) {
        const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
        alerts.push({
          vehicle,
          type: 'date',
          severity: daysUntil <= 7 ? 'urgent' : 'warning',
          message: `Entretien dans ${daysUntil} jours`,
          date: nextDate,
          maintenanceType: lastMaintenance.type
        });
      }
    }

    // Check mileage-based alert
    if (lastMaintenance.next_maintenance_mileage && currentMileage > 0) {
      const kmRemaining = lastMaintenance.next_maintenance_mileage - currentMileage;
      if (kmRemaining <= 1000) {
        alerts.push({
          vehicle,
          type: 'mileage',
          severity: kmRemaining <= 500 ? 'urgent' : 'warning',
          message: `${Math.max(0, Math.round(kmRemaining))} km restants`,
          currentMileage: Math.round(currentMileage),
          targetMileage: lastMaintenance.next_maintenance_mileage,
          maintenanceType: lastMaintenance.type
        });
      }
    }
  });

  // Sort by severity
  alerts.sort((a, b) => {
    if (a.severity === 'urgent' && b.severity !== 'urgent') return -1;
    if (a.severity !== 'urgent' && b.severity === 'urgent') return 1;
    return 0;
  });

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            ✓ Aucune alerte d'entretien
          </CardTitle>
          <CardDescription>
            Tous les véhicules sont à jour dans leurs entretiens
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Alertes d'entretien ({alerts.length})
        </CardTitle>
        <CardDescription>
          Véhicules nécessitant un entretien prochainement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'urgent'
                ? 'bg-red-50 border-red-500'
                : 'bg-amber-50 border-amber-500'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-slate-900">
                    {alert.vehicle.registration_number} - {alert.vehicle.brand} {alert.vehicle.model}
                  </p>
                  <Badge
                    className={
                      alert.severity === 'urgent'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }
                  >
                    {alert.severity === 'urgent' ? 'Urgent' : 'À prévoir'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  {alert.type === 'date' ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {alert.message} ({format(alert.date, 'dd MMM yyyy', { locale: fr })})
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      {alert.message} (actuel: {alert.currentMileage} km)
                    </div>
                  )}
                  <span className="text-slate-400">•</span>
                  <span>Type: {alert.maintenanceType}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function estimateMileage(gpsPoints) {
  if (gpsPoints.length === 0) return 0;
  
  gpsPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  let totalDistance = 0;
  for (let i = 1; i < gpsPoints.length; i++) {
    const prev = gpsPoints[i - 1];
    const curr = gpsPoints[i];
    
    const R = 6371;
    const dLat = (curr.latitude - prev.latitude) * Math.PI / 180;
    const dLon = (curr.longitude - prev.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(prev.latitude * Math.PI / 180) * Math.cos(curr.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    totalDistance += distance;
  }
  
  return totalDistance;
}