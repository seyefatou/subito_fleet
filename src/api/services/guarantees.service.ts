import apiClient, { ApiResponse } from '../client';

export interface Guarantee {
  id: string;
  vehicleId: string;
  bankId: string;
  guaranteeFundId: string;
  guaranteeAmount: number;
  status: 'ACTIVE' | 'CALLED' | 'RELEASED' | 'EXPIRED';
  vehicle?: any;
  bank?: any;
  guaranteeFund?: any;
  guaranteeCalls?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuaranteeDto {
  vehicleId: string;
  bankId: string;
  guaranteeFundId: string;
  guaranteeAmount: number;
  status?: string;
}

export interface GuaranteeFilters {
  skip?: number;
  take?: number;
  status?: string;
  bankId?: string;
  guaranteeFundId?: string;
  vehicleId?: string;
}

export const guaranteesService = {
  // Liste des garanties
  async list(filters?: GuaranteeFilters): Promise<ApiResponse<Guarantee[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/guarantees?${params.toString()}`);
  },

  // Récupérer une garantie
  async get(id: string): Promise<ApiResponse<Guarantee>> {
    return apiClient.get(`/guarantees/${id}`);
  },

  // Créer une garantie
  async create(data: CreateGuaranteeDto): Promise<ApiResponse<Guarantee>> {
    return apiClient.post('/guarantees', data);
  },

  // Modifier une garantie
  async update(id: string, data: Partial<CreateGuaranteeDto>): Promise<ApiResponse<Guarantee>> {
    return apiClient.patch(`/guarantees/${id}`, data);
  },

  // Supprimer une garantie
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/guarantees/${id}`);
  },

  // Appeler une garantie
  async call(id: string, data: {
    callAmount: number;
    reason: string;
    callDate?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(`/guarantees/${id}/call`, data);
  },

  // Libérer une garantie
  async release(id: string): Promise<ApiResponse<Guarantee>> {
    return apiClient.post(`/guarantees/${id}/release`);
  },

  // Clôturer une garantie
  async close(id: string): Promise<ApiResponse<Guarantee>> {
    return apiClient.post(`/guarantees/${id}/close`);
  },

  // Historique des appels d'une garantie
  async getCallHistory(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/guarantees/${id}/call-history`);
  },
};

export default guaranteesService;
