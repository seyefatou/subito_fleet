// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FormField from '@/components/common/FormField';

export default function TCOWidget() {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [period, setPeriod] = useState('30');

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
  });

  const { data: tcoData, isLoading } = useQuery({
    queryKey: ['tco-widget', selectedVehicle, period],
    queryFn: async () => {
      if (!selectedVehicle) return null;
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      
      const response = await base44.functions.invoke('calculateVehicleTCO', {
        vehicleId: selectedVehicle,
        startDate,
        endDate
      });
      return response.data;
    },
    enabled: !!selectedVehicle
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          Coût Total de Possession (TCO)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Véhicule"
            name="vehicle"
            type="select"
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            options={[
              { value: '', label: 'Sélectionner...' },
              ...vehicles.slice(0, 20).map(v => ({ 
                value: v.id, 
                label: `${v.registration_number}` 
              }))
            ]}
          />
          <FormField
            label="Période"
            name="period"
            type="select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: '30', label: '30 jours' },
              { value: '90', label: '90 jours' },
              { value: '180', label: '6 mois' }
            ]}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-500" />
          </div>
        ) : tcoData ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-green-700 mb-1">TCO Total</p>
                <p className="text-lg font-bold text-green-900">
                  {(tcoData.tco.total / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700 mb-1">TCO/Jour</p>
                <p className="text-lg font-bold text-blue-900">
                  {(tcoData.tco.daily / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-700 mb-1">ROI</p>
                <p className="text-lg font-bold text-purple-900">
                  {tcoData.profitability.roi_percentage}%
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Carburant:</span>
                <span className="font-semibold">{(tcoData.breakdown.fuel / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Maintenance:</span>
                <span className="font-semibold">{(tcoData.breakdown.maintenance / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Assurance:</span>
                <span className="font-semibold">{(tcoData.breakdown.insurance / 1000).toFixed(0)}K</span>
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between">
              <span className="text-sm text-slate-600">Profit net:</span>
              <Badge className={tcoData.profitability.net_profit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {(tcoData.profitability.net_profit / 1000).toFixed(0)}K FCFA
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8 text-sm">
            Sélectionnez un véhicule
          </p>
        )}
      </CardContent>
    </Card>
  );
}