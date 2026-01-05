import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function BankDistributionChart({ banks, vehicles }) {
  const data = banks?.map((bank, index) => {
    const bankVehicles = vehicles?.filter(v => v.bank_id === bank.id) || [];
    const totalCredit = bankVehicles.reduce((sum, v) => sum + (v.credit_amount || 0), 0);
    
    return {
      name: bank.name,
      value: totalCredit,
      vehicles: bankVehicles.length,
      color: COLORS[index % COLORS.length]
    };
  }).filter(d => d.value > 0) || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          <p className="font-medium text-slate-900 mb-1">{data.name}</p>
          <p className="text-sm text-slate-600">
            {data.value?.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-xs text-slate-400">
            {data.vehicles} véhicules
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-slate-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Répartition par banque</h3>
      <div className="h-64">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Aucune donnée disponible
          </div>
        )}
      </div>
    </div>
  );
}