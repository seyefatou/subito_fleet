import React from 'react';
import { Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityConfig = {
  urgent: { color: 'bg-red-100 text-red-700 border-red-300', icon: '🚨', label: 'Urgent' },
  recommended: { color: 'bg-green-100 text-green-700 border-green-300', icon: '✅', label: 'Recommandé' },
  late: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '⚠️', label: 'Tardif' }
};

export default function ScheduleSuggestionsModal({ 
  open, 
  onOpenChange, 
  suggestions, 
  onSelectDate,
  isSubmitting 
}) {
  if (!suggestions) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Dates de maintenance suggérées
          </DialogTitle>
          <DialogDescription>
            {suggestions.vehicle.registration} - {suggestions.vehicle.brand} {suggestions.vehicle.model}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prediction Info */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">Prédiction IA</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-purple-700">Type:</span>
                <span className="ml-2 font-medium">{suggestions.prediction.type}</span>
              </div>
              <div>
                <span className="text-purple-700">Probabilité:</span>
                <span className="ml-2 font-medium">{suggestions.prediction.probability}%</span>
              </div>
              <div>
                <span className="text-purple-700">Gravité:</span>
                <Badge className="ml-2">{suggestions.prediction.severity}</Badge>
              </div>
              <div>
                <span className="text-purple-700">Date prévue:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(suggestions.prediction.predicted_date), 'dd MMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Options de programmation</h4>
            {suggestions.suggestions.map((suggestion, idx) => {
              const config = priorityConfig[suggestion.priority];
              return (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    config.color,
                    "hover:shadow-md"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <h5 className="font-semibold text-slate-900">
                          {format(new Date(suggestion.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                        </h5>
                        <Badge className={cn("mt-1", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => onSelectDate(suggestion)}
                      disabled={isSubmitting || suggestion.conflict}
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Programmer
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-slate-700">
                      <strong>Raison:</strong> {suggestion.reason}
                    </p>
                    
                    {suggestion.estimated_duration && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>Durée estimée: {suggestion.estimated_duration}</span>
                      </div>
                    )}

                    {suggestion.cost_estimate && (
                      <p className="text-slate-600">
                        <strong>Coût estimé:</strong> {suggestion.cost_estimate.toLocaleString()} FCFA
                      </p>
                    )}

                    {suggestion.usage_impact && (
                      <p className="text-green-700">
                        <strong>Impact:</strong> {suggestion.usage_impact}
                      </p>
                    )}

                    {suggestion.risk && (
                      <div className="flex items-center gap-2 text-orange-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{suggestion.risk}</span>
                      </div>
                    )}

                    {suggestion.conflict && (
                      <div className="bg-red-100 p-2 rounded text-red-700 text-xs">
                        ⚠️ {suggestion.conflict}
                      </div>
                    )}

                    {suggestion.recommended_garages && suggestion.recommended_garages.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-slate-600 font-medium mb-1">Garages recommandés:</p>
                        {suggestion.recommended_garages.map((garage, gIdx) => (
                          <div key={gIdx} className="text-xs text-slate-600 ml-2">
                            • {garage.name} - {garage.phone}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Usage Analysis */}
          {suggestions.usage_analysis && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Analyse d'utilisation</h4>
              <p className="text-sm text-blue-700 mb-3">{suggestions.usage_analysis.recommendation}</p>
              <div className="grid grid-cols-7 gap-1">
                {suggestions.usage_analysis.daily_pattern.map((day) => (
                  <div key={day.day} className="text-center">
                    <div className={cn(
                      "text-xs font-medium mb-1 p-1 rounded",
                      day.level === 'high' ? "bg-red-100 text-red-700" :
                      day.level === 'medium' ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    )}>
                      {day.name.slice(0, 3)}
                    </div>
                    <div className="text-xs text-slate-600">{day.usage_points}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}