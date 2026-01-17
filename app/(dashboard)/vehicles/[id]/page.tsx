// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Car, User, Landmark, Shield, MapPin, Calendar, CreditCard, Wrench,
  ArrowLeft, Edit2, AlertTriangle, CheckCircle, Clock, Building2, Loader2, Fuel
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from '@/components/common/StatusBadge';
import vehiclesService from '@/api/services/vehicles.service';
import paymentsService from '@/api/services/payments.service';
import maintenancesService from '@/api/services/maintenances.service';

export default function VehicleDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Récupérer les détails du véhicule
  const { data: vehicleData, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesService.get(id),
    enabled: !!id,
  });

  console.log('Vehicle data:', vehicleData, 'Error:', error);

  // Récupérer les paiements du véhicule
  const { data: paymentsData } = useQuery({
    queryKey: ['vehicle-payments', id],
    queryFn: () => paymentsService.list({ vehicleId: id, take: 20 }),
    enabled: !!id,
  });

  // Récupérer les maintenances du véhicule
  const { data: maintenancesData } = useQuery({
    queryKey: ['vehicle-maintenances', id],
    queryFn: () => maintenancesService.list({ vehicleId: id, take: 10 }),
    enabled: !!id,
  });

  const vehicle = vehicleData?.data || vehicleData;
  const payments = paymentsData?.data || [];
  const maintenances = maintenancesData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Véhicule non trouvé</p>
        {error && <p className="text-red-500 text-sm mt-2">{(error as any)?.message || 'Erreur inconnue'}</p>}
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const driver = vehicle.currentDriver;
  const bank = vehicle.bank;
  const creditTotal = vehicle.creditAmount || 0;
  const creditRemaining = vehicle.creditRemaining || 0;
  const creditPaid = creditTotal - creditRemaining;
  const creditProgress = creditTotal > 0 ? (creditPaid / creditTotal) * 100 : 0;

  // Stats des paiements
  const totalPaid = payments.reduce((sum, p) => sum + (p.paid_amount || p.paidAmount || 0), 0);
  const totalDue = payments.reduce((sum, p) => sum + (p.due_amount || p.dueAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails du véhicule</h1>
            <p className="text-slate-500">Informations complètes et suivi financier</p>
          </div>
        </div>
        <Link href={`/vehicles`}>
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
              <Car className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{vehicle.registrationNumber}</h2>
                <StatusBadge status={vehicle.status} />
              </div>
              <p className="text-lg text-slate-600 mb-4">
                {vehicle.brand} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicle.vin && (
                  <div>
                    <p className="text-xs text-slate-500">N° Châssis</p>
                    <p className="font-medium">{vehicle.vin}</p>
                  </div>
                )}
                {vehicle.color && (
                  <div>
                    <p className="text-xs text-slate-500">Couleur</p>
                    <p className="font-medium">{vehicle.color}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500">Paiement journalier</p>
                  <p className="font-medium text-blue-600">
                    {vehicle.dailyPaymentAmount?.toLocaleString('fr-FR')} F/jour
                  </p>
                </div>
                {vehicle.mileage && (
                  <div>
                    <p className="text-xs text-slate-500">Kilométrage</p>
                    <p className="font-medium">{vehicle.mileage?.toLocaleString('fr-FR')} km</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chauffeur actuel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4" />
              Chauffeur actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driver ? (
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {driver.first_name} {driver.last_name}
                </p>
                <p className="text-slate-500">{driver.phone}</p>
              </div>
            ) : (
              <p className="text-slate-400">Non assigné</p>
            )}
          </CardContent>
        </Card>

        {/* Banque */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              Banque financeuse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bank ? (
              <div>
                <p className="text-xl font-bold text-slate-900">{bank.name}</p>
                <p className="text-slate-500">{bank.code || '-'}</p>
              </div>
            ) : (
              <p className="text-slate-400">Non définie</p>
            )}
          </CardContent>
        </Card>

        {/* GPS */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Position GPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle.lastGpsLat && vehicle.lastGpsLng ? (
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {vehicle.lastGpsLat?.toFixed(4)}, {vehicle.lastGpsLng?.toFixed(4)}
                </p>
                <p className="text-xs text-slate-500">
                  Dernière mise à jour: {vehicle.lastGpsUpdate
                    ? format(new Date(vehicle.lastGpsUpdate), 'dd/MM/yyyy HH:mm')
                    : '-'
                  }
                </p>
              </div>
            ) : (
              <p className="text-slate-400">Position inconnue</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progression du crédit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            Progression du crédit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Remboursé: {creditPaid.toLocaleString('fr-FR')} F</span>
              <span className="font-medium">{creditProgress.toFixed(1)}%</span>
            </div>
            <Progress value={creditProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{creditTotal.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-slate-500">Montant total</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{creditPaid.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-green-600">Remboursé</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{creditRemaining.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-amber-600">Restant</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="maintenances">Maintenances</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {payments.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Chauffeur</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Montant dû</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Montant payé</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-4 text-sm">
                          {format(new Date(payment.payment_date || payment.paymentDate), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td className="p-4 text-sm">
                          {payment.driver?.first_name} {payment.driver?.last_name}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {(payment.due_amount || payment.dueAmount)?.toLocaleString('fr-FR')} F
                        </td>
                        <td className="p-4 text-sm font-medium text-green-600">
                          {(payment.paid_amount || payment.paidAmount)?.toLocaleString('fr-FR')} F
                        </td>
                        <td className="p-4">
                          <StatusBadge status={payment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-8 text-slate-500">Aucun paiement enregistré</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenances" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {maintenances.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Description</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Coût</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenances.map((maintenance) => (
                      <tr key={maintenance.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-4 text-sm">
                          {format(new Date(maintenance.maintenance_date || maintenance.maintenanceDate), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {maintenance.maintenance_type || maintenance.maintenanceType}
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {maintenance.description || '-'}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {maintenance.cost?.toLocaleString('fr-FR')} F
                        </td>
                        <td className="p-4">
                          <StatusBadge status={maintenance.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-8 text-slate-500">Aucune maintenance enregistrée</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
