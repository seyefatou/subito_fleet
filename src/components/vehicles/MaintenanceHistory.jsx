import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Wrench, Calendar, DollarSign, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatusBadge from '@/components/common/StatusBadge';

export default function MaintenanceHistory({ vehicleId }) {
  const { data: maintenances = [], isLoading } = useQuery({
    queryKey: ['maintenances', vehicleId],
    queryFn: () => base44.entities.Maintenance.filter({ vehicle_id: vehicleId })
  });

  const sortedMaintenances = [...maintenances].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
  const avgCost = maintenances.length > 0 ? totalCost / maintenances.length : 0;

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Total entretiens</p>
              <p className="text-2xl font-bold text-slate-900">{maintenances.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Coût total</p>
              <p className="text-2xl font-bold text-green-600">
                {(totalCost / 1000).toFixed(0)}K
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Coût moyen</p>
              <p className="text-2xl font-bold text-blue-600">
                {(avgCost / 1000).toFixed(0)}K
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-500" />
            Historique des entretiens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedMaintenances.length > 0 ? (
            <div className="space-y-4">
              {sortedMaintenances.map((maintenance, idx) => (
                <div
                  key={maintenance.id}
                  className="flex gap-4 pb-4 border-b last:border-0"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-amber-600" />
                    </div>
                    {idx < sortedMaintenances.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 mt-2" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">{maintenance.type}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(maintenance.date), 'dd MMMM yyyy', { locale: fr })}
                          {maintenance.mileage && (
                            <>
                              <span>•</span>
                              <span>{maintenance.mileage.toLocaleString()} km</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={maintenance.status} />
                        <p className="text-lg font-bold text-green-600 mt-1">
                          {maintenance.cost.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>

                    {maintenance.description && (
                      <p className="text-sm text-slate-600 mb-2">{maintenance.description}</p>
                    )}

                    {maintenance.provider && (
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Garage: {maintenance.provider}</span>
                        {maintenance.provider_phone && (
                          <span>📞 {maintenance.provider_phone}</span>
                        )}
                      </div>
                    )}

                    {maintenance.next_maintenance_date && (
                      <div className="mt-2 bg-blue-50 p-2 rounded text-xs text-blue-700">
                        🔔 Prochain entretien: {format(new Date(maintenance.next_maintenance_date), 'dd MMM yyyy', { locale: fr })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">Aucun entretien enregistré</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}