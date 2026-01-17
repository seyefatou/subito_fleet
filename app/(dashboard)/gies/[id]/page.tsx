// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Building2, Users, Phone, Mail, MapPin, Car, User, CreditCard,
  ArrowLeft, Edit2, Loader2, TrendingUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from '@/components/common/StatusBadge';
import giesService from '@/api/services/gies.service';
import driversService from '@/api/services/drivers.service';

export default function GIEDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: gieData, isLoading } = useQuery({
    queryKey: ['gie', id],
    queryFn: () => giesService.get(id),
    enabled: !!id,
  });

  const { data: membersData } = useQuery({
    queryKey: ['gie-members', id],
    queryFn: () => giesService.getMembers(id),
    enabled: !!id,
  });

  const { data: statsData } = useQuery({
    queryKey: ['gie-stats', id],
    queryFn: () => giesService.getStats(id),
    enabled: !!id,
  });

  const { data: driversData } = useQuery({
    queryKey: ['gie-drivers', id],
    queryFn: () => driversService.list({ gieId: id, take: 20 }),
    enabled: !!id,
  });

  const gie = gieData?.data || gieData;
  const members = membersData?.data || membersData || [];
  const stats = statsData?.data || statsData;
  const drivers = driversData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!gie) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">GIE non trouvé</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails du GIE</h1>
            <p className="text-slate-500">Informations et membres</p>
          </div>
        </div>
        <Link href={`/gies`}>
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
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{gie.name}</h2>
                <StatusBadge status={gie.status} />
              </div>
              {(gie.representativeName || gie.representative_name) && (
                <p className="text-slate-500 mb-4">
                  Représentant: {gie.representativeName || gie.representative_name}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>{gie.contactPhone || gie.contact_phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-purple-500" />
                  <span>{gie.contactEmail || gie.contact_email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{gie.address || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>{gie.memberCount || gie.member_count || drivers.length || 0} membres</span>
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
                <p className="text-sm text-blue-600">Membres</p>
                <p className="text-2xl font-bold text-blue-700">
                  {gie.memberCount || gie.member_count || drivers.length || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Véhicules</p>
                <p className="text-2xl font-bold text-amber-700">
                  {gie.vehicleCount || gie.vehicle_count || stats?.vehicleCount || 0}
                </p>
              </div>
              <Car className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Paiements totaux</p>
                <p className="text-2xl font-bold text-green-700">
                  {(stats?.totalPayments || 0).toLocaleString('fr-FR')} F
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Taux de paiement</p>
                <p className="text-2xl font-bold text-purple-700">
                  {stats?.paymentRate || 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="drivers" className="w-full">
        <TabsList>
          <TabsTrigger value="drivers">Chauffeurs ({drivers.length})</TabsTrigger>
          <TabsTrigger value="members">Membres ({members.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {drivers.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Chauffeur</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Téléphone</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Véhicule</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver: any) => (
                      <tr key={driver.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-4">
                          <Link href={`/drivers/${driver.id}`} className="flex items-center gap-3 hover:text-blue-600">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {driver.first_name || driver.firstName} {driver.last_name || driver.lastName}
                              </p>
                              <p className="text-xs text-slate-500">{driver.email || '-'}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{driver.phone || '-'}</td>
                        <td className="p-4 text-sm">
                          {driver.currentVehicle || driver.vehicles_drivers_current_vehicle_idTovehicles ? (
                            <span className="text-blue-600">
                              {(driver.currentVehicle || driver.vehicles_drivers_current_vehicle_idTovehicles)?.registrationNumber ||
                               (driver.currentVehicle || driver.vehicles_drivers_current_vehicle_idTovehicles)?.registration_number}
                            </span>
                          ) : (
                            <span className="text-slate-400">Non assigné</span>
                          )}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={driver.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-8 text-slate-500">Aucun chauffeur dans ce GIE</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {members.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Membre</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Rôle</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member: any) => (
                      <tr key={member.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <p className="font-medium">
                              {member.firstName || member.first_name} {member.lastName || member.last_name}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{member.role || '-'}</td>
                        <td className="p-4 text-sm text-slate-600">{member.email || '-'}</td>
                        <td className="p-4">
                          <StatusBadge status={member.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-8 text-slate-500">Aucun membre enregistré</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
