import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FormModal from '@/components/common/FormModal';
import FormField from '@/components/common/FormField';
import { ArrowRight, Plus, Settings, Trash2, AlertTriangle } from 'lucide-react';
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

const vehicleStatuses = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'seized', label: 'Saisi' }
];

const driverStatuses = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'suspended', label: 'Suspendu' }
];

export default function RoutingRulesManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: rules = [] } = useQuery({
    queryKey: ['routing-rules'],
    queryFn: () => base44.entities.PaymentRoutingRule.list('-priority')
  });

  const { data: banks = [] } = useQuery({
    queryKey: ['banks'],
    queryFn: () => base44.entities.Bank.list()
  });

  const { data: funds = [] } = useQuery({
    queryKey: ['guarantee-funds'],
    queryFn: () => base44.entities.GuaranteeFund.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PaymentRoutingRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
      toast.success('Règle créée');
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PaymentRoutingRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
      toast.success('Règle mise à jour');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PaymentRoutingRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
      toast.success('Règle supprimée');
      setDeleteId(null);
    }
  });

  const openModal = (rule = null) => {
    if (rule) {
      setFormData({ 
        ...rule,
        vehicle_status: rule.conditions?.vehicle_status?.join(',') || '',
        driver_status: rule.conditions?.driver_status?.join(',') || '',
        days_in_default: rule.conditions?.days_in_default || ''
      });
    } else {
      setFormData({ 
        priority: rules.length + 1,
        is_active: true,
        routing_destination: { type: 'bank' }
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({});
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      priority: Number(formData.priority),
      is_active: formData.is_active !== false,
      description: formData.description,
      conditions: {
        vehicle_status: formData.vehicle_status ? formData.vehicle_status.split(',') : [],
        driver_status: formData.driver_status ? formData.driver_status.split(',') : [],
        days_in_default: formData.days_in_default ? Number(formData.days_in_default) : undefined,
        bank_id: formData.bank_id || undefined
      },
      routing_destination: {
        type: formData.destination_type,
        destination_id: formData.destination_id || undefined,
        account_number: formData.account_number || undefined,
        provider: formData.provider || undefined
      }
    };

    if (formData.id) {
      updateMutation.mutate({ id: formData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleActive = (rule) => {
    updateMutation.mutate({
      id: rule.id,
      data: { ...rule, is_active: !rule.is_active }
    });
  };

  const getDestinationLabel = (rule) => {
    const type = destinationTypes.find(t => t.value === rule.routing_destination?.type);
    if (rule.routing_destination?.type === 'bank' && rule.routing_destination?.destination_id) {
      const bank = banks.find(b => b.id === rule.routing_destination.destination_id);
      return bank ? bank.name : type?.label;
    }
    if (rule.routing_destination?.type === 'guarantee_fund' && rule.routing_destination?.destination_id) {
      const fund = funds.find(f => f.id === rule.routing_destination.destination_id);
      return fund ? fund.name : type?.label;
    }
    return type?.label || '-';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Règles de routage</h3>
          <p className="text-sm text-slate-500">Configuration des routes conditionnelles</p>
        </div>
        <Button onClick={() => openModal()} size="sm" className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle règle
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <Settings className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Aucune règle configurée</p>
            <p className="text-sm mt-2">Les paiements seront routés vers la banque financeuse par défaut</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className={!rule.is_active ? 'opacity-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Priorité {rule.priority}
                      </Badge>
                      {!rule.is_active && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {rule.description && (
                      <p className="text-sm text-slate-500 mt-1">{rule.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleActive(rule)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openModal(rule)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setDeleteId(rule.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-slate-600">Conditions:</span>
                    {rule.conditions?.vehicle_status?.length > 0 && (
                      <Badge variant="secondary">
                        Véhicule: {rule.conditions.vehicle_status.join(', ')}
                      </Badge>
                    )}
                    {rule.conditions?.driver_status?.length > 0 && (
                      <Badge variant="secondary">
                        Chauffeur: {rule.conditions.driver_status.join(', ')}
                      </Badge>
                    )}
                    {rule.conditions?.days_in_default && (
                      <Badge variant="secondary">
                        Défaut ≥ {rule.conditions.days_in_default}j
                      </Badge>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {getDestinationLabel(rule)}
                    </span>
                    {rule.routing_destination?.account_number && (
                      <Badge variant="outline" className="text-xs">
                        {rule.routing_destination.account_number}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={formData.id ? 'Modifier la règle' : 'Nouvelle règle de routage'}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Nom de la règle"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <FormField
              label="Priorité"
              name="priority"
              type="number"
              value={formData.priority}
              onChange={handleChange}
              required
            />
          </div>

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            rows={2}
          />

          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Conditions d'application</h4>
            <div className="space-y-3">
              <FormField
                label="Statuts véhicule (séparés par virgule)"
                name="vehicle_status"
                value={formData.vehicle_status}
                onChange={handleChange}
                placeholder="ex: seized,inactive"
              />
              <FormField
                label="Statuts chauffeur (séparés par virgule)"
                name="driver_status"
                value={formData.driver_status}
                onChange={handleChange}
                placeholder="ex: suspended,inactive"
              />
              <FormField
                label="Jours de défaut minimum"
                name="days_in_default"
                type="number"
                value={formData.days_in_default}
                onChange={handleChange}
                placeholder="ex: 7"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Destination du routage</h4>
            <div className="space-y-3">
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
                  label="Banque"
                  name="destination_id"
                  type="select"
                  value={formData.destination_id}
                  onChange={handleChange}
                  options={banks.map(b => ({ value: b.id, label: b.name }))}
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
                />
              )}

              {(formData.destination_type === 'provision_account' || formData.destination_type === 'custom') && (
                <>
                  <FormField
                    label="Numéro de compte"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
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
          </div>
        </div>
      </FormModal>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette règle ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les paiements futurs ne seront plus routés selon cette règle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}