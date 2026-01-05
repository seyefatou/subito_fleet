"use client";

import React from 'react';
import { FileCheck, Check, X, Clock } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from "@/components/ui/button";

// Données mock
const mockPaymentProofs = [];

export default function PaymentApprovals() {
  const paymentProofs = mockPaymentProofs;

  const columns = [
    {
      header: 'Date',
      render: (proof) => proof.created_at || '-'
    },
    {
      header: 'Chauffeur',
      render: (proof) => proof.driver_name || '-'
    },
    {
      header: 'Véhicule',
      render: (proof) => proof.vehicle_number || '-'
    },
    {
      header: 'Montant',
      render: (proof) => (
        <span className="font-semibold">
          {proof.amount?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Statut',
      render: (proof) => <StatusBadge status={proof.status} />
    },
    {
      header: 'Actions',
      render: (proof) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-green-600">
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="text-red-600">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Validation Paiements"
        subtitle="Validation des preuves de paiement soumises"
      />

      <DataTable
        columns={columns}
        data={paymentProofs}
        isLoading={false}
        searchPlaceholder="Rechercher..."
        emptyMessage="Aucun paiement en attente de validation"
      />
    </div>
  );
}
