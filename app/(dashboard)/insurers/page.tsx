// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { ShieldCheck, Phone, Mail, Edit2, MoreVertical } from 'lucide-react';
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
import { toast } from "sonner";

const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' }
];

// Données mock
const mockInsurers: any[] = [];

export default function Insurers() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInsurer, setEditingInsurer] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const insurers = mockInsurers;

  const openModal = (insurer = null) => {
    setEditingInsurer(insurer);
    setFormData(insurer || { status: 'active' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingInsurer(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    console.log('Submit:', formData);
    toast.success(editingInsurer ? 'Assureur mis à jour' : 'Assureur créé');
    closeModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'Assureur',
      render: (insurer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{insurer.name}</p>
            <p className="text-xs text-slate-500">{insurer.code}</p>
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
            <DropdownMenuItem onClick={() => openModal(insurer)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
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
            label="Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
          />
          <FormField
            label="Email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleChange}
          />
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
      </FormModal>
    </div>
  );
}
