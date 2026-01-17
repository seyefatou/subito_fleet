// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Car, Landmark, Edit2, Trash2, MoreVertical, Loader2, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import FormModal from '@/components/common/FormModal';
import FormField from '@/components/common/FormField';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import guaranteesService from '@/api/services/guarantees.service';
import vehiclesService from '@/api/services/vehicles.service';
import banksService from '@/api/services/banks.service';
import guaranteeFundsService from '@/api/services/guarantee-funds.service';
import { useAlert } from '@/providers/AlertProvider';

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CALLED', label: 'Appelée' },
  { value: 'RELEASED', label: 'Libérée' },
  { value: 'EXPIRED', label: 'Expirée' }
];

export default function Guarantees() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuarantee, setEditingGuarantee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});

  // Récupérer les garanties
  const { data: guaranteesData, isLoading } = useQuery({
    queryKey: ['guarantees'],
    queryFn: () => guaranteesService.list(),
  });

  // Récupérer les véhicules
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  // Récupérer les banques
  const { data: banksData } = useQuery({
    queryKey: ['banks'],
    queryFn: () => banksService.list(),
  });

  // Récupérer les fonds de garantie
  const { data: fundsData } = useQuery({
    queryKey: ['guarantee-funds'],
    queryFn: () => guaranteeFundsService.list(),
  });

  // Mutation pour créer une garantie
  const createMutation = useMutation({
    mutationFn: (data) => guaranteesService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['guarantees'] });
      toast.success(response.message || 'Garantie créée avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de création');
    },
  });

  // Mutation pour modifier une garantie
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => guaranteesService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['guarantees'] });
      toast.success(response.message || 'Garantie mise à jour avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de mise à jour');
    },
  });

  // Mutation pour supprimer une garantie
  const deleteMutation = useMutation({
    mutationFn: (id) => guaranteesService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['guarantees'] });
      toast.success(response.message || 'Garantie supprimée avec succès');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  // Mutation pour libérer une garantie
  const releaseMutation = useMutation({
    mutationFn: (id) => guaranteesService.release(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['guarantees'] });
      toast.success(response.message || 'Garantie libérée avec succès');
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de libération');
    },
  });

  const guarantees = guaranteesData?.data || [];
  const vehicles = vehiclesData?.data || [];
  const banks = banksData?.data || [];
  const funds = fundsData?.data || [];

  const getVehicle = (id) => vehicles.find(v => v.id === id);
  const getBank = (id) => banks.find(b => b.id === id);
  const getFund = (id) => funds.find(f => f.id === id);

  const openModal = (guarantee = null) => {
    setEditingGuarantee(guarantee);
    if (guarantee) {
      setFormData({
        vehicleId: guarantee.vehicle_id || guarantee.vehicleId,
        bankId: guarantee.bank_id || guarantee.bankId,
        guaranteeFundId: guarantee.guarantee_fund_id || guarantee.guaranteeFundId,
        guaranteeAmount: guarantee.guarantee_amount || guarantee.guaranteeAmount,
        status: guarantee.status,
      });
    } else {
      setFormData({ status: 'ACTIVE' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingGuarantee(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    const vehicleId = formData.vehicleId && formData.vehicleId !== 'NONE' ? formData.vehicleId : undefined;
    const bankId = formData.bankId && formData.bankId !== 'NONE' ? formData.bankId : undefined;
    const guaranteeFundId = formData.guaranteeFundId && formData.guaranteeFundId !== 'NONE' ? formData.guaranteeFundId : undefined;

    const data = {
      vehicleId,
      bankId,
      guaranteeFundId,
      guaranteeAmount: Number(formData.guaranteeAmount) || 0,
      status: formData.status,
    };

    if (editingGuarantee) {
      updateMutation.mutate({ id: editingGuarantee.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = async (id) => {
    deleteMutation.mutate(id);
  };

  const handleRelease = async (id) => {
    releaseMutation.mutate(id);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const columns = [
    {
      header: 'Véhicule',
      render: (guarantee) => {
        const vehicle = guarantee.vehicles || guarantee.vehicle || getVehicle(guarantee.vehicle_id || guarantee.vehicleId);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <div>
              <Link href={`/guarantees/${guarantee.id}`} className="text-blue-600 hover:underline font-medium">{vehicle.registrationNumber}</Link>
              <p className="text-xs text-slate-500">{vehicle.brand} {vehicle.model}</p>
            </div>
          </div>
        ) : <span className="text-slate-400">-</span>;
      }
    },
    {
      header: 'Banque',
      render: (guarantee) => {
        const bank = guarantee.banks || guarantee.bank || getBank(guarantee.bank_id || guarantee.bankId);
        return bank ? (
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-500" />
            <span>{bank.name}</span>
          </div>
        ) : <span className="text-slate-400">-</span>;
      }
    },
    {
      header: 'Fonds',
      render: (guarantee) => {
        const fund = guarantee.guarantee_funds || guarantee.guaranteeFund || getFund(guarantee.guarantee_fund_id || guarantee.guaranteeFundId);
        return fund ? (
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            <span>{fund.name}</span>
          </div>
        ) : <span className="text-slate-400">-</span>;
      }
    },
    {
      header: 'Montant',
      render: (guarantee) => (
        <span className="font-semibold text-slate-900">
          {(guarantee.guarantee_amount || guarantee.guaranteeAmount)?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Statut',
      render: (guarantee) => <StatusBadge status={guarantee.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (guarantee) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/guarantees/${guarantee.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(guarantee)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            {guarantee.status === 'ACTIVE' && (
              <DropdownMenuItem onClick={() => handleRelease(guarantee.id)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Libérer
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(guarantee)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const vehicleOptions = [{ value: 'NONE', label: 'Sélectionner un véhicule' }, ...vehicles.filter(v => v.id).map(v => ({ value: v.id, label: `${v.registrationNumber} - ${v.brand} ${v.model}` }))];
  const bankOptions = [{ value: 'NONE', label: 'Sélectionner une banque' }, ...banks.filter(b => b.id).map(b => ({ value: b.id, label: b.name }))];
  const fundOptions = [{ value: 'NONE', label: 'Sélectionner un fonds' }, ...funds.filter(f => f.id).map(f => ({ value: f.id, label: f.name }))];

  return (
    <div>
      <PageHeader
        title="Garanties"
        subtitle="Gestion des garanties de crédit"
        action={() => openModal()}
        actionLabel="Ajouter une garantie"
      />

      <DataTable
        columns={columns}
        data={guarantees}
        isLoading={isLoading}
        searchPlaceholder="Rechercher une garantie..."
        emptyMessage="Aucune garantie enregistrée"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingGuarantee ? 'Modifier la garantie' : 'Nouvelle garantie'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Véhicule"
            name="vehicleId"
            type="select"
            value={formData.vehicleId}
            onChange={handleChange}
            options={vehicleOptions}
            required
          />
          <FormField
            label="Banque"
            name="bankId"
            type="select"
            value={formData.bankId}
            onChange={handleChange}
            options={bankOptions}
            required
          />
          <FormField
            label="Fonds de garantie"
            name="guaranteeFundId"
            type="select"
            value={formData.guaranteeFundId}
            onChange={handleChange}
            options={fundOptions}
            required
          />
          <FormField
            label="Montant (FCFA)"
            name="guaranteeAmount"
            type="number"
            value={formData.guaranteeAmount}
            onChange={handleChange}
            required
          />
          <FormField
            label="Statut"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
        </div>
      </FormModal>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette garantie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteConfirm?.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
