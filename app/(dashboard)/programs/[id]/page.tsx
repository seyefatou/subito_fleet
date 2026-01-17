// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Briefcase, Landmark, Car, Calendar, Percent, DollarSign, Clock, FileText,
  ArrowLeft, Edit2, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatusBadge from '@/components/common/StatusBadge';
import programsService from '@/api/services/programs.service';
import vehiclesService from '@/api/services/vehicles.service';

export default function ProgramDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: programData, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: () => programsService.get(id),
    enabled: !!id,
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['program-vehicles', id],
    queryFn: () => vehiclesService.list({ programId: id, take: 20 }),
    enabled: !!id,
  });

  const program = programData?.data || programData;
  const vehicles = vehiclesData?.data || program?.vehicles || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Programme non trouvé</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const bank = program.bank;
  const totalFinancing = program.totalFinancing || program.total_financing || 0;
  const vehicleCount = program.vehicleCount || program.vehicle_count || vehicles.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails du programme</h1>
            <p className="text-slate-500">Informations et véhicules</p>
          </div>
        </div>
        <Link href={`/programs`}>
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
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Briefcase className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{program.name}</h2>
                <StatusBadge status={program.status} />
              </div>
              {program.description && (
                <p className="text-slate-500 mb-4">{program.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Taux d'intérêt</p>
                  <p className="font-medium text-lg">
                    {(program.interestRate || program.interest_rate)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Durée</p>
                  <p className="font-medium">
                    {program.durationMonths || program.duration_months} mois
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Véhicules</p>
                  <p className="font-medium">{vehicleCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Financement total</p>
                  <p className="font-medium text-green-600">
                    {totalFinancing.toLocaleString('fr-FR')} F
                  </p>
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
                <p className="text-sm text-blue-600">Véhicules</p>
                <p className="text-2xl font-bold text-blue-700">{vehicleCount}</p>
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
                  {totalFinancing.toLocaleString('fr-FR')} F
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Taux d'intérêt</p>
                <p className="text-2xl font-bold text-amber-700">
                  {program.interestRate || program.interest_rate}%
                </p>
              </div>
              <Percent className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Durée</p>
                <p className="text-2xl font-bold text-purple-700">
                  {program.durationMonths || program.duration_months} mois
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banque */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Landmark className="w-4 h-4" />
            Banque partenaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bank ? (
            <Link href={`/banks/${bank.id}`} className="flex items-center gap-4 hover:bg-slate-50 p-4 rounded-lg -m-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Landmark className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{bank.name}</p>
                <p className="text-slate-500">{bank.code || '-'}</p>
              </div>
            </Link>
          ) : (
            <p className="text-slate-400">Non définie</p>
          )}
        </CardContent>
      </Card>

      {/* Période */}
      {(program.startDate || program.start_date || program.endDate || program.end_date) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              Période du programme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {(program.startDate || program.start_date) && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Date de début</p>
                  <p className="text-lg font-bold text-green-700">
                    {format(new Date(program.startDate || program.start_date), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              )}
              {(program.endDate || program.end_date) && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Date de fin</p>
                  <p className="text-lg font-bold text-red-700">
                    {format(new Date(program.endDate || program.end_date), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des véhicules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-slate-500" />
            Véhicules du programme
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
                      <Link href={`/vehicles/${vehicle.id}`} className="font-medium text-blue-600 hover:underline">
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
            <p className="text-center py-8 text-slate-500">Aucun véhicule dans ce programme</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
