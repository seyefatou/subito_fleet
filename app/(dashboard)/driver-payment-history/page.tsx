// @ts-nocheck
"use client";

import React from 'react';
import { CreditCard, Calendar, Check, X, Clock } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';

// Données mock
const mockPayments: any[] = [];

export default function DriverPaymentHistory() {
  const payments = mockPayments;

  const columns = [
    {
      header: 'Date',
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{payment.payment_date || '-'}</span>
        </div>
      )
    },
    {
      header: 'Montant attendu',
      render: (payment) => (
        <span>{payment.expected_amount?.toLocaleString('fr-FR')} F</span>
      )
    },
    {
      header: 'Montant payé',
      render: (payment) => (
        <span className="font-semibold">
          {payment.paid_amount?.toLocaleString('fr-FR')} F
        </span>
      )
    },
    {
      header: 'Statut',
      render: (payment) => <StatusBadge status={payment.status} />
    }
  ];

  return (
    <div>
      <PageHeader
        title="Historique des Paiements"
        subtitle="Historique des paiements du chauffeur"
      />

      <DataTable
        columns={columns}
        data={payments}
        isLoading={false}
        searchPlaceholder="Rechercher..."
        emptyMessage="Aucun historique de paiement"
      />
    </div>
  );
}
