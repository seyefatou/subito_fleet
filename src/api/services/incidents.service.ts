import apiClient, { ApiResponse } from '../client';

export interface Incident {
  id: string;
  vehicleId: string;
  driverId?: string;
  incidentDate: string;
  type: 'ACCIDENT' | 'BREAKDOWN' | 'THEFT' | 'VANDALISM' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location?: string;
  status: 'REPORTED' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  estimatedCost?: number;
  actualCost?: number;
  insuranceClaim?: boolean;
  claimNumber?: string;
  notes?: string;
  vehicle?: any;
  driver?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentDto {
  vehicleId: string;
  driverId?: string;
  incidentDate: string;
  type: string;
  severity: string;
  description: string;
  location?: string;
  status?: string;
  estimatedCost?: number;
  actualCost?: number;
  insuranceClaim?: boolean;
  claimNumber?: string;
  notes?: string;
}

export interface IncidentFilters {
  skip?: number;
  take?: number;
  vehicleId?: string;
  driverId?: string;
  type?: string;
  severity?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const incidentsService = {
  // Liste des incidents
  async list(filters?: IncidentFilters): Promise<ApiResponse<Incident[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/incidents?${params.toString()}`);
  },

  // Récupérer un incident
  async get(id: string): Promise<ApiResponse<Incident>> {
    return apiClient.get(`/incidents/${id}`);
  },

  // Créer un incident
  async create(data: CreateIncidentDto): Promise<ApiResponse<Incident>> {
    return apiClient.post('/incidents', data);
  },

  // Modifier un incident
  async update(id: string, data: Partial<CreateIncidentDto>): Promise<ApiResponse<Incident>> {
    return apiClient.patch(`/incidents/${id}`, data);
  },

  // Supprimer un incident
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/incidents/${id}`);
  },

  // Statistiques des incidents
  async getStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/incidents/stats');
  },

  // Résoudre un incident
  async resolve(id: string, notes?: string): Promise<ApiResponse<Incident>> {
    return apiClient.post(`/incidents/${id}/resolve`, { notes });
  },

  // Escalader un incident
  async escalate(id: string, notes?: string): Promise<ApiResponse<Incident>> {
    return apiClient.post(`/incidents/${id}/escalate`, { notes });
  },
};

export default incidentsService;
