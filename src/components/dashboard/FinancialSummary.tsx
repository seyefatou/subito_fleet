// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function FinancialSummary() {
  const [period, setPeriod] = useState('last_30_days');

  // Données mock - à remplacer par tes appels API
  const report = {
    summary: {
      total_revenue: 0,
      total_expenses: 0,
      net_profit: 0,
      payment_count: 0,
      expense_count: 0,
      profit_margin: 0
    }
  };
  const isLoading = false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Indicateurs Financiers
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">7 jours</SelectItem>
              <SelectItem value="last_30_days">30 jours</SelectItem>
              <SelectItem value="last_90_days">90 jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Revenue */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm text-green-700 font-medium mb-1">Revenus</p>
              <p className="text-2xl font-bold text-green-900">
                {report?.summary.total_revenue ? (report.summary.total_revenue / 1000000).toFixed(2) : '0.00'}M
              </p>
              <p className="text-xs text-green-600 mt-1">
                {report?.summary.payment_count || 0} paiements
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>

          {/* Expenses */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="text-sm text-red-700 font-medium mb-1">Dépenses</p>
              <p className="text-2xl font-bold text-red-900">
                {report?.summary.total_expenses ? (report.summary.total_expenses / 1000000).toFixed(2) : '0.00'}M
              </p>
              <p className="text-xs text-red-600 mt-1">
                {report?.summary.expense_count || 0} dépenses
              </p>
            </div>
            <TrendingDown className="w-10 h-10 text-red-500" />
          </div>

          {/* Net Profit */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg",
            report?.summary.net_profit >= 0 ? "bg-blue-50" : "bg-orange-50"
          )}>
            <div>
              <p className={cn(
                "text-sm font-medium mb-1",
                report?.summary.net_profit >= 0 ? "text-blue-700" : "text-orange-700"
              )}>
                Profit Net
              </p>
              <p className={cn(
                "text-2xl font-bold",
                report?.summary.net_profit >= 0 ? "text-blue-900" : "text-orange-900"
              )}>
                {report?.summary.net_profit ? (report.summary.net_profit / 1000000).toFixed(2) : '0.00'}M
              </p>
              <p className={cn(
                "text-xs mt-1",
                report?.summary.net_profit >= 0 ? "text-blue-600" : "text-orange-600"
              )}>
                Marge: {report?.summary.profit_margin || 0}%
              </p>
            </div>
            <DollarSign className={cn(
              "w-10 h-10",
              report?.summary.net_profit >= 0 ? "text-blue-500" : "text-orange-500"
            )} />
          </div>

          <Link href="/financial-reports">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 bg-blue-50 rounded-lg">
              Voir les rapports détaillés →
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}