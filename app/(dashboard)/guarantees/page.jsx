"use client";

import React, { useState } from 'react';
import { Shield, Car, Calendar, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
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

// Données mock
const mockGuarantees = [];
const mockVehicles = [];
const mockFunds = [];

export default function Guarantees() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuarantee, setEditingGuarantee] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const guarantees = mockGuarantees;
  const vehicles = mockVehicles;
  const funds = mockFunds;

  const getVehicle = (id) => vehicles.find(v => v.id === id);
  const getFund = (id) => funds.find(f => f.id === id);

  const openModal = (guarantee = null) => {
    setEditingGuarantee(guarantee);
    setFormData(guarantee || { status: 'active' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingGuarantee(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    console.log('Submit:', formData);
    toast.success(editingGuarantee ? 'Garantie mise à jour' : 'Garantie créée');
    closeModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'Véhicule',
      render: (guarantee) => {
        const vehicle = getVehicle(guarantee.vehicle_id);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{vehicle.registration_number}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Fonds',
      render: (guarantee) => {
        const fund = getFund(guarantee.fund_id);
        return fund ? (
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            <span>{fund.name}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Montant',
      render: (guarantee) => (
        <span className="font-semibold">
          {guarantee.amount?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Début',
      render: (guarantee) => (
        <span className="text-sm">
          {guarantee.start_date ? format(new Date(guarantee.start_date), 'dd/MM/yyyy') : '-'}
        </span>
      )
    },
    {
      header: 'Fin',
      render: (guarantee) => (
        <span className="text-sm">
          {guarantee.end_date ? format(new Date(guarantee.end_date), 'dd/MM/yyyy') : '-'}
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
            <DropdownMenuItem onClick={() => openModal(guarantee)}>
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
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Véhicule"
            name="vehicle_id"
            type="select"
            value={formData.vehicle_id}
            onChange={handleChange}
            options={vehicles.map(v => ({ value: v.id, label: v.registration_number }))}
            required
          />
          <FormField
            label="Fonds de garantie"
            name="fund_id"
            type="select"
            value={formData.fund_id}
            onChange={handleChange}
            options={funds.map(f => ({ value: f.id, label: f.name }))}
            required
          />
          <FormField
            label="Montant"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <FormField
            label="Date de début"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
          />
          <FormField
            label="Date de fin"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
          />
        </div>
      </FormModal>
    </div>
  );
}
