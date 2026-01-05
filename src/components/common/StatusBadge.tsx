// @ts-nocheck
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfigs = {
  // General statuses
  active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'Inactif', color: 'bg-slate-100 text-slate-700' },
  suspended: { label: 'Suspendu', color: 'bg-red-100 text-red-700' },
  
  // Payment statuses
  paid: { label: 'Payé', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  overdue: { label: 'En retard', color: 'bg-red-100 text-red-700' },
  failed: { label: 'Échoué', color: 'bg-slate-100 text-slate-700' },
  partial: { label: 'Partiel', color: 'bg-blue-100 text-blue-700' },
  
  // Guarantee statuses
  called: { label: 'Appelée', color: 'bg-orange-100 text-orange-700' },
  partially_called: { label: 'Part. appelée', color: 'bg-amber-100 text-amber-700' },
  reimbursed: { label: 'Remboursée', color: 'bg-green-100 text-green-700' },
  released: { label: 'Libérée', color: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Clôturée', color: 'bg-slate-100 text-slate-700' },
  
  // Incident statuses
  open: { label: 'Ouvert', color: 'bg-red-100 text-red-700' },
  investigating: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Résolu', color: 'bg-emerald-100 text-emerald-700' },
  escalated: { label: 'Escaladé', color: 'bg-purple-100 text-purple-700' },
  
  // Claim statuses
  reported: { label: 'Déclaré', color: 'bg-blue-100 text-blue-700' },
  under_investigation: { label: 'En enquête', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approuvé', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700' },
  under_review: { label: 'En révision', color: 'bg-amber-100 text-amber-700' },
  
  // Vehicle statuses
  seized: { label: 'Saisi', color: 'bg-red-100 text-red-700' },
  sold: { label: 'Vendu', color: 'bg-slate-100 text-slate-700' },
  written_off: { label: 'Passé en perte', color: 'bg-slate-100 text-slate-700' },
  
  // Insurance statuses
  expired: { label: 'Expiré', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Annulé', color: 'bg-slate-100 text-slate-700' }
};

export default function StatusBadge({ status, className = '' }: { status: any; className?: string }) {
  const config = statusConfigs[status] || { 
    label: status?.replace(/_/g, ' ') || 'N/A', 
    color: 'bg-slate-100 text-slate-700' 
  };

  return (
    <Badge className={cn(config.color, "font-medium", className)}>
      {config.label}
    </Badge>
  );
}