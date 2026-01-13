// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Shield, Car, Landmark, Wallet, Calendar, AlertCircle, History,
  ArrowLeft, Edit2, Loader2, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatusBadge from '@/components/common/StatusBadge';
import guaranteesService from '@/api/services/guarantees.service';

export default function GuaranteeDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: guaranteeData, isLoading } = useQuery({
    queryKey: ['guarantee', id],
    queryFn: () => guaranteesService.get(id),
    enabled: !!id,
  });

  const { data: callHistoryData } = useQuery({
    queryKey: ['guarantee-calls', id],
    queryFn: () => guaranteesService.getCallHistory(id),
    enabled: !!id,
  });

  const guarantee = guaranteeData?.data || guaranteeData;
  const callHistory = callHistoryData?.data || callHistoryData || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!guarantee) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Garantie non trouvée</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const vehicle = guarantee.vehicle;
  const bank = guarantee.bank;
  const fund = guarantee.guaranteeFund || guarantee.guarantee_fund;

  const totalCalled = callHistory.reduce((sum: number, call: any) => sum + (call.callAmount || call.call_amount || 0), 0);
  const remainingAmount = (guarantee.guaranteeAmount || guarantee.guarantee_amount) - totalCalled;
  const usedPercentage = ((totalCalled / (guarantee.guaranteeAmount || guarantee.guarantee_amount)) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails de la garantie</h1>
            <p className="text-slate-500">Informations et historique des appels</p>
          </div>
        </div>
        <Link href={`/guarantees`}>
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
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {(guarantee.guaranteeAmount || guarantee.guarantee_amount)?.toLocaleString('fr-FR')} F
                </h2>
                <StatusBadge status={guarantee.status} />
              </div>
              <p className="text-slate-500 mb-4">
                Créée le {format(new Date(guarantee.createdAt || guarantee.created_at), 'dd MMMM yyyy', { locale: fr })}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Montant total</p>
                  <p className="font-medium">
                    {(guarantee.guaranteeAmount || guarantee.guarantee_amount)?.toLocaleString('fr-FR')} F
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Montant appelé</p>
                  <p className="font-medium text-red-600">{totalCalled.toLocaleString('fr-FR')} F</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Montant restant</p>
                  <p className="font-medium text-green-600">{remainingAmount.toLocaleString('fr-FR')} F</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisation de la garantie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Appelé: {totalCalled.toLocaleString('fr-FR')} F</span>
              <span className="font-medium">{usedPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usedPercentage} className="h-3" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{totalCalled.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-red-600">Montant appelé (F)</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{remainingAmount.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-green-600">Montant disponible (F)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Véhicule */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Véhicule
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

        {/* Banque */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              Banque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bank ? (
              <Link href={`/banks/${bank.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">{bank.name}</p>
                <p className="text-slate-500">{bank.code || '-'}</p>
              </Link>
            ) : (
              <p className="text-slate-400">Non définie</p>
            )}
          </CardContent>
        </Card>

        {/* Fonds de garantie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Fonds de garantie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fund ? (
              <Link href={`/guarantee-funds/${fund.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">{fund.name}</p>
                <p className="text-slate-500">
                  Disponible: {(fund.availableAmount || fund.available_amount)?.toLocaleString('fr-FR')} F
                </p>
              </Link>
            ) : (
              <p className="text-slate-400">Non défini</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historique des appels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            Historique des appels
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {callHistory.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Montant</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Raison</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {callHistory.map((call: any) => (
                  <tr key={call.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4 text-sm">
                      {format(new Date(call.callDate || call.call_date || call.createdAt), 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td className="p-4 text-sm font-medium text-red-600">
                      {(call.callAmount || call.call_amount)?.toLocaleString('fr-FR')} F
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {call.reason || '-'}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={call.status || 'CALLED'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-slate-500">Aucun appel enregistré</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
