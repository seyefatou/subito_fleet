import React from 'react';
import { AlertTriangle, Clock, MapPinOff, FileWarning, CreditCard } from 'lucide-react';
import { cn } from "@/lib/utils";

const alertTypes = {
  payment_default: { icon: CreditCard, color: 'text-red-500 bg-red-50' },
  gps_signal_loss: { icon: MapPinOff, color: 'text-orange-500 bg-orange-50' },
  prolonged_inactivity: { icon: Clock, color: 'text-amber-500 bg-amber-50' },
  document_expiry: { icon: FileWarning, color: 'text-blue-500 bg-blue-50' },
  default: { icon: AlertTriangle, color: 'text-slate-500 bg-slate-50' }
};

export default function AlertsWidget({ incidents }) {
  const getAlertConfig = (type) => alertTypes[type] || alertTypes.default;

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const incidentDate = new Date(date);
    const diffHours = Math.floor((now - incidentDate) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "À l'instant";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Alertes récentes</h3>
        <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">
          {incidents?.filter(i => i.status === 'open').length || 0} actives
        </span>
      </div>
      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {incidents?.slice(0, 8).map((incident) => {
          const config = getAlertConfig(incident.type);
          const Icon = config.icon;
          
          return (
            <div key={incident.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-lg", config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {incident.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {incident.description || 'Aucune description'}
                  </p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatTimeAgo(incident.incident_date)}
                </span>
              </div>
            </div>
          );
        })}
        {(!incidents || incidents.length === 0) && (
          <div className="px-6 py-12 text-center text-slate-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Aucune alerte</p>
          </div>
        )}
      </div>
    </div>
  );
}