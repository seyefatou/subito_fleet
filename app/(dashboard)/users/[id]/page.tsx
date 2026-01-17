// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  User, Phone, Mail, Shield, Building2, Landmark, Wallet, Car,
  ArrowLeft, Edit2, Loader2, Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StatusBadge from '@/components/common/StatusBadge';
import usersService from '@/api/services/users.service';

export default function UserDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.get(id),
    enabled: !!id,
  });

  const user = userData?.data || userData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Utilisateur non trouvé</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    OPERATOR: 'Opérateur',
    BANK: 'Banque',
    GIE: 'GIE',
    DRIVER: 'Chauffeur',
    FUND: 'Fonds de garantie',
    INSURER: 'Assureur',
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    OPERATOR: 'bg-blue-100 text-blue-700',
    BANK: 'bg-indigo-100 text-indigo-700',
    GIE: 'bg-purple-100 text-purple-700',
    DRIVER: 'bg-green-100 text-green-700',
    FUND: 'bg-amber-100 text-amber-700',
    INSURER: 'bg-cyan-100 text-cyan-700',
  };

  const bank = user.bank;
  const gie = user.gie;
  const driver = user.driver;
  const guaranteeFund = user.guaranteeFund || user.guarantee_fund;
  const insurer = user.insurer;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails de l'utilisateur</h1>
            <p className="text-slate-500">Informations du compte</p>
          </div>
        </div>
        <Link href={`/users`}>
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
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl">
                {user.firstName?.charAt(0) || user.first_name?.charAt(0)}
                {user.lastName?.charAt(0) || user.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.firstName || user.first_name} {user.lastName || user.last_name}
                </h2>
                <StatusBadge status={user.status} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role] || 'bg-slate-100 text-slate-700'}`}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-green-500" />
                  <span>{user.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>
                    Créé le {format(new Date(user.createdAt || user.created_at), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entités liées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banque */}
        {bank && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                Banque associée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/banks/${bank.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">{bank.name}</p>
                <p className="text-slate-500">{bank.code || '-'}</p>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* GIE */}
        {gie && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                GIE associé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/gies/${gie.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">{gie.name}</p>
                <p className="text-slate-500">
                  {gie.representativeName || gie.representative_name || '-'}
                </p>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Chauffeur */}
        {driver && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Profil chauffeur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/drivers/${driver.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">
                  {driver.first_name || driver.firstName} {driver.last_name || driver.lastName}
                </p>
                <p className="text-slate-500">{driver.phone || '-'}</p>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Fonds de garantie */}
        {guaranteeFund && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Fonds de garantie associé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/guarantee-funds/${guaranteeFund.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">{guaranteeFund.name}</p>
                <p className="text-slate-500">
                  {guaranteeFund.managerName || guaranteeFund.manager_name || '-'}
                </p>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Assureur */}
        {insurer && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Assureur associé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/insurers/${insurer.id}`} className="hover:text-blue-600">
                <p className="text-xl font-bold text-slate-900">{insurer.name}</p>
                <p className="text-slate-500">
                  {insurer.contactPhone || insurer.contact_phone || '-'}
                </p>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informations du compte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-500" />
            Informations du compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Rôle</p>
              <p className="font-medium">{roleLabels[user.role] || user.role}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Statut</p>
              <StatusBadge status={user.status} />
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Créé le</p>
              <p className="font-medium">
                {format(new Date(user.createdAt || user.created_at), 'dd/MM/yyyy', { locale: fr })}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Dernière mise à jour</p>
              <p className="font-medium">
                {format(new Date(user.updatedAt || user.updated_at), 'dd/MM/yyyy', { locale: fr })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
