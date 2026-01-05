"use client";

import React, { useState } from 'react';
import { ShieldCheck, Car, Calendar, Edit2, MoreVertical } from 'lucide-react';
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
const mockInsurances = [];
const mockVehicles = [];
const mockInsurers = [];

export default function Insurances() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const insurances = mockInsurances;
  const vehicles = mockVehicles;
  const insurers = mockInsurers;

  const getVehicle = (id) => vehicles.find(v => v.id === id);
  const getInsurer = (id) => insurers.find(i => i.id === id);

  const openModal = (insurance = null) => {
    setEditingInsurance(insurance);
    setFormData(insurance || { status: 'active' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingInsurance(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    console.log('Submit:', formData);
    toast.success(editingInsurance ? 'Assurance mise à jour' : 'Assurance créée');
    closeModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'Véhicule',
      render: (insurance) => {
        const vehicle = getVehicle(insurance.vehicle_id);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{vehicle.registration_number}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Assureur',
      render: (insurance) => {
        const insurer = getInsurer(insurance.insurer_id);
        return insurer ? (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>{insurer.name}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'N° Police',
      render: (insurance) => (
        <span className="font-mono text-sm">{insurance.policy_number || '-'}</span>
      )
    },
    {
      header: 'Expiration',
      render: (insurance) => {
        const isExpired = insurance.end_date && new Date(insurance.end_date) < new Date();
        return (
          <span className={`text-sm ${isExpired ? 'text-red-500' : ''}`}>
            {insurance.end_date ? format(new Date(insurance.end_date), 'dd/MM/yyyy') : '-'}
          </span>
        );
      }
    },
    {
      header: 'Prime',
      render: (insurance) => (
        <span className="font-semibold">
          {insurance.premium?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Statut',
      render: (insurance) => <StatusBadge status={insurance.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (insurance) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openModal(insurance)}>
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
        title="Assurances"
        subtitle="Gestion des polices d'assurance"
        action={() => openModal()}
        actionLabel="Ajouter une assurance"
      />

      <DataTable
        columns={columns}
        data={insurances}
        isLoading={isLoading}
        searchPlaceholder="Rechercher une assurance..."
        emptyMessage="Aucune assurance enregistrée"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingInsurance ? 'Modifier l\'assurance' : 'Nouvelle assurance'}
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
            label="Assureur"
            name="insurer_id"
            type="select"
            value={formData.insurer_id}
            onChange={handleChange}
            options={insurers.map(i => ({ value: i.id, label: i.name }))}
            required
          />
          <FormField
            label="N° Police"
            name="policy_number"
            value={formData.policy_number}
            onChange={handleChange}
          />
          <FormField
            label="Prime annuelle"
            name="premium"
            type="number"
            value={formData.premium}
            onChange={handleChange}
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
