import apiClient, { ApiResponse } from '../client';

export interface Bank {
  id: string;
  name: string;
  code?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  mobileMoneyProvider?: 'ORANGE_MONEY' | 'WAVE' | 'FREE_MONEY' | 'OTHER';
  mobileMoneyAccount?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankDto {
  name: string;
  code?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  mobileMoneyProvider?: string;
  mobileMoneyAccount?: string;
  status?: string;
}

export interface BankFilters {
  skip?: number;
  take?: number;
  status?: string;
  search?: string;
}

export const banksService = {
  // Liste des banques
  async list(filters?: BankFilters): Promise<ApiResponse<Bank[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/banks?${params.toString()}`);
  },

  // Récupérer une banque
  async get(id: string): Promise<ApiResponse<Bank>> {
    return apiClient.get(`/banks/${id}`);
  },

  // Créer une banque
  async create(data: CreateBankDto): Promise<ApiResponse<Bank>> {
    return apiClient.post('/banks', data);
  },

  // Modifier une banque
  async update(id: string, data: Partial<CreateBankDto>): Promise<ApiResponse<Bank>> {
    return apiClient.patch(`/banks/${id}`, data);
  },

  // Supprimer une banque
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/banks/${id}`);
  },

  // Statistiques d'une banque
  async getStats(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/banks/${id}/stats`);
  },
};

export default banksService;
