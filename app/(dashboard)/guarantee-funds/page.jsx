"use client";

import React, { useState } from 'react';
import { Shield, Edit2, Trash2, MoreVertical } from 'lucide-react';
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
const mockFunds = [];

export default function GuaranteeFunds() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const funds = mockFunds;

  const openModal = (fund = null) => {
    setEditingFund(fund);
    setFormData(fund || { status: 'active' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFund(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    console.log('Submit:', formData);
    toast.success(editingFund ? 'Fonds mis à jour' : 'Fonds créé');
    closeModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'Fonds',
      render: (fund) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{fund.name}</p>
            <p className="text-xs text-slate-500">{fund.code}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Dotation',
      render: (fund) => (
        <span className="font-semibold">
          {fund.total_amount?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Disponible',
      render: (fund) => (
        <span className="text-emerald-600 font-medium">
          {fund.available_amount?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Engagé',
      render: (fund) => (
        <span className="text-amber-600">
          {fund.committed_amount?.toLocaleString('fr-FR')} F
        </span>
      )
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
            <DropdownMenuItem onClick={() => openModal(fund)}>
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
            label="Dotation totale"
            name="total_amount"
            type="number"
            value={formData.total_amount}
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
          label="Description"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          rows={2}
        />
      </FormModal>
    </div>
  );
}
