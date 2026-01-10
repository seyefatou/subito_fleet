import apiClient, { ApiResponse } from '../client';

export interface Insurer {
  id: string;
  name: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateInsurerDto {
  name: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  status?: string;
}

export interface InsurerFilters {
  skip?: number;
  take?: number;
  status?: string;
  search?: string;
}

export const insurersService = {
  // Liste des assureurs
  async list(filters?: InsurerFilters): Promise<ApiResponse<Insurer[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/insurers?${params.toString()}`);
  },

  // Récupérer un assureur
  async get(id: string): Promise<ApiResponse<Insurer>> {
    return apiClient.get(`/insurers/${id}`);
  },

  // Créer un assureur
  async create(data: CreateInsurerDto): Promise<ApiResponse<Insurer>> {
    return apiClient.post('/insurers', data);
  },

  // Modifier un assureur
  async update(id: string, data: Partial<CreateInsurerDto>): Promise<ApiResponse<Insurer>> {
    return apiClient.patch(`/insurers/${id}`, data);
  },

  // Supprimer un assureur
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/insurers/${id}`);
  },
};

export default insurersService;
