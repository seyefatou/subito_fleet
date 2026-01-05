// @ts-nocheck
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FormField from '@/components/common/FormField';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export default function TCOAnalysis() {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
  });

  const { data: tcoData, isLoading, refetch } = useQuery({
    queryKey: ['tco', selectedVehicle, dateRange],
    queryFn: async () => {
      const response = await base44.functions.invoke('calculateVehicleTCO', {
        vehicleId: selectedVehicle,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      return response.data;
    },
    enabled: !!selectedVehicle
  });

  const pieData = tcoData?.breakdown ? [
    { name: 'Carburant', value: tcoData.breakdown.fuel },
    { name: 'Maintenance', value: tcoData.breakdown.maintenance },
    { name: 'Assurance', value: tcoData.breakdown.insurance },
    { name: 'Dépréciation', value: tcoData.breakdown.depreciation },
    { name: 'Autres', value: tcoData.breakdown.other }
  ].filter(item => item.value > 0) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          Coût Total de Possession (TCO)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Véhicule"
              name="vehicle"
              type="select"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              options={[
                { value: '', label: 'Sélectionner...' },
                ...vehicles.map(v => ({ value: v.id, label: `${v.registration_number} - ${v.brand} ${v.model}` }))
              ]}
            />
            <FormField
              label="Date début"
              name="start"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <FormField
              label="Date fin"
              name="end"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-500" />
            </div>
          )}

          {tcoData && !isLoading && (
            <>
              {/* TCO Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700 font-medium mb-1">TCO Total</p>
                  <p className="text-2xl font-bold text-green-900">
                    {(tcoData.tco.total / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium mb-1">TCO Journalier</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {(tcoData.tco.daily / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium mb-1">ROI</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {tcoData.profitability.roi_percentage}%
                  </p>
                </div>
              </div>

              {/* Profitability */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-3">Rentabilité</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Revenus:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      {tcoData.revenue.total.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Profit net:</span>
                    <span className={`ml-2 font-semibold ${tcoData.profitability.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tcoData.profitability.net_profit.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Paiements:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      {tcoData.revenue.payment_count}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Marge:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      {tcoData.profitability.margin_percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown Chart */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Répartition des coûts</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} FCFA`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {!selectedVehicle && !isLoading && (
            <div className="text-center py-8 text-slate-500">
              <p>Sélectionnez un véhicule pour voir son TCO</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}