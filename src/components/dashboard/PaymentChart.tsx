// @ts-nocheck
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PaymentChart({ data }) {
  const chartData = data || [
    { name: 'Lun', montant: 2400000, objectif: 3000000 },
    { name: 'Mar', montant: 2800000, objectif: 3000000 },
    { name: 'Mer', montant: 3200000, objectif: 3000000 },
    { name: 'Jeu', montant: 2900000, objectif: 3000000 },
    { name: 'Ven', montant: 3500000, objectif: 3000000 },
    { name: 'Sam', montant: 2100000, objectif: 3000000 },
    { name: 'Dim', montant: 1800000, objectif: 3000000 },
  ];

  const formatCurrency = (value) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          <p className="font-medium text-slate-900 mb-2">{label}</p>
          <p className="text-sm text-amber-600">
            Collecté: {payload[0]?.value?.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-sm text-slate-400">
            Objectif: {payload[1]?.value?.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-900">Évolution des remboursements</h3>
          <p className="text-sm text-slate-500">Cette semaine</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-slate-500">Collecté</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <span className="text-slate-500">Objectif</span>
          </div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="montant" 
              stroke="#f59e0b" 
              strokeWidth={3}
              fill="url(#colorMontant)" 
            />
            <Area 
              type="monotone" 
              dataKey="objectif" 
              stroke="#cbd5e1" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}