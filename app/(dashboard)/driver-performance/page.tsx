// @ts-nocheck
"use client";

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  TrendingUp, Users, Star, Award, User, Car, CreditCard,
  Loader2, CheckCircle, AlertTriangle, Medal, Trophy, Target
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import driversService from '@/api/services/drivers.service';
import paymentsService from '@/api/services/payments.service';

export default function DriverPerformance() {
  // Fetch drivers and payments
  const { data: driversResponse, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.list(),
  });

  const { data: paymentsResponse, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments-all'],
    queryFn: () => paymentsService.list({ take: 1000 }),
  });

  const drivers = driversResponse?.data || [];
  const payments = paymentsResponse?.data || [];

  // Calculate driver performance stats
  const driverStats = useMemo(() => {
    return drivers.map(driver => {
      const driverPayments = payments.filter(p =>
        (p.driverId || p.driver_id) === driver.id
      );

      const totalDue = driverPayments.reduce((sum, p) => sum + (p.dueAmount || p.due_amount || 0), 0);
      const totalPaid = driverPayments.reduce((sum, p) => sum + (p.paidAmount || p.paid_amount || 0), 0);
      const paidCount = driverPayments.filter(p => p.status === 'PAID').length;
      const pendingCount = driverPayments.filter(p => p.status === 'PENDING' || p.status === 'PARTIAL').length;
      const overdueCount = driverPayments.filter(p => {
        const paymentDate = new Date(p.paymentDate || p.payment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return paymentDate < today && (p.status === 'PENDING' || p.status === 'PARTIAL');
      }).length;

      const paymentRate = driverPayments.length > 0
        ? Math.round((paidCount / driverPayments.length) * 100)
        : 0;

      const collectionRate = totalDue > 0
        ? Math.round((totalPaid / totalDue) * 100)
        : 0;

      return {
        ...driver,
        totalPayments: driverPayments.length,
        totalDue,
        totalPaid,
        paidCount,
        pendingCount,
        overdueCount,
        paymentRate,
        collectionRate,
      };
    }).sort((a, b) => b.collectionRate - a.collectionRate);
  }, [drivers, payments]);

  // Overall stats
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === 'ACTIVE').length;
  const avgPaymentRate = driverStats.length > 0
    ? Math.round(driverStats.reduce((sum, d) => sum + d.paymentRate, 0) / driverStats.length)
    : 0;
  const bestPerformer = driverStats[0];

  const isLoading = driversLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm text-slate-400 font-medium">{index + 1}</span>;
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 70) return 'text-blue-600 bg-blue-50';
    if (rate >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Chauffeurs"
        subtitle="Analyse des performances de paiement des chauffeurs"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total chauffeurs</p>
                <p className="text-2xl font-bold text-blue-700">{totalDrivers}</p>
                <p className="text-xs text-blue-500">{activeDrivers} actifs</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Taux moyen</p>
                <p className="text-2xl font-bold text-amber-700">{avgPaymentRate}%</p>
                <p className="text-xs text-amber-500">de paiement</p>
              </div>
              <Target className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Meilleur taux</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {bestPerformer?.collectionRate || 0}%
                </p>
                <p className="text-xs text-emerald-500 truncate max-w-[120px]">
                  {bestPerformer ? `${bestPerformer.first_name || bestPerformer.firstName}` : '-'}
                </p>
              </div>
              <Award className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Paiements totaux</p>
                <p className="text-2xl font-bold text-purple-700">{payments.length}</p>
                <p className="text-xs text-purple-500">enregistres</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Classement des chauffeurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {driverStats.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucun chauffeur a afficher</p>
            </div>
          ) : (
            <div className="space-y-4">
              {driverStats.map((driver, index) => (
                <div
                  key={driver.id}
                  className={`p-4 rounded-lg border ${index < 3 ? 'bg-gradient-to-r from-slate-50 to-white' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      {getRankBadge(index)}
                    </div>

                    {/* Driver Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/drivers/${driver.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600"
                        >
                          {driver.first_name || driver.firstName} {driver.last_name || driver.lastName}
                        </Link>
                        {driver.status === 'ACTIVE' && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Actif</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{driver.phone || '-'}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-900">{driver.totalPayments}</p>
                        <p className="text-xs text-slate-500">Paiements</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600">{driver.paidCount}</p>
                        <p className="text-xs text-slate-500">Payes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-amber-600">{driver.pendingCount}</p>
                        <p className="text-xs text-slate-500">En attente</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-red-600">{driver.overdueCount}</p>
                        <p className="text-xs text-slate-500">En retard</p>
                      </div>
                    </div>

                    {/* Payment Rate */}
                    <div className="w-32">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-slate-500">Taux</span>
                        <span className={`text-sm font-bold ${
                          driver.collectionRate >= 90 ? 'text-green-600' :
                          driver.collectionRate >= 70 ? 'text-blue-600' :
                          driver.collectionRate >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {driver.collectionRate}%
                        </span>
                      </div>
                      <Progress
                        value={driver.collectionRate}
                        className="h-2"
                      />
                    </div>

                    {/* Total Amount */}
                    <div className="text-right min-w-[100px]">
                      <p className="text-sm font-bold text-slate-900">
                        {driver.totalPaid.toLocaleString('fr-FR')} F
                      </p>
                      <p className="text-xs text-slate-500">
                        / {driver.totalDue.toLocaleString('fr-FR')} F
                      </p>
                    </div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="md:hidden mt-3 pt-3 border-t grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-sm font-medium">{driver.totalPayments}</p>
                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600">{driver.paidCount}</p>
                      <p className="text-xs text-slate-500">Payes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-600">{driver.pendingCount}</p>
                      <p className="text-xs text-slate-500">Attente</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-600">{driver.overdueCount}</p>
                      <p className="text-xs text-slate-500">Retard</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Excellente performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {driverStats.filter(d => d.collectionRate >= 90).length}
            </p>
            <p className="text-sm text-slate-500">chauffeurs avec 90%+ de taux</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
              <TrendingUp className="w-4 h-4" />
              Performance moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">
              {driverStats.filter(d => d.collectionRate >= 50 && d.collectionRate < 90).length}
            </p>
            <p className="text-sm text-slate-500">chauffeurs entre 50% et 90%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              Attention requise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {driverStats.filter(d => d.collectionRate < 50).length}
            </p>
            <p className="text-sm text-slate-500">chauffeurs sous 50% de taux</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
