import apiClient, { ApiResponse } from '../client';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vin?: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SUSPENDED';
  bankId: string;
  gieId?: string;
  guaranteeFundId?: string;
  currentDriverId?: string;
  creditAmount: number;
  creditRemaining: number;
  dailyPaymentAmount: number;
  creditStartDate?: string;
  creditDurationMonths?: number;
  lastGpsLat?: number;
  lastGpsLng?: number;
  lastGpsUpdate?: string;
  bank?: any;
  currentDriver?: any;
  guaranteeFund?: any;
  gie?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDto {
  registrationNumber: string;
  vin?: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  status?: string;
  bankId: string;
  gieId?: string;
  guaranteeFundId?: string;
  creditAmount: number;
  creditRemaining?: number;
  dailyPaymentAmount: number;
  creditStartDate?: string;
  creditDurationMonths?: number;
  interestRate?: number;
  creditHolderType?: 'DRIVER' | 'GIE';
  creditHolderDriverId?: string;
  creditHolderGieId?: string;
}

export interface VehicleFilters {
  skip?: number;
  take?: number;
  status?: string;
  bankId?: string;
  gieId?: string;
  search?: string;
}

export const vehiclesService = {
  // Liste des véhicules
  async list(filters?: VehicleFilters): Promise<ApiResponse<Vehicle[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/vehicles?${params.toString()}`);
  },

  // Récupérer un véhicule
  async get(id: string): Promise<ApiResponse<Vehicle>> {
    return apiClient.get(`/vehicles/${id}`);
  },

  // Créer un véhicule
  async create(data: CreateVehicleDto): Promise<ApiResponse<Vehicle>> {
    return apiClient.post('/vehicles', data);
  },

  // Modifier un véhicule
  async update(id: string, data: Partial<CreateVehicleDto>): Promise<ApiResponse<Vehicle>> {
    return apiClient.patch(`/vehicles/${id}`, data);
  },

  // Supprimer un véhicule
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/vehicles/${id}`);
  },

  // Statistiques des véhicules
  async getStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/vehicles/stats');
  },

  // Résumé financier d'un véhicule
  async getFinancialSummary(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/vehicles/${id}/financial-summary`);
  },

  // Mettre à jour la position GPS
  async updateGpsLocation(id: string, data: {
    latitude: number;
    longitude: number;
    signalQuality?: string;
    batteryLevel?: number;
  }): Promise<ApiResponse<Vehicle>> {
    return apiClient.patch(`/vehicles/${id}/gps`, data);
  },

  // Historique de maintenance
  async getMaintenanceHistory(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/vehicles/${id}/maintenance-history`);
  },

  // Historique des garanties
  async getGuaranteeHistory(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/vehicles/${id}/guarantee-history`);
  },

  // Calculer le TCO (Total Cost of Ownership)
  async calculateTCO(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/vehicles/${id}/tco`);
  },
};

export default vehiclesService;
