// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Edit2, Trash2, MoreVertical, Loader2, Phone, Mail, User, Eye } from 'lucide-react';
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
import guaranteeFundsService from '@/api/services/guarantee-funds.service';
import { useAlert } from '@/providers/AlertProvider';

const statusOptions = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' }
];

export default function GuaranteeFunds() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});

  // Récupérer les fonds de garantie
  const { data: fundsData, isLoading } = useQuery({
    queryKey: ['guarantee-funds'],
    queryFn: () => guaranteeFundsService.list(),
  });

  // Mutation pour créer un fonds
  const createMutation = useMutation({
    mutationFn: (data) => guaranteeFundsService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['guarantee-funds'] });
      alert.showSuccess(response.message || 'Fonds créé avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de création');
    },
  });

  // Mutation pour modifier un fonds
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => guaranteeFundsService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['guarantee-funds'] });
      alert.showSuccess(response.message || 'Fonds mis à jour avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de mise à jour');
    },
  });

  // Mutation pour supprimer un fonds
  const deleteMutation = useMutation({
    mutationFn: (id) => guaranteeFundsService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['guarantee-funds'] });
      alert.showSuccess(response.message || 'Fonds supprimé avec succès');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  const funds = fundsData?.data || [];

  const openModal = (fund = null) => {
    setEditingFund(fund);
    if (fund) {
      setFormData({
        name: fund.name,
        totalAmount: fund.totalAmount,
        availableAmount: fund.availableAmount,
        managerName: fund.managerName,
        contactPhone: fund.contactPhone,
        contactEmail: fund.contactEmail,
        address: fund.address,
        status: fund.status,
      });
    } else {
      setFormData({ status: 'ACTIVE' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFund(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    const data = {
      name: formData.name,
      totalAmount: Number(formData.totalAmount) || 0,
      availableAmount: Number(formData.availableAmount) || Number(formData.totalAmount) || 0,
      managerName: formData.managerName || undefined,
      contactPhone: formData.contactPhone || undefined,
      contactEmail: formData.contactEmail || undefined,
      address: formData.address || undefined,
      status: formData.status,
    };

    if (editingFund) {
      updateMutation.mutate({ id: editingFund.id, data });
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
      header: 'Fonds',
      render: (fund) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <Link href={`/guarantee-funds/${fund.id}`} className="text-blue-600 hover:underline font-semibold">{fund.name}</Link>
            {fund.managerName && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                {fund.managerName}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      render: (fund) => (
        <div className="space-y-1">
          {fund.contactPhone && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {fund.contactPhone}
            </p>
          )}
          {fund.contactEmail && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {fund.contactEmail}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Dotation totale',
      render: (fund) => (
        <span className="font-semibold text-slate-900">
          {fund.totalAmount?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Disponible',
      render: (fund) => (
        <span className="text-emerald-600 font-medium">
          {fund.availableAmount?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Engagé',
      render: (fund) => {
        const committed = (fund.totalAmount || 0) - (fund.availableAmount || 0);
        return (
          <span className="text-amber-600">
            {committed.toLocaleString('fr-FR')} F
          </span>
        );
      }
    },
    {
      header: 'Statut',
      render: (fund) => <StatusBadge status={fund.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (fund) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/guarantee-funds/${fund.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(fund)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(fund)}
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
        title="Fonds de garantie"
        subtitle="Gestion des fonds de garantie"
        action={() => openModal()}
        actionLabel="Ajouter un fonds"
      />

      <DataTable
        columns={columns}
        data={funds}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un fonds..."
        emptyMessage="Aucun fonds enregistré"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingFund ? 'Modifier le fonds' : 'Nouveau fonds'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Nom"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormField
            label="Gestionnaire"
            name="managerName"
            value={formData.managerName}
            onChange={handleChange}
          />
          <FormField
            label="Dotation totale (FCFA)"
            name="totalAmount"
            type="number"
            value={formData.totalAmount}
            onChange={handleChange}
            required
          />
          <FormField
            label="Montant disponible (FCFA)"
            name="availableAmount"
            type="number"
            value={formData.availableAmount}
            onChange={handleChange}
          />
          <FormField
            label="Téléphone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
          />
          <FormField
            label="Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
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
            <AlertDialogTitle>Supprimer ce fonds ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les garanties associées devront être réaffectées.
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
