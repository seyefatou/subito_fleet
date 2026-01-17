// @ts-nocheck
"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Car,
  Users,
  CreditCard,
  AlertTriangle,
  Landmark,
  Shield,
  TrendingUp,
  Wallet,
  Loader2
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
import { useAuth } from '@/providers/AuthProvider';
import vehiclesService from '@/api/services/vehicles.service';
import driversService from '@/api/services/drivers.service';
import banksService from '@/api/services/banks.service';
import paymentsService from '@/api/services/payments.service';
import incidentsService from '@/api/services/incidents.service';
import guaranteesService from '@/api/services/guarantees.service';

export default function Dashboard() {
  const { user } = useAuth();

  // Récupérer les données avec React Query
  const { data: vehiclesData, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  const { data: driversData, isLoading: loadingDrivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.list(),
  });

  const { data: banksData, isLoading: loadingBanks } = useQuery({
    queryKey: ['banks'],
    queryFn: () => banksService.list(),
  });

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsService.list({ take: 100 }),
  });

  const { data: incidentsData, isLoading: loadingIncidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentsService.list(),
  });

  const { data: guaranteesData, isLoading: loadingGuarantees } = useQuery({
    queryKey: ['guarantees'],
    queryFn: () => guaranteesService.list(),
  });

  // Extraire les données des réponses API
  const vehicles = vehiclesData?.data || [];
  const drivers = driversData?.data || [];
  const banks = banksData?.data || [];
  const payments = paymentsData?.data || [];
  const incidents = incidentsData?.data || [];
  const guarantees = guaranteesData?.data || [];

  const isLoading = loadingVehicles || loadingDrivers || loadingBanks || loadingPayments || loadingIncidents || loadingGuarantees;

  // Calculate stats - utilise les noms de champs du backend (camelCase)
  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
  const activeDrivers = drivers.filter(d => d.status === 'ACTIVE').length;
  const totalCredit = vehicles.reduce((sum, v) => sum + (v.creditAmount || 0), 0);
  const totalRemaining = vehicles.reduce((sum, v) => sum + (v.creditRemaining || 0), 0);
  const openIncidents = incidents.filter(i => i.status === 'REPORTED' || i.status === 'INVESTIGATING').length;

  const todayPayments = payments.filter(p => {
    const today = new Date().toISOString().split('T')[0];
    return p.paymentDate?.split('T')[0] === today;
  });
  const todayCollected = todayPayments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

  const repaymentRate = payments.length > 0
    ? Math.round((payments.filter(p => p.status === 'PAID').length / payments.length) * 100)
    : 0;

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">
          Bienvenue {user?.firstName} ! Vue d'ensemble du programme de financement
        </p>
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
          value={guarantees.filter(g => g.status === 'ACTIVE').length}
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
