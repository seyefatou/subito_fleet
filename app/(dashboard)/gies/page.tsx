// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { Building2, Users, Car, Edit2, Trash2, MoreVertical } from 'lucide-react';
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

const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'suspended', label: 'Suspendu' }
];

// Données mock
const mockGies: any[] = [];
const mockDrivers: any[] = [];
const mockVehicles: any[] = [];

export default function GIEs() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGIE, setEditingGIE] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gies = mockGies;
  const drivers = mockDrivers;
  const vehicles = mockVehicles;

  const openModal = (gie = null) => {
    setEditingGIE(gie);
    setFormData(gie || { status: 'active' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingGIE(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    console.log('Submit:', formData);
    toast.success(editingGIE ? 'GIE mis à jour' : 'GIE créé');
    closeModal();
  };

  const handleDelete = async (id) => {
    console.log('Delete:', id);
    toast.success('GIE supprimé');
    setDeleteConfirm(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'GIE',
      render: (gie) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{gie.name}</p>
            <p className="text-xs text-slate-500">{gie.registration_number}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Membres',
      render: (gie) => {
        const count = drivers.filter(d => d.gie_id === gie.id).length;
        return (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span>{count} chauffeurs</span>
          </div>
        );
      }
    },
    {
      header: 'Véhicules',
      render: (gie) => {
        const count = vehicles.filter(v => v.credit_holder_type === 'gie' && v.credit_holder_id === gie.id).length;
        return (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span>{count} véhicules</span>
          </div>
        );
      }
    },
    {
      header: 'Statut',
      render: (gie) => <StatusBadge status={gie.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (gie) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openModal(gie)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(gie)}
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
        title="GIE"
        subtitle="Gestion des Groupements d'Intérêt Économique"
        action={() => openModal()}
        actionLabel="Ajouter un GIE"
      />

      <DataTable
        columns={columns}
        data={gies}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un GIE..."
        emptyMessage="Aucun GIE enregistré"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingGIE ? 'Modifier le GIE' : 'Nouveau GIE'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Nom du GIE"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormField
            label="N° d'enregistrement"
            name="registration_number"
            value={formData.registration_number}
            onChange={handleChange}
          />
          <FormField
            label="Téléphone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <FormField
            label="Responsable"
            name="contact_person"
            value={formData.contact_person}
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
            <AlertDialogTitle>Supprimer ce GIE ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteConfirm?.id)}
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
