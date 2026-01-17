// @ts-nocheck
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Fuel, Plus, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FormModal from '@/components/common/FormModal';
import FormField from '@/components/common/FormField';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FuelConsumptionTracker({ vehicleId }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const { data: consumptions = [], isLoading } = useQuery({
    queryKey: ['fuel-consumptions', vehicleId],
    queryFn: () => base44.entities.FuelConsumption.filter({ vehicle_id: vehicleId })
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      // Calculate consumption if we have previous record
      const sortedConsumptions = [...consumptions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      const lastFill = sortedConsumptions[sortedConsumptions.length - 1];
      
      if (lastFill && data.odometer_reading && lastFill.odometer_reading) {
        const distance = data.odometer_reading - lastFill.odometer_reading;
        const consumption = (data.quantity_liters / distance) * 100;
        data.distance_since_last_fill = distance;
        data.consumption_l_per_100km = parseFloat(consumption.toFixed(2));
      }

      return base44.entities.FuelConsumption.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-consumptions'] });
      toast.success('Plein enregistré');
      setModalOpen(false);
      setFormData({});
    }
  });

  const sortedConsumptions = [...consumptions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Calculate stats
  const totalLiters = consumptions.reduce((sum, c) => sum + (c.quantity_liters || 0), 0);
  const totalCost = consumptions.reduce((sum, c) => sum + (c.cost || 0), 0);
  const avgConsumption = consumptions.filter(c => c.consumption_l_per_100km).length > 0
    ? consumptions.reduce((sum, c) => sum + (c.consumption_l_per_100km || 0), 0) / 
      consumptions.filter(c => c.consumption_l_per_100km).length
    : 0;

  // Chart data
  const chartData = sortedConsumptions
    .filter(c => c.consumption_l_per_100km)
    .reverse()
    .slice(0, 10)
    .map(c => ({
      date: format(new Date(c.date), 'dd/MM', { locale: fr }),
      consumption: c.consumption_l_per_100km
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      vehicle_id: vehicleId,
      price_per_liter: formData.cost / formData.quantity_liters
    });
  };

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
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Consommation moy.</p>
              <p className="text-2xl font-bold text-blue-600">
                {avgConsumption.toFixed(1)} L/100km
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Total litres</p>
              <p className="text-2xl font-bold text-slate-900">{totalLiters.toFixed(0)}</p>
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
              <p className="text-sm text-slate-500 mb-1">Pleins</p>
              <p className="text-2xl font-bold text-slate-900">{consumptions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution de la consommation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      <Button onClick={() => setModalOpen(true)} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Enregistrer un plein
      </Button>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-blue-500" />
            Historique des pleins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedConsumptions.length > 0 ? (
            <div className="space-y-3">
              {sortedConsumptions.map((consumption) => (
                <div
                  key={consumption.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">
                        {format(new Date(consumption.date), 'dd MMM yyyy', { locale: fr })}
                      </span>
                      {consumption.odometer_reading && (
                        <Badge variant="outline">{consumption.odometer_reading.toLocaleString()} km</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span>{consumption.quantity_liters}L</span>
                      <span>•</span>
                      <span>{consumption.cost.toLocaleString()} FCFA</span>
                      {consumption.station_name && (
                        <>
                          <span>•</span>
                          <span>{consumption.station_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {consumption.consumption_l_per_100km && (
                    <Badge className="bg-blue-100 text-blue-700">
                      {consumption.consumption_l_per_100km} L/100km
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">Aucun plein enregistré</p>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Enregistrer un plein"
        onSubmit={handleSubmit}
        submitLabel="Enregistrer"
        isSubmitting={createMutation.isPending}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Date"
              name="date"
              type="date"
              value={formData.date || new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <FormField
              label="Chauffeur"
              name="driver_id"
              type="select"
              value={formData.driver_id || ''}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
              options={[
                { value: '', label: 'Sélectionner...' },
                ...drivers.map(d => ({ value: d.id, label: `${d.first_name} ${d.last_name}` }))
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Quantité (litres)"
              name="quantity_liters"
              type="number"
              value={formData.quantity_liters || ''}
              onChange={(e) => setFormData({ ...formData, quantity_liters: parseFloat(e.target.value) })}
              required
            />
            <FormField
              label="Coût (FCFA)"
              name="cost"
              type="number"
              value={formData.cost || ''}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
              required
            />
          </div>
          <FormField
            label="Kilométrage"
            name="odometer_reading"
            type="number"
            value={formData.odometer_reading || ''}
            onChange={(e) => setFormData({ ...formData, odometer_reading: parseInt(e.target.value) })}
          />
          <FormField
            label="Station"
            name="station_name"
            value={formData.station_name || ''}
            onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
          />
          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </FormModal>
    </div>
  );
}