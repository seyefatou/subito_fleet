// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Car, User, Calendar, Edit2, MoreVertical, Trash2, Loader2, Eye, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import FormModal from '@/components/common/FormModal';
import FormField from '@/components/common/FormField';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { incidentsService } from '@/api/services/incidents.service';
import { vehiclesService } from '@/api/services/vehicles.service';
import { driversService } from '@/api/services/drivers.service';
import { useAlert } from '@/providers/AlertProvider';

const incidentTypes = [
  { value: 'ACCIDENT', label: 'Accident' },
  { value: 'THEFT', label: 'Vol' },
  { value: 'PAYMENT_DEFAULT', label: 'Défaut de paiement' },
  { value: 'GPS_SIGNAL_LOSS', label: 'Perte signal GPS' },
  { value: 'PROLONGED_INACTIVITY', label: 'Inactivité prolongée' },
  { value: 'DOCUMENT_EXPIRY', label: 'Document expiré' },
  { value: 'FRAUD', label: 'Fraude' },
  { value: 'OTHER', label: 'Autre' }
];

const severityOptions = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Élevé' },
  { value: 'CRITICAL', label: 'Critique' }
];

const statusOptions = [
  { value: 'OPEN', label: 'Ouvert' },
  { value: 'INVESTIGATING', label: 'En cours' },
  { value: 'RESOLVED', label: 'Résolu' },
  { value: 'ESCALATED', label: 'Escaladé' }
];

