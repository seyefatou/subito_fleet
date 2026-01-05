import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Settings, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from '@/components/common/FormField';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MaintenanceConfigModal({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    prediction_type: 'general',
    critical_probability_threshold: 80,
    high_probability_threshold: 60,
    critical_days_threshold: 7,
    high_days_threshold: 15,
    notification_enabled: true
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['maintenance-configs'],
    queryFn: () => base44.entities.MaintenanceConfig.list()
  });

  const saveConfigMutation = useMutation({
    mutationFn: (data) => {
      const existing = configs.find(c => c.prediction_type === data.prediction_type);
      if (existing) {
        return base44.entities.MaintenanceConfig.update(existing.id, data);
      }
      return base44.entities.MaintenanceConfig.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-configs'] });
      toast.success('Configuration enregistrée');
    }
  });

  const handleSave = () => {
    saveConfigMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            Configuration des alertes
          </DialogTitle>
          <DialogDescription>
            Personnaliser les seuils et paramètres de maintenance prédictive
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="thresholds" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="thresholds">Seuils d'alerte</TabsTrigger>
            <TabsTrigger value="garages">Garages</TabsTrigger>
          </TabsList>

          <TabsContent value="thresholds" className="space-y-4 mt-4">
            <FormField
              label="Type de maintenance"
              name="prediction_type"
              type="select"
              value={formData.prediction_type}
              onChange={(e) => {
                const existing = configs.find(c => c.prediction_type === e.target.value);
                if (existing) {
                  setFormData(existing);
                } else {
                  setFormData({ ...formData, prediction_type: e.target.value });
                }
              }}
              options={[
                { value: 'general', label: 'Général (défaut)' },
                { value: 'brake_wear', label: 'Freins' },
                { value: 'tire_replacement', label: 'Pneus' },
                { value: 'battery_failure', label: 'Batterie' },
                { value: 'engine_oil', label: 'Huile moteur' },
                { value: 'transmission', label: 'Transmission' }
              ]}
            />

            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <h4 className="font-semibold text-slate-900">Seuils de probabilité (%)</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Alerte critique"
                  name="critical_probability_threshold"
                  type="number"
                  value={formData.critical_probability_threshold}
                  onChange={(e) => setFormData({ ...formData, critical_probability_threshold: parseInt(e.target.value) })}
                />
                <FormField
                  label="Alerte élevée"
                  name="high_probability_threshold"
                  type="number"
                  value={formData.high_probability_threshold}
                  onChange={(e) => setFormData({ ...formData, high_probability_threshold: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <h4 className="font-semibold text-slate-900">Seuils de délai (jours avant panne)</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Alerte critique"
                  name="critical_days_threshold"
                  type="number"
                  value={formData.critical_days_threshold}
                  onChange={(e) => setFormData({ ...formData, critical_days_threshold: parseInt(e.target.value) })}
                />
                <FormField
                  label="Alerte élevée"
                  name="high_days_threshold"
                  type="number"
                  value={formData.high_days_threshold}
                  onChange={(e) => setFormData({ ...formData, high_days_threshold: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifications"
                checked={formData.notification_enabled}
                onChange={(e) => setFormData({ ...formData, notification_enabled: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="notifications" className="text-sm text-slate-700">
                Activer les notifications automatiques
              </label>
            </div>
          </TabsContent>

          <TabsContent value="garages" className="mt-4">
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">Configuration des garages à venir</p>
              <p className="text-xs mt-2">Cette fonctionnalité permet de gérer vos garages partenaires</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveConfigMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}