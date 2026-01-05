"use client";

import React from 'react';
import { FileText, Download, BarChart3 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FinancialReports() {
  return (
    <div>
      <PageHeader
        title="Rapports Financiers"
        subtitle="Génération de rapports financiers détaillés"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Rapport mensuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 mb-4">
              Synthèse des encaissements et décaissements du mois
            </p>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Rapport annuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 mb-4">
              Bilan financier complet de l'année
            </p>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
