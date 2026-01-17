import apiClient, { ApiResponse } from '../client';

export interface GuaranteeFund {
  id: string;
  name: string;
  totalAmount: number;
  availableAmount: number;
  managerName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  coverageRate?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuaranteeFundDto {
  name: string;
  totalAmount?: number;
  availableAmount?: number;
  managerName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  coverageRate?: number;
  status?: string;
}

export interface GuaranteeFundFilters {
  skip?: number;
  take?: number;
  status?: string;
  search?: string;
}

export const guaranteeFundsService = {
  // Liste des fonds de garantie
  async list(filters?: GuaranteeFundFilters): Promise<ApiResponse<GuaranteeFund[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/guarantee-funds?${params.toString()}`);
  },

  // Récupérer un fonds de garantie
  async get(id: string): Promise<ApiResponse<GuaranteeFund>> {
    return apiClient.get(`/guarantee-funds/${id}`);
  },

  // Créer un fonds de garantie
  async create(data: CreateGuaranteeFundDto): Promise<ApiResponse<GuaranteeFund>> {
    return apiClient.post('/guarantee-funds', data);
  },

  // Modifier un fonds de garantie
  async update(id: string, data: Partial<CreateGuaranteeFundDto>): Promise<ApiResponse<GuaranteeFund>> {
    return apiClient.patch(`/guarantee-funds/${id}`, data);
  },

  // Supprimer un fonds de garantie
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/guarantee-funds/${id}`);
  },
};

export default guaranteeFundsService;
