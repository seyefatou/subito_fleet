"use client";

import React from 'react';
import {
  Car,
  Users,
  CreditCard,
  AlertTriangle,
  Landmark,
  Shield,
  TrendingUp,
  Wallet
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import PaymentChart from '@/components/dashboard/PaymentChart';
import RecentPaymentsTable from '@/components/dashboard/RecentPaymentsTable';
import AlertsWidget from '@/components/dashboard/AlertsWidget';
import BankDistributionChart from '@/components/dashboard/BankDistributionChart';
import MaintenanceAlertsWidget from '@/components/dashboard/MaintenanceAlertsWidget';
import FinancialSummary from '@/components/dashboard/FinancialSummary';
import DriverPerformanceWidget from '@/components/dashboard/DriverPerformanceWidget';
import VehicleStatsWidget from '@/components/dashboard/VehicleStatsWidget';

// Données mock - à remplacer par tes appels API
const mockVehicles = [];
const mockDrivers = [];
const mockBanks = [];
const mockPayments = [];
const mockIncidents = [];
const mockGuarantees = [];

export default function Dashboard() {
  // Utilise des données mock pour l'instant
  const vehicles = mockVehicles;
  const drivers = mockDrivers;
  const banks = mockBanks;
  const payments = mockPayments;
  const incidents = mockIncidents;
  const guarantees = mockGuarantees;

  // Calculate stats
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const totalCredit = vehicles.reduce((sum, v) => sum + (v.credit_amount || 0), 0);
  const totalRemaining = vehicles.reduce((sum, v) => sum + (v.credit_remaining || 0), 0);
  const openIncidents = incidents.filter(i => i.status === 'open').length;

  const todayPayments = payments.filter(p => {
    const today = new Date().toISOString().split('T')[0];
    return p.payment_date === today;
  });
  const todayCollected = todayPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.paid_amount || 0), 0);

  const repaymentRate = payments.length > 0
    ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Vue d'ensemble du programme de financement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Véhicules actifs"
          value={activeVehicles}
          icon={Car}
          color="amber"
          trend="up"
          trendValue="+5%"
          subtitle={`${vehicles.length} au total`}
        />
        <StatCard
          title="Chauffeurs actifs"
          value={activeDrivers}
          icon={Users}
          color="blue"
          trend="up"
          trendValue="+3%"
          subtitle={`${drivers.length} enregistrés`}
        />
        <StatCard
          title="Encours crédit"
          value={`${(totalRemaining / 1000000).toFixed(1)}M`}
          icon={Wallet}
          color="purple"
          subtitle="FCFA restant"
        />
        <StatCard
          title="Taux remboursement"
          value={`${repaymentRate}%`}
          icon={TrendingUp}
          color="green"
          trend={repaymentRate >= 80 ? 'up' : 'down'}
          trendValue={repaymentRate >= 80 ? 'Bon' : 'À améliorer'}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Collecté aujourd'hui"
          value={`${(todayCollected / 1000).toFixed(0)}K`}
          icon={CreditCard}
          color="green"
          subtitle="FCFA"
        />
        <StatCard
          title="Banques partenaires"
          value={banks.length}
          icon={Landmark}
          color="blue"
        />
        <StatCard
          title="Garanties actives"
          value={guarantees.filter(g => g.status === 'active').length}
          icon={Shield}
          color="purple"
        />
        <StatCard
          title="Incidents ouverts"
          value={openIncidents}
          icon={AlertTriangle}
          color="red"
          trend={openIncidents > 5 ? 'down' : 'up'}
          trendValue={openIncidents > 5 ? 'Critique' : 'Sous contrôle'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PaymentChart />
        </div>
        <BankDistributionChart banks={banks} vehicles={vehicles} />
      </div>

      {/* New Widgets Row - Financial & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialSummary />
        <MaintenanceAlertsWidget />
      </div>

      {/* Driver & Vehicle Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DriverPerformanceWidget />
        <VehicleStatsWidget />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentPaymentsTable
            payments={payments}
            vehicles={vehicles}
            drivers={drivers}
            banks={banks}
          />
        </div>
        <AlertsWidget incidents={incidents} />
      </div>
    </div>
  );
}