export default function Incidents() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});

  // Filtres
  const [filterType, setFilterType] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Récupérer les incidents
  const { data: incidentsData, isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentsService.list(),
  });

  // Récupérer les véhicules
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  // Récupérer les chauffeurs
  const { data: driversData } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.list(),
  });

  // Mutation pour créer un incident
  const createMutation = useMutation({
    mutationFn: (data) => incidentsService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success(response.message || 'Incident créé avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de création');
    },
  });

  // Mutation pour modifier un incident
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => incidentsService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success(response.message || 'Incident mis à jour avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de mise à jour');
    },
  });

  // Mutation pour supprimer un incident
  const deleteMutation = useMutation({
    mutationFn: (id) => incidentsService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success(response.message || 'Incident supprimé avec succès');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  const incidents = incidentsData?.data || [];
  const vehicles = vehiclesData?.data || [];
  const drivers = driversData?.data || [];

  const getVehicle = (id) => vehicles.find(v => v.id === id);
  const getDriver = (id) => drivers.find(d => d.id === id);

  // Appliquer les filtres
  const filteredIncidents = incidents.filter((incident) => {
    const type = incident.incident_type || incident.incidentType;
    const vehicleId = incident.vehicle_id || incident.vehicleId;
    const driverId = incident.driver_id || incident.driverId;

    if (filterType && filterType !== 'all' && type !== filterType) return false;
    if (filterVehicle && filterVehicle !== 'all' && vehicleId !== filterVehicle) return false;
    if (filterDriver && filterDriver !== 'all' && driverId !== filterDriver) return false;
    if (filterSeverity && filterSeverity !== 'all' && incident.severity !== filterSeverity) return false;
    if (filterStatus && filterStatus !== 'all' && incident.status !== filterStatus) return false;

    return true;
  });

  const clearFilters = () => {
    setFilterType('');
    setFilterVehicle('');
    setFilterDriver('');
    setFilterSeverity('');
    setFilterStatus('');
  };

  const hasFilters = (filterType && filterType !== 'all') ||
                     (filterVehicle && filterVehicle !== 'all') ||
                     (filterDriver && filterDriver !== 'all') ||
                     (filterSeverity && filterSeverity !== 'all') ||
                     (filterStatus && filterStatus !== 'all');

  const openModal = (incident = null) => {
    setEditingIncident(incident);
    if (incident) {
      setFormData({
        vehicleId: incident.vehicle_id || incident.vehicleId,
        driverId: incident.driver_id || incident.driverId,
        incidentDate: (incident.incident_date || incident.incidentDate) ? (incident.incident_date || incident.incidentDate).split('T')[0] : '',
        incidentType: incident.incident_type || incident.incidentType,
        severity: incident.severity,
        description: incident.description,
        status: incident.status,
        investigationNotes: incident.investigation_notes || incident.investigationNotes,
      });
    } else {
      setFormData({ status: 'OPEN', severity: 'MEDIUM', incidentType: 'OTHER' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIncident(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    if (!formData.incidentType) {
      toast.error('Veuillez sélectionner un type d\'incident');
      return;
    }
    if (!formData.incidentDate) {
      toast.error('Veuillez entrer une date d\'incident');
      return;
    }
    if (!formData.description) {
      toast.error('Veuillez entrer une description');
      return;
    }

    const data = {
      vehicleId: formData.vehicleId && formData.vehicleId !== '_none' ? formData.vehicleId : undefined,
      driverId: formData.driverId && formData.driverId !== '_none' ? formData.driverId : undefined,
      incidentDate: formData.incidentDate,
      incidentType: formData.incidentType,
      severity: formData.severity,
      description: formData.description,
      status: formData.status,
      investigationNotes: formData.investigationNotes || undefined,
    };

    if (editingIncident) {
      updateMutation.mutate({ id: editingIncident.id, data });
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

  const vehicleOptions = [
    { value: '_none', label: 'Sélectionner un véhicule' },
    ...vehicles.map(v => ({ value: v.id, label: v.registrationNumber || v.registration_number }))
  ];

  const driverOptions = [
    { value: '_none', label: 'Sélectionner un chauffeur' },
    ...drivers.map(d => ({ value: d.id, label: `${d.first_name || d.firstName} ${d.last_name || d.lastName}` }))
  ];

  const columns = [
    {
      header: 'Date',
      render: (incident) => (
        <Link href={`/incidents/${incident.id}`} className="flex items-center gap-2 hover:opacity-80">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-blue-600 hover:underline">{incident.incidentDate || incident.incident_date ? format(new Date(incident.incidentDate || incident.incident_date), 'dd/MM/yyyy', { locale: fr }) : '-'}</span>
        </Link>
      )
    },
    {
      header: 'Type',
      render: (incident) => {
        const type = incident.incident_type || incident.incidentType;
        return (
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${
              incident.severity === 'CRITICAL' ? 'text-red-600' :
              incident.severity === 'HIGH' ? 'text-orange-500' :
              incident.severity === 'MEDIUM' ? 'text-yellow-500' :
              'text-slate-400'
            }`} />
            <span>{incidentTypes.find(t => t.value === type)?.label || type}</span>
          </div>
        );
      }
    },
    {
      header: 'Véhicule',
      render: (incident) => {
        const vehicle = incident.vehicles || incident.vehicle || getVehicle(incident.vehicle_id);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{vehicle.registrationNumber || vehicle.registration_number}</span>
          </div>
        ) : <span className="text-slate-400">-</span>;
      }
    },
    {
      header: 'Chauffeur',
      render: (incident) => {
        const driver = incident.drivers || incident.driver || getDriver(incident.driver_id);
        return driver ? (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            <span>{driver.first_name || driver.firstName} {driver.last_name || driver.lastName}</span>
          </div>
        ) : <span className="text-slate-400">-</span>;
      }
    },
    {
      header: 'Coût estimé',
      render: (incident) => (
        <span className="font-semibold">
          {incident.estimatedCost ? `${incident.estimatedCost.toLocaleString('fr-FR')} F` : '-'}
        </span>
      )
    },
    {
      header: 'Gravité',
      render: (incident) => (
        <StatusBadge status={incident.severity} />
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
            <DropdownMenuItem asChild>
              <Link href={`/incidents/${incident.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(incident)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(incident)}
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
        title="Incidents"
        subtitle="Gestion des incidents et sinistres"
        action={() => openModal()}
        actionLabel="Déclarer un incident"
      />

      {/* Filtres */}
      <div className="mb-4 p-4 bg-slate-50 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filtres</span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-slate-500 hover:text-slate-700">
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Type:</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {incidentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Véhicule:</label>
            <Select value={filterVehicle} onValueChange={setFilterVehicle}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les véhicules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les véhicules</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.registrationNumber || v.registration_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Chauffeur:</label>
            <Select value={filterDriver} onValueChange={setFilterDriver}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les chauffeurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les chauffeurs</SelectItem>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.first_name || d.firstName} {d.last_name || d.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Gravité:</label>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {severityOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Statut:</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {hasFilters && (
          <div className="mt-3 text-sm text-slate-500">
            {filteredIncidents.length} incident{filteredIncidents.length > 1 ? 's' : ''} trouvé{filteredIncidents.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredIncidents}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un incident..."
        emptyMessage="Aucun incident enregistré"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingIncident ? 'Modifier l\'incident' : 'Nouvel incident'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Type"
              name="incidentType"
              type="select"
              value={formData.incidentType}
              onChange={handleChange}
              options={incidentTypes}
              required
            />
            <FormField
              label="Gravité"
              name="severity"
              type="select"
              value={formData.severity}
              onChange={handleChange}
              options={severityOptions}
              required
            />
            <FormField
              label="Date"
              name="incidentDate"
              type="date"
              value={formData.incidentDate}
              onChange={handleChange}
              required
            />
            <FormField
              label="Statut"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
            />
            <FormField
              label="Véhicule"
              name="vehicleId"
              type="select"
              value={formData.vehicleId}
              onChange={handleChange}
              options={vehicleOptions}
              required
            />
            <FormField
              label="Chauffeur"
              name="driverId"
              type="select"
              value={formData.driverId}
              onChange={handleChange}
              options={driverOptions}
            />
            <FormField
              label="Coût estimé (FCFA)"
              name="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={handleChange}
            />
            <FormField
              label="Coût réel (FCFA)"
              name="actualCost"
              type="number"
              value={formData.actualCost}
              onChange={handleChange}
            />
          </div>
          <FormField
            label="Lieu"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Adresse ou lieu de l'incident"
          />
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
          />
          <FormField
            label="Notes d'enquête"
            name="investigationNotes"
            type="textarea"
            value={formData.investigationNotes}
            onChange={handleChange}
            rows={2}
          />
        </div>
      </FormModal>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet incident ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les données de l'incident seront définitivement supprimées.
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
