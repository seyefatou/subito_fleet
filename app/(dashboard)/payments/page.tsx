// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { CreditCard, Calendar, Car, User, MoreVertical, Edit2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Données mock
const mockPayments: any[] = [];
const mockVehicles: any[] = [];
const mockDrivers: any[] = [];
const mockBanks: any[] = [];

export default function Payments() {
  const [isLoading, setIsLoading] = useState(false);

  const payments = mockPayments;
  const vehicles = mockVehicles;
  const drivers = mockDrivers;
  const banks = mockBanks;

  const getVehicle = (id) => vehicles.find(v => v.id === id);
  const getDriver = (id) => drivers.find(d => d.id === id);
  const getBank = (id) => banks.find(b => b.id === id);

  const columns = [
    {
      header: 'Date',
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm">
            {payment.payment_date ? format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: fr }) : '-'}
          </span>
        </div>
      )
    },
    {
      header: 'Véhicule',
      render: (payment) => {
        const vehicle = getVehicle(payment.vehicle_id);
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
      render: (payment) => {
        const driver = getDriver(payment.driver_id);
        return driver ? (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            <span>{driver.first_name} {driver.last_name}</span>
          </div>
        ) : '-';
      }
    },
    {
      header: 'Montant attendu',
      render: (payment) => (
        <span className="text-slate-600">
          {payment.expected_amount?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Montant payé',
      render: (payment) => (
        <span className="font-semibold text-slate-900">
          {payment.paid_amount?.toLocaleString('fr-FR')} F
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
            <DropdownMenuItem>
              <Check className="w-4 h-4 mr-2" />
              Marquer payé
            </DropdownMenuItem>
            <DropdownMenuItem>
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
        title="Paiements"
        subtitle="Suivi des paiements journaliers"
      />

      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un paiement..."
        emptyMessage="Aucun paiement enregistré"
      />
    </div>
  );
}
