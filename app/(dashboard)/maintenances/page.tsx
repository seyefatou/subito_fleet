// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Car, Calendar, Edit2, MoreVertical, Trash2, Loader2, Eye, Filter, X } from 'lucide-react';
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
import { maintenancesService } from '@/api/services/maintenances.service';
import { vehiclesService } from '@/api/services/vehicles.service';
import { useAlert } from '@/providers/AlertProvider';

const maintenanceTypes = [
  { value: 'REVISION', label: 'Révision' },
  { value: 'VIDANGE', label: 'Vidange' },
  { value: 'PNEUS', label: 'Pneus' },
  { value: 'FREINS', label: 'Freins' },
  { value: 'BATTERIE', label: 'Batterie' },
  { value: 'CLIMATISATION', label: 'Climatisation' },
  { value: 'CARROSSERIE', label: 'Carrosserie' },
  { value: 'VISITE_TECHNIQUE', label: 'Visite technique' },
  { value: 'REPARATION', label: 'Réparation' },
  { value: 'AUTRE', label: 'Autre' }
];

const statusOptions = [
  { value: 'SCHEDULED', label: 'Planifié' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'CANCELLED', label: 'Annulé' }
];

export default function Maintenances() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});

  // Filtres
  const [filterType, setFilterType] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Récupérer les maintenances
  const { data: maintenancesData, isLoading } = useQuery({
    queryKey: ['maintenances'],
    queryFn: () => maintenancesService.list(),
  });

  // Récupérer les véhicules
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  // Mutation pour créer une maintenance
  const createMutation = useMutation({
    mutationFn: (data) => maintenancesService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      toast.success(response.message || 'Entretien créé avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de création');
    },
  });

  // Mutation pour modifier une maintenance
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => maintenancesService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      toast.success(response.message || 'Entretien mis à jour avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de mise à jour');
    },
  });

  // Mutation pour supprimer une maintenance
  const deleteMutation = useMutation({
    mutationFn: (id) => maintenancesService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      toast.success(response.message || 'Entretien supprimé avec succès');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  const maintenances = maintenancesData?.data || [];
  const vehicles = vehiclesData?.data || [];

  const getVehicle = (id) => vehicles.find(v => v.id === id);

  // Appliquer les filtres
  const filteredMaintenances = maintenances.filter((maintenance) => {
    const type = maintenance.maintenance_type || maintenance.maintenanceType;
    const vehicleId = maintenance.vehicle_id || maintenance.vehicleId;

    if (filterType && filterType !== 'all' && type !== filterType) return false;
    if (filterVehicle && filterVehicle !== 'all' && vehicleId !== filterVehicle) return false;
    if (filterStatus && filterStatus !== 'all' && maintenance.status !== filterStatus) return false;

    return true;
  });

  const clearFilters = () => {
    setFilterType('');
    setFilterVehicle('');
    setFilterStatus('');
  };

  const hasFilters = (filterType && filterType !== 'all') ||
                     (filterVehicle && filterVehicle !== 'all') ||
                     (filterStatus && filterStatus !== 'all');

  const openModal = (maintenance = null) => {
    setEditingMaintenance(maintenance);
    if (maintenance) {
      setFormData({
        vehicleId: maintenance.vehicle_id || maintenance.vehicleId,
        maintenanceDate: (maintenance.maintenance_date || maintenance.maintenanceDate) ? (maintenance.maintenance_date || maintenance.maintenanceDate).split('T')[0] : '',
        maintenanceType: maintenance.maintenance_type || maintenance.maintenanceType,
        description: maintenance.description,
        cost: maintenance.cost,
        status: maintenance.status,
        mileage: maintenance.mileage,
        nextMaintenanceDate: (maintenance.next_maintenance_date || maintenance.nextMaintenanceDate) ? (maintenance.next_maintenance_date || maintenance.nextMaintenanceDate).split('T')[0] : '',
        nextMaintenanceMileage: maintenance.next_maintenance_mileage || maintenance.nextMaintenanceMileage,
        provider: maintenance.provider,
        providerPhone: maintenance.provider_phone || maintenance.providerPhone,
        notes: maintenance.notes,
      });
    } else {
      setFormData({ status: 'SCHEDULED', maintenanceType: 'REVISION', cost: 0 });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMaintenance(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    if (!formData.vehicleId || formData.vehicleId === '_none') {
      toast.error('Veuillez sélectionner un véhicule');
      return;
    }
    if (!formData.maintenanceType) {
      toast.error('Veuillez sélectionner un type de maintenance');
      return;
    }
    if (!formData.maintenanceDate) {
      toast.error('Veuillez entrer une date de maintenance');
      return;
    }

    const data = {
      vehicleId: formData.vehicleId,
      maintenanceDate: formData.maintenanceDate,
      maintenanceType: formData.maintenanceType,
      description: formData.description || undefined,
      cost: formData.cost ? Number(formData.cost) : 0,
      status: formData.status,
      mileage: formData.mileage ? Number(formData.mileage) : undefined,
      nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
      nextMaintenanceMileage: formData.nextMaintenanceMileage ? Number(formData.nextMaintenanceMileage) : undefined,
      provider: formData.provider || undefined,
      providerPhone: formData.providerPhone || undefined,
      notes: formData.notes || undefined,
    };

    if (editingMaintenance) {
      updateMutation.mutate({ id: editingMaintenance.id, data });
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

  const columns = [
    {
      header: 'Véhicule',
      render: (maintenance) => {
        const vehicle = maintenance.vehicles || maintenance.vehicle || getVehicle(maintenance.vehicle_id);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{vehicle.registrationNumber || vehicle.registration_number}</span>
          </div>
        ) : <span className="text-slate-400">-</span>;
      }
    },
    {
      header: 'Type',
      render: (maintenance) => {
        const type = maintenance.maintenance_type || maintenance.maintenanceType;
        return (
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-400" />
            <span>{maintenanceTypes.find(t => t.value === type)?.label || type}</span>
          </div>
        );
      }
    },
    {
      header: 'Date',
      render: (maintenance) => (
        <Link href={`/maintenances/${maintenance.id}`} className="flex items-center gap-2 hover:opacity-80">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-blue-600 hover:underline">
            {maintenance.maintenanceDate || maintenance.maintenance_date ? format(new Date(maintenance.maintenanceDate || maintenance.maintenance_date), 'dd/MM/yyyy', { locale: fr }) : '-'}
          </span>
        </Link>
      )
    },
    {
      header: 'Kilométrage',
      render: (maintenance) => (
        <span>{maintenance.mileage ? `${maintenance.mileage.toLocaleString('fr-FR')} km` : '-'}</span>
      )
    },
    {
      header: 'Coût',
      render: (maintenance) => (
        <span className="font-semibold">
          {maintenance.cost != null ? `${maintenance.cost.toLocaleString('fr-FR')} F` : '-'}
        </span>
      )
    },
    {
      header: 'Prestataire',
      render: (maintenance) => (
        <span className="text-sm text-slate-600">
          {maintenance.provider || '-'}
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
            <DropdownMenuItem asChild>
              <Link href={`/maintenances/${maintenance.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(maintenance)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(maintenance)}
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
        title="Entretien"
        subtitle="Gestion de l'entretien des véhicules"
        action={() => openModal()}
        actionLabel="Ajouter un entretien"
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
                {maintenanceTypes.map((type) => (
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
            <label className="text-sm text-slate-600">Statut:</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
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
            {filteredMaintenances.length} entretien{filteredMaintenances.length > 1 ? 's' : ''} trouvé{filteredMaintenances.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredMaintenances}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un entretien..."
        emptyMessage="Aucun entretien enregistré"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingMaintenance ? 'Modifier l\'entretien' : 'Nouvel entretien'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              label="Type"
              name="maintenanceType"
              type="select"
              value={formData.maintenanceType}
              onChange={handleChange}
              options={maintenanceTypes}
              required
            />
            <FormField
              label="Date"
              name="maintenanceDate"
              type="date"
              value={formData.maintenanceDate}
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
              label="Kilométrage"
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="Ex: 50000"
            />
            <FormField
              label="Coût (FCFA)"
              name="cost"
              type="number"
              value={formData.cost}
              onChange={handleChange}
              required
            />
            <FormField
              label="Prestataire"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              placeholder="Nom du garage/mécanicien"
            />
            <FormField
              label="Prochain entretien"
              name="nextMaintenanceDate"
              type="date"
              value={formData.nextMaintenanceDate}
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
            required
          />
          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
          />
        </div>
      </FormModal>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet entretien ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les données de l'entretien seront définitivement supprimées.
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
