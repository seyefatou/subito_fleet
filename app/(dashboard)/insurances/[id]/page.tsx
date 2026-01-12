// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Shield, Car, Building2, Calendar, DollarSign, FileText, AlertTriangle,
  ArrowLeft, Edit2, Loader2, CheckCircle, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatusBadge from '@/components/common/StatusBadge';
import { insurancesService } from '@/api/services/insurances.service';

export default function InsuranceDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: insuranceData, isLoading } = useQuery({
    queryKey: ['insurance', id],
    queryFn: () => insurancesService.get(id),
    enabled: !!id,
  });

  const insurance = insuranceData?.data || insuranceData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!insurance) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Assurance non trouvée</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const vehicle = insurance.vehicles || insurance.vehicle;
  const insurer = insurance.insurers || insurance.insurer;

  const typeLabels: Record<string, string> = {
    COMPREHENSIVE: 'Tous risques',
    THIRD_PARTY: 'Tiers',
    ALL_RISK: 'Tous risques étendu',
    DRIVER_INCAPACITY: 'Incapacité conducteur',
  };

  const startDate = new Date(insurance.start_date || insurance.startDate);
  const endDate = new Date(insurance.expiry_date || insurance.expiryDate);
  const today = new Date();
  const totalDays = differenceInDays(endDate, startDate);
  const daysElapsed = differenceInDays(today, startDate);
  const daysRemaining = differenceInDays(endDate, today);
  const progress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

  const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails de l'assurance</h1>
            <p className="text-slate-500">Informations et couverture</p>
          </div>
        </div>
        <Link href={`/insurances`}>
          <Button variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </Link>
      </div>

      {/* Alerte expiration */}
      {isExpiringSoon && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-700">Assurance expire bientôt</p>
                <p className="text-sm text-amber-600">
                  Cette assurance expire dans {daysRemaining} jours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isExpired && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-medium text-red-700">Assurance expirée</p>
                <p className="text-sm text-red-600">
                  Cette assurance a expiré le {format(endDate, 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profil principal */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {insurance.policy_number || insurance.policyNumber}
                </h2>
                <StatusBadge status={insurance.status} />
              </div>
              <p className="text-slate-500 mb-4">
                Type: {typeLabels[insurance.insurance_type || insurance.insuranceType] || insurance.insurance_type || insurance.insuranceType}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Prime annuelle</p>
                  <p className="font-medium text-lg">
                    {(insurance.premium_amount || insurance.premiumAmount)?.toLocaleString('fr-FR')} F
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date de début</p>
                  <p className="font-medium">
                    {format(startDate, 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date de fin</p>
                  <p className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : ''}`}>
                    {format(endDate, 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Jours restants</p>
                  <p className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-green-600'}`}>
                    {isExpired ? 'Expirée' : `${daysRemaining} jours`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression */}
      <Card>
        <CardHeader>
          <CardTitle>Période de couverture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{format(startDate, 'dd MMM yyyy', { locale: fr })}</span>
              <span className="font-medium">{progress.toFixed(0)}% écoulé</span>
              <span className="text-slate-500">{format(endDate, 'dd MMM yyyy', { locale: fr })}</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{totalDays}</p>
                <p className="text-sm text-slate-500">Jours total</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{Math.max(daysElapsed, 0)}</p>
                <p className="text-sm text-blue-600">Jours écoulés</p>
              </div>
              <div className={`text-center p-4 rounded-lg ${isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-amber-50' : 'bg-green-50'}`}>
                <p className={`text-2xl font-bold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-green-600'}`}>
                  {Math.max(daysRemaining, 0)}
                </p>
                <p className={`text-sm ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-green-600'}`}>
                  Jours restants
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Véhicule */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Véhicule assuré
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle ? (
              <Link href={`/vehicles/${vehicle.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">
                  {vehicle.registrationNumber || vehicle.registration_number}
                </p>
                <p className="text-slate-500">{vehicle.brand} {vehicle.model}</p>
              </Link>
            ) : (
              <p className="text-slate-400">Non défini</p>
            )}
          </CardContent>
        </Card>

        {/* Assureur */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Assureur
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insurer ? (
              <Link href={`/insurers/${insurer.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">{insurer.name}</p>
                <p className="text-slate-500">{insurer.contactPhone || insurer.contact_phone || '-'}</p>
              </Link>
            ) : (
              <p className="text-slate-400">Non défini</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prime et Couverture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-teal-600">Prime d'assurance</p>
                <p className="text-3xl font-bold text-teal-700">
                  {(insurance.premium_amount || insurance.premiumAmount)?.toLocaleString('fr-FR')} F
                </p>
                <p className="text-sm text-teal-600">
                  {insurance.premium_frequency || insurance.premiumFrequency || 'Annuel'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Montant de couverture</p>
                <p className="text-3xl font-bold text-blue-700">
                  {(insurance.coverage_amount || insurance.coverageAmount)?.toLocaleString('fr-FR') || '-'} F
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails de couverture */}
      {(insurance.coverage_details || insurance.coverageDetails) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              Détails de la couverture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{insurance.coverage_details || insurance.coverageDetails}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
