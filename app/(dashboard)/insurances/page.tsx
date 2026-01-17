// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Car, Calendar, Edit2, MoreVertical, Trash2, Loader2, AlertCircle, Eye, Filter, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
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
import { insurancesService } from '@/api/services/insurances.service';
import { insurersService } from '@/api/services/insurers.service';
import { vehiclesService } from '@/api/services/vehicles.service';
import { useAlert } from '@/providers/AlertProvider';

const insuranceTypes = [
  { value: 'COMPREHENSIVE', label: 'Tous risques' },
  { value: 'THIRD_PARTY', label: 'Tiers' },
  { value: 'ALL_RISK', label: 'Tous risques etendu' },
  { value: 'DRIVER_INCAPACITY', label: 'Incapacite conducteur' }
];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expirée' },
  { value: 'CANCELLED', label: 'Annulée' }
];

export default function Insurances() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});

  // Filtres
  const [filterType, setFilterType] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterInsurer, setFilterInsurer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Récupérer les assurances
  const { data: insurancesData, isLoading } = useQuery({
    queryKey: ['insurances'],
    queryFn: () => insurancesService.list(),
  });

  // Récupérer les véhicules
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  // Récupérer les assureurs
  const { data: insurersData } = useQuery({
    queryKey: ['insurers'],
    queryFn: () => insurersService.list(),
  });

  // Mutation pour créer une assurance
  const createMutation = useMutation({
    mutationFn: (data) => insurancesService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      toast.success(response.message || 'Assurance créée avec succès');
      closeModal();
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      const message = error?.response?.data?.message || error?.message || 'Erreur de création';
      if (Array.isArray(message)) {
        message.forEach(m => toast.error(m));
      } else {
        toast.error(message);
      }
    },
  });

  // Mutation pour modifier une assurance
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => insurancesService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      toast.success(response.message || 'Assurance mise à jour avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de mise à jour');
    },
  });

  // Mutation pour supprimer une assurance
  const deleteMutation = useMutation({
    mutationFn: (id) => insurancesService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      toast.success(response.message || 'Assurance supprimée avec succès');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  const insurances = insurancesData?.data || [];
  const vehicles = vehiclesData?.data || [];
  const insurers = insurersData?.data || [];

  const getVehicle = (id) => vehicles.find(v => v.id === id);
  const getInsurer = (id) => insurers.find(i => i.id === id);

  // Appliquer les filtres
  const filteredInsurances = insurances.filter((insurance) => {
    const type = insurance.insurance_type || insurance.insuranceType;
    const vehicleId = insurance.vehicle_id || insurance.vehicleId;
    const insurerId = insurance.insurer_id || insurance.insurerId;

    if (filterType && filterType !== 'all' && type !== filterType) return false;
    if (filterVehicle && filterVehicle !== 'all' && vehicleId !== filterVehicle) return false;
    if (filterInsurer && filterInsurer !== 'all' && insurerId !== filterInsurer) return false;
    if (filterStatus && filterStatus !== 'all' && insurance.status !== filterStatus) return false;

    return true;
  });

  const clearFilters = () => {
    setFilterType('');
    setFilterVehicle('');
    setFilterInsurer('');
    setFilterStatus('');
  };

  const hasFilters = (filterType && filterType !== 'all') ||
                     (filterVehicle && filterVehicle !== 'all') ||
                     (filterInsurer && filterInsurer !== 'all') ||
                     (filterStatus && filterStatus !== 'all');

  const openModal = (insurance = null) => {
    setEditingInsurance(insurance);
    if (insurance) {
      setFormData({
        vehicleId: insurance.vehicle_id || insurance.vehicleId,
        insurerId: insurance.insurer_id || insurance.insurerId,
        policyNumber: insurance.policy_number || insurance.policyNumber,
        insuranceType: insurance.insurance_type || insurance.insuranceType || insurance.type,
        premiumAmount: insurance.premium_amount || insurance.premiumAmount,
        coverageAmount: insurance.coverage_amount || insurance.coverageAmount,
        startDate: (insurance.start_date || insurance.startDate) ? (insurance.start_date || insurance.startDate).split('T')[0] : '',
        expiryDate: (insurance.expiry_date || insurance.expiryDate) ? (insurance.expiry_date || insurance.expiryDate).split('T')[0] : '',
        status: insurance.status,
      });
    } else {
      setFormData({ status: 'ACTIVE', insuranceType: 'COMPREHENSIVE' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingInsurance(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    if (!formData.vehicleId || formData.vehicleId === '_none') {
      toast.error('Veuillez selectionner un vehicule');
      return;
    }
    if (!formData.insurerId || formData.insurerId === '_none') {
      toast.error('Veuillez selectionner un assureur');
      return;
    }
    if (!formData.insuranceType) {
      toast.error('Veuillez selectionner un type d\'assurance');
      return;
    }
    if (!formData.startDate) {
      toast.error('Veuillez entrer une date de debut');
      return;
    }
    if (!formData.expiryDate) {
      toast.error('Veuillez entrer une date d\'expiration');
      return;
    }

    const data = {
      vehicleId: formData.vehicleId,
      insurerId: formData.insurerId,
      policyNumber: formData.policyNumber || undefined,
      insuranceType: formData.insuranceType,
      premiumAmount: formData.premiumAmount ? Number(formData.premiumAmount) : undefined,
      coverageAmount: formData.coverageAmount ? Number(formData.coverageAmount) : undefined,
      startDate: formData.startDate,
      expiryDate: formData.expiryDate,
      status: formData.status || 'ACTIVE',
    };

    console.log('Sending insurance data:', data);

    if (editingInsurance) {
      updateMutation.mutate({ id: editingInsurance.id, data });
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
    { value: '_none', label: 'Selectionner un vehicule' },
    ...vehicles.map(v => ({ value: v.id, label: v.registrationNumber || v.registration_number }))
  ];

  const insurerOptions = [
    { value: '_none', label: 'Selectionner un assureur' },
    ...insurers.map(i => ({ value: i.id, label: i.name }))
  ];

  const getExpirationStatus = (endDate) => {
    if (!endDate) return null;
    const daysUntilExpiry = differenceInDays(new Date(endDate), new Date());
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'warning';
    return 'ok';
  };

  const columns = [
    {
      header: 'Véhicule',
      render: (insurance) => {
        const vehicle = insurance.vehicles || insurance.vehicle || getVehicle(insurance.vehicle_id);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <Link href={`/insurances/${insurance.id}`} className="text-blue-600 hover:underline font-medium">{vehicle.registrationNumber}</Link>
          </div>
        ) : <span className="text-slate-400">-</span>;
      }
    },
    {
      header: 'Assureur',
      render: (insurance) => {
        const insurer = insurance.insurers || insurance.insurer || getInsurer(insurance.insurer_id);
        return insurer ? (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>{insurer.name}</span>
          </div>
        ) : <span className="text-slate-400">-</span>;
      }
    },
    {
      header: 'Type',
      render: (insurance) => {
        const type = insurance.insurance_type || insurance.insuranceType || insurance.type;
        return (
          <span className="text-sm">
            {insuranceTypes.find(t => t.value === type)?.label || type}
          </span>
        );
      }
    },
    {
      header: 'N° Police',
      render: (insurance) => (
        <span className="font-mono text-sm">{insurance.policy_number || insurance.policyNumber || '-'}</span>
      )
    },
    {
      header: 'Expiration',
      render: (insurance) => {
        const expiryDate = insurance.expiry_date || insurance.expiryDate || insurance.endDate;
        const status = getExpirationStatus(expiryDate);
        return (
          <div className="flex items-center gap-2">
            {status === 'expired' && <AlertCircle className="w-4 h-4 text-red-500" />}
            {status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
            <span className={`text-sm ${
              status === 'expired' ? 'text-red-500 font-medium' :
              status === 'warning' ? 'text-yellow-600' : ''
            }`}>
              {expiryDate ? format(new Date(expiryDate), 'dd/MM/yyyy', { locale: fr }) : '-'}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Prime',
      render: (insurance) => {
        const amount = insurance.premium_amount || insurance.premiumAmount;
        return (
          <span className="font-semibold">
            {amount ? `${amount.toLocaleString('fr-FR')} F` : '-'}
          </span>
        );
      }
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
            <DropdownMenuItem asChild>
              <Link href={`/insurances/${insurance.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(insurance)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(insurance)}
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
        title="Assurances"
        subtitle="Gestion des polices d'assurance"
        action={() => openModal()}
        actionLabel="Ajouter une assurance"
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
                {insuranceTypes.map((type) => (
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
            <label className="text-sm text-slate-600">Assureur:</label>
            <Select value={filterInsurer} onValueChange={setFilterInsurer}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les assureurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les assureurs</SelectItem>
                {insurers.map((i) => (
                  <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
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
            {filteredInsurances.length} assurance{filteredInsurances.length > 1 ? 's' : ''} trouvée{filteredInsurances.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredInsurances}
        isLoading={isLoading}
        searchPlaceholder="Rechercher une assurance..."
        emptyMessage="Aucune assurance enregistrée"
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingInsurance ? 'Modifier l\'assurance' : 'Nouvelle assurance'}
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
              label="Assureur"
              name="insurerId"
              type="select"
              value={formData.insurerId}
              onChange={handleChange}
              options={insurerOptions}
              required
            />
            <FormField
              label="Type"
              name="insuranceType"
              type="select"
              value={formData.insuranceType}
              onChange={handleChange}
              options={insuranceTypes}
              required
            />
            <FormField
              label="N° Police"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleChange}
              required
            />
            <FormField
              label="Prime annuelle (FCFA)"
              name="premiumAmount"
              type="number"
              value={formData.premiumAmount}
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
              label="Date de début"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <FormField
              label="Date d'expiration"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
            <FormField
              label="Montant couverture (FCFA)"
              name="coverageAmount"
              type="number"
              value={formData.coverageAmount}
              onChange={handleChange}
            />
          </div>
        </div>
      </FormModal>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette assurance ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les données de l'assurance seront définitivement supprimées.
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
