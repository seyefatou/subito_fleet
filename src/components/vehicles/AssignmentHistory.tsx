// @ts-nocheck
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, UserPlus, UserMinus, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FormModal from '@/components/common/FormModal';
import FormField from '@/components/common/FormField';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AssignmentHistory({ vehicle }) {
  const queryClient = useQueryClient();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['vehicle-assignments', vehicle.id],
    queryFn: () => base44.entities.VehicleAssignment.filter({ vehicle_id: vehicle.id })
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list()
  });

  const assignMutation = useMutation({
    mutationFn: async (data) => {
      // Close previous assignment if exists
      const activeAssignments = assignments.filter(a => !a.end_date);
      for (const assignment of activeAssignments) {
        await base44.entities.VehicleAssignment.update(assignment.id, {
          end_date: new Date().toISOString().split('T')[0]
        });
      }

      // Create new assignment
      await base44.entities.VehicleAssignment.create(data);

      // Update vehicle current driver
      await base44.entities.Vehicle.update(vehicle.id, {
        current_driver_id: data.driver_id
      });

      // Update driver current vehicle
      if (data.driver_id) {
        await base44.entities.Driver.update(data.driver_id, {
          current_vehicle_id: vehicle.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Affectation enregistrée');
      setAssignModalOpen(false);
      setFormData({});
    }
  });

  const unassignMutation = useMutation({
    mutationFn: async () => {
      const activeAssignments = assignments.filter(a => !a.end_date);
      for (const assignment of activeAssignments) {
        await base44.entities.VehicleAssignment.update(assignment.id, {
          end_date: new Date().toISOString().split('T')[0]
        });
      }

      await base44.entities.Vehicle.update(vehicle.id, {
        current_driver_id: null
      });

      if (vehicle.current_driver_id) {
        await base44.entities.Driver.update(vehicle.current_driver_id, {
          current_vehicle_id: null
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Désaffectation effectuée');
    }
  });

  const sortedAssignments = [...assignments].sort((a, b) => 
    new Date(b.start_date) - new Date(a.start_date)
  );

  const currentDriver = drivers.find(d => d.id === vehicle.current_driver_id);

  const handleAssign = (e) => {
    e.preventDefault();
    assignMutation.mutate({
      vehicle_id: vehicle.id,
      driver_id: formData.driver_id,
      start_date: formData.start_date || new Date().toISOString().split('T')[0],
      notes: formData.notes
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Affectation actuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentDriver ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={currentDriver.photo_url} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                    {currentDriver.first_name?.charAt(0)}{currentDriver.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">
                    {currentDriver.first_name} {currentDriver.last_name}
                  </p>
                  <p className="text-sm text-slate-500">{currentDriver.phone}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => unassignMutation.mutate()}
                disabled={unassignMutation.isPending}
                className="text-red-600"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Désaffecter
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-500 mb-3">Aucun chauffeur affecté</p>
              <Button onClick={() => setAssignModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Affecter un chauffeur
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Assignment */}
      {currentDriver && (
        <Button onClick={() => setAssignModalOpen(true)} className="w-full">
          <Users className="w-4 h-4 mr-2" />
          Changer de chauffeur
        </Button>
      )}

      {/* Assignment History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des affectations</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAssignments.length > 0 ? (
            <div className="space-y-3">
              {sortedAssignments.map((assignment) => {
                const driver = drivers.find(d => d.id === assignment.driver_id);
                const isActive = !assignment.end_date;
                const duration = assignment.end_date
                  ? Math.ceil((new Date(assignment.end_date) - new Date(assignment.start_date)) / (1000 * 60 * 60 * 24))
                  : Math.ceil((new Date() - new Date(assignment.start_date)) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={assignment.id}
                    className="flex items-start justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={driver?.photo_url} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                          {driver?.first_name?.charAt(0)}{driver?.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">
                          {driver?.first_name} {driver?.last_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {format(new Date(assignment.start_date), 'dd MMM yyyy', { locale: fr })}
                          </span>
                          {assignment.end_date && (
                            <>
                              <span>→</span>
                              <span>
                                {format(new Date(assignment.end_date), 'dd MMM yyyy', { locale: fr })}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>{duration} jours</span>
                        </div>
                        {assignment.notes && (
                          <p className="text-xs text-slate-600 mt-1">{assignment.notes}</p>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <Badge className="bg-green-100 text-green-700">En cours</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">Aucun historique</p>
          )}
        </CardContent>
      </Card>

      {/* Assign Modal */}
      <FormModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        title="Affecter un chauffeur"
        onSubmit={handleAssign}
        submitLabel="Affecter"
        isSubmitting={assignMutation.isPending}
      >
        <div className="space-y-4">
          <FormField
            label="Chauffeur"
            name="driver_id"
            type="select"
            value={formData.driver_id || ''}
            onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
            options={[
              { value: '', label: 'Sélectionner...' },
              ...drivers
                .filter(d => d.status === 'active')
                .map(d => ({ value: d.id, label: `${d.first_name} ${d.last_name}` }))
            ]}
            required
          />
          <FormField
            label="Date de début"
            name="start_date"
            type="date"
            value={formData.start_date || new Date().toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </FormModal>
    </div>
  );
}