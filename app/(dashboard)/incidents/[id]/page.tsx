// @ts-nocheck
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertTriangle, Car, User, Calendar, FileText, Clock,
  ArrowLeft, Edit2, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from '@/components/common/StatusBadge';
import { incidentsService } from '@/api/services/incidents.service';

const incidentTypes: Record<string, string> = {
  ACCIDENT: 'Accident',
  THEFT: 'Vol',
  PAYMENT_DEFAULT: 'Défaut de paiement',
  GPS_SIGNAL_LOSS: 'Perte signal GPS',
  PROLONGED_INACTIVITY: 'Inactivité prolongée',
  DOCUMENT_EXPIRY: 'Document expiré',
  FRAUD: 'Fraude',
  OTHER: 'Autre'
};

const severityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const severityLabels: Record<string, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
};

export default function IncidentDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: incidentData, isLoading, error } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentsService.get(id),
    enabled: !!id,
  });

  const incident = incidentData?.data || incidentData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Incident non trouvé</p>
        {error && <p className="text-red-500 text-sm mt-2">{(error as any)?.message || 'Erreur inconnue'}</p>}
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const vehicle = incident.vehicles || incident.vehicle;
  const driver = incident.drivers || incident.driver;
  const incidentType = incident.incident_type || incident.incidentType;
  const incidentDate = incident.incident_date || incident.incidentDate;
  const investigationNotes = incident.investigation_notes || incident.investigationNotes;
  const resolvedAt = incident.resolved_at || incident.resolvedAt;
  const createdAt = incident.created_at || incident.createdAt;
  const updatedAt = incident.updated_at || incident.updatedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Détails de l'incident</h1>
            <p className="text-slate-500">Informations complètes</p>
          </div>
        </div>
        <Link href="/incidents">
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
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {incidentTypes[incidentType] || incidentType}
                </h2>
                <StatusBadge status={incident.status} />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityColors[incident.severity] || 'bg-slate-100 text-slate-700'}`}>
                  {severityLabels[incident.severity] || incident.severity}
                </span>
              </div>
              <p className="text-lg text-slate-600 mb-4">
                {incidentDate ? format(new Date(incidentDate), 'EEEE dd MMMM yyyy', { locale: fr }) : '-'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicle && (
                  <div>
                    <p className="text-xs text-slate-500">Véhicule</p>
                    <p className="font-medium">{vehicle.registrationNumber || vehicle.registration_number}</p>
                  </div>
                )}
                {driver && (
                  <div>
                    <p className="text-xs text-slate-500">Chauffeur</p>
                    <p className="font-medium">{driver.first_name} {driver.last_name}</p>
                  </div>
                )}
                {resolvedAt && (
                  <div>
                    <p className="text-xs text-slate-500">Résolu le</p>
                    <p className="font-medium text-green-600">
                      {format(new Date(resolvedAt), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-slate-500">{vehicle.brand} {vehicle.model}</p>
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
              Chauffeur impliqué
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
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Description de l'incident
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 whitespace-pre-wrap">
            {incident.description || 'Aucune description'}
          </p>
        </CardContent>
      </Card>

      {/* Notes d'investigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Notes d'investigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 whitespace-pre-wrap">
            {investigationNotes || 'Aucune note d\'investigation'}
          </p>
        </CardContent>
      </Card>

      {/* Résolution */}
      {resolvedAt && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              Incident résolu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Cet incident a été résolu le {format(new Date(resolvedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
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
              <p className="text-slate-500">Date de l'incident</p>
              <p className="font-medium">
                {incidentDate ? format(new Date(incidentDate), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Sévérité</p>
              <p className="font-medium">
                {severityLabels[incident.severity] || incident.severity}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
