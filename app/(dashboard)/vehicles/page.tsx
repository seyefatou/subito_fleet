// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Car, Edit2, Trash2, MoreVertical, Landmark, User, Building2,
  MapPin, CreditCard, Eye, Calendar
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

const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'seized', label: 'Saisi' },
  { value: 'sold', label: 'Vendu' },
  { value: 'written_off', label: 'Passé en perte' }
];

const creditHolderTypes = [
  { value: 'driver', label: 'Chauffeur individuel' },
  { value: 'gie', label: 'GIE' }
];

// Données mock - à remplacer par tes appels API
const mockVehicles: any[] = [];
const mockBanks: any[] = [];
const mockFunds: any[] = [];
const mockDrivers: any[] = [];
const mockGies: any[] = [];

export default function Vehicles() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Données mock
  const vehicles = mockVehicles;
  const banks = mockBanks;
  const funds = mockFunds;
  const drivers = mockDrivers;
  const gies = mockGies;

  const getBank = (id) => banks.find(b => b.id === id);
  const getFund = (id) => funds.find(f => f.id === id);
  const getDriver = (id) => drivers.find(d => d.id === id);
  const getGIE = (id) => gies.find(g => g.id === id);

  const openModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle || { status: 'active', credit_holder_type: 'driver' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVehicle(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    // TODO: Implémenter l'appel API
    const data = {
      ...formData,
      year: Number(formData.year) || null,
      credit_amount: Number(formData.credit_amount) || 0,
      credit_remaining: Number(formData.credit_remaining) || Number(formData.credit_amount) || 0,
      daily_payment_amount: Number(formData.daily_payment_amount) || 0,
      credit_duration_months: Number(formData.credit_duration_months) || null,
      interest_rate: Number(formData.interest_rate) || null
    };

    console.log('Submit:', data);
    toast.success(editingVehicle ? 'Véhicule mis à jour' : 'Véhicule créé');
    closeModal();
  };

  const handleDelete = async (id) => {
    // TODO: Implémenter l'appel API
    console.log('Delete:', id);
    toast.success('Véhicule supprimé');
    setDeleteConfirm(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: 'Véhicule',
      render: (vehicle) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{vehicle.registration_number}</p>
            <p className="text-xs text-slate-500">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Banque',
      render: (vehicle) => {
        const bank = getBank(vehicle.bank_id);
        return bank ? (
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-slate-700">{bank.name}</span>
          </div>
        ) : <span className="text-slate-400">-</span>;
      }
    },
    {
      header: 'Porteur crédit',
      render: (vehicle) => {
        if (vehicle.credit_holder_type === 'gie') {
          const gie = getGIE(vehicle.credit_holder_id);
          return (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-slate-700">{gie?.name || '-'}</span>
            </div>
          );
        } else {
          const driver = getDriver(vehicle.credit_holder_id);
          return (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-700">
                {driver ? `${driver.first_name} ${driver.last_name}` : '-'}
              </span>
            </div>
          );
        }
      }
    },
    {
      header: 'Crédit',
      render: (vehicle) => {
        const remaining = vehicle.credit_remaining || 0;
        const total = vehicle.credit_amount || 0;
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
            {vehicle.daily_payment_amount?.toLocaleString('fr-FR')} F
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

  const bankOptions = banks.map(b => ({ value: b.id, label: b.name }));
  const fundOptions = funds.map(f => ({ value: f.id, label: f.name }));
  const driverOptions = drivers.map(d => ({ value: d.id, label: `${d.first_name} ${d.last_name}` }));
  const gieOptions = gies.map(g => ({ value: g.id, label: g.name }));

  return (
    <div>
      <PageHeader
        title="Véhicules"
        subtitle="Gestion du parc de véhicules financés"
        action={() => openModal()}
        actionLabel="Ajouter un véhicule"
      />

      <DataTable
        columns={columns}
        data={vehicles}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un véhicule..."
        emptyMessage="Aucun véhicule enregistré"
      />

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
                name="registration_number"
                value={formData.registration_number}
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
                placeholder="Toyota"
              />
              <FormField
                label="Modèle"
                name="model"
                value={formData.model}
                onChange={handleChange}
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
                name="bank_id"
                type="select"
                value={formData.bank_id}
                onChange={handleChange}
                options={bankOptions}
                required
              />
              <FormField
                label="Fonds de garantie"
                name="guarantee_fund_id"
                type="select"
                value={formData.guarantee_fund_id}
                onChange={handleChange}
                options={fundOptions}
              />
              <FormField
                label="Montant du crédit (FCFA)"
                name="credit_amount"
                type="number"
                value={formData.credit_amount}
                onChange={handleChange}
                required
              />
              <FormField
                label="Montant restant (FCFA)"
                name="credit_remaining"
                type="number"
                value={formData.credit_remaining}
                onChange={handleChange}
              />
              <FormField
                label="Paiement journalier (FCFA)"
                name="daily_payment_amount"
                type="number"
                value={formData.daily_payment_amount}
                onChange={handleChange}
                required
              />
              <FormField
                label="Durée (mois)"
                name="credit_duration_months"
                type="number"
                value={formData.credit_duration_months}
                onChange={handleChange}
              />
              <FormField
                label="Date début crédit"
                name="credit_start_date"
                type="date"
                value={formData.credit_start_date}
                onChange={handleChange}
              />
              <FormField
                label="Taux d'intérêt (%)"
                name="interest_rate"
                type="number"
                value={formData.interest_rate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Porteur du crédit</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Type de porteur"
                name="credit_holder_type"
                type="select"
                value={formData.credit_holder_type}
                onChange={handleChange}
                options={creditHolderTypes}
              />
              <FormField
                label={formData.credit_holder_type === 'gie' ? 'GIE' : 'Chauffeur'}
                name="credit_holder_id"
                type="select"
                value={formData.credit_holder_id}
                onChange={handleChange}
                options={formData.credit_holder_type === 'gie' ? gieOptions : driverOptions}
              />
              <FormField
                label="Chauffeur actuel"
                name="current_driver_id"
                type="select"
                value={formData.current_driver_id}
                onChange={handleChange}
                options={driverOptions}
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
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
