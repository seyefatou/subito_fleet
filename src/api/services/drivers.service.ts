import apiClient, { ApiResponse } from '../client';

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  photoUrl?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  licenseFrontUrl?: string;
  licenseBackUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  rating?: number;
  gieId?: string;
  currentVehicleId?: string;
  gie?: any;
  currentVehicle?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverDto {
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  status?: string;
  gieId?: string;
}

export interface DriverFilters {
  skip?: number;
  take?: number;
  status?: string;
  gieId?: string;
  search?: string;
}

export const driversService = {
  // Liste des conducteurs
  async list(filters?: DriverFilters): Promise<ApiResponse<Driver[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/drivers?${params.toString()}`);
  },

  // Récupérer un conducteur
  async get(id: string): Promise<ApiResponse<Driver>> {
    return apiClient.get(`/drivers/${id}`);
  },

  // Créer un conducteur
  async create(data: CreateDriverDto): Promise<ApiResponse<Driver>> {
    return apiClient.post('/drivers', data);
  },

  // Modifier un conducteur
  async update(id: string, data: Partial<CreateDriverDto>): Promise<ApiResponse<Driver>> {
    return apiClient.patch(`/drivers/${id}`, data);
  },

  // Supprimer un conducteur
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/drivers/${id}`);
  },

  // Assigner un véhicule
  async assignVehicle(driverId: string, vehicleId: string): Promise<ApiResponse<Driver>> {
    return apiClient.post(`/drivers/${driverId}/assign-vehicle/${vehicleId}`);
  },

  // Désassigner un véhicule
  async unassignVehicle(driverId: string): Promise<ApiResponse<Driver>> {
    return apiClient.post(`/drivers/${driverId}/unassign-vehicle`);
  },

  // Historique des paiements
  async getPaymentHistory(id: string, params?: { skip?: number; take?: number }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    return apiClient.get(`/drivers/${id}/payments?${queryParams.toString()}`);
  },

  // Performance du conducteur
  async getPerformance(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/drivers/${id}/performance`);
  },

  // Vérifier les documents expirant
  async checkExpiringDocuments(daysAhead?: number): Promise<ApiResponse<Driver[]>> {
    const params = daysAhead ? `?daysAhead=${daysAhead}` : '';
    return apiClient.get(`/drivers/expiring-documents${params}`);
  },

  // Uploader un document
  async uploadDocument(driverId: string, documentType: string, file: File): Promise<ApiResponse<{ url: string; driver: Driver }>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/drivers/${driverId}/upload/${documentType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Supprimer un document
  async deleteDocument(driverId: string, documentType: string): Promise<ApiResponse<Driver>> {
    return apiClient.delete(`/drivers/${driverId}/document/${documentType}`);
  },
};

export default driversService;
