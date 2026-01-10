import apiClient, { ApiResponse } from '../client';

export interface Maintenance {
  id: string;
  vehicleId: string;
  maintenanceDate: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
  description: string;
  cost: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  mileage?: number;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  serviceProvider?: string;
  notes?: string;
  vehicle?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceDto {
  vehicleId: string;
  maintenanceDate: string;
  type: string;
  description: string;
  cost: number;
  status?: string;
  mileage?: number;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  serviceProvider?: string;
  notes?: string;
}

export interface MaintenanceFilters {
  skip?: number;
  take?: number;
  vehicleId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const maintenancesService = {
  // Liste des maintenances
  async list(filters?: MaintenanceFilters): Promise<ApiResponse<Maintenance[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/maintenances?${params.toString()}`);
  },

  // Récupérer une maintenance
  async get(id: string): Promise<ApiResponse<Maintenance>> {
    return apiClient.get(`/maintenances/${id}`);
  },

  // Créer une maintenance
  async create(data: CreateMaintenanceDto): Promise<ApiResponse<Maintenance>> {
    return apiClient.post('/maintenances', data);
  },

  // Modifier une maintenance
  async update(id: string, data: Partial<CreateMaintenanceDto>): Promise<ApiResponse<Maintenance>> {
    return apiClient.patch(`/maintenances/${id}`, data);
  },

  // Supprimer une maintenance
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/maintenances/${id}`);
  },

  // Maintenances à venir
  async getUpcoming(days?: number): Promise<ApiResponse<Maintenance[]>> {
    const params = days ? `?days=${days}` : '';
    return apiClient.get(`/maintenances/upcoming${params}`);
  },

  // Alertes de maintenance prédictive
  async getPredictiveAlerts(vehicleId?: string): Promise<ApiResponse<any[]>> {
    const params = vehicleId ? `?vehicleId=${vehicleId}` : '';
    return apiClient.get(`/maintenances/predictive${params}`);
  },

  // Générer des alertes de maintenance prédictive
  async generatePredictiveAlerts(): Promise<ApiResponse<any>> {
    return apiClient.post('/maintenances/predictive/generate');
  },

  // Résoudre une alerte prédictive
  async resolvePredictiveAlert(id: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/maintenances/predictive/${id}/resolve`);
  },

  // Marquer comme fausse alerte
  async markAsFalseAlarm(id: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/maintenances/predictive/${id}/false-alarm`);
  },

  // Configuration de maintenance d'un véhicule
  async getConfig(vehicleId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/maintenances/config/${vehicleId}`);
  },

  // Mettre à jour la configuration de maintenance
  async updateConfig(vehicleId: string, config: any): Promise<ApiResponse<any>> {
    return apiClient.patch(`/maintenances/config/${vehicleId}`, config);
  },
};

export default maintenancesService;
