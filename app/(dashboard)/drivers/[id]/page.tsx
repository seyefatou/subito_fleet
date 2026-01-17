// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  User, Phone, Mail, MapPin, Car, Calendar, CreditCard, FileText,
  ArrowLeft, Edit2, AlertTriangle, CheckCircle, Clock, Building2, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from '@/components/common/StatusBadge';
import driversService from '@/api/services/drivers.service';
import paymentsService from '@/api/services/payments.service';

export default function DriverDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Récupérer les détails du chauffeur
  const { data: driverData, isLoading, error } = useQuery({
    queryKey: ['driver', id],
    queryFn: () => driversService.get(id),
    enabled: !!id,
  });

  console.log('Driver data:', driverData, 'Error:', error);

  // Récupérer les paiements du chauffeur
  const { data: paymentsData } = useQuery({
    queryKey: ['driver-payments', id],
    queryFn: () => paymentsService.list({ driverId: id, take: 20 }),
    enabled: !!id,
  });

  const driver = driverData?.data || driverData;
  const payments = paymentsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Chauffeur non trouvé</p>
        {error && <p className="text-red-500 text-sm mt-2">{(error as any)?.message || 'Erreur inconnue'}</p>}
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const vehicle = driver.vehicles_drivers_current_vehicle_idTovehicles || driver.currentVehicle;
  const gie = driver.gies || driver.gie;

  // Stats des paiements
  const totalPaid = payments.reduce((sum, p) => sum + (p.paid_amount || p.paidAmount || 0), 0);
  const totalDue = payments.reduce((sum, p) => sum + (p.due_amount || p.dueAmount || 0), 0);
  const paidCount = payments.filter(p => p.status === 'PAID').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails du chauffeur</h1>
            <p className="text-slate-500">Informations complètes et historique</p>
          </div>
        </div>
        <Link href={`/drivers`}>
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
            <Avatar className="w-24 h-24">
              <AvatarImage src={driver.photo_url} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl">
                {driver.first_name?.charAt(0)}{driver.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {driver.first_name} {driver.last_name}
                </h2>
                <StatusBadge status={driver.status} />
              </div>
              <p className="text-slate-500 mb-4">CNI: {driver.id_number}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>{driver.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-purple-500" />
                  <span>{driver.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{driver.address || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>
                    {driver.date_of_birth
                      ? format(new Date(driver.date_of_birth), 'dd/MM/yyyy')
                      : '-'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Véhicule actuel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Véhicule actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle ? (
              <div>
                <p className="text-xl font-bold text-slate-900">{vehicle.registrationNumber}</p>
                <p className="text-slate-500">{vehicle.brand} {vehicle.model}</p>
              </div>
            ) : (
              <p className="text-slate-400">Non assigné</p>
            )}
          </CardContent>
        </Card>

        {/* GIE */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              GIE
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gie ? (
              <div>
                <p className="text-xl font-bold text-slate-900">{gie.name}</p>
                <p className="text-slate-500">{gie.representative_name || 'Représentant non défini'}</p>
              </div>
            ) : (
              <p className="text-slate-400">Indépendant</p>
            )}
          </CardContent>
        </Card>

        {/* Permis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Permis de conduire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">{driver.license_number || '-'}</p>
            {driver.license_expiry && (
              <p className={`text-sm ${new Date(driver.license_expiry) < new Date() ? 'text-red-500' : 'text-slate-500'}`}>
                Expire le {format(new Date(driver.license_expiry), 'dd/MM/yyyy')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats paiements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total payé</p>
                <p className="text-2xl font-bold text-blue-700">
                  {totalPaid.toLocaleString('fr-FR')} F
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Total dû</p>
                <p className="text-2xl font-bold text-amber-700">
                  {totalDue.toLocaleString('fr-FR')} F
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Paiements payés</p>
                <p className="text-2xl font-bold text-green-700">{paidCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">En attente</p>
                <p className="text-2xl font-bold text-orange-700">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList>
          <TabsTrigger value="payments">Historique des paiements</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {payments.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Date</th>
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

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {driver.id_card_front_url && (
                  <div className="border rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium">CNI Recto</p>
                    <a href={driver.id_card_front_url} target="_blank" className="text-xs text-blue-600 hover:underline">
                      Voir
                    </a>
                  </div>
                )}
                {driver.id_card_back_url && (
                  <div className="border rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium">CNI Verso</p>
                    <a href={driver.id_card_back_url} target="_blank" className="text-xs text-blue-600 hover:underline">
                      Voir
                    </a>
                  </div>
                )}
                {driver.license_front_url && (
                  <div className="border rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium">Permis Recto</p>
                    <a href={driver.license_front_url} target="_blank" className="text-xs text-blue-600 hover:underline">
                      Voir
                    </a>
                  </div>
                )}
                {driver.license_back_url && (
                  <div className="border rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium">Permis Verso</p>
                    <a href={driver.license_back_url} target="_blank" className="text-xs text-blue-600 hover:underline">
                      Voir
                    </a>
                  </div>
                )}
                {!driver.id_card_front_url && !driver.id_card_back_url && !driver.license_front_url && !driver.license_back_url && (
                  <p className="col-span-4 text-center py-4 text-slate-500">Aucun document enregistré</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
