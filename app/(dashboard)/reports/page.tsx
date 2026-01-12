// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileText, Download, BarChart3, TrendingUp, Car, User,
  Calendar, Loader2, DollarSign, AlertCircle, Building2
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { reportsService } from '@/api/services/reports.service';
import { vehiclesService } from '@/api/services/vehicles.service';
import { driversService } from '@/api/services/drivers.service';
import { banksService } from '@/api/services/banks.service';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('financial');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Charger les listes pour les filtres
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesService.list(),
  });

  const { data: driversData } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.list(),
  });

  const { data: banksData } = useQuery({
    queryKey: ['banks'],
    queryFn: () => banksService.list(),
  });

  // Rapport financier
  const { data: financialReport, isLoading: loadingFinancial, refetch: refetchFinancial } = useQuery({
    queryKey: ['financial-report', startDate, endDate, selectedVehicle, selectedDriver, selectedBank],
    queryFn: () => reportsService.getFinancialReport({
      startDate,
      endDate,
      vehicleId: selectedVehicle || undefined,
      driverId: selectedDriver || undefined,
      bankId: selectedBank || undefined,
    }),
    enabled: activeTab === 'financial',
  });

  // Rapport véhicule
  const { data: vehicleReport, isLoading: loadingVehicle, refetch: refetchVehicle } = useQuery({
    queryKey: ['vehicle-report', selectedVehicle],
    queryFn: () => reportsService.getVehicleReport(selectedVehicle),
    enabled: activeTab === 'vehicle' && !!selectedVehicle,
  });

  // Rapport chauffeur
  const { data: driverReport, isLoading: loadingDriver, refetch: refetchDriver } = useQuery({
    queryKey: ['driver-report', selectedDriver],
    queryFn: () => reportsService.getDriverReport(selectedDriver),
    enabled: activeTab === 'driver' && !!selectedDriver,
  });

  const vehicles = vehiclesData?.data || [];
  const drivers = driversData?.data || [];
  const banks = banksData?.data || [];
  const financial = financialReport?.data || financialReport;
  const vehicleRpt = vehicleReport?.data || vehicleReport;
  const driverRpt = driverReport?.data || driverReport;

  const handleExport = async (type: 'payments' | 'vehicles' | 'drivers', format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const response = await reportsService.exportData(type, format);

      if (format === 'csv') {
        // Télécharger le CSV
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Télécharger le JSON
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success('Export téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const setQuickPeriod = (period: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date();
    switch (period) {
      case 'today':
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'week':
        setStartDate(format(subDays(today, 7), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'month':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'year':
        setStartDate(format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
    }
  };

  return (
    <div>
      <PageHeader
        title="Rapports"
        subtitle="Génération et export de rapports"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">
            <DollarSign className="w-4 h-4 mr-2" />
            Financier
          </TabsTrigger>
          <TabsTrigger value="vehicle">
            <Car className="w-4 h-4 mr-2" />
            Véhicule
          </TabsTrigger>
          <TabsTrigger value="driver">
            <User className="w-4 h-4 mr-2" />
            Chauffeur
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </TabsTrigger>
        </TabsList>

        {/* Rapport Financier */}
        <TabsContent value="financial" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtres du rapport</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label>Date début</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Date fin</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Véhicule</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les véhicules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les véhicules</SelectItem>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.registrationNumber || v.registration_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Banque</Label>
                  <Select value={selectedBank} onValueChange={setSelectedBank}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les banques" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les banques</SelectItem>
                      {banks.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setQuickPeriod('today')}>Aujourd'hui</Button>
                <Button variant="outline" size="sm" onClick={() => setQuickPeriod('week')}>7 jours</Button>
                <Button variant="outline" size="sm" onClick={() => setQuickPeriod('month')}>Ce mois</Button>
                <Button variant="outline" size="sm" onClick={() => setQuickPeriod('year')}>Cette année</Button>
              </div>
            </CardContent>
          </Card>

          {/* Résultats */}
          {loadingFinancial ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : financial?.summary ? (
            <div className="space-y-6">
              {/* Résumé */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-600">Total dû</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {financial.summary.totalDue?.toLocaleString('fr-FR')} F
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-600">Total payé</p>
                    <p className="text-2xl font-bold text-green-700">
                      {financial.summary.totalPaid?.toLocaleString('fr-FR')} F
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-amber-600">Taux de recouvrement</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {financial.summary.collectionRate}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-600">Nb paiements</p>
                    <p className="text-2xl font-bold text-slate-700">
                      {financial.summary.totalPayments}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Par statut */}
              {financial.byStatus && financial.byStatus.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {financial.byStatus.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600">{item.status}</p>
                          <p className="text-xl font-bold">{item._count} paiements</p>
                          <p className="text-sm text-slate-500">
                            {(item._sum?.paid_amount || 0).toLocaleString('fr-FR')} F payés
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Sélectionnez une période pour générer le rapport</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Rapport Véhicule */}
        <TabsContent value="vehicle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner un véhicule</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Choisir un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.registrationNumber || v.registration_number} - {v.brand} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {loadingVehicle ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : vehicleRpt?.vehicle ? (
            <div className="space-y-6">
              {/* Info véhicule */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Car className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{vehicleRpt.vehicle.registrationNumber}</h3>
                      <p className="text-slate-500">{vehicleRpt.vehicle.brand} {vehicleRpt.vehicle.model}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-600">Total payé</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {(vehicleRpt.payments?._sum?.paid_amount || 0).toLocaleString('fr-FR')} F
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-amber-600">Coûts maintenance</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {(vehicleRpt.maintenanceCosts || 0).toLocaleString('fr-FR')} F
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-red-600">Incidents</p>
                    <p className="text-2xl font-bold text-red-700">
                      {vehicleRpt.incidents?.reduce((sum, i) => sum + i._count, 0) || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : selectedVehicle ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucune donnée pour ce véhicule</p>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        {/* Rapport Chauffeur */}
        <TabsContent value="driver" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner un chauffeur</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Choisir un chauffeur" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.first_name} {d.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {loadingDriver ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : driverRpt?.driver ? (
            <div className="space-y-6">
              {/* Info chauffeur */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {driverRpt.driver.first_name} {driverRpt.driver.last_name}
                      </h3>
                      <p className="text-slate-500">{driverRpt.driver.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-600">Total payé</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {(driverRpt.payments?._sum?.paid_amount || 0).toLocaleString('fr-FR')} F
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-600">Taux de paiement</p>
                    <p className="text-2xl font-bold text-green-700">
                      {driverRpt.payments?.paymentRate || 0}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-600">Nb paiements</p>
                    <p className="text-2xl font-bold text-slate-700">
                      {driverRpt.payments?._count || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : selectedDriver ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucune donnée pour ce chauffeur</p>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        {/* Export */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Export Paiements */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Paiements</CardTitle>
                    <CardDescription>Exporter tous les paiements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => handleExport('payments', 'csv')}
                  className="w-full"
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter CSV
                </Button>
                <Button
                  onClick={() => handleExport('payments', 'json')}
                  variant="outline"
                  className="w-full"
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter JSON
                </Button>
              </CardContent>
            </Card>

            {/* Export Véhicules */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Car className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Véhicules</CardTitle>
                    <CardDescription>Exporter tous les véhicules</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => handleExport('vehicles', 'csv')}
                  className="w-full"
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter CSV
                </Button>
                <Button
                  onClick={() => handleExport('vehicles', 'json')}
                  variant="outline"
                  className="w-full"
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter JSON
                </Button>
              </CardContent>
            </Card>

            {/* Export Chauffeurs */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Chauffeurs</CardTitle>
                    <CardDescription>Exporter tous les chauffeurs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => handleExport('drivers', 'csv')}
                  className="w-full"
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter CSV
                </Button>
                <Button
                  onClick={() => handleExport('drivers', 'json')}
                  variant="outline"
                  className="w-full"
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter JSON
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
