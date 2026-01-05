import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FormField from '@/components/common/FormField';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const destinationTypes = [
  { value: 'bank', label: 'Banque financeuse' },
  { value: 'provision_account', label: 'Compte de provision' },
  { value: 'guarantee_fund', label: 'Fonds de garantie' },
  { value: 'custom', label: 'Compte personnalisé' }
];

const providers = [
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'wave', label: 'Wave' },
  { value: 'free_money', label: 'Free Money' },
  { value: 'bank_transfer', label: 'Virement bancaire' }
];

export default function ManualRoutingDialog({ open, onClose, payment }) {
  const [formData, setFormData] = useState({
    destination_type: 'bank',
    destination_id: payment?.bank_id
  });
  const queryClient = useQueryClient();

  const { data: banks = [] } = useQuery({
    queryKey: ['banks'],
    queryFn: () => base44.entities.Bank.list()
  });

  const { data: funds = [] } = useQuery({
    queryKey: ['guarantee-funds'],
    queryFn: () => base44.entities.GuaranteeFund.list()
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DailyPayment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Routage effectué');
      onClose();
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoute = () => {
    const routingData = {
      routed_to_bank: formData.destination_type === 'bank',
      routing_date: new Date().toISOString(),
      routing_reference: `MANUAL-${Date.now()}`,
      routing_destination: {
        type: formData.destination_type,
        destination_id: formData.destination_id,
        account_number: formData.account_number,
        provider: formData.provider
      },
      notes: `${payment.notes || ''}\n[Routage manuel: ${destinationTypes.find(t => t.value === formData.destination_type)?.label}]`.trim()
    };

    updateMutation.mutate({
      id: payment.id,
      data: routingData
    });
  };

  const vehicle = vehicles.find(v => v.id === payment?.vehicle_id);
  const originalBank = banks.find(b => b.id === payment?.bank_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Routage manuel du paiement</DialogTitle>
          <DialogDescription>
            Définir une destination spécifique pour ce paiement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Véhicule:</span>
              <span className="font-medium">{vehicle?.registration_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Montant:</span>
              <span className="font-semibold text-lg text-emerald-600">
                {payment?.paid_amount?.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Banque d'origine:</span>
              <span className="font-medium">{originalBank?.name}</span>
            </div>
          </div>

          {payment?.status !== 'paid' && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Ce paiement n'est pas marqué comme payé. Assurez-vous que le montant a bien été reçu.
              </p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <FormField
              label="Type de destination"
              name="destination_type"
              type="select"
              value={formData.destination_type}
              onChange={handleChange}
              options={destinationTypes}
              required
            />

            {formData.destination_type === 'bank' && (
              <FormField
                label="Banque de destination"
                name="destination_id"
                type="select"
                value={formData.destination_id}
                onChange={handleChange}
                options={banks.map(b => ({ value: b.id, label: b.name }))}
                required
              />
            )}

            {formData.destination_type === 'guarantee_fund' && (
              <FormField
                label="Fonds de garantie"
                name="destination_id"
                type="select"
                value={formData.destination_id}
                onChange={handleChange}
                options={funds.map(f => ({ value: f.id, label: f.name }))}
                required
              />
            )}

            {(formData.destination_type === 'provision_account' || formData.destination_type === 'custom') && (
              <>
                <FormField
                  label="Numéro de compte"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  placeholder="Ex: 77 123 45 67"
                  required
                />
                <FormField
                  label="Provider"
                  name="provider"
                  type="select"
                  value={formData.provider}
                  onChange={handleChange}
                  options={providers}
                  required
                />
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
              Annuler
            </Button>
            <Button 
              onClick={handleRoute} 
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <ArrowRight className="w-4 h-4 mr-2" />
              Effectuer le routage
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}