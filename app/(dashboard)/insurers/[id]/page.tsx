// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Building2, Phone, Mail, MapPin, Shield, Car,
  ArrowLeft, Edit2, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from '@/components/common/StatusBadge';
import insurersService from '@/api/services/insurers.service';
import insurancesService from '@/api/services/insurances.service';

export default function InsurerDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: insurerData, isLoading } = useQuery({
    queryKey: ['insurer', id],
    queryFn: () => insurersService.get(id),
    enabled: !!id,
  });

  const { data: insurancesData } = useQuery({
    queryKey: ['insurer-insurances', id],
    queryFn: () => insurancesService.list({ insurerId: id, take: 20 }),
    enabled: !!id,
  });

  const insurer = insurerData?.data || insurerData;
  const insurances = insurancesData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!insurer) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Assureur non trouvé</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const activeInsurances = insurances.filter((i: any) => i.status === 'ACTIVE');
  const totalPremiums = insurances.reduce((sum: number, i: any) =>
    sum + (i.premiumAmount || i.premium_amount || 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails de l'assureur</h1>
            <p className="text-slate-500">Informations et polices</p>
          </div>
        </div>
        <Link href={`/insurers`}>
          <Button variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </Link>
      </div>

      {/* Profil principal */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-slate-900">{insurer.name}</h2>
                <StatusBadge status={insurer.status} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>{insurer.contactPhone || insurer.contact_phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-purple-500" />
                  <span>{insurer.contactEmail || insurer.contact_email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{insurer.address || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Polices totales</p>
                <p className="text-2xl font-bold text-blue-700">{insurances.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Polices actives</p>
                <p className="text-2xl font-bold text-green-700">{activeInsurances.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600">Total primes</p>
                <p className="text-2xl font-bold text-amber-700">
                  {totalPremiums.toLocaleString('fr-FR')} F
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des polices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-500" />
            Polices d'assurance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {insurances.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">N° Police</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Véhicule</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Prime</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Expiration</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {insurances.map((insurance: any) => (
                  <tr key={insurance.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4">
                      <Link href={`/insurances/${insurance.id}`} className="font-medium text-blue-600 hover:underline">
                        {insurance.policyNumber || insurance.policy_number}
                      </Link>
                    </td>
                    <td className="p-4 text-sm">
                      {insurance.vehicle ? (
                        <Link href={`/vehicles/${insurance.vehicle.id}`} className="hover:text-blue-600">
                          {insurance.vehicle.registrationNumber || insurance.vehicle.registration_number}
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {insurance.type === 'BASIC' && 'Basique'}
                      {insurance.type === 'COMPREHENSIVE' && 'Tous risques'}
                      {insurance.type === 'THIRD_PARTY' && 'Tiers'}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {(insurance.premiumAmount || insurance.premium_amount)?.toLocaleString('fr-FR')} F
                    </td>
                    <td className="p-4 text-sm">
                      {format(new Date(insurance.endDate || insurance.end_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={insurance.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-slate-500">Aucune police d'assurance</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
