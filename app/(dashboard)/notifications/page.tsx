// @ts-nocheck
"use client";

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays, isToday, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Bell, Check, AlertTriangle, Info, Calendar, CreditCard, Car,
  Wrench, Shield, Clock, CheckCircle, XCircle, Loader2, User,
  TrendingDown, FileWarning, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import paymentsService from '@/api/services/payments.service';
import maintenancesService from '@/api/services/maintenances.service';
import incidentsService from '@/api/services/incidents.service';
import vehiclesService from '@/api/services/vehicles.service';
import driversService from '@/api/services/drivers.service';

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  category: string;
  title: string;
  message: string;
  link?: string;
  date: Date;
  icon: any;
}

export default function Notifications() {
  // Fetch data from various services
  const { data: overdueResponse, isLoading: overdueLoading } = useQuery({
    queryKey: ['payments-overdue'],
    queryFn: () => paymentsService.getOverdue(),
  });

  const { data: paymentsResponse, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments-pending'],
    queryFn: () => paymentsService.list({ take: 100 }),
  });

  const { data: maintenancesResponse, isLoading: maintenancesLoading } = useQuery({
    queryKey: ['maintenances'],
    queryFn: () => maintenancesService.list({ take: 50 }),
  });

  const { data: incidentsResponse, isLoading: incidentsLoading } = useQuery({
    queryKey: ['incidents-open'],
    queryFn: () => incidentsService.list({ take: 50 }),
  });

  const { data: vehiclesResponse, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  const overduePayments = overdueResponse?.data || [];
  const payments = paymentsResponse?.data || [];
  const maintenances = maintenancesResponse?.data || [];
  const incidents = incidentsResponse?.data || [];
  const vehicles = vehiclesResponse?.data || [];

  // Generate notifications from real data
  const notifications = useMemo(() => {
    const notifs: Notification[] = [];

    // 1. Overdue payments notifications
    overduePayments.forEach((payment) => {
      const vehicle = payment.vehicle || payment.vehicles;
      const driver = payment.driver || payment.drivers;
      const dueAmount = payment.dueAmount || payment.due_amount || 0;
      const paidAmount = payment.paidAmount || payment.paid_amount || 0;
      const remaining = dueAmount - paidAmount;
      const daysOverdue = differenceInDays(new Date(), new Date(payment.paymentDate || payment.payment_date));

      notifs.push({
        id: `overdue-${payment.id}`,
        type: daysOverdue > 7 ? 'error' : 'warning',
        category: 'Paiement',
        title: `Paiement en retard - ${vehicle?.registrationNumber || vehicle?.registration_number || 'Vehicule'}`,
        message: `${remaining.toLocaleString('fr-FR')} F en retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}${driver ? ` - ${driver.first_name || driver.firstName} ${driver.last_name || driver.lastName}` : ''}`,
        link: `/payments/${payment.id}`,
        date: new Date(payment.paymentDate || payment.payment_date),
        icon: CreditCard,
      });
    });

    // 2. Today's pending payments
    const todayPending = payments.filter(p => {
      const paymentDate = new Date(p.paymentDate || p.payment_date);
      return isToday(paymentDate) && (p.status === 'PENDING' || p.status === 'PARTIAL');
    });

    if (todayPending.length > 0) {
      const totalDue = todayPending.reduce((sum, p) => sum + (p.dueAmount || p.due_amount || 0), 0);
      notifs.push({
        id: 'today-payments',
        type: 'info',
        category: 'Paiement',
        title: `${todayPending.length} paiement${todayPending.length > 1 ? 's' : ''} attendu${todayPending.length > 1 ? 's' : ''} aujourd'hui`,
        message: `Total attendu: ${totalDue.toLocaleString('fr-FR')} F`,
        link: '/payments',
        date: new Date(),
        icon: Clock,
      });
    }

    // 3. Unverified payment proofs
    let unverifiedProofs = 0;
    payments.forEach(p => {
      const proofs = p.paymentProofs || p.payment_proofs || [];
      unverifiedProofs += proofs.filter(proof => !proof.verified).length;
    });

    if (unverifiedProofs > 0) {
      notifs.push({
        id: 'unverified-proofs',
        type: 'warning',
        category: 'Validation',
        title: `${unverifiedProofs} preuve${unverifiedProofs > 1 ? 's' : ''} de paiement a valider`,
        message: 'Des preuves de paiement attendent votre verification',
        link: '/payment-approvals',
        date: new Date(),
        icon: FileWarning,
      });
    }

    // 4. Open incidents
    const openIncidents = incidents.filter(i =>
      i.status === 'REPORTED' || i.status === 'UNDER_INVESTIGATION'
    );

    openIncidents.forEach((incident) => {
      const vehicle = incident.vehicle || incident.vehicles;
      notifs.push({
        id: `incident-${incident.id}`,
        type: incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'error' : 'warning',
        category: 'Incident',
        title: `Incident ${incident.severity === 'CRITICAL' ? 'CRITIQUE' : incident.severity === 'HIGH' ? 'IMPORTANT' : ''} - ${vehicle?.registrationNumber || vehicle?.registration_number || 'Vehicule'}`,
        message: incident.description || 'Incident en cours de traitement',
        link: `/incidents/${incident.id}`,
        date: new Date(incident.incident_date || incident.incidentDate || incident.created_at),
        icon: AlertTriangle,
      });
    });

    // 5. Upcoming maintenances (next 7 days)
    const upcomingMaintenances = maintenances.filter(m => {
      if (!m.next_maintenance_date && !m.nextMaintenanceDate) return false;
      const nextDate = new Date(m.next_maintenance_date || m.nextMaintenanceDate);
      const daysUntil = differenceInDays(nextDate, new Date());
      return daysUntil >= 0 && daysUntil <= 7;
    });

    upcomingMaintenances.forEach((maintenance) => {
      const vehicle = maintenance.vehicle || maintenance.vehicles;
      const nextDate = new Date(maintenance.next_maintenance_date || maintenance.nextMaintenanceDate);
      const daysUntil = differenceInDays(nextDate, new Date());

      notifs.push({
        id: `maintenance-${maintenance.id}`,
        type: daysUntil <= 2 ? 'warning' : 'info',
        category: 'Maintenance',
        title: `Maintenance prevue - ${vehicle?.registrationNumber || vehicle?.registration_number || 'Vehicule'}`,
        message: daysUntil === 0
          ? "Maintenance prevue aujourd'hui"
          : `Maintenance dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`,
        link: `/maintenances/${maintenance.id}`,
        date: nextDate,
        icon: Wrench,
      });
    });

    // 6. Vehicles without driver
    const vehiclesWithoutDriver = vehicles.filter(v =>
      v.status === 'ACTIVE' && !v.currentDriverId && !v.current_driver_id
    );

    if (vehiclesWithoutDriver.length > 0) {
      notifs.push({
        id: 'vehicles-no-driver',
        type: 'info',
        category: 'Flotte',
        title: `${vehiclesWithoutDriver.length} vehicule${vehiclesWithoutDriver.length > 1 ? 's' : ''} sans chauffeur`,
        message: 'Des vehicules actifs n\'ont pas de chauffeur assigne',
        link: '/vehicles',
        date: new Date(),
        icon: Car,
      });
    }

    // 7. Inactive vehicles
    const inactiveVehicles = vehicles.filter(v => v.status === 'INACTIVE' || v.status === 'MAINTENANCE');
    if (inactiveVehicles.length > 0) {
      notifs.push({
        id: 'inactive-vehicles',
        type: 'info',
        category: 'Flotte',
        title: `${inactiveVehicles.length} vehicule${inactiveVehicles.length > 1 ? 's' : ''} inactif${inactiveVehicles.length > 1 ? 's' : ''}`,
        message: `${inactiveVehicles.filter(v => v.status === 'MAINTENANCE').length} en maintenance, ${inactiveVehicles.filter(v => v.status === 'INACTIVE').length} inactif${inactiveVehicles.filter(v => v.status === 'INACTIVE').length > 1 ? 's' : ''}`,
        link: '/vehicles',
        date: new Date(),
        icon: Car,
      });
    }

    // Sort by priority (errors first, then warnings, then date)
    return notifs.sort((a, b) => {
      const priorityOrder = { error: 0, warning: 1, info: 2, success: 3 };
      const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type];
      if (priorityDiff !== 0) return priorityDiff;
      return b.date.getTime() - a.date.getTime();
    });
  }, [overduePayments, payments, incidents, maintenances, vehicles]);

  const isLoading = overdueLoading || paymentsLoading || maintenancesLoading || incidentsLoading || vehiclesLoading;

  const getIconColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-amber-500 bg-amber-100';
      case 'error': return 'text-red-500 bg-red-100';
      case 'success': return 'text-green-500 bg-green-100';
      default: return 'text-blue-500 bg-blue-100';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-amber-500';
      case 'error': return 'border-l-red-500';
      case 'success': return 'border-l-green-500';
      default: return 'border-l-blue-500';
    }
  };

  // Stats
  const errorCount = notifications.filter(n => n.type === 'error').length;
  const warningCount = notifications.filter(n => n.type === 'warning').length;
  const infoCount = notifications.filter(n => n.type === 'info').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Centre de notifications et alertes"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-3xl font-bold text-slate-700">{notifications.length}</p>
              </div>
              <Bell className="w-10 h-10 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Critiques</p>
                <p className="text-3xl font-bold text-red-700">{errorCount}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Avertissements</p>
                <p className="text-3xl font-bold text-amber-700">{warningCount}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Informations</p>
                <p className="text-3xl font-bold text-blue-700">{infoCount}</p>
              </div>
              <Info className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Aucune notification</p>
              <p className="text-slate-400">Tout est en ordre!</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors border-l-4 hover:shadow-md",
                  getBorderColor(notification.type)
                )}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      getIconColor(notification.type)
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {notification.category}
                        </Badge>
                        {notification.type === 'error' && (
                          <Badge className="bg-red-100 text-red-700 text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="font-medium text-slate-900">{notification.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {format(notification.date, 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </div>
                    {notification.link && (
                      <Link href={notification.link}>
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
