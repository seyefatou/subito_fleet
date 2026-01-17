// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, Mail, Edit2, Trash2, MoreVertical, Loader2, MapPin, Eye } from 'lucide-react';
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
import { toast } from "sonner";
import insurersService from '@/api/services/insurers.service';
import { useAlert } from '@/providers/AlertProvider';

const statusOptions = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' }
];

export default function Insurers() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInsurer, setEditingInsurer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});

  // Récupérer les assureurs
  const { data: insurersData, isLoading } = useQuery({
    queryKey: ['insurers'],
    queryFn: () => insurersService.list(),
  });

  // Mutation pour créer un assureur
  const createMutation = useMutation({
    mutationFn: (data) => insurersService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['insurers'] });
      toast.success(response.message || 'Assureur créé avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de création');
    },
  });

  // Mutation pour modifier un assureur
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => insurersService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['insurers'] });
      toast.success(response.message || 'Assureur mis à jour avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de mise à jour');
    },
  });

  // Mutation pour supprimer un assureur
  const deleteMutation = useMutation({
    mutationFn: (id) => insurersService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['insurers'] });
      toast.success(response.message || 'Assureur supprimé avec succès');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  const insurers = insurersData?.data || [];

  const openModal = (insurer = null) => {
    setEditingInsurer(insurer);
    if (insurer) {
      setFormData({
        name: insurer.name,
        address: insurer.address,
        contactPhone: insurer.contact_phone,
        contactEmail: insurer.contact_email,
        status: insurer.status,
      });
    } else {
      setFormData({ status: 'ACTIVE' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingInsurer(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    const data = {
      name: formData.name,
      address: formData.address || undefined,
      contactPhone: formData.contactPhone || undefined,
      contactEmail: formData.contactEmail || undefined,
      status: formData.status,
    };

    if (editingInsurer) {
      updateMutation.mutate({ id: editingInsurer.id, data });
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
      header: 'Assureur',
      render: (insurer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <Link href={`/insurers/${insurer.id}`} className="text-blue-600 hover:underline font-semibold">{insurer.name}</Link>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      render: (insurer) => (
        <div className="space-y-1">
          {insurer.contact_email && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {insurer.contact_email}
            </p>
          )}
          {insurer.contact_phone && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {insurer.contact_phone}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Adresse',
      render: (insurer) => insurer.address ? (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">{insurer.address}</span>
        </div>
      ) : <span className="text-slate-400">-</span>
    },
    {
      header: 'Statut',
      render: (insurer) => <StatusBadge status={insurer.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (insurer) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/insurers/${insurer.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(insurer)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(insurer)}
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
        title="Assureurs"
        subtitle="Gestion des compagnies d'assurance"
        action={() => openModal()}
        actionLabel="Ajouter un assureur"
      />

      <DataTable
        columns={columns}
        data={insurers}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un assureur..."
        emptyMessage="Aucun assureur enregistré"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingInsurer ? 'Modifier l\'assureur' : 'Nouvel assureur'}
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
            label="Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
          />
          <FormField
            label="Téléphone"
            name="contactPhone"
            value={formData.contactPhone}
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
            <AlertDialogTitle>Supprimer cet assureur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les assurances associées devront être réaffectées.
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
