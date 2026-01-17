// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard, Calendar, Car, User, MoreVertical, Edit2, Check, Eye,
  Trash2, Send, RefreshCw, Plus, Filter, X, Loader2, AlertTriangle,
  CheckCircle, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import FormModal from '@/components/common/FormModal';
import FormField from '@/components/common/FormField';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import paymentsService from '@/api/services/payments.service';
import vehiclesService from '@/api/services/vehicles.service';
import driversService from '@/api/services/drivers.service';
import banksService from '@/api/services/banks.service';
import { useAlert } from '@/providers/AlertProvider';

const paymentMethods = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'WAVE', label: 'Wave' },
  { value: 'ORANGE_MONEY', label: 'Orange Money' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  { value: 'CHECK', label: 'Chèque' },
];

const statusOptions = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'PAID', label: 'Payé' },
  { value: 'PARTIAL', label: 'Partiel' },
  { value: 'OVERDUE', label: 'En retard' },
];

export default function Payments() {
  const queryClient = useQueryClient();
  const alert = useAlert();

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [markPaidModalOpen, setMarkPaidModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({});
  const [markPaidData, setMarkPaidData] = useState({ paymentMethod: 'CASH', paidAmount: 0 });

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  const { data: paymentsResponse, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsService.list(),
  });

  const { data: todayStatsResponse } = useQuery({
    queryKey: ['payments-today-stats'],
    queryFn: () => paymentsService.getTodayStats(),
  });

  const { data: overdueResponse } = useQuery({
    queryKey: ['payments-overdue'],
    queryFn: () => paymentsService.getOverdue(),
  });

  const { data: vehiclesResponse } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  const { data: driversResponse } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.list(),
  });

  const { data: banksResponse } = useQuery({
    queryKey: ['banks'],
    queryFn: () => banksService.list(),
  });

  const payments = paymentsResponse?.data || [];
  const todayStats = todayStatsResponse?.data || {};
  const overduePayments = overdueResponse?.data || [];
  const vehicles = vehiclesResponse?.data || [];
  const drivers = driversResponse?.data || [];
  const banks = banksResponse?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => paymentsService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments-today-stats'] });
      toast.success(response.message || 'Paiement créé avec succès');
      closeCreateModal();
    },
    onError: (error: any) => alert.showError(error, 'Erreur de création'),
  });

  const generateDailyMutation = useMutation({
    mutationFn: () => paymentsService.generateDaily(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments-today-stats'] });
      toast.success(response.message || `${response.data?.generated || 0} paiements générés`);
    },
    onError: (error: any) => alert.showError(error, 'Erreur de génération'),
  });

  const markAsPaidMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => paymentsService.markAsPaid(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments-today-stats'] });
      queryClient.invalidateQueries({ queryKey: ['payments-overdue'] });
      toast.success(response.message || 'Paiement marqué comme payé');
      closeMarkPaidModal();
    },
    onError: (error: any) => alert.showError(error, 'Erreur de paiement'),
  });

  const routeToBankMutation = useMutation({
    mutationFn: (id: string) => paymentsService.routeToBank(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success(response.message || 'Paiement routé vers la banque');
    },
    onError: (error: any) => alert.showError(error, 'Erreur de routage'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentsService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments-today-stats'] });
      toast.success(response.message || 'Paiement supprimé');
      setDeleteConfirm(null);
    },
    onError: (error: any) => alert.showError(error, 'Erreur de suppression'),
  });

  // Helpers
  const getVehicle = (id) => vehicles.find(v => v.id === id);
  const getDriver = (id) => drivers.find(d => d.id === id);

  // Modal handlers
  const openCreateModal = () => {
    setFormData({
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'PENDING',
    });
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setFormData({});
  };

  const openMarkPaidModal = (payment) => {
    setSelectedPayment(payment);
    setMarkPaidData({
      paymentMethod: 'CASH',
      paidAmount: payment.dueAmount || payment.due_amount || 0,
      transactionId: '',
      notes: '',
    });
    setMarkPaidModalOpen(true);
  };

  const closeMarkPaidModal = () => {
    setMarkPaidModalOpen(false);
    setSelectedPayment(null);
  };

  const handleCreateSubmit = () => {
    createMutation.mutate({
      paymentDate: formData.paymentDate,
      vehicleId: formData.vehicleId === '_none' ? undefined : formData.vehicleId,
      driverId: !formData.driverId || formData.driverId === '_none' ? undefined : formData.driverId,
      bankId: !formData.bankId || formData.bankId === '_none' ? undefined : formData.bankId,
      dueAmount: Number(formData.dueAmount) || undefined,
      paidAmount: Number(formData.paidAmount) || 0,
      status: formData.status,
      notes: formData.notes || undefined,
    });
  };

  const handleMarkAsPaid = () => {
    if (selectedPayment) {
      markAsPaidMutation.mutate({
        id: selectedPayment.id,
        data: {
          paidAmount: Number(markPaidData.paidAmount),
          paymentMethod: markPaidData.paymentMethod,
          transactionId: markPaidData.transactionId || undefined,
          notes: markPaidData.notes || undefined,
        },
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-remplir quand on sélectionne un véhicule
    if (name === 'vehicleId' && value && value !== '_none') {
      const selectedVehicle = vehicles.find(v => v.id === value);
      if (selectedVehicle) {
        const driverId = selectedVehicle.currentDriverId || selectedVehicle.current_driver_id || '_none';
        const bankId = selectedVehicle.bankId || selectedVehicle.bank_id || '_none';
        const dueAmount = selectedVehicle.dailyPaymentAmount || selectedVehicle.daily_payment_amount || '';

        setFormData({
          ...formData,
          vehicleId: value,
          driverId: driverId,
          bankId: bankId,
          dueAmount: dueAmount,
        });
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  // Filter data
  const filteredPayments = payments.filter(payment => {
    if (filterStatus !== 'all' && payment.status !== filterStatus) return false;
    if (filterVehicle !== 'all' && (payment.vehicleId || payment.vehicle_id) !== filterVehicle) return false;
    return true;
  });

  const vehicleOptions = [
    { value: '_none', label: 'Sélectionner un véhicule' },
    ...vehicles.map(v => ({ value: v.id, label: v.registrationNumber || v.registration_number }))
  ];

  const driverOptions = [
    { value: '_none', label: 'Aucun chauffeur' },
    ...drivers.map(d => ({ value: d.id, label: `${d.first_name || d.firstName} ${d.last_name || d.lastName}` }))
  ];

  const bankOptions = [
    { value: '_none', label: 'Aucune banque' },
    ...banks.map(b => ({ value: b.id, label: b.name }))
  ];

  const columns = [
    {
      header: 'Date',
      render: (payment) => (
        <Link href={`/payments/${payment.id}`} className="flex items-center gap-2 hover:opacity-80">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-blue-600 hover:underline">
            {payment.paymentDate || payment.payment_date
              ? format(new Date(payment.paymentDate || payment.payment_date), 'dd/MM/yyyy', { locale: fr })
              : '-'}
          </span>
        </Link>
      )
    },
    {
      header: 'Véhicule',
      render: (payment) => {
        const vehicle = payment.vehicle || payment.vehicles || getVehicle(payment.vehicleId || payment.vehicle_id);
        return vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{vehicle.registrationNumber || vehicle.registration_number}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Chauffeur',
      render: (payment) => {
        const driver = payment.driver || payment.drivers || getDriver(payment.driverId || payment.driver_id);
        return driver ? (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            <span>{driver.first_name || driver.firstName} {driver.last_name || driver.lastName}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Montant dû',
      render: (payment) => (
        <span className="text-slate-600">
          {(payment.dueAmount || payment.due_amount)?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Montant payé',
      render: (payment) => (
        <span className="font-semibold text-slate-900">
          {(payment.paidAmount || payment.paid_amount)?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Statut',
      render: (payment) => <StatusBadge status={payment.status} />
    },
    {
      header: '',
      className: 'w-12',
      render: (payment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/payments/${payment.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            {payment.status !== 'PAID' && (
              <DropdownMenuItem onClick={() => openMarkPaidModal(payment)}>
                <Check className="w-4 h-4 mr-2" />
                Marquer payé
              </DropdownMenuItem>
            )}
            {payment.status === 'PAID' && !(payment.routedToBank || payment.routed_to_bank) && (
              <DropdownMenuItem onClick={() => routeToBankMutation.mutate(payment.id)}>
                <Send className="w-4 h-4 mr-2" />
                Router vers banque
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteConfirm(payment)}
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
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        subtitle="Suivi des paiements journaliers"
        action={openCreateModal}
        actionLabel="Nouveau paiement"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Paiements du jour</p>
                <p className="text-2xl font-bold text-blue-700">
                  {todayStats.today?.total || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total perçu</p>
                <p className="text-2xl font-bold text-green-700">
                  {(todayStats.today?.totalPaid || 0).toLocaleString('fr-FR')} F
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Attendu</p>
                <p className="text-2xl font-bold text-amber-700">
                  {(todayStats.today?.totalDue || 0).toLocaleString('fr-FR')} F
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">En retard</p>
                <p className="text-2xl font-bold text-red-700">
                  {overduePayments.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions et Filtres */}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="outline"
          onClick={() => generateDailyMutation.mutate()}
          disabled={generateDailyMutation.isPending}
        >
          {generateDailyMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Générer paiements du jour
        </Button>

        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>

        {showFilters && (
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterVehicle} onValueChange={setFilterVehicle}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Véhicule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les véhicules</SelectItem>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.registrationNumber || v.registration_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filterStatus !== 'all' || filterVehicle !== 'all') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setFilterStatus('all'); setFilterVehicle('all'); }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPayments}
        isLoading={paymentsLoading}
        searchPlaceholder="Rechercher un paiement..."
        emptyMessage="Aucun paiement enregistré"
      />

      {/* Create Payment Modal */}
      <FormModal
        open={createModalOpen}
        onClose={closeCreateModal}
        title="Nouveau paiement"
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Date de paiement"
              name="paymentDate"
              type="date"
              value={formData.paymentDate}
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
          </div>

          <FormField
            label="Véhicule"
            name="vehicleId"
            type="select"
            value={formData.vehicleId}
            onChange={handleChange}
            options={vehicleOptions}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Chauffeur"
              name="driverId"
              type="select"
              value={formData.driverId}
              onChange={handleChange}
              options={driverOptions}
            />
            <FormField
              label="Banque"
              name="bankId"
              type="select"
              value={formData.bankId}
              onChange={handleChange}
              options={bankOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Montant dû"
              name="dueAmount"
              type="number"
              value={formData.dueAmount}
              onChange={handleChange}
              placeholder="0"
            />
            <FormField
              label="Montant payé"
              name="paidAmount"
              type="number"
              value={formData.paidAmount}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

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

      {/* Mark as Paid Modal */}
      <Dialog open={markPaidModalOpen} onOpenChange={setMarkPaidModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme payé</DialogTitle>
            <DialogDescription>
              Enregistrer le paiement pour ce versement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Montant payé</Label>
              <Input
                type="number"
                value={markPaidData.paidAmount}
                onChange={(e) => setMarkPaidData({ ...markPaidData, paidAmount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Méthode de paiement</Label>
              <Select
                value={markPaidData.paymentMethod}
                onValueChange={(v) => setMarkPaidData({ ...markPaidData, paymentMethod: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ID Transaction (optionnel)</Label>
              <Input
                value={markPaidData.transactionId}
                onChange={(e) => setMarkPaidData({ ...markPaidData, transactionId: e.target.value })}
                placeholder="REF123456"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Input
                value={markPaidData.notes}
                onChange={(e) => setMarkPaidData({ ...markPaidData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeMarkPaidModal}>Annuler</Button>
            <Button onClick={handleMarkAsPaid} disabled={markAsPaidMutation.isPending}>
              {markAsPaidMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce paiement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le paiement sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteConfirm?.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
