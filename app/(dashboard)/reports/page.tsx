// @ts-nocheck
"use client";

import React from 'react';
import { FileText, Download, BarChart3, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reportTypes = [
  {
    title: 'Rapport des paiements',
    description: 'Synthèse des paiements journaliers par période',
    icon: BarChart3,
    color: 'blue'
  },
  {
    title: 'Rapport des véhicules',
    description: 'État du parc et suivi des crédits',
    icon: TrendingUp,
    color: 'amber'
  },
  {
    title: 'Rapport des chauffeurs',
    description: 'Performance et historique des chauffeurs',
    icon: FileText,
    color: 'emerald'
  },
  {
    title: 'Rapport financier',
    description: 'Analyse financière complète',
    icon: BarChart3,
    color: 'purple'
  }
];

export default function Reports() {
  const handleGenerateReport = (type) => {
    // TODO: Implémenter la génération de rapport
    console.log('Generate report:', type);
  };

  return (
    <div>
      <PageHeader
        title="Rapports"
        subtitle="Génération et export de rapports"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${report.color}-100 flex items-center justify-center`}>
                  <report.icon className={`w-5 h-5 text-${report.color}-600`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleGenerateReport(report.title)}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Générer le rapport
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
