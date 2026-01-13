// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Car, Edit2, Trash2, MoreVertical, Landmark, User,
  CreditCard, Eye, Loader2, Filter, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import FormModal from '@/components/common/FormModal';
import FormField from '@/components/common/FormField';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { vehiclesService } from '@/api/services/vehicles.service';
import { banksService } from '@/api/services/banks.service';
import { guaranteeFundsService } from '@/api/services/guarantee-funds.service';
import { driversService } from '@/api/services/drivers.service';
import { giesService } from '@/api/services/gies.service';
import { useAlert } from '@/providers/AlertProvider';

const statusOptions = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' },
  { value: 'SEIZED', label: 'Saisi' },
  { value: 'SOLD', label: 'Vendu' },
  { value: 'WRITTEN_OFF', label: 'Radié' }
];

const creditHolderTypes = [
  { value: 'DRIVER', label: 'Chauffeur individuel' },
  { value: 'GIE', label: 'GIE' }
];

export default function Vehicles() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});

  // Filtres
  const [filterBank, setFilterBank] = useState<string>('all');
  const [filterDriver, setFilterDriver] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Récupérer les véhicules
  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  // Récupérer les banques
  const { data: banksData } = useQuery({
    queryKey: ['banks'],
    queryFn: () => banksService.list(),
  });

  // Récupérer les fonds de garantie
  const { data: fundsData } = useQuery({
    queryKey: ['guarantee-funds'],
    queryFn: () => guaranteeFundsService.list(),
  });

  // Récupérer les conducteurs
  const { data: driversData } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.list(),
  });

  // Récupérer les GIE
  const { data: giesData } = useQuery({
    queryKey: ['gies'],
    queryFn: () => giesService.list(),
  });

  // Mutation pour créer un véhicule
  const createMutation = useMutation({
    mutationFn: (data) => vehiclesService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      alert.showSuccess(response.message || 'Véhicule créé avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de création');
    },
  });

  // Mutation pour modifier un véhicule
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vehiclesService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      alert.showSuccess(response.message || 'Véhicule mis à jour avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de mise à jour');
    },
  });

  // Mutation pour supprimer un véhicule
  const deleteMutation = useMutation({
    mutationFn: (id) => vehiclesService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      alert.showSuccess(response.message || 'Véhicule supprimé avec succès');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  const vehicles = vehiclesData?.data || [];
  const banks = banksData?.data || [];
  const funds = fundsData?.data || [];
  const drivers = driversData?.data || [];
  const gies = giesData?.data || [];

  const getBank = (id) => banks.find(b => b.id === id);
  const getFund = (id) => funds.find(f => f.id === id);
  const getDriver = (id) => drivers.find(d => d.id === id);
  const getGIE = (id) => gies.find(g => g.id === id);

  // Filtrage des véhicules
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Filtre par banque
    if (filterBank !== 'all') {
      if (filterBank === 'none' && vehicle.bankId) return false;
      if (filterBank !== 'none' && vehicle.bankId !== filterBank) return false;
    }
    // Filtre par chauffeur
    if (filterDriver !== 'all') {
      const driverId = vehicle.currentDriver?.id || vehicle.currentDriverId;
      if (filterDriver === 'none' && driverId) return false;
      if (filterDriver === 'assigned' && !driverId) return false;
      if (filterDriver !== 'none' && filterDriver !== 'assigned' && driverId !== filterDriver) return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

  const hasActiveFilters = filterBank !== 'all' || filterDriver !== 'all';

  const clearFilters = () => {
    setFilterBank('all');
    setFilterDriver('all');
    setCurrentPage(1);
  };

  // Reset page when filters change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const openModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    if (vehicle) {
      setFormData({
        registrationNumber: vehicle.registrationNumber,
        vin: vehicle.vin,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        bankId: vehicle.bankId,
        guaranteeFundId: vehicle.guaranteeFundId,
        gieId: vehicle.gieId,
        creditAmount: vehicle.creditAmount,
        creditRemaining: vehicle.creditRemaining,
        dailyPaymentAmount: vehicle.dailyPaymentAmount,
        creditDurationMonths: vehicle.creditDurationMonths,
        creditStartDate: vehicle.creditStartDate ? vehicle.creditStartDate.split('T')[0] : '',
        status: vehicle.status,
        creditHolderType: vehicle.creditHolderType || (vehicle.creditHolderDriverId ? 'DRIVER' : 'GIE'),
        creditHolderId: vehicle.creditHolderDriverId || vehicle.creditHolderGieId,
      });
    } else {
      setFormData({ status: 'ACTIVE', creditHolderType: 'DRIVER' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVehicle(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    const bankId = formData.bankId && formData.bankId !== 'NONE' ? formData.bankId : undefined;
    const guaranteeFundId = formData.guaranteeFundId && formData.guaranteeFundId !== 'NONE' ? formData.guaranteeFundId : undefined;
    const gieId = formData.gieId && formData.gieId !== 'NONE' ? formData.gieId : undefined;
    const creditHolderId = formData.creditHolderId && formData.creditHolderId !== 'NONE' ? formData.creditHolderId : undefined;

    const data = {
      registrationNumber: formData.registrationNumber,
      vin: formData.vin || undefined,
      brand: formData.brand,
      model: formData.model,
      year: formData.year ? Number(formData.year) : undefined,
      color: formData.color || undefined,
      bankId: bankId,
      guaranteeFundId: guaranteeFundId,
      gieId: gieId,
      creditAmount: Number(formData.creditAmount) || 0,
      creditRemaining: Number(formData.creditRemaining) || Number(formData.creditAmount) || 0,
      dailyPaymentAmount: Number(formData.dailyPaymentAmount) || 0,
      creditDurationMonths: formData.creditDurationMonths ? Number(formData.creditDurationMonths) : undefined,
      creditStartDate: formData.creditStartDate || undefined,
      status: formData.status,
      creditHolderType: formData.creditHolderType,
      creditHolderDriverId: formData.creditHolderType === 'DRIVER' && creditHolderId ? creditHolderId : undefined,
      creditHolderGieId: formData.creditHolderType === 'GIE' && creditHolderId ? creditHolderId : undefined,
    };

    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data });
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

  const columns = [
    {
      header: 'Véhicule',
      render: (vehicle) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{vehicle.registrationNumber}</p>
            <p className="text-xs text-slate-500">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Banque',
      render: (vehicle) => {
        const bank = vehicle.bank || getBank(vehicle.bankId);
        return bank ? (
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-slate-700">{bank.name}</span>
          </div>
        ) : <span className="text-slate-400">-</span>;
      }
    },
    {
      header: 'Conducteur',
      render: (vehicle) => {
        const driver = vehicle.currentDriver || getDriver(vehicle.currentDriverId);
        return driver ? (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-slate-700">
              {driver.first_name} {driver.last_name}
            </span>
          </div>
        ) : <span className="text-slate-400">Non assigné</span>;
      }
    },
    {
      header: 'Crédit',
      render: (vehicle) => {
        const remaining = vehicle.creditRemaining || 0;
        const total = vehicle.creditAmount || 0;
        const paid = total - remaining;
        const progress = total > 0 ? (paid / total) * 100 : 0;

        return (
          <div className="min-w-32">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Remboursé</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-slate-500 mt-1">
              {(remaining / 1000000).toFixed(2)}M restant
            </p>
          </div>
        );
      }
    },
    {
      header: 'Paiement/jour',
      render: (vehicle) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-slate-900">
            {vehicle.dailyPaymentAmount?.toLocaleString('fr-FR')} F
          </span>
        </div>
      )
    },
    {
      header: 'Statut',
      render: (vehicle) => <StatusBadge status={vehicle.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (vehicle) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/vehicles/${vehicle.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(vehicle)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(vehicle)}
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

  const bankOptions = [{ value: 'NONE', label: 'Sélectionner une banque' }, ...banks.map(b => ({ value: b.id, label: b.name }))];
  const fundOptions = [{ value: 'NONE', label: 'Aucun fonds' }, ...funds.map(f => ({ value: f.id, label: f.name }))];
  const driverOptions = [{ value: 'NONE', label: 'Sélectionner un conducteur' }, ...drivers.map(d => ({ value: d.id, label: `${d.first_name} ${d.last_name}` }))];
  const gieOptions = [{ value: 'NONE', label: 'Aucun GIE' }, ...gies.map(g => ({ value: g.id, label: g.name }))];

  return (
    <div>
      <PageHeader
        title="Véhicules"
        subtitle="Gestion du parc de véhicules financés"
        action={() => openModal()}
        actionLabel="Ajouter un véhicule"
      />

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtres:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Banque:</label>
            <Select value={filterBank} onValueChange={(v) => handleFilterChange(setFilterBank, v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toutes les banques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les banques</SelectItem>
                <SelectItem value="none">Sans banque</SelectItem>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Chauffeur:</label>
            <Select value={filterDriver} onValueChange={(v) => handleFilterChange(setFilterDriver, v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les chauffeurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="assigned">Avec chauffeur</SelectItem>
                <SelectItem value="none">Sans chauffeur</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>{driver.first_name} {driver.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-slate-700">
              <X className="w-4 h-4 mr-1" />
              Réinitialiser
            </Button>
          )}

          <div className="ml-auto text-sm text-slate-500">
            {filteredVehicles.length} véhicule{filteredVehicles.length > 1 ? 's' : ''} trouvé{filteredVehicles.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedVehicles}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un véhicule..."
        emptyMessage="Aucun véhicule enregistré"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {currentPage} sur {totalPages} ({filteredVehicles.length} véhicules)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editingVehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Informations véhicule</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Immatriculation"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
                placeholder="DK 1234 AB"
              />
              <FormField
                label="N° Châssis (VIN)"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
              />
              <FormField
                label="Marque"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                placeholder="Toyota"
              />
              <FormField
                label="Modèle"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="Corolla"
              />
              <FormField
                label="Année"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                placeholder="2023"
              />
              <FormField
                label="Couleur"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Financement</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Banque financeuse"
                name="bankId"
                type="select"
                value={formData.bankId}
                onChange={handleChange}
                options={bankOptions}
                required
              />
              <FormField
                label="Fonds de garantie"
                name="guaranteeFundId"
                type="select"
                value={formData.guaranteeFundId}
                onChange={handleChange}
                options={fundOptions}
              />
              <FormField
                label="Montant du crédit (FCFA)"
                name="creditAmount"
                type="number"
                value={formData.creditAmount}
                onChange={handleChange}
                required
              />
              <FormField
                label="Montant restant (FCFA)"
                name="creditRemaining"
                type="number"
                value={formData.creditRemaining}
                onChange={handleChange}
              />
              <FormField
                label="Paiement journalier (FCFA)"
                name="dailyPaymentAmount"
                type="number"
                value={formData.dailyPaymentAmount}
                onChange={handleChange}
                required
              />
              <FormField
                label="Durée (mois)"
                name="creditDurationMonths"
                type="number"
                value={formData.creditDurationMonths}
                onChange={handleChange}
              />
              <FormField
                label="Date début crédit"
                name="creditStartDate"
                type="date"
                value={formData.creditStartDate}
                onChange={handleChange}
              />
              <FormField
                label="GIE"
                name="gieId"
                type="select"
                value={formData.gieId}
                onChange={handleChange}
                options={gieOptions}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Affectation</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Type de porteur"
                name="creditHolderType"
                type="select"
                value={formData.creditHolderType}
                onChange={handleChange}
                options={creditHolderTypes}
              />
              <FormField
                label={formData.creditHolderType === 'GIE' ? 'GIE porteur' : 'Chauffeur porteur'}
                name="creditHolderId"
                type="select"
                value={formData.creditHolderId}
                onChange={handleChange}
                options={formData.creditHolderType === 'GIE' ? gieOptions : driverOptions}
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
          </div>
        </div>
      </FormModal>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'historique des paiements sera conservé.
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
