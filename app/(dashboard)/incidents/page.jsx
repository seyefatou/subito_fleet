"use client";

import React, { useState } from 'react';
import { AlertTriangle, Car, User, Calendar, Edit2, MoreVertical } from 'lucide-react';
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

const incidentTypes = [
  { value: 'accident', label: 'Accident' },
  { value: 'breakdown', label: 'Panne' },
  { value: 'theft', label: 'Vol' },
  { value: 'damage', label: 'Dommage' },
  { value: 'other', label: 'Autre' }
];

// Données mock
const mockIncidents = [];
const mockVehicles = [];
const mockDrivers = [];

export default function Incidents() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const incidents = mockIncidents;
  const vehicles = mockVehicles;
  const drivers = mockDrivers;

  const getVehicle = (id) => vehicles.find(v => v.id === id);
  const getDriver = (id) => drivers.find(d => d.id === id);

  const openModal = (incident = null) => {
    setEditingIncident(incident);
    setFormData(incident || { status: 'open' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIncident(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    console.log('Submit:', formData);
    toast.success(editingIncident ? 'Incident mis à jour' : 'Incident créé');
    closeModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'Date',
      render: (incident) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{incident.incident_date ? format(new Date(incident.incident_date), 'dd/MM/yyyy') : '-'}</span>
        </div>
      )
    },
    {
      header: 'Type',
      render: (incident) => (
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>{incidentTypes.find(t => t.value === incident.type)?.label || incident.type}</span>
        </div>
      )
    },
    {
      header: 'Véhicule',
      render: (incident) => {
        const vehicle = getVehicle(incident.vehicle_id);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{vehicle.registration_number}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Chauffeur',
      render: (incident) => {
        const driver = getDriver(incident.driver_id);
        return driver ? (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            <span>{driver.first_name} {driver.last_name}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Coût estimé',
      render: (incident) => (
        <span className="font-semibold">
          {incident.estimated_cost?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Statut',
      render: (incident) => <StatusBadge status={incident.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (incident) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openModal(incident)}>
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
        title="Incidents"
        subtitle="Gestion des incidents et sinistres"
        action={() => openModal()}
        actionLabel="Déclarer un incident"
      />

      <DataTable
        columns={columns}
        data={incidents}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un incident..."
        emptyMessage="Aucun incident enregistré"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingIncident ? 'Modifier l\'incident' : 'Nouvel incident'}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Type"
            name="type"
            type="select"
            value={formData.type}
            onChange={handleChange}
            options={incidentTypes}
            required
          />
          <FormField
            label="Date"
            name="incident_date"
            type="date"
            value={formData.incident_date}
            onChange={handleChange}
            required
          />
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
            label="Chauffeur"
            name="driver_id"
            type="select"
            value={formData.driver_id}
            onChange={handleChange}
            options={drivers.map(d => ({ value: d.id, label: `${d.first_name} ${d.last_name}` }))}
          />
          <FormField
            label="Coût estimé"
            name="estimated_cost"
            type="number"
            value={formData.estimated_cost}
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
