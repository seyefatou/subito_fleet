// @ts-nocheck
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  paid: { label: 'Payé', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'En attente', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  overdue: { label: 'En retard', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  failed: { label: 'Échoué', icon: XCircle, color: 'bg-slate-100 text-slate-700' },
  partial: { label: 'Partiel', icon: Clock, color: 'bg-blue-100 text-blue-700' }
};

export default function RecentPaymentsTable({ payments, vehicles, drivers, banks }) {
  const getVehicle = (id) => vehicles?.find(v => v.id === id);
  const getDriver = (id) => drivers?.find(d => d.id === id);
  const getBank = (id) => banks?.find(b => b.id === id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Derniers paiements</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Véhicule</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Chauffeur</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Banque</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments?.slice(0, 10).map((payment) => {
              const vehicle = getVehicle(payment.vehicle_id);
              const driver = getDriver(payment.driver_id);
              const bank = getBank(payment.bank_id);
              const status = statusConfig[payment.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {payment.payment_date ? format(new Date(payment.payment_date), 'dd MMM yyyy', { locale: fr }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">
                      {vehicle?.registration_number || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {driver ? `${driver.first_name} ${driver.last_name}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {bank?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">
                      {payment.paid_amount?.toLocaleString('fr-FR')} FCFA
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={cn("flex items-center gap-1 w-fit", status.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {(!payments || payments.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Aucun paiement enregistré
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}