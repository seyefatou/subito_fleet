// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Landmark, Phone, Mail, MapPin, Edit2, Trash2, MoreVertical, Loader2, Eye } from 'lucide-react';
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
import banksService from '@/api/services/banks.service';
import vehiclesService from '@/api/services/vehicles.service';
import { useAlert } from '@/providers/AlertProvider';

const statusOptions = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' }
];

export default function Banks() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});

  // Récupérer les banques
  const { data: banksData, isLoading } = useQuery({
    queryKey: ['banks'],
    queryFn: () => banksService.list(),
  });

  // Récupérer les véhicules pour les stats
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  // Mutation pour créer une banque
  const createMutation = useMutation({
    mutationFn: (data) => banksService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      alert.showSuccess(response.message || 'Banque créée avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de création');
    },
  });

  // Mutation pour modifier une banque
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => banksService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      alert.showSuccess(response.message || 'Banque mise à jour avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de mise à jour');
    },
  });

  // Mutation pour supprimer une banque
  const deleteMutation = useMutation({
    mutationFn: (id) => banksService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      alert.showSuccess(response.message || 'Banque supprimée avec succès');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  const banks = banksData?.data || [];
  const vehicles = vehiclesData?.data || [];

  const openModal = (bank = null) => {
    setEditingBank(bank);
    if (bank) {
      setFormData({
        name: bank.name,
        code: bank.code,
        address: bank.address,
        contactPhone: bank.contact_phone,
        contactEmail: bank.contact_email,
        mobileMoneyProvider: bank.mobile_money_provider,
        status: bank.status,
      });
    } else {
      setFormData({ status: 'ACTIVE' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBank(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    const data = {
      name: formData.name,
      code: formData.code || undefined,
      address: formData.address || undefined,
      contactPhone: formData.contactPhone || undefined,
      contactEmail: formData.contactEmail || undefined,
      mobileMoneyProvider: formData.mobileMoneyProvider && formData.mobileMoneyProvider !== 'NONE' ? formData.mobileMoneyProvider : undefined,
      status: formData.status,
    };

    if (editingBank) {
      updateMutation.mutate({ id: editingBank.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = async (id) => {
    deleteMutation.mutate(id);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const columns = [
    {
      header: 'Banque',
      render: (bank) => (
        <Link href={`/banks/${bank.id}`} className="flex items-center gap-3 hover:opacity-80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-blue-600 hover:underline">{bank.name}</p>
            <p className="text-xs text-slate-500">{bank.code || '-'}</p>
          </div>
        </Link>
      )
    },
    {
      header: 'Contact',
      render: (bank) => (
        <div className="space-y-1">
          {bank.contact_email && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {bank.contact_email}
            </p>
          )}
          {bank.contact_phone && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {bank.contact_phone}
            </p>
          )}
          {bank.mobile_money_provider && (
            <p className="text-xs text-emerald-600 font-medium">
              {bank.mobile_money_provider.replace('_', ' ')}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Adresse',
      render: (bank) => bank.address ? (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">{bank.address}</span>
        </div>
      ) : <span className="text-slate-400">-</span>
    },
    {
      header: 'Véhicules',
      render: (bank) => {
        const count = vehicles.filter(v => v.bankId === bank.id).length;
        const credit = vehicles
          .filter(v => v.bankId === bank.id)
          .reduce((sum, v) => sum + (v.creditAmount || 0), 0);
        return (
          <div>
            <p className="font-semibold text-slate-900">{count}</p>
            <p className="text-xs text-slate-500">{(credit / 1000000).toFixed(1)}M FCFA</p>
          </div>
        );
      }
    },
    {
      header: 'Statut',
      render: (bank) => <StatusBadge status={bank.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (bank) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/banks/${bank.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(bank)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(bank)}
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

  return (
    <div>
      <PageHeader
        title="Banques partenaires"
        subtitle="Gestion des banques financeuses du programme"
        action={() => openModal()}
        actionLabel="Ajouter une banque"
      />

      <DataTable
        columns={columns}
        data={banks}
        isLoading={isLoading}
        searchPlaceholder="Rechercher une banque..."
        emptyMessage="Aucune banque enregistrée"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingBank ? 'Modifier la banque' : 'Nouvelle banque'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Nom de la banque"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormField
            label="Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="BNK001"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Email de contact"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
          />
          <FormField
            label="Téléphone de contact"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Mobile Money"
            name="mobileMoneyProvider"
            type="select"
            value={formData.mobileMoneyProvider}
            onChange={handleChange}
            options={[
              { value: 'NONE', label: 'Aucun' },
              { value: 'ORANGE_MONEY', label: 'Orange Money' },
              { value: 'WAVE', label: 'Wave' },
              { value: 'FREE_MONEY', label: 'Free Money' },
              { value: 'OTHER', label: 'Autre' },
            ]}
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

        <FormField
          label="Adresse"
          name="address"
          type="textarea"
          value={formData.address}
          onChange={handleChange}
          rows={2}
        />
      </FormModal>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette banque ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les véhicules associés devront être réaffectés.
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
