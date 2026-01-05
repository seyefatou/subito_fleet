// @ts-nocheck
"use client";

import React from 'react';
import { Receipt, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancialTracking() {
  return (
    <div>
      <PageHeader
        title="Suivi Financier"
        subtitle="Vue d'ensemble de la situation financière"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total encaissé</p>
                <p className="text-2xl font-bold">0 F</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En attente</p>
                <p className="text-2xl font-bold">0 F</p>
              </div>
              <Wallet className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Impayés</p>
                <p className="text-2xl font-bold">0 F</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Taux recouvrement</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <Receipt className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Évolution mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
            <p className="text-slate-500">Graphique d'évolution - À implémenter</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
