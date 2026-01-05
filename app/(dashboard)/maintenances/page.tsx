// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { Wrench, Car, Calendar, Edit2, MoreVertical } from 'lucide-react';
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

const maintenanceTypes = [
  { value: 'oil_change', label: 'Vidange' },
  { value: 'tire_change', label: 'Changement pneus' },
  { value: 'brake_service', label: 'Freins' },
  { value: 'general_service', label: 'Révision générale' },
  { value: 'repair', label: 'Réparation' },
  { value: 'other', label: 'Autre' }
];

// Données mock
const mockMaintenances: any[] = [];
const mockVehicles: any[] = [];

export default function Maintenances() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const maintenances = mockMaintenances;
  const vehicles = mockVehicles;

  const getVehicle = (id) => vehicles.find(v => v.id === id);

  const openModal = (maintenance = null) => {
    setEditingMaintenance(maintenance);
    setFormData(maintenance || { status: 'scheduled' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMaintenance(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    console.log('Submit:', formData);
    toast.success(editingMaintenance ? 'Entretien mis à jour' : 'Entretien créé');
    closeModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'Véhicule',
      render: (maintenance) => {
        const vehicle = getVehicle(maintenance.vehicle_id);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{vehicle.registration_number}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Type',
      render: (maintenance) => (
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-400" />
          <span>{maintenanceTypes.find(t => t.value === maintenance.type)?.label || maintenance.type}</span>
        </div>
      )
    },
    {
      header: 'Date',
      render: (maintenance) => (
        <span className="text-sm">
          {maintenance.date ? format(new Date(maintenance.date), 'dd/MM/yyyy') : '-'}
        </span>
      )
    },
    {
      header: 'Kilométrage',
      render: (maintenance) => (
        <span>{maintenance.mileage?.toLocaleString('fr-FR')} km</span>
      )
    },
    {
      header: 'Coût',
      render: (maintenance) => (
        <span className="font-semibold">
          {maintenance.cost?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Statut',
      render: (maintenance) => <StatusBadge status={maintenance.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (maintenance) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openModal(maintenance)}>
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
        title="Entretien"
        subtitle="Gestion de l'entretien des véhicules"
        action={() => openModal()}
        actionLabel="Ajouter un entretien"
      />

      <DataTable
        columns={columns}
        data={maintenances}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un entretien..."
        emptyMessage="Aucun entretien enregistré"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingMaintenance ? 'Modifier l\'entretien' : 'Nouvel entretien'}
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
            label="Type"
            name="type"
            type="select"
            value={formData.type}
            onChange={handleChange}
            options={maintenanceTypes}
            required
          />
          <FormField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
          />
          <FormField
            label="Kilométrage"
            name="mileage"
            type="number"
            value={formData.mileage}
            onChange={handleChange}
          />
          <FormField
            label="Coût (FCFA)"
            name="cost"
            type="number"
            value={formData.cost}
            onChange={handleChange}
          />
        </div>
        <FormField
          label="Description"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </FormModal>
    </div>
  );
}
