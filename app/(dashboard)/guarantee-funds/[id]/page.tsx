// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Wallet, Phone, Mail, MapPin, User, Shield, Percent,
  ArrowLeft, Edit2, Loader2, DollarSign
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatusBadge from '@/components/common/StatusBadge';
import guaranteeFundsService from '@/api/services/guarantee-funds.service';
import guaranteesService from '@/api/services/guarantees.service';

export default function GuaranteeFundDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: fundData, isLoading } = useQuery({
    queryKey: ['guarantee-fund', id],
    queryFn: () => guaranteeFundsService.get(id),
    enabled: !!id,
  });

  const { data: guaranteesData } = useQuery({
    queryKey: ['fund-guarantees', id],
    queryFn: () => guaranteesService.list({ guaranteeFundId: id, take: 20 }),
    enabled: !!id,
  });

  const fund = fundData?.data || fundData;
  const guarantees = guaranteesData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Fonds de garantie non trouvé</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const totalAmount = fund.totalAmount || fund.total_amount || 0;
  const availableAmount = fund.availableAmount || fund.available_amount || 0;
  const usedAmount = totalAmount - availableAmount;
  const usedPercentage = totalAmount > 0 ? (usedAmount / totalAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails du fonds de garantie</h1>
            <p className="text-slate-500">Informations et garanties</p>
          </div>
        </div>
        <Link href={`/guarantee-funds`}>
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
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{fund.name}</h2>
                <StatusBadge status={fund.status} />
              </div>
              {(fund.managerName || fund.manager_name) && (
                <p className="text-slate-500 mb-4">
                  Gestionnaire: {fund.managerName || fund.manager_name}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>{fund.contactPhone || fund.contact_phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-purple-500" />
                  <span>{fund.contactEmail || fund.contact_email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{fund.address || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Percent className="w-4 h-4 text-green-500" />
                  <span>Taux: {(fund.coverageRate || fund.coverage_rate || 0)}%</span>
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
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Montant total</p>
                <p className="text-2xl font-bold text-blue-700">
                  {totalAmount.toLocaleString('fr-FR')} F
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Montant disponible</p>
                <p className="text-2xl font-bold text-green-700">
                  {availableAmount.toLocaleString('fr-FR')} F
                </p>
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
                <p className="text-sm text-amber-600">Garanties actives</p>
                <p className="text-2xl font-bold text-amber-700">
                  {guarantees.filter((g: any) => g.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilisation du fonds */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisation du fonds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Utilisé: {usedAmount.toLocaleString('fr-FR')} F</span>
              <span className="font-medium">{usedPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usedPercentage} className="h-3" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{usedAmount.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-amber-600">Montant utilisé (F)</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{availableAmount.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-green-600">Montant disponible (F)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des garanties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-500" />
            Garanties liées au fonds
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {guarantees.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Véhicule</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Banque</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Montant</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {guarantees.map((guarantee: any) => (
                  <tr key={guarantee.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4">
                      <Link href={`/guarantees/${guarantee.id}`} className="hover:text-blue-600">
                        {guarantee.vehicle ? (
                          <span className="font-medium">
                            {guarantee.vehicle.registrationNumber || guarantee.vehicle.registration_number}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {guarantee.bank?.name || '-'}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {(guarantee.guaranteeAmount || guarantee.guarantee_amount)?.toLocaleString('fr-FR')} F
                    </td>
                    <td className="p-4">
                      <StatusBadge status={guarantee.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-slate-500">Aucune garantie liée à ce fonds</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
