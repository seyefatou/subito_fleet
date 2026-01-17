// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Landmark, Phone, Mail, MapPin, Car, CreditCard, Smartphone,
  ArrowLeft, Edit2, Loader2, TrendingUp, Users
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from '@/components/common/StatusBadge';
import banksService from '@/api/services/banks.service';
import vehiclesService from '@/api/services/vehicles.service';

export default function BankDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: bankData, isLoading, error } = useQuery({
    queryKey: ['bank', id],
    queryFn: () => banksService.get(id),
    enabled: !!id,
  });

  const { data: statsData } = useQuery({
    queryKey: ['bank-stats', id],
    queryFn: () => banksService.getStats(id),
    enabled: !!id,
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['bank-vehicles', id],
    queryFn: () => vehiclesService.list({ bankId: id, take: 10 }),
    enabled: !!id,
  });

  // Debug
  console.log('Bank ID:', id);
  console.log('Bank Data Response:', bankData);
  console.log('Bank Error:', error);

  const bank = bankData?.data || bankData;
  const stats = statsData?.data || statsData;
  const vehicles = vehiclesData?.data || [];

  console.log('Extracted Bank:', bank);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-medium">Erreur: {(error as any)?.message || 'Erreur inconnue'}</p>
        <p className="text-slate-500 mt-2">ID: {id}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Banque non trouvée</p>
        <p className="text-slate-400 text-sm mt-2">ID: {id}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const mobileMoneyLabels: Record<string, string> = {
    ORANGE_MONEY: 'Orange Money',
    WAVE: 'Wave',
    FREE_MONEY: 'Free Money',
    OTHER: 'Autre',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails de la banque</h1>
            <p className="text-slate-500">Informations et statistiques</p>
          </div>
        </div>
        <Link href={`/banks`}>
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
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Landmark className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{bank.name}</h2>
                <StatusBadge status={bank.status} />
              </div>
              {bank.code && <p className="text-slate-500 mb-4">Code: {bank.code}</p>}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>{bank.contactPhone || bank.contact_phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-purple-500" />
                  <span>{bank.contactEmail || bank.contact_email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{bank.address || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Smartphone className="w-4 h-4 text-orange-500" />
                  <span>
                    {mobileMoneyLabels[bank.mobileMoneyProvider || bank.mobile_money_provider] || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Véhicules financés</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats?.vehicleCount || vehicles.length || 0}
                </p>
              </div>
              <Car className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total financé</p>
                <p className="text-2xl font-bold text-green-700">
                  {(stats?.totalFinanced || 0).toLocaleString('fr-FR')} F
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Paiements reçus</p>
                <p className="text-2xl font-bold text-amber-700">
                  {(stats?.totalPayments || 0).toLocaleString('fr-FR')} F
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Programmes</p>
                <p className="text-2xl font-bold text-purple-700">
                  {stats?.programCount || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Money */}
      {(bank.mobileMoneyAccount || bank.mobile_money_account) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-orange-500" />
              Compte Mobile Money
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600">Fournisseur</p>
                <p className="text-lg font-bold text-orange-700">
                  {mobileMoneyLabels[bank.mobileMoneyProvider || bank.mobile_money_provider] || '-'}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600">Numéro de compte</p>
                <p className="text-lg font-bold text-orange-700">
                  {bank.mobileMoneyAccount || bank.mobile_money_account}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des véhicules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-slate-500" />
            Véhicules financés
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {vehicles.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Immatriculation</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Marque/Modèle</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Montant crédit</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle: any) => (
                  <tr key={vehicle.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4">
                      <Link href={`/vehicles/${vehicle.id}`} className="text-blue-600 hover:underline font-medium">
                        {vehicle.registrationNumber || vehicle.registration_number}
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {vehicle.brand} {vehicle.model}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {(vehicle.creditAmount || vehicle.credit_amount)?.toLocaleString('fr-FR')} F
                    </td>
                    <td className="p-4">
                      <StatusBadge status={vehicle.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-slate-500">Aucun véhicule financé</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
