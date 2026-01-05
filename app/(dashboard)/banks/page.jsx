"use client";

import React, { useState } from 'react';
import { Landmark, Phone, Mail, MapPin, Edit2, Trash2, MoreVertical } from 'lucide-react';
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

const mobileMoneyProviders = [
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'wave', label: 'Wave' },
  { value: 'free_money', label: 'Free Money' },
  { value: 'other', label: 'Autre' }
];

const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'suspended', label: 'Suspendu' }
];

// Données mock - à remplacer par tes appels API
const mockBanks = [];
const mockVehicles = [];

export default function Banks() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Données mock
  const banks = mockBanks;
  const vehicles = mockVehicles;

  const openModal = (bank = null) => {
    setEditingBank(bank);
    setFormData(bank || { status: 'active' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBank(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    // TODO: Implémenter l'appel API
    console.log('Submit:', formData);
    toast.success(editingBank ? 'Banque mise à jour' : 'Banque créée avec succès');
    closeModal();
  };

  const handleDelete = async (id) => {
    // TODO: Implémenter l'appel API
    console.log('Delete:', id);
    toast.success('Banque supprimée');
    setDeleteConfirm(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'Banque',
      render: (bank) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{bank.name}</p>
            <p className="text-xs text-slate-500">{bank.code}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Mobile Money',
      render: (bank) => (
        <div>
          <p className="text-sm text-slate-900">{bank.mobile_money_account}</p>
          <p className="text-xs text-slate-500">
            {mobileMoneyProviders.find(p => p.value === bank.mobile_money_provider)?.label || '-'}
          </p>
        </div>
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
        </div>
      )
    },
    {
      header: 'Véhicules',
      render: (bank) => {
        const count = vehicles.filter(v => v.bank_id === bank.id).length;
        const credit = vehicles
          .filter(v => v.bank_id === bank.id)
          .reduce((sum, v) => sum + (v.credit_amount || 0), 0);
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
            required
            placeholder="BNK001"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Compte Mobile Money"
            name="mobile_money_account"
            value={formData.mobile_money_account}
            onChange={handleChange}
            required
            placeholder="77 123 45 67"
          />
          <FormField
            label="Fournisseur"
            name="mobile_money_provider"
            type="select"
            value={formData.mobile_money_provider}
            onChange={handleChange}
            options={mobileMoneyProviders}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Nom du contact"
            name="contact_name"
            value={formData.contact_name}
            onChange={handleChange}
          />
          <FormField
            label="Email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Téléphone"
            name="contact_phone"
            value={formData.contact_phone}
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
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
