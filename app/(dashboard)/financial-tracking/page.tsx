// @ts-nocheck
"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Receipt, TrendingUp, TrendingDown, Wallet, Calendar, Car, User,
  Loader2, AlertTriangle, CheckCircle, Clock, CreditCard, Landmark
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import StatusBadge from '@/components/common/StatusBadge';
import paymentsService from '@/api/services/payments.service';

export default function FinancialTracking() {
  // Fetch all payment data
  const { data: paymentsResponse, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments-all'],
    queryFn: () => paymentsService.list({ take: 1000 }),
  });

  const { data: todayStatsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['payments-today-stats'],
    queryFn: () => paymentsService.getTodayStats(),
  });

  const { data: overdueResponse, isLoading: overdueLoading } = useQuery({
    queryKey: ['payments-overdue'],
    queryFn: () => paymentsService.getOverdue(),
  });

  const payments = paymentsResponse?.data || [];
  const todayStats = todayStatsResponse?.data || {};
  const overduePayments = overdueResponse?.data || [];

  // Calculate statistics
  const totalPaid = payments.reduce((sum, p) => sum + (p.paidAmount || p.paid_amount || 0), 0);
  const totalDue = payments.reduce((sum, p) => sum + (p.dueAmount || p.due_amount || 0), 0);
  const totalPending = payments
    .filter(p => p.status === 'PENDING' || p.status === 'PARTIAL')
    .reduce((sum, p) => sum + ((p.dueAmount || p.due_amount || 0) - (p.paidAmount || p.paid_amount || 0)), 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + ((p.dueAmount || p.due_amount || 0) - (p.paidAmount || p.paid_amount || 0)), 0);

  const recoveryRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  // Group by status
  const byStatus = {
    PAID: payments.filter(p => p.status === 'PAID').length,
    PENDING: payments.filter(p => p.status === 'PENDING').length,
    PARTIAL: payments.filter(p => p.status === 'PARTIAL').length,
    OVERDUE: overduePayments.length,
  };

  // Recent payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paymentDate || b.payment_date).getTime() - new Date(a.paymentDate || a.payment_date).getTime())
    .slice(0, 10);

  const isLoading = paymentsLoading || statsLoading || overdueLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suivi Financier"
        subtitle="Vue d'ensemble de la situation financiere"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Total encaisse</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {totalPaid.toLocaleString('fr-FR')} F
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">En attente</p>
                <p className="text-2xl font-bold text-amber-700">
                  {totalPending.toLocaleString('fr-FR')} F
                </p>
              </div>
              <Wallet className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Impayes</p>
                <p className="text-2xl font-bold text-red-700">
                  {totalOverdue.toLocaleString('fr-FR')} F
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Taux recouvrement</p>
                <p className="text-2xl font-bold text-blue-700">{recoveryRate}%</p>
              </div>
              <Receipt className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Statistiques du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-slate-900">{todayStats.today?.total || 0}</p>
              <p className="text-sm text-slate-500">Paiements</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {(todayStats.today?.totalPaid || 0).toLocaleString('fr-FR')} F
              </p>
              <p className="text-sm text-slate-500">Encaisse aujourd'hui</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">
                {(todayStats.today?.totalDue || 0).toLocaleString('fr-FR')} F
              </p>
              <p className="text-sm text-slate-500">Attendu aujourd'hui</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Repartition par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Payes
                  </span>
                  <span className="text-sm font-medium">{byStatus.PAID}</span>
                </div>
                <Progress value={payments.length > 0 ? (byStatus.PAID / payments.length) * 100 : 0} className="h-2 bg-slate-100" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    En attente
                  </span>
                  <span className="text-sm font-medium">{byStatus.PENDING}</span>
                </div>
                <Progress value={payments.length > 0 ? (byStatus.PENDING / payments.length) * 100 : 0} className="h-2 bg-slate-100" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    Partiels
                  </span>
                  <span className="text-sm font-medium">{byStatus.PARTIAL}</span>
                </div>
                <Progress value={payments.length > 0 ? (byStatus.PARTIAL / payments.length) * 100 : 0} className="h-2 bg-slate-100" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    En retard
                  </span>
                  <span className="text-sm font-medium">{byStatus.OVERDUE}</span>
                </div>
                <Progress value={payments.length > 0 ? (byStatus.OVERDUE / payments.length) * 100 : 0} className="h-2 bg-slate-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Paiements en retard ({overduePayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overduePayments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-300" />
                <p>Aucun paiement en retard</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {overduePayments.slice(0, 10).map((payment) => {
                  const vehicle = payment.vehicle || payment.vehicles;
                  const driver = payment.driver || payment.drivers;
                  const dueAmount = payment.dueAmount || payment.due_amount || 0;
                  const paidAmount = payment.paidAmount || payment.paid_amount || 0;

                  return (
                    <Link
                      key={payment.id}
                      href={`/payments/${payment.id}`}
                      className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {vehicle?.registrationNumber || vehicle?.registration_number || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {driver ? `${driver.first_name || driver.firstName} ${driver.last_name || driver.lastName}` : 'Sans chauffeur'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {format(new Date(payment.paymentDate || payment.payment_date), 'dd/MM/yyyy', { locale: fr })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            {(dueAmount - paidAmount).toLocaleString('fr-FR')} F
                          </p>
                          <p className="text-xs text-slate-500">reste du</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Derniers paiements</CardTitle>
            <Link href="/payments">
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                Voir tout
              </Badge>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CreditCard className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>Aucun paiement enregistre</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-500 border-b">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Vehicule</th>
                    <th className="pb-3 font-medium">Chauffeur</th>
                    <th className="pb-3 font-medium">Montant du</th>
                    <th className="pb-3 font-medium">Montant paye</th>
                    <th className="pb-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => {
                    const vehicle = payment.vehicle || payment.vehicles;
                    const driver = payment.driver || payment.drivers;

                    return (
                      <tr key={payment.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="py-3">
                          <Link href={`/payments/${payment.id}`} className="text-blue-600 hover:underline">
                            {format(new Date(payment.paymentDate || payment.payment_date), 'dd/MM/yyyy', { locale: fr })}
                          </Link>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-slate-400" />
                            {vehicle?.registrationNumber || vehicle?.registration_number || '-'}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            {driver ? `${driver.first_name || driver.firstName} ${driver.last_name || driver.lastName}` : '-'}
                          </div>
                        </td>
                        <td className="py-3 text-amber-600">
                          {(payment.dueAmount || payment.due_amount || 0).toLocaleString('fr-FR')} F
                        </td>
                        <td className="py-3 font-medium text-green-600">
                          {(payment.paidAmount || payment.paid_amount || 0).toLocaleString('fr-FR')} F
                        </td>
                        <td className="py-3">
                          <StatusBadge status={payment.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
