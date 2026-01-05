"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User, Phone, Mail, Car, Building2, Edit2, Trash2, MoreVertical,
  CreditCard, AlertTriangle, Calendar, Receipt, Star, FileText, Send, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import FormModal from '@/components/common/FormModal';
import FormField from '@/components/common/FormField';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { toast } from "sonner";

const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'suspended', label: 'Suspendu' }
];

// Données mock - à remplacer par tes appels API
const mockDrivers = [];
const mockVehicles = [];
const mockGies = [];
const mockPayments = [];

export default function Drivers() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Données mock
  const drivers = mockDrivers;
  const vehicles = mockVehicles;
  const gies = mockGies;
  const payments = mockPayments;

  const getGIE = (id) => gies.find(g => g.id === id);
  const getVehicle = (id) => vehicles.find(v => v.id === id);

  const openModal = (driver = null) => {
    setEditingDriver(driver);
    setFormData(driver || { status: 'active', is_credit_holder: false });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDriver(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    // TODO: Implémenter l'appel API
    console.log('Submit:', formData);
    toast.success(editingDriver ? 'Chauffeur mis à jour' : 'Chauffeur créé');
    closeModal();
  };

  const handleDelete = async (id) => {
    // TODO: Implémenter l'appel API
    console.log('Delete:', id);
    toast.success('Chauffeur supprimé');
    setDeleteConfirm(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'Chauffeur',
      render: (driver) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={driver.photo_url} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-medium">
              {driver.first_name?.charAt(0)}{driver.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-900">{driver.first_name} {driver.last_name}</p>
            <p className="text-xs text-slate-500">CNI: {driver.id_number}</p>
          </div>
        </div>
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
        const gie = getGIE(driver.gie_id);
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
      header: 'Véhicule actuel',
      render: (driver) => {
        const vehicle = getVehicle(driver.current_vehicle_id);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-900">{vehicle.registration_number}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Non assigné</span>
        );
      }
    },
    {
      header: 'Paiements',
      render: (driver) => {
        const driverPayments = payments.filter(p => p.driver_id === driver.id);
        const totalPaid = driverPayments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + (p.paid_amount || 0), 0);
        const overdueCount = driverPayments.filter(p => p.status === 'overdue').length;

        return (
          <div>
            <p className="text-sm font-medium text-slate-900">
              {(totalPaid / 1000).toFixed(0)}K FCFA
            </p>
            {overdueCount > 0 && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {overdueCount} retard(s)
              </p>
            )}
          </div>
        );
      }
    },
    {
      header: 'Permis',
      render: (driver) => {
        const isExpired = driver.license_expiry && new Date(driver.license_expiry) < new Date();
        return (
          <div>
            <p className="text-xs text-slate-500">{driver.license_number || '-'}</p>
            {driver.license_expiry && (
              <p className={`text-xs flex items-center gap-1 ${isExpired ? 'text-red-500' : 'text-slate-400'}`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(driver.license_expiry), 'dd/MM/yyyy')}
              </p>
            )}
          </div>
        );
      }
    },
    {
      header: 'Statut',
      render: (driver) => <StatusBadge status={driver.status} />
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
            <DropdownMenuItem onClick={() => setSelectedDriver(driver)}>
              <Eye className="w-4 h-4 mr-2" />
              Voir détails
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

  const gieOptions = gies.map(g => ({ value: g.id, label: g.name }));
  const vehicleOptions = vehicles.map(v => ({ value: v.id, label: `${v.registration_number} - ${v.brand} ${v.model}` }));

  return (
    <div>
      <PageHeader
        title="Chauffeurs"
        subtitle="Gestion des chauffeurs du programme"
        action={() => openModal()}
        actionLabel="Ajouter un chauffeur"
      />

      <DataTable
        columns={columns}
        data={drivers}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un chauffeur..."
        emptyMessage="Aucun chauffeur enregistré"
      />

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
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <FormField
                label="Nom"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
              <FormField
                label="N° CNI"
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
                required
              />
              <FormField
                label="Date de naissance"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
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
                label="Compte Mobile Money"
                name="mobile_money_account"
                value={formData.mobile_money_account}
                onChange={handleChange}
              />
              <FormField
                label="Adresse"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Permis de conduire</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="N° Permis"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
              />
              <FormField
                label="Date d'expiration"
                name="license_expiry"
                type="date"
                value={formData.license_expiry}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Affectation</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="GIE"
                name="gie_id"
                type="select"
                value={formData.gie_id}
                onChange={handleChange}
                options={gieOptions}
              />
              <FormField
                label="Véhicule actuel"
                name="current_vehicle_id"
                type="select"
                value={formData.current_vehicle_id}
                onChange={handleChange}
                options={vehicleOptions}
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
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
