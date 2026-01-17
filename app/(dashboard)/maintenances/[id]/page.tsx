// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Wrench, Car, User, Calendar, ArrowLeft, Edit2, Loader2,
  Clock, Building2, Phone, FileText, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from '@/components/common/StatusBadge';
import { maintenancesService } from '@/api/services/maintenances.service';

const maintenanceTypes: Record<string, string> = {
  REVISION: 'Révision',
  VIDANGE: 'Vidange',
  PNEUS: 'Pneus',
  FREINS: 'Freins',
  BATTERIE: 'Batterie',
  CLIMATISATION: 'Climatisation',
  CARROSSERIE: 'Carrosserie',
  VISITE_TECHNIQUE: 'Visite technique',
  REPARATION: 'Réparation',
  AUTRE: 'Autre'
};

export default function MaintenanceDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: maintenanceData, isLoading, error } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => maintenancesService.get(id),
    enabled: !!id,
  });

  const maintenance = maintenanceData?.data || maintenanceData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Entretien non trouvé</p>
        {error && <p className="text-red-500 text-sm mt-2">{(error as any)?.message || 'Erreur inconnue'}</p>}
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const vehicle = maintenance.vehicles || maintenance.vehicle;
  const driver = maintenance.drivers || maintenance.driver;
  const maintenanceType = maintenance.maintenance_type || maintenance.maintenanceType;
  const maintenanceDate = maintenance.maintenance_date || maintenance.maintenanceDate;
  const nextMaintenanceDate = maintenance.next_maintenance_date || maintenance.nextMaintenanceDate;
  const nextMaintenanceMileage = maintenance.next_maintenance_mileage || maintenance.nextMaintenanceMileage;
  const providerPhone = maintenance.provider_phone || maintenance.providerPhone;
  const invoiceUrl = maintenance.invoice_url || maintenance.invoiceUrl;
  const createdAt = maintenance.created_at || maintenance.createdAt;
  const updatedAt = maintenance.updated_at || maintenance.updatedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails de l'entretien</h1>
            <p className="text-slate-500">Informations complètes de la maintenance</p>
          </div>
        </div>
        <Link href="/maintenances">
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
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Wrench className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {maintenanceTypes[maintenanceType] || maintenanceType}
                </h2>
                <StatusBadge status={maintenance.status} />
              </div>
              <p className="text-lg text-slate-600 mb-4">
                {maintenanceDate ? format(new Date(maintenanceDate), 'EEEE dd MMMM yyyy', { locale: fr }) : '-'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Coût</p>
                  <p className="font-bold text-xl text-blue-600">
                    {maintenance.cost != null ? `${maintenance.cost.toLocaleString('fr-FR')} F` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Kilométrage</p>
                  <p className="font-medium">
                    {maintenance.mileage ? `${maintenance.mileage.toLocaleString('fr-FR')} km` : '-'}
                  </p>
                </div>
                {vehicle && (
                  <div>
                    <p className="text-xs text-slate-500">Véhicule</p>
                    <p className="font-medium">{vehicle.registrationNumber || vehicle.registration_number}</p>
                  </div>
                )}
                {maintenance.provider && (
                  <div>
                    <p className="text-xs text-slate-500">Prestataire</p>
                    <p className="font-medium">{maintenance.provider}</p>
                  </div>
                )}
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
              Véhicule concerné
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle ? (
              <Link href={`/vehicles/${vehicle.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">
                  {vehicle.registrationNumber || vehicle.registration_number}
                </p>
                <p className="text-slate-500">
                  {vehicle.brand} {vehicle.model}
                </p>
              </Link>
            ) : (
              <p className="text-slate-400">Non spécifié</p>
            )}
          </CardContent>
        </Card>

        {/* Chauffeur */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4" />
              Chauffeur
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driver ? (
              <Link href={`/drivers/${driver.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">
                  {driver.first_name} {driver.last_name}
                </p>
                <p className="text-slate-500">{driver.phone || '-'}</p>
              </Link>
            ) : (
              <p className="text-slate-400">Non assigné</p>
            )}
          </CardContent>
        </Card>

        {/* Prestataire */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Prestataire
            </CardTitle>
          </CardHeader>
          <CardContent>
            {maintenance.provider ? (
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {maintenance.provider}
                </p>
                {providerPhone && (
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {providerPhone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-400">Non spécifié</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description et Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 whitespace-pre-wrap">
              {maintenance.description || 'Aucune description'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 whitespace-pre-wrap">
              {maintenance.notes || 'Aucune note'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prochain entretien */}
      {(nextMaintenanceDate || nextMaintenanceMileage) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Prochain entretien prévu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {nextMaintenanceDate && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Date prévue</p>
                  <p className="text-xl font-bold text-green-700">
                    {format(new Date(nextMaintenanceDate), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
              )}
              {nextMaintenanceMileage && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Kilométrage prévu</p>
                  <p className="text-xl font-bold text-blue-700">
                    {nextMaintenanceMileage.toLocaleString('fr-FR')} km
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            Informations système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Date de maintenance</p>
              <p className="font-medium">
                {maintenanceDate ? format(new Date(maintenanceDate), 'dd/MM/yyyy', { locale: fr }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Créé le</p>
              <p className="font-medium">
                {createdAt
                  ? format(new Date(createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })
                  : '-'
                }
              </p>
            </div>
            <div>
              <p className="text-slate-500">Modifié le</p>
              <p className="font-medium">
                {updatedAt
                  ? format(new Date(updatedAt), 'dd/MM/yyyy HH:mm', { locale: fr })
                  : '-'
                }
              </p>
            </div>
            {invoiceUrl ? (
              <div>
                <p className="text-slate-500">Facture</p>
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Voir la facture
                </a>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
