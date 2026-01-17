// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Phone, Mail, Car, Building2, Edit2, Trash2, MoreVertical,
  Receipt, Eye, Loader2, Filter, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import FormField from '@/components/common/FormField';
import FileUpload from '@/components/common/FileUpload';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { driversService } from '@/api/services/drivers.service';
import { vehiclesService } from '@/api/services/vehicles.service';
import { giesService } from '@/api/services/gies.service';
import { useAlert } from '@/providers/AlertProvider';

const statusOptions = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' },
  { value: 'SUSPENDED', label: 'Suspendu' }
];

export default function Drivers() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});
  const [filterGie, setFilterGie] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Récupérer les conducteurs
  const { data: driversData, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.list(),
  });

  // Récupérer les véhicules
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  // Récupérer les GIE
  const { data: giesData } = useQuery({
    queryKey: ['gies'],
    queryFn: () => giesService.list(),
  });

  // Mutation pour créer un conducteur
  const createMutation = useMutation({
    mutationFn: (data) => driversService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      alert.showSuccess(response.message || 'Conducteur créé avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de création');
    },
  });

  // Mutation pour modifier un conducteur
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => driversService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      alert.showSuccess(response.message || 'Conducteur mis à jour avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de mise à jour');
    },
  });

  // Mutation pour supprimer un conducteur
  const deleteMutation = useMutation({
    mutationFn: (id) => driversService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      alert.showSuccess(response.message || 'Conducteur supprimé avec succès');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  // Mutation pour uploader un document
  const uploadMutation = useMutation({
    mutationFn: ({ driverId, documentType, file }: { driverId: string; documentType: string; file: File }) =>
      driversService.uploadDocument(driverId, documentType, file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      alert.showSuccess(response.message || 'Document uploadé avec succès');
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur d\'upload');
    },
  });

  // Mutation pour supprimer un document
  const deleteDocMutation = useMutation({
    mutationFn: ({ driverId, documentType }: { driverId: string; documentType: string }) =>
      driversService.deleteDocument(driverId, documentType),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      alert.showSuccess(response.message || 'Document supprimé avec succès');
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  const drivers = driversData?.data || [];
  const vehicles = vehiclesData?.data || [];
  const gies = giesData?.data || [];

  const getGIE = (id) => gies.find(g => g.id === id);
  const getVehicle = (id) => vehicles.find(v => v.id === id);

  // Filtrage des chauffeurs
  const filteredDrivers = drivers.filter((driver) => {
    // Filtre par GIE
    if (filterGie !== 'all') {
      if (filterGie === 'none' && driver.gie_id) return false;
      if (filterGie !== 'none' && driver.gie_id !== filterGie) return false;
    }
    // Filtre par véhicule
    if (filterVehicle !== 'all') {
      if (filterVehicle === 'none' && driver.current_vehicle_id) return false;
      if (filterVehicle === 'assigned' && !driver.current_vehicle_id) return false;
      if (filterVehicle !== 'none' && filterVehicle !== 'assigned' && driver.current_vehicle_id !== filterVehicle) return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDrivers = filteredDrivers.slice(startIndex, startIndex + itemsPerPage);

  const hasActiveFilters = filterGie !== 'all' || filterVehicle !== 'all';

  const clearFilters = () => {
    setFilterGie('all');
    setFilterVehicle('all');
    setCurrentPage(1);
  };

  // Reset page when filters change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const openModal = (driver = null) => {
    setEditingDriver(driver);
    if (driver) {
      setFormData({
        firstName: driver.first_name,
        lastName: driver.last_name,
        idNumber: driver.id_number,
        phone: driver.phone,
        email: driver.email,
        address: driver.address,
        dateOfBirth: driver.date_of_birth ? driver.date_of_birth.split('T')[0] : '',
        licenseNumber: driver.license_number,
        licenseExpiry: driver.license_expiry ? driver.license_expiry.split('T')[0] : '',
        gieId: driver.gie_id,
        status: driver.status,
        photoUrl: driver.photo_url,
        idCardFrontUrl: driver.id_card_front_url,
        idCardBackUrl: driver.id_card_back_url,
        licenseFrontUrl: driver.license_front_url,
        licenseBackUrl: driver.license_back_url,
      });
    } else {
      setFormData({ status: 'ACTIVE' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDriver(null);
    setFormData({});
  };

  const handleDocumentUpload = async (documentType: string, file: File) => {
    if (!editingDriver) {
      alert.showWarning('Veuillez d\'abord créer le chauffeur avant d\'ajouter des documents');
      return;
    }
    uploadMutation.mutate({ driverId: editingDriver.id, documentType, file });
  };

  const handleDocumentDelete = async (documentType: string) => {
    if (!editingDriver) return;
    deleteDocMutation.mutate({ driverId: editingDriver.id, documentType });
  };

  const handleSubmit = async () => {
    const gieId = formData.gieId && formData.gieId !== 'NONE' ? formData.gieId : undefined;

    const data = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      idNumber: formData.idNumber,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      licenseNumber: formData.licenseNumber || undefined,
      licenseExpiry: formData.licenseExpiry || undefined,
      gieId: gieId,
      status: formData.status,
    };

    if (editingDriver) {
      updateMutation.mutate({ id: editingDriver.id, data });
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
      header: 'Prénom',
      render: (driver) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={driver.photo_url} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-medium text-xs">
              {driver.first_name?.charAt(0)}{driver.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-slate-900">{driver.first_name}</span>
        </div>
      )
    },
    {
      header: 'Nom',
      render: (driver) => (
        <span className="font-medium text-slate-900">{driver.last_name}</span>
      )
    },
    {
      header: 'Contact',
      render: (driver) => (
        <div className="space-y-1">
          <p className="text-sm text-slate-700 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {driver.phone}
          </p>
          {driver.email && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {driver.email}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'GIE',
      render: (driver) => {
        const gie = driver.gies || getGIE(driver.gie_id);
        return gie ? (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-slate-700">{gie.name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Indépendant</span>
        );
      }
    },
    {
      header: 'Véhicule',
      render: (driver) => {
        const vehicle = driver.vehicles_drivers_current_vehicle_idTovehicles || getVehicle(driver.current_vehicle_id);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-900">{vehicle.registrationNumber}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Non assigné</span>
        );
      }
    },
    {
      header: '',
      className: 'w-12',
      render: (driver) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/drivers/${driver.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/driver-payment-history?driver=${driver.id}`}>
                <Receipt className="w-4 h-4 mr-2" />
                Historique paiements
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(driver)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(driver)}
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

  const gieOptions = [{ value: 'NONE', label: 'Indépendant' }, ...gies.map(g => ({ value: g.id, label: g.name }))];

  return (
    <div>
      <PageHeader
        title="Chauffeurs"
        subtitle="Gestion des chauffeurs du programme"
        action={() => openModal()}
        actionLabel="Ajouter un chauffeur"
      />

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtres:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">GIE:</label>
            <Select value={filterGie} onValueChange={(v) => handleFilterChange(setFilterGie, v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les GIE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les GIE</SelectItem>
                <SelectItem value="none">Indépendants</SelectItem>
                {gies.map((gie) => (
                  <SelectItem key={gie.id} value={gie.id}>{gie.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Véhicule:</label>
            <Select value={filterVehicle} onValueChange={(v) => handleFilterChange(setFilterVehicle, v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les véhicules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="assigned">Avec véhicule</SelectItem>
                <SelectItem value="none">Sans véhicule</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</SelectItem>
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
            {filteredDrivers.length} chauffeur{filteredDrivers.length > 1 ? 's' : ''} trouvé{filteredDrivers.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedDrivers}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un chauffeur..."
        emptyMessage="Aucun chauffeur enregistré"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {currentPage} sur {totalPages} ({filteredDrivers.length} chauffeurs)
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
        title={editingDriver ? 'Modifier le chauffeur' : 'Nouveau chauffeur'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Identité</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Prénom"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Nom"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <FormField
                label="N° CNI"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
              />
              <FormField
                label="Date de naissance"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Contact</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Téléphone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <FormField
                label="Adresse"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-2"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Permis de conduire</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="N° Permis"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
              <FormField
                label="Date d'expiration"
                name="licenseExpiry"
                type="date"
                value={formData.licenseExpiry}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Affectation</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="GIE"
                name="gieId"
                type="select"
                value={formData.gieId}
                onChange={handleChange}
                options={gieOptions}
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

          {editingDriver && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Documents</h4>
              <p className="text-xs text-slate-500 mb-4">
                Formats acceptés: JPG, PNG, GIF, WEBP (max 5MB)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FileUpload
                  label="Photo du chauffeur"
                  value={formData.photoUrl}
                  onChange={(file) => file && handleDocumentUpload('photo', file)}
                  onDelete={() => handleDocumentDelete('photo')}
                  isUploading={uploadMutation.isPending}
                />
                <FileUpload
                  label="CNI (Recto)"
                  value={formData.idCardFrontUrl}
                  onChange={(file) => file && handleDocumentUpload('idCardFront', file)}
                  onDelete={() => handleDocumentDelete('idCardFront')}
                  isUploading={uploadMutation.isPending}
                />
                <FileUpload
                  label="CNI (Verso)"
                  value={formData.idCardBackUrl}
                  onChange={(file) => file && handleDocumentUpload('idCardBack', file)}
                  onDelete={() => handleDocumentDelete('idCardBack')}
                  isUploading={uploadMutation.isPending}
                />
                <FileUpload
                  label="Permis (Recto)"
                  value={formData.licenseFrontUrl}
                  onChange={(file) => file && handleDocumentUpload('licenseFront', file)}
                  onDelete={() => handleDocumentDelete('licenseFront')}
                  isUploading={uploadMutation.isPending}
                />
                <FileUpload
                  label="Permis (Verso)"
                  value={formData.licenseBackUrl}
                  onChange={(file) => file && handleDocumentUpload('licenseBack', file)}
                  onDelete={() => handleDocumentDelete('licenseBack')}
                  isUploading={uploadMutation.isPending}
                />
              </div>
              {!editingDriver && (
                <p className="text-xs text-amber-600 mt-2">
                  Vous pourrez ajouter des documents après la création du chauffeur.
                </p>
              )}
            </div>
          )}
        </div>
      </FormModal>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce chauffeur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'historique sera conservé.
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
