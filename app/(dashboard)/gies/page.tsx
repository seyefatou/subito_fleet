// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Car, Edit2, Trash2, MoreVertical, Loader2, Phone, Mail, Filter, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import giesService from '@/api/services/gies.service';
import driversService from '@/api/services/drivers.service';
import vehiclesService from '@/api/services/vehicles.service';
import { useAlert } from '@/providers/AlertProvider';

const statusOptions = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' }
];

export default function GIEs() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGIE, setEditingGIE] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});

  // Filtres
  const [filterRepresentative, setFilterRepresentative] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Récupérer les GIE
  const { data: giesData, isLoading } = useQuery({
    queryKey: ['gies'],
    queryFn: () => giesService.list(),
  });

  // Récupérer les conducteurs pour les stats
  const { data: driversData } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.list(),
  });

  // Récupérer les véhicules pour les stats
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  // Mutation pour créer un GIE
  const createMutation = useMutation({
    mutationFn: (data) => giesService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['gies'] });
      alert.showSuccess(response.message || 'GIE créé avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de création');
    },
  });

  // Mutation pour modifier un GIE
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => giesService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['gies'] });
      alert.showSuccess(response.message || 'GIE mis à jour avec succès');
      closeModal();
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de mise à jour');
    },
  });

  // Mutation pour supprimer un GIE
  const deleteMutation = useMutation({
    mutationFn: (id) => giesService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['gies'] });
      alert.showSuccess(response.message || 'GIE supprimé avec succès');
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      alert.showError(error, 'Erreur de suppression');
    },
  });

  const gies = giesData?.data || [];
  const drivers = driversData?.data || [];
  const vehicles = vehiclesData?.data || [];

  // Liste unique des représentants
  const representatives = [...new Set(gies.map(g => g.representative_name).filter(Boolean))];

  // Filtrage des GIE
  const filteredGies = gies.filter((gie) => {
    // Filtre par représentant
    if (filterRepresentative !== 'all') {
      if (filterRepresentative === 'none' && gie.representative_name) return false;
      if (filterRepresentative !== 'none' && gie.representative_name !== filterRepresentative) return false;
    }
    // Filtre par véhicule (GIE ayant ce véhicule)
    if (filterVehicle !== 'all') {
      const gieVehicles = vehicles.filter(v => v.gieId === gie.id || v.gie_id === gie.id);
      if (filterVehicle === 'with' && gieVehicles.length === 0) return false;
      if (filterVehicle === 'none' && gieVehicles.length > 0) return false;
      if (filterVehicle !== 'with' && filterVehicle !== 'none') {
        if (!gieVehicles.some(v => v.id === filterVehicle)) return false;
      }
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredGies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGies = filteredGies.slice(startIndex, startIndex + itemsPerPage);

  const hasActiveFilters = filterRepresentative !== 'all' || filterVehicle !== 'all';

  const clearFilters = () => {
    setFilterRepresentative('all');
    setFilterVehicle('all');
    setCurrentPage(1);
  };

  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const openModal = (gie = null) => {
    setEditingGIE(gie);
    if (gie) {
      setFormData({
        name: gie.name,
        representativeName: gie.representative_name,
        contactPhone: gie.contact_phone,
        contactEmail: gie.contact_email,
        address: gie.address,
        status: gie.status,
      });
    } else {
      setFormData({ status: 'ACTIVE' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingGIE(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    const data = {
      name: formData.name,
      representativeName: formData.representativeName || undefined,
      contactPhone: formData.contactPhone || undefined,
      contactEmail: formData.contactEmail || undefined,
      address: formData.address || undefined,
      status: formData.status,
    };

    if (editingGIE) {
      updateMutation.mutate({ id: editingGIE.id, data });
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
      header: 'GIE',
      render: (gie) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <Link href={`/gies/${gie.id}`} className="text-blue-600 hover:underline font-semibold">{gie.name}</Link>
          </div>
        </div>
      )
    },
    {
      header: 'Représentant',
      render: (gie) => gie.representative_name ? (
        <span className="text-sm text-slate-700">{gie.representative_name}</span>
      ) : <span className="text-slate-400">-</span>
    },
    {
      header: 'Contact',
      render: (gie) => (
        <div className="space-y-1">
          {gie.contact_phone && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {gie.contact_phone}
            </p>
          )}
          {gie.contact_email && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {gie.contact_email}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Membres',
      render: (gie) => {
        const count = drivers.filter(d => d.gie_id === gie.id).length;
        return (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span>{count} chauffeurs</span>
          </div>
        );
      }
    },
    {
      header: 'Véhicules',
      render: (gie) => {
        const count = vehicles.filter(v => v.gieId === gie.id || v.gie_id === gie.id).length;
        return (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span>{count} véhicules</span>
          </div>
        );
      }
    },
    {
      header: 'Statut',
      render: (gie) => <StatusBadge status={gie.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (gie) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/gies/${gie.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal(gie)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(gie)}
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
        title="GIE"
        subtitle="Gestion des Groupements d'Intérêt Économique"
        action={() => openModal()}
        actionLabel="Ajouter un GIE"
      />

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtres:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Représentant:</label>
            <Select value={filterRepresentative} onValueChange={(v) => handleFilterChange(setFilterRepresentative, v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les représentants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="none">Sans représentant</SelectItem>
                {representatives.map((rep) => (
                  <SelectItem key={rep} value={rep}>{rep}</SelectItem>
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
                <SelectItem value="with">Avec véhicules</SelectItem>
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
            {filteredGies.length} GIE{filteredGies.length > 1 ? 's' : ''} trouvé{filteredGies.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedGies}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un GIE..."
        emptyMessage="Aucun GIE enregistré"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {currentPage} sur {totalPages} ({filteredGies.length} GIE{filteredGies.length > 1 ? 's' : ''})
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
        title={editingGIE ? 'Modifier le GIE' : 'Nouveau GIE'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Nom du GIE"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormField
            label="Représentant"
            name="representativeName"
            value={formData.representativeName}
            onChange={handleChange}
          />
          <FormField
            label="Téléphone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
          />
          <FormField
            label="Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
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
          label="Adresse"
          name="address"
          type="textarea"
          value={formData.address}
          onChange={handleChange}
          rows={2}
        />
      </FormModal>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce GIE ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les chauffeurs et véhicules associés devront être réaffectés.
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
